/**
 * @description 敏感性分析
 */
import {
  ActionType,
  LightFilter,
  ProFormInstance,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Button } from 'antd';
import { includes, keyBy } from 'lodash-es';
import { useContext, useMemo, useRef, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { REPONSE_CODE } from '@/config';
import { usePageInfo } from '@/hooks';
import { Toast } from '@/utils';
import {
  getDictEnum,
  getSensibilityAnalysisList,
  postSensibilityCalc,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/service';
import {
  AssessmentVersionResp,
  ImpactAssessmentListResp,
  SensibilityAnalysisListResp,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/type';

import { sensitivityAnalysisColumns } from './columns';
import style from './index.module.less';
import { columns } from '../../columns';

interface SearchFormType {
  assessmentTarget?: string;
}

interface SensitivityAnalysisProps {
  planInfo: ImpactAssessmentListResp;
  versionInfo?: AssessmentVersionResp;
  checkVersion?: () => void;
}

export const SensitivityAnalysis = ({
  planInfo,
  versionInfo,
  checkVersion,
}: SensitivityAnalysisProps) => {
  const { locale } = useContext(LocaleContext);

  /** 是否是英文 */
  const isEn = locale === LocaleType.enUS;

  const { isDetail } = usePageInfo();

  const tableRef = useRef<ActionType>();

  const columnsStateDefault = useMemo(() => keyBy(columns, 'dataIndex'), []);

  /** 敏感性分析选择表单 */
  const sensitivityForm = useRef<ProFormInstance>();

  /** 当前评价指标 */
  const [currentAssessmentTarget, setCurrentAssessmentTarget] =
    useState<string>();

  /** 计算按钮loading */
  const [calculateLoading, setCalculateLoading] = useState(false);

  /** 是否展示版本提示 */
  const [showVersionTip, setShowVersionTip] = useState(false);

  return (
    <div className={style.sensitivityWrapper} key={`sensitivity${planInfo.id}`}>
      <div className={style.titleHeader}>
        <LightFilter<SearchFormType> formRef={sensitivityForm}>
          <div className={style.filter}>
            <span>{I18N.carbonFootPrintLCA.selectionEvaluationIndex2}</span>
            <ProFormSelect
              width={400}
              allowClear={false}
              name='assessmentTarget'
              placeholder={I18N.Factors.pleaseSelect}
              params={{
                id: planInfo.id,
                assessmentMethod: planInfo.assessmentMethod,
                currentTargetArr: planInfo?.assessmentTargetList?.split('|'),
              }}
              request={async (params: {
                assessmentMethod: string;
                currentTargetArr?: string[];
              }) => {
                const { assessmentMethod, currentTargetArr } = params || {};
                if (assessmentMethod && currentTargetArr) {
                  const { data } = await getDictEnum({
                    dictType: 'AssessmentProposal',
                    pageNum: 1,
                    pageSize: 1000,
                    labelValue: assessmentMethod,
                  });
                  const assessmentTargetOption =
                    data?.data?.map(item => ({
                      label: isEn ? item.dictLabelLanguage : item.dictLabel,
                      value: `${item.sourceType},${item.dictValue}`,
                      unit: item.relatedValue,
                    })) || [];
                  const newAssessmentTargetOption =
                    assessmentTargetOption?.filter(item =>
                      includes(currentTargetArr, item.value),
                    );

                  const defaultValue = newAssessmentTargetOption?.[0]?.value;
                  setCurrentAssessmentTarget(defaultValue);
                  sensitivityForm?.current?.setFieldValue(
                    'assessmentTarget',
                    defaultValue,
                  );

                  return newAssessmentTargetOption;
                }
                return [];
              }}
              onChange={(v: string) => {
                setCurrentAssessmentTarget(v);
              }}
            />
          </div>
        </LightFilter>
        {!isDetail && (
          <Button
            type='primary'
            key='calculation'
            loading={calculateLoading}
            onClick={async () => {
              setCalculateLoading(true);
              if (planInfo?.id) {
                try {
                  const { data } = await postSensibilityCalc({
                    id: planInfo?.id,
                  });
                  if (data?.code === REPONSE_CODE.SUCCESS_TOAST) {
                    Toast(
                      'error',
                      I18N.carbonFootPrintLCA.calculationErrorPlease,
                    );
                  } else {
                    Toast(
                      'success',
                      I18N.carbonFootPrintLCA.calculationCompleted,
                    );
                    tableRef?.current?.reloadAndRest?.();
                    /** 更新版本信息 */
                    checkVersion?.();
                  }
                } finally {
                  setCalculateLoading(false);
                }
              }
            }}
          >
            {I18N.carbonFootPrintLCA.planCalculation}
          </Button>
        )}
      </div>

      {showVersionTip && (
        <div>
          {versionInfo?.sensibilityLatest ? (
            <div className={style.successTip}>
              {I18N.carbonFootPrintLCA.currentCalculationResult}
            </div>
          ) : (
            <div className={style.warnTip}>
              {I18N.carbonFootPrintLCA.noteDetectionOfMold}
            </div>
          )}
        </div>
      )}

      <div className={style.tableWrapper}>
        <ProTable<SensibilityAnalysisListResp>
          columns={sensitivityAnalysisColumns()}
          actionRef={tableRef}
          pagination={false}
          search={false}
          key={`sensitivityTable${planInfo.id}`}
          scroll={{ y: '45vh' }}
          columnsState={{
            persistenceKey: 'SensitivityAnalysis',
            persistenceType: 'localStorage',
            defaultValue: columnsStateDefault,
          }}
          toolBarRender={false}
          params={{
            assessmentId: planInfo?.id,
            assessmentTarget: currentAssessmentTarget,
          }}
          request={async params => {
            const { assessmentId, assessmentTarget } = params || {};
            if (assessmentId && assessmentTarget) {
              return getSensibilityAnalysisList({
                assessmentId,
                assessmentTarget,
              }).then(({ data }) => {
                setShowVersionTip(!!(data?.data && data?.data?.length));
                return {
                  data: data?.data || [],
                  success: true,
                };
              });
            }
            return { data: [], success: true };
          }}
        />
      </div>
    </div>
  );
};
