import * as firebase from 'firebase';

import { IFirebaseConfig, IFirebaseServer } from '../../interfaces';
import appkit from '../appkit';
import FirebaseServerMock from './FirebaseServerMock';

export class FirebaseServer implements IFirebaseServer {

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

    public auth(): any {
        return firebase.auth();
    }

    public database(): any {
        return firebase.database();
    }
}

let exportedInstance: IFirebaseServer;
if (process.env.NODE_ENV === 'test') {
    exportedInstance = new FirebaseServerMock();
} else {
    exportedInstance = new FirebaseServer();
}
export default exportedInstance;
