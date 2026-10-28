/**
 * @file 未上线
 */
import I18N from '@src/lang/I18N';
import { useCurrentProduct } from '@src/store/hooks';
import { FC } from 'react';

import style from './style.module.scss';

const OntOrder: FC = () => {
  const [product] = useCurrentProduct();
  return (
    <div className={style.notOrder}>
      <h2>{product?.name || ''} {I18N.notOnline.notYetOnline}</h2>
      <p>{I18N.ModelManagement.contactPhoneNumber}</p>
      <p>{I18N.ModelManagement.emailM}</p>
    </div>
  );
};

export default OntOrder;
