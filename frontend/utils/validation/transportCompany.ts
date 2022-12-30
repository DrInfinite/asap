import { CompanyEntityTypeEnum, EntityTypeEnum } from '@enums';
import asap from 'asap';
import web3Instance from '../../web3Instance';
import * as Yup from 'yup';
export default Yup.string()
  .required('Transport company address is required')
  .trim()
  .test('companyt', 'Transport company does not exist', async (value) => {
    if (!web3Instance().utils.isAddress(value)) return false;
    const company = await asap().company.getCompany(value);
    // return company.entityType === CompanyEntityTypeEnum.LOGISTIC;
    return company.isValue;
  });
