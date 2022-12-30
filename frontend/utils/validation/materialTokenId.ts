import asap from 'asap';
import * as Yup from 'yup';
export default Yup.number()
  .required('Material id is required')
  .test(
    'materialTokenId',
    'Material token id does not exist',
    function (value) {
      return new Promise((resolve, reject) => {
        asap()
          .material.getById(value)
          .then((e) => {
            resolve(!!e);
          })
          .catch(() => {
            resolve(false);
          });
      });
    }
  );
