import { IFirebaseConfig } from '.';

export default interface IFirebase {
    init(config: IFirebaseConfig): Promise<void>;
    fetchCloudFunction(pathAndQuery: string): Promise<any>;
    auth(): any;
    database(): any;
}
