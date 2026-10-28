/**
 * @description 产品数据
 */
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { FormActions } from '@/components/FormActions';
import { useCbamPageInfo } from '@/views/cbam/ReportForm/Info/context';

import OutsourcedPrecursor from './OutsourcedPrecursor';
import SelfWorkProcedure from './SelfWorkProcedure';
import style from './index.module.less';
import IndustrialProcessFlowDiagram from '../components/IndustrialProcessFlowDiagram';
import SupportFiles from '../components/SupportFiles';
import { OBJECT_TYPE } from '../components/SupportFiles/constant';

interface ProductDataProps {
  /** 下一步方法 */
  onClickNextStep: ({ reportId }: { reportId?: number }) => void;
  /** 返回方法 */
  onClickBack: () => void;
  /** 是否是CBAM跳转 */
  isCbamInfo?: boolean;
}

const ProductData = ({
  onClickNextStep,
  onClickBack,
  isCbamInfo,
}: ProductDataProps) => {
  const { isDetail, id: cbamId } = useCbamPageInfo();

  return (
    <div className={style.wrapper}>
      {/* 自厂工序产品数据 */}
      <SelfWorkProcedure cbamId={cbamId} isDetail={isDetail} />

      {/* 外购前体产品数据 */}
      <OutsourcedPrecursor cbamId={cbamId} isDetail={isDetail} />

      {/* 工业过程流程图 */}
      <IndustrialProcessFlowDiagram cbamId={cbamId} />

      {/* 产品数据证据材料 */}
      <SupportFiles
        showActionBtn={!isDetail}
        objectType={OBJECT_TYPE.PRODUCT_SUPPORT}
        cbamId={cbamId}
        key={`product${OBJECT_TYPE.PRODUCT_SUPPORT}${cbamId}`}
      />

      <FormActions
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.carbonFootPrintLCA.nextStep,
            type: 'primary',
            onClick: async () => {
              onClickNextStep({ reportId: cbamId });
            },
          },
          (!isDetail || isCbamInfo) && {
            title: I18N.Factors.return,
            onClick: async () => {
              onClickBack();
            },
          },
        ])}
      />
    </div>
  );
};

export default ProductData;
