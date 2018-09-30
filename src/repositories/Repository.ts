import * as firebase from 'firebase';
import FirebaseRepository, { IKeyedResult, IRecordWatch } from '../lib/firebase/FirebaseRepository';

class Repository<T = any> {

    protected firebaseRepo = new FirebaseRepository();
    protected collection: string;
    protected keyName: string;

    constructor(collection: string, keyName: string = '') {
        this.collection = collection;
        this.keyName = keyName;
    }

    public ref(): any {
        return this.firebaseRepo.ref(this.formatNode());
    }

    public insert(record: any, key: string = ''): Promise<T> {
        return this.firebaseRepo.addRecord(this.formatNode(), record, key, this.keyName);
    }

    public update(key: string, props: any): Promise<T> {
        return this.firebaseRepo.updateRecord(this.formatNode(), key, props);
    }

    public updateAll(props: any): Promise<T> {
        return this.firebaseRepo.updateRecords(this.formatNode(), props);
    }

    public async updateImage(
        key: string,
        imageType: string,
        imageBlob: any): Promise<string | null> {
        return this.firebaseRepo.updateRecordImage(this.formatNode(), key, imageType, imageBlob);
    }

    public getAll(): Promise<T[]> {
        return this.firebaseRepo.getRecords(this.formatNode());
    }

    public getAllRaw(): Promise<IKeyedResult> {
        return this.firebaseRepo.getRecordsRaw(this.formatNode());
    }

    public get(key: string): Promise<T> {
        return this.firebaseRepo.getRecord(this.formatNode(), key);
    }

    public getAllByChildValue(
        child: string,
        value: any): Promise<T[]> {
        return this.firebaseRepo.getRecordsByChildValue(this.formatNode(), child, value);
    }

    public getAllByChildValueRaw(
        child: string,
        value: any): Promise<IKeyedResult<T>> {
        return this.firebaseRepo.getRecordsByChildValueRaw(this.formatNode(), child, value);
    }

    public watchAll(
        callback: (records: T[]) => void,
        refModifier?: (ref: firebase.database.Reference) =>
            firebase.database.Reference | firebase.database.Query,
        resModifier?: (snapshot: firebase.database.DataSnapshot) => any): IRecordWatch {
        return this.firebaseRepo.watchRecords(this.formatNode(), callback, refModifier, resModifier);
    }

    public watch(
        key: string,
        callback: (record: T) => void,
        refModifier?: (ref: firebase.database.Reference) =>
            firebase.database.Reference | firebase.database.Query,
        resModifier?: (snapshot: firebase.database.DataSnapshot) => any): IRecordWatch {
        return this.firebaseRepo.watchRecord(this.formatNode(), key, callback, refModifier, resModifier);
    }

    public watchAllByChildValue(
        child: string,
        value: any,
        callback: (records: T[]) => void): IRecordWatch {
        return this.firebaseRepo.watchRecordsByChildValue(this.formatNode(), child, value, callback);
    }

    public delete(key: string): Promise<void> {
        return this.firebaseRepo.deleteRecord(this.formatNode(), key);
    }

    protected formatNode() {
        return `${this.collection}`;
    }
}

export default Repository;
