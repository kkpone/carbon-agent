/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @description: 碳足迹核算列表页面
 */
import useUrlState from '@ahooksjs/use-url-state';
import {
  EllipsisOutlined,
  InfoCircleFilled,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { listALLByDictTypeBatch } from '@src/api/api';
import carbonCoin from '@src/assets/svg/accountProductImg.svg';
import customerServiceImg from '@src/assets/svg/customer_service.svg';
import customerServiceGreenImg from '@src/assets/svg/customer_service_green.svg';
import noData from '@src/assets/svg/icon-zanmoneiyong.svg';
import serviceQrCode from '@src/assets/svg/service_qr_code.png';
import PurchaseModal from '@src/components/PurchaseModal';
import SkuCountLabel from '@src/components/SkuCountLabel';
import { SKU_STATUS } from '@src/components/SkuCountLabel/constant';
import { SkuCount } from '@src/components/SkuCountLabel/type';
import IconFont, {
  IconAlibaba,
  IconAlibabaNew,
} from '@src/components/iconfont';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import I18N, { LocaleType } from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { downloadFile } from '@src/utils';
import { ProductImportTableList } from '@src/views/carbonFootprint/components/ImportFile/type';
import { useDebounceFn, useInfiniteScroll, useMount } from 'ahooks';
import {
  Button,
  Input,
  Image,
  Spin,
  Tooltip,
  Modal,
  Popover,
  Dropdown,
  Menu,
  Tabs,
  Table,
} from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import AiImgBg from '@assets/svg/ai_btn_bg.svg';
import AiImg from '@assets/svg/ai_white.svg';
import demoIcon from '@/assets/svg/default.svg';
import { LocaleContext } from '@/components/LocaleProvider';
import { useSubscriptionServiceModal } from '@/components/SubscriptionServiceModal';
import { useUnit } from '@/hooks/useScope';
import { RootState } from '@/store';
import { getUserInfo } from '@/utils';
import { findDepDictByValue } from '@/views/enterpriseCarbonAccount2/ReducingAction/ReducingPlan/ReductionMeasures/utils';

import Guide from './Guide';
import ProductTypeModal from './ProductTypeModal';
import BatchCreateModel from './component/BatchCreateModel';
import BatchParseModel from './component/BatchParseModel';
import GlobalFactorPreference from './component/GlobalFactorPreference';
import ModelingRecord from './component/ModelingRecord';
import { BatchTaskStatus } from './component/ModelingRecord/type';
import ProductCarbonFootprintAI from './component/ProductCarbonFootprintAI';
import { ProductSelectAccount } from './component/ProductSelectAccount';
import {
  FOOTPRINT_ACCOUNT_TYPE_LABEL,
  FootprintAccountInfoUrlStatus,
  FootprintAccountTypeValue,
} from './constant';
import style from './index.module.less';
import {
  deleteProductType,
  getAllProductList,
  getAllProductTypeList,
  getFileProductImportApi,
  getProductTypeList,
  getSkuCount,
  getUserIdentity,
  postAccountProductAddData,
  postAccountProductEditData,
} from './service';
import { AccountProductData, ProductImportParams } from './type';
import { postProductLibraryDeleteData } from '../ProductManagement/service';
import { SubAccountProductFormData } from '../component/FormAccountProductDrawer/type';
import { postFileImportProductApi } from '../component/ImportFile/service';
import ImportFileModal from '../component/ImportFileModal';
import ProductModal from '../component/ProductModal';
import { FOOTPRINT3_IMPORT_MODAL_FILE_KEY } from '../constant';
import {
  haveAccountEditPermissions,
  haveProductAddPermissions,
  haveProductDeletePermissions,
  haveProductEditPermissions,
  haveProductUploadPermissions,
} from '../permissions';
import { STEP_OPTION_VALUE } from '../util/constant';

const { confirm } = Modal;

const allProductTypeKey = 'ALL';

/** 全部 已核算 未核算 */
const SearchType = Object.keys(FOOTPRINT_ACCOUNT_TYPE_LABEL).reverse();
const { ALL } = FootprintAccountTypeValue;
const { ADD } = FootprintAccountInfoUrlStatus;

const modeKey = 'productFP';

const FootprintAccountProductList = () => {
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);

  const [skuCount, setSkuCount] = useState<SkuCount>({
    useCount: 0,
    total: 0,
    status: SKU_STATUS.UN_LIMIT,
  });

  const { locale } = useContext(LocaleContext);

  const unitDict = useUnit();

  // 获取用户信息
  const userInfo = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  )?.userInfo;

  // 试用有效期天数
  const [duration, setDuration] = useState<number>(0);

  // 获取 userDemo 值（可能不在类型定义中）
  const userDemo = (userInfo as any)?.userDemo;

  const [productTypeList, setProductTypeList] = useState<
    {
      id: number;
      typeName: string;
      typeCode: string;
      status: number;
      productList: AccountProductData[];
    }[]
  >([]);

  const [productModalProps, setProductModalProps] = useState<{
    open: boolean;
    id?: number;
    isCopy?: boolean;
  }>({ open: false });

  const [allProductTypeList, setAllProductTypeList] = useState<
    {
      id: number;
      typeName: string;
      typeCode: string;
      status: number;
      productList: AccountProductData[];
    }[]
  >([]);

  const [editProductTypeId, setEditProductTypeId] = useState<number>();

  const [loading, setLoading] = useState(false);

  const [tableRefreshFlag, setTableRefreshFlag] = useState(true);

  const [tableData, setTableData] = useState<AccountProductData[]>([]);

  const [total, setTotal] = useState(0);

  const [productTypeModalVisible, setProductTypeModalVisible] = useState(false);

  const [globalFactorPreferenceOpen, setGlobalFactorPreferenceOpen] =
    useState(false);

  const [modelingRecordOpen, setModelingRecordOpen] = useState(false);

  const [batchParseModelOpen, setBatchParseModelOpen] = useState(false);
  /** 建模记录「待解析」查看时带入的任务 id，新建解析时不传 */
  const [batchParseModelTaskId, setBatchParseModelTaskId] = useState<number>();
  const [batchCreateModelOpen, setBatchCreateModelOpen] = useState(false);
  const [batchCreateModelTaskId, setBatchCreateModelTaskId] =
    useState<number>();

  /** 批量解析建模 AI 区块锚点，用于保留当前页面 AI 体验区域 */
  const aiSectionRef = useRef<HTMLDivElement>(null);

  const [deleteProductTypeModalOpen, setDeleteProductTypeModalOpen] =
    useState(false);

  // 跟踪当前预览打开的产品 ID，用于阻止预览时触发父元素的点击事件
  const [previewingProductId, setPreviewingProductId] = useState<number | null>(
    null,
  );

  const [currProductType, setCurrProductType] = useState<{
    id: number;
    typeName: string;
    typeCode: string;
  }>();

  const [deleteProductTypeLoading, setDeleteProductTypeLoading] =
    useState(false);

  const [urlParams, setUrlParams] = useUrlState<{
    status: number;
    mode: string;
    search?: string;
    productTypeName?: string;
    productType?: string;
    pageNum: number;
    pageSize: number;
  }>(
    {
      status: ALL,
      mode: ['card', 'table'].includes(localStorage.getItem(modeKey) || '')
        ? (localStorage.getItem(modeKey) as string)
        : 'card',
      productType: allProductTypeKey,
      pageNum: 1,
      pageSize: 10,
    },
    {
      parseOptions: {
        parseNumbers: true,
      },
    },
  );

  // 当前屏幕尺寸
  const { innerWidth } = window;

  const history = useHistory();

  /** 导入弹框 */
  const [importVisible, setImportVisible] = useState(false);
  /** 下载模版 - 模版地址 */
  const [downLoadTemplateUrl, setDownLoadTemplateUrl] = useState<string>('');
  const [downLoadTemplateName, setDownLoadTemplateName] = useState<string>();
  const [searchImportParams] = useState<ProductImportParams>({
    pageNum: 1,
    pageSize: 10,
    type: 0,
  });

  /** 侧滑抽屉 */

  const getAccountSkuSetting = async () => {
    const { data } = await getSkuCount();
    setSkuCount(data.data);
  };

  const fetchProductTypeList = async (
    params: {
      status?: number;
      search?: string;
      productTypeName?: string;
      // productType?: string;
    },
    options?: {
      expandAll?: boolean;
    },
  ) => {
    try {
      const { status, search, productTypeName } = params;

      const { data } = await getAllProductTypeList({
        status,
        // search,
        // productTypeName,
      });

      // 保存所有产品类型列表（用于 Tabs）
      setAllProductTypeList(data.data);
    } finally {
      // setLoading(false);
    }
  };

  /**
   * 点击产品的card前往详情页
   * @param id 选中的产品id
   * @param index 选中的下标
   */
  const clickProductCard = (id: number) => {
    history.push(
      `${
        RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail
      }?productId=${id}&status=${urlParams.status}&search=${
        urlParams.search || ''
      }&productTypeName=${urlParams.productTypeName || ''}`,
    );
  };

  /**
   * 新增产品的接口返回值
   * @param formData 表单的数据
   * @returns 返回接口返回值
   */
  const subFormApiBack = async (formData: SubAccountProductFormData) => {
    const { data } = await postAccountProductAddData({
      ...formData,
    });
    return data;
  };

  /**
   * 新增产品
   * @param data 表单返回值
   */
  const subForm = async (data: SubAccountProductFormData) => {
    await subFormApiBack(data);
    Toast('success', I18N.carbonFootprint.newSuccessfullyAdded2);
    setProductModalProps({ open: false });
    getAccountSkuSetting();
    fetchProductTypeList(
      {
        ...urlParams,
      },
      { expandAll: true },
    );

    if (urlParams.mode === 'table') {
      setTableRefreshFlag(flag => !flag);
      return;
    }
    reload();
  };
  /**
   * 保存并进行核算
   * @param data 表单填写的值
   */
  const subFormAndAccount = async (data: SubAccountProductFormData) => {
    const backApiData = await subFormApiBack(data);
    await getAccountSkuSetting();
    history.push(
      `${
        RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail
      }?productId=${backApiData.data}&openAdd=${true}`,
    );
  };

  /**
   * @description: 删除产品
   * @param {AccountProductData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (deleteItem: AccountProductData) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis6, {
        val1: deleteItem.productName,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postProductLibraryDeleteData({
            id: deleteItem.id,
          });
          if (back.data.code === 200) {
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
            getAccountSkuSetting();

            if (urlParams.mode === 'table') {
              setTableRefreshFlag(flag => !flag);
              return;
            }

            const index = data?.list?.findIndex(
              (item: any) => item.id === deleteItem.id,
            );
            if (index !== -1) {
              data?.list?.splice(index, 1);
              mutate({ ...data });
            }
            fetchProductTypeList(
              {
                ...urlParams,
              },
              { expandAll: true },
            );
          }
        } catch {
          /* empty */
        }
      },
    });
  };

  const editProduct = async productData => {
    await postAccountProductEditData(productData);
    Toast('success', I18N.carbonFootprint.editSuccessful);
    setProductModalProps({ open: false });

    if (urlParams.mode === 'table') {
      setTableRefreshFlag(flag => !flag);
    } else {
      getAllProductList({
        pageNum: 1,
        pageSize: 100000,
        status: ALL,
        productType:
          urlParams.productType === allProductTypeKey
            ? undefined
            : urlParams.productType,
      }).then(resp => {
        const list = resp.data?.data?.list || [];
        const index = list.findIndex((item: any) => item.id === productData.id);
        if (index !== -1) {
          data?.list?.splice(index, 1, list[index]);
          mutate({ ...data });
        }
      });
    }
  };
  /**
   * 取消导入
   */
  const onCancelImport = () => {
    setImportVisible(false);
  };

  /**
   * 导入成功
   */
  const onOkImport = () => {
    getAccountSkuSetting();
    fetchProductTypeList(
      {
        ...urlParams,
      },
      { expandAll: true },
    );
    if (urlParams.mode === 'card') {
      reload();
    } else if (urlParams.pageNum === 1) {
      setTableRefreshFlag(flag => !flag);
    } else {
      setUrlParams({
        ...urlParams,
        pageNum: 1,
      });
    }
  };

  /**
   * @description: 导入文件后的回调方法
   */
  const importFileRequestBack = async (url: string, fileName?: string) => {
    const { data } = await postFileImportProductApi({ fileUrl: url, fileName });

    return { code: data.code };
  };

  // 获取试用有效期天数
  useEffect(() => {
    if (userDemo === 1) {
      getUserIdentity()
        .then(res => {
          if (res.data?.code === 200 && res.data?.data) {
            setDuration(res.data.data.duration);
          }
        })
        .catch(() => {
          // 静默失败
        });
    }
  }, [userDemo]);

  useMount(async () => {
    const dic = await listALLByDictTypeBatch<{
      footprint3_export_template: Dicts[];
    }>({
      dictTypes: 'footprint3_export_template',
    });
    const { footprint3_export_template } = dic.data.data;

    footprint3_export_template.forEach(templ => {
      // 输出的下载模板地址
      if (
        templ.dictValue === FOOTPRINT3_IMPORT_MODAL_FILE_KEY.PRODUCT &&
        templ.relatedValue
      ) {
        setDownLoadTemplateUrl(templ.relatedValue);
        setDownLoadTemplateName(
          templ.relatedValue?.split('/')?.pop()?.split('.')?.[0],
        );
      }
    });
  });

  useEffect(() => {
    getAccountSkuSetting();
  }, []);

  useEffect(() => {
    fetchProductTypeList(
      {
        ...urlParams,
      },
      { expandAll: true },
    );
  }, [urlParams]);

  const { run: debounceSetSearchTextParams } = useDebounceFn(
    (newSearchText: { search?: string; productTypeName?: string }) => {
      setUrlParams({
        ...urlParams,
        ...newSearchText,
      });
    },
    { wait: 300 },
  );

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchText = {
      search: e.target.value || undefined,
    };
    debounceSetSearchTextParams(newSearchText);
  };

  const customerServicePopover = (props: {
    children: React.ReactNode;
    placement?: 'bottomRight' | 'bottom';
  }) =>
    skuCount.status === SKU_STATUS.FULL ? (
      <Popover
        trigger='hover'
        placement={props.placement}
        zIndex={800}
        content={
          <div className={style.skuPopover}>
            <div className={style.skuPopoverContent}>
              <InfoCircleFilled className={style.skuPopoverIcon} />
              <div>
                <div className={style['body-m-b']}>
                  {I18N.carbonFootprint3.currentNumberOfProducts}
                </div>
                <div className={style['caption-s']}>
                  {I18N.carbonFootprint3.ifNeededToContinue}
                </div>
              </div>
            </div>
            <div className={style.skuPopoverBottom}>
              <Popover
                trigger='hover'
                placement='bottom'
                content={
                  <div className={style.customerServiceQrCode}>
                    <span className={style['caption-s-b']}>
                      {I18N.carbonFootprint3.contactExclusiveCustomers}
                    </span>
                    <img
                      className={style.customerServiceQrCodeImg}
                      src={serviceQrCode}
                      alt=''
                    />
                  </div>
                }
              >
                <div className={style.customerService}>
                  <img
                    className={style.customerServiceImg}
                    src={customerServiceImg}
                    alt=''
                  />
                  <img
                    className={style.customerServiceGreenImg}
                    src={customerServiceGreenImg}
                    alt=''
                  />
                  {I18N.carbonFootprint3.contactCustomerService}
                </div>
              </Popover>
              <div
                className={style.skuPopoverBuyBtn}
                onClick={() => {
                  if (isPersonalCompany) {
                    openSubscriptionModal({
                      onSuccess: () => {
                        window.location.reload();
                      },
                    });
                    return;
                  }
                  setPurchaseModalVisible(true);
                }}
              >
                {I18N.carbonFootprint3.buyNow}
              </div>
            </div>
          </div>
        }
      >
        {props.children}
      </Popover>
    ) : (
      props.children
    );

  const editProductType = (id: number) => {
    setEditProductTypeId(id);
    setProductTypeModalVisible(true);
  };

  const onDeleteProductTypeModalClose = () => {
    setDeleteProductTypeModalOpen(false);
    setCurrProductType(undefined);
  };

  const onProductTypeDelete = async () => {
    const id = currProductType?.id;
    const typeCode = currProductType?.typeCode;
    if (!id) {
      onDeleteProductTypeModalClose();
      return;
    }
    try {
      setDeleteProductTypeLoading(true);
      await deleteProductType({ id });
      Toast('success', I18N.carbonFootprint.deleteSuccessful);
      onDeleteProductTypeModalClose();
      // 如果删除的是当前选中的 productType，切换到全部
      if (urlParams.productType === `${typeCode}`) {
        const newUrlParams = {
          ...urlParams,
          productType: allProductTypeKey,
        };
        setUrlParams(newUrlParams);
        fetchProductTypeList(
          {
            ...newUrlParams,
          },
          { expandAll: true },
        );
      } else {
        fetchProductTypeList(
          {
            ...urlParams,
          },
          { expandAll: true },
        );
      }
    } finally {
      setDeleteProductTypeLoading(false);
    }
  };

  const ref = useRef<HTMLDivElement>(null);

  const {
    data,
    loading: allLoading,
    loadMore,
    loadingMore,
    noMore,
    mutate,
    reload,
  } = useInfiniteScroll(
    async d => {
      if (urlParams.mode === 'table') {
        return {
          list: [],
          total: 0,
          currentPage: 1,
          pageSize: 12,
        };
      }
      const result = await getAllProductList({
        pageNum: (d?.currentPage || 0) + 1,
        pageSize: 12,
        productType:
          (urlParams.productType || allProductTypeKey) === allProductTypeKey
            ? undefined
            : urlParams.productType,
        status: urlParams.status,
        search: urlParams.search,
      });
      return {
        list: result.data.data.list,
        total: result.data.data.total,
        currentPage: (d?.currentPage || 0) + 1,
        pageSize: 12,
      };
    },
    {
      target: ref,
      isNoMore: d =>
        typeof d?.currentPage === 'number' &&
        typeof d?.pageSize === 'number' &&
        typeof d?.total === 'number'
          ? d.currentPage * d.pageSize >= d.total
          : false,
      reloadDeps: [
        urlParams.productType,
        urlParams.search,
        urlParams.status,
        urlParams.mode,
      ],
    },
  );

  useEffect(() => {
    const { mode, productType, ...params } = urlParams;
    if (mode === 'table') {
      setLoading(true);
      getAllProductList({
        ...params,
        productType:
          productType === allProductTypeKey ? undefined : productType,
      })
        .then(({ data }) => {
          setTableData(data.data.list);
          setTotal(data.data.total);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [urlParams, tableRefreshFlag]);

  useEffect(() => {
    localStorage.setItem(modeKey, urlParams.mode);
  }, [urlParams.mode]);

  const isPersonalCompany = getUserInfo()?.userInfo?.companyType === '2';

  const { openSubscriptionModal } = useSubscriptionServiceModal();

  /** 滚动至页面内 AI 批量解析建模区域 */
  const scrollToAiSection = () => {
    aiSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const showBatchParseModeling =
    haveAccountEditPermissions() && skuCount.status !== SKU_STATUS.FULL;

  const handleBatchTemplateDownload = () => {
    if (!downLoadTemplateUrl) {
      Toast('error', I18N.carbonFootprint3.requestFailed);
      return;
    }

    downloadFile(downLoadTemplateUrl, downLoadTemplateName);
  };

  return (
    <div className={style.FootprintAccountLess}>
      <ProductTypeModal
        visible={productTypeModalVisible}
        id={editProductTypeId}
        onClose={() => {
          setProductTypeModalVisible(false);
          setEditProductTypeId(undefined);
        }}
        onSuccess={() => {
          fetchProductTypeList(
            {
              ...urlParams,
            },
            { expandAll: true },
          );
          reload();
        }}
      />
      <div className={style.main}>
        <div className={style.mainHeader}>
          <div className={style.headerTitle}>
            {I18N.carbonFootprint.carbonFootprintAccounting}
            <Guide />
          </div>
          <div className={style.operation}>
            <Button
              className={style.headerOutlineBtn}
              onClick={() => setGlobalFactorPreferenceOpen(true)}
            >
              {I18N.carbonFootprint3.globalFactorPreference}
            </Button>
            <Button
              className={style.headerOutlineBtn}
              onClick={() => setModelingRecordOpen(true)}
            >
              {I18N.carbonFootprint3.modelingRecord}
            </Button>
            {showBatchParseModeling && (
              <div
                className={style.batchParseModelBtn}
                role='button'
                tabIndex={0}
                onClick={event => {
                  event.stopPropagation();
                  if (batchParseModelOpen) {
                    return;
                  }
                  setBatchParseModelTaskId(undefined);
                  setBatchParseModelOpen(true);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    if (batchParseModelOpen) {
                      return;
                    }
                    setBatchParseModelTaskId(undefined);
                    setBatchParseModelOpen(true);
                  }
                }}
              >
                <div className={style.batchParseModelBtnPrefix}>
                  <img alt='' src={AiImgBg} />
                  <img
                    className={style.batchParseModelBtnAiIcon}
                    alt=''
                    src={AiImg}
                  />
                </div>
                {I18N.carbonFootprint3.batchParseModeling}
              </div>
            )}
            <SkuCountLabel
              skuCount={skuCount}
              isPersonalCompany={isPersonalCompany}
              onBuyBtnClick={() => {
                if (isPersonalCompany) {
                  openSubscriptionModal({
                    onSuccess: () => {
                      window.location.reload();
                    },
                  });
                  return;
                }
                setPurchaseModalVisible(true);
              }}
            />
          </div>
        </div>
        <div className={style.scrollArea}>
          {showBatchParseModeling && (
            <div ref={aiSectionRef}>
              <ProductCarbonFootprintAI />
            </div>
          )}
          <div className={style.stickyBar}>
            <div className={style.mainSearch}>
              <Input
                className={style.inputSearch}
                allowClear
                suffix={<SearchOutlined className={style.searchIcon} />}
                defaultValue={urlParams.search}
                placeholder={I18N.carbonFootprint3.productNameProduction}
                onChange={onSearchInputChange}
              />
              <div className={style.operateBtnGroup}>
                {haveProductAddPermissions() &&
                  customerServicePopover({
                    placement: 'bottom',
                    children: (
                      <Button
                        disabled={skuCount.status === SKU_STATUS.FULL}
                        type='primary'
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setProductModalProps({ open: true });
                        }}
                      >
                        {I18N.carbonFootprint3.addProduct}
                      </Button>
                    ),
                  })}
                {haveProductUploadPermissions() &&
                  customerServicePopover({
                    placement: 'bottomRight',
                    children: (
                      <Button
                        disabled={skuCount.status === SKU_STATUS.FULL}
                        type='primary'
                        icon={<IconAlibabaNew type='icon-icon-daoru' />}
                        onClick={() => {
                          setImportVisible(true);
                        }}
                      >
                        {I18N.carbonFootprint.importProducts}
                      </Button>
                    ),
                  })}
              </div>
            </div>
            <div className={style.tabsRow}>
              <Tabs
                className={style.tabs}
                activeKey={urlParams.productType || allProductTypeKey}
                tabPosition='top'
                tabBarExtraContent={
                  <div className={style.iconBtnContent}>
                    <Tooltip
                      placement='bottom'
                      title={I18N.carbonFootprint3.addProductPoints}
                    >
                      <div
                        className={style.iconBtn}
                        onClick={() => setProductTypeModalVisible(true)}
                      >
                        <IconAlibabaNew type='icon-icon-tianjia-new' />
                      </div>
                    </Tooltip>
                    <Tooltip
                      placement='bottom'
                      title={I18N.carbonFootprint3.cardMode}
                    >
                      <div
                        className={classNames(style.iconBtn, {
                          [style.activeIconBtn]: urlParams.mode === 'card',
                        })}
                        onClick={() => {
                          setUrlParams({
                            ...urlParams,
                            mode: 'card',
                          });
                        }}
                      >
                        <IconAlibabaNew type='icon-icon-xuanzechanpin' />
                      </div>
                    </Tooltip>
                    <Tooltip
                      placement='bottom'
                      title={I18N.carbonFootprint3.listMode}
                    >
                      <div
                        className={classNames(style.iconBtn, {
                          [style.activeIconBtn]: urlParams.mode === 'table',
                        })}
                        onClick={() => {
                          setUrlParams({
                            ...urlParams,
                            pageNum: 1,
                            mode: 'table',
                          });
                        }}
                      >
                        <IconAlibaba type='icon-icon_qiehuanzhiliebiao' />
                      </div>
                    </Tooltip>
                  </div>
                }
                items={[
                  {
                    key: allProductTypeKey,
                    label: (
                      <div
                        className={classNames(style.productType, {
                          [style.activeProductType]:
                            urlParams.productType === allProductTypeKey,
                        })}
                      >
                        <div className={style.productTypeName}>
                          {I18N.carbonFootprint3.whole}
                        </div>
                      </div>
                    ),
                  },
                  ...allProductTypeList.map(productType => ({
                    key: `${productType.typeCode}`,
                    label: (
                      <Dropdown
                        placement='bottomCenter'
                        trigger={['contextMenu']}
                        menu={{
                          items: [
                            {
                              key: 'edit',
                              label: I18N.carbonFootprint.edit,
                              onClick: () => {
                                setEditProductTypeId(productType.id);
                                setProductTypeModalVisible(true);
                              },
                            },
                            {
                              key: 'delete',
                              label: I18N.carbonFootprint.delete,
                              onClick: () => {
                                setCurrProductType({
                                  id: productType.id,
                                  typeName: productType.typeName,
                                  typeCode: productType.typeCode,
                                });
                                setDeleteProductTypeModalOpen(true);
                              },
                            },
                          ],
                          onClick: ({ domEvent }) => domEvent.stopPropagation(),
                        }}
                      >
                        <div
                          className={classNames(style.productType, {
                            [style.activeProductType]:
                              urlParams.productType ===
                              `${productType.typeCode}`,
                          })}
                        >
                          <div className={style.productTypeName}>
                            {productType.typeName}
                          </div>
                        </div>
                      </Dropdown>
                    ),
                  })),
                ]}
                onChange={productType => {
                  setUrlParams({
                    ...urlParams,
                    pageNum: 1,
                    productType: productType || allProductTypeKey,
                  });
                }}
              />
            </div>
          </div>

          {urlParams.mode === 'card' && (
            <div ref={ref} className={style.dataContent}>
              <div className={style.mainContentAAA}>
                <Spin
                  spinning={allLoading}
                  style={{
                    minHeight: '500px',
                  }}
                >
                  <div className={style.mainContentEvery}>
                    {data?.list?.map((product: any) => {
                      const {
                        id,
                        productName,
                        productPic,
                        productCode,
                        accountTotal,
                        specification,
                        perWeight,
                        perUnitName,
                        accountUnitName,
                        hasSharedModel,
                      } = product;
                      return (
                        <div
                          className={classNames(style.contentCard)}
                          key={id}
                          onClick={e => {
                            // 如果当前产品的预览已打开，则不触发点击事件
                            if (previewingProductId === id) {
                              return;
                            }
                            clickProductCard(id);
                          }}
                        >
                          <div className={style.productInfo}>
                            <Image
                              className={style.productImg}
                              preview={{
                                onVisibleChange: (visible, prevVisible) => {
                                  // 当预览打开时，记录当前产品 ID
                                  // 当预览关闭时，清除记录
                                  if (visible && !prevVisible) {
                                    setPreviewingProductId(id);
                                  } else if (!visible && prevVisible) {
                                    setPreviewingProductId(null);
                                  }
                                },
                              }}
                              src={productPic || carbonCoin}
                              onClick={e => {
                                e.stopPropagation();
                              }}
                            />
                            <div className={style.productDetails}>
                              <div className={style.productNameRow}>
                                <div
                                  className={style.productName}
                                  title={productName}
                                >
                                  {productName}
                                </div>
                                <div className={style.productBtnContent}>
                                  {hasSharedModel ? (
                                    <span className={style.hasSharedModelTag}>
                                      {I18N.carbonFootprint3.hasSharedModel}
                                    </span>
                                  ) : null}
                                  {haveAccountEditPermissions() && (
                                    <Tooltip
                                      placement='bottom'
                                      title={
                                        I18N.carbonFootprint3.addAccounting
                                      }
                                    >
                                      <div
                                        className={style.productBtn}
                                        onClick={e => {
                                          e.stopPropagation();
                                          history.push(
                                            `${
                                              RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail
                                            }?productId=${id}&openAdd=${true}`,
                                          );
                                        }}
                                      >
                                        <IconAlibabaNew type='icon-xinzenghesuan' />
                                      </div>
                                    </Tooltip>
                                  )}
                                  {haveProductEditPermissions() && (
                                    <Tooltip
                                      placement='bottom'
                                      title={I18N.carbonFootprint3.editProduct}
                                    >
                                      <div
                                        className={style.productBtn}
                                        onClick={e => {
                                          e.stopPropagation();
                                          setProductModalProps({
                                            open: true,
                                            id,
                                          });
                                        }}
                                      >
                                        <IconAlibabaNew type='icon-account-edit' />
                                      </div>
                                    </Tooltip>
                                  )}
                                  <Dropdown
                                    menu={{
                                      onClick: ({ domEvent }) =>
                                        domEvent.stopPropagation(),
                                      items: [
                                        haveProductAddPermissions()
                                          ? {
                                              key: 'copy',
                                              label:
                                                I18N.router.copyingProducts,
                                              onClick: () => {
                                                setProductModalProps({
                                                  open: true,
                                                  id,
                                                  isCopy: true,
                                                });
                                              },
                                            }
                                          : null,
                                        haveProductDeletePermissions()
                                          ? {
                                              key: 'delete',
                                              label:
                                                I18N.carbonFootprint3
                                                  .deleteProduct,
                                              onClick: () => {
                                                deleteTable(product);
                                              },
                                            }
                                          : null,
                                      ],
                                    }}
                                  >
                                    <div
                                      className={style.productBtn}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <EllipsisOutlined />
                                    </div>
                                  </Dropdown>
                                </div>
                              </div>
                              <div>
                                <span className={style.productCode}>
                                  {I18N.carbonFootprint.productCode}
                                </span>
                                <span>{productCode}</span>
                              </div>
                              <div>
                                <span className={style.productCode}>
                                  {I18N.carbonFootprint.accountingModel}
                                </span>
                                <span>{accountTotal}</span>
                              </div>
                            </div>
                          </div>
                          <div className={style.splitLine} />
                          <div className={style.productExtraInfo}>
                            <div className={style.productExtraInfoItem}>
                              <div className={style.productExtraInfoLabel}>
                                {I18N.carbonFootprint3.specificationAndModel}
                              </div>
                              <div className={style.productExtraInfoValue}>
                                {specification || '-'}
                              </div>
                            </div>
                            <div className={style.productExtraInfoItem}>
                              <div className={style.productExtraInfoLabel}>
                                {I18N.carbonFootprint3.productWeight}
                              </div>
                              <div className={style.productExtraInfoValue}>
                                {perWeight ? `${perWeight}${perUnitName}` : '-'}
                              </div>
                            </div>
                            <div className={style.productExtraInfoItem}>
                              <div className={style.productExtraInfoLabel}>
                                {I18N.carbonFootprint.unit}
                              </div>
                              <div className={style.productExtraInfoValue}>
                                {accountUnitName}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {(data?.list?.length ?? 0) === 0 && (
                    <div className={style.noData}>
                      <div>
                        <img
                          className={style.noDataImg}
                          src={noData}
                          alt={
                            I18N.carbonFootprint3
                              .thereIsCurrentlyNoDataAvailable
                          }
                        />
                      </div>
                    </div>
                  )}
                </Spin>
              </div>

              <div className={style.loadMore}>
                {!noMore && (
                  <div onClick={loadMore}>
                    {loadingMore
                      ? I18N.components.loading
                      : I18N.carbonFootprint3.clickToLoadMore}
                  </div>
                )}

                {noMore && !allLoading && !loadingMore && (
                  <span>{I18N.carbonFootprint3.noMoreNumbers}</span>
                )}
              </div>
            </div>
          )}
          {urlParams.mode === 'table' && (
            <div className={style.dataContent}>
              <Table
                rowKey='id'
                loading={loading}
                dataSource={tableData}
                scroll={{ x: 1300 }}
                columns={[
                  {
                    title: I18N.carbonFootprint.number,
                    dataIndex: '__No__',
                    width: 64,
                    ellipsis: true,
                    fixed: 'left',
                    render: (_, record, index) =>
                      urlParams.pageSize * (urlParams.pageNum - 1) + index + 1,
                  },
                  {
                    title: I18N.carbonFootprint.productName,
                    dataIndex: 'productName',
                    width: 200,
                    ellipsis: true,
                    fixed: 'left',
                    render: (productName, record) => (
                      <div className={style.productNameCell}>
                        <span
                          className={style.productNameText}
                          title={productName}
                        >
                          {productName}
                        </span>
                        {record.hasSharedModel ? (
                          <span className={style.hasSharedModelTag}>
                            {I18N.carbonFootprint3.hasSharedModel}
                          </span>
                        ) : null}
                      </div>
                    ),
                  },
                  {
                    title: I18N.carbonFootprint.productCode,
                    dataIndex: 'productCode',
                    width: 164,
                    ellipsis: true,
                  },
                  {
                    title: I18N.carbonFootprint3.specificationAndModel,
                    dataIndex: 'specification',
                    width: 208,
                    ellipsis: true,
                    render: text => text || '-',
                  },
                  {
                    title: I18N.carbonFootprint3.productUnit,
                    dataIndex: 'accountUnitName',
                    width: 112,
                    ellipsis: true,
                  },
                  {
                    title: I18N.carbonFootprint3.productWeight,
                    dataIndex: 'perWeight',
                    width: 110,
                    ellipsis: true,
                    render: (_, record) =>
                      record.perWeight
                        ? `${record.perWeight}${record.perUnitName}`
                        : '-',
                  },
                  {
                    title: I18N.carbonFootprint.accountingQuantity,
                    dataIndex: 'accountTotal',
                    width: 156,
                    render: amount => (
                      <span className={style.amountText}>{amount}</span>
                    ),
                  },
                  {
                    title: I18N.carbonFootprint.operation,
                    dataIndex: '__operate__',
                    width: locale === LocaleType.zhCN ? 212 : 300,
                    fixed: 'right',
                    render: (_, record) => (
                      <div className={style.operateColumn}>
                        <Button
                          type='link'
                          onClick={() => {
                            clickProductCard(record.id);
                          }}
                        >
                          {I18N.carbonFootprint3.viewAccounting}
                        </Button>
                        {haveAccountEditPermissions() && (
                          <Button
                            type='link'
                            onClick={() => {
                              history.push(
                                `${
                                  RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail
                                }?productId=${record.id}&openAdd=${true}`,
                              );
                            }}
                          >
                            {I18N.carbonFootprint3.addAccounting}
                          </Button>
                        )}
                        <Dropdown
                          menu={{
                            items: [
                              haveProductEditPermissions()
                                ? {
                                    key: 'edit',
                                    label: I18N.carbonFootprint3.editProduct,
                                    onClick: () => {
                                      setProductModalProps({
                                        open: true,
                                        id: record.id,
                                      });
                                    },
                                  }
                                : null,
                              haveProductAddPermissions()
                                ? {
                                    key: 'copy',
                                    label: I18N.router.copyingProducts,
                                    onClick: () => {
                                      setProductModalProps({
                                        open: true,
                                        id: record.id,
                                        isCopy: true,
                                      });
                                    },
                                  }
                                : null,
                              haveProductDeletePermissions()
                                ? {
                                    key: 'delete',
                                    label: I18N.carbonFootprint.delete,
                                    onClick: () => {
                                      deleteTable(record);
                                    },
                                  }
                                : null,
                            ],
                          }}
                        >
                          <Button type='link'>{I18N.Certification.more}</Button>
                        </Dropdown>
                      </div>
                    ),
                  },
                ]}
                pagination={{
                  current: urlParams.pageNum,
                  pageSize: urlParams.pageSize,
                  total,
                }}
                onChange={({ current, pageSize }) => {
                  setUrlParams({
                    ...urlParams,
                    pageNum: current,
                    pageSize,
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
      {userDemo === 1 && duration > 0 && (
        <div className={style.demoBanner}>
          <div className={style.demoBannerLeft}>
            <div className={style.demoIconWrapper}>
              <img src={demoIcon} alt='default' className={style.demoIcon} />
            </div>
            <span className={style.demoTitle}>
              {I18N.carbonFootprint3.experienceDem}
            </span>
            <div className={style.demoText}>
              <span>{I18N.carbonFootprint3.theCurrentEnvironmentIs}</span>
              <span className={style.demoDuration}>{duration}</span>
              <span>{I18N.carbonFootprint3.tianNeedsToUpgrade}</span>
            </div>
          </div>
          <Button
            type='primary'
            className={style.demoPurchaseBtn}
            onClick={() => {
              if (isPersonalCompany) {
                openSubscriptionModal({
                  onSuccess: () => {
                    window.location.reload();
                  },
                });
                return;
              }
              setPurchaseModalVisible(true);
            }}
          >
            {I18N.carbonFootprint3.buyNow}
          </Button>
        </div>
      )}
      {importVisible && (
        <ImportFileModal<ProductImportTableList, ProductImportParams>
          title={I18N.carbonFootprint.importProducts}
          visible={importVisible}
          downLoadTemplateName={downLoadTemplateName}
          onCancelBack={onCancelImport}
          onOkImport={onOkImport}
          downLoadTemplateUrl={downLoadTemplateUrl}
          importFileRequestBack={importFileRequestBack}
          searchParamsData={searchImportParams}
          getFileListRequest={getFileProductImportApi}
        />
      )}
      <PurchaseModal
        visible={purchaseModalVisible}
        onCancel={paySuccess => {
          setPurchaseModalVisible(false);
          if (paySuccess) {
            getAccountSkuSetting();
            window.location.reload();
          }
        }}
        onPaySuccess={() => {}}
      />
      <ProductModal
        {...productModalProps}
        productType={
          urlParams.productType === allProductTypeKey
            ? undefined
            : urlParams.productType
        }
        onCancel={() => setProductModalProps({ open: false })}
        onConfirm={postData => {
          if (isNil(productModalProps.id) || productModalProps.isCopy) {
            subForm(postData as SubAccountProductFormData);
          } else {
            editProduct(postData);
          }
        }}
        onConfirmAndCreateAccount={
          isNil(productModalProps.id) || productModalProps.isCopy
            ? postData =>
                subFormAndAccount(postData as SubAccountProductFormData)
            : undefined
        }
      />
      <Modal
        title={I18N.emission.confirmToDeleteThis}
        open={deleteProductTypeModalOpen}
        width={460}
        okButtonProps={{ loading: deleteProductTypeLoading }}
        onClose={onDeleteProductTypeModalClose}
        onCancel={onDeleteProductTypeModalClose}
        onOk={onProductTypeDelete}
      >
        <div>
          {I18N.template(I18N.carbonFootprint3.confirmDeletionOfPoints, {
            val1: currProductType?.typeName || '',
          })}
        </div>
        <div>{I18N.carbonFootprint3.afterDeletionThisPoint}</div>
      </Modal>
      <GlobalFactorPreference
        open={globalFactorPreferenceOpen}
        onClose={() => setGlobalFactorPreferenceOpen(false)}
      />
      <ModelingRecord
        open={modelingRecordOpen}
        onClose={() => setModelingRecordOpen(false)}
        onView={record => {
          setModelingRecordOpen(false);
          // 待解析 → 第一步批量解析弹窗；其余状态 → 批量建模弹窗
          if (record.status === BatchTaskStatus.BEFORE_PARSE) {
            setBatchParseModelTaskId(record.id);
            setBatchParseModelOpen(true);
            return;
          }
          setBatchCreateModelTaskId(record.id);
          setBatchCreateModelOpen(true);
        }}
      />
      <BatchParseModel
        open={batchParseModelOpen}
        batchId={batchParseModelTaskId}
        onClose={() => {
          setBatchParseModelOpen(false);
          setBatchParseModelTaskId(undefined);
        }}
        onTemplateDownload={handleBatchTemplateDownload}
        onParseSuccess={taskId => {
          setBatchParseModelOpen(false);
          setBatchParseModelTaskId(undefined);
          setBatchCreateModelTaskId(taskId);
          setBatchCreateModelOpen(true);
        }}
      />
      <BatchCreateModel
        open={batchCreateModelOpen}
        batchId={batchCreateModelTaskId}
        onClose={() => setBatchCreateModelOpen(false)}
        onCancelParseSuccess={() => {
          setBatchParseModelTaskId(batchCreateModelTaskId);
          setBatchParseModelOpen(true);
        }}
      />
    </div>
  );
};

export default FootprintAccountProductList;
