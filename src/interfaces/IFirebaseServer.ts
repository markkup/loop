import { IFirebaseConfig } from '.';

export default interface IFirebaseServer {
    init(config: IFirebaseConfig): Promise<void>;
    fetchCloudFunction(pathAndQuery: string): Promise<any>;
    auth(): any;
    database(): any;
}
