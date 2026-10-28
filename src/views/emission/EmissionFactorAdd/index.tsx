import I18N from '@src/lang/I18N';
import { FC } from 'react';

import FactorInfo from '../components/FactorInfo';

const EmissionFactorAdd: FC = () => (
  <FactorInfo title={I18N.emission.addNewFactors} />
);

export default EmissionFactorAdd;
