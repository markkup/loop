import 'mocha';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';

import { IModelTransformer } from '../../src/interfaces';
import FirebaseRepository from '../../src/lib/firebase/FirebaseRepository';
import Repository from '../../src/repositories/Repository';

chai.use(chaiAsPromised);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

afterEach(() => {
    sandbox.restore();
});

describe('unit/repository', () => {

    const collection1 = 'collection1';
    const key1 = 'key1';
    const rawRecord1 = { val: 'raw1' };
    const rawRecord2 = { val: 'raw2' };
    const rawRecords1 = [rawRecord1, rawRecord2];
    const transformedRecord1 = { newval: 'raw1' };
    const transformedRecord2 = { newval: 'raw2' };
    const transformedRecords1 = [transformedRecord1, transformedRecord2];
    const transformer1 = {
        transform: (item: any) => 0,
    } as IModelTransformer;

    it('should construct class with minimum params', async () => {

        const repository = new Repository(collection1);

        expect((repository as any).collection).to.equal(collection1);
        expect((repository as any).keyName).to.be.empty;
        expect((repository as any).transformer).to.be.undefined;
    });

    it('should construct class with all params', async () => {

        const transformer = {} as IModelTransformer;

        const repository = new Repository(collection1, transformer, key1);

        expect((repository as any).collection).to.equal(collection1);
        expect((repository as any).keyName).to.equal(key1);
        expect((repository as any).transformer).to.equal(transformer);
    });

    it('should get transformed model', async () => {

        const getRecordStub = sandbox.stub(FirebaseRepository.prototype, 'getRecord').resolves(rawRecord1);
        const transformStub = sandbox.stub(transformer1, 'transform').returns(transformedRecord1);

        const repository = new Repository(collection1, transformer1);
        const result = await expect(repository.get(key1)).to.be.fulfilled;

        expect(getRecordStub.callCount).to.equal(1);
        expect(getRecordStub.getCall(0).args[0]).to.equal(collection1);
        expect(getRecordStub.getCall(0).args[1]).to.equal(key1);
        expect(transformStub.callCount).to.equal(1);
        expect(transformStub.getCall(0).args[0]).to.deep.equal(rawRecord1);
        expect(result).to.deep.equal(transformedRecord1);
    });
});
