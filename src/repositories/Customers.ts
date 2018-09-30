import { CustomerState } from '../enums/CustomerState';
import { CustomerStatus } from '../enums/CustomerStatus';
import { ICustomer } from '../interfaces';
import appkit from '../lib/appkit';
import { IRecordWatch } from '../lib/firebase/FirebaseRepository';
import DealershipObjectsRepository from './DealershipObjectsRepository';

class Customers extends DealershipObjectsRepository<ICustomer> {

    public states: string[] = ['new', 'priority', 'active', 'inactive', 'archived'];
    public state = CustomerState;
    public status = CustomerStatus;

    constructor() {
        super('customers', 'cid');
    }

    public async add(dealershipId: string, cid: string): Promise<ICustomer> {

        // make sure we don't have an existing customer with same cid
        const customer = await this.get(dealershipId, cid);
        if (customer) {
            return customer;
        }

        // create one
        try {
            return this.insert(
                dealershipId, {
                state: 'new',
            }, cid);
        } catch (e) {
            appkit.logError(e);
            throw e;
        }
    }

    public getAllByState(dealershipId: string, state: string): Promise<ICustomer[]> {
        return this.getAllByChildValue(dealershipId, 'state', state);
    }

    public watchAllByState(
        dealershipId: string,
        state: string,
        callback: (records: ICustomer[]) => void): IRecordWatch {
        return this.watchAllByChildValue(dealershipId, 'state', state, callback);
    }

    public getAllByUser(dealershipId: string, uid: string): Promise<ICustomer[]> {
        return this.getAllByChildValue(dealershipId, 'uid', uid);
    }

    public watchAllByUser(dealershipId: string, uid: string, callback: (records: ICustomer[]) => void): IRecordWatch {
        return this.watchAllByChildValue(dealershipId, 'uid', uid, callback);
    }
}

export default Customers;
