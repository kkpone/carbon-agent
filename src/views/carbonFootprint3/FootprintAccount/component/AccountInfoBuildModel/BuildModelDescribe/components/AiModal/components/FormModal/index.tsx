/**
 * 头部步骤条操作下面的功能单位描述和切换操作
 */
import { Text } from '@components/FormilyUtil/util';
import {
  ArrayTable,
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  // Switch,
} from '@formily/antd-v5';
import {
  createForm,
  Field,
  Form,
  ObjectField,
  onFieldChange,
  onFieldValueChange,
} from '@formily/core';
import { ISchema, createSchemaField } from '@formily/react';
import { listALLByDictTypeBatch } from '@src/api/api';
import AIModel from '@src/assets/images/carbonFootprint3.6.4/AIModel.png';
import AIModelEn from '@src/assets/images/carbonFootprint3.6.4/AIModelEn.png';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import EmissionSourceDrawer from '@src/views/carbonFootprint3/component/EmissionSourceDrawer';
import {
  ALL_EMISSION_LABEL,
  EMISSION_TYPE_OPTIONS,
  QUICK_ACCOUNT_EMISSION,
} from '@src/views/carbonFootprint3/constant';
import { haveAccountEditPermissions } from '@src/views/carbonFootprint3/permissions';
import { Dicts } from '@src/views/emission/Show/type';
import { changeDicts2Options } from '@src/views/utils';
import { useMount, useUpdate } from 'ahooks';
import { Button, Col, Modal, Pagination, Row, Spin, Tabs } from 'antd';
import classNames from 'classnames';
import { isNull, omitBy, uniqBy } from 'lodash-es';
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

import './index.css';

import FormilyTableFactor from '@/components/FormilyUtil/FormilyTableFactor';
import { LocaleContext } from '@/components/LocaleProvider';
import { GetLocalStorageProductId } from '@/utils/store';
import { MODEL_EMISSION_MATCH_WAY } from '@/views/carbonFootprint3/BusinessAccountingModel/constant';
import { postAutoMatchFactor } from '@/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/service';

import { EditButton } from './EditButton';
import FormAiDataAmount from './FormAiDataAmount';
import FormAiDataName from './FormAiDataName';
import FormTransportList from './FormTransportList';
import style from './index.module.less';
import override from './override.module.less';
import { aiDataSchema } from './schema';
import { setChanged } from './utils';
import { getStageItems, StageEnumType } from '../../../../const';
import {
  getAiDataList,
  postAiCloseData,
  postAiDeleteSub,
  postAiDeleteTmp,
  postAiEditTmpAi,
} from '../../../../service';
import {
  AiDataFormValues,
  AiDataListApiParams,
  BuildModelDescribeProps,
} from '../../../../type';
import './aiIndex.less';
import { Switch } from '../FormilySwitch';
import { SubmitButton } from './SubmitButton';

import { toJS } from '@formily/reactive';

const { TRANS } = EMISSION_TYPE_OPTIONS;

const { FACTOR, FACTOR_CREATE } = MODEL_EMISSION_MATCH_WAY;

const { confirm } = Modal;

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
    SubmitButton,
    FormilyTableFactor,
  },
});

export const BuildModelDescribe: FC<BuildModelDescribeProps> = memo(
  ({
    accountInfo: { aiStatus, scopeValue, id, factorPrefId },
    cRefDescribe,
    aiBuildSuccess,
    updateGaphByAi,
    // closeAiBuilding,
    isDetail,
    switchMain,
    updateAccountInfo,
    onClose,
  }) => {
    let debounceTimer: NodeJS.Timeout | undefined;
    const [activeStage, setActiveStage] = useState<StageEnumType | undefined>();

    const [selectItemActiveStage, setSelectItemActiveStage] =
      useState<StageEnumType>();

    /**
     * 获取本地存储的用户输入对话框内容
     * @returns 对话框内容
     */
    // const getLocalModalInputArr = () => {
    //   const localAiInputs = localStorage.getItem('AiModalInput');
    //   if (!localAiInputs) return undefined;

    //   const inputsData: { accountId: number; text: string }[] =
    //     JSON.parse(localAiInputs);
    //   return inputsData;
    // };

    const { locale } = useContext(LocaleContext);

    const isEn = locale === LocaleType.enUS;

    const operatePermission = haveAccountEditPermissions();

    // useEffect(() => {
    //   const scopeValueArr = scopeValue ? scopeValue.split(',') : [];
    //   if (scopeValueArr.length > 0) {
    //     setActiveStage(scopeValueArr[0]);
    //   }
    // }, [scopeValue]);

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

    /** 动态设置Schema */
    const [aiSchema, setAiSchema] = useState<ISchema>();

    /** Form区域loading */
    const [formLoading, setFormLoading] = useState(false);

    const [unitOptionsApi, setUnitOptionsApi] = useState<Dicts[]>();

    /**
     * 基本信息 名称输入框输入后动态获取因子信息
     * @param newName 名称
     */
    const onBasicNameChange = async (
      field: Field,
      fireImmediately: boolean,
      form: Form,
    ) => {
      // 没有更改表单直接返回
      if (!form.modified && !fireImmediately) return;

      // 名称相同不出发
      // if (formNameUseRef.current === newName) return;

      const parentPath = field.path.pop();

      // 如果因子为手动填写也返回 - 手动填写的因子更改名称不自动匹配因子
      if (
        form.getValuesIn(`${parentPath}.factorObj.matchWay`) ===
          FACTOR_CREATE ||
        form.getValuesIn(`${parentPath}.matchWay`) === FACTOR_CREATE ||
        form.getValuesIn(`${parentPath}.type`) === QUICK_ACCOUNT_EMISSION.TRANS
      )
        return;

      // formNameUseRef.current = newName;

      const formType = form.getValuesIn(`${parentPath}.type`);
      /**
       * 运输类不回填此处逻辑
       */
      if (formType === QUICK_ACCOUNT_EMISSION.TRANS) {
        return;
      }

      try {
        form.setFieldState(`${parentPath}.factorObj`, {
          loading: true,
        });
        // 只有排放源名称更改后才会自动匹配 不论是否已经存在因子 - 3.5.5测试用例评审更改需求 10-08
        // setAutoMatchFactorLoading(true);
        const { data } = await postAutoMatchFactor({
          name: field.value?.value || field.value,
          factorType: '3',
          productId: GetLocalStorageProductId(),
          emissionType: formType ? ALL_EMISSION_LABEL()[formType] : undefined,
        });
        if (data.data) {
          const [numeratorUnit, denominatorUnit] = (data.data.unit || '').split(
            '/',
          );
          const formFactorObjValue = form.getValuesIn(
            `${parentPath}.factorObj`,
          );
          form.setValuesIn(`${parentPath}.factorObj`, {
            ...formFactorObjValue,
            ...data.data,
            numeratorUnit,
            denominatorUnit,
            matchWay: FACTOR,
          });
          form.setValuesIn(`${parentPath}.matchWay`, FACTOR);
        } else {
          form.setValuesIn(`${parentPath}.factorObj`, undefined);
        }
      } catch (e) {
        form.setValuesIn(`${parentPath}.factorObj`, undefined);
      } finally {
        // setAutoMatchFactorLoading(false);
        form.setFieldState(`${parentPath}.factorObj`, {
          loading: false,
        });
      }
    };

    const update = useUpdate();
    const form = useMemo(
      () =>
        createForm<AiDataFormValues>({
          readPretty: isDetail,
          effects: () => {
            onFieldValueChange('AiDataList.*.type', (field, newForm) => {
              // 获取消耗数量的路径
              const amountFieldPath = field.query('.amountObj').take()?.path;
              if (amountFieldPath && field.visited) {
                setChanged(newForm, field);
              }
            });
            onFieldValueChange('AiDataList.*.name', (field, form) => {
              if (field.selfModified) {
                field.selfModified = false;
                const hasFactorObj =
                  Object.keys(
                    toJS(field.query('.factorObj').take()?.value) || {},
                  ).length > 0;
                if (!hasFactorObj) {
                  // setChanged(newForm, field);
                  onBasicNameChange(field, true, form);
                }
                setChanged(form, field);
              }
            });
            onFieldValueChange('AiDataList.*.stage', (field, form) => {
              if (field.selfModified) {
                field.selfModified = false;
                setChanged(form, field);
              }
            });
            onFieldValueChange('AiDataList.*.needTrans', (field, form) => {
              // 拿到当前一行的id
              if (field.value) {
                form.setValuesIn(
                  `${field.path.pop()}.accountEmissionTransportList`,
                  [{}],
                );
              } else {
                form.setValuesIn(
                  `${field.path.pop()}.accountEmissionTransportList`,
                  [],
                );
              }
              if ((field as ObjectField).selfModified) {
                (field as ObjectField).selfModified = false;
                setChanged(form, field as ObjectField);
              }
              update();
            });
            onFieldChange(
              'AiDataList.*.amountObj',
              ['selfModified'],
              (field, form) => {
                if ((field as ObjectField).selfModified) {
                  (field as ObjectField).selfModified = false;
                  setChanged(form, field as ObjectField);
                }
              },
            );
            onFieldChange(
              'AiDataList.*.accountEmissionTransportList',
              ['selfModified'],
              (field, form) => {
                if ((field as ObjectField).selfModified) {
                  (field as ObjectField).selfModified = false;
                  setChanged(form, field as ObjectField);
                }
              },
            );
            onFieldChange(
              'AiDataList.*.factorObj',
              ['selfModified'],
              (field, form) => {
                if ((field as ObjectField).selfModified) {
                  (field as ObjectField).selfModified = false;
                  setChanged(form, field as ObjectField);
                }
              },
            );
          },
        }),
      [switchMain, aiBuildSuccess, activeStage],
    );

    /**
     * 该异步函数负责执行一系列操作来展示OpenAI数据。
     *
     * 功能：
     * - 首先，通过调用`closeAiModal`函数关闭任何当前打开的AI相关模态窗口，确保用户的焦点集中在新加载的数据上。
     * - 然后，通过设置`aiDataShow`状态为`true`，触发组件重新渲染，并在用户界面上展示最新的OpenAI数据。
     */
    const openAiData = async () => {
      // 只有有权限的时候才会打开AI临时列表
      if (operatePermission) {
        // 更新应用状态，使得AI数据在用户界面上可见
        setAiDataShow(true);
      }
    };

    /**
     * 获取AI建模临时排放源列表
     */
    const getAiListTmp = async () => {
      setFormLoading(true);
      form.clearErrors();
      if (!operatePermission) {
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
              id: info.id,
              set: {
                id: info.id,
                index: infoIndex,
                // 初始化 默认还没编辑
                editStatus: false,
                name: info.name,
              },
              type: info.type,
              stage: info.stage,
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
            id: info.id,
            set: {
              id: info.id,
              index: infoIndex,
              // 初始化 默认还没编辑
              editStatus: false,
              name: info.name,
            },
            type: info.type,
            stage: info.stage,
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
              unitName: info.unitName,
            },
            factorObj: isNull(info.factorObj)
              ? undefined
              : {
                  ...info.factorObj,
                  matchWay: info.matchWay,
                },
            accountEmissionTransportList: info.accountEmissionTransportList,
            needTrans: (info.accountEmissionTransportList || []).length > 0,
          };
        });

        setPaginationTotal(data.data.total);
        form.reset();
        form.setValues({
          AiDataList: [],
        });
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
        // form.reset();
        form.setInitialValues({
          AiDataList: [],
        });
      }
      setFormLoading(false);
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

    /**
     * 删除临时排放源列表
     * @param removeId 选中的id
     */
    const removeTemp = useCallback(
      async (removeId: number, name: string) => {
        const formValue = form.values;

        confirm({
          title: I18N.carbonFootprint.prompt,
          content: I18N.template(
            I18N.carbonFootprint3.confirmDeletionOfThis16,
            { val1: name || '-' },
          ),
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
      },
      [form],
    );

    const submit = async (data: any) => {
      await postAiEditTmpAi({
        ...omitBy(data, ['__DO_NOT_USE_THIS_PROPERTY_index__', 'key', 'set']),
        accountEmissionTransportList: data.accountEmissionTransportList?.map(
          item => ({
            ...item,
            amount: item.amount || 0,
            unitCode: item.unitCode || '',
          }),
        ),
        amount: data.amountObj.amount?.toString(),
        unitCode: data.amountObj.unitCode,
        unitName: data.amountObj.unitName,
        unitCodeArr: data.amountObj.unitCodeArr?.join(','),
        name: data.name.value,
        matchWay: data.factorObj?.matchWay,
        needTrans: data.needTrans ? 1 : 0,
        id: data.key,
        unitName: data.amountObj?.unitName,
      });
      await getAiListTmp();
    };

    const showEmissionSourceDrawer = (id: number) => {
      const dataList = form.values.AiDataList;
      const selectItem = dataList.find(item => item.key === id);
      if (selectItem) {
        setSelectItemActiveStage(selectItem.stage as unknown as StageEnumType);
      }
      setEmissionSourceId(id);
      setEmissionSourceModalVisible(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [errorList, setErrorList] = useState<
      { stage: string; indexs: string }[]
    >([]);

    /**
     * 临时排放源列表取消建模
     */
    const subAiClose = async () => {
      // if (!closeAiBuilding) return;
      await postAiCloseData({ accountId: id });
      // setAiDataShow(false);
      onClose?.(false);
      Toast('warn', I18N.carbonFootprint3.youHaveCancelledA);
      if (updateAccountInfo) {
        updateAccountInfo();
      }

      // closeAiBuilding();
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
        const { data } = await postAiDeleteSub({ accountId: id, modelType: 2 });
        if (data.data.errorCode === 1) {
          const { errorList } = data.data;
          // 当前页面有错误，不跳转，做些处理
          if (errorList.some(item => item.stage === activeStage)) {
            form.validate();
            validateAiDataExcludeTransport();
            const pageNums = errorList.find(
              item => item.stage === activeStage,
            )?.indexs;
            const pageNumFirst = Number(pageNums?.split(',')[0]);
            aiListTmpParamsRef.current.pageNum = isNaN(pageNumFirst)
              ? 1
              : pageNumFirst;
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
          const plus = (tabsItems.length - 1) / 2;
          for (let i = 0; i < plus + 1; i++) {
            const item = tabsItems[i + plus] as HTMLElement;
            if (errorList.some(stages => Number(stages.stage) === i - 1)) {
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
          onClose?.(true);

          // // 清除用户输入的建模对话框内容
          // removeModalInputById();
          // // 主动更新画布
          // if (updateGaphByAi) {
          //   updateGaphByAi();
          // }

          // if (closeAiBuilding) {
          //   // 确认建模后主动关闭 之前遗留的数据
          //   closeAiBuilding();
          // }
        }
      } catch (error) {
        setAiDataShow(true);
      }
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
      const dic = await listALLByDictTypeBatch<{
        footprint3_export_template: Dicts[];
        factorUnitM: Dicts[];
      }>({
        dictTypes: 'factorUnitM',
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
          removeTemp,
          id => showEmissionSourceDrawer(id),
          submit,
          isEn,
          getStageItems(scopeValue),
          {
            enableFactorSourceRange: !isDetail,
            factorPrefId,
          },
        ),
      );
    });

    useEffect(() => {
      if (!aiStatus && !aiBuildSuccess) {
        setAiDataShow(false);
        return;
      }
      // ai建模完毕 显示排放源列表弹框
      if (aiBuildSuccess) {
        openAiData();
        getAiListTmp();
      }

      if (!aiBuildSuccess && aiDataShow) {
        getAiListTmp();
      }

      if (unitOptionsApi) {
        setAiSchema(
          aiDataSchema(
            unitOptionsApi,
            removeTemp,
            id => showEmissionSourceDrawer(id),
            submit,
            isEn,
            getStageItems(scopeValue),
            {
              enableFactorSourceRange: !isDetail,
              factorPrefId,
            },
          ),
        );
      }
    }, [aiBuildSuccess, switchMain, activeStage]);

    useEffect(
      () => () => {
        // 组件卸载时清除定时器
        clearTimeout(debounceTimer);
      },
      [],
    );

    return (
      <div className={classNames(style.main, override.main)}>
        {/* <div className={style.closeBtn} onClick={onClose}>
          <CloseOutlined />
        </div> */}
        <div className={classNames(style.buildModelDescribe)}>
          <div className={style.title}>
            {I18N.carbonFootprint3.aiGeneratedModel}
          </div>
          <div className={style.des}>
            <img
              className={style.aiModelImg}
              src={isEn ? AIModelEn : AIModel}
              alt=''
            />
            {I18N.carbonFootprint3.theFollowingIsAi}
          </div>
          <div className={style.aiDataMain}>
            <Spin spinning={formLoading} style={{ height: 'auto' }}>
              <Tabs
                activeKey={activeStage}
                items={[
                  {
                    key: undefined,
                    label: I18N.carbonFootprint3.whole,
                  },
                ].concat(getStageItems(scopeValue) || [])}
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
                stage={selectItemActiveStage}
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
          </div>
          <div className={style.aiDataTabBtnsMain}>
            <Button onClick={subAiClose}>
              {I18N.carbonFootprint3.cancelThisConstruction}
            </Button>
            <Button className='m-l-8' onClick={() => onClose?.(false)}>
              {I18N.carbonFootprint3.temporarilyStore}
            </Button>
            <Button className='m-l-8' type='primary' onClick={subAiModel}>
              {I18N.carbonFootprint3.validated}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
