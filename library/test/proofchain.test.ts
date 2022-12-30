jest.useFakeTimers();
jest.setTimeout(30000);

import ASAP from '../src/ASAP';
import { EMPTY_ADDRESS } from '../src/utils/eth';
import { deployedFactoryAddress, provider, web3 } from './provider';

describe('ASAP', () => {
  it('instantiates a web3 instance with the provided configuration', async () => {
    // const asapInstance = await ASAP.web3Init({
    //   web3,
    //   factoryContractAddress: '',
    // });
    // expect(asapInstance.isInitialised()).toEqual(true);
  });
  it('instantiates a web3 instance from a provider', async () => {
    // const asapInstance = await ASAP.providerInit({
    //   web3Provider: provider,
    //   factoryContractAddress: '',
    //   fromAddress: '',
    // });
    // expect(asapInstance.isInitialised()).toEqual(true);
  });
});
