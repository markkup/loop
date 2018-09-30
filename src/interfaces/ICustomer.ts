import { ILastMessage } from '.';
import { CustomerState } from '../enums/CustomerState';
import { CustomerStatus } from '../enums/CustomerStatus';

export default interface ICustomer {
    cid: string;
    lastAutocode?: string;
    lastMessage?: ILastMessage;
    state: CustomerState;
    contactPref?: 'email' | 'call' | 'text';
    displayName: string;
    uid: string;
    status?: CustomerStatus;
}
