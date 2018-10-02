import { expect } from 'chai';
import 'mocha';
import config from '../../config';
import Loop from '../../src/index';

describe('models/Users.js', () => {

    it('should add and manipulate user', async () => {

        await Loop.init(config);

        // add user
        const addResult = await Loop.users.add('John Test', 'Salesperson', '(717) 219-7355');
        const getResult = await Loop.users.get(addResult.uid);
        expect(getResult.bio).to.equal('Salesperson');

        // update user
        const updateResult = await Loop.users.update(getResult.uid, { bio: 'Manager' });
        expect(updateResult.bio).to.equal('Manager');

        // delete user
        await Loop.users.delete(getResult.uid);
        const getDeletedResult = await Loop.users.get(getResult.uid);
        expect(getDeletedResult).to.be.null;
    });

});
