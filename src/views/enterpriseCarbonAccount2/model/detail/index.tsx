import useUrlState from '@ahooksjs/use-url-state';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { FullscreenModal } from '@src/components/FullscreenModal';
import { StepTabs } from '@src/components/StepTabs';
import type { Item } from '@src/components/StepTabs';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { PageInfoType } from '@src/router/type';
import { isUndefined } from 'lodash-es';
import { useHistory } from 'react-router-dom';

import { BaseInfo } from './BaseInfo';
import { FillData } from './FillData';
import styles from './index.module.less';
import { StepType } from './type';

const BackNode = () => {
  const history = useHistory();
  return (
    <div
      onClick={() => {
        history.push(
          RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountModelList,
        );
      }}
      className={styles.back}
    >
      <ArrowLeftOutlined />
      <span className={styles.text}>
        {I18N.carbonFootprint.accountingModel}
      </span>
    </div>
  );
};

const Accounting = () => {
  const [searchParams, setSearchParams] = useUrlState<{
    modelId?: string;
    step?: StepType;
    pageType?: PageInfoType;
  }>({
    step: StepType.baseInfo,
    pageType: PageInfoType.add,
  });
  const { modelId, step } = searchParams;

  const isShow = searchParams.pageType === PageInfoType.show;
  const isEdit = searchParams.pageType === PageInfoType.edit;

  const changeStep = (currentStep: StepType) => {
    setSearchParams({
      ...searchParams,
      step: currentStep,
    });
  };

  const items: Item[] = [
    {
      label: I18N.carbonFootprint.basicInformation,
      content: (
        <BaseInfo
          modelId={modelId}
          isShow={isShow}
          isEdit={isEdit}
          nextStep={id => {
            setSearchParams({
              ...searchParams,
              modelId: id || modelId,
              step: StepType.fillData,
              pageType: isShow ? PageInfoType.show : PageInfoType.edit,
            });
          }}
        />
      ),
      key: StepType.baseInfo.toString(),
    },
    {
      label: I18N.enterpriseCarbonAccount2.buildAReportingTemplate,
      content: (
        <FillData
          isShow={isShow}
          modelId={modelId}
          backStep={() => changeStep(StepType.baseInfo)}
        />
      ),
      key: StepType.fillData.toString(),
      disabled: isUndefined(modelId),
    },
  ];
  return (
    <FullscreenModal>
      <StepTabs
        leftNode={BackNode()}
        currentStep={Number(step)}
        items={items}
        onChange={changeStep}
      />
    </FullscreenModal>
  );
};

export default Accounting;
