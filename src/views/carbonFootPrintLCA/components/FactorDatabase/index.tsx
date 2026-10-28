/**
 * @description 因子数据库详情
 */

import I18N from '@src/lang/I18N';

import { IconFont } from '@/components/LcaIconFont';

import style from './index.module.less';
import { FactorResp } from './type';

const FactorDatabase = ({ factorInfo }: { factorInfo?: FactorResp }) => {
  const {
    name,
    dataSource,
    productName,
    productInfo,
    productCarbonFootprint,
    factorUnitZ,
    productUnitName,
    systemBoundary,
    timeRepresent,
    areaRepresentName,
    techRepresent,
  } = factorInfo || {};

  return (
    <div className={style.wrap}>
      <div className={style.container}>
        <div className={style.factorTitle}>
          <span className={style.titleMain}>
            <IconFont className={style.icon} icon='icon-paifangyinziku' />
            <span className={style.title}>{name || '-'}</span>
          </span>
          <span className={style.source}>
            {I18N.carbonFootPrintLCA.dataSources2}
            {dataSource || '-'}
          </span>
        </div>
        <div className={style.factorDetailWrap}>
          <div className={style.nameMain}>
            <p className={style.value}>{productName || '-'}</p>
            <p className={style.tag}>{productInfo || '-'}</p>
          </div>
          <div className={style.contentMain}>
            <div className={style.section}>
              <p className={style.value}>
                {factorUnitZ
                  ? `${productCarbonFootprint}${factorUnitZ}`
                  : `${productCarbonFootprint}`}
              </p>
              <p className={style.tag}>
                {I18N.carbonFootPrintLCA.carbonFootprintVerification}
              </p>
            </div>
            <div className={style.section}>
              <p className={style.value}>{productUnitName || '-'}</p>
              <p className={style.tag}>{I18N.carbonFootPrintLCA.productUnit}</p>
            </div>
            <div className={style.section}>
              <p className={style.value}>{systemBoundary || '-'}</p>
              <p className={style.tag}>{I18N.Factors.systemBoundary}</p>
            </div>
          </div>
        </div>
        <div className={style.otherWrap}>
          <p className={style.info}>
            {I18N.carbonFootPrintLCA.timeRepresentativeness2}
            {timeRepresent || '-'}
          </p>
          <p className={style.info}>
            {I18N.carbonFootPrintLCA.geographicalRepresentativeness}
            {areaRepresentName || '-'}
          </p>
          <p className={style.info}>
            {I18N.carbonFootPrintLCA.technicalRepresentativeness}
            {techRepresent || '-'}
          </p>
        </div>
      </div>
    </div>
  );
};
export default FactorDatabase;
