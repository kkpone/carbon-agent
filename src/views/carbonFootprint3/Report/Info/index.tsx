/*
 * @@description: 报告 详情、编辑、新增
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-14 15:56:05
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-20 17:12:25
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-20 10:12:34
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-20 11:55:55
 */
import {
  DownOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Text } from '@components/FormilyUtil/util';
import {
  ArrayTable,
  Cascader,
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  Radio,
  FormTab,
  NumberPicker,
} from '@formily/antd-v5';
import {
  Field,
  Form,
  FormPathPattern,
  createForm,
  onFieldChange,
  onFieldInputValueChange,
  onFieldReact,
  onFieldValueChange,
} from '@formily/core';
import { FormConsumer, createSchemaField } from '@formily/react';
import { isEmpty } from '@formily/shared';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { Table } from '@src/components/Table';
import { ModalBase } from '@src/components/UI/Modal';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { PageInfoType } from '@src/router/type';
import {
  GET4bdb60212ecd4780fdc01e40cb88a353,
  GET8981b14f7dda355705d81c48f17aa226,
  POST78bcf124777efe639e8c76d0c6aea265,
  POSTfdf3917ac048472511d90e1110fbcb73,
  Report,
} from '@src/sdks_v2/footprint3V2ApiDocs';
import { changeFactorM2cascaderOptions, tryParseJSON } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { Radio as AntdRadio, Button, Modal, Spin, Tooltip } from 'antd';
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { streamFetch } from '@/api/streamFetch';

import { activityDataColumns, factorColumns } from './columns';
import { activityData, factorDatas, radios } from './datas';
import styles from './index.module.less';
import {
  basicSchema,
  reportMsgSchema,
  dataSchema,
  emissiondataSchema,
  reductionLifeCycleSchema,
  reductionReportIntroSchema,
  reductionReportRestSchema,
} from './schemas';
import { FormSubReportAccountList, Options } from './types';
import { changeData2SelectOptions } from './utils';
import { getAccountingInfo } from '../../FootprintAccount/AccountDetail/AccountInfo/service';
import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION,
  FootprintAccountStatusType,
} from '../../FootprintAccount/constant';
import {
  getAccountProductData,
  getAccountProductInfo,
} from '../../FootprintAccount/service';
import { ProcessBusinessAccountingTableData } from '../../ProcessBusinessAccounting/type';
import TextWidthOverflow from '../../component/TextOverflowTable/byWidth';
import './index.less';
import { COMPARISON_REPORT_TYPE, REPORT_TYPE } from '../../constant';
import { getCommonAccountListData } from '../../service';
import { ProductAccountingList } from '../../FootprintAccount/component/ProductSelectAccount/type';
import {
  getCarbonLabelProductType,
  getReportScope,
  getStageEmissions,
} from './service';

import { apiQueryByCompanyId } from '@src/views/dashborad/organization/services';

import { SelectProductAccount } from '../../component/SelectProductAccount';

import { carbonLabelSchema } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/schema';
import { InputSelect } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/components/InputSelect';
import AIGenerateBtn from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/components/AIGenerateBtn';
import { revalidateFieldFeedback } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/utils/revalidateFieldFeedback';

import { useSelector } from 'react-redux';

import { RootState } from '@/store';

import { useCityInfo } from '@src/hooks/useCityInfo';
import { useAllEnumsBatch } from '@src/hooks';
import { isNil } from 'lodash-es';

import { SaaSCalcUncertainty } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/saasService';
import { activityDataDescMap } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/constant';

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    Cascader,
    FormItem,
    FormLayout,
    FormGrid,
    DatePicker,
    ArrayTable,
    Text,
    Radio,
    FormTab,
    InputSelect,
    NumberPicker,
  },
});

const { REPORT, COMPARE, CARBON_LABEL, REDUCTION } = REPORT_TYPE;

const { TARGET, STANDARD } = COMPARISON_REPORT_TYPE;

const { QUICK, PROCESS } = FootprintAccountStatusType;

/** 根据级联地址数组和城市数据解析出地区名称，默认"中国" */
const resolveGeoName = (
  cityData: any[],
  productionAddressValue?: string[],
): string => {
  if (!productionAddressValue?.length || !cityData.length)
    return I18N.carbonFootprint3.reportAutoFillChina;
  const province = cityData.find(p => p.value === productionAddressValue[0]);
  if (!province) return I18N.carbonFootprint3.reportAutoFillChina;
  if (productionAddressValue.length > 1) {
    const city = (
      province.children as Array<{ value: string; label: string }>
    )?.find(c => c.value === productionAddressValue[1]);
    return city?.label || province.label;
  }
  return province.label;
};

/** 拼接整体描述文本（各句由调用方按当前语言生成） */
const buildOverallDescription = ({
  lifeCycleLine,
  techDesc,
  timeLine,
  geoLine,
}: {
  lifeCycleLine?: string;
  techDesc: string;
  timeLine?: string;
  geoLine: string;
}): string =>
  [lifeCycleLine, techDesc, timeLine, geoLine].filter(Boolean).join('\n');

const AI_COMMON_STRING_FIELDS = ['companyProfile', 'suppose'];
const AI_CARBON_LABEL_EXTRA_FIELDS = [
  'creditCode',
  'legalPerson',
  'companyProfile',
  'verifiedPartyInfo',
  'verifiedPartyAddress',
  'productIntroduction',
  'productImplementStandard',
  'productFunction',
];
const AI_REDUCTION_STRING_FIELDS = ['description', 'suppose'];
const FACTORY_EDITABLE_KEYS = [
  'descs',
  'times',
  'region',
  'technology',
  'datas',
  'methodology',
];
const FACTORY_UNCERTAINTY_KEYS = [
  'times',
  'region',
  'technology',
  'datas',
  'methodology',
];
const STAGE_EMISSION_KEYS = [
  'source',
  'monitorMethod',
  'monitorFrequency',
  'recordFrequency',
  'monitorEquipmentCheck',
  'dataLackDeal',
];

type ReductionStageItem = {
  stage?: number;
  name?: string;
};

type ReductionExtra = {
  stageList?: ReductionStageItem[] | Record<string, ReductionStageItem>;
  targetScence?: string;
  baseScence?: string;
  allAnalysis?: string;
  structureAnalysis?: string;
  potentialAnalysis?: string;
  suggestion?: string;
  [key: string]: unknown;
};

const REDUCTION_STAGE_LEGACY_KEYS = [
  'lifeCycleStageAName',
  'lifeCycleStageBName',
  'lifeCycleStageCName',
  'lifeCycleStageDName',
  'lifeCycleStageEName',
] as const;

const LEGACY_REDUCTION_FIELD_KEYS = [
  'projectIntroduction',
  'projectScenarioSetting',
  'benchmarkScenarioSetting',
  ...REDUCTION_STAGE_LEGACY_KEYS,
  'overallAnalysis',
  'reductionStructureAnalysis',
  'reductionPotentialAnalysis',
  'optimizationSuggestions',
] as const;

const AI_REDUCTION_FIELD_MAP = [
  {
    path: 'description',
    parsedPaths: ['description', 'projectIntroduction'],
  },
  {
    path: 'suppose',
    parsedPaths: ['suppose'],
  },
  {
    path: 'reduceExtra.targetScence',
    parsedPaths: [
      'reduceExtra.targetScence',
      'reduceExtra.targetScene',
      'targetScence',
      'targetScene',
      'projectScenarioSetting',
    ],
  },
  {
    path: 'reduceExtra.baseScence',
    parsedPaths: [
      'reduceExtra.baseScence',
      'reduceExtra.baseScene',
      'baseScence',
      'baseScene',
      'benchmarkScenarioSetting',
    ],
  },
  {
    path: 'reduceExtra.allAnalysis',
    parsedPaths: ['reduceExtra.allAnalysis', 'allAnalysis', 'overallAnalysis'],
  },
  {
    path: 'reduceExtra.structureAnalysis',
    parsedPaths: [
      'reduceExtra.structureAnalysis',
      'structureAnalysis',
      'reductionStructureAnalysis',
    ],
  },
  {
    path: 'reduceExtra.potentialAnalysis',
    parsedPaths: [
      'reduceExtra.potentialAnalysis',
      'potentialAnalysis',
      'reductionPotentialAnalysis',
    ],
  },
  {
    path: 'reduceExtra.suggestion',
    parsedPaths: [
      'reduceExtra.suggestion',
      'suggestion',
      'optimizationSuggestions',
    ],
  },
];

const REDUCTION_STAGE_CODES = [0, 1, 2, 3, 4] as const;

const getObjectValue = (source: unknown, path: string) => {
  if (!source || typeof source !== 'object') return undefined;

  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
};

const getReductionExtraObject = (reduceExtra: unknown): ReductionExtra => {
  if (!reduceExtra) return {};
  if (typeof reduceExtra === 'string') {
    const parsed = tryParseJSON(reduceExtra);
    return parsed && typeof parsed === 'object'
      ? (parsed as ReductionExtra)
      : {};
  }
  return typeof reduceExtra === 'object' ? (reduceExtra as ReductionExtra) : {};
};

const getReductionStageName = (
  stageList: ReductionExtra['stageList'],
  index: number,
) => {
  if (Array.isArray(stageList)) {
    return stageList[index]?.name ?? '';
  }

  if (stageList && typeof stageList === 'object') {
    return stageList[index]?.name ?? '';
  }

  return '';
};

const normalizeReductionStageList = (stageList: ReductionExtra['stageList']) =>
  REDUCTION_STAGE_CODES.map((stage, index) => ({
    stage,
    name: getReductionStageName(stageList, index),
  }));

const buildReductionExtra = (
  values: Report,
): NonNullable<Report['reduceExtra']> => {
  const reduceExtra = getReductionExtraObject(values.reduceExtra);

  return {
    stageList: normalizeReductionStageList(reduceExtra.stageList),
    targetScence:
      reduceExtra.targetScence ?? values.projectScenarioSetting ?? '',
    baseScence: reduceExtra.baseScence ?? values.benchmarkScenarioSetting ?? '',
    allAnalysis: reduceExtra.allAnalysis ?? values.overallAnalysis ?? '',
    structureAnalysis:
      reduceExtra.structureAnalysis ?? values.reductionStructureAnalysis ?? '',
    potentialAnalysis:
      reduceExtra.potentialAnalysis ?? values.reductionPotentialAnalysis ?? '',
    suggestion: reduceExtra.suggestion ?? values.optimizationSuggestions ?? '',
  };
};

const normalizeReductionReportValues = (report: Report): Report => {
  if (Number(report.type) !== REDUCTION) return report;

  const reduceExtra = getReductionExtraObject(report.reduceExtra);

  return {
    ...report,
    description: report.description ?? report.projectIntroduction,
    reduceExtra: {
      ...reduceExtra,
      stageList: normalizeReductionStageList(reduceExtra.stageList),
      targetScence:
        reduceExtra.targetScence ?? report.projectScenarioSetting ?? '',
      baseScence:
        reduceExtra.baseScence ?? report.benchmarkScenarioSetting ?? '',
      allAnalysis: reduceExtra.allAnalysis ?? report.overallAnalysis ?? '',
      structureAnalysis:
        reduceExtra.structureAnalysis ??
        report.reductionStructureAnalysis ??
        '',
      potentialAnalysis:
        reduceExtra.potentialAnalysis ??
        report.reductionPotentialAnalysis ??
        '',
      suggestion:
        reduceExtra.suggestion ?? report.optimizationSuggestions ?? '',
    },
  };
};

const clearLegacyReductionFields = (report: Report) => {
  LEGACY_REDUCTION_FIELD_KEYS.forEach(key => {
    report[key] = undefined;
  });
};

const clearValidationFeedback = (
  formIns: Form<any>,
  patterns: FormPathPattern[],
) => {
  patterns.forEach(pattern => {
    formIns.clearErrors(pattern);
    formIns.setFieldState(pattern, {
      required: false,
      validateStatus: 'success',
      selfErrors: [],
    });
  });
};

const clearValidationStatus = (
  formIns: Form<any>,
  patterns: FormPathPattern[],
) => {
  patterns.forEach(pattern => {
    formIns.clearErrors(pattern);
    formIns.setFieldState(pattern, {
      validateStatus: 'success',
      selfErrors: [],
    });
  });
};

const REPORT_ONLY_VALIDATION_PATTERNS: FormPathPattern[] = [
  'companyProfile',
  'grid.companyProfile.companyProfile',
  'productionAddress',
  'grid.productionAddress',
  'evaluateProductCategory',
  'grid.evaluateProductCategory',
  'productionProcess',
  'grid.productionProcessDescriptionCol.productionProcess',
  'overallDescription',
  'grid.overallDescriptionCol.overallDescription',
  'reportActivityList.*.*',
  'reportActivityList.*.*.*',
  'reportFactoryList.*.*',
  'reportFactoryList.*.*.*',
];

const REPORT_SUPPOSE_VALIDATION_PATTERNS: FormPathPattern[] = [
  'suppose',
  'grid.grids.suppose',
];

const REPORT_DESCRIPTION_VALIDATION_PATTERNS: FormPathPattern[] = [
  'productionProcess',
  'grid.productionProcessDescriptionCol.productionProcess',
  'overallDescription',
  'grid.overallDescriptionCol.overallDescription',
];

const syncValidationByReportType = (
  formIns: Form<any>,
  reportType?: number,
) => {
  if (Number(reportType) === REPORT) return;

  clearValidationFeedback(formIns, [
    ...REPORT_ONLY_VALIDATION_PATTERNS,
    ...REPORT_SUPPOSE_VALIDATION_PATTERNS,
  ]);
};

const ReportInfo = () => {
  const history = useHistory();
  const { pageInfoType, id, comparisonId } = useParams<{
    pageInfoType: PageInfoType;
    id: string;
    comparisonId: string;
  }>();

  /** 是否只读 */
  const readPretty = useMemo(() => pageInfoType === 'show', [pageInfoType]);

  /** 主要针对于初始执行 - 谁知目标产品数据质量评价 */
  const initEditStatus = useRef<boolean>(false);

  const units = useRef<ProcessBusinessAccountingTableData[]>();

  // 用来判断是否批量选中的回显
  const selectProductAccountStatusRef = useRef(false);

  // 核算类型
  const accountTypeRef = useRef<FootprintAccountStatusType>(QUICK);

  const compareUnits = useRef<ProcessBusinessAccountingTableData[]>();

  const [mainLoading, setMainLoading] = useState(false);
  /** 提交按钮loading */
  const [subBtnLoading, setSubBtnLoading] = useState(false);

  // 选择产品弹框
  const [productModalVisible, setProductModalVisible] = useState(false);

  // 碳足迹报告选中的类型
  const [accountType, setAccountType] =
    useState<FootprintAccountStatusType>(QUICK);

  const [checkedRadio, setcheckedRadio] = useState(Object.keys(radios)[0]);
  const [modalShow, setModalShow] = useState<'activity' | 'factor'>();
  const [lifeCycleExpanded, setLifeCycleExpanded] = useState(true);
  const abortCtrlRef = useRef<AbortController>();
  const [aiLoading, setAiLoading] = useState(false);
  const accountId = useRef<number>();
  const hasSubmitAttemptedRef = useRef(false);
  const onUnitChange = (unitId: number) => {
    const targetUnit = units.current?.find(u => u.id === unitId);
    form.current.setFieldState('.startTime', {
      value: [targetUnit?.startTime, targetUnit?.endTime],
    });
    accountId.current = targetUnit?.id;
    return targetUnit;
  };

  /**
   * 设置核算下拉的每一项node元素
   * @param row 每一项的展示
   * @returns 返回dom元素
   */
  const listNode = (
    row: ProcessBusinessAccountingTableData | ProductAccountingList,
  ): ReactNode => (
    <div className='optionReportNodeMain'>
      <div>
        <TextWidthOverflow width={300} value={row.accountName} />
      </div>

      <div className='optionNodeDate'>
        {row.startTime}
        {I18N.carbonFootprint.to}
        {row.endTime}
      </div>
      <div
        className={`${styles.optionNodeType} ${
          String(row.type) === String(QUICK)
            ? styles.optionNodeTypeQuick
            : styles.optionNodeTypeProcess
        }`}
      >
        {FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION[row.type]}
      </div>
    </div>
  );

  const isReductionReport = (type?: number) => Number(type) === REDUCTION;

  const getReductionQuickAccountParams = (type?: number) =>
    isReductionReport(type) ? { type: QUICK } : {};

  const isCompletedAccount = (
    account: ProcessBusinessAccountingTableData | ProductAccountingList,
  ) => Number(account.accountStatus) === 2;

  const accountOption = (
    account: ProcessBusinessAccountingTableData | ProductAccountingList,
  ) => ({
    label: account?.accountName,
    value: account.id,
    accountName: account?.accountName,
    accountNameNode: listNode(account),
  });

  const compareAccountOption = (
    account: ProcessBusinessAccountingTableData | ProductAccountingList,
  ) => ({
    label: account?.accountName,
    value: account.id,
    compareAccountNameNode: listNode(account),
    compareAccountName: account?.accountName,
  });

  const getAccountInfo = (productId?: number) =>
    GET4bdb60212ecd4780fdc01e40cb88a353({
      pageNum: 1,
      pageSize: 9999,
      productId,
      accountStatus: isReductionReport(form.current.values.type)
        ? 2
        : undefined,
      ...getReductionQuickAccountParams(form.current.values.type),
    }).then(({ data }) => {
      let result =
        ((data?.data as any)?.rows as ProcessBusinessAccountingTableData[]) ||
        [];
      units.current = result;
      const formValue = form.current.values;
      const reportType = formValue.type;
      let compareUnitDataInfo: ProcessBusinessAccountingTableData | undefined;

      // 如果是产品对比报告 并且存在基准产品的功能单位
      if (
        reportType === COMPARE &&
        compareUnits.current &&
        formValue.compareAccountName
      ) {
        compareUnitDataInfo = compareUnits.current?.find(
          u => String(u.id) === String(formValue.compareAccountName),
        );
      }

      if (formValue.compareAccountName) {
        result = result.filter(productAccountNameData => {
          const isId =
            String(productAccountNameData.id) !==
            String(formValue.compareAccountName);

          if (isReductionReport(reportType)) {
            return isId;
          }

          if (compareUnitDataInfo) {
            return (
              isId && productAccountNameData.type === compareUnitDataInfo.type
            );
          }
          return isId;
        });
      }

      form.current.setFieldState('accountName', {
        dataSource: result
          ?.filter(
            account =>
              (Number(reportType) !== CARBON_LABEL ||
                Number(account.type) === 0) &&
              (!isReductionReport(reportType) || isCompletedAccount(account)),
          )
          ?.map(accountOption),
      });
    });

  /**
   * 清空产品数据质量评价
   */
  const restArrayField = () => {
    form.current.setFieldState('*(reportActivityList, reportFactoryList)', {
      value: undefined,
    });
  };

  const clearFormValueByPath = (
    newForm: Form<any>,
    fieldPath?: FormPathPattern,
  ) => {
    if (!fieldPath) return;
    newForm.setFieldState(fieldPath, {
      value: undefined,
      dataSource: undefined,
    });
  };

  const resetBasicInfoValidateFeedback = (formIns: Form<any>) => {
    [
      'productName',
      'accountName',
      'startTime',
      'compareProductName',
      'compareAccountName',
      'compareStartTime',
    ].forEach(path => {
      formIns.clearErrors(path);
      formIns.setFieldState(path, {
        validateStatus: 'success',
        selfErrors: [],
      });
    });
  };

  const cityDataRef = useRef<any[]>([]);

  const form = useRef(
    createForm<Report>({
      readPretty,
      effects: () => {
        onFieldInputValueChange(
          'reportActivityList.*.activityType',
          (field, formIns) => {
            const fieldValue = field.value as number;
            const { index } = field;
            formIns.setValuesIn(
              `reportActivityList.${index}.descs`,
              activityDataDescMap[fieldValue],
            );
          },
        );
        onFieldInputValueChange('type', (field, formIns) => {
          hasSubmitAttemptedRef.current = false;
          formIns.setValues({
            reportAccountList: undefined,
            productName: undefined,
            accountName: undefined,
            startTime: undefined,
            compareAccountName: undefined,
            compareProductName: undefined,
            compareStartTime: undefined,
            description: undefined,
            reduceExtra: undefined,
          });
          resetBasicInfoValidateFeedback(formIns);
          syncValidationByReportType(formIns, field.value as number);
        });
        onFieldValueChange(
          'reportAccountList.*.productName',
          (field, newForm) => {
            const fieldValue = field.value as number;
            const amountFieldPath = field.query('.accountName').take()?.path;
            // 获取功能单位表格路径
            const amountInfoFieldPath = field
              .query('.accountInfoList')
              .take()?.path;
            const specificationFieldPath = field
              .query('.specification')
              .take()?.path;
            const periodTimeFieldPath = field.query('.periodTime').take()?.path;

            // 如果删除了产品 需要将关联的功能单位也去掉
            if (!fieldValue) {
              clearFormValueByPath(newForm, amountFieldPath);
              clearFormValueByPath(newForm, amountInfoFieldPath);
              clearFormValueByPath(newForm, specificationFieldPath);
              clearFormValueByPath(newForm, periodTimeFieldPath);
              return;
            }

            const fieldDataSource = field.dataSource as {
              value: number;
              info: ProcessBusinessAccountingTableData;
            }[];

            const fieldInfo = fieldDataSource.find(
              data => data.info.id === fieldValue,
            );

            if (specificationFieldPath && fieldInfo) {
              newForm.setFieldState(specificationFieldPath, {
                value: fieldInfo?.info?.specification,
              });
            }

            if (!amountFieldPath || !amountInfoFieldPath) return;

            // 获取所有产品的核算信息
            getCommonAccountListData({
              productId: fieldValue,
              pageNum: 1,
              pageSize: 9999,
            }).then(({ data }) => {
              // const formValueReportAccountList: FormSubReportAccountList[] =
              //   newForm.getValuesIn('reportAccountList');
              // const formValueReportAccountListAccounId =
              //   formValueReportAccountList.map(list => list.accountName);
              // const accountNamevalue = newForm.getValuesIn(amountFieldPath);

              const accountList = data.data.rows
                .filter(list => list.type === accountTypeRef.current)
                ?.map(list => ({
                  label: list.accountName,
                  value: list.id,
                  accountName: list.accountName,
                  accountNameNode: listNode(list),
                }));

              newForm.setFieldState(amountFieldPath, {
                dataSource: accountList,
              });

              newForm.setValuesIn(amountInfoFieldPath, data.data.rows);

              // 更换产品后：若仍只有一条且功能单位仍属于新产品，则重新自动写入描述
              if (!readPretty) {
                const reportAccountList = newForm.getValuesIn(
                  'reportAccountList',
                ) as FormSubReportAccountList[];
                const completeItems = reportAccountList?.filter(
                  item => item.productName && item.accountName,
                );
                if (completeItems?.length === 1) {
                  const row = data.data.rows.find(
                    r => r.id === completeItems[0].accountName,
                  );
                  if (row && completeItems[0].productName === fieldValue) {
                    autoFillDescriptions({
                      productId: completeItems[0].productName,
                      endTime: row.endTime,
                      stageObjs: row?.stageObjs,
                    }).catch(() => {
                      /* ignore */
                    });
                  } else {
                    setReportDescriptionValues('', '');
                  }
                } else {
                  setReportDescriptionValues('', '');
                }
              }
            });
          },
        );
        onFieldValueChange(
          'reportAccountList.*.accountName',
          async (field, newForm) => {
            const fieldValue = field.value as number;
            if (fieldValue) {
              // 先获取之前接口获取的核算列表
              const amountInfoList: ProductAccountingList[] = field
                .query('.accountInfoList')
                .get('value');

              if (amountInfoList && amountInfoList.length > 0) {
                const amountInfo = amountInfoList.find(
                  info => info.id === fieldValue,
                );

                // 获取到详细核算信息，隐射规格型号和核算周期
                if (amountInfo) {
                  const periodTimeFieldPath = field
                    .query('.periodTime')
                    .take()?.path;

                  // 规格型号和核算周期
                  if (periodTimeFieldPath) {
                    newForm.setFieldState(periodTimeFieldPath, {
                      value: I18N.template(I18N.carbonFootprint3.amoun, {
                        val1: amountInfo.startTime,
                        val2: amountInfo.endTime,
                      }),
                    });
                  }
                }
              }
            }

            // 可编辑模式下，若只有一条完整产品+核算记录，自动写入生产工艺和整体描述
            if (!readPretty) {
              const reportAccountList = newForm.getValuesIn(
                'reportAccountList',
              ) as FormSubReportAccountList[];
              const completeItems = reportAccountList?.filter(
                item => item.productName && item.accountName,
              );

              if (fieldValue && completeItems?.length === 1) {
                const amountInfoList: ProductAccountingList[] = field
                  .query('.accountInfoList')
                  .get('value');
                const amountInfo = amountInfoList?.find(
                  info => info.id === fieldValue,
                );
                if (completeItems[0].productName) {
                  await autoFillDescriptions({
                    productId: completeItems[0].productName,
                    endTime: amountInfo?.endTime,
                    stageObjs: (amountInfo as any)?.stageObjs,
                  });
                }
              } else {
                setReportDescriptionValues('', '');
              }
            }
          },
        );
        onFieldValueChange('accountName', field => {
          const val = field.value;
          const reportType = form.current.values.type;
          if (isReductionReport(reportType)) {
            return;
          }
          const accountInfo = units.current?.find(u => u.id === val);
          const numberType = Number(accountInfo?.type);
          if (accountInfo && numberType !== accountTypeRef.current) {
            accountTypeRef.current = numberType;
            setAccountType(numberType);
            setMainLoading(true);
            getOptions(true, numberType).then(() => setMainLoading(false));
          }
        });
        onFieldInputValueChange('accountName', async (field, formIns) => {
          const { accountName } = formIns.values;
          if (accountName && !isReductionReport(formIns.values.type)) {
            const { data } = await getStageEmissions({
              accountId: accountName,
            });
            const stageEmissionMap = data.data;
            const stages = [...Object.keys(stageEmissionMap).map(Number)];
            formIns.setValuesIn('stageEmissions.stages', stages);
            stages.forEach(stage => {
              formIns.setValuesIn(
                `stageEmissions.${stage}`,
                stageEmissionMap[stage],
              );
            });
          } else {
            formIns.setValuesIn('stageEmissions.stages', undefined);
          }
        });
        onFieldReact('*.stageEmissions.*(0,1,2,3,4,5)', (field, formIns) => {
          const { accountName } = formIns.values;
          const stages = formIns.getValuesIn('stageEmissions.stages');
          const lifeCycle = Number(field.props.name);
          field.visible =
            !!accountName &&
            Array.isArray(stages) &&
            stages.includes(lifeCycle);
        });
        onFieldReact('reportExtraInfo.productType', field => {
          getCarbonLabelProductType().then(({ data }) => {
            field.setComponentProps({
              options: data.data,
            });
          });
        });
        onFieldChange('accountName', (field, nowForm) => {
          // @ts-ignore    // 类型缺失
          const val = field.value;
          const type = nowForm.getValuesIn('type');
          if (val && type !== REPORT) {
            onUnitChange(val);
            // const targetUnit = onUnitChange(val);
            // if (targetUnit?.id && initEditStatus.current === false) {
            //   getOptions(targetUnit.id, true);
            // }

            // 切换目标产品核算单位类型后要动态设置基准产品核算方式功能单位
            if (type === COMPARE && compareUnits.current) {
              const unitDataInfo = units.current?.find(u => u.id === val);
              const dataSourceFilter = compareUnits.current.filter(
                compareUnitInfo =>
                  compareUnitInfo.type === unitDataInfo?.type &&
                  String(compareUnitInfo.id) !== String(unitDataInfo.id),
              );
              const dataSourceMap = dataSourceFilter.map(account => ({
                label: account?.accountName,
                value: account.id,
                compareAccountNameNode: listNode(account),
                compareAccountName: account?.accountName,
              }));
              nowForm.setFieldState('compareAccountName', {
                dataSource: dataSourceMap,
              });
            }
            if (type === REDUCTION && compareUnits.current) {
              const dataSourceMap = compareUnits.current
                .filter(
                  compareUnitInfo =>
                    isCompletedAccount(compareUnitInfo) &&
                    String(compareUnitInfo.id) !== String(val),
                )
                .map(compareAccountOption);
              nowForm.setFieldState('compareAccountName', {
                dataSource: dataSourceMap,
                value:
                  String(nowForm.getValuesIn('compareAccountName')) ===
                  String(val)
                    ? undefined
                    : nowForm.getValuesIn('compareAccountName'),
              });
            }
          } else if (type === COMPARE && compareUnits.current) {
            // 清空功能单位解除限制
            const dataSourceMap = compareUnits.current.map(account => ({
              label: account?.accountName,
              value: account.id,
              compareAccountNameNode: listNode(account),
              compareAccountName: account?.accountName,
            }));

            nowForm.setFieldState('compareAccountName', {
              dataSource: dataSourceMap,
            });
          } else if (type === REDUCTION && compareUnits.current) {
            const dataSourceMap = compareUnits.current
              .filter(isCompletedAccount)
              .map(compareAccountOption);

            nowForm.setFieldState('compareAccountName', {
              dataSource: dataSourceMap,
            });
          }

          if (!val) {
            form.current.setFieldState('startTime', {
              value: undefined,
            });
          }
        });
        onFieldReact('compareAccountName', (field, nowForm) => {
          // @ts-ignore    // 类型缺失
          const val = field.value;
          const { dataSource } = field as Field;
          const type = nowForm.getValuesIn('type');
          if (val && dataSource?.length > 0) {
            const unitDataInfo = compareUnits.current?.find(u => u.id === val);
            form.current.setFieldState('compareStartTime', {
              value: [unitDataInfo?.startTime, unitDataInfo?.endTime],
            });

            if (type === COMPARE && units.current) {
              const dataSourceFilter = units.current.filter(
                accountUnitInfo =>
                  accountUnitInfo.type === unitDataInfo?.type &&
                  String(accountUnitInfo.id) !== String(val),
              );
              const dataSourceMap = dataSourceFilter.map(account => ({
                label: account?.accountName,
                value: account.id,
                accountName: account?.accountName,
                accountNameNode: listNode(account),
              }));

              nowForm.setFieldState('accountName', {
                dataSource: dataSourceMap,
              });
            }
            if (type === REDUCTION && units.current) {
              const dataSourceMap = units.current
                .filter(
                  accountUnitInfo =>
                    isCompletedAccount(accountUnitInfo) &&
                    String(accountUnitInfo.id) !== String(val),
                )
                .map(accountOption);

              nowForm.setFieldState('accountName', {
                dataSource: dataSourceMap,
                value:
                  String(nowForm.getValuesIn('accountName')) === String(val)
                    ? undefined
                    : nowForm.getValuesIn('accountName'),
              });
            }
          } else if (type === COMPARE && units.current) {
            // 清空功能单位解除限制
            const dataSourceMap = units.current.map(account => ({
              label: account?.accountName,
              value: account.id,
              accountName: account?.accountName,
              accountNameNode: listNode(account),
            }));

            nowForm.setFieldState('accountName', {
              dataSource: dataSourceMap,
            });
          } else if (type === REDUCTION && units.current) {
            const dataSourceMap = units.current
              .filter(isCompletedAccount)
              .map(accountOption);

            nowForm.setFieldState('accountName', {
              dataSource: dataSourceMap,
            });
          }

          if (!val) {
            form.current.setFieldState('compareStartTime', {
              value: undefined,
            });
          }
        });
        onFieldChange('productName', field => {
          // @ts-ignore    // 类型缺失
          const val = field.value;
          if (val) {
            form.current.setFieldState('accountName', {
              readPretty: false,
              value: undefined,
            });
            form.current.setFieldState('startTime', {
              value: undefined,
            });

            getAccountInfo(val);
          } else {
            form.current.setFieldState('accountName', {
              readPretty: true,
              value: undefined,
            });
            form.current.setFieldState('startTime', {
              value: undefined,
            });
          }
        });
        onFieldChange('compareProductName', field => {
          // @ts-ignore    // 类型缺失
          const val = field.value;
          if (val) {
            form.current.setFieldState('compareAccountName', {
              readPretty: false,
              value: undefined,
            });
            form.current.setFieldState('compareStartTime', {
              value: undefined,
            });
            const formValue = form.current.values;

            GET4bdb60212ecd4780fdc01e40cb88a353({
              pageNum: 1,
              pageSize: 9999,
              productId: val,
              accountStatus: isReductionReport(formValue.type) ? 2 : undefined,
              ...getReductionQuickAccountParams(formValue.type),
            }).then(({ data }) => {
              const getAccountInfoData = units.current?.find(u => {
                if (!formValue.accountName) return undefined;
                if (String(u.id) === String(formValue.accountName)) {
                  return u;
                }
                return undefined;
              });
              let result =
                ((data?.data as any)
                  ?.rows as ProcessBusinessAccountingTableData[]) || [];
              compareUnits.current = result;
              if (formValue.accountName) {
                result = result.filter(compareAccountNameData => {
                  if (!getAccountInfoData) return true;

                  if (isReductionReport(formValue.type)) {
                    return (
                      String(compareAccountNameData.id) !==
                      String(formValue.accountName)
                    );
                  }

                  return (
                    String(compareAccountNameData.id) !==
                      String(formValue.accountName) &&
                    getAccountInfoData.type === compareAccountNameData.type
                  );
                });
              }

              form.current.setFieldState('compareAccountName', {
                dataSource: result
                  ?.filter(
                    account =>
                      !isReductionReport(formValue.type) ||
                      isCompletedAccount(account),
                  )
                  ?.map(compareAccountOption),
              });
            });
          } else {
            form.current.setFieldState('compareAccountName', {
              readPretty: true,
              value: undefined,
            });
            form.current.setFieldState('compareStartTime', {
              value: undefined,
            });
          }
        });
        onFieldInputValueChange(
          'reportActivityList.*.activityType',
          (field, formIns) => {
            const { index } = field;
            const activityData = formIns.values.reportActivityList?.[index];
            SaaSCalcUncertainty({
              ...activityData,
              type: 0,
            }).then(res => {
              formIns.setValuesIn(
                `reportActivityList.${index}.uncertain`,
                res.data.data,
              );
            });
          },
        );
        onFieldInputValueChange(
          'reportFactoryList.*.*(times,region,technology,datas,methodology)',
          (field, formIns) => {
            const { index } = field;
            const factoryData = formIns.values.reportFactoryList?.[index];
            const { times, region, technology, datas, methodology } =
              factoryData;
            if (
              !isNil(times) &&
              !isNil(region) &&
              !isNil(technology) &&
              !isNil(datas) &&
              !isNil(methodology)
            ) {
              SaaSCalcUncertainty({
                ...factoryData,
                type: 1,
              }).then(res => {
                formIns.setValuesIn(
                  `reportFactoryList.${index}.uncertain`,
                  res.data.data,
                );
              });
            }
          },
        );
        const syncValidationPatterns = [
          'companyProfile',
          'suppose',
          'productionProcess',
          'overallDescription',
          'description',
          'reduceExtra.stageList.*.name',
          'reduceExtra.targetScence',
          'reduceExtra.baseScence',
          'reduceExtra.allAnalysis',
          'reduceExtra.structureAnalysis',
          'reduceExtra.potentialAnalysis',
          'reduceExtra.suggestion',
          'reportExtraInfo.*',
          'reportExtraInfo.productIndicator',
          'reportExtraInfo.productIndicator.*',
          'reportExtraInfo.productIndicator.*.*',
          'reportActivityList.*.*',
          'reportFactoryList.*.*',
          'stageEmissions.*.*',
          'stageEmissions.*.*.*',
        ] as const;
        syncValidationPatterns.forEach(pattern => {
          onFieldValueChange(pattern, revalidateFieldFeedback);
        });
      },
    }),
  );

  const clearReportDescriptionFeedback = () => {
    if (hasSubmitAttemptedRef.current) return;

    clearValidationStatus(form.current, REPORT_DESCRIPTION_VALIDATION_PATTERNS);
    window.setTimeout(() => {
      if (hasSubmitAttemptedRef.current) return;
      clearValidationStatus(
        form.current,
        REPORT_DESCRIPTION_VALIDATION_PATTERNS,
      );
    }, 0);
  };

  const setReportDescriptionValues = (
    productionProcess: string,
    overallDescription: string,
  ) => {
    form.current.setValuesIn('productionProcess', productionProcess);
    form.current.setValuesIn('overallDescription', overallDescription);
    clearReportDescriptionFeedback();
  };

  const formTab = useMemo(() => FormTab.createFormTab(), []);

  const getOptions = (setDefaultValue?: boolean, type?: number) => {
    const setFieldState = (options: Options) => {
      form.current.setFieldState('*.*.activityType', {
        dataSource: changeData2SelectOptions(options?.activityType),
      });
      form.current.setFieldState('*.*.times', {
        dataSource: changeData2SelectOptions(options?.timeType),
      });
      form.current.setFieldState('*.*.region', {
        dataSource: changeData2SelectOptions(options?.regionType),
      });
      form.current.setFieldState('*.*.technology', {
        dataSource: changeData2SelectOptions(options?.technologyType),
      });
      form.current.setFieldState('*.*.datas', {
        dataSource: changeData2SelectOptions(options?.dataType),
      });
      form.current.setFieldState('*.*.methodology', {
        dataSource: changeData2SelectOptions(options?.methodologyType),
      });
      form.current.setFieldState('*.*.dataType', {
        dataSource: changeData2SelectOptions(options?.reportStage),
      });
    };
    const typeNum = type !== undefined ? type : accountTypeRef.current;

    return getReportScope({ accountType: typeNum }).then(({ data }) => {
      const options = data?.data as Options;
      const { values } = form.current;
      const { accountName, ...restValues } = values || {};
      if (setDefaultValue)
        form.current.setValues(
          {
            ...restValues,
            reportActivityList: options.reportStage.map(d => ({
              ...d,
              // 接口需要字段
              dataType: d.code,
              ...restValues?.reportActivityList?.find(
                v => Number(v.dataType) === d.code,
              ),
            })),
            reportFactoryList: options.reportStage.map(d => ({
              ...d,
              dataType: d.code,
              ...restValues?.reportFactoryList?.find(
                v => Number(v.dataType) === d.code,
              ),
            })),
          },
          // 'overwrite',
        );
      setFieldState(options);
      return options;
    });
  };

  /**
   * @description: 异步获取产品数据源
   * @param {Field} field
   */
  const useAsyncProductDataSource = () => (field: Field) => {
    field.loading = true;
    getAccountProductData({ pageNum: 1, pageSize: 10000 }).then(back => {
      const enumData = back.data.data.rows;
      field.dataSource = enumData.map(data => ({
        label: data.productName,
        value: data.id,
      }));

      field.loading = false;
    });
  };

  /**
   * @description: 产品列表保存
   * @param {Field} field
   */
  const useAsyncProductList = () => (field: Field) => {
    const fieldValue: number | undefined = field?.value;

    getAccountProductData({ pageNum: 1, pageSize: 10000 }).then(back => {
      const enumData = back.data.data.rows;
      field.dataSource = enumData.map(data => ({
        label: data.productName,
        value: data.id,
        info: data,
      }));

      // 编辑进来需要设置功能单位的dataSource 或者 从批量选择中出来的 也可以触发
      if (
        (pageInfoType !== PageInfoType.add && fieldValue) ||
        (selectProductAccountStatusRef.current && fieldValue)
      ) {
        // 获取功能单位表格路径
        const amountFieldPath = field.query('.accountName').take()?.path;
        const amountInfoFieldPath = field
          .query('.accountInfoList')
          .take()?.path;

        // 获取所有产品的核算信息
        getCommonAccountListData({
          productId: fieldValue,
          pageNum: 1,
          pageSize: 9999,
        }).then(({ data }) => {
          const accountList = data.data.rows
            .filter(list => list.type === accountTypeRef.current)
            ?.map(list => ({
              label: list.accountName,
              value: list.id,
              accountName: list.accountName,
              accountNameNode: readPretty ? list.accountName : listNode(list),
            }));

          if (amountFieldPath && amountInfoFieldPath) {
            form.current.setFieldState(amountFieldPath, {
              dataSource: accountList,
            });

            form.current.setValuesIn(amountInfoFieldPath, data.data.rows);
          }
        });
      }
    });
  };

  /**
   * 提交表前校验
   * @param accountId 目标产品
   * @param compareAccountId 基准产品
   */
  const verifyAccountType = (
    willAccountId: number,
    compareAccountId: number,
  ) => {
    const accountInfo = units.current?.find(u => u.id === willAccountId);
    const compareAccountInfo = compareUnits.current?.find(
      u => u.id === compareAccountId,
    );

    if (!accountInfo || !compareAccountInfo) {
      Modal.error({
        title: I18N.carbonFootprint3.errorMessage,
        content: I18N.carbonFootprint3.functionalUnitCore,
      });
      return false;
    }

    if (accountInfo.type !== compareAccountInfo.type) {
      Modal.warning({
        title: I18N.carbonFootprint.prompt,
        content: I18N.carbonFootprint3.targetProductFunction,
      });
      return false;
    }

    return true;
  };

  /**
   * 切换核算类型，动态设置所有功能单位
   * @param accountTypeVal 选中的核算类型，快速和过程
   */
  const changeAccountType = async (accountTypeVal: number) => {
    setMainLoading(true);

    restArrayField();

    // 切换快速和过程 更新底部类型
    await getOptions(true, accountTypeVal);

    // 判断是否先选中有值
    const formValueReportAccountList: FormSubReportAccountList[] =
      form.current.getValuesIn('reportAccountList');

    if (formValueReportAccountList?.length > 0) {
      // 将所有的核算选中先清空

      // form.current.setFieldState('reportAccountList.*.accountName', {
      //   value: undefined,
      // });

      // form.current.setValuesIn('reportAccountList.0.accountName', {
      //   value: undefined,
      // });

      form.current.setFieldState('reportAccountList.*.periodTime', {
        value: undefined,
      });

      // 然后根据选中的核算类型 - 过滤掉dataSource
      formValueReportAccountList.forEach((item, index) => {
        form.current.setValuesIn(
          `reportAccountList.${index}.accountName`,
          undefined,
        );

        if (item.productName) {
          const accountInfoList = form.current.getFieldState(
            `reportAccountList.${index}.accountInfoList`,
          )?.value as ProductAccountingList[];

          const accountList = accountInfoList
            .filter(list => list.type === accountTypeVal)
            ?.map(list => ({
              label: list.accountName,
              value: list.id,
              accountName: list.accountName,
              accountNameNode: listNode(list),
            }));
          form.current.setFieldState(`reportAccountList.${index}.accountName`, {
            dataSource: accountList,
          });
        }
      });
    }

    setAccountType(accountTypeVal);
    accountTypeRef.current = accountTypeVal;
    setMainLoading(false);
  };

  /**
   * 自动填入生产工艺/技术描述和整体描述。
   * 仅对代码内固定句式走 I18N；接口返回的 techDesc、stageName、级联地区 label 等一律原样写入，不做翻译。
   * @param productId 产品ID，用于获取 techDesc
   * @param endTime 核算周期结束时间，用于提取基准年
   * @param stageObjs 生命周期阶段列表
   * @param techDescOverride 直接传入的 techDesc，省略则调接口获取
   */
  const autoFillDescriptions = async ({
    productId,
    endTime,
    stageObjs,
    techDescOverride,
  }: {
    productId: number;
    endTime?: string;
    stageObjs?: Array<{ stageName: string }>;
    techDescOverride?: string;
  }) => {
    let techDesc = techDescOverride || '';
    if (!techDesc) {
      try {
        const detail = await getAccountProductInfo({ id: productId });
        techDesc = detail?.data?.data?.techDesc || '';
      } catch (e) {
        /* ignore */
      }
    }
    const productionAddressValue = form.current.getValuesIn(
      'productionAddress',
    ) as string[] | undefined;
    const geoName = resolveGeoName(cityDataRef.current, productionAddressValue);
    const stageSep = I18N.carbonFootprint3.reportAutoFillStageSeparator;
    const stageNames = stageObjs?.map(s => s.stageName).join(stageSep) || '';
    const lifeCycleLine = stageNames
      ? I18N.template(I18N.carbonFootprint3.reportAutoFillScopeIncludes, {
          val1: stageNames,
        })
      : '';
    const endYear = endTime ? new Date(endTime).getFullYear().toString() : '';
    const timeLine = endYear
      ? I18N.template(I18N.carbonFootprint3.reportAutoFillBaseYear, {
          val1: endYear,
        })
      : '';
    const displayGeo =
      geoName === I18N.carbonFootprint3.reportAutoFillChina
        ? I18N.carbonFootprint3.reportAutoFillChina
        : geoName;
    const geoLine = I18N.template(I18N.carbonFootprint3.reportAutoFillRegion, {
      val1: displayGeo,
    });
    const overallDescription = buildOverallDescription({
      lifeCycleLine,
      techDesc,
      timeLine,
      geoLine,
    });
    setReportDescriptionValues(techDesc, overallDescription);
  };

  /**
   * 选中产品回显
   * @param items 选中的产品
   */
  const selectProductModal = async (items: ProductAccountingList[]) => {
    selectProductAccountStatusRef.current = true;
    const formReportAccountList = form.current.getValuesIn(
      'reportAccountList',
    ) as FormSubReportAccountList[];

    const selectData = items.map(item => ({
      accountName: item.id,
      productName: item.productId,
      periodTime: I18N.template(I18N.carbonFootprint3.items3, {
        val1: item.startTime,
        val2: item.endTime,
      }),
      specification: item.specification,
    }));

    const selectValues = [
      ...(formReportAccountList || []),
      ...(selectData || []),
    ];
    const finalList = selectValues.filter(itemInfo => itemInfo.productName);

    // 只有存在产品名称才会显示
    form.current.setValuesIn('reportAccountList', finalList);
    if (hasSubmitAttemptedRef.current) {
      Promise.all([
        form.current.validate('reportAccountList.*.productName'),
        form.current.validate('reportAccountList.*.accountName'),
      ]).catch(() => undefined);
    }
    setProductModalVisible(false);

    if (!readPretty) {
      // 以落下来的总数量为准：恰好1条才反显，否则清空
      if (finalList.length === 1) {
        // 找到本次选中数据中与唯一一条对应的 ProductAccountingList
        const matchedItem = items.find(
          item =>
            item.productId === finalList[0].productName &&
            item.id === finalList[0].accountName,
        );

        if (matchedItem) {
          // 优先取选中数据自带的 techDesc，没有则调详情接口获取
          const rawTechDesc = (
            matchedItem as unknown as Record<string, unknown>
          ).techDesc;
          await autoFillDescriptions({
            productId: matchedItem.productId!,
            endTime: matchedItem.endTime,
            stageObjs: matchedItem.stageObjs,
            techDescOverride:
              typeof rawTechDesc === 'string' && rawTechDesc
                ? rawTechDesc
                : undefined,
          });
        } else {
          // 唯一一条来自历史选择，无法获取详情，清空字段
          setReportDescriptionValues('', '');
        }
      } else {
        // 总数量为0或超过1条时清空两个字段
        setReportDescriptionValues('', '');
      }
    }
  };

  const isFieldEmpty = (value: unknown) =>
    value === undefined || value === null || value === '';

  const getSelectedReportAccountIds = (values: Report) => {
    const reportAccountList =
      (values.reportAccountList as FormSubReportAccountList[]) || [];

    return Array.from(
      new Set(
        reportAccountList.reduce<number[]>((ids, item) => {
          const selectedAccountId = item?.accountName as unknown;
          if (
            selectedAccountId === undefined ||
            selectedAccountId === null ||
            selectedAccountId === ''
          ) {
            return ids;
          }

          const accountNumber = Number(selectedAccountId);
          if (!Number.isNaN(accountNumber)) {
            ids.push(accountNumber);
          }

          return ids;
        }, []),
      ),
    );
  };

  const resolveAiFillRequest = (values: Report) => {
    const reportType = Number(values.type);
    let accountId: number | undefined;
    let compareAccountId: number | undefined;

    if (reportType === REPORT) {
      const accountIds = getSelectedReportAccountIds(values);
      if (!accountIds.length) return undefined;

      [accountId] = accountIds;
    } else {
      if (isFieldEmpty(values.accountName)) return undefined;

      const selectedAccountId = Number(values.accountName);
      if (Number.isNaN(selectedAccountId)) return undefined;
      accountId = selectedAccountId;

      if ([COMPARE, REDUCTION].includes(reportType)) {
        if (isFieldEmpty(values.compareAccountName)) return undefined;

        const selectedCompareAccountId = Number(values.compareAccountName);
        if (Number.isNaN(selectedCompareAccountId)) return undefined;
        compareAccountId = selectedCompareAccountId;
      }
    }

    const isCompareFill = [COMPARE, REDUCTION].includes(reportType);

    return {
      url: `${process.env.REACT_APP_API_URL}/footprint3/report/${
        isCompareFill ? 'aiRptCompareFill' : 'aiRptFill'
      }`,
      data: {
        accountId,
        type: String(reportType),
        ...(isCompareFill ? { compareAccountId } : {}),
      },
    };
  };

  const shouldShowAiGenerateButton = (values: Report) => {
    if (readPretty) return false;

    const reportType = Number(values.type);
    const hasTargetAccount = !isFieldEmpty(values.accountName);
    const hasCompareAccount = !isFieldEmpty(values.compareAccountName);

    if (reportType === REPORT) {
      return getSelectedReportAccountIds(values).length === 1;
    }

    if (reportType === CARBON_LABEL) return hasTargetAccount;

    if ([COMPARE, REDUCTION].includes(reportType)) {
      return hasTargetAccount && hasCompareAccount;
    }

    return false;
  };

  const getStreamMessageText = (txt: unknown) => {
    if (typeof txt === 'string') return txt;
    if (
      txt &&
      typeof txt === 'object' &&
      'text' in txt &&
      typeof (txt as { text?: unknown }).text === 'string'
    ) {
      return (txt as { text: string }).text;
    }

    return '';
  };

  const setAIValue = (path: string, value: unknown) => {
    form.current.setValuesIn(path, value);
    if (isFieldEmpty(value)) return;

    form.current.clearErrors(path);
    form.current.clearErrors(`${path}.*`);
    form.current.clearErrors(`${path}.*.*`);
    Promise.resolve(form.current.validate(path)).catch(() => undefined);
  };

  const fillAIStringFields = ({
    parsed,
    snapshot,
    fields,
    pathPrefix,
  }: {
    parsed: Record<string, any>;
    snapshot?: Record<string, any>;
    fields: string[];
    pathPrefix?: string;
  }) => {
    fields.forEach(key => {
      if (parsed[key] === undefined || !isFieldEmpty(snapshot?.[key])) return;
      setAIValue(pathPrefix ? `${pathPrefix}.${key}` : key, parsed[key]);
    });
  };

  const getFirstDefinedParsedValue = (
    parsed: Record<string, any>,
    parsedPaths: string[],
  ) => {
    let matchedValue: unknown;
    parsedPaths.some(path => {
      const pathValue = getObjectValue(parsed, path);
      if (pathValue !== undefined) {
        matchedValue = pathValue;
        return true;
      }

      if (parsed[path] !== undefined) {
        matchedValue = parsed[path];
        return true;
      }

      return false;
    });

    return matchedValue;
  };

  const fillReductionFields = (
    parsed: Record<string, any>,
    snapshot: Record<string, any>,
  ) => {
    AI_REDUCTION_FIELD_MAP.forEach(({ path, parsedPaths }) => {
      const parsedValue = getFirstDefinedParsedValue(parsed, parsedPaths);
      if (
        parsedValue === undefined ||
        !isFieldEmpty(getObjectValue(snapshot, path))
      ) {
        return;
      }

      setAIValue(path, parsedValue);
    });
  };

  const fillReportFields = (
    parsed: Record<string, any>,
    snapshot: Record<string, any>,
  ) => {
    const productProcess = getFirstDefinedParsedValue(parsed, [
      'productProcess',
      'productionProcess',
    ]);

    if (
      productProcess === undefined ||
      !isFieldEmpty(snapshot.productionProcess)
    ) {
      return;
    }

    setAIValue('productionProcess', productProcess);
  };

  const fillQualityFactorFields = (
    parsed: Record<string, any>,
    snapshot: Record<string, any>,
    factoryUncertaintyRows: Set<number>,
  ) => {
    if (!Array.isArray(parsed.qualityFactor)) return;

    const snapshotFactoryList = snapshot.reportFactoryList || [];
    parsed.qualityFactor.forEach((aiRow: Record<string, any>) => {
      const rowIndex = snapshotFactoryList.findIndex(
        (row: Record<string, any>) =>
          String(row.dataType) === String(aiRow.dataType),
      );
      if (rowIndex === -1) return;

      const snapshotRow = snapshotFactoryList[rowIndex];
      const nextRow = { ...snapshotRow };
      FACTORY_EDITABLE_KEYS.forEach(key => {
        if (aiRow[key] === undefined || !isFieldEmpty(snapshotRow[key])) return;
        setAIValue(`reportFactoryList.${rowIndex}.${key}`, aiRow[key]);
        nextRow[key] = aiRow[key];
      });

      if (
        factoryUncertaintyRows.has(rowIndex) ||
        !isFieldEmpty(snapshotRow.uncertain) ||
        !FACTORY_UNCERTAINTY_KEYS.every(key => !isNil(nextRow[key]))
      ) {
        return;
      }

      factoryUncertaintyRows.add(rowIndex);
      SaaSCalcUncertainty({
        ...nextRow,
        type: 1,
      }).then(res => {
        const currentUncertain = form.current.getValuesIn(
          `reportFactoryList.${rowIndex}.uncertain`,
        );
        if (!isFieldEmpty(currentUncertain)) return;
        setAIValue(`reportFactoryList.${rowIndex}.uncertain`, res.data.data);
      });
    });
  };

  const isEmptyProductIndicator = (productIndicator: unknown) =>
    !Array.isArray(productIndicator) ||
    productIndicator.length === 0 ||
    productIndicator.every((row: Record<string, any>) =>
      ['name', 'standard', 'indicatorValue'].every(key =>
        isFieldEmpty(row?.[key]),
      ),
    );

  const fillCarbonLabelFields = (
    parsed: Record<string, any>,
    snapshot: Record<string, any>,
    addedStageRows: Set<string>,
  ) => {
    const snapshotExtra = snapshot.reportExtraInfo || {};

    fillAIStringFields({
      parsed,
      snapshot: snapshotExtra,
      fields: AI_CARBON_LABEL_EXTRA_FIELDS,
      pathPrefix: 'reportExtraInfo',
    });

    if (
      Array.isArray(parsed.productIndicator) &&
      isEmptyProductIndicator(snapshotExtra.productIndicator)
    ) {
      setAIValue('reportExtraInfo.productIndicator', parsed.productIndicator);
    }

    const snapshotStageEmissions = snapshot.stageEmissions || {};
    const aiStageEmissions = parsed.stageEmissions;

    if (!aiStageEmissions) return;

    Object.keys(aiStageEmissions).forEach(stage => {
      if (stage === 'stages') return;
      const aiRows = aiStageEmissions[stage];
      if (!Array.isArray(aiRows)) return;
      const snapshotRows = snapshotStageEmissions[stage];

      aiRows
        .filter((aiRow: Record<string, any>) =>
          STAGE_EMISSION_KEYS.every(key => !isFieldEmpty(aiRow[key])),
        )
        .forEach((aiRow: Record<string, any>) => {
          const rowKey = `${stage}_${aiRow.thirdId}`;
          const snapshotIndex = Array.isArray(snapshotRows)
            ? snapshotRows.findIndex(
                (row: Record<string, any>) =>
                  `${row.thirdId}` === `${aiRow.thirdId}`,
              )
            : -1;

          if (snapshotIndex === -1) {
            const currentRows =
              form.current.values.stageEmissions?.[stage] || [];

            if (!addedStageRows.has(rowKey)) {
              addedStageRows.add(rowKey);
              setAIValue(
                `stageEmissions.${stage}.${currentRows.length}`,
                aiRow,
              );
              return;
            }

            const addedIndex = currentRows.findIndex(
              (row: Record<string, any>) =>
                `${row.thirdId}` === `${aiRow.thirdId}`,
            );
            if (addedIndex !== -1) {
              setAIValue(`stageEmissions.${stage}.${addedIndex}`, aiRow);
            }
            return;
          }

          const snapshotRow = snapshotRows[snapshotIndex];
          STAGE_EMISSION_KEYS.forEach(key => {
            if (aiRow[key] === undefined || !isFieldEmpty(snapshotRow[key]))
              return;
            setAIValue(
              `stageEmissions.${stage}.${snapshotIndex}.${key}`,
              aiRow[key],
            );
          });
        });
    });
  };

  const handleAIGenerate = () => {
    if (aiLoading) {
      abortCtrlRef.current?.abort();
      setAiLoading(false);
      return;
    }

    const { values } = form.current;
    const aiFillRequest = resolveAiFillRequest(values);
    if (!aiFillRequest) return;

    const abortCtrl = new AbortController();
    abortCtrlRef.current = abortCtrl;
    setAiLoading(true);

    const snapshot = JSON.parse(JSON.stringify(values));
    const addedStageRows = new Set<string>();
    const factoryUncertaintyRows = new Set<number>();
    let streamText = '';

    streamFetch({
      url: aiFillRequest.url,
      data: aiFillRequest.data,
      onMessage: (txt: unknown) => {
        const messageText = getStreamMessageText(txt);
        if (!messageText) return;

        streamText += messageText;
        const parsed = tryParseJSON(streamText);
        if (!parsed) return;

        const reportType = Number(snapshot.type);

        if (reportType === CARBON_LABEL) {
          fillCarbonLabelFields(parsed, snapshot, addedStageRows);
        } else if (reportType === REDUCTION) {
          fillReductionFields(parsed, snapshot);
          fillAIStringFields({
            parsed,
            snapshot,
            fields: AI_REDUCTION_STRING_FIELDS,
          });
        } else {
          fillAIStringFields({
            parsed,
            snapshot,
            fields: AI_COMMON_STRING_FIELDS,
          });

          if (reportType === REPORT) {
            fillReportFields(parsed, snapshot);
          }
        }

        fillQualityFactorFields(parsed, snapshot, factoryUncertaintyRows);
      },
      abortCtrl,
    })
      .catch(() => undefined)
      .finally(() => {
        setAiLoading(false);
      });
  };

  const renderAIGenerateButton = (
    visibleTypes: number[],
    style?: CSSProperties,
  ) => (
    <FormConsumer>
      {formIns => {
        const { type } = formIns.values;
        if (
          !visibleTypes.includes(Number(type)) ||
          !shouldShowAiGenerateButton(formIns.values)
        ) {
          return '';
        }

        return (
          <AIGenerateBtn
            loading={aiLoading}
            style={{ margin: '16px 0', ...style }}
            onClick={handleAIGenerate}
          />
        );
      }}
    </FormConsumer>
  );

  useEffect(() => {
    // 生成报告 跳转进来
    if (pageInfoType === PageInfoType.add && Number(id) > 0) {
      getAccountingInfo({ id }).then(async accountInfo => {
        const { data } = accountInfo.data;
        form.current.setFieldState('.productName', {
          value: data.productId,
        });
        form.current.setFieldState('.accountName', {
          value: data.id,
        });
        accountId.current = data.id;
        form.current.setFieldState('.startTime', {
          value: [data?.startTime, data?.endTime],
        });
        accountTypeRef.current = data.type;
        setAccountType(data.type);
        getOptions(true, data.type);
        form.current.setValuesIn('reportAccountList', [
          {
            accountName: data.id,
            productName: data.productId,
            periodTime: I18N.template(I18N.carbonFootprint3.data, {
              val1: data.startTime,
              val2: data.endTime,
            }),
            specification: data.specification,
          },
        ]);

        // 自动填入生产工艺/技术描述
        // 获取所有产品的核算信息，同时自动填入描述字段
        getCommonAccountListData({
          productId: data.productId,
          pageNum: 1,
          pageSize: 9999,
        }).then(({ data: backData }) => {
          const accountList = backData.data.rows
            .filter(list => list.type === data.type)
            ?.map(list => ({
              label: list.accountName,
              value: list.id,
              accountName: list.accountName,
              accountNameNode: listNode(list),
            }));
          form.current.setFieldState(`reportAccountList.0.accountName`, {
            dataSource: accountList,
          });
          form.current.setFieldState(`reportAccountList.0.accountInfoList`, {
            value: backData.data.rows,
          });

          const amountInfo = backData.data.rows.find(row => row.id === data.id);
          autoFillDescriptions({
            productId: data.productId,
            endTime: data.endTime,
            stageObjs: (amountInfo as any)?.stageObjs,
          });
        });
      });
    }

    // 新增报告，直接调用
    if (pageInfoType === PageInfoType.add && id === 'null') {
      getOptions(true);
    }

    if (pageInfoType !== PageInfoType.add && Number(id) > 0) {
      setMainLoading(true);
      initEditStatus.current = true;
      GET8981b14f7dda355705d81c48f17aa226({ id: Number(id) }).then(
        async res => {
          const result = res?.data?.data
            ? normalizeReductionReportValues(res.data.data as Report)
            : undefined;
          if (result) {
            accountTypeRef.current = result.accountType;
            setAccountType(result.accountType);

            if (result.type === CARBON_LABEL) {
              await getAccountInfo(result.productId);
            }

            form.current.setValues({
              ...result,
              productName: result.productId,
              accountName: result.accountId,
              reportFactoryList: [],
              reportActivityList: [],
              productionAddress: result.productionAddress
                ? JSON.parse(result.productionAddress)
                : undefined,
              evaluateProductCategory: result.evaluateProductCategory
                ? JSON.parse(result.evaluateProductCategory)
                : undefined,
              reportAccountList: result.reportAccountList?.map(item => ({
                accountName: item.accountId,
                productName:
                  item.productId ??
                  (item.baseType === TARGET
                    ? result.productId
                    : result.compareProductId),
                periodTime:
                  item.startTime || item.endTime
                    ? I18N.template(I18N.carbonFootprint3.items3, {
                        val1: item.startTime,
                        val2: item.endTime,
                      })
                    : undefined,
                specification: item.specification,
              })),
            });

            if (result.stageEmissions) {
              form.current.setValuesIn(
                'stageEmissions.stages',
                Object.keys(result.stageEmissions).map(Number),
              );
              Object.keys(result.stageEmissions).forEach(stage => {
                form.current.setValuesIn(
                  `stageEmissions.${stage}`,
                  result.stageEmissions[stage],
                );
              });
            }
            // 新版本碳足迹报告逻辑
            if (result.type === REPORT || result.type === CARBON_LABEL) {
              getOptions().then(options => {
                // 根据 reportStage 设置 table中的数据
                const reportStageCode = options?.reportStage?.reduce(
                  (tmp, next) => tmp.concat(next.code),
                  [] as number[],
                );
                form.current.setValues({
                  reportFactoryList: result?.reportFactoryList?.filter(d =>
                    reportStageCode.includes(Number(d.dataType)),
                  ),
                  reportActivityList: result?.reportActivityList?.filter(d =>
                    reportStageCode.includes(Number(d.dataType)),
                  ),
                });
                setMainLoading(false);
              });
            } else if (result.reportAccountList || result.type === REDUCTION) {
              const apiReportAccountList = (result.reportAccountList ||
                []) as ProductAccountingList[];
              // 目标产品
              const targetDard = apiReportAccountList.filter(
                item => item.baseType === 0,
              );
              // 基准产品
              const stabDard = apiReportAccountList.filter(
                item => item.baseType === 1,
              );
              const targetInfo = {
                ...(targetDard[0] || {}),
                accountId: targetDard[0]?.accountId ?? result.accountId,
                productId: targetDard[0]?.productId ?? result.productId,
              };
              const standardInfo = {
                ...(stabDard[0] || {}),
                accountId: stabDard[0]?.accountId ?? result.compareAccountId,
                productId: stabDard[0]?.productId ?? result.compareProductId,
              };
              if (
                !targetInfo.accountId ||
                !targetInfo.productId ||
                !standardInfo.accountId ||
                !standardInfo.productId
              ) {
                setMainLoading(false);
                return;
              }
              await getAccountInfo(Number(targetInfo.productId));
              const compareAccountBack =
                await GET4bdb60212ecd4780fdc01e40cb88a353({
                  pageNum: 1,
                  pageSize: 9999,
                  productId: Number(standardInfo.productId),
                  accountStatus: result.type === REDUCTION ? 2 : undefined,
                  ...getReductionQuickAccountParams(result.type),
                });
              let compareAccountList =
                ((compareAccountBack?.data?.data as any)
                  ?.rows as ProcessBusinessAccountingTableData[]) || [];
              compareUnits.current = compareAccountList;
              const targetAccountDetail = units.current?.find(
                item => String(item.id) === String(targetInfo.accountId),
              );
              const standardAccountDetail = compareAccountList.find(
                item => String(item.id) === String(standardInfo.accountId),
              );
              if (result.type === REDUCTION) {
                compareAccountList = compareAccountList.filter(
                  item =>
                    isCompletedAccount(item) &&
                    String(item.id) !== String(targetInfo.accountId),
                );
              } else {
                const targetAccount = units.current?.find(
                  item => String(item.id) === String(targetInfo.accountId),
                );
                compareAccountList = compareAccountList.filter(
                  item =>
                    String(item.id) !== String(targetInfo.accountId) &&
                    (!targetAccount || item.type === targetAccount.type),
                );
              }
              form.current.setFieldState('compareProductName', {
                value: Number(standardInfo.productId),
              });
              form.current.setFieldState('compareAccountName', {
                dataSource: compareAccountList.map(compareAccountOption),
                value: Number(standardInfo.accountId),
              });
              form.current.setFieldState('compareStartTime', {
                value: [
                  standardInfo.startTime || standardAccountDetail?.startTime,
                  standardInfo.endTime || standardAccountDetail?.endTime,
                ],
              });
              form.current.setFieldState('.productName', {
                value: Number(targetInfo.productId),
              });
              form.current.setFieldState('.accountName', {
                value: Number(targetInfo.accountId),
              });
              form.current.setFieldState('.startTime', {
                value: [
                  targetInfo.startTime || targetAccountDetail?.startTime,
                  targetInfo.endTime || targetAccountDetail?.endTime,
                ],
              });
              accountId.current = Number(targetInfo.accountId);

              if (result.type === COMPARE) {
                // 旧版逻辑
                onUnitChange(Number(targetInfo.accountId));
                getOptions().then(options => {
                  // 根据 reportStage 设置 table中的数据
                  const reportStageCode = options?.reportStage?.reduce(
                    (tmp, next) => tmp.concat(next.code),
                    [] as number[],
                  );
                  form.current.setValues({
                    reportFactoryList: result?.reportFactoryList?.filter(d =>
                      reportStageCode.includes(Number(d.dataType)),
                    ),
                    reportActivityList: result?.reportActivityList?.filter(d =>
                      reportStageCode.includes(Number(d.dataType)),
                    ),
                  });
                  setMainLoading(false);
                });
              } else {
                setMainLoading(false);
              }
            }
            initEditStatus.current = false;
            setMainLoading(false);
          }
        },
      );
    }

    // 单独处理对比报告类型
    if (Number(comparisonId) > 0) {
      form.current.setFieldState('type', {
        value: COMPARE,
      });

      getAccountingInfo({ id: comparisonId }).then(accountInfo => {
        const { data } = accountInfo.data;
        form.current.setFieldState('compareProductName', {
          value: data.productId,
        });
        form.current.setFieldState('compareAccountName', {
          value: data.id,
        });
        form.current.setFieldState('compareStartTime', {
          value: [data?.startTime, data?.endTime],
        });
      });
    }
  }, [location.pathname]);

  const cityData = useCityInfo(2);

  useEffect(() => {
    cityDataRef.current = cityData;
    form.current.setFieldState('productionAddress', {
      dataSource: cityData,
    });
  }, [cityData]);

  const productClassificationEnum = useAllEnumsBatch('productClassification');

  useEffect(() => {
    const options = productClassificationEnum?.productClassification;
    if (options) {
      form.current.setFieldState('evaluateProductCategory', {
        dataSource: changeFactorM2cascaderOptions(options),
      });
    }
  }, [productClassificationEnum]);

  const companyUserInfo = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  );
  const companyName = companyUserInfo?.userInfo?.companyName;
  const companyId = companyUserInfo?.userInfo?.companyId;

  useEffect(() => {
    if (pageInfoType === PageInfoType.add && companyId) {
      apiQueryByCompanyId({ id: companyId }).then(res => {
        const area = res?.data?.data?.area;
        if (area) {
          try {
            const parsed: string[] = JSON.parse(area);
            form.current.setFieldState('productionAddress', {
              value: parsed.slice(0, 2),
            });
          } catch (e) {
            // area 格式异常时不做回填
          }
        }
      });
    }
  }, [pageInfoType, companyId]);

  useEffect(() => {
    if (pageInfoType === PageInfoType.add) {
      form.current.setValuesIn('reportExtraInfo.producer', companyName);
      form.current.setValuesIn(
        'reportExtraInfo.produceEnterprise',
        companyName,
      );
    }
  }, [companyName, pageInfoType]);

  return (
    <div className={`${styles.wrapper} reportMain`}>
      <Spin spinning={mainLoading}>
        <FormilyCommon form={form.current}>
          <main>
            <div className={styles.card}>
              <h4 className={styles.title}>
                {I18N.carbonFootprint.basicInformation}
              </h4>
              <SchemaField
                schema={basicSchema({
                  isEdit: pageInfoType === PageInfoType.edit,
                })}
                scope={{ useAsyncProductDataSource, useAsyncProductList }}
              />
              {renderAIGenerateButton([CARBON_LABEL])}
              <SchemaField
                schema={carbonLabelSchema({
                  showProductType: false,
                  productTypePlaceholderVisible: false,
                  visibleReaction: {
                    dependencies: ['type'],
                    fulfill: {
                      state: {
                        componentProps: {
                          style: {
                            display: `{{$deps[0] === ${CARBON_LABEL} ? 'block' : 'none'}}`,
                          },
                        },
                      },
                    },
                  },
                  productTypeReaction: {
                    dependencies: ['type'],
                    fulfill: {
                      schema: {
                        required: `{{$deps[0] == ${CARBON_LABEL}}}`,
                      },
                    },
                  },
                  tableFieldReaction: {
                    dependencies: ['type'],
                    fulfill: {
                      schema: {
                        required: `{{$deps[0] == ${CARBON_LABEL}}}`,
                      },
                    },
                  },
                })}
                scope={{ formTab }}
              />
              <FormConsumer>
                {nowFow => {
                  const { type } = nowFow.values;
                  return (
                    <div className={styles.reportAccountList}>
                      {type === REPORT && (
                        <AntdRadio.Group
                          disabled={readPretty}
                          value={accountType}
                          onChange={e => changeAccountType(e.target.value)}
                        >
                          <AntdRadio.Button value={QUICK}>
                            {I18N.carbonFootprint3.quickAccounting}
                          </AntdRadio.Button>
                          <AntdRadio.Button value={PROCESS}>
                            {I18N.carbonFootprint3.processAccounting}
                          </AntdRadio.Button>
                        </AntdRadio.Group>
                      )}

                      {type === REPORT && !readPretty && (
                        <Button
                          icon={<PlusOutlined />}
                          type='primary'
                          className='m-l-16'
                          onClick={() => setProductModalVisible(true)}
                        >
                          {I18N.carbonFootprint3.batchSelection}
                        </Button>
                      )}
                    </div>
                  );
                }}
              </FormConsumer>
            </div>
            <FormConsumer>
              {form => {
                const { type } = form.values;

                if (type === CARBON_LABEL) {
                  return '';
                }

                if (type === REDUCTION) {
                  return (
                    <div className={styles.card}>
                      <h4 className={styles.title}>
                        {I18N.carbonFootprint3.reportInformation}
                      </h4>
                      {renderAIGenerateButton([REDUCTION])}
                      <SchemaField schema={reductionReportIntroSchema()} />
                      <div className={styles.lifeCycleHeaderGrid}>
                        <div className={styles.lifeCycleHeader}>
                          <div className={styles.lifeCycleTitle}>
                            {I18N.carbonFootprint3.lifeCycleInformation}
                            <Tooltip
                              title={
                                I18N.carbonFootprint3.lifeCycleInformationTip
                              }
                            >
                              <InfoCircleOutlined
                                className={styles.lifeCycleTipIcon}
                              />
                            </Tooltip>
                          </div>
                          <Button
                            type='link'
                            className={styles.lifeCycleToggle}
                            onClick={() => setLifeCycleExpanded(pre => !pre)}
                          >
                            {lifeCycleExpanded
                              ? I18N.carbonFootprint.putItAway
                              : I18N.carbonFootprint.launch}
                            {lifeCycleExpanded ? (
                              <UpOutlined />
                            ) : (
                              <DownOutlined />
                            )}
                          </Button>
                        </div>
                        <div />
                      </div>
                      {lifeCycleExpanded && (
                        <SchemaField schema={reductionLifeCycleSchema()} />
                      )}
                      <SchemaField schema={reductionReportRestSchema()} />
                    </div>
                  );
                }

                return (
                  <>
                    <div className={styles.card}>
                      <h4 className={styles.title}>
                        {I18N.carbonFootprint3.reportInformation}
                      </h4>
                      {renderAIGenerateButton([REPORT, COMPARE])}
                      <SchemaField schema={reportMsgSchema()} />
                    </div>
                    <div className={styles.card}>
                      <FormConsumer>
                        {nowFow => {
                          const { type } = nowFow.values;
                          return (
                            <h4 className={styles.title}>
                              {type === COMPARE
                                ? I18N.carbonFootprint3.target
                                : ''}
                              {I18N.carbonFootprint3.productDataQuality}
                            </h4>
                          );
                        }}
                      </FormConsumer>

                      <div className={styles.activityData}>
                        <span>
                          {type === REPORT && (
                            <span style={{ color: '#ff4d4f', marginRight: 4 }}>
                              *
                            </span>
                          )}
                          {I18N.carbonFootprint3.activityData}
                        </span>
                        <span
                          className={styles.textPrimary}
                          onClick={() => {
                            setModalShow('activity');
                          }}
                        >
                          {I18N.carbonFootprint3.activityDataQuality}
                          <IconFont type='icon-icon-tanhezhaxiangmu' />
                        </span>
                      </div>
                      <SchemaField schema={dataSchema()} />
                      <div className={styles.emissions}>
                        <span>
                          {type === REPORT && (
                            <span style={{ color: '#ff4d4f', marginRight: 4 }}>
                              *
                            </span>
                          )}
                          {I18N.carbonFootprint.emissionFactors}
                        </span>
                        <span
                          className={styles.textPrimary}
                          onClick={() => {
                            setModalShow('factor');
                          }}
                        >
                          {I18N.carbonFootprint3.numberOfEmissionFactors2}
                          <IconFont type='icon-icon-tanhezhaxiangmu' />
                        </span>
                      </div>
                      <SchemaField schema={emissiondataSchema()} />
                    </div>
                  </>
                );
              }}
            </FormConsumer>
          </main>
        </FormilyCommon>
      </Spin>
      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.preserve,
            type: 'primary',
            loading: subBtnLoading,
            onClick: async () => {
              hasSubmitAttemptedRef.current = true;
              // 判断是否先选中有值
              const formValueReportAccountList: FormSubReportAccountList[] =
                form.current.getValuesIn('reportAccountList');
              formValueReportAccountList?.forEach((list, listIndex) => {
                if (!list.productName && !list.accountName) {
                  form.current.setFieldState(
                    `reportAccountList.${listIndex}.productName`,
                    {
                      required: false,
                    },
                  );
                  form.current.setFieldState(
                    `reportAccountList.${listIndex}.accountName`,
                    {
                      required: false,
                    },
                  );
                }
              });
              syncValidationByReportType(
                form.current,
                form.current.values.type as number,
              );
              try {
                form.current.submit(values => {
                  setSubBtnLoading(true);

                  values.productId = values.productName
                    ? Number(values.productName)
                    : undefined;

                  if (values.type !== CARBON_LABEL) {
                    values.reportExtraInfo = undefined;
                    values.stageEmissions = undefined;
                  } else {
                    values.stageEmissions.stages = undefined;
                  }
                  values.reportFactoryList = values?.reportFactoryList?.map(
                    back => {
                      const valArr = Object.values(back);
                      const keyArr = Object.keys(back);

                      valArr.forEach((val, indexVal) => {
                        if (val === undefined) {
                          back[keyArr[indexVal]] = '';
                        }
                      });

                      return back;
                    },
                  );
                  // 处理新增的产品报告列表
                  values.reportAccountList = values?.reportAccountList
                    ?.filter(list => !isEmpty(list))
                    ?.map(back => ({
                      accountId: back.accountName as number,
                    }));

                  const selectedAccountId = values.accountName
                    ? Number(values.accountName)
                    : accountId.current;
                  const compareAccountId = values.compareAccountName
                    ? Number(values.compareAccountName)
                    : undefined;

                  // 说明是对标报告 - 需要校验核算方式
                  if (
                    values.type === COMPARE &&
                    compareAccountId &&
                    selectedAccountId
                  ) {
                    const compareStatus = verifyAccountType(
                      selectedAccountId,
                      compareAccountId,
                    );

                    // 如果校验失败直接返回
                    if (!compareStatus) {
                      setSubBtnLoading(false);
                      return;
                    }

                    // 处理新增的产品报告列表
                    values.reportAccountList = [
                      {
                        accountId: selectedAccountId,
                        baseType: TARGET,
                      },

                      {
                        accountId: compareAccountId,
                        baseType: STANDARD,
                      },
                    ];
                  }

                  if (
                    values.type === REDUCTION &&
                    selectedAccountId &&
                    compareAccountId
                  ) {
                    values.reportAccountList = [
                      {
                        accountId: selectedAccountId,
                        baseType: TARGET,
                      },
                      {
                        accountId: compareAccountId,
                        baseType: STANDARD,
                      },
                    ];
                  }

                  const selectedAccountInfo = units.current?.find(
                    item => String(item.id) === String(selectedAccountId),
                  );
                  const reductionExtra =
                    values.type === REDUCTION
                      ? buildReductionExtra(values)
                      : undefined;
                  const report: Report = {
                    ...values,
                    accountType:
                      values.type === REDUCTION && selectedAccountInfo
                        ? Number(selectedAccountInfo.type)
                        : accountTypeRef.current,
                    accountId: selectedAccountId,
                    compareAccountId,
                    compareProductId: values.compareProductName
                      ? Number(values.compareProductName)
                      : undefined,
                    compareStartTime: undefined,
                    startTime: undefined,
                    reportActivityList:
                      values.type === REDUCTION
                        ? undefined
                        : values.reportActivityList,
                    reportFactoryList:
                      values.type === REDUCTION
                        ? undefined
                        : values.reportFactoryList,
                    reportExtraInfo:
                      values.type === REDUCTION
                        ? undefined
                        : values.reportExtraInfo,
                    stageEmissions:
                      values.type === REDUCTION
                        ? undefined
                        : values.stageEmissions,
                    productionAddress:
                      values.type === REPORT && values.productionAddress
                        ? JSON.stringify(values.productionAddress)
                        : undefined,
                    evaluateProductCategory:
                      values.type === REPORT && values.evaluateProductCategory
                        ? JSON.stringify(values.evaluateProductCategory)
                        : undefined,
                    reduceExtra: reductionExtra,
                  };

                  // 如果不是产品对比报告 - 需要去掉基准产品的数据
                  if (report.type !== COMPARE && report.type !== REDUCTION) {
                    report.compareAccountId = undefined;
                    report.compareAccountName = undefined;
                    report.compareProductId = undefined;
                    report.compareProductName = undefined;
                  }

                  if (report.type !== REDUCTION) {
                    report.reduceExtra = undefined;
                    clearLegacyReductionFields(report);
                  } else {
                    report.companyProfile = undefined;
                    report.productionProcess = undefined;
                    report.overallDescription = undefined;
                    clearLegacyReductionFields(report);
                  }

                  if (pageInfoType === PageInfoType.add) {
                    POSTfdf3917ac048472511d90e1110fbcb73({
                      report,
                    })
                      .then(({ data }) => {
                        if (data?.code === 200) {
                          Toast(
                            'success',
                            I18N.carbonFootprint3.createdSuccessfully,
                          );
                          history.push(
                            RouteMapsCorbonFootprint3.carbonFootprint3ProcessReport,
                          );
                        }
                      })
                      .catch(() => {
                        setSubBtnLoading(false);
                      });
                  }
                  if (pageInfoType === PageInfoType.edit) {
                    POST78bcf124777efe639e8c76d0c6aea265({
                      report: { ...report, id: Number(id) },
                    })
                      .then(({ data }) => {
                        if (data?.code === 200) {
                          Toast(
                            'success',
                            I18N.carbonFootprint.modifiedSuccessfully,
                          );
                          history.push(
                            RouteMapsCorbonFootprint3.carbonFootprint3ProcessReport,
                          );
                        }
                        setSubBtnLoading(false);
                      })
                      .catch(() => {
                        setSubBtnLoading(false);
                      });
                  }
                });
              } finally {
                setSubBtnLoading(false);
              }
            },
          },
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.push(
                RouteMapsCorbonFootprint3.carbonFootprint3ProcessReport,
              );
            },
          },
        ]}
      />
      <ModalBase
        title={I18N.carbonFootprint3.activityDataQuality}
        visible={modalShow === 'activity'}
        className={styles.modal1}
        closable={false}
        okButtonProps={{ style: { display: 'none' } }}
        onCancel={() => {
          setModalShow(undefined);
        }}
        width={704}
        content={
          <div>
            <Table
              columns={activityDataColumns()}
              // @ts-ignore
              fetchApi={() => Promise.resolve()}
              // @ts-ignore
              returnFetchApi={() => ({
                data: activityData,
              })}
              pagination={false}
            />
          </div>
        }
      />
      <ModalBase
        title={I18N.carbonFootprint3.numberOfEmissionFactors2}
        visible={modalShow === 'factor'}
        className={styles.modal1}
        closable={false}
        okButtonProps={{ style: { display: 'none' } }}
        onCancel={() => {
          setModalShow(undefined);
        }}
        width={822}
        content={
          <div>
            <AntdRadio.Group
              className={styles.radios}
              options={Object.entries(radios).map(([value, label]) => ({
                label,
                value,
              }))}
              onChange={v => setcheckedRadio(v.target.value)}
              value={checkedRadio}
              optionType='button'
              buttonStyle='solid'
            />

            <Table
              columns={factorColumns(checkedRadio as keyof typeof radios)}
              dataSource={factorDatas(checkedRadio as keyof typeof radios)}
              pagination={false}
              // @ts-ignore    // 不需要这个字段
              fetchApi={() => Promise.resolve()}
            />
          </div>
        }
      />
      {productModalVisible && (
        <Modal
          title={I18N.carbonFootprint.selectProduct}
          width={1200}
          maskClosable={false}
          getContainer={false}
          open={productModalVisible}
          footer={null}
          style={{
            top: 50,
          }}
          bodyStyle={{
            padding: '0 16px',
          }}
          onCancel={() => setProductModalVisible(false)}
        >
          <SelectProductAccount
            accountIds={form.current
              .getValuesIn('reportAccountList')
              ?.map(list => list.accountName)}
            accountType={accountTypeRef.current}
            subSelect={selectProductModal}
            cancel={() => setProductModalVisible(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ReportInfo;
