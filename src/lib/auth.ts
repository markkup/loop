import appkit from './appkit';
import firebase from './firebase';

export class Auth {

    public async signIn(uid: string): Promise<void> {
        try {
            // get jwt
            const data = await firebase.fetchCloudFunction(`createToken?uid=${uid}`);
            const token = data.token;

            // auth
            await firebase.auth.signInWithCustomToken(token);
        } catch (e) {
            appkit.logError(e, 'signin');
            throw e;
        }
    }

    public signOut() {
        return firebase.auth.signOut();
    }
}

export default new Auth();
