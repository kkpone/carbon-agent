/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 头部步骤条操作下面的功能单位描述和切换操作
 */
import {
  CloseOutlined,
  DoubleLeftOutlined,
  DownOutlined,
  LoadingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Text } from '@components/FormilyUtil/util';
import {
  ArrayTable,
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  Switch,
} from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { ISchema, createSchemaField } from '@formily/react';
import { listALLByDictTypeBatch } from '@src/api/api';
import AIIcon from '@src/assets/images/carbonFootprint3.6.4/AIIcon.png';
import AIModel from '@src/assets/images/carbonFootprint3.6.4/AIModel.png';
import AIModelEn from '@src/assets/images/carbonFootprint3.6.4/AIModelEn.png';
import CheckModelIcon from '@src/assets/images/carbonFootprint3.6.6/checkModelIcon.png';
import DetailDataIcon from '@src/assets/images/carbonFootprint3.6.6/detailDataIcon.svg';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { checkPermissions } from '@src/components/Permission/utils';
import { IconAlibaba } from '@src/components/iconfont';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import EmissionSourceDrawer from '@src/views/carbonFootprint3/component/EmissionSourceDrawer';
import ImportFileModal from '@src/views/carbonFootprint3/component/ImportFileModal';
import { getSysFileStatus } from '@src/views/carbonFootprint3/component/ImportFileModal/service';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import {
  CALC_WAY,
  EMISSION_TYPE_OPTIONS,
  PROCESS_ACCOUNT_LIFE_CYCLE_LABEL,
  QUICK_ACCOUNT_LIFE_CYCLE_LABEL,
} from '@src/views/carbonFootprint3/constant';
import { haveAccountEditPermissions } from '@src/views/carbonFootprint3/permissions';
import { OptionsTypesData } from '@src/views/carbonFootprint3/type';
import { Dicts } from '@src/views/emission/Show/type';
import { changeDicts2Options } from '@src/views/utils';
import { useMount } from 'ahooks';
import {
  App,
  Button,
  Cascader,
  Col,
  Divider,
  Input as InputAntd,
  Modal,
  Pagination,
  Popover,
  Row,
  Spin,
  Tabs,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import saveAs from 'file-saver';
import { uniqBy } from 'lodash-es';
import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ECompanyType } from '@/api/types';
import { getUserInfo } from '@/utils';
import { CompanyType } from '@/views/system/login/component/Login';

import './index.css';

import { CheckModalData } from './CheckModalData';
import FormAiDataAmount from './FormAiDataAmount';
import FormAiDataName from './FormAiDataName';
import style from './index.module.less';
import { aiDataSchema } from './scheam';
import {
  getAiDataList,
  getAiPopoverStatus,
  getFileEmissionImportApi,
  getImportModalFile,
  getModelCheck,
  postAddAiModel,
  postAiCloseData,
  postAiClosePopover,
  postAiDeleteSub,
  postAiDeleteTmp,
  postAiEditTmp,
  postFileImportAccountEmissionApi,
  postInitAccountExcel,
  postQuickAccounEmissionExportExcel,
} from './service';
import {
  AiDataFormValues,
  AiDataListApiParams,
  BuildModelDescribeProps,
  CheckModelData,
  EmissionImportParams,
  EmissionImportTableList,
  FormAiDataAmountValue,
} from './type';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FootprintAccountLifeCycle,
  FootprintAccountStatusType,
} from '../../../constant';
import { BuildModelDescribeSet } from '../constant';
import './aiIndex.less';
import { StageEnumType, getStageItems } from './const';
import FormTransportList from './FormTransportList';
import { EditButton } from './components/EditButton';
import DetailDataDrawerView from './components/DetailDataDrawer';

import { LocaleContext } from '@/components/LocaleProvider';
import { ETransportType } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema';

import { AiModal } from './components/AiModal';

import { AnimationFullscreenModal } from '@/components/AnimationFullscreenModal';

import { getAccountingInfo } from '../../../AccountDetail/AccountInfo/service';
import { EAiType } from '../../../AccountDetail/AccountInfo/type';

import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { getToken } from '@/utils/cookie';
import { useAccountIdBindWithUpgrade } from '@/utils/useAccountIdBindWithUpgrade';
import { useGlobalLoginModal } from '@/components/GlobalLoginModal';

import { useHistory, useLocation } from 'react-router-dom';

const { TextArea } = InputAntd;
const { LIST, VISUAL } = BuildModelDescribeSet;
const { HALF, FULL, CUSTOM } = FootprintAccountLifeCycle;
const { QUICK } = FootprintAccountStatusType;
const { TRANS } = EMISSION_TYPE_OPTIONS;

// const { confirm } = Modal;

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    Input,
    Select,
    FormItem,
    FormLayout,
    FormGrid,
    DatePicker,
    ArrayTable,
    Text,
    FormAiDataAmount,
    FormAiDataName,
    Switch,
    FormTransportList,
    Button,
    EditButton,
  },
});

const { PRODUCT_WEIGHT, BEARING_RATIO, ENERGY_CONSUMPTION } = CALC_WAY;

export const BuildModelDescribe: FC<BuildModelDescribeProps> = memo(
  ({
    accountInfo: {
      aiStatus,
      accountName,
      startTime,
      endTime,
      scopeValue,
      scope,
      id,
      type,
      inStatus,
      factorPrefId,
      aiType, // ai建模中使用此字段判断 1 ai建模 2 ai提取excel数据建模
      excelUrl,
    },
    cRefDescribe,
    aiLoading,
    aiBuildSuccess,
    updateGaphByAi,
    closeAiBuilding,
    isDetail,
    switchMain,
    changeBuildMain,
    changeListOrGraph,
    onOkImport,
    changeScope,
    goModelingBack,
    updateAccountInfo,
    apiExtraParams,
    hideListGraphSwitch,
  }) => {
    const childRef = useRef<{
      initActive: () => void;
    }>(null);

    const { modal } = App.useApp();

    const { openLoginModal } = useGlobalLoginModal();
    const handleAccountIdBindWithUpgrade = useAccountIdBindWithUpgrade();
    const history = useHistory();
    const location = useLocation();
    let debounceTimer: NodeJS.Timeout | undefined;
    const [activeStage, setActiveStage] = useState<StageEnumType>('0');

    // 通过 URL 参数中是否有 shareId 来判断是否是分享状态
    const searchParams = new URLSearchParams(location.search);
    const shareId = searchParams.get('shareId');
    const isShare =
      !!shareId || location.pathname.includes('footprintAccount/share');

    /** 仅轻量版 companyType='2'（ECompanyType.lite）展示模型评价下专家入口 */
    const hideExpertEvaluationCta =
      String(getUserInfo()?.userInfo?.companyType ?? '') !== ECompanyType.lite;

    const isPcSnapCol = ['6', '7', 6, 7].includes(
      searchParams.get('snapFlag') || '',
    );
    const showListGraphSwitch = !isPcSnapCol && !hideListGraphSwitch;
    /** snapFlag 为 2 或 4 时隐藏明细数据入口 */
    const hideDetailDataEntry = ['2', '4', 2, 4].includes(
      searchParams.get('snapFlag') || '',
    );
    /**
     * 获取本地存储的用户输入对话框内容
     * @returns 对话框内容
     */
    const getLocalModalInputArr = () => {
      const localAiInputs = localStorage.getItem('AiModalInput');
      if (!localAiInputs) return undefined;

      const inputsData: { accountId: number; text: string }[] =
        JSON.parse(localAiInputs);
      return inputsData;
    };

    /** 防抖函数 - 处理ai对话框输入的内容 */
    const debouncedInputHandler = (inputVal: string) => {
      const inputsData = getLocalModalInputArr();
      if (inputsData) {
        const findInpuInfo = inputsData.find(val => val.accountId === id);

        const localInputData = findInpuInfo
          ? inputsData.map(val => {
              if (val.accountId === id) {
                return {
                  ...val,
                  text: inputVal,
                };
              }
              return val;
            })
          : [...inputsData, { accountId: id, text: inputVal }];

        localStorage.setItem('AiModalInput', JSON.stringify(localInputData));
      } else {
        localStorage.setItem(
          'AiModalInput',
          JSON.stringify([{ accountId: id, text: inputVal }]),
        );
      }
    };

    /** 判断账号状态是否为正在建模中（1表示建模中） */
    const isBuilding = aiStatus === 1;

    /** 是否禁止操作 */
    const isDisabled = !!isDetail;

    /** 根据类型获取生命周期 */
    const LifeCycleArr =
      type === QUICK
        ? QUICK_ACCOUNT_LIFE_CYCLE_LABEL()
        : PROCESS_ACCOUNT_LIFE_CYCLE_LABEL();

    /**
     * 获取生命周期中级联子级的值
     * @param objs 传入的是快速还是过程的全局变量
     * @returns 处理好的级联children数组
     */
    const getChildrenByType = (
      objs: Record<string, any>,
    ): OptionsTypesData[] => {
      const objKeys = Object.keys(objs);
      return objKeys.map(ob => ({
        label: objs[ob],
        value: Number(ob),
      }));
    };

    /**
     * 删除本地存储的用户输入对话框内容
     */
    const removeModalInputById = () => {
      const inputsData = getLocalModalInputArr();

      if (!inputsData) return undefined;

      const inputText = inputsData.find(data => data.accountId === id);
      if (!inputText) return undefined;

      const newInputsData = inputsData.filter(data => data.accountId !== id);
      localStorage.setItem('AiModalInput', JSON.stringify(newInputsData));
      return undefined;
    };

    const { locale } = useContext(LocaleContext);

    const isEn = locale === LocaleType.enUS;

    /**
     * 获取本地存储的用户输入对话框内容（根据核算id进行过滤获取）
     * @returns 对话框内容
     */
    const getAiModalInput = (accountId: number) => {
      const inputsData = getLocalModalInputArr();

      if (!inputsData) return undefined;

      const inputText = inputsData.find(data => data.accountId === accountId);
      if (!inputText) return undefined;

      return inputText.text;
    };

    const cascaderOptions: OptionsTypesData[] = [
      { label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[HALF], value: HALF },
      { label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[FULL], value: FULL },
      {
        label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[CUSTOM],
        value: CUSTOM,
        children: getChildrenByType(LifeCycleArr),
      },
    ];
    const operatePermission = haveAccountEditPermissions();

    // const scopeValueArr = scopeValue ? scopeValue.split(',') : [];
    // const scopeValueArrLabel = scopeValueArr.map(
    //   everyScope => QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[everyScope],
    // );

    useEffect(() => {
      const scopeValueArr = scopeValue ? scopeValue.split(',') : [];
      if (scopeValueArr.length > 0) {
        setActiveStage(scopeValueArr[0] as StageEnumType);
      }
    }, [scopeValue]);

    /** 导入弹框 按钮loading */
    const [importVisibleBtn, setImportVisibleBtn] = useState(false);

    /** 导入 icon 增加loading */
    const [importVisibleIcon, setImportVisibleIcon] = useState(false);

    /** 导入弹框 */
    const [importVisible, setImportVisible] = useState(false);

    /** 导入文件后返回的code - 用于判断是否异步导入完成 */
    const [importBackCode, setImportBackCode] = useState<number | undefined>();

    /** AI建模提示 */
    const [aiPopover, setAiPopover] = useState(() => {
      // 建模中 就不提示弹框
      if (isBuilding) return false;

      const aiModal = localStorage.getItem('aiModal');
      if (aiModal === 'show') return true;
      return false;
    });

    /** AI建模对话框 */
    const [aiModal, setAiModal] = useState(false);

    const [newAiModalOpen, setNewAiModalOpen] = useState(false);

    useEffect(() => {
      if (aiLoading) {
        setNewAiModalOpen(true);
      }
    }, [aiLoading]);

    /** 检查模型 */
    const [checkModal, setCheckModal] = useState(false);

    /** 明细数据抽屉 */
    const [detailDataDrawerOpen, setDetailDataDrawerOpen] = useState(false);

    /** 无 excelUrl 时初始化明细 Excel 请求中 */
    const [detailDataInitLoading, setDetailDataInitLoading] = useState(false);
    /** init 后立刻打开抽屉：父级 excelUrl 可能尚未更新，用接口返回值覆盖 */
    const [detailDataDrawerExcelUrl, setDetailDataDrawerExcelUrl] = useState<
      string | undefined
    >();

    /** 模型检查的接口数据 */
    const [modelCheckData, setModelCheckData] = useState<CheckModelData>();

    /** 检查模型 - loading提示框 */
    const [checkModalLoading, setCheckModalLoading] = useState(false);

    /** AI建模对话框Input */
    const [aiModalInput, setAiModalInput] = useState<string>(
      () => getAiModalInput(id) || '',
    );

    const [emissionSourceId, setEmissionSourceId] = useState<number>();
    const [emissionSourceModalVisible, setEmissionSourceModalVisible] =
      useState(false);

    /** AI建模分页总条数 */
    const [paginationTotal, setPaginationTotal] = useState(0);

    const needValidateFirst = useRef(false);

    /** AI建模临时列表分页页码 */
    const aiListTmpParamsRef = useRef<AiDataListApiParams>({
      accountId: id,
      pageNum: 1,
      pageSize: 10,
      stage: '0',
    });

    /** AI建模数据添加 */
    const [aiDataShow, setAiDataShow] = useState(false);

    /** 展开收起 - AI建模临时列表数据 */
    const [pickUpAiData, setPickUpAiData] = useState(false);

    /** 展开提示是否显示 */
    const [unfoldListTooltip, setUnfoldListTooltip] = useState(() => {
      const show = localStorage.getItem('unfoldListTooltip');
      if (!show) return true;
      return false;
    });

    /** 动态设置Schema */
    const [aiSchema, setAiSchema] = useState<ISchema>();

    /** 取消建模按钮是否显示 */
    const [closeAiBtnStatus, setCloseAiBtnStatus] = useState(false);

    /** Form区域loading */
    const [formLoading, setFormLoading] = useState(false);

    const [unitOptionsApi, setUnitOptionsApi] = useState<Dicts[]>();

    const form = useMemo(
      () =>
        createForm<AiDataFormValues>({
          readPretty: isDetail,
          effects: () => {
            onFieldValueChange('AiDataList.*.type', field => {
              // 获取消耗数量的路径
              const tempListSet: { id: string; editStatus: boolean } = field
                .query('.set')
                .get('value');

              if (field.value) {
                setFormLoading(true);
                // 通知接口更新
                postAiEditTmp({
                  id: tempListSet.id,
                  type: field.value,
                }).then(async () => {
                  // 主动更新画布
                  if (updateGaphByAi) {
                    updateGaphByAi();
                  }
                  await getAiListTmp();
                  setFormLoading(false);
                });
              }
            });
            onFieldValueChange('AiDataList.*.name', field => {
              // 拿到当前一行的id
              const tempListSet: { id: string; editStatus: boolean } = field
                .query('.set')
                .get('value');

              if (tempListSet?.editStatus && field.value.value) {
                setFormLoading(true);
                // 通知接口更新
                postAiEditTmp({
                  id: tempListSet.id,
                  name: field.value.value,
                }).then(async () => {
                  // 主动更新画布
                  if (updateGaphByAi) {
                    updateGaphByAi();
                  }
                  await getAiListTmp();
                  setFormLoading(false);
                });
              }
            });
            onFieldValueChange('AiDataList.*.amountObj', field => {
              // 拿到当前一行的id
              const tempListSet: { id: string; editStatus: boolean } = field
                .query('.set')
                .get('value');

              const tempListName = field.query('.name').get('value');
              const tempListType = field.query('.type').get('value');

              // 如果不是编辑状态 就不触发
              if (!tempListSet?.editStatus) return;

              // 如果是运输类型
              // const isTrans = TRANS === Number(tempListType);

              const amountObjVal: FormAiDataAmountValue = field.value;

              // 有单位和数量的时候才会动态调用更新排放源 - 非运输
              if (
                (amountObjVal.amount || amountObjVal.amount === 0) &&
                amountObjVal.unitCode
              ) {
                setFormLoading(true);
                postAiEditTmp({
                  id: tempListSet.id,
                  type: tempListType,
                  name: tempListName.value,
                  unitName: amountObjVal.unitName,
                  unitCode: amountObjVal.unitCode,
                  unitCodeArr: amountObjVal.unitCodeArr.join(','),
                  amount: amountObjVal.amount,
                }).then(() => {
                  // 主动更新画布
                  if (updateGaphByAi) {
                    updateGaphByAi();
                    setFormLoading(false);
                  }
                });
              }
            });
            onFieldValueChange(
              'AiDataList.*.accountEmissionTransportList',
              async field => {
                // 拿到当前一行的id
                const tempListSet: { id: string; editStatus: boolean } = field
                  .query('.set')
                  .get('value');

                const tempListType: number = field.query('.type').get('value');

                const currentValue: {
                  transportType: ETransportType;
                  way: number;
                  amount?: number;
                  unitCode?: string;
                  distance?: number;
                } = field.value?.[0] || {};

                if (currentValue.transportType === ETransportType.road) {
                  if (currentValue.way === PRODUCT_WEIGHT) {
                    // 载重比 没有 unitName 和 unitCode
                    if (
                      !currentValue.amount ||
                      !currentValue.unitCode ||
                      !currentValue.distance
                    ) {
                      return;
                    }
                  } else if (currentValue.way === BEARING_RATIO) {
                    // 载重比 没有 unitName 和 unitCode
                    if (!currentValue.amount || !currentValue.distance) {
                      return;
                    }
                  } else if (currentValue.way === ENERGY_CONSUMPTION) {
                    if (!currentValue.amount || !currentValue.unitCode) {
                      return;
                    }
                  }
                } else if (
                  !currentValue.amount ||
                  !currentValue.unitCode ||
                  !currentValue.distance
                ) {
                  return;
                }
                if (field.value[0] && !field.value[0].transportType) {
                  field.value[0].transportType = ETransportType.road;
                }

                if (tempListSet?.editStatus && field.value.length > 0) {
                  setFormLoading(true);
                  // 通知接口更新
                  postAiEditTmp({
                    id: tempListSet.id,
                    type: tempListType,
                    accountEmissionTransportList: field.value,
                  }).then(async () => {
                    // 主动更新画布
                    if (updateGaphByAi) {
                      updateGaphByAi();
                    }
                    await getAiListTmp();
                    setFormLoading(false);
                  });
                }
              },
            );
          },
        }),
      [switchMain, aiBuildSuccess, activeStage],
    );

    /** 下载模版 - 模版地址 */
    const [downLoadTemplateObj, setDownLoadTemplateObj] = useState<{
      name: string;
      url: string;
    }>();
    const [searchImportParams] = useState<EmissionImportParams>({
      pageNum: 1,
      pageSize: 10,
      type: 1,
    });

    /** 切换生命周期级联选中 */
    const [selectCascader, setSelectCascader] = useState<(string | number)[][]>(
      () => {
        // 自定义生命周期回显
        if (scope === CUSTOM && scopeValue) {
          const getScopeValueArr = scopeValue.split(',');
          const scopeCascader = getScopeValueArr.map(val => [
            Number(scope),
            Number(val),
          ]);
          return scopeCascader;
        }
        return [[scope]];
      },
    );

    /**
     * 切换生命周期
     * @param value 切换的值
     */
    const selectScopeChange = (value: (string | number)[][]) => {
      // 证明是多选
      if (value[value.length - 1].length === 2) {
        setSelectCascader(value.filter(val => val.length === 2));
      } else {
        const selectVal = value[value.length - 1];
        // 单独选中 全部的自定义生命周期
        if (Number(selectVal) === CUSTOM) {
          const keys = Object.keys(LifeCycleArr);
          const selectValArr = keys.map(val => [Number(CUSTOM), Number(val)]);
          setSelectCascader(selectValArr);
        } else {
          setSelectCascader([value[value.length - 1]]);
        }
      }
    };

    /**
     * 切换列表和可视化
     * @param listOrGraphStatus 切换到什么状态
     */
    const changeMainStatus = (listOrGraphStatus: BuildModelDescribeSet) => {
      changeListOrGraph(listOrGraphStatus);
      changeBuildMain(listOrGraphStatus);
    };

    /**
     * @description: 导出文件
     */
    const exportExcel = async () => {
      Toast('success', I18N.carbonFootprint.startDownloading);
      const back = await postQuickAccounEmissionExportExcel({ id });

      if (back.data.code === 200) {
        saveAs(back.data.data.url, back.data.data.name);
      } else {
        Toast('error', I18N.carbonFootprint3.downloadFailed);
      }
    };

    /**
     * 获取模型检查的数据
     * @param accountId 核算id
     */
    const getCheckModelData = async () => {
      const { data } = await getModelCheck({ accountId: id });
      setModelCheckData(data.data);
    };

    /**
     * 检查模型
     */
    const checkModel = async () => {
      try {
        setCheckModalLoading(true);
        await getCheckModelData();
        setCheckModal(true);
      } finally {
        setCheckModalLoading(false);
      }
    };

    /**
     * 取消导入
     */
    const onCancelImport = () => {
      setImportVisible(false);
    };

    /**
     * @description: 导入文件后的回调方法
     */
    const importFileRequestBack = async (url: string, fileName?: string) => {
      const { data } = await postFileImportAccountEmissionApi({
        accountId: id,
        fileUrl: url,
        fileName,
      });

      return { code: data.code, data: data.data };
    };

    /**
     * 确认切换生命周期
     */
    const subChangeScope = () => {
      const getChangeScopeVal = selectCascader[0][0];
      // 数组长度大于1 说明选择的是自定义生命周期，并且自定义生命周期没有全选
      if (getChangeScopeVal === CUSTOM) {
        const changeScopeValueArr = selectCascader.map(
          selectOption => selectOption[1],
        );
        const changeScopeValue = changeScopeValueArr.join(',');
        changeScope({
          id,
          scope: getChangeScopeVal,
          scopeValue: changeScopeValue,
        });
        return;
      }
      changeScope({
        id,
        scope: getChangeScopeVal,
      });
    };

    /** 异步导入文件成功回调 */
    const syncFileStatusSuccess = () => {
      setImportBackCode(undefined);
      Toast('success', I18N.carbonFootprint3.importDataAs);
      setCloseAiBtnStatus(false);

      // 清空AI建模输入框内容
      localStorage.removeItem('AiModalInput');
      setAiModalInput('');

      onOkImport();
    };

    /**
     * 循环调用接口，判断是否导入异步文件完毕
     * @param id 查询的id
     */
    const getImportBackIdStatus = (statusId: number) => {
      const interval = setInterval(() => {
        getSysFileStatus({ id: statusId }).then(data => {
          if (data.data.data && data.data.data !== 0) {
            clearInterval(interval);
            syncFileStatusSuccess();
          }
        });
      }, 3000);
    };

    /**
     * 导入文件后的返回值
     * @param data 导入后的返回值,用于定时刷新
     */
    const onOkImportBack = (data?: number) => {
      if (data) {
        setImportBackCode(data);
        getSysFileStatus({ id: data })
          .then(fileStatus => {
            // 导入失败 - 不关闭弹窗
            if (fileStatus.data.data !== 3) {
              setAiDataShow(false);
            }

            if (fileStatus.data.data && fileStatus.data.data !== 0) {
              syncFileStatusSuccess();
            } else {
              // 循环调用导入状态判断 - 每3s执行一次
              getImportBackIdStatus(data);
            }
          })
          .catch(() => {
            setImportBackCode(undefined);
          });
      }
    };

    const dropdownRender = (menus: React.ReactNode) => (
      <div>
        {menus}
        <Divider style={{ margin: 0 }} />
        <div
          style={{
            padding: '4px 8px',
            textAlign: 'right',
          }}
        >
          <Button
            style={{ height: 26, padding: '0 4px' }}
            type='primary'
            onClick={subChangeScope}
          >
            {I18N.carbonFootprint.confirm}
          </Button>
        </div>
      </div>
    );

    /**
     * 关闭ai建模提示弹框
     */
    const closeAiPopver = () => {
      localStorage.setItem('aiModal', 'noShow');
      setAiPopover(false);
    };

    /**
     * 不再提醒AI建模提示
     */
    const noShowPopver = async () => {
      await postAiClosePopover();
      localStorage.removeItem('aiModal');
      setAiPopover(false);
    };

    /**
     * 打开AI对话框
     */
    // const openAiModal = () => {
    //   setAiModal(true);
    // };

    /**
     * 关闭AI对话框
     */
    const closeAiModal = () => {
      setAiModal(false);
    };

    /**
     * 确认建模按钮
     * @param content 确认建模
     */
    const subAiBuildModel = async (content?: string) => {
      const { data } = await postAddAiModel({
        accountId: id,
        content,
      });
      return data;
    };

    /**
     * 该异步函数负责执行一系列操作来展示OpenAI数据。
     *
     * 功能：
     * - 首先，通过调用`closeAiModal`函数关闭任何当前打开的AI相关模态窗口，确保用户的焦点集中在新加载的数据上。
     * - 然后，通过设置`aiDataShow`状态为`true`，触发组件重新渲染，并在用户界面上展示最新的OpenAI数据。
     */
    const openAiData = async () => {
      // 关闭现有的AI模态对话框，清空界面以便呈现新数据
      closeAiModal();

      // 只有有权限的时候才会打开AI临时列表
      if (operatePermission) {
        // 更新应用状态，使得AI数据在用户界面上可见
        setAiDataShow(true);
      }
    };

    /**
     * 关闭AI对话框
     */
    const closeAIBuilding = async () => {
      if (!closeAiBuilding) return;
      await postAiCloseData({ accountId: id });

      Toast('warn', I18N.carbonFootprint3.youHaveCancelledA);
      setCloseAiBtnStatus(false);
      if (updateAccountInfo) {
        updateAccountInfo();
      }
      closeAiBuilding();
    };

    /**
     * 开始建模
     */
    const goModeling = async () => {
      if (!goModelingBack) return;

      try {
        await goModelingBack(false);
        const { code, msg } = await subAiBuildModel(aiModalInput);

        if (code === 200) {
          await goModelingBack(true);
        } else {
          Toast('warn', msg);
          await goModelingBack(false, true);
        }
        setCloseAiBtnStatus(true);
      } catch (error) {
        await goModelingBack(false, true);
      }
    };

    /**
     * 获取AI建模临时排放源列表
     */
    const getAiListTmp = async () => {
      setFormLoading(true);
      if (
        !operatePermission ||
        location.pathname ===
          RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShareLogin ||
        location.pathname ===
          RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShare
      ) {
        return;
      }
      const { data } = await getAiDataList(aiListTmpParamsRef.current);

      if (data.data.rows && data.data.rows.length > 0) {
        const aiDataList = data.data.rows.map((info, infoIndex) => {
          if (info.type === TRANS) {
            const transUnitCode =
              info.typeExtra?.distUnitCode || info.typeExtra?.unitCode;

            const transUnitName =
              info.typeExtra?.distUnitName || info.typeExtra?.unitName;

            return {
              key: info.id,
              set: {
                id: info.id,
                index: infoIndex,
                // 初始化 默认还没编辑
                editStatus: false,
                name: info.name,
              },
              type: info.type,
              name: {
                value: info.name,
                validReauire: false,
              },
              amountObj: {
                transObj: {
                  ...info.typeExtra,
                  distUnitCode: transUnitCode
                    ? Number(transUnitCode)
                    : undefined,
                  unitCodeArr: info?.unitCodeArr
                    ? info?.unitCodeArr.split(',')
                    : undefined,
                  unitName: info.typeExtra?.unitName,
                  unitCode: info.typeExtra?.unitCode
                    ? Number(info.typeExtra?.unitCode)
                    : undefined,
                  distUnitName: transUnitName,
                },
                type: info.type,
                amount: info.amount !== null ? Number(info.amount) : undefined,
                unitCodeArr: info?.unitCodeArr
                  ? info?.unitCodeArr.split(',')
                  : undefined,
              },
              accountEmissionTransportList: info.accountEmissionTransportList,
              needTrans: (info.accountEmissionTransportList || []).length > 0,
            };
          }

          return {
            key: info.id,
            set: {
              id: info.id,
              index: infoIndex,
              // 初始化 默认还没编辑
              editStatus: false,
              name: info.name,
            },
            type: info.type,
            name: {
              value: info.name,
              validReauire: false,
            },
            amountObj: {
              type: info.type,
              unitCode: info.unitCode,
              unitCodeArr: info?.unitCodeArr
                ? info?.unitCodeArr.split(',')
                : undefined,
              amount: info.amount !== null ? Number(info.amount) : undefined,
            },
            accountEmissionTransportList: info.accountEmissionTransportList,
            needTrans: (info.accountEmissionTransportList || []).length > 0,
          };
        });

        setPaginationTotal(data.data.total);
        form.setValues({
          AiDataList: aiDataList,
        });
        setTimeout(() => {
          if (needValidateFirst.current) {
            form.validate();
            validateAiDataExcludeTransport();
            needValidateFirst.current = false;
          }
        });
      } else {
        setPaginationTotal(0);
        form.setValues({
          AiDataList: [],
        });
      }
      setFormLoading(false);
    };

    /**
     * ai对话框 - 用户输入文案
     */
    const handleTextAreaChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setAiModalInput(e.target.value);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debouncedInputHandler(e.target.value);
      }, 500);
    };

    /**
     * 修改分页
     * @param pageNum 页码
     */
    const changePage = async (pageNum: number) => {
      form.setValues(undefined);

      aiListTmpParamsRef.current.pageNum = pageNum;

      const paginationItems = document.getElementsByClassName(
        `ant-pagination-item-${pageNum}`,
      );
      for (let i = 0; i < paginationItems.length; i++) {
        const item = paginationItems[i] as HTMLElement;
        // 设置分页样式
        item.classList.remove('ant-pagination-item-error');
      }

      await getAiListTmp();
    };

    useEffect(() => {
      if (unitOptionsApi) {
        setAiSchema(
          aiDataSchema(
            unitOptionsApi,
            (id, name) => removeTemp(id, name),
            id => showEmissionSourceDrawer(id),
            isEn,
          ),
        );
      }
    }, [form, unitOptionsApi]);

    /**
     * 删除临时排放源列表
     * @param removeId 选中的id
     */
    const removeTemp = async (removeId: number, name: string) => {
      const formValue = form.values;

      modal.confirm({
        title: I18N.carbonFootprint.prompt,
        content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis16, {
          val1: name || '-',
        }),
        okButtonProps: {
          danger: true,
        },
        icon: null,
        onOk: async () => {
          await postAiDeleteTmp({ id: removeId });

          // 说明是最后一条数据
          if (
            formValue?.AiDataList?.length === 1 &&
            aiListTmpParamsRef.current.pageNum > 1
          ) {
            aiListTmpParamsRef.current.pageNum -= 1;
          }

          await getAiListTmp();

          // 主动更新画布
          if (updateGaphByAi) {
            updateGaphByAi();
          }
        },
      });
    };

    const showEmissionSourceDrawer = useCallback((id: number) => {
      setEmissionSourceId(id);
      setEmissionSourceModalVisible(true);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [errorList, setErrorList] = useState<
      { stage: string; indexs: string }[]
    >([]);

    /**
     * 临时排放源列表取消建模
     */
    const subAiClose = async () => {
      if (!closeAiBuilding) return;
      await postAiCloseData({ accountId: id });
      setAiDataShow(false);
      setCloseAiBtnStatus(false);
      // setAiModal(true);
      setTimeout(() => {
        setNewAiModalOpen(true);
      }, 500);
      Toast('warn', I18N.carbonFootprint3.youHaveCancelledA);
      if (updateAccountInfo) {
        updateAccountInfo();
      }

      closeAiBuilding();
    };

    const validateAiDataExcludeTransport = () => {
      let isVerifySuccess = true;
      const formValue = form.values;
      formValue.AiDataList.forEach((list, listIndex) => {
        // 没填写名称的话，提示红色弹框
        if (!list.name.value) {
          isVerifySuccess = false;
          form.setValuesIn(`AiDataList.${listIndex}.name`, {
            value: '',
            validReauire: true,
          });
        }

        // 消耗数量
        if (
          list.type !== TRANS &&
          (!list.amountObj?.amount || !list.amountObj?.unitCode)
        ) {
          isVerifySuccess = false;
          form.setValuesIn(`AiDataList.${listIndex}.amountObj`, {
            ...list.amountObj,
            amountRequire: !list.amountObj?.amount,
            unitCodeRequire: !list.amountObj?.unitCode,
          });
        }
      });
      return isVerifySuccess;
    };

    /**
     * 确认建模
     */
    const subAiModel = async () => {
      await form.validate();

      try {
        await form.validate();
        const { data } = await postAiDeleteSub({ accountId: id, modelType: 1 });
        if (data.data.errorCode === 1) {
          const { errorList } = data.data;
          // 当前页面有错误，不跳转，做些处理
          if (errorList.some(item => item.stage === activeStage)) {
            form.validate();
            validateAiDataExcludeTransport();
            const pageNums = errorList.find(
              item => item.stage === activeStage,
            )?.indexs;
            pageNums?.split(',').forEach(page => {
              const paginationItems = document.getElementsByClassName(
                `ant-pagination-item-${page}`,
              );
              for (let i = 0; i < paginationItems.length; i++) {
                const item = paginationItems[i] as HTMLElement;

                item.classList.add('ant-pagination-item-error');
              }
            });
            Toast(
              'error',
              I18N.template(I18N.carbonFootprint3.pleaseTransferTheNumberPa, {
                val1: pageNums,
              }),
            );
            return;
          }
          setErrorList(errorList);
          needValidateFirst.current = true;
          setActiveStage(errorList[0].stage as StageEnumType);
          const pageNums = errorList?.[0]?.indexs;
          Toast(
            'error',
            I18N.template(I18N.carbonFootprint3.pleaseTransferTheNumberPa, {
              val1: pageNums,
            }),
          );
          const tabsItems = document.getElementsByClassName(`ant-tabs-tab-btn`);
          for (let i = 0; i < tabsItems.length; i++) {
            const item = tabsItems[i] as HTMLElement;
            if (errorList.some(stages => Number(stages.stage) === i)) {
              item.classList.add('ant-tabs-item-for-error');
            } else {
              item.classList.remove('ant-tabs-item-for-error');
            }
          }
          data.data.errorList?.[0]?.indexs.split(',').forEach(page => {
            const paginationItems = document.getElementsByClassName(
              `ant-pagination-item-${page}`,
            );
            for (let i = 0; i < paginationItems.length; i++) {
              const item = paginationItems[i] as HTMLElement;

              item.classList.add('ant-pagination-item-error');
            }
          });
        } else {
          Toast('success', I18N.carbonFootprint3.aiModelingAs);
          setAiDataShow(false);

          // 清除用户输入的建模对话框内容
          removeModalInputById();
          // 主动更新画布
          if (updateGaphByAi) {
            updateGaphByAi();
          }

          if (closeAiBuilding) {
            // 确认建模后主动关闭 之前遗留的数据
            closeAiBuilding();
          }
        }
      } catch (error) {
        setAiDataShow(true);
      }
    };

    /**
     * 获取最新下载模板
     */
    const getRealDownloadFile = async () => {
      const downloadFile = await getImportModalFile({ id });
      setDownLoadTemplateObj(downloadFile.data.data);
    };

    /**
     * 主动更新 - 临时列表
     */
    const updateTempList = () => {
      getAiListTmp();
    };

    useEffect(() => {
      aiListTmpParamsRef.current.stage = activeStage;
      aiListTmpParamsRef.current.pageNum = 1;
      getAiListTmp();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStage]);

    useImperativeHandle(cRefDescribe, () => ({
      updateTempList,
    }));

    useMount(async () => {
      if (!isDetail && !!getToken()) {
        getAiPopoverStatus().then(res => {
          // 接口返回 点击过不再提醒
          if (res.data.data === false) {
            localStorage.removeItem('aiModal');
            setAiPopover(false);
          } else {
            const aiLoaclModal = localStorage.getItem('aiModal');
            if (!aiLoaclModal) {
              localStorage.setItem('aiModal', 'show');
              setAiPopover(true);
            }
          }
        });
      }

      const dic = await listALLByDictTypeBatch<{
        footprint3_export_template: Dicts[];
        factorUnitM: Dicts[];
      }>({
        dictTypes: 'factorUnitM',
        lang: locale === LocaleType.enUS ? 'en' : 'zh',
      });
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { factorUnitM } = dic.data.data;

      const unitOptions: Dicts[] = uniqBy(
        factorUnitM.map(u => ({
          ...u,
          label: u.sourceName,
          value: u.sourceType,
          sourceType: u.sourceType,
          children: changeDicts2Options(
            factorUnitM.filter(d => d.sourceType === u.sourceType),
          ) as Dicts[] | undefined,
        })),
        'value',
      );

      setUnitOptionsApi(unitOptions);

      setAiSchema(
        aiDataSchema(
          unitOptions,
          (id, name) => removeTemp(id, name),
          id => showEmissionSourceDrawer(id),
          isEn,
        ),
      );
    });

    /**
     * 收起ai临时列表
     */
    const unfoldAiData = () => {
      setPickUpAiData(false);
      setUnfoldListTooltip(false);

      localStorage.setItem('unfoldListTooltip', 'show');
      setTimeout(() => {
        getAiListTmp();
      }, 800);
    };

    const switchMainRef = useRef<BuildModelDescribeSet>(switchMain);

    useEffect(() => {
      if (!aiStatus && !aiBuildSuccess) {
        setAiDataShow(false);
        return;
      }
      // ai建模完毕 显示排放源列表弹框
      if (aiBuildSuccess) {
        if (aiType === EAiType.PROMPT) {
          if (switchMain === switchMainRef.current) {
            openAiData();
            getAiListTmp();
          } else {
            switchMainRef.current = switchMain;
            getAiListTmp();
          }
        } else if (aiType === EAiType.EXCEL) {
          if (switchMain === switchMainRef.current) {
            setNewAiModalOpen(true);
          } else {
            switchMainRef.current = switchMain;
          }
        }
      }

      if (!aiBuildSuccess && aiDataShow) {
        getAiListTmp();
      }

      if (unitOptionsApi) {
        setAiSchema(
          aiDataSchema(
            unitOptionsApi,
            (id, name) => removeTemp(id, name),
            id => showEmissionSourceDrawer(id),
          ),
        );
      }
    }, [aiBuildSuccess, switchMain]);

    useEffect(
      () => () => {
        // 组件卸载时清除定时器
        clearTimeout(debounceTimer);
      },
      [],
    );

    useEffect(() => {
      setImportBackCode(inStatus || undefined);
    }, [inStatus]);

    useEffect(() => {
      if (scope === CUSTOM && scopeValue) {
        const getScopeValueArr = scopeValue.split(',');
        const scopeCascader = getScopeValueArr.map(val => [
          Number(scope),
          Number(val),
        ]);
        setSelectCascader(scopeCascader);
      } else {
        setSelectCascader([[scope]]);
      }
    }, [scope, scopeValue]);

    const handleOpenDetailData = useCallback(async () => {
      if (excelUrl) {
        setDetailDataDrawerExcelUrl(undefined);
        setDetailDataDrawerOpen(true);
        return;
      }
      setDetailDataInitLoading(true);
      try {
        const { data } = await postInitAccountExcel({ accountId: id });
        if (data.code !== 200) {
          Toast('warn', data.msg || I18N.carbonFootprint.submissionFailed);
          return;
        }
        try {
          await Promise.resolve(updateAccountInfo?.());
          const { data: infoRes } = await getAccountingInfo({
            id: String(id),
            lang: locale === LocaleType.enUS ? 'en' : 'zh',
            ...(apiExtraParams || {}),
          });
          const freshUrl = infoRes?.data?.excelUrl;
          if (freshUrl) {
            setDetailDataDrawerExcelUrl(freshUrl);
            setDetailDataDrawerOpen(true);
          } else {
            Toast(
              'warn',
              I18N.carbonFootprint3.noDetailedInformationAvailableAtTheMoment,
            );
          }
        } catch {
          Toast('error', I18N.carbonFootprint.submissionFailed);
        }
      } catch {
        Toast('error', I18N.carbonFootprint.submissionFailed);
      } finally {
        setDetailDataInitLoading(false);
      }
    }, [apiExtraParams, excelUrl, id, locale, updateAccountInfo]);

    return (
      <div className={classNames(style.buildModelDescribe)}>
        {pickUpAiData && (
          <div className={style.unfoldList} onClick={unfoldAiData}>
            <Tooltip
              placement='left'
              title={I18N.carbonFootprint3.openEmissionSource}
              open={unfoldListTooltip}
            >
              <DoubleLeftOutlined />
            </Tooltip>
          </div>
        )}
        <div className={style.accountDescribe}>
          <span className={style.describeTextColor}>
            {I18N.carbonFootprint3.functionalUnits2}
          </span>
          <TextWidthOverflow width={200} value={accountName} />
          <span className={style.describeTextColorML}>
            {I18N.carbonFootprint.accountingCycle2}
          </span>
          <span>
            {startTime || '-'}
            {I18N.carbonFootprint.to}
            {endTime || '-'}
          </span>
          <span className={style.selectScopeBorder} />
          {checkPermissions(
            <Cascader
              disabled={isDisabled}
              options={cascaderOptions}
              value={selectCascader}
              onChange={selectScopeChange}
              maxTagCount='responsive'
              multiple
              // showCheckedStrategy={Cascader.SHOW_CHILD}
              dropdownRender={dropdownRender}
            >
              <div className={style.selectText}>
                {ACCOUNT_SELECT_LIFE_CYCLE_LABEL[scope]}
                {!isDisabled && (
                  <DownOutlined className={style.selectTextIcon} />
                )}
              </div>
            </Cascader>,
            'footprint3:account:edit',
          )}
          {/* <span className={style.lifeCycle}>
            （{scopeValueArrLabel.join('、')}）
          </span> */}
        </div>
        <div className={style.accountSetMain}>
          {!hideDetailDataEntry && (
            <Tooltip
              placement='bottom'
              title={I18N.enterpriseCarbonAccount2.detailData}
            >
              <Button
                size='small'
                type='text'
                className={classNames(style.detailDataIconButton, 'm-r-8')}
                loading={detailDataInitLoading}
                onClick={handleOpenDetailData}
                icon={
                  <img
                    className={style.detailDataIcon}
                    src={DetailDataIcon}
                    alt={I18N.enterpriseCarbonAccount2.detailData}
                  />
                }
              />
            </Tooltip>
          )}
          {!isDetail && type === QUICK && operatePermission && (
            <>
              {/* {checkPermissions(true, 'footprint3:account:ai') ? (
                <Popover
                  style={{
                    zIndex: 1000,
                  }}
                  overlayClassName='aiPopover'
                  content={
                    <div className={style.aiMain}>
                      <div className={style.aiHeader}>
                        <img
                          className={style.aiModelIcon}
                          src={AIIcon}
                          alt={I18N.carbonFootprint3.aiModelingI}
                        />
                        <span className={style.aiModelTitle}>
                          {I18N.carbonFootprint3.onAiModeling}
                        </span>
                        <CloseOutlined
                          className={style.aiModelClose}
                          onClick={closeAiPopver}
                        />
                      </div>
                      <div className={style.aiDescribe}>
                        {I18N.carbonFootprint3.canUseAi}
                      </div>
                      <div className={style.aiBtns}>
                        <Button className={style.aiBtn} onClick={noShowPopver}>
                          {I18N.carbonFootprint3.noMoreReminders}
                        </Button>
                        <Button
                          className={style.aiBtn}
                          type='primary'
                          onClick={() => {
                            closeAiPopver();
                            // openAiModal();
                            // openNewAiModal();
                            setNewAiModalOpen(true);
                          }}
                        >
                          {I18N.carbonFootprint3.experienceNow}
                        </Button>
                      </div>
                    </div>
                  }
                  title={undefined}
                  trigger='click'
                  visible={aiPopover}
                >
                  <div
                    onClick={() => {
                      // console.log(aiType)
                      // if (isBuilding || aiDataShow) return;

                      // 如果是批量编辑的导入排放源 - 正在导入的排放源关闭临时排放源弹框
                      if (importBackCode) return;

                      if (
                        aiStatus === AiProcessStatus.PENDING &&
                        aiType === EAiType.AI_CREATE
                      ) {
                        return;
                      }
                      // setNewAiModalOpen(true);

                      if (aiBuildSuccess) {
                        if (aiType === EAiType.PROMPT) {
                          closeAiPopver();
                          // openAiModal();
                          setAiDataShow(true);
                        } else if (aiType === EAiType.EXCEL) {
                          setNewAiModalOpen(true);
                        }
                      } else {
                        setNewAiModalOpen(true);
                      }
                      // setNewAiModalOpen(true);

                      // // openAiModal();
                      // setNewAiModalOpen(true);
                    }}
                  >
                    <img
                      className={style.aiModelImg}
                      src={isEn ? AIModelEn : AIModel}
                      alt={I18N.carbonFootprint3.aiModeling}
                    />
                  </div>
                </Popover>
              ) : undefined} */}

              {!isDetail && type === QUICK && operatePermission && (
                <span onClick={checkModel}>
                  <Tooltip
                    placement='bottom'
                    title={I18N.carbonFootprint3.checkTheModel}
                  >
                    <img
                      className={style.checkModelIcon}
                      src={CheckModelIcon}
                      alt={I18N.carbonFootprint3.checkTheModel}
                    />
                  </Tooltip>
                </span>
              )}

              <span className={classNames(style.selectScopeBorder, 'm-r-16')} />

              {operatePermission && (
                <span
                  className={style.importAndOutMain}
                  style={
                    importBackCode
                      ? {
                          cursor: 'not-allowed',
                        }
                      : {}
                  }
                >
                  {importBackCode && (
                    <span className={style.importBackCodeStyle}>
                      {I18N.carbonFootprint3.importing}
                      <LoadingOutlined className='m-l-6' />
                    </span>
                  )}

                  <Tooltip
                    placement='bottom'
                    title={I18N.carbonFootprint3.importData}
                  >
                    {importVisibleIcon ? (
                      <LoadingOutlined className='m-r-6' />
                    ) : (
                      <IconAlibaba
                        onClick={async () => {
                          setImportVisibleIcon(true);
                          if (!importBackCode) {
                            await getRealDownloadFile();
                            setImportVisible(true);
                          }
                          setImportVisibleIcon(false);
                        }}
                        type='icon-icon_daoru'
                        style={{ fontSize: 18, marginRight: 4 }}
                      />
                    )}
                  </Tooltip>
                </span>
              )}

              <span
                onClick={exportExcel}
                className={classNames(style.importAndOutMain, 'm-l-16')}
              >
                <Tooltip
                  placement='bottom'
                  title={I18N.carbonFootprint3.exportData}
                >
                  <IconAlibaba
                    type='icon-icon_daochu'
                    style={{
                      fontSize: 18,
                      marginRight: 4,
                    }}
                  />
                </Tooltip>
              </span>
            </>
          )}

          <DetailDataDrawerView
            open={detailDataDrawerOpen}
            onClose={() => {
              setDetailDataDrawerOpen(false);
              setDetailDataDrawerExcelUrl(undefined);
            }}
            excelUrl={detailDataDrawerExcelUrl ?? excelUrl}
            accountName={accountName}
            accountId={id}
          />

          {showListGraphSwitch ? (
            switchMain === VISUAL ? (
              <span
                className={style.changeListOrGraph}
                onClick={() => {
                  if (!getToken() && !isShare) {
                    openLoginModal({
                      companyType: CompanyType.company,
                      showWechatLogin: true,
                      onSuccess: async () => {
                        await handleAccountIdBindWithUpgrade();
                      },
                    });
                    return;
                  }
                  changeMainStatus(LIST);
                }}
              >
                <Tooltip
                  placement='bottom'
                  title={I18N.carbonFootprint3.switchToList}
                >
                  <UnorderedListOutlined
                    style={{
                      fontSize: 16,
                    }}
                  />
                </Tooltip>
              </span>
            ) : (
              <span
                className={style.changeListOrGraph}
                onClick={() => {
                  changeMainStatus(VISUAL);
                }}
              >
                <Tooltip
                  placement='bottom'
                  title={I18N.carbonFootprint3.switchToVisual}
                >
                  <IconAlibaba
                    type='icon-icon_qiehuanzhikeshihua'
                    style={{
                      fontSize: 18,
                    }}
                  />
                </Tooltip>
              </span>
            )
          ) : null}
          {importVisible && downLoadTemplateObj && (
            <ImportFileModal<EmissionImportTableList, EmissionImportParams>
              title={I18N.carbonFootprint.importEmissionSources}
              visible={importVisible}
              onCancelBack={onCancelImport}
              onOkImport={onOkImportBack}
              downLoadTemplateUrl={downLoadTemplateObj.url}
              downLoadTemplateName={downLoadTemplateObj?.name}
              importFileRequestBack={importFileRequestBack}
              searchParamsData={searchImportParams}
              getFileListRequest={getFileEmissionImportApi}
            />
          )}
        </div>
        {checkModalLoading && (
          <div className={style.maskAI}>
            <div className={style.maskCheckModel}>
              <LoadingOutlined className={style.maskCheckModelLoading} />
              <span>{I18N.carbonFootprint3.modelCheckInProgress}</span>
            </div>
          </div>
        )}
        <div
          className={classNames(style.aiModal, {
            [style.aiModalActive]: aiModal,
          })}
        >
          <div className={style.aiModalMain}>
            <div className={style.aiModalTitle}>
              <img
                className={style.aiModalTitleImg}
                src={AIModel}
                alt={I18N.carbonFootprint3.aiModeling}
              />
              <CloseOutlined
                className={style.aiModalClose}
                onClick={closeAiModal}
              />
            </div>
            <div className={style.aiModalInput}>
              <TextArea
                readOnly={aiLoading}
                value={aiModalInput}
                rows={8}
                placeholder={I18N.carbonFootprint3.youCanEnter}
                maxLength={500}
                onChange={handleTextAreaChange}
              />
            </div>
            <div className={style.aiModalPal1}>
              {I18N.carbonFootprint3.aiWillBeBasedOn}
            </div>
            <div className={style.aiModalPal2}>
              {I18N.carbonFootprint3.exampleThisKilogram}
            </div>
            <div className='m-t-16'>
              <Button
                loading={aiLoading}
                type='primary'
                style={{ width: '100%' }}
                onClick={goModeling}
              >
                {aiLoading
                  ? I18N.carbonFootprint3.inModeling
                  : I18N.carbonFootprint3.startModeling}
              </Button>
              {aiLoading && closeAiBtnStatus && (
                <Button
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={closeAIBuilding}
                >
                  {I18N.carbonFootprint3.cancelModeling}
                </Button>
              )}
            </div>
          </div>
        </div>

        {!inStatus &&
          false &&
          aiSchema &&
          checkPermissions(true, 'footprint3:account:ai') && (
            <div
              className={classNames(style.aiData, {
                [style.aiDataActive]: aiDataShow,
                [style.pickUpAiData]: pickUpAiData,
                [style.aiDataEn]: isEn,
              })}
            >
              <div className={style.header}>
                <div className={style.title}>
                  {I18N.carbonFootprint3.aiGeneratedModel}
                </div>
                <div
                  className={style.close}
                  onClick={() => {
                    setAiDataShow(false);
                    updateGaphByAi?.();
                  }}
                >
                  <CloseOutlined />
                </div>
              </div>
              {/* <div
                className={style.packUpList}
                onClick={() => setPickUpAiData(true)}
              >
                <DoubleRightOutlined />
              </div> */}
              <div className={style.aiDataMain}>
                <div className={style.aiDataHeader}>
                  <div className={style.logoAndDes}>
                    <img
                      className={style.aiDataTitleImg}
                      src={isEn ? AIModelEn : AIModel}
                      alt={I18N.carbonFootprint3.aiModeling}
                    />
                    <div className={style.aiDataTabDescribe}>
                      {I18N.carbonFootprint3.theFollowingIsASummaryOfThis}
                    </div>
                  </div>
                  <Button
                    loading={importVisibleBtn}
                    onClick={async () => {
                      setImportVisibleBtn(true);
                      if (!importBackCode) {
                        await getRealDownloadFile();
                        setImportVisible(true);
                      }
                      setImportVisibleBtn(false);
                    }}
                  >
                    {I18N.carbonFootprint3.batchEditing}
                  </Button>
                </div>
                <Spin spinning={formLoading} style={{ height: 'auto' }}>
                  <Tabs
                    activeKey={activeStage}
                    items={getStageItems(scopeValue)}
                    onChange={v => {
                      aiListTmpParamsRef.current.pageNum = 1;
                      setActiveStage(v as StageEnumType);
                    }}
                  />
                  <div className={style.aiDataTable}>
                    <FormilyCommon form={form}>
                      <SchemaField schema={aiSchema} />
                    </FormilyCommon>
                  </div>

                  <EmissionSourceDrawer
                    // apiExtraParams={apiExtraParams}
                    // copyStatus={emissionCopyStatus}
                    emissionAiFlag={1}
                    visible={emissionSourceModalVisible}
                    // showSupplier={showSupplier}
                    accountId={id}
                    // readPretty={readPrettyFunc()}
                    emissionSourceId={emissionSourceId}
                    stage={activeStage}
                    onClose={() => setEmissionSourceModalVisible(false)}
                    onSuccess={async () => {
                      // if (changeEmission) {
                      //   changeEmission();
                      // }

                      setEmissionSourceModalVisible(false);
                      // updateGraph();
                      await getAiListTmp();

                      // 主动更新画布
                      if (updateGaphByAi) {
                        updateGaphByAi();
                      }
                    }}
                  />

                  <Row justify='end'>
                    <Col>
                      <Pagination
                        total={paginationTotal}
                        pageSize={aiListTmpParamsRef.current.pageSize}
                        current={aiListTmpParamsRef.current.pageNum}
                        onChange={page => {
                          changePage(page);
                        }}
                      />
                    </Col>
                  </Row>
                </Spin>
                <div className={style.aiDataTabBtnsMain}>
                  <Button onClick={subAiClose}>
                    {I18N.carbonFootprint3.cancelThisConstruction}
                  </Button>
                  <Button className='m-l-8' onClick={subAiClose}>
                    {I18N.carbonFootprint3.reModeling}
                  </Button>
                  <Button className='m-l-8' type='primary' onClick={subAiModel}>
                    {I18N.carbonFootprint3.confirmModeling}
                  </Button>
                </div>
              </div>
            </div>
          )}
        {operatePermission && type === QUICK ? (
          <Modal
            title={undefined}
            width={1200}
            maskClosable={false}
            visible={checkModal}
            footer={null}
            style={{
              top: 50,
            }}
            bodyStyle={{
              padding: '0 24px',
            }}
            onCancel={() => {
              childRef.current?.initActive();
              setCheckModal(false);
            }}
          >
            <CheckModalData
              accountId={id}
              cRef={childRef}
              modelCheckData={modelCheckData}
              onCancel={() => {
                setCheckModal(false);
              }}
              onExpertCheck={() => {
                childRef.current?.initActive();
                setCheckModal(false);
              }}
              updateModelCheckData={async (backData?: CheckModelData) => {
                if (backData) {
                  setModelCheckData(backData);
                } else {
                  await getCheckModelData();
                }

                if (updateGaphByAi) {
                  updateGaphByAi();
                }
              }}
              hideExpertEvaluationCta={hideExpertEvaluationCta}
            />
          </Modal>
        ) : undefined}

        <AnimationFullscreenModal open={newAiModalOpen}>
          <AiModal
            onClosed={() => {
              setNewAiModalOpen(false);
              updateGaphByAi?.();
              updateAccountInfo?.();
            }}
            isDetail={isDetail}
            showPromptModal={() => {
              setNewAiModalOpen(false);
              setAiDataShow(true);
              updateTempList();
            }}
            updateAccountInfo={updateAccountInfo}
            aiLoading={aiLoading}
            aiBuildSuccess={aiBuildSuccess}
            accountInfo={{
              aiStatus,
              accountName,
              startTime,
              endTime,
              scopeValue,
              scope,
              id,
              type,
              inStatus,
              factorPrefId,
              aiType,
            }}
          />
        </AnimationFullscreenModal>
      </div>
    );
  },
);
