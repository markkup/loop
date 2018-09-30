import { expect } from 'chai';
import 'mocha';
import config from '../../config';
import firebase from '../../src/lib/firebase';

describe('lib/firebase.js', () => {

    it('should init with config', async () => {

        await firebase.init(config.firebase);

        expect((firebase as any).config).to.deep.equal(config.firebase);
    });

    it('should call cloud function', async () => {

        const result = await firebase.fetchCloudFunction('echo?text=foo');

        expect(result).to.deep.equal({ text: 'foo' });
    });

});
