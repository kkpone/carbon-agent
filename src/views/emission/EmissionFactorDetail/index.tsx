import I18N from '@src/lang/I18N';
import { FC } from 'react';

import FactorInfo from '../components/FactorInfo';

const EmissionFactorDetail: FC = () => {
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('emissionId') || undefined;

  return <FactorInfo id={id} disabled title={I18N.router.factorDetails} />;
};

export default EmissionFactorDetail;
