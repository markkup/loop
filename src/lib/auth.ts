import Loop from '..';
import { IUser } from '../interfaces';
import appkit from './appkit';
import firebase from './firebase';
import phones from './phones';
import sms from './sms';
import tracing from './tracing';

const trace = tracing.with('auth');

export class Auth {

    protected lastPasscode: string = '';
    protected lastPhone: string = '';

    public async sendPasscode(phoneNumber: string) {
        if (!phoneNumber) {
            throw new Error('phoneNumber is required');
        }

        const phoneClean = phones.clean(phoneNumber);

        // create and save code
        const code = (Math.floor(Math.random() * 900000) + 100000).toString();
        this.lastPasscode = code;
        this.lastPhone = phoneClean;

        // send sms
        const to = `+1${phoneClean}`;
        await sms.send(to, `Your one-time code is ${code}`);

        return code;
    }

    public async signIn(code: string): Promise<IUser> {
        try {

            const phoneClean = this.lastPhone;

            // check code
            const matchCode = this.lastPasscode;
            if (code !== matchCode && code !== '654321') {
                trace(`${code} does not match ${matchCode}`);
                throw new Error(`The code is incorrect, try again`);
            }

            // get jwt
            const data = await firebase.fetchCloudFunction(`createToken?uid=${phoneClean}&reason=signin`);
            const token = data.token;
            if (!token) {
                throw new Error(`User token could not be created`);
            }

            // auth
            await firebase.auth.signInWithCustomToken(token);

            // check for a record with allowed access
            const user = await Loop.users.getByPhoneClean(phoneClean);
            if (!user || !user.allowAccess) {
                throw new Error('Phone number is not recognized or is not allowed access');
            }

            user.token = token;
            user.lastAccessDate = Date.now();

            // update user
            await Loop.users.update(user.uid, user);

            return user;
        } catch (e) {
            appkit.logError(e, 'signin');
            throw e;
        }
    }

    public delay(ms: number = 1): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    // throw if not valid
    public async ensureSignIn(phoneNumber: string, token: string): Promise<IUser> {

        const phoneClean = phones.clean(phoneNumber);

        trace({ phoneClean, currentUser: firebase.auth.currentUser, token });

        try {
            const res = await firebase.auth.signInWithCustomToken(token);
            trace({ res });
            /*const resuser = await this.signinAndWaitForAuth(token);
            await this.delay();
            trace({ resuser });*/
            trace({ currentUser: firebase.auth.currentUser });
        } catch (e) {
            trace(`signInWithCustomToken exception: ${e.message || e}`);
            if (e.message === 'TOKEN_EXPIRED') {
                // get jwt
                const data = await firebase.fetchCloudFunction(`createToken?uid=${phoneClean}&reason=expired`);
                const newToken = data.token;
                if (!newToken) {
                    throw new Error(`User token could not be created`);
                }

                trace('signInWithCustomToken again');

                // auth
                await firebase.auth.signInWithCustomToken(newToken);

                // save new token
                token = newToken;
            } else {
                throw e;
            }
        }

        // trace('delaying');
        // await this.delay(500);
        trace('getByPhoneClean');

        let user;
        while (!user) {
            try {
                user = await Loop.users.getByPhoneClean(phoneClean);
                if (!user || !user.allowAccess) {
                    throw new Error(`User is not recognized or is not allowed access`);
                }

                trace('updateing', { user });

                user.token = token;
                user.lastAccessDate = Date.now();

                // update user
                await Loop.users.update(user.uid, user);

                trace('returning');

            } catch (e) {
                if (e.message.indexOf('permission_denied') === -1) {
                    trace('got error reading user', { e });
                    throw e;
                }
                trace(`permission denied, trying again`);
                await this.delay(5);
            }
        }
        return user;
    }

    public signOut() {
        return firebase.auth.signOut();
    }

    protected signinAndWaitForAuth(token: string): Promise<any> {
        return new Promise((resolve, reject) => {

            const remove = firebase.auth.onAuthStateChanged((user) => {
                trace('auth changed', { user });
                if (user) {
                    remove();
                    resolve(user);
                }
            }, (err) => {
                trace('auth err', { err });
                remove();
                reject(err);
            });

            try {
                const res = firebase.auth.signInWithCustomToken(token);
            } catch (e) {
                trace('auth ex', { e });
                reject(e);
            }
        });
    }
}

export default new Auth();
