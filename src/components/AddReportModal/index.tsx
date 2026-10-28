/* eslint-disable @typescript-eslint/no-unused-vars */
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Text } from '@components/FormilyUtil/util';
import {
  ArrayTable,
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  Radio,
} from '@formily/antd-v5';
import {
  Field as FieldType,
  createForm,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core';
import { Field, FormConsumer, createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { Table } from '@src/components/Table';
import { ModalBase } from '@src/components/UI/Modal';
import I18N from '@src/lang/I18N';
import { Report } from '@src/sdks_v2/footprint3V2ApiDocs';
import { Radio as AntdRadio, Button, Modal, Select as AntdSelect } from 'antd';
import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AxiosResponse } from 'axios';

import {
  getCarbonLabelReportInfo,
  getCarbonLabelReportList,
  getSnapInfoByReportId,
} from '@/views/Certification/carbonFootprintCertification/certificationProject/component/ApplayCertification/service';
import { ProductAccountingList } from '@/views/carbonFootprint3/FootprintAccount/component/ProductSelectAccount/type';
import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION,
  FootprintAccountStatusType,
} from '@/views/carbonFootprint3/FootprintAccount/constant';
import {
  getAccountListData,
  getAccountProductData,
} from '@/views/carbonFootprint3/FootprintAccount/service';
import { ProcessBusinessAccountingTableData } from '@/views/carbonFootprint3/ProcessBusinessAccounting/type';
import TextWidthOverflow from '@/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { REPORT_TYPE } from '@/views/carbonFootprint3/constant';
import AIFillResultConfirmModal from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/components/AIFillResultConfirmModal';
import AIGenerateBtn from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/components/AIGenerateBtn';
import { activityDataDescMap } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/constant';
import {
  AIFillConfig,
  getAIFillConfirmTaskLabel,
  getAIFillTip,
  useAIFillFlow,
} from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/utils/aiFill';
import { revalidateFieldFeedback } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/utils/revalidateFieldFeedback';

import qualityRatingStandardIcon from './assets/quality-rating-standard.png';
import { activityDataColumns, factorColumns } from './columns';
import { activityData, factorDatas, radios } from './datas';
import './index.less';
import styles from './index.module.less';
import { dataSchema, emissiondataSchema } from './schemas';
import { getReportScope, postReportAddAuth, ReportInfo } from './service';
import { FormSubReportAccountList, Options } from './types';
import { changeData2SelectOptions } from './utils';

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    FormItem,
    FormLayout,
    FormGrid,
    DatePicker,
    ArrayTable,
    Text,
    Radio,
  },
});

const { REPORT, COMPARE } = REPORT_TYPE;

const { QUICK, PROCESS } = FootprintAccountStatusType;

type AddReportDefaultValues = {
  productId?: number | string;
  accountId?: number | string;
};

interface AddReportModalProps {
  defaultValues?: AddReportDefaultValues;
  getProductAccountList?: (params: {
    pageNum: number;
    pageSize: number;
    productId?: number | string;
    type?: number;
  }) => Promise<AxiosResponse<any>>;
  getProductList?: (params: {
    pageNum: number;
    pageSize: number;
  }) => Promise<AxiosResponse<any>>;
  readPretty?: boolean;
  snapCode?: string;
  submit: (reportInfo: Report) => void;
}

const normalizeSelectId = (value?: number | string) => {
  if (value === undefined || value === '') {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? value : numberValue;
};

const getProductOptionValue = (product: Record<string, any>) =>
  normalizeSelectId(product.productId ?? product.id ?? product.value);

const getProductOptionLabel = (product: Record<string, any>) =>
  product.productName || product.name || product.label;

const isSameDefinedValue = (left?: number | string, right?: number | string) =>
  left !== undefined && right !== undefined && String(left) === String(right);

const getProductAccountValue = (product: Record<string, any>) => {
  if (product.accountId !== undefined && product.accountId !== null) {
    return normalizeSelectId(product.accountId);
  }

  if (
    product.productId !== undefined &&
    !isSameDefinedValue(product.value, product.productId)
  ) {
    return normalizeSelectId(product.value);
  }

  return undefined;
};

const toProductOption = (product: Record<string, any>) => ({
  ...product,
  label: getProductOptionLabel(product),
  value: getProductOptionValue(product),
});

const resolveDefaultProductId = (
  products: Record<string, any>[],
  productId?: number | string,
  accountId?: number | string,
) => {
  const matchedProduct = products.find(product => {
    const optionValue = getProductOptionValue(product);

    return (
      isSameDefinedValue(optionValue, productId) ||
      isSameDefinedValue(product.productId, productId) ||
      isSameDefinedValue(product.id, productId)
    );
  });

  if (matchedProduct) {
    return getProductOptionValue(matchedProduct);
  }

  const matchedAccountProduct = products.find(product => {
    const rowAccountId = getProductAccountValue(product);

    return (
      isSameDefinedValue(rowAccountId, accountId) ||
      isSameDefinedValue(rowAccountId, productId)
    );
  });

  return matchedAccountProduct
    ? getProductOptionValue(matchedAccountProduct)
    : productId;
};

const resolveDefaultAccountId = (
  products: Record<string, any>[],
  productId?: number | string,
  accountId?: number | string,
) => {
  const matchedAccountProduct = products.find(product => {
    const optionValue = getProductOptionValue(product);
    const rowAccountId = getProductAccountValue(product);

    return (
      isSameDefinedValue(rowAccountId, accountId) ||
      isSameDefinedValue(rowAccountId, productId) ||
      isSameDefinedValue(optionValue, productId)
    );
  });

  return matchedAccountProduct
    ? getProductAccountValue(matchedAccountProduct)
    : accountId;
};

export const AddReportModal: FC<
  PropsWithChildren<AddReportModalProps>
> = props => {
  const {
    defaultValues,
    getProductAccountList,
    getProductList,
    submit,
    readPretty = false,
    snapCode,
  } = props;

  // 用来判断是否批量选中的回显
  const selectProductAccountStatusRef = useRef(false);

  // 核算类型
  const accountTypeRef = useRef<FootprintAccountStatusType>(QUICK);

  const [mainLoading, setMainLoading] = useState(false);

  const [open, setOpen] = useState(false);

  // 碳足迹报告选中的类型
  const [accountType, setAccountType] =
    useState<FootprintAccountStatusType>(QUICK);

  const [checkedRadio, setcheckedRadio] = useState(Object.keys(radios)[0]);
  const [modalShow, setModalShow] = useState<'activity' | 'factor'>();

  const [reportList, setReportList] = useState<Record<string, any>[]>([]);
  const [coverReportId, setCoverReportId] = useState<number | undefined>(
    undefined,
  );
  const [coverLoading, setCoverLoading] = useState(false);

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
        className={`optionNodeType ${
          String(row.type) === String(QUICK)
            ? 'optionNodeTypeQuick'
            : 'optionNodeTypeProcess'
        }`}
      >
        {FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION[row.type]}
      </div>
    </div>
  );

  /**
   * 清空产品数据质量评价
   */
  const restArrayField = () => {
    form.setFieldState('*(reportActivityList, reportFactoryList)', {
      value: undefined,
    });
  };

  const form = useMemo(
    () =>
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
          onFieldInputValueChange('productId', (field, formIns) => {
            formIns.setValues({
              accountId: undefined,
              startTime: undefined,
              endTime: undefined,
            });
          });
          onFieldValueChange('accountId', field => {
            const accountId = field.value;
            if (accountId && !readPretty) {
              getCarbonLabelReportList({
                pageNum: 1,
                pageSize: 100000,
                type: 0,
                accountType: 0,
                accountId,
              }).then(({ data }) => {
                setReportList(data?.data?.rows);
              });
            }
          });
          const syncValidationPatterns = [
            'companyProfile',
            'suppose',
            'reportActivityList.*.*',
            'reportFactoryList.*.*',
          ] as const;
          syncValidationPatterns.forEach(pattern => {
            onFieldValueChange(pattern, revalidateFieldFeedback);
          });
        },
      }),
    [open, readPretty],
  );

  useEffect(() => {
    if (!open || readPretty) {
      return undefined;
    }

    const productId = normalizeSelectId(defaultValues?.productId);
    const accountId = normalizeSelectId(defaultValues?.accountId);

    if (productId === undefined && accountId === undefined) {
      return undefined;
    }

    let ignore = false;

    const syncDefaultValues = async () => {
      const productListRequest = getProductList || getAccountProductData;
      const productListResult = await productListRequest({
        pageNum: 1,
        pageSize: 10000,
      });

      if (ignore) return;

      const products = productListResult.data.data.rows || [];
      const resolvedProductId = resolveDefaultProductId(
        products,
        productId,
        accountId,
      );
      const resolvedAccountId = resolveDefaultAccountId(
        products,
        productId,
        accountId,
      );

      form.setFieldState('productId', {
        dataSource: products.map(toProductOption),
      });

      if (resolvedProductId === undefined) {
        return;
      }

      form.setValues({
        productId: resolvedProductId,
        accountId: undefined,
        startTime: undefined,
        endTime: undefined,
      });

      form.setFieldState('accountId', {
        loading: true,
      });

      try {
        const productAccountListRequest =
          getProductAccountList || getAccountListData;
        const result = await productAccountListRequest({
          productId: resolvedProductId,
          pageNum: 1,
          pageSize: 10000,
          type: 0,
        });

        if (ignore) return;

        const accountList = result.data.data.rows || [];
        const accountOptions = accountList.map(account => ({
          ...account,
          label: account.accountName,
          value: account.id,
        }));
        const selectedAccount = accountList.find(account =>
          isSameDefinedValue(account.id, resolvedAccountId),
        );

        form.setFieldState('accountId', {
          dataSource: accountOptions,
        });

        if (!selectedAccount || selectedAccount.disabled) {
          return;
        }

        form.setValues({
          accountId: selectedAccount.id,
          startTime: selectedAccount.startTime,
          endTime: selectedAccount.endTime,
        });

        const { data } = await getCarbonLabelReportList({
          pageNum: 1,
          pageSize: 100000,
          type: 0,
          accountType: 0,
          accountId: selectedAccount.id,
        });

        if (!ignore) {
          setReportList(data?.data?.rows);
        }
      } catch {
        if (!ignore) {
          setReportList([]);
        }
      } finally {
        if (!ignore) {
          form.setFieldState('accountId', {
            loading: false,
          });
        }
      }
    };

    syncDefaultValues();

    return () => {
      ignore = true;
    };
  }, [
    defaultValues?.accountId,
    defaultValues?.productId,
    form,
    getProductList,
    getProductAccountList,
    open,
    readPretty,
  ]);

  const accountIdReaction = async (field: FieldType) => {
    if (readPretty) return;
    const { productId } = form.values;
    if (productId) {
      field.loading = true;
      const productAccountListRequest =
        getProductAccountList || getAccountListData;
      const result = await productAccountListRequest({
        productId,
        pageNum: 1,
        pageSize: 10000,
        type: 0,
      });
      const accountList = result.data.data.rows || [];

      field.setDataSource(
        accountList.map(account => ({
          ...account,
          label: account.accountName,
          value: account.id,
        })),
      );
      field.loading = false;
    }
  };

  const timePeriodReaction = async (field: FieldType) => {
    const { accountId } = form.values;
    const accountList = form.getFieldState('.accountId')?.dataSource;
    const selectedAccount = accountList?.find(item => item.id === accountId);
    field.visible = Boolean(selectedAccount && !selectedAccount.disabled);
    if (selectedAccount && !selectedAccount.disabled) {
      field.setValue([selectedAccount.startTime, selectedAccount.endTime]);
    }
  };

  const getOptions = (setDefaultValue?: boolean, type?: number) => {
    const setFieldState = (options: Options) => {
      form.setFieldState('*.*.activityType', {
        dataSource: changeData2SelectOptions(options?.activityType),
      });
      form.setFieldState('*.*.times', {
        dataSource: changeData2SelectOptions(options?.timeType),
      });
      form.setFieldState('*.*.region', {
        dataSource: changeData2SelectOptions(options?.regionType),
      });
      form.setFieldState('*.*.technology', {
        dataSource: changeData2SelectOptions(options?.technologyType),
      });
      form.setFieldState('*.*.datas', {
        dataSource: changeData2SelectOptions(options?.dataType),
      });
      form.setFieldState('*.*.methodology', {
        dataSource: changeData2SelectOptions(options?.methodologyType),
      });
      form.setFieldState('*.*.dataType', {
        dataSource: changeData2SelectOptions(options?.reportStage),
      });
    };
    const typeNum = type !== undefined ? type : accountTypeRef.current;

    return getReportScope({ accountType: typeNum }).then(({ data }) => {
      const options = data?.data as Options;
      const { values } = form;
      const { accountName, ...restValues } = values || {};
      if (setDefaultValue)
        form.setValues(
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
   * @param {FieldType} field
   */
  const useAsyncProductDataSource = () => (field: FieldType) => {
    if (readPretty) return;
    field.loading = true;
    const productListRequest = getProductList || getAccountProductData;
    productListRequest({ pageNum: 1, pageSize: 10000 }).then(back => {
      const enumData = back.data.data.rows;
      field.dataSource = enumData.map(toProductOption);

      field.loading = false;
    });
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
      form.getValuesIn('reportAccountList');

    if (formValueReportAccountList?.length > 0) {
      // 将所有的核算选中先清空

      form.setFieldState('reportAccountList.*.periodTime', {
        value: undefined,
      });

      // 然后根据选中的核算类型 - 过滤掉dataSource
      formValueReportAccountList.forEach((item, index) => {
        form.setValuesIn(`reportAccountList.${index}.accountName`, undefined);

        if (item.productName) {
          const accountInfoList = form.getFieldState(
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
          form.setFieldState(`reportAccountList.${index}.accountName`, {
            dataSource: accountList,
          });
        }
      });
    }

    setAccountType(accountTypeVal);
    accountTypeRef.current = accountTypeVal;
    setMainLoading(false);
  };

  useEffect(() => {
    if (open) {
      getOptions(true);
    }
  }, [open]);

  // const [mainLoading, setMainLoading] = useState(false);

  const formSubmit = async () => {
    if (readPretty) {
      setOpen(false);
      return;
    }
    const formValue = await form.submit<ReportInfo>();
    setMainLoading(true);
    const result = await postReportAddAuth({
      ...formValue,
      reportAccountList: [
        {
          accountId: formValue.accountId,
        },
      ],
    }).finally(() => {
      setMainLoading(false);
    });
    const { data } = result;

    submit(data.data);
    setOpen(false);
    form.reset();
  };

  const coverReport = async () => {
    if (!coverReportId) return;
    try {
      setCoverLoading(true);
      const { data } = await getCarbonLabelReportInfo({
        id: coverReportId,
      });
      form.setValues({
        reportActivityList: data.data.reportActivityList,
        reportFactoryList: data.data.reportFactoryList,
        companyProfile: data.data.companyProfile,
        suppose: data.data.suppose,
      });
    } finally {
      setCoverLoading(false);
    }
  };

  const FACTORY_EDITABLE_KEYS = [
    'descs',
    'times',
    'region',
    'technology',
    'datas',
    'methodology',
  ];

  const aiFillConfigs = useMemo<AIFillConfig[]>(
    () => [
      {
        type: 'field',
        path: 'companyProfile',
        tabKey: 'basic',
        tabLabel: I18N.carbonFootprint.basicInformation,
        title: I18N.carbonFootprint3.companyIntroduction,
      },
      {
        type: 'field',
        path: 'suppose',
        tabKey: 'basic',
        tabLabel: I18N.carbonFootprint.basicInformation,
        title: I18N.carbonFootprint.carbonFootprintVerification,
      },
      {
        type: 'table',
        path: 'reportFactoryList',
        aiPath: 'qualityFactor',
        tabKey: 'quality',
        tabLabel: I18N.carbonFootprint3.productDataQuality,
        title: I18N.carbonFootprint.emissionFactors,
        editableKeys: FACTORY_EDITABLE_KEYS,
        columns: [
          {
            key: 'descs',
            title: I18N.carbonFootprint3.emissionFactorDescription,
            editable: true,
          },
          {
            key: 'times',
            title: I18N.carbonFootprint3.timeCorrelation,
            editable: true,
          },
          {
            key: 'region',
            title: I18N.carbonFootprint3.regionalRelevance,
            editable: true,
          },
          {
            key: 'technology',
            title: I18N.carbonFootprint3.technicalRelevance,
            editable: true,
          },
          {
            key: 'datas',
            title: I18N.carbonFootprint3.dataAccuracy,
            editable: true,
          },
          {
            key: 'methodology',
            title: I18N.carbonFootprint3.methodologySuitability2,
            editable: true,
          },
        ],
        getRowName: row => row?.name || row?.dataType,
        matchRow: (snapshotRows, aiRow) =>
          snapshotRows.findIndex(row => row.dataType === aiRow.dataType),
      },
    ],
    [],
  );

  const aiFillFlow = useAIFillFlow({
    form,
    configs: aiFillConfigs,
    taskTypeLabel: getAIFillConfirmTaskLabel('0'),
  });

  const aiFillTip = getAIFillTip([
    I18N.subModules.companyIntroductionInfo,
    I18N.subModules.productCarbonFootprintAssumptionInfo,
    I18N.subModules.factorDataQualityEvaluationInfo,
  ]);

  const handleAIGenerate = () => {
    aiFillFlow.startAIFill({
      url: `${process.env.REACT_APP_API_URL}/footprint3/report/aiRptFill`,
      data: {
        accountId: form.values.accountId,
        authType: '0',
      },
    });
  };

  const renderQualityStandardTrigger = (
    label: ReactNode,
    modalType: 'activity' | 'factor',
  ) => (
    <span
      className={styles.qualityStandardTrigger}
      onClick={() => {
        setModalShow(modalType);
      }}
    >
      <img
        alt=''
        className={styles.qualityStandardIcon}
        src={qualityRatingStandardIcon}
      />
      <span>{label}</span>
    </span>
  );

  useEffect(() => {
    if (snapCode && open) {
      getSnapInfoByReportId({
        snapCode,
      }).then(({ data }) => {
        form.setValues(data.data);
      });
    }
  }, [snapCode, form, open]);
  return (
    <div>
      <Modal
        className={styles.addReportModal}
        style={{
          top: 50,
        }}
        open={open}
        width={1024}
        title={
          readPretty
            ? I18N.eca.accountingReport
            : I18N.components.addAuthenticationReport
        }
        okButtonProps={{
          loading: mainLoading,
        }}
        onCancel={() => setOpen(false)}
        onOk={() => formSubmit()}
      >
        <div className={`${styles.wrapper} reportMain`}>
          <FormilyCommon form={form} colon={false}>
            <main>
              <div className={styles.card}>
                <h4 className={styles.title}>
                  {I18N.carbonFootprint.basicInformation}
                </h4>
                <FormGrid maxColumns={2} rowGap={8} columnGap={20}>
                  <Field
                    name='productId'
                    title={I18N.carbonFootprint.accountingProducts}
                    required
                    visible={!readPretty}
                    decorator={[FormItem]}
                    component={[
                      Select,
                      {
                        placeholder: I18N.carbonFootprint.pleaseSelect,
                        showSearch: true,
                        optionFilterProp: 'label',
                      },
                    ]}
                    reactions={[useAsyncProductDataSource()]}
                  />
                  <Field
                    name='accountId'
                    required
                    title={I18N.carbonFootprint3.functionalUnits}
                    visible={!readPretty}
                    decorator={[FormItem]}
                    component={[
                      Select,
                      { placeholder: I18N.carbonFootprint.pleaseSelect },
                    ]}
                    reactions={[accountIdReaction]}
                  />
                  <Field
                    name='[startTime,endTime]'
                    readPretty
                    title={I18N.carbonFootprint.accountingCycle}
                    visible={!readPretty}
                    decorator={[
                      FormItem,
                      { className: styles.accountingCycleItem },
                    ]}
                    component={[
                      DatePicker.RangePicker,
                      { placeholder: I18N.carbonFootprint.pleaseSelect },
                    ]}
                    reactions={[timePeriodReaction]}
                  />
                </FormGrid>
                <FormConsumer>
                  {formIns => {
                    const { accountId } = formIns.values;
                    if (!accountId || readPretty) {
                      return '';
                    }

                    return (
                      <>
                        <div className={styles.relatedReport}>
                          <div>
                            <span>{I18N.components.relatedReport}</span>
                            <InfoCircleOutlined
                              className={styles.relatedReportIcon}
                            />
                            <span className={styles.relatedReportTip}>
                              {I18N.components.chooseAccountingPersonnel}
                            </span>
                          </div>
                          <div className={styles.relatedReportContent}>
                            <AntdSelect
                              className={styles.coverSelect}
                              placeholder={I18N.carbonFootprint.pleaseSelect}
                              options={reportList}
                              fieldNames={{ value: 'id', label: 'reportName' }}
                              onChange={setCoverReportId}
                            />
                            <Button
                              disabled={!coverReportId}
                              loading={coverLoading}
                              onClick={coverReport}
                            >
                              {I18N.components.referenceCoverage}
                            </Button>
                          </div>
                        </div>
                        <AIGenerateBtn
                          loading={aiFillFlow.aiLoading}
                          loadingTip={aiFillFlow.progressTip}
                          success={!!aiFillFlow.tipText}
                          tip={aiFillFlow.tipText || aiFillTip}
                          style={{ margin: '16px 0' }}
                          onClick={handleAIGenerate}
                        />
                      </>
                    );
                  }}
                </FormConsumer>
                <Field
                  name='companyProfile'
                  title={I18N.carbonFootprint3.companyIntroduction}
                  required
                  decorator={[FormItem]}
                  component={[
                    Input.TextArea,
                    { placeholder: I18N.base.pleaseEnter, maxLength: 1000 },
                  ]}
                />
                <Field
                  name='suppose'
                  title={I18N.carbonFootprint.carbonFootprintVerification}
                  required
                  decorator={[FormItem]}
                  component={[
                    Input.TextArea,
                    { placeholder: I18N.base.pleaseEnter, maxLength: 2000 },
                  ]}
                />
                <FormConsumer>
                  {nowFow => {
                    if (readPretty) {
                      return '';
                    }
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
                          >
                            {I18N.carbonFootprint3.batchSelection}
                          </Button>
                        )}
                      </div>
                    );
                  }}
                </FormConsumer>
              </div>
              <div className={styles.card}>
                <FormConsumer>
                  {nowFow => {
                    const { type } = nowFow.values;
                    return (
                      <h4 className={styles.title}>
                        <span className={styles.mark}>*</span>
                        {type === COMPARE ? I18N.carbonFootprint3.target : ''}
                        {I18N.carbonFootprint3.productDataQuality}
                      </h4>
                    );
                  }}
                </FormConsumer>

                <div className={styles.activityData}>
                  <span>{I18N.carbonFootprint3.activityData}</span>
                  {renderQualityStandardTrigger(
                    I18N.carbonFootprint3.activityDataQuality,
                    'activity',
                  )}
                </div>
                <SchemaField schema={dataSchema()} />
                <div className={styles.emissions}>
                  <h4>
                    <FormConsumer>
                      {() => {
                        const runtimeTitle =
                          form.query('reportFactoryList').take()?.title ||
                          I18N.carbonFootprint.emissionFactors;

                        return (
                          <>
                            <span className={styles.mark}>*</span>
                            {runtimeTitle}
                          </>
                        );
                      }}
                    </FormConsumer>
                  </h4>
                  {renderQualityStandardTrigger(
                    I18N.carbonFootprint3.numberOfEmissionFactors2,
                    'factor',
                  )}
                </div>
                <SchemaField schema={emissiondataSchema()} />
              </div>
            </main>
          </FormilyCommon>
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
        </div>
      </Modal>
      <AIFillResultConfirmModal {...aiFillFlow.confirmModalProps} />
      <div
        onClick={() => {
          form.reset();
          aiFillFlow.stopAIFill();
          setOpen(true);
        }}
      >
        {props.children}
      </div>
    </div>
  );
};
