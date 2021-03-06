import FirebaseRepository, { IRecordWatch } from '../lib/firebase/FirebaseRepository';

class UserTopics {

    protected firebaseRepo = new FirebaseRepository();

    public watchByUser(uid: string, key: string, callback: (records: any[]) => void): IRecordWatch {
        return this.firebaseRepo.watchRecord(this.formatNode(uid), key, callback);
    }

    public watchAllByUser(uid: string, callback: (records: any[]) => void): IRecordWatch {
        return this.firebaseRepo.watchRecords(this.formatNode(uid), callback, (ref) => {
            return ref.orderByChild('order');
        });
    }

    public getAllByUserWithEvents(uid: string, active: boolean): Promise<any> {
        return this.firebaseRepo.getRecordsByChildValue(this.formatNode(uid), 'event/active', active);
    }

    public watchAllByUserWithEvents(uid: string, active: boolean, callback: (records: any[]) => void): IRecordWatch {
        return this.firebaseRepo.watchRecordsByChildValue(this.formatNode(uid), 'event/active', active, callback);
    }

    public update(uid: string, key: string, props: any): Promise<any> {
        return this.firebaseRepo.updateRecord(this.formatNode(uid), key, props);
    }

    public delete(uid: string, key: string): Promise<void> {
        return this.firebaseRepo.deleteRecord(this.formatNode(uid), key);
    }

    protected formatNode(uid: string) {
        return `userTopics/${uid}`;
    }
}

export default UserTopics;
