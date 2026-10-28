/**
 * @description: 结果解释-数据质量评价
 */

import { ActionType, ProTable } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, Select } from 'antd';
import { includes, keyBy } from 'lodash-es';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { usePageInfo } from '@/hooks';
import I18N, { LocaleType } from '@/lang/I18N';
import { Toast } from '@/utils';
import {
  getDataQualityCalc,
  getDataQualityCalcProcess,
  getDataQualityList,
  getDictEnum,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/service';
import {
  AssessmentDataQualityProgressResp,
  AssessmentDataQualityResp,
  DictEnumResp,
  ImpactAssessmentListResp,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/type';
import { useLcaEnums } from '@/views/carbonFootPrintLCAnew/hook';

import ImportRating from './ImportRating';
import { QualityEvaluationStandardsModal } from './QualityEvaluationStandardsModal';
import { RateModel } from './RateModel';
import { columns } from './columns';
import { STANDARDS_TYPE } from './constant';
import style from './index.module.less';

const { EU_BATTERY_LAW } = STANDARDS_TYPE;

interface DataQualityEvaluationProps {
  planInfo: ImpactAssessmentListResp;
}
export function DataQualityEvaluation({
  planInfo,
}: DataQualityEvaluationProps) {
  const { locale } = useContext(LocaleContext);
  /** 是否是英文 */
  const isEn = locale === LocaleType.enUS;
  const { isDetail } = usePageInfo();
  const tableRef = useRef<ActionType>();

  const columnsStateDefault = useMemo(() => keyBy(columns, 'dataIndex'), []);

  /** 方法和标准的枚举 */
  const standardsOption = useLcaEnums('DataQualityCategory');

  /** 环境指标枚举 */
  const [assessmentProposalOption, setAssessmentProposalOption] =
    useState<DictEnumResp[]>();

  /** 当前选择方法和标准类型 */
  const [stardardType, setStardardType] = useState<number>(EU_BATTERY_LAW);

  /** 当前选择的环境指标 */
  const [environmentalIndicators, setEnvironmentalIndicators] =
    useState<string>();

  /** 控制数据质量评级标准的弹窗 */
  const [open, setOpen] = useState(false);

  /** 控制评级弹窗的显隐 */
  const [rateOpen, setRateOpen] = useState(false);

  /** 评级类型 */
  const [rateType, setRateType] = useState<number>();

  /** 点击评级数据质量评价数据 */
  const [dataQualityEvaluationData, setDataQualityEvaluationData] =
    useState<AssessmentDataQualityResp>();

  /** 计算进度信息 */
  const [calcProcessInfo, setCalcProcessInfo] =
    useState<AssessmentDataQualityProgressResp>();

  /** 计算按钮loading */
  const [loading, setLoading] = useState<boolean>(false);

  /** 控制导入评分弹窗的显隐 */
  const [importRatingOpen, setImportRatingOpen] = useState<boolean>(false);

  /** 获取环境指标的枚举 */
  useEffect(() => {
    const { assessmentMethod, assessmentTargetList } = planInfo || {};
    const currentTargetArr = assessmentTargetList?.split('|');
    if (assessmentMethod && currentTargetArr) {
      getDictEnum({
        dictType: 'AssessmentProposal',
        pageNum: 1,
        pageSize: 1000,
        labelValue: assessmentMethod,
      }).then(({ data }) => {
        const result =
          data?.data?.map(item => ({
            label: isEn ? item.dictLabelLanguage : item.dictLabel,
            value: `${item.sourceType},${item.dictValue}`,
            unit: item.relatedValue,
          })) || [];
        const newAssessmentTargetOption = result?.filter(item =>
          includes(currentTargetArr, item.value),
        );
        const defaultValue = newAssessmentTargetOption?.[0]?.value;
        setEnvironmentalIndicators(defaultValue);
        setAssessmentProposalOption(newAssessmentTargetOption);
      });
    }
  }, [planInfo]);

  /** 更新计算进度 */
  const handleDataQualityCalcProcess = async () => {
    /** 获取数据质量评价计算进度 */
    const { data } = await getDataQualityCalcProcess({
      id: planInfo?.id || 0,
    });
    setCalcProcessInfo(data?.data);
    return data?.data;
  };

  const { run, cancel } = useRequest(handleDataQualityCalcProcess, {
    pollingInterval: 5000,
    pollingWhenHidden: false,
    manual: true,
  });

  useEffect(() => {
    if (calcProcessInfo) {
      const { errorFlag, calculating } = calcProcessInfo || {};
      if (errorFlag) {
        cancel();
        Toast('error', I18N.carbonFootPrintLCA.calculationErrorPlease);
        setCalcProcessInfo(undefined);
        setLoading(false);
        return;
      }
      if (calculating) {
        run();
      } else {
        cancel();
        Toast('success', I18N.carbonFootPrintLCA.calculationCompleted);
        tableRef?.current?.reload?.();
        setCalcProcessInfo(undefined);
        setLoading(false);
      }
    }
  }, [calcProcessInfo]);

  /** 点击评级按钮 */
  const onRate = (type?: number, data?: AssessmentDataQualityResp) => {
    setRateOpen(true);
    setRateType(type);
    setDataQualityEvaluationData(data);
  };

  /** 数据质量评价初始化 */
  const dataQualityCloseInit = () => {
    setRateOpen(false);
    setRateType(undefined);
    setDataQualityEvaluationData(undefined);
  };
  return (
    <div className={style.dataQualityEvaluationWrapper}>
      <div className={style.calcResultButtonWrapper}>
        {!isDetail && (
          <div className={style.calcResultButtonBox}>
            <Button
              type='primary'
              className={style.calcResultButton}
              onClick={() => setImportRatingOpen(true)}
            >
              {I18N.carbonFootPrintLCA.importRating}
            </Button>
            <Button
              loading={loading}
              className={style.calcResultButton}
              onClick={() => {
                if (!planInfo?.id) {
                  return;
                }
                // 开始计算数据
                setLoading(true);

                getDataQualityCalc({ id: planInfo?.id }).catch(() =>
                  setLoading(false),
                );
                run();
              }}
            >
              {I18N.dashborad.identificationResults}
            </Button>
          </div>
        )}
      </div>

      <div className={style.header}>
        <Button type='link' onClick={() => setOpen(true)}>
          {I18N.carbonFootPrintLCA.dataQualityAssessment}
        </Button>
        <div className={style.searchBox}>
          {/* 方法和标准 */}
          <Select
            className={style.selectItem}
            value={stardardType}
            placeholder={I18N.Factors.pleaseSelect}
            fieldNames={{ label: 'name', value: 'code' }}
            options={standardsOption}
            onChange={value => {
              setStardardType(value);
            }}
          />
          {/* 环境指标 */}
          <Select
            className={style.select}
            value={environmentalIndicators}
            placeholder={I18N.Factors.pleaseSelect}
            options={assessmentProposalOption}
            onChange={value => {
              setEnvironmentalIndicators(value);
            }}
          />
        </div>
      </div>
      <ProTable
        actionRef={tableRef}
        columns={columns({
          isDetail,
          stardardType,
          onRate,
        })}
        pagination={false}
        search={false}
        rowKey='sourceCode'
        columnsState={{
          persistenceKey: 'DataList',
          persistenceType: 'localStorage',
          defaultValue: columnsStateDefault,
        }}
        toolBarRender={false}
        params={{
          assessmentId: planInfo?.id,
          assessmentTarget: environmentalIndicators,
          dataQualityCategory: stardardType,
        }}
        scroll={{
          y: 'calc(100vh - 475px)',
        }}
        request={async params => {
          const {
            assessmentId = 0,
            assessmentTarget,
            dataQualityCategory,
          } = params || {};
          if (!assessmentId || !assessmentTarget || !dataQualityCategory) {
            return {
              data: [],
              success: true,
            };
          }
          return getDataQualityList({
            assessmentId,
            assessmentTarget,
            dataQualityCategory,
          }).then(({ data }) => ({
            data: data?.data?.map(item => ({
              ...item,
              children:
                item?.ioList && item?.ioList?.length > 0
                  ? item.ioList
                  : undefined,
            })),
            success: true,
          }));
        }}
      />
      {/* 数据质量评级标准 */}
      <QualityEvaluationStandardsModal
        stardardType={stardardType}
        open={open}
        handleCancel={() => setOpen(false)}
      />
      {/* 评级弹窗 */}
      <RateModel
        assessmentId={planInfo?.id}
        assessmentTarget={environmentalIndicators}
        dataQualityCategory={stardardType}
        dataQualityEvaluationData={dataQualityEvaluationData}
        open={rateOpen}
        rateType={rateType}
        handleOk={() => {
          dataQualityCloseInit();
          tableRef?.current?.reload();
        }}
        handleCancel={() => dataQualityCloseInit()}
      />
      {/* 导入评分弹窗 */}
      <ImportRating
        assessmentId={planInfo?.id}
        dataQualityCategory={stardardType}
        open={importRatingOpen}
        handleCancel={() => setImportRatingOpen(false)}
      />
    </div>
  );
}
