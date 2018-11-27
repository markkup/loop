import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';

import config from '../../config';
import firebase from '../../src/lib/firebase';

chai.use(chaiAsPromised);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

afterEach(() => {
    sandbox.restore();
});

describe('lib/firebase.js', () => {

    it('should init with config', async () => {

        await firebase.init(config.firebase);

        expect((firebase as any).config).to.deep.equal(config.firebase);
    });

    it('should call cloud function', async () => {

        const resultStub = sandbox.stub().returns({ text: 'foo' });
        (firebase as any).cloudFunctionMock = resultStub;

        const result = await firebase.fetchCloudFunction('echo?text=foo');

        expect(result).to.deep.equal({ text: 'foo' });
    });

});
