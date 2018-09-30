import appkit from '../lib/appkit';
import { IRecordWatch } from '../lib/firebase/FirebaseRepository';
import Repository from './Repository';

class Notifications extends Repository {

    constructor() {
        super('notifications');
    }

    public watchAllDesc(callback: (records: any[]) => void): IRecordWatch {
        return this.watchAll(callback, (ref) => {
            return ref.orderByChild('order');
        });
    }
}

export default Notifications;
