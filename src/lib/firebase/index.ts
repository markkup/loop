import * as firebase from 'firebase';
import appkit from '../appkit';
// import fetch from '../fetch';

export interface IFirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    cloudURL: string;
    bundleId: string;
    adminAuthKey: string;
}

export class Firebase {

    protected config: IFirebaseConfig = {} as IFirebaseConfig;

    public async init(config: IFirebaseConfig) {
        try {
            if (firebase.apps && firebase.apps.length > 0) {
                return;
            }
            this.config = config;
            await firebase.initializeApp(this.config);
        } catch (e) {
            appkit.logError(e, 'Firebase.init');
            throw e;
        }
    }

    public async fetchCloudFunction(pathAndQuery: string): Promise<any> {
        try {
            const response = await fetch(`${this.config.cloudURL}/${pathAndQuery}`);
            const data = await response.json();
            return data;
        } catch (e) {
            appkit.logError(e, 'Firebase.fetchCloudFunction');
            throw e;
        }
    }

    public get auth() {
        return firebase.auth();
    }
}

export default new Firebase();
