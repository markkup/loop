import { IDealership } from '../interfaces';
import Repository from './Repository';

class Dealerships extends Repository<IDealership> {

    constructor() {
        super('dealerships');
    }

    public async getByTwilioNumber(phoneNumber: string): Promise<IDealership | null> {
        const results = await this.getAllByChildValue('twilioNumber', phoneNumber) as IDealership[];
        if (results && results.length > 0) {
            return results[0];
        }
        return null;
    }
}

export default Dealerships;
