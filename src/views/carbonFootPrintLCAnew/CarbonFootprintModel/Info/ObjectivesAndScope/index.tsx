/**
 * @description 目标与范围
 */

import { DownOutlined, UpOutlined } from '@ant-design/icons';
import FormilyPictureCardUpload from '@components/FormilyPictureCardUpload';
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  NumberPicker,
  Cascader,
  DatePicker,
} from '@formily/antd-v5';
import { createForm, onFieldValueChange, onFormInit } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { compact, isArray, isEmpty } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { TextArea } from '@/components/TextArea';
import { FormilySelectableTable } from '@/components/formily/SelectableTable';
import { usePageInfo, useAllEnumsBatch, useOrgs } from '@/hooks';
import { checkAuth } from '@/layout/utills';
import {
  LANG_TYPE,
  Toast,
  changeFactorM2cascaderOptions,
  handleLangFields,
  reverseHandleLangFields,
} from '@/utils';
import { ORG_STATUS } from '@/utils/const';
import { getProductionList } from '@/views/carbonFootPrintLCAnew/ProductManagement/service';
import { Product } from '@/views/carbonFootPrintLCAnew/ProductManagement/type';
import {
  useLcaDbList,
  useSysLifeCycleList,
} from '@/views/carbonFootPrintLCAnew/hook';
import { SOURCE_TYPE_MAPPING } from '@/views/carbonFootPrintLCAnew/utils';

import { CheckSaveModal } from './CheckSaveModal';
import {
  PREFARICATED_CONTENT,
  SYSTEM_BOUNDARY_TYPE,
  systemBoundaryOptionFn,
} from './constant';
import style from './index.module.less';
import { objectScopeReportSchema, objectScopeSchema } from './schemas';
import FormilySystemBoundaryRadio from '../../components/FormilySystemBoundaryRadio';
import { postModelAdd, postModelEdit } from '../../service';
import { ModelInfo } from '../../type';

const { HALF_LIFE_CYCLE, COMPLETE_LIFE_CYCLE, CUSTOM_LIFE_CYCLE } =
  SYSTEM_BOUNDARY_TYPE;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    TextArea,
    NumberPicker,
    Cascader,
    DatePicker,
    FormilySelectableTable,
    FormilySystemBoundaryRadio,
    FormilyPictureCardUpload,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

const ObjectivesAndScope = ({
  modelDetail,
  onSaveAndNextStepClick,
  onBackClick,
  isModelInfo,
}: {
  /** 模型详情 */
  modelDetail?: ModelInfo;
  /** 保存,下一步方法 */
  onSaveAndNextStepClick: ({ id }: { id?: number }) => void;
  /** 返回方法 */
  onBackClick: () => void;
  /** 是否是环境足迹模型跳转 */
  isModelInfo?: boolean;
}) => {
  /** 展开/收起其他非必填项 */
  const [expandOther, setExpandOther] = useState(false);

  const { isAdd, isDetail, id } = usePageInfo();

  /** 半生命周期枚举 */
  const halfLifeCycleList = useSysLifeCycleList(HALF_LIFE_CYCLE)?.map(
    lifeCycle => ({
      label: lifeCycle.stageName,
      value: lifeCycle.id,
    }),
  );

  /** 全生命周期枚举 */
  const completeLifeCycleList = useSysLifeCycleList(COMPLETE_LIFE_CYCLE)?.map(
    lifeCycle => ({
      label: lifeCycle.stageName,
      value: lifeCycle.id,
    }),
  );

  /** 自定义生命周期枚举 */
  const customLifeCycleList = useSysLifeCycleList(CUSTOM_LIFE_CYCLE)?.map(
    lifeCycle => ({
      label: lifeCycle.stageName,
      value: lifeCycle.id,
    }),
  );

  /** 所属组织枚举 */
  const orgList = useOrgs();

  /** 数据库列表 */
  const lcaDbList = useLcaDbList();

  const enumOptions = useAllEnumsBatch('factorUnitM,productOrigin');
  /** 单位枚举 */
  const unitEnum = enumOptions?.factorUnitM;
  /** 产品产地枚举 */
  const productOriginOptions = enumOptions?.productOrigin;

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 当前选择的组织ID */
  const [currentOrgId, setCurrentOrgId] = useState<number>();

  /** 产品的枚举 */
  const [productionOptions, setProductionOptions] = useState<Product[]>();

  /** 保存的接口 */
  const postApi = id ? postModelEdit : postModelAdd;

  /** 数据库权限 */
  const hasDbAuth = !!checkAuth('/carbonFootprintLCAnew/model/database', true);

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects() {
          onFormInit(current => {
            current.setFieldState('*(baselineUnit)', async state => {
              state.componentType = isDetail ? 'Input' : 'Cascader';
            });
            current.setFieldState(`selectedDb`, {
              disabled: !hasDbAuth || isDetail,
            });
          });
        },
      }),
    [],
  );

  /** 校验弹窗显隐 */
  const [openCheckModal, setOpenCheckModal] = useState(false);

  /** 校验弹窗信息 */
  const [checkModalInfo, setCheckModalInfo] = useState({
    funUnitChanged: false,
    systemChanged: false,
  });

  /** 保存下一步的方法 */
  const onSave = async () => {
    const values = await form.submit<ModelInfo>();

    /** 处理多语言 */
    const languageSourceList = handleLangFields({
      rawData: values,
      langType: LANG_TYPE.EN,
      sourceTypeMapping: SOURCE_TYPE_MAPPING,
      apiLanguageSourceList: [],
    });

    try {
      const {
        baselineUnit,
        productFlowDiagram,
        systemBoundaryImg,
        startTime,
        endTime,
        selectedDb,
      } = values || {};

      const result = {
        ...values,
        languageSourceList,
        baselineUnit: baselineUnit ? String(baselineUnit) : undefined,
        productFlowDiagram: isArray(productFlowDiagram)
          ? productFlowDiagram[0]?.url
          : productFlowDiagram,
        systemBoundaryImg: isArray(systemBoundaryImg)
          ? systemBoundaryImg[0]?.url
          : systemBoundaryImg,
        startTime: dayjs(startTime).format('YYYY-MM-DD HH:mm:ss'),
        endTime: dayjs(endTime).format('YYYY-MM-DD HH:mm:ss'),
        selectedDb: selectedDb ? String(selectedDb) : undefined,
      };
      setBtnLoading(true);

      const { data } = await postApi(result);
      Toast('success', I18N.Factors.saveSuccessful);
      setBtnLoading(false);
      setOpenCheckModal(false);
      form.reset();
      onSaveAndNextStepClick?.({
        id: data?.data || id,
      });
    } catch (e) {
      setBtnLoading(false);
      throw e;
    }
  };

  /** 监听表单 */
  const onAddFormListenerFn = () => {
    form.removeEffects('productId');
    /** 切换组织获取组织下的产品列表 */
    form.addEffects('productId', () => {
      onFieldValueChange('orgId', field => {
        form.reset('productId');
        setProductionOptions(undefined);
        setCurrentOrgId(field.value);
      });
    });
  };

  /** 获取产品的枚举 */
  useEffect(() => {
    // if (!currentOrgId) {
    //   setProductionOptions(undefined);
    //   return;
    // }
    getProductionList({
      pageNum: 1,
      pageSize: 100000,
      orgId: currentOrgId,
    }).then(({ data }) => {
      setProductionOptions(data?.data?.list);
    });
  }, [currentOrgId]);

  useEffect(() => {
    /** 新增时、监听表单 */
    if (isAdd && !id && !modelDetail) {
      /** 系统边界-默认半生命周期 */
      form.setFieldState('systemBoundaryType', {
        value: HALF_LIFE_CYCLE,
      });
      /** 新增时：模型编码自动生成 */
      form.setFieldState('modelCode', {
        value: `MX${new Date().getTime()}`,
      });
      /** 新增时：研究目标、系统边界描述（中文）、截止规则的预制内容 */
      form.setValues({
        ...PREFARICATED_CONTENT,
      });
      onAddFormListenerFn();
    }
    if (id && modelDetail && !isEmpty(unitEnum)) {
      /** 编辑时，所属组织和产品不可以编辑 */
      form.setFieldState('*(orgId,productId)', {
        disabled: true,
        required: false,
      });

      const {
        orgId,
        baselineUnit,
        productFlowDiagram,
        systemBoundaryImg,
        selectedDb,
      } = modelDetail || {};

      /** 获取组织id */
      setCurrentOrgId(orgId);

      /** 已选数据库 */
      const selectedDbArr = selectedDb
        ? selectedDb.split(',').map(s => Number(s))
        : [];

      /** 基准流数量单位 */
      const baselineUnitArr = baselineUnit ? baselineUnit.split(',') : [];

      const baselineUnitItem = unitEnum?.find(
        item => item.dictValue === baselineUnitArr[1],
      );
      /** 产品工艺流程图的名称 */
      const productFlowDiagramNameArr = productFlowDiagram?.split('/');
      /** 产品工艺流程图 */
      const productFlowDiagramArr = productFlowDiagram
        ? [
            {
              url: productFlowDiagram,
              uid: `${new Date().getTime() + 1}`,
              name: productFlowDiagramNameArr?.[
                productFlowDiagramNameArr.length - 1
              ],
            },
          ]
        : undefined;

      /** 系统边界图的名称 */
      const nameArr = systemBoundaryImg?.split('/');
      /** 系统边界图 */
      const systemBoundaryImgArr = systemBoundaryImg
        ? [
            {
              url: systemBoundaryImg,
              uid: `${new Date().getTime() + 2}`,
              name: nameArr?.[nameArr.length - 1],
            },
          ]
        : undefined;

      /** 反处理多语言 */
      const langFields = reverseHandleLangFields(
        modelDetail?.languageSourceList,
      );

      form.setValues({
        ...modelDetail,
        ...langFields,
        baselineUnit:
          isDetail && baselineUnit
            ? baselineUnitItem?.dictLabel
            : baselineUnitArr,
        productFlowDiagram: productFlowDiagramArr,
        systemBoundaryImg: systemBoundaryImgArr,
        selectedDb: selectedDbArr,
        orgId: isDetail ? modelDetail?.orgName : modelDetail?.orgId,
        productId: isDetail
          ? `${modelDetail?.productName} ${modelDetail?.productCode}`
          : modelDetail?.productId,
      });

      /** 监听表单 */
      onAddFormListenerFn();
    }
  }, [isAdd, id, modelDetail, unitEnum]);

  /** 枚举值 */
  useEffect(() => {
    if (halfLifeCycleList || completeLifeCycleList || customLifeCycleList) {
      /** 系统边界 */
      form.setFieldState('systemBoundaryType', {
        dataSource: systemBoundaryOptionFn({
          halfLifeCycleList,
          completeLifeCycleList,
          customLifeCycleList,
        }),
      });
    }

    if (orgList) {
      /** 所属组织 */
      form.setFieldState('orgId', {
        dataSource: orgList.map(item => ({
          label: item.orgName,
          value: item.id,
          disabled: item.orgStatus === ORG_STATUS.DISABLE,
        })),
      });
    }

    /** 产品 */
    form.setFieldState('productId', {
      dataSource: productionOptions?.map(item => ({
        ...item,
        label: `${item.productName} ${item.productCode}`,
        value: item.id,
      })),
    });

    if (unitEnum) {
      /** 基准流数量单位 */
      form.setFieldState('baselineUnit', {
        dataSource: changeFactorM2cascaderOptions(unitEnum),
      });
    }

    /** 产品产地 */
    if (productOriginOptions) {
      form.setFieldState('*(productOrigin,salesArea)', {
        dataSource: productOriginOptions.map(item => ({
          ...item,
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });
    }
  }, [
    halfLifeCycleList,
    completeLifeCycleList,
    customLifeCycleList,
    orgList,
    productionOptions,
    unitEnum,
    productOriginOptions,
  ]);

  useEffect(() => {
    /** 已选数据库 */
    if (lcaDbList) {
      /** 数据库列表 */
      const newLcaDbList =
        lcaDbList?.map(item => ({
          id: item?.id,
          dbName: item?.dbName,
        })) || [];

      /** 第一个数据的ID */
      const firstId = newLcaDbList?.[0]?.id;

      form.setFieldState('selectedDb', {
        dataSource: newLcaDbList,
      });

      /** 新增时默认选中第一个 */
      if (firstId && isAdd && !id && !modelDetail) {
        form.setValuesIn('selectedDb', [firstId]);
      }
    }
  }, [lcaDbList]);

  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <Form form={form} previewTextPlaceholder='-'>
          <SchemaField schema={objectScopeSchema()} />
          <h3 className={style.title}>
            {I18N.carbonFootPrintLCA.informationForReportingPurposes}
          </h3>
          <div className={style.reportTip}>
            <div>
              <span className='ant-formily-item-asterisk'>*</span>
              {I18N.carbonFootPrintLCA.ifYouNeedToUseSelf}
            </div>
            <div>
              <span className='ant-formily-item-asterisk'>*</span>
              {I18N.carbonFootPrintLCA.informationForReportingPurposes2}
            </div>
          </div>
          <Button
            className={style.expandBtn}
            type='link'
            onClick={() => {
              setExpandOther(!expandOther);
            }}
          >
            {expandOther ? (
              <div>
                {I18N.carbonFootPrintLCA.foldReportInfo}
                <UpOutlined />
              </div>
            ) : (
              <div>
                {I18N.carbonFootPrintLCA.unfoldReportInfo}
                <DownOutlined />
              </div>
            )}
          </Button>
          <div hidden={!expandOther}>
            <SchemaField schema={objectScopeReportSchema()} />
          </div>
        </Form>
      </div>
      <FormActions
        className='footWrapper'
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.Factors.saveNextStep,
            type: 'primary',
            loading: btnLoading,
            onClick: async () => {
              const values = await form.submit<ModelInfo>();

              const { baselineNum, lifeCycleList, systemBoundaryType } =
                values || {};

              /** 功能单位是否变更 */
              const funUnitChanged = !!(
                modelDetail?.baselineNum &&
                Number(modelDetail?.baselineNum) !== Number(baselineNum)
              );

              /** 系统边界是否变更 */
              const systemChanged =
                !!(
                  modelDetail?.lifeCycleList &&
                  String(modelDetail?.lifeCycleList) !== String(lifeCycleList)
                ) ||
                !!(
                  modelDetail?.systemBoundaryType &&
                  Number(modelDetail?.systemBoundaryType) !==
                    Number(systemBoundaryType)
                );

              setCheckModalInfo({
                funUnitChanged,
                systemChanged,
              });

              if (funUnitChanged || systemChanged) {
                /** 打开校验弹窗 */
                setOpenCheckModal(true);
              } else {
                /** 直接保存 */
                onSave();
              }
            },
          },
          (!isDetail || isModelInfo) && {
            title: I18N.Factors.return,
            onClick: async () => {
              onBackClick();
            },
          },
        ])}
      />

      <CheckSaveModal
        open={openCheckModal}
        checkModalInfo={checkModalInfo}
        onCancel={() => {
          setOpenCheckModal(false);
        }}
        onOk={() => {
          onSave();
        }}
      />
    </div>
  );
};
export default ObjectivesAndScope;
