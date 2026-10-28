import I18N from '@src/lang/I18N';
import { FC } from 'react';

import FactorInfo from '../components/FactorInfo';

const EmissionFactorEdit: FC = () => {
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('emissionId') || undefined;

  return <FactorInfo id={id} title={I18N.components.editingFactors} />;
};

export default EmissionFactorEdit;
