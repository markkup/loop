import { IFirebase } from '../../interfaces';
import Firebase from './Firebase';
import FirebaseMock from './FirebaseMock';

export { default as FirebaseRepository } from './FirebaseRepository';

let exportedInstance: IFirebase;
if (process.env.NODE_ENV === 'test') {
    exportedInstance = new FirebaseMock();
} else {
    exportedInstance = new Firebase();
}
export default exportedInstance;
