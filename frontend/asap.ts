import { isClient } from '@utils/next';
import config from 'config';
import ASAP from '../library/src/ASAP';
let _asap;
export const initASAP = async (web3, fromAddress = null) => {
	console.log('Init asap with fromAddress = ' + fromAddress);
	_asap = await ASAP.web3Init({
		web3,
		fromAddress: fromAddress,
		factoryContractAddress: config.ethProvider.default.factoryContractAddress,
	});
	if (isClient()) {
		// @ts-ignore
		window._asap = _asap;
	}
};
const asap = (): ASAP => _asap;

export default asap;
