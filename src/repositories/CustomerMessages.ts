import appkit from '../lib/appkit';
import { IRecordWatch } from '../lib/firebase/FirebaseRepository';
import DealershipObjectsRepository from './DealershipObjectsRepository';

class CustomerMessages extends DealershipObjectsRepository {

    constructor() {
        super('customerMessages');
    }

    public async add(
        dealershipId: string,
        cid: string,
        uid: string = '',
        text: string,
        mediaUrl: string = '',
        meta: any = null): Promise<any> {
        try {
            const ref = this.ref(dealershipId).child(cid);
            const newRef = ref.push();
            if (newRef) {
                const key = newRef.key as string;
                const updates = {
                    text,
                    mediaUrl,
                    meta,
                    timestamp: Date.now(),
                    uid,
                };
                await ref.child(key).update(updates);
                return updates;
            }
            return null;
        } catch (e) {
            appkit.logError(e);
            throw e;
        }
    }

    public watchAllByCustomer(dealershipId: string, cid: string, callback: (records: any[]) => void): IRecordWatch {
        return this.watch(dealershipId, cid, callback, (ref) => {
            return ref.orderByChild('timestamp');
        }, (snapshot) => {
            const messages: any[] = [];
            snapshot.forEach(msg => {
                messages.push(msg.val());
                return false;
            });
            return messages;
        });
    }
}

export default CustomerMessages;
