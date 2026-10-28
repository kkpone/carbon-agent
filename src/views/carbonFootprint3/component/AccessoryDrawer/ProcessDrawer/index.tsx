/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-29 16:18:47
 * @Date: 2023-03-14 09:44:19
 * @@description: 过程
 */
import {
  FormItem,
  FormGrid,
  Input,
  Select,
  Radio,
  Cascader,
  DatePicker,
} from '@formily/antd-v5';
import { createForm, FormPath } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Button } from '@src/components/Button';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import FormilyFactor from '@src/components/FormilyUtil/FormilyFactor';
import IconFont from '@src/components/iconfont';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import ProcessVisualizationFooterDrawer from '@src/views/carbonFootprint3/ProcessBusinessAccounting/VisualizationDrawer/FooterDrawer';
import {
  ProcessApiProduct,
  ProcessDetailVisualization,
} from '@src/views/carbonFootprint3/ProcessBusinessAccounting/VisualizationDrawer/type';
import FormilyFileUpload from '@src/views/carbonFootprint3/component/FormilyFileUpload';
import ModalProcessLib from '@src/views/carbonFootprint3/component/ProcessLibProductSelect/ModalProcessLib';
import { ProcessProduct } from '@src/views/carbonFootprint3/component/ProcessLibProductSelect/type';
import {
  CALC_WAY,
  MATCH_WAY,
  PROCESS_PRODUCT_TYPE,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import { ProcessLibIn } from '@src/views/carbonFootprint3/discharge/process/type';
import { PROCESS_VISUALIZATION_RADIO } from '@src/views/carbonFootprint3/util/constant';
import { Collapse, Drawer, Modal, Spin } from 'antd';
import { debounce, throttle } from 'lodash-es';
import { useLayoutEffect, useState, useMemo, useEffect, useRef } from 'react';

import styles from './index.module.less';
import {
  getProcessBasicSchema,
  getProcessMainProductSchema,
  getProcessOtherProductSchema,
} from './schema';
import { getProcessVisualizationDetailData } from './service';

import '../index.less';
import {
  ALL_EMISSION_LABEL,
  EMISSION_TYPE_OPTIONS,
  FOOTPRINT3_TOOLTIP_DETAIL,
} from '@src/views/carbonFootprint3/constant';

import CommonTitleTooltip from '../../CommonTitleTooltip';
import { CustomInput } from '../../formily/input';
import { postAutoMatchFactor } from '../EmissionDrawer/service';

import { CaretRightOutlined } from '@ant-design/icons';
import { GetLocalStorageProductId } from '@src/utils/store';
import { useUnmount } from 'ahooks';

const { Panel } = Collapse;
const { DESCRIBE, PRODUCT } = PROCESS_VISUALIZATION_RADIO;
const { MAIN, RECYCLED } = PROCESS_PRODUCT_TYPE;
const { FACTOR, FACTOR_CREATE } = MATCH_WAY;

type ProcessDrawerProps = {
  visible: boolean;
  isOnlyDetail?: boolean;
  rootProcessId?: string;
  readPretty?: boolean;
  copyStatus?: boolean;
  // processId?: number;
  loading?: boolean;
  initialValues?: Record<string, any>;
  parentProcess?: Record<string, any>;
  // 直接获取父级名称
  parentProcessNodeInfoName?: string;
  onOk?: (values: Record<string, any>) => void;
  onCancel: () => void;
  isProcessAccountRoot?: boolean;
  isProcessLibRoot?: boolean;
  isProcess?: boolean;
  apiExtraParams?: ApiExtraParams;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 */
  factorPrefId?: number | string;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Radio,
    Cascader,
    FormilyButtonSelect,
    FormilyFileUpload,
    DatePicker,
    CustomInput,
    FormilyFactor,
  },
});

const ProcessDrawer = ({
  visible,
  isOnlyDetail,
  initialValues,
  copyStatus,
  rootProcessId,
  readPretty,
  loading,
  parentProcess,
  onOk,
  onCancel,
  parentProcessNodeInfoName,
  isProcessAccountRoot,
  isProcessLibRoot,
  isProcess,
  apiExtraParams,
  enableFactorSourceRange,
  factorPrefId,
}: ProcessDrawerProps) => {
  /** 分享页面 */
  const isShare = [
    API_EXTRA_PARAMS_SNAPFLAG.SHARE,
    API_EXTRA_PARAMS_SNAPFLAG.SAASSHARE,
  ].includes(apiExtraParams?.snapFlag);

  const parentNodeName = parentProcessNodeInfoName || parentProcess?.name;

  // 记录所有其他产出物中的产出物名称
  const formNameUseRef = useRef<Record<string, string>>({});

  // 是否是根节点
  const isProcessAccountRootTitle = isProcessAccountRoot
    ? I18N.carbonFootprint3.product
    : I18N.carbonFootprint3.output2;

  const [radioValue, setRadioValue] = useState<number>(DESCRIBE);

  const isRoot = isProcessAccountRoot;

  const [showModalProcess, setShowModalProcess] = useState(false);

  const [otherProductArr, setOtherProductArr] = useState<number[]>([]);

  const formDescribe = useMemo(
    () =>
      createForm({
        readPretty: !!readPretty || isOnlyDetail,
      }),
    [visible, readPretty],
  );
  const formProduct = useMemo(
    () =>
      createForm({
        readPretty: isOnlyDetail || !!readPretty,
      }),
    [visible, readPretty],
  );

  /** 主产品 */
  const [mainProduct, setMainProduct] = useState<ProcessApiProduct>();

  /** 选择过程 - 返回值 */
  const [selectFactorProcessInData, setSelectFactorProcessInData] =
    useState<Record<string, any>>();

  const [, setProductTabDisabled] = useState(true);

  /** 根据名称自动匹配因子loading */
  const [autoMatchFactorLoading, setAutoMatchFactorLoading] = useState(false);

  /** 被激活的展开面板 */
  const [collapseKeys, setCollapseKeys] = useState<number[]>([999]);

  const [processIdDetail, setProcessIdDetail] = useState<number>();

  const [processInIdDetail, setProcessInIdDetail] = useState<number>();

  /** 选择过程库列表值 */
  const [, setSelectProcessInfo] = useState<ProcessProduct>();

  const [mainLoading, setMainLoading] = useState(false);

  const changeCollapse = (key: number[]) => {
    setCollapseKeys(key);
  };

  /**
   * @description: 添加产品
   */
  const addOtherProductFun = () => {
    const backArr = [...otherProductArr];
    const lastIndex =
      otherProductArr.length > 0 ? otherProductArr.length - 1 : 0;
    if (otherProductArr.length === 0) {
      backArr.push(1001);
      setCollapseKeys([...collapseKeys, 1001]);
    } else {
      const key = otherProductArr[lastIndex] + 1;
      backArr.push(key);
      setCollapseKeys([...collapseKeys, key]);
    }

    setOtherProductArr(backArr);
  };

  /**
   * @description: 删除产品
   * @param {number} data 要被删除的code
   */
  const removeOtherProduct = (data: number) => {
    const formOtherKey = `otherProduct${data}`;

    formProduct.clearFormGraph(`* (${formOtherKey},${formOtherKey}.*)`);

    const newArr = otherProductArr.filter(code => code !== data);
    setOtherProductArr(newArr);
  };

  const subOtherProductData = (data: Record<string, any>, key: string) => {
    const {
      name,
      shareRate,
      amount,
      files,
      factorObj,
      processProduct,
      unitCode,
    } = data;

    const formValues = formProduct.getValuesIn(key);

    let rate: number | string | undefined;

    if (factorObj) {
      // 选择因子or新建因子
      rate = ((factorObj as unknown as { rate: string }) || {}).rate;

      // 新建因子没有unit  所以要单独处理unit
      if (formValues.matchWay === 2) {
        Object.assign(factorObj || {}, {
          ...factorObj,
          numeratorUnit: undefined,
          denominatorUnit: undefined,
          rate: undefined,
        });
      }
    }

    if (processProduct) {
      // 选择过程库产品
      rate = ((processProduct as unknown as { rate: string }) || {}).rate;
      Object.assign(processProduct || {}, {
        ...processProduct,
        unitCode: (processProduct.unitCode as unknown as string[])?.[1],
        rate: undefined,
      });
    }

    const productData = {
      ...formValues,
      name,
      shareRate,
      amount,
      unitCode: (unitCode as unknown as string[])[1],
      unitName: (
        formProduct.getFieldState([key, 'unitCode']).inputValues as {
          label: string;
        }[][]
      )?.[1]?.[1]?.label,
      rate,
      factorObj,
      processProduct,
      files,
    };

    return productData;
  };

  const subProductData = async () => {
    const data = await formProduct.submit<Record<string, any>>();
    const { name, shareRate, amount, files, unitCode, useAmount } = data;
    // 拼接完整的其他产品key, 用于下面判断使用
    const getOtehrProductKey = otherProductArr.map(key => `otherProduct${key}`);

    const dataKeys = Object.keys(data);

    // 主材料
    const productArr = [
      {
        ...mainProduct,
        name,
        shareRate,
        amount,
        useAmount,
        files,
        type: MAIN,
        unitCode: (unitCode as unknown as string[])[1],
        unitName:
          (
            formProduct.getFieldState('unitCode').inputValues as {
              label: string;
            }[][]
          )?.[1]?.[1]?.label ||
          formProduct.getFieldState('unitCode')?.data?.label,
      },
    ];

    // 过滤出副材料
    dataKeys.forEach(key => {
      if (getOtehrProductKey.includes(key)) {
        productArr.push(subOtherProductData(data[key], key));
      }
    });

    return productArr;
  };

  const subDescribeDataAndProcessIn = async () => {
    const data = await formDescribe.submit<Record<string, any>>();
    const { typeExtra } = data;

    const describeData = {
      ...data,
    };

    if (typeExtra) {
      // 输入类型为运输
      const typeExtra = data.typeExtra as {
        name: string | undefined;
        weightUnitCode: string | undefined;
      } & ProcessLibIn['typeExtra'];

      data.name = typeExtra.name || '';

      typeExtra.name = undefined;

      if (typeExtra.unitCode) {
        typeExtra.unitCode = (typeExtra.unitCode as unknown as string[])?.[1];
        typeExtra.unitName = (
          formDescribe.getFieldState('typeExtra.unitCode').inputValues as {
            label: string;
          }[][]
        )?.[1]?.[1]?.label;
      }

      if (typeExtra.weightUnitCode) {
        typeExtra.unitCode = typeExtra.weightUnitCode;
        typeExtra.unitName = typeExtra.weightUnitCode;
        typeExtra.weightUnitCode = undefined;
      }
    }

    if (selectFactorProcessInData) {
      data.matchWay = 3;
    } else {
      data.matchWay = 4;
    }

    return {
      describeData,
      processIn: {
        matchWay: data.matchWay,
      },
    };
  };

  /**
   * @description: 校验两个表单
   */
  const verifyAllForm = async () => {
    try {
      await formDescribe.validate();
    } catch (e) {
      if (radioValue === PRODUCT) {
        setRadioValue(DESCRIBE);
      }

      throw e;
    }

    try {
      await formProduct.validate();
    } catch (e) {
      if (radioValue === DESCRIBE) {
        setRadioValue(PRODUCT);
      }

      throw e;
    }
  };

  /**
   * @description: 设置过程描述的参数
   * @param {ProcessDetailVisualization} data
   */
  const setDescribeFormeValue = (data: ProcessDetailVisualization) => {
    formDescribe.setValues(data);
  };

  /**
   * @description: 设置主产品的form表单值
   * @param {ProcessApiProduct} data 接口返回的值
   */
  const setMainProductFormValues = (data: ProcessApiProduct) => {
    const { name, shareRate, amount, files, unitName, useAmount, unitCode } =
      data;
    formProduct.setValues({
      name,
      shareRate,
      amount,
      files,
      useAmount,
    });

    formProduct.setFieldState('unitCode', {
      data: {
        label: unitName,
        value: unitCode,
      },
    });
  };

  /**
   * @description: 设置副产品的form表单值
   * @param {ProcessApiProduct} data 接口返回的值
   * @param {number} arrIndex 其他产品自动生成的标识
   */
  const setOtherProductFormValues = (
    data: ProcessApiProduct,
    arrIndex: number,
  ) => {
    const formOtherKey = `otherProduct${arrIndex}`;

    const {
      id,
      name,
      matchWay,
      amount,
      unitCode,
      type,
      rate,
      factorObj,
      processProduct,
      files,
      shareRate,
      useAmount,
    } = data;

    formProduct.setValues({
      [formOtherKey]: {
        id,
        name,
        amount,
        type,
        files,
        shareRate,
        useAmount,
      },
    });

    formProduct.setFieldState([formOtherKey, 'unitCode'], {
      data: {
        value: unitCode,
      },
    });

    if (type === PROCESS_PRODUCT_TYPE.RECYCLED) {
      // 编辑产品类型初始为回用产品时，则产品类型不能变更
      formProduct.setFieldState([formOtherKey, 'type'], { readPretty: true });

      if (factorObj) {
        formProduct.setValues({
          [formOtherKey]: {
            matchWay,
            factorObj: {
              id: factorObj.id,
              name: factorObj.name,
              factor: factorObj.factor,
              numeratorUnit: (factorObj.unit || '').split('/')[0] || undefined,
              denominatorUnit:
                (factorObj.unit || '').split('/')[1] || undefined,
              rate,
              institution: factorObj.institution,
              year: factorObj.year,
              unit: factorObj.unit,
              factorPattern: factorObj.factorPattern,
              ecoinventValueVisible: factorObj.ecoinventValueVisible,
              matchWay,
            },
          },
        });
      }

      if (processProduct) {
        formProduct.setValues({
          [formOtherKey]: {
            matchWay,
            processProduct: {
              id: processProduct.id,
              processId: processProduct.processId,
              type: processProduct.type,
              processName: processProduct.processName,
              productName: processProduct.productName,
              rate,
              accountYear: processProduct.accountYear,
              unitName: processProduct.unitName,
            },
          },
        });

        formProduct.setFieldState(
          [formOtherKey, 'processProduct', 'unitCode'],
          {
            data: {
              value: processProduct.unitCode,
            },
          },
        );
      }
    } else {
      // 编辑产品类型初始为主，复产品时，则产品类型不显示回用产品选项
      formProduct.setFieldState([formOtherKey, 'type'], {
        readPretty: true,
      });
    }
  };

  /**
   * @description: 选择过程库
   * @param {ProcessProduct} product 选中的过程
   */
  const selectFactorProcess = throttle(
    async (product: ProcessProduct) => {
      setShowModalProcess(false);
      setMainLoading(true);
      const { id } = product;
      setSelectProcessInfo(product);
      const back = await getProcessVisualizationDetailData({
        processId: id,
      });

      const { process, processProducts } = back.data.data;
      setSelectFactorProcessInData(back.data.data);
      // 选择完过程需要先清空之前的其他产品
      otherProductArr.forEach(ar => {
        const formOtherKey = `otherProduct${ar}`;

        formProduct.clearFormGraph(FormPath.parse(`${formOtherKey}.*`));
      });
      setOtherProductArr([]);

      processProducts.forEach(async (processProduct, productIndex) => {
        if (processProduct.type === MAIN) {
          setMainProduct(processProduct);
          await setMainProductFormValues(processProduct);
        } else {
          setOtherProductArr(val => {
            setOtherProductFormValues(processProduct, productIndex);
            return [...val, productIndex];
          });
        }
      });

      setMainLoading(false);

      await setDescribeFormeValue({ ...process, type: null });

      // 选择完过程后 允许自行切换产出物信息
      setProductTabDisabled(false);

      // 选择完过程库后需要将该字段设置为1 传递给后端
      formDescribe.setValues({
        reSelect: 1,
      });

      setTimeout(() => {
        formDescribe.validate();
        formProduct.validate();
      }, 200);

      // 选择完过程后，产品信息不允许编辑
      // 3.3.2版本允许产品进行编辑
      // formProduct.setFormState({
      //   readPretty: true,
      // });
    },
    1000,
    {
      leading: true,
      trailing: false,
    },
  );

  const debounceClick = async () => {
    await verifyAllForm();
    const productArr = await subProductData();
    const { describeData, processIn } = await subDescribeDataAndProcessIn();
    const reSelect = formDescribe.getValuesIn('reSelect');

    if (onOk) {
      onOk({
        reSelect: reSelect || 0,
        processIn: {
          ...processIn,
          id: processInIdDetail,
        },
        process: {
          ...describeData,
          id: describeData.id || processIdDetail,
        },
        processProducts: productArr,
      });
    }
  };

  const onSubmit = debounce(debounceClick, 500);

  /**
   * @description: 初始化 - 过程描述 - 基本信息和数据代表性
   * @param {ProcessDetailVisualization} process
   * @return {*}
   */
  const initEditProcess = (
    process: ProcessDetailVisualization,
    processIn: Partial<ProcessLibIn>,
  ) => {
    const {
      id: processId,
      productErea,
      name: processName,
      boundary,
      accountYear,
      processEquipment,
      productScale,
      mainMaterial,
      mainEnergy,
    } = process;
    setProcessIdDetail(processId);

    const copyProcessName = copyStatus
      ? I18N.template(I18N.carbonFootprint3.proce, { val1: processName })
      : processName;

    if (processIn) {
      const {
        name,
        type,
        amount,
        unitCode,
        id: processInId,
        typeExtra,
      } = processIn;

      setProcessInIdDetail(processInId);

      if (type !== EMISSION_TYPE_OPTIONS.TRANS) {
        formDescribe.setValues({
          amount,
        });
      } else {
        const {
          way,
          amount: typeExtraAmount,
          distance,
          unitCode: typeExtraUnitCode,
        } = typeExtra || {};

        const typeExtraObj = {
          name,
          way,
          amount,
          weightUnitCode: '',
          distance,
        };

        if (typeExtraAmount !== undefined) {
          typeExtraObj.amount = typeExtraAmount;
        }

        if (way === CALC_WAY.PRODUCT_WEIGHT) {
          typeExtraObj.weightUnitCode = typeExtraUnitCode || '';
        }

        if (distance !== undefined) {
          typeExtraObj.distance = distance;
        }

        if (way === CALC_WAY.ENERGY_CONSUMPTION) {
          formDescribe.setFieldState('typeExtra.unitCode', {
            data: {
              value: typeExtraUnitCode,
            },
          });
        }

        formDescribe.setValues({
          typeExtra: typeExtraObj,
        });
      }

      formDescribe.setValues({
        type,
        name: copyProcessName,
        amount,
        productErea,
        boundary,
        accountYear,
        processEquipment,
        productScale,
        mainMaterial,
        mainEnergy,
      });

      formDescribe.setFieldState('unitCode', {
        data: {
          value: unitCode,
        },
      });
    } else {
      formDescribe.setValues({
        productErea,
        name: copyProcessName,
        boundary,
        accountYear,
        processEquipment,
        productScale,
        mainMaterial,
        mainEnergy,
      });
    }
  };

  /**
   * @description: 编辑初始化 - 产品信息
   * @param {ProcessApiProduct} processProducts
   */
  const initEditProcessProduct = (processProducts: ProcessApiProduct[]) => {
    const arrNumber: number[] = [];
    processProducts.forEach((product, productIndex) => {
      const { type } = product;
      if (type === MAIN) {
        setMainProduct(product);
        setMainProductFormValues(product);
      } else {
        setOtherProductFormValues(product, productIndex);
        arrNumber.push(productIndex);
        // setOtherProductArr(val => {
        //   if (val.length === 0) {
        //     setOtherProductFormValues(product, 0);

        //     return [0];
        //   }
        //   setOtherProductFormValues(product, val.length);

        //   return [...val, val.length];
        // });
      }
    });
    setOtherProductArr(arrNumber);
  };

  /**
   * 基本信息 名称输入框输入后动态获取因子信息
   * @param newName 名称
   */
  const onBasicNameChange = async (newName: string, parentKey: string) => {
    // 只有回用产出物才会 自动匹配排放因子
    const formProductParentTypeValue = formProduct.getValuesIn(
      `${parentKey}.type`,
    );

    // 不等于回用产品都将返回
    if (formProductParentTypeValue !== RECYCLED) return;

    // 没有更改表单直接返回
    if (!formProduct.modified) return;

    // 如果因子为手动填写也返回 - 手动填写的因子更改名称不自动匹配因子
    if (
      formProduct.getValuesIn(`${parentKey}.factorObj.matchWay`) ===
      FACTOR_CREATE
    )
      return;

    // 名称相同不触发
    if (formNameUseRef.current[parentKey] === newName) return;

    formNameUseRef.current[parentKey] = newName;

    const formType = formProduct.getValuesIn(`${parentKey}.type`);
    const fieldPath = `${parentKey}.factorObj`;
    try {
      // 只有排放源名称更改后才会自动匹配 不论是否已经存在因子 - 3.5.5测试用例评审更改需求 10-08
      setAutoMatchFactorLoading(true);
      const { data } = await postAutoMatchFactor({
        name: newName,
        factorType: '3',
        productId: GetLocalStorageProductId(),
        emissionType: formType ? ALL_EMISSION_LABEL()[formType] : undefined,
      });
      if (data.data) {
        const [numeratorUnit, denominatorUnit] = (data.data.unit || '').split(
          '/',
        );

        const formFactorObjValue = formProduct.getValuesIn(fieldPath);
        formProduct.setValuesIn(fieldPath, {
          ...formFactorObjValue,
          ...data.data,
          numeratorUnit,
          denominatorUnit,
          matchWay: FACTOR,
        });

        formProduct.setValuesIn(`${parentKey}.matchWay`, FACTOR);
      } else {
        formProduct.setValuesIn(fieldPath, undefined);
      }
    } catch (e) {
      formProduct.setValuesIn(fieldPath, undefined);
    } finally {
      setAutoMatchFactorLoading(false);
    }
  };

  useLayoutEffect(() => {
    if (!radioValue) {
      setRadioValue(DESCRIBE);
    }
  }, [parentProcess, parentProcessNodeInfoName]);

  useEffect(() => {
    setRadioValue(DESCRIBE);
    setProductTabDisabled(!initialValues);

    if (initialValues) {
      const { process, processIn, processProducts } = initialValues;
      initEditProcess(process, processIn);
      initEditProcessProduct(processProducts);
    }
  }, [initialValues, visible]);

  useEffect(() => {
    formProduct.setFieldState('superiorAmountAndUnit', {
      visible: !!parentNodeName,
      title: (
        <CommonTitleTooltip
          title={I18N.template(I18N.carbonFootprint3.paren2, {
            val1: parentNodeName,
          })}
          tooltip={FOOTPRINT3_TOOLTIP_DETAIL.USEAMOUNT}
        />
      ),
    });
    formProduct.setFieldState('noData', {
      visible: !parentNodeName,
    });
  }, [parentProcess, parentProcessNodeInfoName]);

  /** 动态添加其他产出物的上级名称 */
  useEffect(() => {
    if (otherProductArr) {
      otherProductArr.forEach(arr => {
        const formOtherKey = `otherProduct${arr}`;
        const getType = formProduct.getValuesIn(`${formOtherKey}.type`);

        if (
          getType !== PROCESS_PRODUCT_TYPE.RECYCLED &&
          parentNodeName !== 'undefined'
        ) {
          formProduct.setFieldState(
            [`${formOtherKey}`, 'superiorAmountAndUnit'],
            {
              visible: !!parentNodeName,
              title: (
                <CommonTitleTooltip
                  title={I18N.template(I18N.carbonFootprint3.paren2, {
                    val1: parentNodeName,
                  })}
                  tooltip={FOOTPRINT3_TOOLTIP_DETAIL.USEAMOUNT}
                />
              ),
            },
          );
        }

        if (parentNodeName) {
          formProduct.setValuesIn(
            [`${formOtherKey}`, 'parentNodeName'],
            parentNodeName,
          );
        }
      });
    }
  }, [otherProductArr, parentProcess, parentProcessNodeInfoName]);

  useUnmount(() => {
    formNameUseRef.current = {};
  });

  return (
    <Drawer
      maskClosable
      open={visible}
      rootClassName='processAccessoryDrawer'
      destroyOnClose
      title={(() => {
        if (copyStatus) {
          return I18N.carbonFootprint3.copyProcess;
        }
        if (isOnlyDetail || readPretty) {
          return I18N.carbonFootprint3.processDetails;
        }
        if (initialValues) {
          return I18N.carbonFootprint3.editingProcess;
        }
        return I18N.carbonFootprint3.newAdditionProcess;
      })()}
      width={700}
      closable={false}
      placement='right'
      bodyStyle={{
        padding: 0,
      }}
      footerStyle={{
        boxShadow: '0 -4px 8px 0 rgba(0,0,0,0.04)',
        height: 52,
      }}
      footer={
        <ProcessVisualizationFooterDrawer
          loading={mainLoading || !!loading}
          isOnlyDetail={isOnlyDetail}
          onCancelClick={onCancel}
          onSubClick={async () => {
            await onSubmit();
          }}
          okText={I18N.carbonFootprint.preserve}
        />
      }
      onClose={onCancel}
    >
      <div className={styles.processVisualizationDrawer}>
        <Spin spinning={mainLoading || !!loading}>
          <div className={styles.paddingMain}>
            <div className={styles.basicInfoMain}>
              <FormilyCommon form={formDescribe}>
                <>
                  <div className={`${styles.titleStyle} m-b-16`}>
                    <div>{I18N.carbonFootprint.basicInformation}</div>
                    {!isRoot && !readPretty && !isOnlyDetail && (
                      <div>
                        <Button
                          type='primary'
                          onClick={async () => {
                            setShowModalProcess(true);
                          }}
                        >
                          {I18N.carbonFootprint3.selectionProcess}
                        </Button>
                      </div>
                    )}
                  </div>
                  <SchemaField
                    schema={getProcessBasicSchema(
                      isProcessAccountRoot,
                      isOnlyDetail,
                    )}
                  />
                </>
              </FormilyCommon>
            </div>

            <div className={styles.formProductMain}>
              <div className={styles.titleProductStyle}>
                {isProcessAccountRootTitle}
                {I18N.carbonFootprint3.information}
              </div>
              <FormilyCommon form={formProduct}>
                <div className={styles.CollapseMain}>
                  <Collapse
                    activeKey={collapseKeys}
                    onChange={key => {
                      const backKey: number[] = (key as string[]).map(b =>
                        Number(b),
                      );
                      changeCollapse(backKey);
                    }}
                    // eslint-disable-next-line react/no-unstable-nested-components
                    expandIcon={({ isActive }) => (
                      <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    )}
                    ghost
                  >
                    <Panel
                      forceRender
                      header={I18N.template(I18N.carbonFootprint3.mainIsPr, {
                        val1: isProcessAccountRootTitle,
                      })}
                      key={999}
                    >
                      <SchemaField
                        schema={getProcessMainProductSchema(
                          isProcessAccountRoot,
                          isProcessLibRoot,
                          isProcess,
                          isOnlyDetail,
                        )}
                        scope={{
                          useFieldUnitDictSource,
                          useFieldSetValueByLabel,
                        }}
                      />
                    </Panel>
                    {otherProductArr.map(data => (
                      <Panel
                        forceRender
                        header={
                          <>
                            <span>
                              {I18N.carbonFootprint3.other}
                              {isProcessAccountRootTitle}
                            </span>
                            {!isOnlyDetail && (
                              <IconFont
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  fontSize: 16,
                                  cursor: 'pointer',
                                }}
                                type='icon-icon-shanshu-2'
                                onClick={() => removeOtherProduct(data)}
                              />
                            )}
                          </>
                        }
                        key={data}
                      >
                        <Spin spinning={autoMatchFactorLoading}>
                          <SchemaField
                            schema={getProcessOtherProductSchema(
                              data,
                              onBasicNameChange,
                              {
                                isProcessAccountRoot,
                                isProcessLibRoot,
                                isProcess,
                                isOnlyDetail,
                                enableFactorSourceRange:
                                  enableFactorSourceRange &&
                                  !isOnlyDetail &&
                                  !readPretty,
                                factorPrefId,
                              },
                            )}
                            scope={{
                              useFieldUnitDictSource,
                              useFieldSetValueByLabel,
                            }}
                          />
                        </Spin>
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              </FormilyCommon>

              {!isOnlyDetail && (
                <div className={styles.addProductMain}>
                  <IconFont type='icon-icon_add_fill2' />

                  <span
                    onClick={addOtherProductFun}
                    className={styles.addProductText}
                  >
                    {I18N.carbonFootprint.add}
                    {isProcessAccountRootTitle}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Spin>
        {!isShare && (
          <Modal
            title={I18N.carbonFootprint3.selectionProcess}
            width={1200}
            maskClosable={false}
            open={showModalProcess}
            footer={null}
            style={{
              top: 50,
            }}
            bodyStyle={{
              paddingTop: 0,
              paddingBottom: 0,
            }}
            onCancel={() => setShowModalProcess(false)}
          >
            <ModalProcessLib
              isProcess
              // @ts-ignore
              processLibId={rootProcessId ? Number(rootProcessId) : undefined}
              onCancel={() => {
                setShowModalProcess(false);
              }}
              processProductParams={{
                productName: formDescribe.values?.name,
              }}
              onConfirm={selectFactorProcess}
            />
          </Modal>
        )}
      </div>
    </Drawer>
  );
};

export default ProcessDrawer;
