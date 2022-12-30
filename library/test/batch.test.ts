import Web3 from 'web3';
import ASAP from '../src/ASAP';
import { CompanyEntityTypeEnum } from '../src/enums';
import { deployedFactoryAddress, provider } from './provider';

describe('batch', () => {
  let asap: ASAP;
  let account: string;
  let materialTokenId: number;
  let materialsUuid: number[];
  beforeAll(async () => {
    // @ts-ignore
    [account] = await new Web3(provider).eth.getAccounts();
    asap = await ASAP.providerInit({
      web3Provider: provider,
      factoryContractAddress: await deployedFactoryAddress(),
      fromAddress: account,
    });
    await asap.company
      .create({
        name: 'company',
        entityType: CompanyEntityTypeEnum.MANUFACTURER,
      })
      .send();
    const result = await asap.material
      .create({
        name: 'product',
        code: '123',
        amountIdentifier: 'kg',
      })
      .send();
    materialTokenId = result.events.MaterialCreate.materialTokenId;

    const mintResult = await (
      await asap.material.mint({
        materialTokenId: materialTokenId,
        amount: 5,
      })
    ).send();
    materialsUuid = mintResult.events.MaterialTransfer.map((e) => e.uuid);
  });
  describe('create', () => {
    it('creates a new batch', async () => {
      const oldBalance = await asap.material.getBalance(materialTokenId);
      const result = await asap.batch
        .create({
          materialsUuid: [materialsUuid[0]],
          code: '1',
        })
        .send();
      const newBalance = await asap.material.getBalance(materialTokenId);
      expect(result.events.BatchCreate.company).toEqual(account);
      expect(oldBalance - newBalance).toEqual(1);
    });
  });
  describe('getById', () => {
    it('return a batch by batchId', async () => {
      const result = await asap.batch
        .create({
          materialsUuid: [materialsUuid[1]],
          code: '1',
        })
        .send();
      const fetchedBatch = await asap.batch.getById(
        result.events.BatchCreate.batchId
      );
      expect(fetchedBatch!.code).toEqual('1');
      expect(fetchedBatch!.materialTokenId).toEqual(materialTokenId);
      expect(fetchedBatch!.materialsUuid).toEqual([materialsUuid[1]]);
    });
  });
  describe('burn', () => {
    it('decreases batch material quantity', async () => {
      const result = await asap.batch
        .create({
          materialsUuid: [materialsUuid[2], materialsUuid[3]],
          code: '1',
        })
        .send();
      const batchId = result.events.BatchCreate.batchId;
      const oldBatch = await asap.batch.getById(batchId);
      await asap.batch
        .burn({
          batchId,
          materialsUuid: [materialsUuid[2]],
        })
        .send();
      const newBatch = await asap.batch.getById(batchId);
      expect(
        oldBatch!.materialsUuid.length - newBatch!.materialsUuid.length
      ).toEqual(1);
    });
  });
  describe('all', () => {
    it('returns all created batches', async () => {
      // at this point the length should be greater than 1
      const batches = await asap.batch.all();
      expect(batches.length > 1).toEqual(true);
    });
  });
  describe('remove', () => {
    it('removes a batch from the user', async () => {
      const oldBatches = await asap.batch.all();
      // @ts-ignore
      await asap.batch.remove(oldBatches[0]?.batchId).send();
      const newBatches = await asap.batch.all();
      expect(oldBatches.length - newBatches.length).toEqual(1);
    });
  });
  describe('destroyBatch', () => {
    let materialTokenId: number, batchId: number;
    beforeEach(async () => {
      const materialCreateResult = await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
        })
        .send();
      materialTokenId =
        materialCreateResult.events.MaterialCreate.materialTokenId;

      const mintResult = await (
        await asap.material.mint({
          materialTokenId: materialTokenId,
          amount: 5,
        })
      ).send();
      materialsUuid = mintResult.events.MaterialTransfer.map((e) => e.uuid);
      const result = await asap.batch
        .create({
          materialsUuid: materialsUuid,
          code: '1',
        })
        .send();
      batchId = result.events.BatchCreate.batchId;
    });
    it('removes the batch from all batches return values', async () => {
      const oldFetchedBatches = await asap.batch.all();
      await asap.batch.destroyBatch(batchId).send();
      const newFetchedBatches = await asap.batch.all();
      expect(oldFetchedBatches.length - newFetchedBatches.length).toEqual(1);
    });
    it('adds to the balance of materials', async () => {
      const oldFetchedBalance = await asap.material.getBalance(
        materialTokenId
      );
      await asap.batch.destroyBatch(batchId).send();
      const newFetchedBalance = await asap.material.getBalance(
        materialTokenId
      );
      expect(newFetchedBalance - oldFetchedBalance).toEqual(5);
    });
  });
});
