import * as firebase from 'firebase';

import { IFirebase, IFirebaseConfig } from '../../interfaces';

class FirebaseMock implements IFirebase {

    public cloudFunctionMock: any | null;
    protected config: IFirebaseConfig = {} as IFirebaseConfig;

    public async init(config: IFirebaseConfig): Promise<void> {
        try {
            this.config = config;
            if (firebase.apps && firebase.apps.length > 0) {
                return;
            }
            await firebase.initializeApp({
                databaseURL: `ws://localhost:5000`,
            });
        } catch (e) {
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

export default FirebaseMock;
