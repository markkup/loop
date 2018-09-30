import appkit from '../lib/appkit';
import FirebaseRepository, { IRecordWatch } from '../lib/firebase/FirebaseRepository';

class UserNotifications {

    protected firebaseRepo = new FirebaseRepository();

    public watchAllByUser(uid: string, callback: (records: any[]) => void): IRecordWatch {
        return this.firebaseRepo.watchRecords(this.formatNode(uid), callback, (ref) => {
            return ref.orderByChild('order');
        });
    }

    public delete(uid: string, key: string): Promise<void> {
        return this.firebaseRepo.deleteRecord(this.formatNode(uid), key);
    }

    protected formatNode(uid: string) {
        return `userNotifications/${uid}`;
    }
}

export default UserNotifications;
