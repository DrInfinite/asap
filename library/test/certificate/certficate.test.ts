import { deployedFactoryAddress, provider } from '../provider';
import ASAP from '../../src/ASAP';
import { CompanyEntityTypeEnum } from '../../src/enums';
import Web3 from 'web3';

describe('Certificates', () => {
  let asap: ASAP;
  let asapCA: ASAP;
  let materialTokenId;
  let account: string;
  let caAccount: string;
  let otherAccount: string;
  beforeAll(async () => {
    const factoryContractAddress = await deployedFactoryAddress();
    // @ts-ignore
    [, , , , account, caAccount, otherAccount] = await new Web3(
      // @ts-ignore
      provider
    ).eth.getAccounts();
    asap = await ASAP.providerInit({
      web3Provider: provider,
      factoryContractAddress,
      fromAddress: account,
    });
    asapCA = await ASAP.providerInit({
      web3Provider: provider,
      factoryContractAddress,
      fromAddress: caAccount,
    });
    await asap.company
      .create({
        name: 'company',
        entityType: CompanyEntityTypeEnum.MANUFACTURER,
      })
      .send();
    await asapCA.certificateAuthority
      .createCertificateAuthority({
        name: 'company',
      })
      .send();
    //create material
    const createResult = await asap.material
      .create({
        name: 'product',
        code: '123',
        amountIdentifier: 'kg',
      })
      .send();
    const materialTokenId = createResult.events.MaterialCreate.materialTokenId;
  });
  describe('create a new certificate authority', () => {
    it('creates a new certificate authority', async () => {
      const factoryContractAddress = await deployedFactoryAddress();
      const localProofcahin = await ASAP.providerInit({
        web3Provider: provider,
        factoryContractAddress,
        fromAddress: otherAccount,
      });
      const result = await localProofcahin.certificateAuthority
        .createCertificateAuthority({
          name: 'company',
        })
        .send();
      expect(result.events.CertificateAuthorityCreated.owner).toEqual(
        otherAccount
      );
    });
    it('fails to create if the address already has a certificate authority', async () => {
      const factoryContractAddress = await deployedFactoryAddress();
      const localProofcahin = await ASAP.providerInit({
        web3Provider: provider,
        factoryContractAddress,
        fromAddress: otherAccount,
      });
      await localProofcahin.certificateAuthority
        .createCertificateAuthority({
          name: 'company',
        })
        .send();
      await expect(
        localProofcahin.certificateAuthority
          .createCertificateAuthority({
            name: 'company',
          })
          .send()
      ).rejects.toThrow();
    });
  });
  describe('create certificate', () => {
    it('creates a new certificate', async () => {
      const createResult = await asapCA.certificateAuthority
        .createCertificate({
          name: 'name',
          description: 'description',
          type: 2,
        })
        .send();

      const code =
        createResult.events.CertificateAuthorityCertificateCreated.code;
      expect(code).not.toEqual(undefined);
    });
    it('fails to create a certificate if the sender is not a certificate authority', async () => {
      await expect(
        asap.certificateAuthority
          .createCertificate({
            name: 'name',
            description: 'description',
            type: 2,
          })
          .send()
      ).rejects.toThrow();
    });
  });
  describe('getByCode', () => {
    it('returns a certificate by a provided code', async () => {
      const createResult = await asapCA.certificateAuthority
        .createCertificate({
          name: 'name',
          description: 'description',
          type: 2,
        })
        .send();

      const code =
        createResult.events.CertificateAuthorityCertificateCreated.code;
      const fetchedCertificate = await asapCA.certificateAuthority.getByCode(
        code
      );
      expect(fetchedCertificate!.code).toEqual(code);
      expect(fetchedCertificate!.name).toEqual('name');
      expect(fetchedCertificate!.description).toEqual('description');
    });
    it('returns null if the certificate code does not exist', async () => {
      const fetchedCertificate = await asapCA.certificateAuthority.getByCode(
        123456
      );
      expect(fetchedCertificate).toBeNull();
    });
  });
  describe('getCertificateAutority', () => {
    it('returns a certificate autority by a provided address', async () => {
      const certificateAuthority = await asap.certificateAuthority.getCertificateAuthority(
        caAccount
      );
      expect(certificateAuthority!.owner).toEqual(caAccount);
    });
  });
  describe('allCertificateAutorities', () => {
    it('returns all certificate authorities created', async () => {
      const certificateAuthorities = await asap.certificateAuthority.allCertificateAutorities();
      expect(certificateAuthorities.length >= 1).toEqual(true);
    });
  });
  describe('hasCertificateAuthority', () => {
    it('returns true if an address is a certificate authority', async () => {
      const result = await asapCA.certificateAuthority.hasCertificateAuthority();
      expect(result).toBeTruthy();
    });
    it('returns false if an address does not have a certificate authority', async () => {
      const result = await asap.certificateAuthority.hasCertificateAuthority();
      expect(result).toBeFalsy();
    });
  });
  describe('certificates', () => {
    it('returns certificates of a certificate authority', async () => {
      const result = await asapCA.certificateAuthority.certificates();
      expect(result.length > 0).toBeTruthy();
    });
  });
  describe('minimumStake', () => {
    it('returns the minimum stake of the certificate', async () => {
      const result = await asapCA.certificateAuthority.minimumStake();
      expect(parseInt(result) > 0).toBeTruthy();
    });
  });
});
