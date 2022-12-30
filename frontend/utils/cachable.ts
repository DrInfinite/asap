import asap from 'asap';
import LocalCache from './localCache';

export const getMaterialByUuid = async (uuid) => {
  const cacheId = `m-uuid-${uuid}`;
  const materialInstance = await LocalCache.cached(
    cacheId,
    asap().material.getMaterialByUuid(uuid, true)
  );
  return materialInstance;
};

export const getMaterialById = async (materialTokenId) => {
  const cacheId = `m-id-${materialTokenId}`;
  const material = await LocalCache.cached(
    cacheId,
    asap().material.getById(materialTokenId)
  );

  return material;
};

export const getBatchById = async (batchId) => {
  const cacheId = `batch-id-${batchId}`;
  const batch = await LocalCache.cached(
    cacheId,
    asap().batch.getById(batchId)
  );
  return batch;
};
