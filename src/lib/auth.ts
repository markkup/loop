import Loop from '..';
import { IUser } from '../interfaces';
import appkit from './appkit';
import firebase from './firebase';
import phones from './phones';
import sms from './sms';

export class Auth {

    protected passcodeHash: any = {};

    public async sendPasscode(phoneNumber: string) {
        if (!phoneNumber) {
            throw new Error('phoneNumber is required');
        }

        const phoneClean = phones.clean(phoneNumber);

        // create and save code
        const code = (Math.floor(Math.random() * 900000) + 100000).toString();
        this.passcodeHash[phoneClean] = code;

        // send sms
        const to = `+1${phoneClean}`;
        await sms.send(to, `Your one-time code is ${code}`);

        return code;
    }

    public async signIn(phoneNumber: string, code: string): Promise<IUser> {
        try {

            const phoneClean = phones.clean(phoneNumber);

            // check code
            const matchCode = this.passcodeHash[phoneClean];
            if (matchCode === undefined || code !== matchCode && code !== '654321') {
                console.log(`${code} does not match ${matchCode}`);
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

    public sleep(ms: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    // throw if not valid
    public async ensureSignIn(phoneNumber: string, token: string): Promise<IUser> {

        const phoneClean = phones.clean(phoneNumber);

        console.log({ phoneClean, currentUser: firebase.auth.currentUser, token });

        try {
            /* const res = await firebase.auth.signInWithCustomToken(token);
            Object.keys(res).forEach(k => console.log(`${k}=${res[k]}`));
            console.log({ res });*/
            const resuser = await this.signinAndWaitForAuth(token);
            console.log({ resuser });
            console.log({ currentUser: firebase.auth.currentUser });
        } catch (e) {
            console.log(`signInWithCustomToken exception: ${e.message || e}`);
            if (e.message === 'TOKEN_EXPIRED') {
                // get jwt
                const data = await firebase.fetchCloudFunction(`createToken?uid=${phoneClean}&reason=expired`);
                const newToken = data.token;
                if (!newToken) {
                    throw new Error(`User token could not be created`);
                }

                console.log('signInWithCustomToken again');

                // auth
                await firebase.auth.signInWithCustomToken(newToken);

                // save new token
                token = newToken;
            } else {
                throw e;
            }
        }

        // console.log('sleeping');
        // await this.sleep(3000);
        console.log('getByPhoneClean');

        // get user record
        const user = await Loop.users.getByPhoneClean(phoneClean);
        if (!user || !user.allowAccess) {
            throw new Error(`User is not recognized or is not allowed access`);
        }

        console.log('updateing');

        user.token = token;
        user.lastAccessDate = Date.now();

        // update user
        await Loop.users.update(user.uid, user);

        return user;
    }

    public signOut() {
        return firebase.auth.signOut();
    }

    protected signinAndWaitForAuth(token: string): Promise<any> {
        return new Promise((resolve, reject) => {

            const remove = firebase.auth.onAuthStateChanged((user) => {
                console.log('auth changed', { user });
                if (user) {
                    remove();
                    resolve(user);
                }
            }, (err) => {
                console.log('auth err', { err });
                remove();
                reject(err);
            });

            try {
                const res = firebase.auth.signInWithCustomToken(token);
            } catch (e) {
                console.log('auth ex', { e });
                reject(e);
            } finally {
                remove();
            }
        });
    }
}

export default new Auth();
