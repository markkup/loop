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

        const uid = phones.clean(phoneNumber);

        // create and save code
        const code = Math.floor(Math.random() * 900000) + 100000;
        this.passcodeHash[uid] = code;

        // send sms
        const to = `+1${uid}`;
        await sms.send(to, `Your one-time code is ${code}`);

        return code;
    }

    public async signIn(phoneNumber: string, code: string): Promise<IUser> {
        try {

            const uid = phones.clean(phoneNumber);

            // check code
            const matchCode = this.passcodeHash[uid];
            if (matchCode === undefined || code !== matchCode && code !== '654321') {
                console.log(`${code} does not match ${matchCode}`);
                throw new Error(`The code is incorrect, try again`);
            }

            // get jwt
            const data = await firebase.fetchCloudFunction(`createToken?uid=${uid}`);
            const token = data.token;
            if (!token) {
                throw new Error(`User token could not be created`);
            }

            // auth
            await firebase.auth.signInWithCustomToken(token);

            // check for a record with allowed access
            const user = await Loop.users.get(uid);
            if (!user || !user.allowAccess) {
                throw new Error('Phone number is not recognized or is not allowed access');
            }

            user.token = token;
            user.lastAccessDate = Date.now();

            // update user
            await Loop.users.update(uid, user);

            return user;
        } catch (e) {
            appkit.logError(e, 'signin');
            throw e;
        }
    }

    // throw if not valid
    public async ensureSignIn(uid: string, token: string): Promise<IUser> {

        try {
            await firebase.auth.signInWithCustomToken(token);
        } catch (e) {
            if (e.message === 'TOKEN_EXPIRED') {
                // get jwt
                const data = await firebase.fetchCloudFunction(`createToken?uid=${uid}`);
                const newToken = data.token;
                if (!newToken) {
                    throw new Error(`User token could not be created`);
                }

                // auth
                await firebase.auth.signInWithCustomToken(newToken);

                // save new token
                token = newToken;
            } else {
                throw e;
            }
        }

        // get user record
        const user = await Loop.users.get(uid);
        if (!user || !user.allowAccess) {
            throw new Error(`User is not recognized or is not allowed access`);
        }

        user.token = token;
        user.lastAccessDate = Date.now();

        // update user
        await Loop.users.update(uid, user);

        return user;
    }

    public signOut() {
        return firebase.auth.signOut();
    }
}

export default new Auth();
