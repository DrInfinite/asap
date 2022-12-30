import { createAsyncThunk } from '@reduxjs/toolkit';
import transactionWrapper from '@utils/transactionWrapper';
import asap from 'asap';
import web3Instance from 'web3Instance';
const asapFetchMaterials = async ({
  onlyRawMaterials,
  onlyMaterials,
}: {
  onlyRawMaterials?: boolean;
  onlyMaterials?: boolean;
}) => {
  let materials = await asap().material.all({
    onlyRawMaterials,
    onlyMaterials,
  });
  materials = await Promise.all(
    materials.map(async (e) => ({
      ...e,
      events: {
        MaterialCreate: (
          await asap().material.getRawPastEvents('MaterialCreate', {
            company: asap().material.fromAddress,
          })
        )[0],
      },
    }))
  );
  return materials;
};
export const fetchMaterials = createAsyncThunk(
  'material/fetchMaterials',
  async () => {
    const materials = await asapFetchMaterials({ onlyMaterials: true });
    return { materials };
  }
);
export const fetchRawMaterials = createAsyncThunk(
  'material/fetchRawMaterials',
  async () => {
    const materials = await asapFetchMaterials({
      onlyRawMaterials: true,
    });
    return { materials };
  }
);
export const createMaterial = createAsyncThunk(
  'material/createMaterial',
  async ({
    name,
    code,
    amountIdentifier,
    recipe,
  }: {
    name: string;
    code: string;
    amountIdentifier: string;
    recipe?: [
      {
        materialTokenId: string;
        materialTokenAmount: number;
      }
    ];
  }) => {
    let recipeMaterialTokenId = [];
    let recipeMaterialAmount = [];
    for (let { materialTokenId, materialTokenAmount } of recipe) {
      if (materialTokenId && materialTokenAmount) {
        recipeMaterialTokenId.push(materialTokenId);
        recipeMaterialAmount.push(materialTokenAmount);
      }
    }
    const result = await transactionWrapper(
      asap().material.create({
        name,
        code,
        images: [],
        amountIdentifier,
        recipeMaterialTokenId,
        recipeMaterialAmount,
      })
    );
    if (!result) throw new Error('Error!');
    return {};
  }
);
export const fetchMaterialInfo = createAsyncThunk(
  'material/fetchMaterialInfo',
  async ({ materialTokenId }: { materialTokenId: number }) => {
    const material = await asap().material.getById(materialTokenId);
    const balance = await asap().material.getBalance(materialTokenId);
    const transfers = await asap().material.getTransfers({
      materialTokenId,
    });
    const inventory = await asap().material.getOwnedMaterialsUuid(
      materialTokenId
    );
    return { material, balance, transfers, inventory };
  }
);
export const mintMaterial = createAsyncThunk(
  'material/mintMaterial',
  async ({
    materialTokenId,
    amount,
    fromBatchId,
    fromBatchMaterialsUuid,
  }: {
    materialTokenId: number;
    amount?: number;
    fromBatchId?: number[];
    fromBatchMaterialsUuid?: number[][];
  }) => {
    await transactionWrapper(
      await asap().material.mint({
        materialTokenId,
        amount,
        fromBatchId,
        fromBatchMaterialsUuid,
      })
    );

    const balance = await asap().material.getBalance(materialTokenId);
    const transfers = await asap().material.getTransfers({
      materialTokenId,
    });
    return { balance, materialTokenId, transfers };
  }
);
export const fetchMaterialInfoCertificates = createAsyncThunk(
  'material/fetchMaterialInfoCertificates',
  async ({ materialTokenId }: { materialTokenId: number }) => {
    let certificates = [];
    const certificateInstances = await asap().material.assigedCertificates(
      materialTokenId
    );
    for (let certificateInstance of certificateInstances) {
      const certificate = await asap().certificateAuthority.getByCode(
        certificateInstance.code
      );
      const certificateAuthority = await asap().certificateAuthority.getCertificateAuthority(
        certificate.certificateAuthority
      );
      const assignEvents = await asap().material.getPastEvents(
        'MaterialAssignedCertificate',
        {
          certificateAuthority: certificateAuthority.owner,
          certificateCode: certificate.code,
          materialTokenId,
        },
        true
      );
      certificates.push({
        certificate,
        certificateInstance,
        certificateAuthority,
        assignEvent: assignEvents[0],
      });
    }
    console.log('certificates', certificates);
    return { certificates };
  }
);
