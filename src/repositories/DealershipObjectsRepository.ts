import * as firebase from 'firebase';
import FirebaseRepository, { IKeyedResult, IRecordWatch } from '../lib/firebase/FirebaseRepository';

class DealershipObjectsRepository<T = any> {

    protected firebaseRepo = new FirebaseRepository();
    protected collection: string;
    protected keyName: string;

    constructor(collection: string, keyName: string = '') {
        this.collection = collection;
        this.keyName = keyName;
    }

    public ref(dealershipId: string) {
        return this.firebaseRepo.ref(this.formatNode(dealershipId));
    }

    public insert(dealershipId: string, record: any, key: string = ''): Promise<T> {
        return this.firebaseRepo.addRecord(this.formatNode(dealershipId), record, key, this.keyName);
    }

    public update(dealershipId: string, key: string, props: any): Promise<T> {
        return this.firebaseRepo.updateRecord(this.formatNode(dealershipId), key, props);
    }

    public updateAll(dealershipId: string, props: any): Promise<T> {
        return this.firebaseRepo.updateRecords(this.formatNode(dealershipId), props);
    }

    public getAll(dealershipId: string): Promise<T[]> {
        return this.firebaseRepo.getRecords(this.formatNode(dealershipId));
    }

    public getAllRaw(dealershipId: string): Promise<IKeyedResult<T>> {
        return this.firebaseRepo.getRecordsRaw(this.formatNode(dealershipId));
    }

    public get(dealershipId: string, key: string): Promise<T> {
        return this.firebaseRepo.getRecord(this.formatNode(dealershipId), key);
    }

    public getAllByChildValue(
        dealershipId: string,
        child: string,
        value: any): Promise<T[]> {
        return this.firebaseRepo.getRecordsByChildValue(this.formatNode(dealershipId), child, value);
    }

    public getAllByChildValueRaw(
        dealershipId: string,
        child: string,
        value: any): Promise<IKeyedResult> {
        return this.firebaseRepo.getRecordsByChildValueRaw(this.formatNode(dealershipId), child, value);
    }

    public watchAll(dealershipId: string, callback: (records: T[]) => void): IRecordWatch {
        return this.firebaseRepo.watchRecords(this.formatNode(dealershipId), callback);
    }

    public watch(
        dealershipId: string,
        key: string,
        callback: (record: T) => void,
        refModifier?: (ref: firebase.database.Reference) =>
            firebase.database.Reference | firebase.database.Query,
        resModifier?: (snapshot: firebase.database.DataSnapshot) => any): IRecordWatch {
        return this.firebaseRepo.watchRecord(this.formatNode(dealershipId), key, callback, refModifier, resModifier);
    }

    public watchAllByChildValue(
        dealershipId: string,
        child: string,
        value: any,
        callback: (records: T[]) => void): IRecordWatch {
        return this.firebaseRepo.watchRecordsByChildValue(this.formatNode(dealershipId), child, value, callback);
    }

    public delete(dealershipId: string, key: string): Promise<void> {
        return this.firebaseRepo.deleteRecord(this.formatNode(dealershipId), key);
    }

    protected formatNode(dealershipId: string) {
        return `dealershipObjects/${dealershipId}/${this.collection}`;
    }

}

export default DealershipObjectsRepository;
