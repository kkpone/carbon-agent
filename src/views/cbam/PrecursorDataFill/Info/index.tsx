/**
 * @description CBAM前体数据填报详情
 */

import { ActionType, ProTable } from '@ant-design/pro-components';
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  PreviewText,
  Input,
  Select,
  ArrayTable,
} from '@formily/antd-v5';
import { createForm, Field } from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import { Button, Modal, Space, Tabs } from 'antd';
import { compact, includes, isArray, isNaN, keyBy, omit } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { UploadFile } from '@/api/type';
import { FormActions } from '@/components/FormActions';
import { InfoTitle } from '@/components/InfoTitle';
import { FormilyFileUpload } from '@/components/formily/FormilyFileUpload';
import { TextArea } from '@/components/formily/TextArea';
import { usePageInfo } from '@/hooks';
import I18N from '@/lang/I18N';
import { checkAuth } from '@/layout/utills';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { toNavigate } from '../../router';
import { modelFooterBtnStyle, omitInfoFn, Toast } from '@/utils';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';
import { APPLY_STATUS } from '@/views/supplyChainCarbonManagement/CarbonDataFill/constant';

import { columns } from './columns';
import { FormilyPrecursorEmissionTable } from './components/PrecursorEmissionTable';
import { initProductAttributionList } from './components/PrecursorEmissionTable/until';
import { getSchemas, TAB_LIST, TABS_TYPE } from './constants';
import style from './index.module.less';
import { PRECURSOR_DATA_STATUS } from '../../PrecursorData/constants';
import {
  FACTORY_LEVEL_ENUM,
  SOURCE_ENUM,
} from '../../ReportForm/Info/ProductData/OutsourcedPrecursor/Info/constant';
import { getCNList } from '../../ReportForm/service';
import ChooseCBAMDataModal from '../ChooseCBAMDataModal';
import { CbamProductInfo } from '../ChooseCBAMDataModal/type';
import {
  getPrecursorDataFillDataDetail,
  getPrecursorDataFillDataProductDetail,
  getPrecursorDataFillDetail,
  getPrecursorFeedBackList,
  postPrecursorDataFillDataSubmit,
} from '../service';
import { PrecursorDataFillFeedBackResq, PrecursorDataFillResp } from '../type';

const { NOT_FILLED_IN, FILLING_IN, REVIEW_FAILED, WITHDRAWN, REPORTED } =
  APPLY_STATUS;

const { MEASURE } = SOURCE_ENUM;

const {
  IMPLIED_EMISSION_DIRECT,
  EL_USAGE,
  EL_EMISSION_COEFFICIENT,
  IMPLIED_EMISSION_INDIRECT,
} = FACTORY_LEVEL_ENUM;

const { DATA_REQUIREMENT, FILLED_DATA } = TABS_TYPE;

const { PENDING_APPROVAL } = PRECURSOR_DATA_STATUS;

const SchemaField = createSchemaField({
  components: {
    Form,
    FormItem,
    FormGrid,
    FormLayout,
    PreviewText,
    Input,
    Select,
    TextArea,
    InfoTitle,
    FormilyFileUpload,
    ArrayTable,
    FormilyPrecursorEmissionTable,
  },
});
const PrecursorDataFillInfo = () => {
  const tableRef = useRef<ActionType>();

  const columnsStateDefault = useMemo(() => keyBy(columns, 'dataIndex'), []);

  const { isDetail, id } = usePageInfo();
  const navigate = toNavigate(useHistory());

  /** 是否是填报 */
  const [isFill, setIsFill] = useState(false);

  /** 仅展示 */
  const onlyShow = isDetail || !isFill;

  /** 可填报 */
  const canFill = !isDetail && isFill;

  /** 当前选择的TAB */
  const [currentTab, setCurrentTab] = useState(DATA_REQUIREMENT);

  /** 公共单位 */
  const [unit, setUnit] = useState<string>(I18N.Factors.unit);

  /** 客户反馈 */
  const [feedbackList, setFeedbackList] =
    useState<PrecursorDataFillFeedBackResq[]>();

  /** 保存按钮loading */
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  /** 保存并提交按钮loading */
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  /** 控制选择弹窗的显隐 */
  const [chooseCBAMDataModelOpen, setChooseCBAMDataModelOpen] = useState(false);

  /** 表单以及表单状态 */
  const { schema, readPretty } = getSchemas(currentTab, onlyShow, unit);

  const enumOptions = useAllEnumsBatch('CBAMcountryinfo');
  /** 国家名称枚举 */
  const countryCodeList = enumOptions?.CBAMcountryinfo;

  const form = useMemo(
    () =>
      createForm({
        readPretty,
      }),
    [readPretty, currentTab],
  );

  /** 根据产品分类和来源国家/地区查询默认 CN，选择值为默认 CN 记录 ID。 */
  const useAsyncCnDataSource = () => async (field: Field) => {
    /** 选中的productCategoryId */
    const selectProductCategoryId =
      field?.form?.getValuesIn('productCategoryId');
    const countryValue = field?.form?.getValuesIn('countryValue');

    /** 查询对应国家/地区（无数据时回退 OTHER）的默认 CN。 */
    const { data } = await getCNList({
      pageNum: 1,
      pageSize: 10000,
      productCategoryId: selectProductCategoryId,
      countryValue,
      countryFallback: true,
    });
    const { records = [] } = data?.data || {};
    const dataSource = records?.map(item => ({
      label: `${item.defaultCode || ''}${item.defaultName || ''}`,
      value: item.id,
    }));

    /** 设置枚举值 */
    field.setDataSource(dataSource);
    if (field.value && !records.some(item => item.id === field.value)) {
      field.setValue(undefined);
    }
  };

  /** 获取详情 */
  useEffect(() => {
    if (id) {
      /** 数据请求-查询信息 */
      getPrecursorDataFillDetail({ id }).then(({ data }) => {
        const { supportFile, evidenceFile, applyStatus, unitName } =
          data?.data || {};

        setUnit(unitName || I18N.Factors.unit);

        /** 是否有保存按钮 */
        const hasSave = includes(
          [NOT_FILLED_IN, FILLING_IN, REPORTED, REVIEW_FAILED, WITHDRAWN],
          applyStatus,
        );
        setIsFill(hasSave);

        /** 证明材料 */
        let supportMaterialsFileList = [];
        if (supportFile && typeof supportFile === 'string') {
          try {
            const parsedFileData = JSON.parse(supportFile) || [];
            supportMaterialsFileList = parsedFileData?.map(
              (file: UploadFile) => {
                const { fileName, fileId, fileUrl } = file || {};
                return {
                  ...file,
                  name: fileName,
                  uid: fileId,
                  url: fileUrl,
                };
              },
            );
          } catch (error) {
            // 防止脏数据导致页面空白
          }
        } else {
          supportMaterialsFileList = [];
        }

        /** 证据材料 */
        let evidenceFileList = [];
        if (evidenceFile && typeof evidenceFile === 'string') {
          try {
            const parsedFileData = JSON.parse(evidenceFile) || [];
            evidenceFileList = parsedFileData?.map((file: UploadFile) => {
              const { fileName, fileId, fileUrl } = file || {};
              return {
                ...file,
                name: fileName,
                uid: fileId,
                url: fileUrl,
              };
            });
          } catch (error) {
            // 防止脏数据导致页面空白
          }
        } else {
          evidenceFileList = [];
        }

        form.setValues({
          ...data.data,
          evidenceFile: evidenceFileList,
          supportFile: supportMaterialsFileList,
          unitName: unitName || I18N.Factors.unit,
        });
      });

      /** 数据请求-查询反馈列表 */
      if (currentTab === DATA_REQUIREMENT) {
        getPrecursorFeedBackList({ supplyId: id }).then(({ data }) => {
          setFeedbackList(data?.data);
        });
      }

      /** 数据填报-查询填报数据-过程隐含排放 */
      if (currentTab === FILLED_DATA) {
        getPrecursorDataFillDataDetail({ id }).then(({ data }) => {
          const { supplyAttributionList = [] } = data?.data || {};

          /** 处理之后的排放数据 */
          const handleProductAttributionList =
            isArray(supplyAttributionList) && supplyAttributionList?.length
              ? supplyAttributionList?.map(item => {
                  switch (item.emissionElement) {
                    case IMPLIED_EMISSION_DIRECT:
                      return {
                        ...item,
                        emission: item.outPower,
                        emissionSource: MEASURE,
                      };
                    case EL_USAGE:
                      return {
                        ...item,
                        emission: item.inputFactor,
                        emissionSource: MEASURE,
                      };
                    case EL_EMISSION_COEFFICIENT:
                      return {
                        ...item,
                        emission: item.outFactor,
                        emissionSource: item.eleSource,
                      };
                    case IMPLIED_EMISSION_INDIRECT:
                      return {
                        ...item,
                        emission: item.inputPower,
                      };
                    default:
                      return item;
                  }
                })
              : initProductAttributionList;

          form.setValues({
            supplyAttributionList: handleProductAttributionList,
          });
        });
      }
    }
  }, [id, currentTab]);

  /** 设置表单枚举值 */
  useEffect(() => {
    if (currentTab === DATA_REQUIREMENT) return;
    /** 来源国家或地区 */
    if (countryCodeList) {
      form.setFieldState('countryValue', {
        dataSource: countryCodeList?.map(item => ({
          ...item,
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });
    }
  }, [countryCodeList, currentTab]);

  /** 处理表单数据 */
  const handleFormValues = (values: PrecursorDataFillResp) => {
    const {
      cnCode,
      defaultCnId,
      countryValue,
      evidenceFile,
      supplyAttributionList,
    } = values || {};

    /** 证据材料的处理 */
    const evidenceFileList =
      evidenceFile?.map((file: any) => {
        const { name: fileName, uid, url } = file || {};
        return omit(
          {
            ...file,
            fileId: uid,
            fileName,
            fileUrl: url,
          },
          ['name', 'uid', 'url'],
        );
      }) || [];
    /** 证明材料 */
    const newEvidenceFileList = evidenceFileList?.length
      ? JSON.stringify(evidenceFileList)
      : undefined;

    /** 处理后的排放数据 */
    const newProductAttributionList = supplyAttributionList?.map(item => {
      switch (item.emissionElement) {
        case IMPLIED_EMISSION_DIRECT:
          return {
            ...item,
            outPower: item.emission,
          };
        case EL_USAGE:
          return {
            ...item,
            inputFactor: item.emission,
          };
        case EL_EMISSION_COEFFICIENT:
          return {
            ...item,
            outFactor: item.emission,
            eleSource: item.emissionSource,
          };
        case IMPLIED_EMISSION_INDIRECT:
          return {
            ...item,
            inputPower: item.emission,
          };
        default:
          return item;
      }
    });

    const result = omitInfoFn({
      cnCode,
      defaultCnId,
      countryValue,
      evidenceFile: newEvidenceFileList,
      supplyAttributionList: newProductAttributionList,
      supplyInfoId: id,
    });

    return result;
  };

  /** 重置排放数据 */
  const resetEmissionData = () => {
    form.setValues({
      supplyAttributionList: initProductAttributionList,
    });
  };

  /** 选择已有CBAM数据弹窗后的处理 */
  const handleChooseCBAMDataModalOk = async ({
    selectedProductId,
  }: {
    selectedProductId: number;
  }) => {
    /** 先清空原有排放数据 */
    resetEmissionData();

    const { data } = await getPrecursorDataFillDataProductDetail({
      productId: selectedProductId,
    });
    const supplyAttributionList = data?.data || [];

    /** 处理之后的排放数据 */
    const handleProductAttributionList =
      isArray(supplyAttributionList) && supplyAttributionList?.length
        ? supplyAttributionList?.map(item => {
            switch (item.emissionElement) {
              case IMPLIED_EMISSION_DIRECT:
                return {
                  ...item,
                  emission: item.outPower,
                  emissionSource: MEASURE,
                };
              case EL_USAGE:
                return {
                  ...item,
                  emission: item.inputFactor,
                  emissionSource: MEASURE,
                };
              case EL_EMISSION_COEFFICIENT:
                return {
                  ...item,
                  emission: item.outFactor,
                  emissionSource: item.eleSource,
                };
              case IMPLIED_EMISSION_INDIRECT:
                return {
                  ...item,
                  emission: item.inputPower,
                };
              default:
                return item;
            }
          })
        : initProductAttributionList;

    form.setValues({
      supplyAttributionList: handleProductAttributionList,
    });
  };

  return (
    <div className={style.wrapper}>
      <Tabs
        activeKey={currentTab}
        items={TAB_LIST}
        onChange={key => setCurrentTab(key)}
      />
      <Form form={form} previewTextPlaceholder='-'>
        <div className={style.schemaWrap}>
          <SchemaField schema={schema} scope={{ useAsyncCnDataSource }} />
          <div className={style.btnWrap}>
            <FormConsumer>
              {currentForm => {
                if (currentTab === DATA_REQUIREMENT || isDetail) return '';

                const currentProductId =
                  currentForm?.getValuesIn('saleProductId');

                // 已选择CBAM数据的状态下，再次点击【引用已有CBAM数据】按钮，二次确认文案：“重新选择CBAM将清空填报的前体隐含排放数据，请确认是否继续？”
                const needTip = !!currentProductId;

                return (
                  <Space>
                    {canFill && currentTab === FILLED_DATA && (
                      <Button
                        type='primary'
                        onClick={() => {
                          if (needTip) {
                            Modal.confirm({
                              title: I18N.Factors.prompt,
                              icon: '',
                              content: <span>{I18N.cbam.chooseCAgain}</span>,
                              ...modelFooterBtnStyle,
                              okText: I18N.base.confirm,
                              cancelText: I18N.Factors.cancel,
                              onOk: () => {
                                setChooseCBAMDataModelOpen(true);
                              },
                            });
                          } else {
                            setChooseCBAMDataModelOpen(true);
                          }
                        }}
                      >
                        {I18N.cbam.quotingFromAnExistingC}
                      </Button>
                    )}
                    {needTip && (
                      <Button
                        onClick={() => {
                          Modal.confirm({
                            title: I18N.Factors.prompt,
                            icon: '',
                            content: (
                              <span>{I18N.cbam.clearTheFilledInForm}</span>
                            ),
                            ...modelFooterBtnStyle,
                            okText: I18N.base.confirm,
                            cancelText: I18N.Factors.cancel,
                            onOk: () => {
                              /** 清空原有排放数据 */
                              resetEmissionData();
                              /** 清空产品ID */
                              form.setValuesIn('saleProductId', 0);
                            },
                          });
                        }}
                      >
                        {
                          I18N.supplyChainCarbonManagement
                            .clearAndFillInTheReport
                        }
                      </Button>
                    )}
                  </Space>
                );
              }}
            </FormConsumer>
          </div>
        </div>
      </Form>
      {currentTab === DATA_REQUIREMENT &&
        feedbackList &&
        feedbackList?.length > 0 && (
          <div>
            <InfoTitle
              title={I18N.supplyChainCarbonManagement.customerFeedback}
            />
            <ProTable
              columns={columns()}
              actionRef={tableRef}
              pagination={false}
              search={false}
              columnsState={{
                persistenceKey: 'FeedBackTable',
                persistenceType: 'localStorage',
                defaultValue: columnsStateDefault,
              }}
              toolBarRender={false}
              params={{
                list: feedbackList,
              }}
              request={async params => {
                const { list } = params || {};
                const resultData =
                  list?.map((item, index) => ({
                    ...item,
                    allIndex: index + 1,
                  })) || [];
                return { data: resultData, success: true };
              }}
            />
          </div>
        )}
      <FormActions
        className='footWrapper'
        place='center'
        buttons={compact([
          canFill &&
            currentTab === FILLED_DATA &&
            checkAuth('/cbam/precursorFill/submit', {
              key: 'submit',
              type: 'primary',
              title: I18N.supplyChainCarbonManagement.saveAndSubmit2,
              loading: submitLoading,
              onClick: async () => {
                const values = await form.submit<PrecursorDataFillResp>();
                const { supplyAttributionList } = values;

                /** 校验排放数据 */
                const emissionValidation = supplyAttributionList?.some(
                  item =>
                    item.emissionElement !== IMPLIED_EMISSION_INDIRECT &&
                    (isNaN(item.emission) || !item.emissionSource),
                );

                if (emissionValidation) {
                  Toast('error', I18N.cbam.pleaseImproveThePrecursor);
                  return;
                }

                const result = handleFormValues(values);

                try {
                  setSubmitLoading(true);
                  await postPrecursorDataFillDataSubmit({
                    ...result,
                    applyStatus: PENDING_APPROVAL,
                  });
                  Toast('success', I18N.Factors.saveSuccessful);
                  navigate(CBAMRouteMaps.cbamPrecursorDataFill);
                  setSubmitLoading(false);
                  form.reset();
                } catch (e) {
                  setSubmitLoading(false);
                  throw e;
                }
              },
            }),
          canFill &&
            currentTab === FILLED_DATA &&
            checkAuth('/cbam/precursorFill/fill', {
              key: 'save',
              type: 'primary',
              title: I18N.Factors.preserve,
              loading: saveLoading,
              onClick: async () => {
                const { values } = form.getState();

                const result = handleFormValues(values);

                try {
                  setSaveLoading(true);
                  await postPrecursorDataFillDataSubmit(result);
                  Toast('success', I18N.Factors.saveSuccessful);
                  navigate(CBAMRouteMaps.cbamPrecursorDataFill);
                  setSaveLoading(false);
                  form.reset();
                } catch (e) {
                  setSaveLoading(false);
                  throw e;
                }
              },
            }),
          {
            title: I18N.Factors.return,
            onClick: async () => {
              navigate(CBAMRouteMaps.cbamPrecursorDataFill);
            },
          },
        ])}
      />
      {/* 选择引用CBAM数据的弹窗 */}
      <ChooseCBAMDataModal
        open={chooseCBAMDataModelOpen}
        handleOk={({ selectRows }: { selectRows: CbamProductInfo[] }) => {
          const selectedProductId = selectRows?.[0]?.id;
          form.setValuesIn('saleProductId', selectedProductId);
          if (selectedProductId) {
            handleChooseCBAMDataModalOk({
              selectedProductId,
            });
          }
          setChooseCBAMDataModelOpen(false);
        }}
        handleCancel={() => setChooseCBAMDataModelOpen(false)}
      />
    </div>
  );
};

export default PrecursorDataFillInfo;
