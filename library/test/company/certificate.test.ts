import Web3 from 'web3';
import ASAP from '../../src/ASAP';
import { CompanyEntityTypeEnum } from '../../src/enums';
import { deployedFactoryAddress, provider } from '../provider';

describe('company', () => {
  let asap: ASAP;
  let asapCa: ASAP;
  let account: string;
  let caAccount: string;
  beforeAll(async () => {
    // @ts-ignore
    [account, caAccount] = await new Web3(provider).eth.getAccounts();
    const factoryContractAddress = await deployedFactoryAddress();
    asap = await ASAP.providerInit({
      web3Provider: provider,
      factoryContractAddress,
      fromAddress: account,
    });
    asapCa = await ASAP.providerInit({
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
    await asapCa.certificateAuthority
      .createCertificateAuthority({
        name: 'certifcate authority',
      })
      .send();
  });
  describe('certificate', () => {
    describe('assignCertificate', () => {
      it('assigns a certificate to a company', async () => {
        const certificateCreateResult = await asapCa.certificateAuthority
          .createCertificate({
            name: 'certificate',
            description: 'description',
            type: 2,
          })
          .send();
        const certificateCode =
          certificateCreateResult.events.CertificateAuthorityCertificateCreated
            .code;
        const result = await asapCa.company
          .assignCertificate({
            certificateCode,
            companyAddress: account,
            stake: Web3.utils.toWei('2', 'ether'),
          })
          .send();
        expect(
          result.events.CompanyAssignedCertificate.certificateAuthority
        ).toEqual(caAccount);
        expect(
          result.events.CompanyAssignedCertificate.certificateCode
        ).toEqual(certificateCode);
        expect(result.events.CompanyAssignedCertificate.companyAddress).toEqual(
          account
        );
      });
    });
    describe('cancelCertificate', () => {
      it('removes a certificate from a company', async () => {
        const certificateCreateResult = await asapCa.certificateAuthority
          .createCertificate({
            name: 'certificate',
            description: 'description',
            type: 3,
          })
          .send();
        const certificateCode =
          certificateCreateResult.events.CertificateAuthorityCertificateCreated
            .code;
        const result = await asapCa.company
          .cancelCertificate({
            certificateCode,
            companyAddress: account,
          })
          .send();
        expect(
          result.events.CompanyCanceledCertificate.certificateAuthority
        ).toEqual(caAccount);
        expect(
          result.events.CompanyCanceledCertificate.certificateCode
        ).toEqual(certificateCode);
        expect(result.events.CompanyCanceledCertificate.companyAddress).toEqual(
          account
        );
      });
    });
    describe('revokeCertificate', () => {
      it('assigns a certificate to a company', async () => {
        const certificateCreateResult = await asapCa.certificateAuthority
          .createCertificate({
            name: 'certificate',
            description: 'description',
            type: 1,
          })
          .send();
        const certificateCode =
          certificateCreateResult.events.CertificateAuthorityCertificateCreated
            .code;
        await asapCa.company
          .assignCertificate({
            certificateCode,
            companyAddress: account,
            stake: Web3.utils.toWei('2', 'ether'),
          })
          .send();
        const result = await asap.company
          .revokeCertificate({
            certificateCode,
            companyAddress: account,
          })
          .send();
        expect(
          result.events.CompanyRevokedCertificate.certificateAuthority
        ).toEqual(account);
        expect(result.events.CompanyRevokedCertificate.certificateCode).toEqual(
          certificateCode
        );
        expect(result.events.CompanyRevokedCertificate.companyAddress).toEqual(
          account
        );
      });
    });
    describe('assigedCertificates', () => {
      it('returns the assigned certificates from a comapany', async () => {
        const certificateCreateResult = await asapCa.certificateAuthority
          .createCertificate({
            name: 'certificate',
            description: 'description',
            type: 1,
          })
          .send();
        const certificateCode =
          certificateCreateResult.events.CertificateAuthorityCertificateCreated
            .code;
        await asapCa.company.assignCertificate({
          certificateCode,
          companyAddress: account,
          stake: Web3.utils.toWei('2', 'ether'),
        });
        await asapCa.company
          .cancelCertificate({
            certificateCode,
            companyAddress: account,
          })
          .send();
        const certificateInstances = await asap.company.assigedCertificates(
          account
        );
        expect(certificateInstances.length > 0).toEqual(true);
      });
    });
  });
  describe('getCertificateInstance', () => {
    it('retuns the assigned certificate instance', async () => {
      const certificateCreateResult = await asapCa.certificateAuthority
        .createCertificate({
          name: 'certificate',
          description: 'description',
          type: 2,
        })
        .send();
      const certificateCode =
        certificateCreateResult.events.CertificateAuthorityCertificateCreated
          .code;
      const result = await asapCa.company
        .assignCertificate({
          certificateCode,
          companyAddress: account,
          stake: Web3.utils.toWei('2', 'ether'),
        })
        .send();
      const certificateInstanceId =
        result.events.CompanyAssignedCertificate.certificateInstanceId;
      const fetchedCertificateInstance = await asap.company.getCertificateInstance(
        certificateInstanceId
      );
      expect(fetchedCertificateInstance.code).toEqual(certificateCode);
      expect(fetchedCertificateInstance.stake).toEqual(
        Web3.utils.toWei('2', 'ether')
      );
    });
  });
});
