/**
 * @description 结果解释
 */

import I18N from '@src/lang/I18N';
import { Tabs } from 'antd';
import { compact } from 'lodash-es';
import { useEffect, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { PageEmpty } from '@/components/PageEmpty';
import { usePageInfo } from '@/hooks';
import { Toast } from '@/utils';

import { ContributionAnalysis } from './components/ContributionAnalysis';
import { SensitivityAnalysis } from './components/SensitivityAnalysis';
import { UncertaintyAnalysis } from './components/UncertaintyAnalysis';
import { TAB_OPTIONS, TAB_TYPE } from './constant';
import style from './index.module.less';
import { ImpactAssessmentModal } from '../../components/ImpactAssessmentModal';
import { ProgrammeCards } from '../../components/ProgrammeCards';
import {
  getImpactAssessmentList,
  getVersion,
  postImpactAssessmentListAdd,
  postImpactAssessmentListDelete,
} from '../../service';
import { AssessmentVersionResp, ImpactAssessmentListResp } from '../../type';
import { DataQualityEvaluation } from './components/DataQualityEvaluation';

const {
  CONTRIBUTION_ANALYSIS,
  SENSITIVITY_ANALYSIS,
  UNCERTAINTY_ANALYSIS,
  DATA_QUALITY_EVALUATION,
} = TAB_TYPE;

const ResultsInterpretation = ({
  onPreviousStepClick,
  onBackClick,
  isModelInfo,
}: {
  /** 点击上一步的方法 */
  onPreviousStepClick: () => void;
  /** 返回的方法 */
  onBackClick: () => void;
  /** 是否是环境足迹模型跳转 */
  isModelInfo?: boolean;
}) => {
  /** ****************************************** 左侧评价方案部分 ********************************************************/
  /** 控制评价方案弹窗显隐 */
  const [impactAssessmentOpen, setImpactAssessmentOpen] = useState(false);

  /** 方案列表 */
  const [planList, setPlanList] = useState<ImpactAssessmentListResp[]>([]);

  /** 方案列表刷新标识 */
  const [planListRefreshFlag, setPlanListRefreshFlag] = useState(false);

  /** 方案列表刷新loading */
  const [planListRefreshLoading, setPlanListRefreshLoading] = useState(false);

  /** 方案删除标识 */
  const [planDeletedFlag, setPlanDeletedFlag] = useState(false);

  /** 当前方案列表信息 */
  const [planInfo, setPlanInfo] = useState<ImpactAssessmentListResp>({});

  /** 当前评价方案id */
  const planId = planInfo?.id;

  /** 新增评价方案保存loading */
  const [planAddConfirmLoading, setPlanAddConfirmLoading] = useState(false);

  /** ****************************************** 公共部分 ********************************************************/
  /** 是否是详情  模型id*/
  const { isDetail, id } = usePageInfo();

  /** 当前的Tab */
  const [currentTab, setCurrentTab] = useState<string>(CONTRIBUTION_ANALYSIS);

  /** 版本信息 */
  const [versionInfo, setVersionInfo] = useState<AssessmentVersionResp>();

  /** 初始化 */
  const onInit = () => {
    /** 清空基本信息 */
    setPlanInfo({});
  };

  /** 检测计算版本是否是最新 */
  const checkVersion = () => {
    if (planId) {
      getVersion({ assessmentId: planId }).then(({ data }) => {
        setVersionInfo(data?.data);
      });
    }
  };

  /** ****************************************** 左侧评价方案部分 ********************************************************/
  /** 点击左侧card的方法 */
  const onClickCard = (plan: ImpactAssessmentListResp) => {
    onInit();
    setPlanInfo(plan);
    setPlanDeletedFlag(false);
  };

  /** 打开新增评价方案弹窗的方法 */
  const onAddPlan = () => {
    setImpactAssessmentOpen(true);
  };

  /** 删除评价方案的方法 */
  const onDelete = async (cardId: number) => {
    await postImpactAssessmentListDelete({ id: cardId });
    /** 删除的是当前选中的方案时 */
    if (cardId === planId) {
      onInit();
      setPlanDeletedFlag(true);
    }
    Toast('success', I18N.Factors.deleteSuccessful);
    setPlanListRefreshFlag(!planListRefreshFlag);
  };

  /** 获取方案列表 */
  useEffect(() => {
    if (id) {
      setPlanListRefreshLoading(true);
      getImpactAssessmentList({ modelId: id })
        .then(({ data }) => {
          setPlanList(data?.data);
          if (!planDeletedFlag) {
            setPlanInfo(data?.data?.[0]);
          }
        })
        .finally(() => {
          setPlanListRefreshLoading(false);
        });
    }
  }, [id, planListRefreshFlag]);

  useEffect(() => {
    /** 更新版本信息 */
    checkVersion();
  }, [planId]);

  return (
    <div className={style.wrapper}>
      <div className={style.left}>
        <ProgrammeCards
          loading={planListRefreshLoading}
          planList={planList}
          cardId={planId}
          onClickCard={onClickCard}
          onAddPlan={onAddPlan}
          onDelete={onDelete}
        />
      </div>
      {/* 新增评价方案 */}
      <ImpactAssessmentModal
        open={impactAssessmentOpen}
        confirmLoading={planAddConfirmLoading}
        onCancel={() => {
          setImpactAssessmentOpen(false);
        }}
        onOk={async value => {
          setPlanAddConfirmLoading(true);
          const assessmentValue = {
            ...value,
            modelId: id,
          };
          try {
            await postImpactAssessmentListAdd(assessmentValue);
            setImpactAssessmentOpen(false);
            Toast('success', I18N.Factors.saveSuccessful);
            setPlanListRefreshFlag(!planListRefreshFlag);
          } finally {
            setPlanAddConfirmLoading(false);
          }
        }}
      />
      {planId && !planDeletedFlag ? (
        <div className={style.rightWrapper}>
          <Tabs
            activeKey={currentTab}
            items={TAB_OPTIONS}
            onChange={key => {
              setCurrentTab(key);
            }}
          />
          {/* 贡献度分析 */}
          {currentTab === CONTRIBUTION_ANALYSIS && (
            <ContributionAnalysis
              planInfo={planInfo}
              versionInfo={versionInfo}
              checkVersion={checkVersion}
            />
          )}
          {/* 敏感性分析 */}
          {currentTab === SENSITIVITY_ANALYSIS && (
            <SensitivityAnalysis
              planInfo={planInfo}
              versionInfo={versionInfo}
              checkVersion={checkVersion}
            />
          )}
          {/* 不确定性分析 */}
          {currentTab === UNCERTAINTY_ANALYSIS && (
            <UncertaintyAnalysis
              planInfo={planInfo}
              versionInfo={versionInfo}
              checkVersion={checkVersion}
            />
          )}
          {/* 数据质量评价 */}
          {currentTab === DATA_QUALITY_EVALUATION && (
            <DataQualityEvaluation planInfo={planInfo} />
          )}
        </div>
      ) : (
        <PageEmpty
          description={I18N.carbonFootPrintLCA.pleaseSelectASolution}
        />
      )}

      <FormActions
        className='footWrapper'
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.carbonFootPrintLCA.previousStep,
            onClick: async () => {
              onPreviousStepClick();
            },
          },
          isModelInfo && {
            title: I18N.Factors.return,
            onClick: async () => {
              onBackClick();
            },
          },
        ])}
      />
    </div>
  );
};
export default ResultsInterpretation;
