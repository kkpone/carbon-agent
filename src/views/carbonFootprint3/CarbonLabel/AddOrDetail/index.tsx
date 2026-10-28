import useUrlState from '@ahooksjs/use-url-state';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import {
  ArrayTable,
  Cascader,
  DatePicker,
  Editable,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Select,
} from '@formily/antd-v5';
import {
  Form,
  createForm,
  onFieldValueChange,
  onFormValuesChange,
} from '@formily/core';
import { ISchema, createSchemaField } from '@formily/react';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { FormilyUploadCrop } from '@src/components/FormilyUtil/FormilyUploadCrop';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Modal, Spin } from 'antd';
import classNames from 'classnames';
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { CarbonLabelPreviewShowHidden } from './constant';
import style from './index.module.less';
import './index.less';
import {
  carbonLabelAccountSchema,
  carbonLabelProductInfoSchema,
  carbonLabelTypeSchema,
} from './schema';
import {
  CarbonLabelSubApiData,
  CarbonLabelSubValues,
  UrlStateProps,
} from './type';
import { ProductAccountingList } from '../../FootprintAccount/component/ProductSelectAccount/type';
import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION,
  FootprintAccountStatusType,
} from '../../FootprintAccount/constant';
import TextWidthOverflow from '../../component/TextOverflowTable/byWidth';
import { getCommonAccountListData, getCommonProductList } from '../../service';
import { CommonProductListData, CommonProductListDataParams } from '../../type';
import { AuditList } from '../component/AuditList';
import { AuditListData } from '../component/AuditList/type';
import FormilyClassRadios from '../component/FormilyClassRadios';
import FormilyLabelTabs from '../component/FormilyLabelTabs';
import { PreviewH5 } from '../component/PreviewH5';
import { PreviewH5Props } from '../component/PreviewH5/type';
import { ApplyForAccountStatus, ApplyForLabelType } from '../constant';
import {
  getCarbonLabelAuditList,
  getCarbonLabelContrastList,
  getCarbonLabelDetail,
  getCarbonLabelPrviewInit,
  postCarbonLabelApplyAdd,
  postCarbonLabelApplyAddDraft,
  postCarbonLabelApplyEdit,
  postCarbonLabelApplyEditDraft,
} from '../service';
import { CarbonLabelListData } from '../type';

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormLayout,
    FormGrid,
    FormItem,
    Input,
    Cascader,
    Select,
    ArrayTable,
    Editable,
    Radio,
    DatePicker,
    FormilyLabelTabs,
    FormilyUploadCrop,
    FormilyClassRadios,
  },
});

const { confirm } = Modal;

const { QUICK } = FootprintAccountStatusType;
const { SHOW } = CarbonLabelPreviewShowHidden;
const { ACCOUNT } = ApplyForLabelType;
const { NOT_PASS } = ApplyForAccountStatus;

const CarbonLabelDetail: FC = () => {
  const history = useHistory();
  /** 预览图的信息 */
  const previewInfo = useRef<PreviewH5Props['info']>();

  /** 未通过状态下存储下id，可能存在产品或者核算被删除 */
  const ProudctIdOrAccountId = useRef<{
    productId?: number;
    accountId?: number;
  }>();

  /** 是否更新预览图信息 开关 只有等于true才会执行 */
  const changeFormValuesStatus = useRef<boolean>(true);

  /** 核算信息申请标签需要回显功能单位，所以初始化的时候不能清空功能单位，主要是产品赋值后会清空功能单位的值 开关 只有等于true才会执行 */
  const carbonAccountAddLabel = useRef<boolean>(true);

  /** 页面存储参数 */
  const [urlState] = useUrlState<UrlStateProps>();

  const isAdd = !urlState?.status;
  const isEdit = urlState?.status === 'edit';
  const isDetail = urlState?.status === 'detail';

  /** 是否显示审核列表 */
  const [showAuditList, setShowAuditList] = useState(false);
  /** 审核列表数据 */
  const [auditListData, setAuditListData] = useState<AuditListData[]>();

  /** 预览图的信息 */
  const [previewInfoState, setPreviewInfoState] = useState<
    PreviewH5Props['info']
  >({
    labelType: ACCOUNT,
    specsShow: SHOW,
    periodShow: SHOW,
    contrastShow: SHOW,
  });
  /** 查询逻辑 */
  const [params] = useState<CommonProductListDataParams>({
    pageNum: 1,
    pageSize: 1000,
  });

  /** 产品信息的schema */
  const [productInfoSchema, setProductInfoSchema] = useState<ISchema>();

  /** form区域加载 */
  const [formLoading, setFormLoading] = useState(false);

  /**
   * 动态设置title
   * @param titleName 名称
   * @param form 表单实例
   * @param currentValue 当前值
   * @param setFieldPath 设置目标字段title
   * @returns
   */
  const showHidenTitle = (
    titleName: string,
    currentValue: number,
    setFieldPath: string,
    form: Form<Record<string, any>>,
  ) => (
    <span>
      <span>{titleName}</span>
      <IconFont
        type={
          currentValue === CarbonLabelPreviewShowHidden.SHOW
            ? 'icon-icon-xianzhi'
            : 'icon-icon-yinzang'
        }
        style={{
          marginLeft: 5,
          cursor: 'pointer',
          fontSize: 14,
        }}
        onClick={() => {
          form.setValuesIn(
            setFieldPath,
            currentValue === CarbonLabelPreviewShowHidden.SHOW
              ? CarbonLabelPreviewShowHidden.HIDDEN
              : CarbonLabelPreviewShowHidden.SHOW,
          );
        }}
      />
    </span>
  );

  /**
   * 设置核算下拉的每一项node元素
   * @param row 每一项的展示
   * @returns 返回dom元素
   */
  const listNode = (row: ProductAccountingList): ReactNode => (
    <div className='optionNodeMain'>
      <div>
        <TextWidthOverflow
          width={400}
          autoWidth='95%'
          value={row.accountName}
        />
      </div>

      <div className='optionNodeDate'>
        {row.startTime}
        {I18N.carbonFootprint.to}
        {row.endTime}
      </div>
      <div
        className={`optionNodeType ${
          row.type === QUICK ? 'optionNodeTypeQuick' : 'optionNodeTypeProcess'
        }`}
      >
        {FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION[row.type]}
      </div>
    </div>
  );

  /**
   * 获取功能单位的下拉
   * @param productId 产品信息
   */
  const getAccountList = async (productId: number) => {
    const { data } = await getCommonAccountListData({
      pageNum: 1,
      pageSize: 999,
      productId,
    });
    return data.data.rows;
  };

  const getAccountListNode = async (productId: number) => {
    const datas = await getAccountList(productId);
    return datas.map(row => ({
      ...row,
      accountNameNode: listNode(row),
    }));
  };

  /**
   * 根据产品名称选中，联动需要赋值的表单
   * @param info
   * @param form
   */
  const changeFormByProductId = (
    info: CommonProductListData,
    form: Form<any>,
  ) => {
    // 联动设置其他值
    if (info) {
      form.setValuesIn('specs', info.specification);
      form.setValuesIn(
        'productPic',
        info.productPic
          ? [
              {
                url: info.productPic,
                name: I18N.carbonFootprint3.productImages,
                id: 'chanpintup1',
              },
            ]
          : [],
      );

      if (changeFormValuesStatus.current) {
        previewInfo.current = {
          ...previewInfoState,
          ...previewInfo.current,
          ...info,
        };

        setPreviewInfoState(previewInfo.current);
      }
    }
  };

  /**
   * 根据功能单位名称选中，联动需要赋值的表单
   * @param info 选中的详细信息
   * @param form 表单实例
   */
  const changeFormByAccountId = (
    info: ProductAccountingList,
    form: Form<any>,
    productId?: number,
  ) => {
    form.setValuesIn('period', [info?.startTime, info?.endTime]);
    // 碳披露预览接口
    getCarbonLabelPrviewInit({
      accountId: info.id,
      productId: productId || form.getValuesIn('productId'),
    }).then(backData => {
      if (changeFormValuesStatus.current) {
        previewInfo.current = {
          ...previewInfoState,
          ...previewInfo.current,
          accountObj: backData.data.data.accountObj,
          startTime: info?.startTime,
          endTime: info?.endTime,
          unitName: info?.unitName,
        };
        setPreviewInfoState(previewInfo.current);
      }
    });
  };

  const applyForForm = useMemo(
    () =>
      createForm<any>({
        readPretty: isDetail,
        initialValues: {
          labelType: ACCOUNT,
          specsShow: SHOW,
          periodShow: SHOW,
          contrastShow: SHOW,
        },
        effects() {
          onFormValuesChange(backForm => {
            if (!carbonAccountAddLabel.current) return;
            if (!changeFormValuesStatus.current) return;
            const { values }: { values: CarbonLabelSubValues } = backForm;
            const previewData: Partial<CarbonLabelSubApiData> = {
              productPic: values?.productPic?.[0]?.url,
              brand: values?.brand,
              startTime: values?.period?.[0],
              endTime: values?.period?.[1],
              periodShow: values?.periodShow,
              specs: values?.specs,
              specsShow: values?.specsShow,
              contrastShow: values?.contrastShow,
              contrastValues: values?.contrastValuesArr
                ? values.contrastValuesArr.join(',')
                : undefined,
            };
            previewInfo.current = {
              ...previewInfoState,
              ...previewInfo.current,
              ...previewData,
            };

            setPreviewInfoState(previewInfo.current);
          });
          onFieldValueChange('specsShow', (field, backForm) => {
            backForm.setFieldState('specs', {
              title: showHidenTitle(
                I18N.carbonFootprint.specificationAndModel,
                field.value,
                'specsShow',
                backForm,
              ),
            });
          });
          onFieldValueChange('periodShow', (field, backForm) => {
            backForm.setFieldState('period', {
              title: showHidenTitle(
                I18N.carbonFootprint.accountingCycle,
                field.value,
                'periodShow',
                backForm,
              ),
            });
          });
          onFieldValueChange('contrastShow', (field, backForm) => {
            backForm.setFieldState('contrastValuesArr', {
              title: showHidenTitle(
                I18N.carbonFootprint3.carbonEmissionCategories,
                field.value,
                'contrastShow',
                backForm,
              ),
              required: false,
            });
          });
          /**
           * 只有选择产品名称后才会显示功能单位
           */
          onFieldValueChange('productId', (field, backForm) => {
            if (!carbonAccountAddLabel.current) return;
            if (!changeFormValuesStatus.current) return;
            const val = field.value;
            const dataSource = field.dataSource as CommonProductListData[];

            const fieldInputInfo: CommonProductListData | undefined =
              dataSource.find(data => data.id === val);

            // 联动设置其他值
            if (fieldInputInfo) {
              changeFormByProductId(fieldInputInfo, backForm);
            }

            if (val) {
              backForm.setFieldState('accountId', {
                readPretty: false,
                value: undefined,
              });
              backForm.setFieldState('period', {
                value: undefined,
              });
              getAccountListNode(val).then(dataNodes => {
                backForm.setFieldState('accountId', {
                  dataSource: dataNodes,
                });
              });
            } else {
              backForm.setFieldState('accountId', {
                readPretty: true,
                value: undefined,
              });
              backForm.setFieldState('*(period, specs, productPic)', {
                value: undefined,
              });
              previewInfo.current = {
                brand: previewInfo.current?.brand,
                labelType: previewInfo.current?.labelType,
                specsShow: previewInfo.current?.specsShow,
                periodShow: previewInfo.current?.periodShow,
                contrastShow: previewInfo.current?.contrastShow,
              };
              setPreviewInfoState(previewInfo.current);
            }
            // 清空未通过状态下全局的productId
            if (ProudctIdOrAccountId.current?.productId) {
              ProudctIdOrAccountId.current.productId = undefined;
            }
          });

          /** 功能单位 - 联动核算周期的回显 */
          onFieldValueChange('accountId', (field, backForm) => {
            if (!carbonAccountAddLabel.current) return;
            if (!changeFormValuesStatus.current) return;
            const { value } = field;
            const dataSource = field.dataSource as ProductAccountingList[];

            if (!dataSource) {
              previewInfo.current = {
                ...previewInfoState,
                ...previewInfo.current,
                accountObj: undefined,
                accountId: undefined,
              };
              setPreviewInfoState(previewInfo.current);
              return;
            }
            const fieldInputInfo: ProductAccountingList | undefined =
              dataSource.find(data => data.id === value);

            if (value && fieldInputInfo) {
              changeFormByAccountId(fieldInputInfo, backForm);
            } else {
              backForm.setValuesIn('period', undefined);
              previewInfo.current = {
                ...previewInfoState,
                ...previewInfo.current,
                accountObj: undefined,
                accountId: undefined,
              };
              setPreviewInfoState(previewInfo.current);
            }
            // 清空未通过状态下全局的productId
            if (ProudctIdOrAccountId.current?.accountId) {
              ProudctIdOrAccountId.current.accountId = undefined;
            }
          });
        },
      }),
    [],
  );

  /**
   * 错误编码提示 - 产品被删除，功能单位核算被删除
   * @param errorCode 1 产品 2功能单位 核算
   */
  const getErrorCodeModal = (errorCode: number) => {
    const errorTextArr = [
      '',
      I18N.carbonFootprint3.product,
      I18N.carbonFootprint3.functionalUnits,
    ];
    const errorText = errorTextArr[errorCode];
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.error, { val1: errorText }),

      okButtonProps: {},
      icon: null,
      onOk: async () => {
        if (errorCode === 1) {
          applyForForm.setFieldState(
            '*(productId,accountId ,period, specs, productPic)',
            {
              value: undefined,
            },
          );
          const productList = await getProductList();
          applyForForm.setFieldState('productId', {
            dataSource: productList,
          });
          applyForForm.setFieldState('accountId', {
            dataSource: [],
          });
          previewInfo.current = {
            brand: previewInfo.current?.brand,
            labelType: previewInfo.current?.labelType,
            specsShow: previewInfo.current?.specsShow,
            periodShow: previewInfo.current?.periodShow,
            contrastShow: previewInfo.current?.contrastShow,
          };
          setPreviewInfoState(previewInfo.current);
        }

        if (errorCode === 2) {
          applyForForm.setFieldState('*(accountId, period)', {
            value: undefined,
          });
          const formProductId = applyForForm.getValuesIn('productId');
          // 如果有选择的产品id
          if (formProductId) {
            const dataNodes = await getAccountListNode(formProductId);
            applyForForm.setFieldState('accountId', {
              dataSource: dataNodes,
            });
          }

          previewInfo.current = {
            ...previewInfoState,
            ...previewInfo.current,
            accountObj: undefined,
            accountId: undefined,
          };
          setPreviewInfoState(previewInfo.current);
        }
      },
    });
  };

  /**
   * 获取form的values
   * @param verifyStatus true 需要校验 false 不需要校验，存为草稿
   */
  const changeFormDataToApi = async (verifyStatus: boolean) => {
    const formValues: CarbonLabelSubValues = verifyStatus
      ? await applyForForm.submit()
      : applyForForm.values;
    setFormLoading(true);
    const {
      labelType,
      productId,
      accountId,
      productPic,
      brand,
      period,
      periodShow,
      specs,
      specsShow,
      contrastShow,
      contrastValuesArr,
    } = formValues;

    const productDataSource = applyForForm.getFieldState('productId')
      ?.dataSource as CommonProductListData[] | undefined;
    const accountDataSource = applyForForm.getFieldState('accountId')
      ?.dataSource as ProductAccountingList[] | undefined;

    // 拦截处理存为草稿状态
    if (!verifyStatus) {
      const subDraftData: Partial<CarbonLabelSubApiData> = {
        labelType,
        accountId: accountDataSource?.find(source => source.id === accountId)
          ? accountId
          : ProudctIdOrAccountId.current?.accountId || undefined,
        accountName: accountDataSource
          ? accountDataSource.find(source => source.id === accountId)
              ?.accountName
          : undefined,
        productId: productDataSource?.find(source => source.id === productId)
          ? productId
          : ProudctIdOrAccountId.current?.productId || undefined,
        productName: productDataSource
          ? productDataSource.find(source => source.id === productId)
              ?.productName
          : undefined,
        productPic: productPic?.[0]?.url,
        brand,
        startTime: period?.[0],
        endTime: period?.[1],
        periodShow,
        specs,
        specsShow,
        contrastShow,
        contrastValues: contrastValuesArr
          ? contrastValuesArr.join(',')
          : undefined,
      };
      try {
        if (isEdit) {
          const { data } = await postCarbonLabelApplyEditDraft({
            ...subDraftData,
            id: urlState?.productId,
          });

          if (data.data.errorCode) {
            getErrorCodeModal(data.data.errorCode);
            return;
          }
        } else {
          const { data } = await postCarbonLabelApplyAddDraft(subDraftData);
          if (data.data.errorCode) {
            getErrorCodeModal(data.data.errorCode);
            return;
          }
        }
        Toast(
          'success',
          isEdit
            ? I18N.carbonFootprint3.draftHasBeenModified
            : I18N.carbonFootprint3.savedAsDraft,
        );
        history.push(RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabel);
      } finally {
        setFormLoading(false);
      }
      return;
    }

    // 处理提交或者编辑
    if (!productDataSource || !accountDataSource) return;
    const productInfo = productDataSource.find(
      source => source.id === productId,
    );
    const accountInfo = accountDataSource.find(
      source => source.id === accountId,
    );
    const subApiData: CarbonLabelSubApiData = {
      labelType,
      accountId: accountDataSource?.find(source => source.id === accountId)
        ? accountId
        : ProudctIdOrAccountId.current?.accountId || undefined,
      accountName: accountInfo?.accountName || previewInfo.current?.accountName,
      productId: productDataSource?.find(source => source.id === productId)
        ? productId
        : ProudctIdOrAccountId.current?.productId || undefined,
      productName: productInfo?.productName || previewInfo.current?.productName,
      productPic: productPic?.[0]?.url,
      brand,
      startTime: period?.[0] || '',
      endTime: period?.[1] || '',
      periodShow,
      specs,
      specsShow,
      contrastShow,
      contrastValues: contrastValuesArr
        ? contrastValuesArr.join(',')
        : undefined,
    };
    try {
      if (isEdit) {
        const { data } = await postCarbonLabelApplyEdit({
          ...subApiData,
          id: Number(urlState?.productId),
        });
        if (data.data.errorCode) {
          getErrorCodeModal(data.data.errorCode);
          return;
        }
      } else {
        const { data } = await postCarbonLabelApplyAdd(subApiData);
        if (data.data.errorCode) {
          getErrorCodeModal(data.data.errorCode);
          return;
        }
      }

      Toast(
        'success',
        isEdit
          ? I18N.carbonFootprint3.editingApplicationCompleted
          : I18N.carbonFootprint3.newApplicationCompleted,
      );
      history.push(RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabel);
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * 产品列表 - 动态设置样式
   * @param pageParams 自定义参数
   * @returns
   */
  const getProductList = async (pageParams?: CommonProductListDataParams) => {
    const { data } = await getCommonProductList(pageParams || params);
    return data.data.rows;
  };

  /**
   * 获取碳排放类比
   */
  const getContrastList = async () => {
    const { data } = await getCarbonLabelContrastList();
    applyForForm.setFieldState('contrastValuesArr', {
      dataSource: data.data,
    });
  };

  /**
   * 初始化 - 回显form的值
   * @param data 接口返回值
   */
  const initFormValues = (
    data: CarbonLabelListData,
    productList: CommonProductListData[],
    accountList: ProductAccountingList[],
  ) => {
    const {
      labelType,
      productId,
      productName,
      productPic,
      specs,
      specsShow,
      accountId,
      accountName,
      brand,
      startTime,
      endTime,
      periodShow,
      contrastValues,
      contrastShow,
      status,
    } = data;

    const haveProduct = productList.find(product => product.id === productId);
    const haveAccount = accountList.find(account => account.id === accountId);

    const values: CarbonLabelSubValues = {
      labelType,
      productId: isDetail || !haveProduct ? productName : productId,
      specs,
      specsShow,
      accountId: isDetail || !haveAccount ? accountName : accountId,
      brand,
      productPic: productPic
        ? [
            {
              url: productPic,
              name: I18N.carbonFootprint3.productImages,
              uid: 'chanpintup1',
            },
          ]
        : [],
      period: startTime ? [startTime, endTime] : undefined,
      periodShow,
      contrastValuesArr: contrastValues
        ? contrastValues.split(',').map(val => Number(val))
        : [],
      contrastShow,
    };

    // 插入逻辑，如果未通过需要全局存储id，防止产品被删除后查询到，提交无法校验问题
    if (status === NOT_PASS) {
      ProudctIdOrAccountId.current = {
        productId,
        accountId,
      };
    }

    applyForForm.setValues(values);

    // 只有不是详情才会设置为不可编辑
    if (!isDetail) {
      applyForForm.setFieldState('accountId', {
        readPretty: false,
      });
    }
  };

  /**
   * 初始化 - 审核列表
   * @param applyNum 审核编号
   */
  const initAuditList = async (applyNum: string) => {
    const { data } = await getCarbonLabelAuditList({ applyNum });
    setAuditListData(data.data);
  };

  /**
   * 初始化详情
   * @param id 详情id
   */
  const initDetailOrEdit = async (
    id: string,
    prouctList: CommonProductListData[],
  ) => {
    changeFormValuesStatus.current = false;
    const { data } = await getCarbonLabelDetail({ id });
    let accountList: ProductAccountingList[] = [];
    // 可能存在产品被删除的情况
    if (data.data.productId) {
      const dataNodes = await getAccountListNode(data.data.productId);
      accountList = dataNodes;
      applyForForm.setFieldState('accountId', {
        dataSource: dataNodes,
      });
    }

    initFormValues(data.data, prouctList, accountList);
    previewInfo.current = data.data;
    setPreviewInfoState({
      ...previewInfoState,
      ...previewInfo.current,
    });
    changeFormValuesStatus.current = true;
    // 如果产品或者核算被删除
    if (data.data.errorCode) {
      getErrorCodeModal(data.data.errorCode);
    }
    // 审核列表接口
    initAuditList(data.data.applyNum);
  };

  /**
   * 初始化碳足迹核算页面 申请碳标签
   * @param id 产品id
   * @param accountId 核算id
   */
  const initCarbonAccount = async (id: string, accountId: string) => {
    carbonAccountAddLabel.current = false;
    const dataNodes = await getAccountListNode(Number(id));
    const dataSource = applyForForm.getFieldState('productId')
      .dataSource as CommonProductListData[];
    const productIdInfo: CommonProductListData | undefined = dataSource.find(
      data => data.id === Number(id),
    );

    if (productIdInfo) {
      changeFormByProductId(productIdInfo, applyForForm);
    }

    const accountIdInfo: ProductAccountingList | undefined = dataNodes.find(
      data => data.id === Number(accountId),
    );
    applyForForm.setFieldState('accountId', {
      dataSource: dataNodes,
      readPretty: false,
    });

    if (accountIdInfo) {
      changeFormByAccountId(accountIdInfo, applyForForm, Number(id));
    }

    applyForForm.setValues({
      productId: Number(id),
      accountId: Number(accountId),
    });
    carbonAccountAddLabel.current = true;
  };

  const init = async () => {
    setFormLoading(true);
    const productList = await getProductList();
    await getContrastList();
    setProductInfoSchema(
      carbonLabelProductInfoSchema(productList, applyForForm),
    );

    /** 只有编辑和详情需要初始化 */
    if (urlState?.productId && !isAdd) {
      await initDetailOrEdit(urlState.productId, productList);
    }

    /** 处理碳足迹核算结果页面 申请碳标签的情况 */
    if (isAdd && urlState?.productId && urlState?.accountId) {
      await initCarbonAccount(urlState.productId, urlState.accountId);
    }
    setFormLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={style.carbonLabelDetail}>
      <div className={style.previewMain}>
        <div className={style.previewTitle}>
          <span className={style.headline}>
            {I18N.carbonFootprint3.preview}
          </span>

          <span className={style.headDescribe}>
            {I18N.carbonFootprint3.carbonFootprintDisclosure}
          </span>
        </div>
        <div className={style.h5Main}>
          <PreviewH5 info={previewInfoState} />
        </div>
      </div>
      <div
        className={style.applyMain}
        style={{
          width: showAuditList
            ? 'calc(100% - 320px - 300px)'
            : 'calc(100% - 320px)',
        }}
      >
        {!showAuditList && auditListData && (
          <div
            className={style.showAuditMain}
            onClick={() => {
              setShowAuditList(true);
            }}
          >
            <DoubleLeftOutlined size={12} />
            <span>{I18N.carbonFootprint3.applicationRecord}</span>
          </div>
        )}

        <div className={classNames(style.headline, 'm-b-16')}>
          {I18N.carbonFootprint3.applicationInformation}
        </div>
        <Spin spinning={formLoading}>
          <FormilyCommon form={applyForForm}>
            <FormLayout layout='vertical'>
              <div className={style.formTitle}>
                {I18N.carbonFootprint3.carbonLabelType}
              </div>
              <SchemaField schema={carbonLabelTypeSchema()} />
              <div className={style.formTitle}>
                {I18N.carbonFootprint3.productInformation}
              </div>
              {productInfoSchema && <SchemaField schema={productInfoSchema} />}
              <div className={style.formTitle}>
                {I18N.carbonFootprint.accountingInformation}
              </div>
              <SchemaField schema={carbonLabelAccountSchema(applyForForm)} />
            </FormLayout>
          </FormilyCommon>
        </Spin>
      </div>
      {showAuditList && auditListData && (
        <div className={style.auditMain}>
          <div className={style.auditHead}>
            <div
              className={style.iconMain}
              onClick={() => {
                setShowAuditList(false);
              }}
            >
              <DoubleRightOutlined size={12} />
            </div>
            <span className={style.headline}>
              {I18N.carbonFootprint3.applicationRecord}
            </span>
            <span className={style.headDescribe}>
              {previewInfo.current?.applyNum || '-'}
            </span>
          </div>
          <div className={style.auditContent}>
            <AuditList auditLists={auditListData} />
          </div>
        </div>
      )}
      <FormActions
        place='center'
        buttons={
          isDetail
            ? [
                {
                  title: I18N.carbonFootprint.return,
                  onClick: async () => {
                    history.push(
                      RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabel,
                    );
                  },
                },
              ]
            : [
                {
                  title: I18N.carbonFootprint3.saveAsDraft,
                  onClick: async () => {
                    await changeFormDataToApi(false);
                  },
                },
                {
                  type: 'primary',
                  title: I18N.carbonFootprint3.applyForCarbonLabels,
                  onClick: async () => {
                    await changeFormDataToApi(true);
                  },
                },
                {
                  title: I18N.carbonFootprint.cancel,
                  onClick: async () => {
                    history.push(
                      RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabel,
                    );
                  },
                },
              ]
        }
      />
    </div>
  );
};

export default CarbonLabelDetail;
