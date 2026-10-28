/**
 * 因子抽屉中的因子卡片
 */
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  DataField,
  Field,
  Form,
  ObjectField,
  onFieldValueChange,
} from '@formily/core';
import { connect, mapProps, useField, useForm } from '@formily/react';
import emptySvg from '@src/assets/icon/empty.svg';
import SearchFactorDetail from '@src/components/SearchFactor/FactorDetail';
import SearchModalFactor from '@src/components/SearchFactor/ModalFactor';
import { IconAlibaba } from '@src/components/iconfont';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { getFullNum } from '@src/views/carbonFootprint/utils';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_MATCH_WAY_ICON,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { QuickBusinessAccountingSource } from '@src/views/carbonFootprint3/QuickBusinessAccounting/type';
import { getFactorUnitRate } from '@src/views/carbonFootprint3/component/AccessoryDrawer/service';
import FactorEvaluationCard from '@src/views/carbonFootprint3/component/FactorEvaluationCard';
import { ECOINVENT_TEXT } from '@src/views/carbonFootprint3/constant';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { RegFActorObjRate } from '@src/views/carbonFootprint3/util';
// import { changeDicts2Options } from '@src/views/utils';
import { Button, InputNumber, Modal, Spin, Tooltip } from 'antd';
import axios, { CancelToken } from 'axios';
import classNames from 'classnames';
import { isArray, isEmpty, isString } from 'lodash-es';
import {
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { FactorWriteModal } from './Modal';
import { FactorObjType } from './Modal/type';
import {
  CustomFactorReuseContext,
  CustomFactorReuseExcludedContext,
  ShowFactorTypeContext,
} from './context';
import CustomFactorAction from './components/CustomFactorAction';
import { savedFactorService } from './customFactorReuse/service';
import { toFactorValue } from './customFactorReuse/toFactorValue';
import { getSavedFactorTarget } from './customFactorReuse/target';
import styles from './index.module.less';
import { FormilyFactorFormValue } from './type';

type FormilyFactorProps = {
  value?: FactorObjType;
  readPretty?: boolean;
  AdditionalParams?: object;
  onlyCreateFactor?: boolean;
  sourceType?: string;
  canAutoMatch?: boolean;
  autoMatch?: () => void;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 id */
  factorPrefId?: number | string;
  /** 是否展示因子选用评价卡片（是否请求 aiFactorEvaluate 与之一致），由上层组合好再传入 */
  showFactorEvaluationCard?: boolean;
  /** 由字段接线限定复用范围，不影响原有手填操作。 */
  allowCustomFactorReuse?: boolean;
  /** 因子卡片标题行的业务操作。 */
  headerExtra?: ReactNode;
};

const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;
const { FACTOR, FACTOR_CREATE } = MODEL_EMISSION_MATCH_WAY;

const FormilyFactor = (props: FormilyFactorProps) => {
  const {
    value,
    readPretty,
    AdditionalParams,
    onlyCreateFactor,
    sourceType,
    canAutoMatch,
    autoMatch,
    enableFactorSourceRange,
    factorPrefId,
    showFactorEvaluationCard = false,
    allowCustomFactorReuse = false,
    headerExtra,
  } = props;

  // 记录 输入名称自动匹配的单位名称
  const matchFactorObjId = useRef('');

  const form = useForm<FormilyFactorFormValue>();
  const field = useField<ObjectField>();
  const cancelTokenSource = useRef<any[]>([]);

  // 多个factorObj根据父级路径生成唯一， 防止重复生成多次调用
  const effectId =
    field.parent && field.parent.path
      ? `${field.parent.path}__FormilyFactor__`
      : '__FormilyFactor__';

  /** 用于自动匹配单位换算比例的路径 */
  const factorObjUnitStringFieldPath =
    field.parent && field.parent.address
      ? `${field.parent.address}.factorObjUnitString`
      : 'factorObjUnitString';

  // 设置选择因子时候写入的名称
  const fieldFactorMatchWay =
    field.parent && field.parent.path
      ? `${field.parent.path}.matchWay`
      : 'matchWay';

  const showFactorType = useContext(ShowFactorTypeContext);
  const customFactorReuse = useContext(CustomFactorReuseContext);
  const customFactorReuseExcluded = useContext(
    CustomFactorReuseExcludedContext,
  );
  const factorMatchWay = Number(
    value?.matchWay ?? form.getValuesIn(fieldFactorMatchWay),
  );
  const factorTypeText =
    factorMatchWay === FACTOR
      ? I18N.emission.systemFactor
      : factorMatchWay === FACTOR_CREATE
      ? I18N.emission.selfBuiltFactor
      : '-';

  // 设置选择因子时候写入的名称
  const fieldFactorName =
    field.parent && field.parent.path ? `${field.parent.path}.name` : 'name';

  /** 是否 只允许新建因子 */
  const [isFactorCreate, setIsFactorCreate] = useState<boolean>(false);

  const canSelectFactor = !isFactorCreate && !onlyCreateFactor;

  /** 是否显示因子详情弹框 */
  const [showFactorDetail, setShowFactorDetail] = useState<boolean>(false);

  /** 手动填写因子 - 编辑因子如果有值就设置默认值 */
  const [editFactorModalValues, setEditFactorModalValues] =
    useState<FactorObjType>();

  /** 手动填写因子弹框 - 只读 */
  const [factorModalRead, setFactorModalRead] = useState(false);

  /** 校验单位换算比例的文案展示 */
  const [regFactorRateText, setRegFactorRateText] = useState('');

  /** 手动填写弹框 */
  const [factorModal, setFactorModal] = useState(false);

  /** 选择因子弹框 */
  const [factorModalVisible, setFactorModalVisible] = useState(false);

  /**
   * 根据单位code 获取单位的label
   * @param code 单位code
   * @returns 单位的label
   */
  const getFactorInfoByCode = (code: string) => {
    const localDict = localStorage.getItem('FactorUnitDict');
    const localDictPar: Dicts[] = localDict ? JSON.parse(localDict) : undefined;
    const dicInfo = localDictPar.find(dic => dic.dictValue === code);

    const factorUnit = dicInfo?.dictLabel;
    return factorUnit || '';
  };

  /**
   * 根据单位label 获取单位的[code,code]
   * @param label 单位label
   * @returns 单位的[x,x]
   */
  // const getFactorInfoByLabel = (label?: string) => {
  //   const localDict = localStorage.getItem('FactorUnitDict');
  //   const localDictOptions = localStorage.getItem('FactorUnitOptionsDict');

  //   const localDictPar: Dicts[] = localDict ? JSON.parse(localDict) : undefined;
  //   const unitDictOptions: Dicts[] = localDictOptions
  //     ? JSON.parse(localDictOptions)
  //     : undefined;

  //   const unitOptions: Dicts[] =
  //     unitDictOptions ||
  //     uniqBy(
  //       localDictPar.map(u => ({
  //         ...u,
  //         label: u.sourceName,
  //         value: u.sourceType,
  //         sourceType: u.sourceType,
  //         children: changeDicts2Options(
  //           localDictPar.filter(d => d.sourceType === u.sourceType),
  //         ) as Dicts[] | undefined,
  //       })),
  //       'value',
  //     );

  //   if (unitOptions?.length > 0 && label) {
  //     // eslint-disable-next-line no-restricted-syntax
  //     for (const dict of unitOptions) {
  //       // eslint-disable-next-line no-restricted-syntax
  //       for (const childDict of dict.children || []) {
  //         if (childDict.dictLabel === label) {
  //           return [dict.value, childDict.value];
  //         }
  //       }
  //     }
  //   }
  //   return [];
  // };

  /**
   * 手动填写按钮点击
   */
  const onClickFactorModalBtn = () => {
    const fieldPath = field.path;
    const formFactorObjValue = form.getValuesIn(fieldPath);
    if (!isEmpty(formFactorObjValue)) {
      setEditFactorModalValues(formFactorObjValue);
    }
    // 是否只读
    setFactorModalRead(false);
    setFactorModal(true);
  };

  /** 选择因子按钮 */
  const onClickSelectFactorBtn = async () => {
    setFactorModalVisible(true);
  };

  /**
   * 关闭手动填写弹框
   */
  const onCancelFactorModal = () => {
    setFactorModal(false);
  };

  /**
   * 通过接口获取单位换算比例
   * @param unitName 分子
   * @param factorUnitName 分母
   * @returns 比例
   */
  const unitRate = async (
    unitName: string,
    factorUnitName: string,
    name?: string,
    cancelToken?: CancelToken,
  ) => {
    const {
      data: { data },
    } = await getFactorUnitRate(
      {
        unitName,
        factorUnit: `/${factorUnitName}`,
        name: encodeURIComponent(name || ''),
      },
      cancelToken,
    );

    return data;
  };

  /**
   * 校验单位换算比例的数值
   * @param value 单位换算比例
   */
  const regFactorRate = (value: number | string) => {
    const regValue = RegFActorObjRate(String(value));
    setRegFactorRateText(regValue);
    return regValue;
  };

  /**
   * 手动设置单位换算比例
   * @param value
   */
  const rateValueChange = (value?: string) => {
    // if (value) {
    //   const regText = regFactorRate(value);
    //   if (regText) return;
    // }
    if (value) {
      regFactorRate(value);
    }

    const fieldPath = field.path;
    const formFactorObjValue = form.getValuesIn(fieldPath);
    if (formFactorObjValue) {
      form.setValuesIn(fieldPath, {
        ...formFactorObjValue,
        rate: value,
      });
    }
  };

  /**
   * 主动匹配单位换算比例
   * @param newForm 最新的form
   */
  const autoRate = (newForm: Form, newField: DataField) => {
    const fieldPath = field.path;

    const factorObjField = newField?.query?.('.factorObj')?.take() as Field;
    let unitString = '';
    // 单位是数组 - 需要转换成string
    if (isArray(newField.value)) {
      unitString = getFactorInfoByCode(`${newField.value[1]}`);
    } else if (newField.value && isString(newField.value)) {
      unitString = newField.value;
    }

    const denominatorUnitVal = newForm.getValuesIn(
      `${fieldPath}.denominatorUnit`,
    );

    // 计算单位换算比例
    if (
      newForm.modified &&
      denominatorUnitVal &&
      unitString &&
      unitString !== '-'
    ) {
      const token = axios.CancelToken.source();
      cancelTokenSource.current.forEach(item => item?.cancel());
      cancelTokenSource.current = [];
      cancelTokenSource.current.push(token);
      unitRate(
        unitString,
        denominatorUnitVal || '',
        newForm.getValuesIn('name'),
        token.token,
      ).then(rateValue => {
        const formFactorObjValue = newForm.getValuesIn(fieldPath);
        if (formFactorObjValue) {
          form.setValuesIn(fieldPath, {
            ...formFactorObjValue,
            rate: rateValue,
            unitString,
          });
          setTimeout(() => {
            factorObjField?.validate();
            field?.query?.('factorObj')?.take()?.validate();
            field?.query?.('.factorObj')?.take()?.validate();
          }, 32);
        }
      });
    } else {
      // 需要设置同步unitString
      setTimeout(() => {
        const formFactorObjValue = form.getValuesIn(fieldPath);
        if (formFactorObjValue) {
          form.setValuesIn(fieldPath, {
            ...formFactorObjValue,
            unitString,
          });
          setTimeout(() => {
            factorObjField?.setSelfErrors([]);
            field?.query?.('factorObj')?.take()?.setSelfErrors([]);
            field?.query?.('.factorObj')?.take()?.setSelfErrors([]);
          }, 32);
        }
      }, 0);
    }
  };

  // 主动监听code的改变
  form.addEffects(effectId, newForm => {
    // 单独处理单元过程抽屉  因为存在多个factorObj
    if (field.parent && field.parent.address) {
      const fieldParentPath = field.parent.address;
      onFieldValueChange(`${fieldParentPath}.factorObjUnitString`, newField => {
        autoRate(newForm, newField);
      });
    } else {
      onFieldValueChange(`factorObjUnitString`, newField => {
        autoRate(newForm, newField);
      });
    }
  });

  /**
   * 选择因子和手动填写 主动触发单位换算比例
   */
  const initiativeAutoRate = () => {
    /** 主动触发单位换算比例 */
    const factorObjUnitStringField = form.getFieldState(
      factorObjUnitStringFieldPath,
    );
    if (factorObjUnitStringField) {
      autoRate(form, factorObjUnitStringField as DataField);
    } else {
      const nextFactorObjUnitStringField =
        form.getFieldState(`.factorObjUnitString`);
      autoRate(form, nextFactorObjUnitStringField as DataField);
    }
  };

  /**
   * 提交手动填写因子
   * @param data 输入的内容
   */
  const onSubmit = (data: FactorObjType) => {
    form.modified = true;
    const {
      name,
      factor,
      numeratorUnit,
      denominatorUnit,
      institution,
      year,
      factorPattern,
    } = data;

    // 整理需要的因子参数
    const factorData: FactorObjType = {
      id: undefined,
      name,
      factor,
      factorPattern,
      numeratorUnit,
      denominatorUnit,
      institution,
      year,
      matchWay: FACTOR_CREATE,
    };
    const fieldPath = field.path;
    const formFactorObjValue = form.getValuesIn(fieldPath);
    form.setValuesIn(fieldPath, {
      ...formFactorObjValue,
      ...factorData,
      unit: `${numeratorUnit}/${denominatorUnit}`,
    });

    // 单独处理 单元过程情况
    const matchWayPath =
      field.parent && field.parent.path
        ? `${field.parent.path}.matchWay`
        : 'matchWay';
    form.setValuesIn(matchWayPath, FACTOR_CREATE);

    // 主动触发单位换算比例赋值
    initiativeAutoRate();

    // 手动更改因子后清空之前的因子信息缓存，防止重新选择原本缓存的因子id信息导致单位换算比例不生效
    matchFactorObjId.current = '';

    setFactorModal(false);
  };

  /**
   * 选择因子
   * @param data 选择的因子
   */
  const selectFactor = async (data: Record<string, any>) => {
    const [numeratorUnit, denominatorUnit] = (data.unit || '').split('/');
    const {
      id,
      name,
      factor,
      factorPattern,
      ecoinventValueVisible,
      institution,
      year,
    } = data;
    // 整理需要的因子参数
    const factorData: FactorObjType = {
      id,
      name,
      factorPattern,
      ecoinventValueVisible,
      factor: shouldHideEcoinventValue(data) ? ECOINVENT_TEXT : factor,
      numeratorUnit,
      denominatorUnit,
      institution,
      year,
      matchWay: FACTOR,
    };
    const fieldPath = field.path;
    form.modified = true;
    const formFactorObjValue = form.getValuesIn(fieldPath);
    form.setValuesIn(fieldPath, {
      ...formFactorObjValue,
      ...factorData,
      unit: `${numeratorUnit}/${denominatorUnit}`,
    });

    // 主动触发单位换算比例赋值 - 选择因子不需要触发了，因为下面有因子id不一致会触发
    // 因为编辑的时候下方不会进入，所以要在主动触发时候将进行调用和赋值
    if (!matchFactorObjId.current) {
      initiativeAutoRate();
      matchFactorObjId.current = String(id);
    }

    // 单独处理 单元过程情况matchWay
    const matchWayPath =
      field.parent && field.parent.path
        ? `${field.parent.path}.matchWay`
        : 'matchWay';
    form.setValuesIn(matchWayPath, FACTOR);

    setFactorModalVisible(false);
  };

  const matchCreateFactorText = () => {
    if (!canSelectFactor) {
      return I18N.components.pleaseFillInTheFactor;
    }
    return I18N.components.notMatchedDueTo2;
  };

  /**
   * 组装因子选用评价接口 body。
   * 选择因子时以 id 为触发，手动填写时以 name/institution/year 变化为触发。
   * accountId 读 URL query。
   */
  const evalParams =
    useMemo((): Partial<QuickBusinessAccountingSource> | null => {
      if (!showFactorEvaluationCard) return null;
      // 选择因子：有 id；手动填写：有 name（但无 id）
      if (!value?.id && !value?.name) return null;

      const search =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();
      const urlAccountId = search.get('accountId') ?? undefined;

      // 从 field.path 中提取 array item 路径，如 "accountEmissionTransportList.0"
      // void 字段不参与 form value 取值，需直接用 array item 路径
      const fieldPath = String(field.path ?? '');
      const transportItemMatch = fieldPath.match(
        /^(accountEmissionTransportList\.\d+)/,
      );
      if (transportItemMatch) {
        const transportItemPath = transportItemMatch[1];
        const transportItem = form.getValuesIn(transportItemPath) as
          | Partial<QuickBusinessAccountingSource>
          | undefined;
        return {
          ...(transportItem ?? {}),
          // array item 中不含排放源名称与 accountId，手动补充
          name: form.getValuesIn('name') as string | undefined,
          accountId: urlAccountId,
        };
      }
      return {
        factorObj:
          value as unknown as QuickBusinessAccountingSource['factorObj'],
        name: form.getValuesIn('name') as string | undefined,
        type: form.getValuesIn('type') as number | undefined,
        accountId: urlAccountId,
      };
      // 选择因子时依赖 id；手动填写时依赖 name / institution / year；form/field 省略 deps 避免噪声重算
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      showFactorEvaluationCard,
      value?.id,
      value?.name,
      value?.institution,
      value?.year,
    ]);

  // 设置可能是编辑状态
  useEffect(() => {
    // 初次 设置是否支持新建因子
    if (
      form.getValuesIn(fieldFactorMatchWay) === FACTOR_CREATE &&
      !value?.name
    ) {
      setIsFactorCreate(true);
    } else {
      setIsFactorCreate(false);
    }

    if (!isEmpty(value)) {
      // 主要针对处理 名称再次匹配因子后 不更新单位换算比例逻辑
      if (value?.id && matchFactorObjId.current !== String(value?.id)) {
        // 只有再次匹配才会主动触发单位换算 - 或者存在表单手动更改 但是id不一致也会触发
        if (matchFactorObjId.current || form.modified) {
          initiativeAutoRate();
        }

        matchFactorObjId.current = value?.id ? String(value?.id) : '';
      }
      regFactorRate(value?.rate || '');
    } else {
      matchFactorObjId.current = '';
    }
  }, [value]);

  // 仅新增入口遵循业务开关和字段权限；原有按钮、弹窗及提交函数保持原样。
  const savedFactorTarget = getSavedFactorTarget(form, field);
  const customFactorAction =
    customFactorReuse &&
    !customFactorReuseExcluded &&
    allowCustomFactorReuse &&
    !readPretty &&
    field.editable &&
    !form.loading ? (
      <CustomFactorAction
        key={savedFactorTarget}
        hasFactor={!!value?.name}
        service={savedFactorService}
        onEdit={onClickFactorModalBtn}
        onSelect={record => {
          if (
            form.unmounted ||
            field.unmounted ||
            !field.editable ||
            readPretty ||
            !allowCustomFactorReuse ||
            savedFactorTarget !== getSavedFactorTarget(form, field) ||
            Number(form.getValuesIn('matchWay')) ===
              MODEL_EMISSION_MATCH_WAY.SUPPLIER
          )
            return;
          const nextFactor = toFactorValue(record);
          // 仅复用选择替换旧快照；原手填回调及换算流程保持不变。
          cancelTokenSource.current.forEach(item => item?.cancel());
          cancelTokenSource.current = [];
          matchFactorObjId.current = '';
          form.setValuesIn(field.path, nextFactor);
          onSubmit(nextFactor);
        }}
      />
    ) : null;

  return (
    <Spin spinning={field.loading}>
      <div className={styles.formilyFactor}>
        <div className={styles.describe}>
          {!canSelectFactor ? '' : I18N.components.accordingToTheEmissionSource}
        </div>
        {value?.name ? (
          <div className={styles.factorMain}>
            <div className={styles.factorTitleMain}>
              <div className={styles.titleMain}>
                <IconAlibaba
                  className={classNames(
                    styles.cardIcon,
                    styles.selectFactorIcon,
                  )}
                  type={FACTOR_ICON}
                />
                <div className={styles.titleText} title={value?.name}>
                  {value?.name}
                </div>
                <Tooltip
                  placement='top'
                  title={I18N.carbonFootprint3.viewDetails}
                >
                  <IconAlibaba
                    type='icon-icon_chakanxiangqing'
                    className={styles.detailIcon}
                    onClick={() => {
                      if (value?.matchWay === FACTOR) {
                        setShowFactorDetail(true);
                      } else {
                        onClickFactorModalBtn();
                        setFactorModalRead(true);
                      }
                    }}
                  />
                </Tooltip>
              </div>

              {!readPretty && (
                <div
                  className={classNames(styles.titleSetMain, {
                    [styles.titleSetMainWithExtra]: headerExtra,
                  })}
                >
                  {headerExtra}
                  {headerExtra && (
                    <span aria-hidden className={styles.actionDivider} />
                  )}
                  {canAutoMatch &&
                    value?.matchWay !== FACTOR_CREATE &&
                    canSelectFactor && (
                      <>
                        <Button
                          type='link'
                          icon={
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='16'
                              height='16'
                              viewBox='0 0 16 16'
                              fill='none'
                            >
                              <path
                                d='M8 2C9.62281 2 11.1491 2.64912 12.2719 3.78947C12.4649 3.98246 12.7807 3.99123 12.9825 3.78947C13.1842 3.58772 13.1842 3.2807 12.9825 3.07895C11.6754 1.75439 9.89474 1 8 1C6.11404 1 4.35088 1.74561 3.04386 3.05263C1.74561 4.35965 1 6.12281 1 8C1 8.27193 1.22807 8.5 1.5 8.5C1.77193 8.5 2 8.27193 2 8C2 6.38596 2.64035 4.87719 3.75439 3.76316C4.87719 2.64035 6.38596 2 8 2ZM14.5 7.5C14.2281 7.5 14 7.72807 14 8C14 9.62281 13.3509 11.1404 12.2193 12.2632C11.1053 13.3684 9.60526 14 8 14C6.38596 14 4.87719 13.3596 3.76316 12.2456C3.57018 12.0526 3.25439 12.0526 3.05263 12.2456C2.85965 12.4386 2.85965 12.7544 3.05263 12.9561C4.35965 14.2632 6.12281 15 8 15C9.86842 15 11.6228 14.2632 12.9298 12.9737C14.2456 11.6667 15 9.89474 15 8C15 7.72807 14.7807 7.5 14.5 7.5Z'
                                fill='#026961'
                              />
                              <path
                                d='M8.44943 5.2854C8.36216 5.10826 8.19635 5.00984 8.02182 5H8.00436C7.82983 5 7.65529 5.09841 7.55929 5.2854L5.06342 10.1569L5.02851 10.2455C4.94997 10.4915 5.03724 10.7867 5.24668 10.9245C5.48231 11.082 5.78775 10.9836 5.92738 10.7178L6.59934 9.3991H9.40066L10.0726 10.7178C10.2123 10.9836 10.5177 11.082 10.7533 10.9245C10.9628 10.7867 11.05 10.5013 10.9715 10.2455L10.9366 10.1569L8.44943 5.2854ZM7.17531 8.28702L8.00436 6.67304L8.83341 8.28702H7.17531Z'
                                fill='#026961'
                              />
                            </svg>
                          }
                          onClick={autoMatch}
                        >
                          {I18N.components.intelligentMatching}
                        </Button>
                        <span aria-hidden className={styles.actionDivider} />
                      </>
                    )}
                  {canSelectFactor && (
                    <>
                      <Button
                        type='link'
                        icon={
                          <IconAlibaba
                            type='icon-icon-tongzhi-1'
                            className='m-r-6'
                          />
                        }
                        // className={styles.setMain}
                        onClick={onClickSelectFactorBtn}
                      >
                        {I18N.carbonFootprint.reSelect}
                      </Button>
                      <span aria-hidden className={styles.actionDivider} />
                    </>
                  )}

                  {customFactorAction || (
                    <Button
                      // className={styles.setMain}
                      type='link'
                      icon={
                        <IconAlibaba type='icon-icon_sdtx' className='m-r-6' />
                      }
                      onClick={onClickFactorModalBtn}
                    >
                      {I18N.components.editingFactors}
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div
              className={classNames(styles.factorDetail, {
                [styles.factorDetailWithType]: showFactorType,
              })}
            >
              <div className={styles.factorEmission}>
                <div
                  className={styles.factorValue}
                  title={
                    shouldHideEcoinventValue(value)
                      ? I18N.carbonFootprint3.notDisplayedTemporarily
                      : `${value?.factor} ${value?.numeratorUnit}/${value?.denominatorUnit}`
                  }
                >
                  {shouldHideEcoinventValue(value)
                    ? I18N.carbonFootprint3.notDisplayedTemporarily
                    : `${value?.factor} ${value?.numeratorUnit}/${value?.denominatorUnit}`}
                </div>
                <div className={styles.factorDescribe}>
                  {I18N.carbonFootprint.factorValue}
                </div>
              </div>
              <div className={styles.factorEmission}>
                <div className={styles.factorValue}>
                  {value?.institution || '-'}
                </div>
                <div className={styles.factorDescribe}>
                  {I18N.components.factorSources}
                </div>
              </div>
              <div className={styles.factorEmission}>
                <div className={styles.factorValue}>{value?.year || '-'}</div>
                <div className={styles.factorDescribe}>
                  {I18N.carbonFootprint.yearOfPublication}
                </div>
              </div>
              {showFactorType && (
                <div className={styles.factorEmission}>
                  <div className={styles.factorValue} title={factorTypeText}>
                    {factorTypeText}
                  </div>
                  <div className={styles.factorDescribe}>
                    {I18N.emission.factorType}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.rateAndEvalRow}>
              <div className={styles.factorRate}>
                <div className={styles.rateTitle}>
                  <span className={styles.riskIcon}>*</span>
                  {I18N.carbonFootprint.unitConversionRatio4}
                  <Tooltip
                    placement='top'
                    title={I18N.components.activityDataSheet2}
                  >
                    <InfoCircleOutlined className='m-l-6 color-B5B8BB' />
                  </Tooltip>
                </div>
                <div className={styles.widthAuto}>
                  <div className={styles.rateMain}>
                    <span
                      className={classNames(
                        styles.rateWeightText,
                        styles.oneUnit,
                      )}
                    >
                      1 {value?.unitString || '-'}
                    </span>
                    <span> </span>
                    <span className={styles.rateWeightText}>
                      {I18N.components.equalTo}
                    </span>
                    <span> </span>
                    {readPretty ? (
                      <span className={styles.rateSpan}>{value?.rate}</span>
                    ) : (
                      <InputNumber
                        stringMode
                        value={value?.rate}
                        controls={false}
                        className={classNames(styles.inputData, {
                          [styles.error]: regFactorRateText,
                        })}
                        onChange={val => {
                          if (!val) {
                            rateValueChange('');
                          } else {
                            const backInputVal = getFullNum(val);
                            rateValueChange(backInputVal as string);
                            field.validate();
                          }
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
                        max={99999999999.9999999999999}
                      />
                    )}

                    <span className={styles.rateWeightText}>
                      {value?.denominatorUnit}
                    </span>
                  </div>
                  <div className={styles.tipInfo}>
                    <span className={styles.rateText}>
                      {I18N.components.activityDataSheet}
                    </span>
                    <span className={styles.rateText}>
                      {I18N.components.factorDenominatorSingle}
                    </span>
                  </div>
                </div>
                {regFactorRateText && (
                  <div className={styles.errorRegText}>{regFactorRateText}</div>
                )}
              </div>
              {showFactorEvaluationCard && (
                <FactorEvaluationCard
                  params={evalParams}
                  className={styles.evaluationCard}
                />
              )}
            </div>
          </div>
        ) : (
          <div className={styles.factorNoDataMain}>
            {/* <IconAlibaba type='icon-icon-zanmoshuju' className={styles.empty} />
             */}
            <img src={emptySvg} alt='' className={styles.empty} />
            <span className={styles.noFactorText}>
              {readPretty
                ? I18N.components.notMatchedDueTo
                : matchCreateFactorText()}
            </span>
            {!readPretty && (
              <div className={styles.factorNoDataSetMain}>
                {canAutoMatch &&
                  value?.matchWay !== FACTOR_CREATE &&
                  canSelectFactor && (
                    <Button
                      type='link'
                      icon={
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='16'
                          height='16'
                          viewBox='0 0 16 16'
                          fill='none'
                        >
                          <path
                            d='M8 2C9.62281 2 11.1491 2.64912 12.2719 3.78947C12.4649 3.98246 12.7807 3.99123 12.9825 3.78947C13.1842 3.58772 13.1842 3.2807 12.9825 3.07895C11.6754 1.75439 9.89474 1 8 1C6.11404 1 4.35088 1.74561 3.04386 3.05263C1.74561 4.35965 1 6.12281 1 8C1 8.27193 1.22807 8.5 1.5 8.5C1.77193 8.5 2 8.27193 2 8C2 6.38596 2.64035 4.87719 3.75439 3.76316C4.87719 2.64035 6.38596 2 8 2ZM14.5 7.5C14.2281 7.5 14 7.72807 14 8C14 9.62281 13.3509 11.1404 12.2193 12.2632C11.1053 13.3684 9.60526 14 8 14C6.38596 14 4.87719 13.3596 3.76316 12.2456C3.57018 12.0526 3.25439 12.0526 3.05263 12.2456C2.85965 12.4386 2.85965 12.7544 3.05263 12.9561C4.35965 14.2632 6.12281 15 8 15C9.86842 15 11.6228 14.2632 12.9298 12.9737C14.2456 11.6667 15 9.89474 15 8C15 7.72807 14.7807 7.5 14.5 7.5Z'
                            fill='#026961'
                          />
                          <path
                            d='M8.44943 5.2854C8.36216 5.10826 8.19635 5.00984 8.02182 5H8.00436C7.82983 5 7.65529 5.09841 7.55929 5.2854L5.06342 10.1569L5.02851 10.2455C4.94997 10.4915 5.03724 10.7867 5.24668 10.9245C5.48231 11.082 5.78775 10.9836 5.92738 10.7178L6.59934 9.3991H9.40066L10.0726 10.7178C10.2123 10.9836 10.5177 11.082 10.7533 10.9245C10.9628 10.7867 11.05 10.5013 10.9715 10.2455L10.9366 10.1569L8.44943 5.2854ZM7.17531 8.28702L8.00436 6.67304L8.83341 8.28702H7.17531Z'
                            fill='#026961'
                          />
                        </svg>
                      }
                      onClick={autoMatch}
                    >
                      {I18N.components.intelligentMatching}
                    </Button>
                  )}
                {canSelectFactor && (
                  <>
                    <Button
                      type='link'
                      icon={
                        <IconAlibaba type='icon-icon_znpp' className='m-r-6' />
                      }
                      // className={styles.factorNoDataSet}
                      onClick={onClickSelectFactorBtn}
                    >
                      <span>{I18N.components.selectionFactor}</span>
                    </Button>
                    <span className={styles.line} />
                  </>
                )}

                {customFactorAction || (
                  <Button
                    // className={styles.factorNoDataSet}
                    type='link'
                    icon={
                      <IconAlibaba type='icon-icon_sdtx' className='m-r-6' />
                    }
                    onClick={onClickFactorModalBtn}
                  >
                    <span>{I18N.carbonFootprint.manualFilling}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        <FactorWriteModal
          initValues={editFactorModalValues}
          readPretty={factorModalRead}
          visible={factorModal}
          onSubmit={onSubmit}
          onCancel={onCancelFactorModal}
        />
        {factorModalVisible && (
          <Modal
            title={I18N.carbonFootprint3.chooseEmissionFactors}
            width={1260}
            maskClosable={false}
            destroyOnClose
            open={factorModalVisible}
            footer={null}
            centered
            onCancel={() => setFactorModalVisible(false)}
          >
            <SearchModalFactor
              subClick={selectFactor}
              AdditionalParams={AdditionalParams}
              emissionType={form.getValuesIn('type')}
              sourceType={sourceType}
              factorName={form.getValuesIn(fieldFactorName)}
              tableScrollOptions={{ y: 320 }}
              emissionId={form.getValuesIn('emissionId')}
              emissionName={form.getValuesIn('name')}
              emissionAmount={form.getValuesIn('amount')}
              emissionUnit={form.getValuesIn('unitCode')?.[1]}
              enableFactorSourceRange={enableFactorSourceRange}
              factorPrefId={factorPrefId}
              onCancel={async () => {
                setFactorModalVisible(false);
              }}
            />
          </Modal>
        )}
        <Modal
          destroyOnClose
          title={I18N.components.emissionFactorsDetailed}
          width={1200}
          maskClosable={false}
          open={showFactorDetail}
          cancelText={I18N.carbonFootprint3.close}
          okButtonProps={{
            style: {
              display: 'none',
            },
          }}
          bodyStyle={{
            padding: '0 16px',
          }}
          onCancel={() => setShowFactorDetail(false)}
        >
          {value && value?.id && <SearchFactorDetail id={String(value?.id)} />}
        </Modal>
      </div>
    </Spin>
  );
};

/** 单元过程、产品和产出物不接入复用，避免继承页面开启状态。 */
export const FormilyFactorWithoutReuse = connect(
  FormilyFactor,
  mapProps({ value: true, readPretty: false }, props => ({
    ...props,
    allowCustomFactorReuse: false,
  })),
);

export default connect(
  FormilyFactor,
  mapProps({ value: true, readPretty: false }, (props, field) => ({
    ...props,
    allowCustomFactorReuse:
      field.editable &&
      !field.form.loading &&
      Number(field.form.getValuesIn('matchWay')) !==
        MODEL_EMISSION_MATCH_WAY.SUPPLIER,
  })),
);
