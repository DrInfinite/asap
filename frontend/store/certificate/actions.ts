import { CertificateTypeEnum } from '@enums';
import { createAsyncThunk } from '@reduxjs/toolkit';
import transactionWrapper from '@utils/transactionWrapper';
import asap from 'asap';
import web3Instance from 'web3Instance';

export const fetchCertificates = createAsyncThunk(
  'certificate/fetchCertificates',
  async () => {
    try {
      let certificates = await asap().certificateAuthority.certificates();
      certificates = await Promise.all(
        certificates.map(async (e) => ({
          ...e,
          events: {
            CertificateAuthorityCertificateCreated: (
              await asap().certificateAuthority.getRawPastEvents(
                'CertificateAuthorityCertificateCreated',
                {
                  company: asap().certificateAuthority.fromAddress,
                }
              )
            )[0],
          },
        }))
      );
      return { certificates };
    } catch (e) {
      console.log(e);
    }
    return { certificates: [] };
  }
);
export const createCertificate = createAsyncThunk(
  'certificate/createCertificate',
  async ({
    name,
    description,
    type,
  }: {
    name: string;
    description: string;
    type: CertificateTypeEnum;
  }) => {
    console.log(name, description);
    const result = await transactionWrapper(
      asap().certificateAuthority.createCertificate({
        name,
        description,
        type,
      })
    );

    // return { batches };
  }
);
export const assignCertificate = createAsyncThunk(
  'certificate/asignCertficate',
  async ({
    materialTokenId,
    companyAddress,
    code,
    stake,
  }: {
    materialTokenId?: number;
    companyAddress?: string;
    code: number;
    stake;
  }) => {
    if (companyAddress) {
      console.log(
        `Assigning certificate ${code} to materialTokenId: ${materialTokenId} with stake ${stake}`
      );
      await transactionWrapper(
        asap().company.assignCertificate({
          companyAddress,
          certificateCode: code,
          stake,
        })
      );
    } else if (materialTokenId) {
      console.log(
        `Assigning certificate ${code} to compay address: ${materialTokenId} with stake ${stake}`
      );
      await transactionWrapper(
        asap().material.assignCertificate({
          materialTokenId,
          certificateCode: code,
          stake,
        })
      );
    }

    // return { batches };
  }
);

export const fetchMinimumStake = createAsyncThunk(
  'certificate/fetchMinimumStake',
  async () => {
    const minimumStake = await asap().certificateAuthority.minimumStake();

    return { minimumStake };
  }
);
export const fetchCertificateInfo = createAsyncThunk(
  'certificate/fetchCertificateInfo',
  async ({ certificateCode }: { certificateCode: number }) => {
    try {
      const certificate = await asap().certificateAuthority.getByCode(
        certificateCode
      );
      let materialAdditionalInfo = [];
      const materials = await asap().material.getFromCertificate(
        certificate.code
      );
      for (let { assignEvent, ...certificateInstance } of materials) {
        const material = await asap().material.getById(
          assignEvent.materialTokenId
        );

        const block = await web3Instance().eth.getBlock(
          // @ts-ignore
          assignEvent.blockNumber
        );
        materialAdditionalInfo.push({
          material,
          certificateInstance,
          assignEvent,
          assignTime: block.timestamp,
        });
      }
      // companies
      let companyAdditionalInfo = [];
      const companies = await asap().company.getFromCertificate(
        certificate.code
      );
      for (let { assignEvent, ...certificateInstance } of companies) {
        const company = await asap().company.getCompany(
          assignEvent.companyAddress
        );
        const block = await web3Instance().eth.getBlock(
          // @ts-ignore
          assignEvent.blockNumber
        );
        companyAdditionalInfo.push({
          company,
          certificateInstance,
          assignEvent,
          assignTime: block.timestamp,
        });
      }
      return { certificate, materialAdditionalInfo, companyAdditionalInfo };
    } catch (e) {
      console.log(e);
    }
  }
);
export const cancelCertificate = createAsyncThunk(
  'certificate/cancelCertificate',
  async ({
    certificateCode,
    companyAddress,
    materialTokenId,
  }: {
    companyAddress: string;
    certificateCode: number;
    materialTokenId: number;
  }) => {
    if (materialTokenId) {
      await transactionWrapper(
        asap().material.cancelCertificate({
          certificateCode,
          materialTokenId,
        })
      );
    } else if (companyAddress) {
      await transactionWrapper(
        asap().company.cancelCertificate({
          certificateCode,
          companyAddress,
        })
      );
    }
  }
);

export const fetchCompanyCertificates = createAsyncThunk(
  'certificate/fetchCompanyCertificates',
  async () => {
    let certificateInstances = await asap().company.assigedCertificates();
    let information = [];
    for (let certificateInstance of certificateInstances) {
      const certificate = await asap().certificateAuthority.getByCode(
        certificateInstance.code
      );
      information.push({ certificateInstance, certificate });
    }
    return { certificates: information };
  }
);
