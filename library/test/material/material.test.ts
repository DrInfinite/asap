import Web3 from 'web3';
import ASAP from '../../src/ASAP';
import { CompanyEntityTypeEnum } from '../../src/enums';
import { deployedFactoryAddress, provider } from '../provider';

describe('material', () => {
  let asap: ASAP;
  let account: string;
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
  });
  describe('create', () => {
    it('creates a new material', async () => {
      const result = await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
        })
        .send();
      expect(result.events.MaterialCreate.company).toEqual(account);
      expect(result.events.MaterialCreate.materialTokenId).toEqual('0');
      const result2 = await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
          recipeMaterialTokenId: [result.events.MaterialCreate.materialTokenId],
          recipeMaterialAmount: [2],
        })
        .send();
      expect(result2.events.MaterialCreate.company).toEqual(account);
      expect(result2.events.MaterialCreate.materialTokenId).toEqual('1');
    });
    // it('throws error if the specified recipe material id does not exist', async () => {
    //   const resultPromise = asap.material
    //     .create({
    //       name: 'product',
    //       code: '123',
    //       amountIdentifier: 'kg',
    //       images: ['a'],
    //       recipeMaterialTokenId: [99],
    //       recipeMaterialAmount: [2],
    //     })
    //     .send();
    //   await expect(resultPromise).rejects.toThrow();
    // });
  });
  describe('all', () => {
    it('returns all created materials', async () => {
      // at this point the length should be greater than 1
      await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
        })
        .send();
      const materials = await asap.material.all();
      expect(materials.length > 1).toEqual(true);
    });
    it('filters to return only materials or raw materials', async () => {
      const rawMaterial = await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
        })
        .send();
      await asap.material
        .create({
          name: 'product_not_raw',
          code: '123',
          amountIdentifier: 'kg',
          recipeMaterialTokenId: [
            rawMaterial.events.MaterialCreate.materialTokenId,
          ],
          recipeMaterialAmount: [2],
        })
        .send();
      const onlyRawMaterials = await asap.material.all({
        onlyRawMaterials: true,
      });
      const materials = await asap.material.all();
      const onlyMaterials = await asap.material.all({
        onlyMaterials: true,
      });
      expect(
        onlyRawMaterials.find((e) => e!.name === 'product_not_raw')
      ).toEqual(undefined);
      expect(materials.find((e) => e!.name === 'product_not_raw')).not.toEqual(
        undefined
      );
      expect(
        onlyMaterials.find((e) => e!.name === 'product_not_raw')
      ).not.toEqual(undefined);
    });
  });
  describe('getById', () => {
    it('returns a material based on the materialTokenId', async () => {
      // at this point the length should be greater than 1
      const result = await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
          images: ['a'],
        })
        .send();
      const fetched = await asap.material.getById(
        result.events.MaterialCreate.materialTokenId
      );
      expect(fetched!.name).toEqual('product');
      expect(fetched!.code).toEqual('123');
    });
  });
  describe('countAll', () => {
    it('returns all created materials', async () => {
      // at this point the length should be greater than 1
      await asap.material
        .create({
          name: 'product',
          code: '123',
          images: ['a'],
          amountIdentifier: 'kg',
        })
        .send();
      const length = await asap.material.countAll();
      expect(length > 1).toEqual(true);
    });
  });

  describe('getBalance', () => {
    it('returns the available balance of a material', async () => {
      const product = await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
        })
        .send();
      const { materialTokenId } = product.events.MaterialCreate;
      await (
        await asap.material.mint({
          materialTokenId,
          amount: 2,
        })
      ).send();
      expect(await asap.material.getBalance(materialTokenId)).toEqual(2);
    });
  });

  describe('getMaterialByUuid', () => {
    let materialTokenId: number;
    let uuid: number;
    beforeAll(async () => {
      const product = await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
        })
        .send();
      materialTokenId = product.events.MaterialCreate.materialTokenId;
      const result = await (
        await asap.material.mint({
          materialTokenId,
          amount: 2,
        })
      ).send();
      uuid = result.events.MaterialTransfer[0].uuid;
    });
    it('returns the material by uuid', async () => {
      const fetchedMaterial = await asap.material.getMaterialByUuid(uuid);
      expect(fetchedMaterial.materialTokenId).toEqual(materialTokenId);
    });
    it('returns the batch inputs', async () => {
      const fetchedMaterial = await asap.material.getMaterialByUuid(
        uuid,
        true
      );
      expect(Array.isArray(fetchedMaterial.batchMaterialsUuid)).toBeTruthy();
      expect(Array.isArray(fetchedMaterial.fromBatchId)).toBeTruthy();
    });
  });
  describe('getOwnedMaterialsUuid', () => {
    it('returns the owned material uuids', async () => {
      const product = await asap.material
        .create({
          name: 'product',
          code: '123',
          amountIdentifier: 'kg',
        })
        .send();
      const { materialTokenId } = product.events.MaterialCreate;
      const result = await (
        await asap.material.mint({
          materialTokenId,
          amount: 2,
        })
      ).send();
      const fetchedMaterials = await asap.material.getOwnedMaterialsUuid(
        materialTokenId
      );
      expect(fetchedMaterials.length).toEqual(2);
    });
  });
});
