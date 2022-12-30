import { deployedFactoryAddress, provider } from '../provider';
import ASAP from '../../src/ASAP';
import { CompanyEntityTypeEnum } from '../../src/enums';
import Web3 from 'web3';

const createBatch = async (asap: ASAP) => {
  const createResult1 = await asap.material
    .create({
      name: 'product',
      code: '123',
      amountIdentifier: 'kg',
    })
    .send();
  const mintResult1 = await (
    await asap.material.mint({
      materialTokenId: createResult1.events.MaterialCreate.materialTokenId,
      amount: 5,
    })
  ).send();
  const materialsUuid1 = mintResult1.events.MaterialTransfer.map((e) => e.uuid);
  const result1 = await asap.batch.create({
    materialsUuid: [materialsUuid1[1]],
    code: '1',
  }).send();
  return result1.events.BatchCreate.batchId;
};

describe('Company - transport', () => {
  let asap: ASAP;
  let asapReceiver: ASAP;
  let asapTc: ASAP;
  let account: string, otherAccount: string, tcAccount: string;
  let batchId: number;
  let batchId2: number;
  beforeAll(async () => {
    const factoryContractAddress = await deployedFactoryAddress();
    // @ts-ignore
    const accounts = await new Web3(provider).eth.getAccounts();
    [, , , account, otherAccount, tcAccount] = accounts;
    asap = await ASAP.providerInit({
      web3Provider: provider,
      factoryContractAddress,
      fromAddress: account,
    });
    await asap.company
      .create({
        name: 'company',
        entityType: CompanyEntityTypeEnum.MANUFACTURER,
      })
      .send();
    asapReceiver = await ASAP.providerInit({
      web3Provider: provider,
      factoryContractAddress,
      fromAddress: otherAccount,
    });
    await asapReceiver.company
      .create({
        name: 'company',
        entityType: CompanyEntityTypeEnum.MANUFACTURER,
      })
      .send();
    asapTc = await ASAP.providerInit({
      web3Provider: provider,
      factoryContractAddress,
      fromAddress: tcAccount,
    });
    await asapTc.company
      .create({
        name: 'company',
        entityType: CompanyEntityTypeEnum.LOGISTIC,
      })
      .send();
    const createResult = await asap.material
      .create({
        name: 'product',
        code: '123',
        amountIdentifier: 'kg',
      })
      .send();
    const materialTokenId = createResult.events.MaterialCreate.materialTokenId;
    const mintResult = await (
      await asap.material.mint({
        materialTokenId,
        amount: 5,
      })
    ).send();

    const materialsUuid = mintResult.events.MaterialTransfer.map((e) => e.uuid);
    const result1 = await asap.batch.create({
      materialsUuid: [materialsUuid[0]],
      code: '1',
    }).send();
    batchId = result1.events.BatchCreate.batchId;
    const result2 = await asap.batch.create({
      materialsUuid: [materialsUuid[1]],
      code: '1',
    }).send()
    batchId2 = result2.events.BatchCreate.batchId;
  });

  describe('createTransport', () => {
    describe('without password', () => {
      it('creates a new transport', async () => {
        const {
          events: {
            TransportCreated: { transportId },
          },
        } = await asap.transport
          .initiate({
            receiver: otherAccount,
            transportCompany: tcAccount,
            batchIds: [batchId],
          })
          .send();
        const fetchedTransport = await asap.transport.getById(
          transportId
        );
        expect(fetchedTransport.receiver).toEqual(otherAccount);
        expect(fetchedTransport.batchIds).toEqual([batchId]);
      });
    });
    describe('with password', () => {
      it('creates a new transport', async () => {
        const {
          events: {
            TransportCreated: { transportId },
          },
        } = await asap.transport
          .initiate({
            receiver: otherAccount,
            transportCompany: tcAccount,
            batchIds: [batchId],
            password: '1234',
          })
          .send();
        const fetchedTransport = await asap.transport.getById(
          transportId
        );
        expect(fetchedTransport.receiver).toEqual(otherAccount);
        expect(fetchedTransport.transportCompany).toEqual(tcAccount);
        expect(fetchedTransport.batchIds).toEqual([batchId]);
      });
    });
  });
  describe('setTransportStatus', () => {
    it('sets the status of a trasport', async () => {
      const {
        events: {
          TransportCreated: { transportId },
        },
      } = await asap.transport
        .initiate({
          receiver: otherAccount,
          transportCompany: tcAccount,
          batchIds: [batchId],
        })
        .send();
      await asapTc.transport
        .setTransportStatus({
          transportId,
          status: 2,
        })
        .send();
      const fetchedTransport = await asap.transport.getById(transportId);
      expect(fetchedTransport.status).toEqual('2');
    });
    it('thows error if the caller is not the transport company', async () => {
      const {
        events: {
          TransportCreated: { transportId },
        },
      } = await asap.transport
        .initiate({
          receiver: otherAccount,
          transportCompany: tcAccount,
          batchIds: [batchId],
        })
        .send();
      await expect(
        asap.transport
          .setTransportStatus({ transportId, status: 2 })
          .send()
      ).rejects.toThrow();
    });
  });
  describe('finaliseTransport', () => {
    let batchIdTransportId: number;
    beforeAll(async () => {
      const {
        events: {
          TransportCreated: { transportId },
        },
      } = await asap.transport
        .initiate({
          receiver: otherAccount,
          transportCompany: tcAccount,
          batchIds: [batchId],
        })
        .send();
      batchIdTransportId = transportId;
      await asapReceiver.transport
        .finaliseTransport({ transportId })
        .send();
    });
    it('sets the status of a transport as finalised', async () => {
      const fetchedTransport = await asap.transport.getById(
        batchIdTransportId
      );
      expect(fetchedTransport.status).toEqual('5');
    });
    it('changes the owner of the batches', async () => {
      const batchIds = await asapReceiver.batch.allBatchIds();
      expect(batchIds.indexOf(batchId)).not.toEqual(-1);
    });
    it('only the receiver can finalise transport', async () => {
      const {
        events: {
          TransportCreated: { transportId },
        },
      } = await asap.transport
        .initiate({
          receiver: otherAccount,
          transportCompany: tcAccount,
          batchIds: [batchId2],
        })
        .send();

      await expect(
        asapTc.transport.finaliseTransport({ transportId }).send()
      ).rejects.toThrow();
    });
  });
  describe('getById', () => {
    it('gets a transport by id', async () => {
      const {
        events: {
          TransportCreated: { transportId },
        },
      } = await asap.transport
        .initiate({
          receiver: otherAccount,
          transportCompany: tcAccount,
          batchIds: [batchId2],
        })
        .send();
      const fetchedTransport = await asap.transport.getById(transportId);
      expect(fetchedTransport.receiver).toEqual(otherAccount);
      expect(fetchedTransport.batchIds).toEqual([batchId2]);
    });
  });
  describe('all', () => {
    let accountBatchId: number;
    let otherAccountBatchId: number;
    beforeAll(async () => {
      // create a batch from otherAccount
      otherAccountBatchId = await createBatch(asapReceiver);
      //======
      accountBatchId = await createBatch(asap);

      await asap.transport.initiate({
        receiver: otherAccount,
        transportCompany: tcAccount,
        batchIds: [accountBatchId],
      });
      await asapReceiver.transport.initiate({
        receiver: account,
        transportCompany: tcAccount,
        batchIds: [otherAccountBatchId],
      });
    });
    it('returns all transports if no filters are provided', async () => {
      const transports = await asap.transport.all();
      expect(transports.length > 1).toBeTruthy();
    });
    it('filters the transports based on the sender', async () => {
      const transports = await asap.transport.all({
        sender: account,
      });
      expect(transports.map((e) => e.sender)).toEqual(
        Array(transports.length).fill(account)
      );
    });
    it('filters the transports based on the receiver', async () => {
      const transports = await asap.transport.all({
        receiver: account,
      });
      expect(transports.map((e) => e.receiver)).toEqual(
        Array(transports.length).fill(account)
      );
    });
    it('filters the transports based on the transport company', async () => {
      const transports = await asap.transport.all({
        transportCompany: tcAccount,
      });
      expect(transports.map((e) => e.transportCompany)).toEqual(
        Array(transports.length).fill(tcAccount)
      );
    });
    it('returns the batch ids that are in the transport', async () => {
      const transports = await asap.transport.all();
      for (let transport of transports) {
        expect(transport.batchIds.length > 0).toBeTruthy();
      }
    });
  });
  describe('getStatusEvents', () => {
    it('returns all the TransportStatus events emitted', async () => {
      const batchId = await createBatch(asap);
      const {
        events: {
          TransportCreated: { transportId },
        },
      } = await asap.transport
        .initiate({
          receiver: otherAccount,
          transportCompany: tcAccount,
          batchIds: [batchId],
        })
        .send();
      await asapTc.transport
        .setTransportStatus({
          transportId,
          status: 1,
        })
        .send();
      await asapTc.transport
        .setTransportStatus({
          transportId,
          status: 2,
        })
        .send();
      const events = await asap.transport.getStatusEvents(transportId);
      expect(events[0].status).toEqual('2');
      expect(events[1].status).toEqual('1');
    });
  });
});
