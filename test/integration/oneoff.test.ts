import 'mocha';

import config from '../../config';
import { FirebaseRepository } from '../../src/lib/firebase';
import Firebase from '../../src/lib/firebase/Firebase';

let firebase: any;
before(async () => {
    firebase = new Firebase();
    await firebase.init(config.firebase);
});

describe.skip('One Off Tests', () => {

    it.skip('should query user events', async () => {

        const repo = new FirebaseRepository(firebase);
        const topics = await repo.getRecordsByChildValue(`userTopics/7172012010/`, 'event/active', true);
        console.log({ topics });
        // for (const topic of topics) {
        //     console.log(topic);
        // }

    }).timeout(30000);

});
