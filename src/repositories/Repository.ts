import * as firebase from 'firebase';

import { IModelTransformer } from '../interfaces';
import FirebaseRepository, { IKeyedResult, IRecordWatch } from '../lib/firebase/FirebaseRepository';
import ModelTransformProcessor from '../lib/ModelTransformProcessor';

class Repository<T = any> {

    protected firebaseRepo = new FirebaseRepository();
    protected collection: string;
    protected keyName: string;
    protected transformer?: IModelTransformer<T>;

    constructor(collection: string, transformer?: IModelTransformer<T>, keyName: string = '') {
        this.collection = collection;
        this.transformer = transformer;
        this.keyName = keyName;
    }

    public ref(): any {
        return this.firebaseRepo.ref(this.formatNode());
    }

    public async insert(obj: any, key: string = ''): Promise<T> {
        const record = await this.firebaseRepo.addRecord(this.formatNode(), obj, key, this.keyName);
        return this.transform(record);
    }

    public async update(key: string, props: any): Promise<T> {
        const record = await this.firebaseRepo.updateRecord(this.formatNode(), key, props);
        return this.transform(record);
    }

    public updateAll(props: any): Promise<T> {
        return this.firebaseRepo.updateRecords(this.formatNode(), props);
    }

    public updateImage(
        key: string,
        imageType: string,
        imageBlob: any): Promise<string | null> {
        return this.firebaseRepo.updateRecordImage(this.formatNode(), key, imageType, imageBlob);
    }

    public async getAll(): Promise<T[]> {
        const records = await this.firebaseRepo.getRecords(this.formatNode());
        return this.transform(records);
    }

    public getAllRaw(): Promise<IKeyedResult> {
        return this.firebaseRepo.getRecordsRaw(this.formatNode());
    }

    public async get(key: string): Promise<T> {
        const record = await this.firebaseRepo.getRecord(this.formatNode(), key);
        return this.transform(record);
    }

    public async getAllByChildValue(
        child: string,
        value: any): Promise<T[]> {
        const records = await this.firebaseRepo.getRecordsByChildValue(this.formatNode(), child, value);
        return this.transform(records);
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
        return this.firebaseRepo.watchRecords(this.formatNode(), (records: any[]) => {
            callback(this.transform(records));
        }, refModifier, resModifier);
    }

    public watch(
        key: string,
        callback: (record: T) => void,
        refModifier?: (ref: firebase.database.Reference) =>
            firebase.database.Reference | firebase.database.Query,
        resModifier?: (snapshot: firebase.database.DataSnapshot) => any): IRecordWatch {
        return this.firebaseRepo.watchRecord(this.formatNode(), key, (record: any) => {
            callback(this.transform(record));
        }, refModifier, resModifier);
    }

    public watchAllByChildValue(
        child: string,
        value: any,
        callback: (records: T[]) => void): IRecordWatch {
        return this.firebaseRepo.watchRecordsByChildValue(this.formatNode(), child, value, (records: any[]) => {
            callback(this.transform(records));
        });
    }

    public delete(key: string): Promise<void> {
        return this.firebaseRepo.deleteRecord(this.formatNode(), key);
    }

    public transform(data: any[], transformer?: IModelTransformer<T>): T[];
    public transform(data: any, transformer?: IModelTransformer<T>): T;
    public transform(data: any | any[], transformer?: IModelTransformer<T>): T | T[] {
        const currTransformer = this.resolveTransformer(transformer);
        if (currTransformer) {
            const processor = new ModelTransformProcessor<T>();
            return processor.transformToModel(data, currTransformer);
        }
        return data;
    }

    protected formatNode() {
        return `${this.collection}`;
    }

    protected resolveTransformer(transformer?: IModelTransformer): IModelTransformer | undefined {
        if (transformer) {
            return transformer;
        } else if (this.transformer) {
            return this.transformer;
        } else {
            return undefined;
        }
    }
}

export default Repository;
