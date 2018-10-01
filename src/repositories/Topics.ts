import { IRecordWatch } from '../lib/firebase/FirebaseRepository';
import Repository from './Repository';

class Topics extends Repository {

    constructor() {
        super('topics');
    }

    public watchAllDesc(callback: (records: any[]) => void): IRecordWatch {
        return this.watchAll(callback, (ref) => {
            return ref.orderByChild('order');
        });
    }
}

export default Topics;
