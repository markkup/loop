import * as firebase from 'firebase';

import { IFirebase, IFirebaseConfig } from '../../interfaces';
import appkit from '../appkit';

class Firebase implements IFirebase {

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

export default Firebase;
