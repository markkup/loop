import * as firebase from 'firebase';
import FirebaseServer = require('firebase-server');

import { IFirebaseConfig, IFirebaseServer } from '../../interfaces';
import appkit from '../appkit';

class FirebaseServerMock implements IFirebaseServer {

    public cloudFunctionMock: any | null;
    protected config: IFirebaseConfig = {} as IFirebaseConfig;

    public async init(config: IFirebaseConfig): Promise<void> {
        try {
            if (firebase.apps && firebase.apps.length > 0) {
                return;
            }
            new FirebaseServer(5000, 'localhost', null);
            this.config = config;
            await firebase.initializeApp({
                databaseURL: `ws://localhost:5000`,
            });
        } catch (e) {
            appkit.logError(e, 'Firebase.init');
            throw e;
        }
    }

    public async fetchCloudFunction(pathAndQuery: string): Promise<any> {
        if (this.cloudFunctionMock) {
            return Promise.resolve(this.cloudFunctionMock(pathAndQuery));
        }
        throw new Error('Method not implemented.');
    }

    public auth() {
        throw new Error('Method not implemented.');
    }

    public database() {
        throw new Error('Method not implemented.');
    }

}

export default FirebaseServerMock;
