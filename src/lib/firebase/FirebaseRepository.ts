import * as firebase from 'firebase';
import appkit from '../appkit';

export interface IRecordWatch {
    remove: () => void;
    listener: any;
}

export interface IKeyedResult<T = any> {
    [key: string]: T;
}

class FirebaseRepository {

    public get db() {
        return firebase.database();
    }

    public ref(collection: string) {
        return this.db.ref(collection);
    }

    public async addRecord(
        collection: string,
        record: any = {},
        key: string = '',
        keyName: string = ''): Promise<any> {
        const ref = this.ref(collection);

        if (key === '') {
            const newRef = ref.push();
            key = newRef.key as string;
        }

        if (keyName !== '') {
            record[keyName] = key;
        }

        await ref.child(key).update(record);

        return record;
    }

    public async updateRecord(collection: string, key: string, props: any) {
        const record = await this.getRecord(collection, key);
        if (!record) {
            throw new Error(`Cannot find record to update: ${key}`);
        }

        const mergedRecord = Object.assign({}, record, props);

        await this.ref(collection).child(key).update(mergedRecord);

        return mergedRecord;
    }

    public updateRecords(collection: string, props: any) {
        return this.ref(collection).update(props);
    }

    public async updateRecordImage(
        collection: string,
        key: string,
        imageType: string,
        imageBlob: any): Promise<string | null> {

        const db = firebase.database();
        const store = firebase.storage();

        // get an image ref
        const imageRef = store.ref(`${imageType}/${key}.jpg`);

        // upload blob
        const imageSaved = await imageRef.put(imageBlob);

        return imageSaved.downloadURL;
    }

    public async getRecord(collection: string, key: string): Promise<any> {
        const snapshot = await this.ref(collection).child(key).once('value');
        return snapshot.val();
    }

    public async getRecords(collection: string): Promise<any[]> {
        const snapshot = await this.ref(collection).once('value');
        if (!snapshot) {
            return [];
        }
        const records = snapshot.val();
        if (!records) {
            return [];
        }
        return Object.keys(records).map(key => records[key]);
    }

    public async getRecordsRaw(collection: string): Promise<IKeyedResult> {
        const snapshot = await this.ref(collection).once('value');
        if (!snapshot) {
            return {};
        }
        const records = snapshot.val();
        if (!records) {
            return {};
        }
        return records;
    }

    public async getRecordsByChildValue(
        collection: string,
        child: string,
        value: any): Promise<any[]> {
        const snapshot = await this.ref(collection).orderByChild(child).equalTo(value).once('value');
        if (!snapshot) {
            return [];
        }
        const records = snapshot.val();
        if (!records) {
            return [];
        }
        return Object.keys(records).map(key => records[key]);
    }

    public async getRecordsByChildValueRaw(
        collection: string,
        child: string,
        value: any): Promise<IKeyedResult> {
        const snapshot = await this.ref(collection).orderByChild(child).equalTo(value).once('value');
        if (!snapshot) {
            return {};
        }
        const records = snapshot.val();
        if (!records) {
            return {};
        }
        return records;
    }

    public async deleteRecord(collection: string, key: string): Promise<void> {
        await this.ref(collection).child(key).remove();
    }

    public watchRecord(
        collection: string,
        key: string,
        callback: (data: any) => void,
        refModifier?: (ref: firebase.database.Reference) =>
            firebase.database.Reference | firebase.database.Query,
        resModifier?: (snapshot: firebase.database.DataSnapshot) => any): IRecordWatch {

        // refModifier allows the caller to modify the ref used for the query
        let modifyRef: (ref: firebase.database.Reference) => firebase.database.Reference | firebase.database.Query;
        if (!refModifier) {
            modifyRef = (r: firebase.database.Reference) => r;
        } else {
            modifyRef = refModifier;
        }

        // resModifier allos the caller to modify the resulting snapshot
        let modifyRes: (snapshot: firebase.database.DataSnapshot) => any;
        if (!resModifier) {
            modifyRes = (s: firebase.database.DataSnapshot) => s.val();
        } else {
            modifyRes = resModifier;
        }

        // setup on watcher
        const ref = modifyRef(this.ref(collection).child(key));
        const result = {
            listener: ref.on('value', snapshot => {
                if (!snapshot) {
                    throw new Error(`Cannot watch record`);
                }
                const data = modifyRes(snapshot);
                callback(data);
            }),
            remove: () => {
                ref.off('value', result.listener);
            },
        } as IRecordWatch;
        return result;
    }

    public watchRecords(
        collection: string,
        callback: (data: any[]) => void,
        refModifier?: (ref: firebase.database.Reference) =>
            firebase.database.Reference | firebase.database.Query,
        resModifier?: (snapshot: firebase.database.DataSnapshot) => any): IRecordWatch {

        // refModifier allows the caller to modify the ref used for the query
        let modifyRef: (ref: firebase.database.Reference) => firebase.database.Reference | firebase.database.Query;
        if (!refModifier) {
            modifyRef = (r: firebase.database.Reference) => r;
        } else {
            modifyRef = refModifier;
        }

        // resModifier allos the caller to modify the resulting snapshot
        let modifyRes: (snapshot: firebase.database.DataSnapshot) => any;
        if (!resModifier) {
            modifyRes = (s: firebase.database.DataSnapshot) => {
                const data = s.val();
                const items: any[] = [];
                s.forEach(item => {
                    items.push(item.val());
                    return false;
                });
                return items;
            };
        } else {
            modifyRes = resModifier;
        }

        const ref = modifyRef(this.ref(collection));
        const result = {
            listener: ref.on('value', snapshot => {
                if (!snapshot) {
                    throw new Error(`Cannot watch records`);
                }
                const data = modifyRes(snapshot);
                callback(data);
            }),
            remove: () => {
                ref.off('value', result.listener);
            },
        } as IRecordWatch;
        return result;
    }

    public watchRecordsByChildValue(
        collection: string,
        child: string,
        value: string,
        callback: (data: any[]) => void): IRecordWatch {
        const result = {
            listener: this.ref(collection).orderByChild(child).equalTo(value).on('value', snapshot => {
                if (!snapshot) {
                    throw new Error(`Cannot watch records`);
                }
                const records = snapshot.val();
                if (!records) {
                    callback([]);
                } else {
                    callback(Object.keys(records).map(key => records[key]));
                }
            }),
            remove: () => {
                const ref = this.ref(collection).orderByChild(child).equalTo(value);
                ref.off('value', result.listener);
            },
        } as IRecordWatch;
        return result;
    }
}

export default FirebaseRepository;
