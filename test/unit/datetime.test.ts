import 'mocha';

import { expect } from 'chai';

import { Datetime } from '../../src/lib/datetime';

describe('unit/datetime', () => {

    it('should format date', async () => {

        const datetime = new Datetime();
        const input = new Date();
        const result = datetime.formatDate(input, 'yyyy M d H', true);

        const year = input.getUTCFullYear();
        const month = input.getUTCMonth() + 1;
        const day = input.getUTCDate();
        const hour = input.getUTCHours();

        expect(result).to.equal(`${year} ${month} ${day} ${hour}`);
    });

    it('should format time since', async () => {

        const datetime = new Datetime();
        const input2 = new Date();
        const input1 = new Date(input2.getTime() - 1000 * 60 * 8);
        const result = datetime.formatTimeSince(input1, input2);

        expect(result).to.equal('8 minutes');
    });

});
