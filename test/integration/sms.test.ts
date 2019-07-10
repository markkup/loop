import 'mocha';

import FirebaseTestServer from '../lib/FirebaseTestServer';

before(() => {
    FirebaseTestServer.init();
});

describe('integration/sms', () => {

    /*it('should send sms', async () => {

        await Loop.init(config);

        const result = await Loop.sms.send('+17172012010', 'test worked');
        expect(result.status).to.equal('queued');
        expect(result.sid).to.not.be.undefined;
    });*/

});
