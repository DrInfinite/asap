import asap from 'asap';
import web3Instance from '../../web3Instance';
import * as Yup from 'yup';
export default Yup.string()
  .required('Address is required')
  .trim()
  .test('company', 'Company does not exist', async (value) => {
    if (!web3Instance().utils.isAddress(value)) return false;
    console.log(await asap().company.hasCompany(value));
    return await asap().company.hasCompany(value);
  });
