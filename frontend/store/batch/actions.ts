import { createAsyncThunk } from '@reduxjs/toolkit';
import transactionWrapper from '@utils/transactionWrapper';
import { IBatch } from 'interface';
import asap from 'asap';
import web3Instance from 'web3Instance';

export const fetchBatches = createAsyncThunk(
  'material/fetchBatches',
  async () => {
    try {
      let batches = await asap().batch.all();
      batches = await Promise.all(
        batches.map(async (e) => ({
          ...e,
          events: {
            BatchCreate: (
              await asap().batch.getRawPastEvents('BatchCreate', {
                batchId: e.batchId,
              })
            )[0],
          },
        }))
      );
      return { batches };
    } catch (e) {
      console.log(e);
    }
    return { batches: [] };
  }
);
export const createBatch = createAsyncThunk(
  'material/createBatch',
  async ({
    code,
    materialsUuid,
  }: {
    code: string;
    materialsUuid: number[];
  }) => {
    const result = await transactionWrapper(
      asap().batch.create({
        code,
        materialsUuid,
      })
    );

    // return { batches };
  }
);

export const fetchBatchInfo = createAsyncThunk(
  'batch/fetchBatchInfo',
  async ({ batchId }: { batchId: number }) => {
    let batch: IBatch = (await asap().batch.getById(batchId)) as IBatch;
    batch.events = { BatchCreate: null };
    batch.events.BatchCreate = (
      await asap().batch.getRawPastEvents('BatchCreate', {
        batchId: batch.batchId,
      })
    )[0];
    const materialsInfo = await Promise.all(
      batch.materialsUuid.map(
        async (e) => await asap().material.getMaterialByUuid(e)
      )
    );
    const createdTimestamp = (
      await web3Instance().eth.getBlock(batch.events.BatchCreate.blockNumber)
    ).timestamp;
    return {
      batch,
      materialsInfo,
      createdTimestamp,
    };
  }
);
