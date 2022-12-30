import LoadingSkeleton from '@components/loading/LoadingSkeleton';
import MaterialCertificatesTable from '@containers/material/components/table/MaterialCertificatesTable';
import { IMaterial } from 'interface';
import asap from 'asap';
import * as React from 'react';
import { useEffect, useState } from 'react';

interface IClientMaterialCertificatesProps {
  material: IMaterial;
}

const ClientMaterialCertificates: React.FunctionComponent<IClientMaterialCertificatesProps> = ({
  material,
}) => {
  const [certificates, setCertificates] = useState(null);
  useEffect(() => {
    (async () => {
      const certificateInstances = await asap().material.assigedCertificates(
        material.materialTokenId
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
            materialTokenID: material.materialTokenId,
          },
          true
        );
        setCertificates((v) => [
          ...(v || []),
          {
            certificate,
            certificateInstance,
            certificateAuthority,
            assignEvent: assignEvents[0],
          },
        ]);
      }
    })();
  }, []);
  if (!certificates) return <LoadingSkeleton />;
  return <MaterialCertificatesTable certificates={certificates} />;
};

export default ClientMaterialCertificates;
