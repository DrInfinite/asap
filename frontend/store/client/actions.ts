import { createAsyncThunk } from '@reduxjs/toolkit';
import { EMPTY_ADDRESS } from '@utils/eth';
import { IMaterial } from 'interface';
import asap from 'asap';

export const fetchCompanyInfo = createAsyncThunk(
  'client/fetchCompanyInfo',
  async (material: IMaterial, { getState }) => {
    // @ts-ignore
    const { creator } = material;
    const company = await asap().company.getCompany(creator);
    const createdEvent = await asap().company.getPastEvents(
      'CompanyCreate',
      {
        owner: creator,
      },
      true
    );

    return { company, createdEvent: createdEvent[0] };
  }
);

export const fetchCompanyInfoCertificates = createAsyncThunk(
  'client/fetchCompanyInfoCertificates',
  async (material: IMaterial, { getState }) => {
    const { creator } = material;
    const certificates = [];
    let certificateInstances = await asap().company.assigedCertificates(
      creator
    );

    for (let certificateInstance of certificateInstances) {
      const certificate = await asap().certificateAuthority.getByCode(
        certificateInstance.code
      );
      const certificateAuthority = await asap().certificateAuthority.getCertificateAuthority(
        certificate.certificateAuthority
      );
      console.log(creator, certificateInstance.code);
      const assignEvent = await asap().company.getPastEvents(
        'CompanyAssignedCertificate',
        {
          companyAddress: creator,
          certificateCode: certificateInstance.code,
        },
        true
      );
      certificates.push({
        certificate,
        certificateAuthority,
        assignEvent: assignEvent[0],
        certificateInstance,
      });
    }
    return { certificates };
  }
);

export const fetchMaterialInfo = createAsyncThunk(
  'client/fetchMaterialInfo',
  async ({ uuid }: { uuid: number }) => {
    const materialInstance = await asap().material.getMaterialByUuid(
      uuid,
      true
    );
    const material = await asap().material.getById(
      materialInstance.materialTokenId
    );
    // await fetchMaterialHistory(materialInstance);
    return { material, materialInstance };
  }
);
