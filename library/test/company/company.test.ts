import { deployedFactoryAddress, provider } from '../provider';
import ASAP from '../../src/ASAP';
import { CompanyEntityTypeEnum } from '../../src/enums';
import Web3 from 'web3';

describe('Company', () => {
  let asap: ASAP;
  let account;
  beforeAll(async () => {
    // @ts-ignore
    [account] = await new Web3(provider).eth.getAccounts();
    asap = await ASAP.providerInit({
      web3Provider: provider,
      factoryContractAddress: await deployedFactoryAddress(),
      fromAddress: account,
    });
  });
  describe('create', () => {
    it('creates a new company', async () => {
      const result = await asap.company
        .create({
          name: 'company',
          entityType: CompanyEntityTypeEnum.MANUFACTURER,
        })
        .send();
      expect(result.transactionHash.length > 1).toBeTruthy();
      expect(result.events.CompanyCreate.owner.length).toEqual(
        '0xa3AAB829D1694E2B96b4905b0c7E17d86EC084ED'.length
      );
    });
  });
  describe('getCompany', () => {
    it('returns the  company associated with the default address, if the address is not specified', async () => {
      const companyInfo = await asap.company.getCompany();
      expect(companyInfo.name).toEqual('company');
      expect(companyInfo.entityType).toEqual(
        CompanyEntityTypeEnum.MANUFACTURER
      );
    });
    it('returns a company based on the specified address', async () => {
      //
    });
  });
  describe('hasCompany', () => {
    it('returns true if the specified address has a company', async () => {
      const hasCompany = await asap.company.hasCompany();
      expect(hasCompany).toEqual(true);
    });
  });
});
