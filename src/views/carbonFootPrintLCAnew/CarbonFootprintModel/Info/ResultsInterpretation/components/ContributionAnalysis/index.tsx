/**
 * @description 贡献度分析
 */
import { ActionType, ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Button, Space } from 'antd';
import { saveAs } from 'file-saver';
import { compact, includes, keyBy } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';

import { REPONSE_CODE } from '@/config';
import { usePageInfo } from '@/hooks';
import { Toast } from '@/utils';
import {
  getContributionAnalysisList,
  getDictEnum,
  getExportAssessment,
  postImpactAssessmentCalc,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/service';
import {
  AssessmentVersionResp,
  ContributionAnalysisNode,
  ImpactAssessmentListResp,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/type';

import CheckboxDropdown from './CheckboxDropdown';
import { contributionAnalysisColumns } from './columns';
import style from './index.module.less';
import { AssessmentTargetOption, ContributionAnalysisProp } from './type';
import { columns } from '../../columns';

interface ContributionAnalysisProps {
  planInfo: ImpactAssessmentListResp;
  versionInfo?: AssessmentVersionResp;
  checkVersion?: () => void;
}

export const ContributionAnalysis = ({
  planInfo,
  versionInfo,
  checkVersion,
}: ContributionAnalysisProps) => {
  // const { locale } = useContext(LocaleContext);

  /** 是否是英文 */
  // const isEn = locale === LocaleType.enUS;

  const { isDetail } = usePageInfo();

  const tableRef = useRef<ActionType>();

  const columnsStateDefault = useMemo(() => keyBy(columns, 'dataIndex'), []);

  /** 计算按钮loading */
  const [calculateLoading, setCalculateLoading] = useState(false);

  /** 是否展示版本提示 */
  const [showVersionTip, setShowVersionTip] = useState(false);

  /** 所有评价指标 */
  const [assessmentTargetOptions, setAssessmentTargetOptions] = useState<
    AssessmentTargetOption[]
  >([]);
  /** 全部的指标项key */
  const allOptionsKeys = compact(
    assessmentTargetOptions?.map(item => item?.value),
  );

  /** 当前选中的评价指标 */
  const [currentAssessmentTarget, setCurrentSelectedKeys] =
    useState<(string | undefined)[]>(allOptionsKeys);

  /** 全选按钮的方法 */
  const onCheckAllChange = (e: { target: { checked: boolean } }) => {
    setCurrentSelectedKeys(e.target.checked ? allOptionsKeys : []);
  };

  /** 选择单个指标项 */
  const onSelectTarget = (newCheckedList: (string | undefined)[]) => {
    setCurrentSelectedKeys(newCheckedList);
  };

  /** 表格数据 */
  const [assessmentDataSource, setAssessmentDataSource] =
    useState<ContributionAnalysisNode>();

  /** 是否是百分比展示 */
  const [showPercent, setShowPercent] = useState(false);

  /** 表格loading */
  const [tableLoading, setTableLoading] = useState(false);

  /** 表格的scroll */
  const handleScroll = () => {
    const colLength =
      currentAssessmentTarget && currentAssessmentTarget?.length
        ? currentAssessmentTarget?.length
        : 0;

    if (colLength < 6) {
      return {
        y: '48vh',
      };
    }

    return {
      x: (colLength + 1) * 220,
      y: '48vh',
    };
  };

  let uniqueId = 1;
  /** 处理列id */
  const generateUniqueId = () =>
    // eslint-disable-next-line no-plusplus
    uniqueId++;
  /** 处理接口数据 */
  const handleDataSource = (apiData?: ContributionAnalysisNode) => {
    if (!apiData) return [];

    const transformValueList = (valueList: ContributionAnalysisNode[]) =>
      valueList.reduce((acc, item) => {
        acc[`${item.assessmentTarget}`] = {
          assessmentTarget: item.assessmentTarget,
          assessmentTargetName: item.assessmentTargetName,
          dataValue: item.dataValue,
          ratio: item.ratio,
        };
        return acc;
      }, {});

    const transformNode = (node: ContributionAnalysisNode) => {
      const result = {
        id: `${generateUniqueId()}contribution`,
        processName: node?.name || '-',
        ...transformValueList(node.valueList || []),
      };

      if (node.children && node.children.length > 0) {
        result.children = node.children.map(child => transformNode(child));
      }

      return result;
    };

    const newNode = transformNode(apiData);

    return [newNode];
  };

  /** 获取评价指标 */
  const getTargetList = async () => {
    if (
      planInfo.assessmentMethod &&
      planInfo?.assessmentTargetList?.split('|')
    ) {
      const { data } = await getDictEnum({
        dictType: 'AssessmentProposal',
        pageNum: 1,
        pageSize: 1000,
        labelValue: planInfo.assessmentMethod,
      });
      const assessmentTargetOption =
        data?.data?.map(item => ({
          label: item.dictLabel,
          value: `${item.sourceType},${item.dictValue}`,
          unit: item.relatedValue,
        })) || [];

      const newAssessmentTargetOption =
        assessmentTargetOption?.filter(item =>
          includes(planInfo?.assessmentTargetList?.split('|'), item.value),
        ) || [];

      setAssessmentTargetOptions(newAssessmentTargetOption);

      setCurrentSelectedKeys(
        compact(newAssessmentTargetOption?.map(item => item?.value)),
      );
    }
  };

  /** 初始化 */
  const onInit = () => {
    /** 重置切换按钮 */
    setShowPercent(false);
    /** 重置表格数据 */
    setAssessmentDataSource(undefined);
  };

  /** 获取贡献度数据 */
  const getTableData = () => {
    if (planInfo?.id) {
      setTableLoading(true);
      getContributionAnalysisList({
        assessmentId: planInfo.id,
      })
        .then(({ data }) => {
          const result = data?.data;
          setShowVersionTip(!!result);
          setAssessmentDataSource(result);
        })
        .finally(() => {
          setTableLoading(false);
        });
    }
  };

  useEffect(() => {
    onInit();
    /** 获取贡献度数据 */
    getTableData();
    /** 获取评价指标 */
    getTargetList();
  }, [planInfo?.id]);

  return (
    <div
      className={style.contributionWrapper}
      key={`contribution${planInfo.id}`}
    >
      <div className={style.titleHeader}>
        <CheckboxDropdown
          key={`selectTarget${planInfo.id}`}
          options={compact(assessmentTargetOptions)}
          currentSelectedKeys={currentAssessmentTarget}
          onCheckAllChange={onCheckAllChange}
          onSelectTarget={onSelectTarget}
        />
        {!isDetail && (
          <Space>
            <Button
              type='primary'
              onClick={() => {
                setShowPercent(!showPercent);
              }}
            >
              {showPercent
                ? I18N.carbonFootPrintLCA.switchNumericalDisplay
                : I18N.carbonFootPrintLCA.switchingPercentage}
            </Button>
            <Button
              key='contributionExport'
              onClick={() => {
                if (planInfo?.id) {
                  getExportAssessment({ id: planInfo?.id }).then(({ data }) => {
                    if (data.data) {
                      saveAs(data.data);
                    }
                  });
                }
              }}
            >
              {I18N.carbonFootPrintLCA.exportContribution}
            </Button>
            <Button
              type='primary'
              key='calculation'
              loading={calculateLoading}
              onClick={async () => {
                setCalculateLoading(true);
                if (planInfo?.id) {
                  try {
                    const { data } = await postImpactAssessmentCalc({
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
                      /** 更新版本信息 */
                      checkVersion?.();
                      /** 更新表格数据 */
                      getTableData();
                    }
                  } finally {
                    setCalculateLoading(false);
                  }
                }
              }}
            >
              {I18N.carbonFootPrintLCA.planCalculation}
            </Button>
          </Space>
        )}
      </div>

      {showVersionTip && (
        <div>
          {versionInfo?.assessmentLatest ? (
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

      {/* 表格部分 */}
      <div className={style.tableWrapper}>
        <ProTable<ContributionAnalysisProp>
          columns={contributionAnalysisColumns({
            currentAssessmentTargetKeys: compact(currentAssessmentTarget),
            assessmentTargetOptions,
            showPercent,
          })}
          key={`contributionTable${planInfo.id}`}
          loading={tableLoading}
          actionRef={tableRef}
          pagination={false}
          search={false}
          expandable={{
            defaultExpandedRowKeys: ['1contribution'],
          }}
          bordered
          scroll={handleScroll()}
          style={{ width: '100%', maxWidth: 'calc(100vw - 410px)' }}
          rowClassName={(_, index) =>
            index === 0 ? `${style['fixed-first-row']}` : ''
          }
          columnsState={{
            persistenceKey: 'ContributionAnalysis',
            persistenceType: 'localStorage',
            defaultValue: columnsStateDefault,
          }}
          rowKey='id'
          toolBarRender={false}
          dataSource={handleDataSource(assessmentDataSource)}
        />
      </div>
    </div>
  );
};
