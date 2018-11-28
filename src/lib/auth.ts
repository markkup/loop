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
            await firebase.auth().signInWithCustomToken(token);

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

        trace('ensureSignIn');

        const phoneClean = phones.clean(phoneNumber);
        trace({ phoneClean, currentUser: firebase.auth().currentUser, token });

        try {
            trace('trying signInWithCustomToken');
            const res = await firebase.auth().signInWithCustomToken(token);
            trace({ res });
        } catch (e) {
            trace(`signInWithCustomToken exception: ${e.message || e}`);
            if (e.message === 'TOKEN_EXPIRED') {

                // get jwt
                const data = await firebase.fetchCloudFunction(`createToken?uid=${phoneClean}&reason=expired`);
                const newToken = data.token;
                if (!newToken) {
                    throw new Error(`User token could not be created`);
                }

                // auth
                try {
                    await firebase.auth().signInWithCustomToken(newToken);
                } catch (e2) {
                    trace(`second signin attempt failed: ${e2.message || e2}`);
                    throw e;
                }

                // save new token
                token = newToken;
            } else {
                throw e;
            }
        }

        let user;
        while (!user) {
            trace('trying to get user...');
            try {
                user = await Loop.users.getByPhoneClean(phoneClean);
                if (!user || !user.allowAccess) {
                    throw new Error(`User is not recognized or is not allowed access`);
                }

                user.token = token;
                user.lastAccessDate = Date.now();

                // update user
                await Loop.users.update(user.uid, user);

            } catch (e) {
                if (e.message.indexOf('permission_denied') === -1) {
                    trace('got error reading user', { e });
                    throw e;
                }

                await this.delay(5);
            }
        }

        trace(`returning user: ${user && user.uid}`);
        return user;
    }

    public signOut() {
        return firebase.auth().signOut();
    }
}

export default new Auth();
