import asap from 'asap';
import web3Instance from 'web3Instance';
import * as Yup from 'yup';
export default Yup.string()
  .trim()
  .required('Stake is required')
  .test('stake', 'Stake is too small', async (value) => {
    const minimumStake = await asap().certificateAuthority.minimumStake();
    if (web3Instance().utils.toWei(minimumStake, 'ether') < minimumStake) {
      return false;
    }
    return true;
  });
