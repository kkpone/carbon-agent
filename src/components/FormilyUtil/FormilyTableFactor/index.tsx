/**
 * 因子抽屉中的因子卡片
 */
import { InfoCircleOutlined } from '@ant-design/icons';
import { ArrayItems } from '@formily/antd-v5';
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
import { getFactorUnitRate } from '@src/views/carbonFootprint3/component/AccessoryDrawer/service';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { ECOINVENT_TEXT } from '@src/views/carbonFootprint3/constant';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { RegFActorObjRate } from '@src/views/carbonFootprint3/util';
// import { changeDicts2Options } from '@src/views/utils';
import { Button, InputNumber, Modal, Spin, Tooltip } from 'antd';
import axios, { CancelToken } from 'axios';
import classNames from 'classnames';
import { cloneDeep, isArray, isEmpty, isString } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

import { FactorWriteModal } from './Modal';
import { FactorObjType } from './Modal/type';
import editSvg from './edit.svg';
import styles from './index.module.less';
import selectSvg from './select.svg';
import { FormilyFactorFormValue } from './type';

type FormilyFactorProps = {
  value?: FactorObjType;
  readPretty?: boolean;
  AdditionalParams?: object;
  onlyCreateFactor?: boolean;
  sourceType?: string;
  loading?: boolean;
  autoFactorName?: string;
  isTransport?: boolean;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 id */
  factorPrefId?: number | string;
};

const { FACTOR_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;
const { FACTOR, FACTOR_CREATE } = MODEL_EMISSION_MATCH_WAY;

const FormilyTableFactor = (props: FormilyFactorProps) => {
  const {
    value,
    readPretty,
    AdditionalParams,
    onlyCreateFactor,
    sourceType,
    autoFactorName = true,
    isTransport = false,
    enableFactorSourceRange,
    factorPrefId,
  } = props;

  // 记录 输入名称自动匹配的单位名称
  const matchFactorObjId = useRef('');

  const form = useForm<FormilyFactorFormValue>();
  const field = useField<ObjectField>();
  const index = ArrayItems.useIndex();

  // field.validate
  const cancelTokenSource = useRef<any[]>([]);

  // 多个factorObj根据父级路径生成唯一， 防止重复生成多次调用
  const effectId =
    field.parent && field.parent.path
      ? `${field.parent.path}__FormilyFactor__`
      : '__FormilyFactor__';

  // 设置选择因子时候写入的名称
  const fieldFactorMatchWay =
    field.parent && field.parent.path
      ? `${field.parent.path}.matchWay`
      : 'matchWay';
  // 设置选择因子时候写入的名称
  const fieldFactorName = `${field.path.pop().toString()}.name`;

  // const unitString = form
  //   .getValuesIn(`${field.path.pop().toString()}.factorObj`)
  //   ?.unit?.split('/')?.[1];
  // const
  const transportType = form.getValuesIn(
    `${field.path.pop().toString()}.transportType`,
  );
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
    // const factorObjUnitStringField = form.getFieldState(
    //   factorObjUnitStringFieldPath,
    // );
    // if (factorObjUnitStringField) {
    //   autoRate(form, factorObjUnitStringField as DataField);
    // } else {
    //   const nextFactorObjUnitStringField =
    //     form.getFieldState(`.factorObjUnitString`);
    //   autoRate(form, nextFactorObjUnitStringField as DataField);
    // }
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
    const parentPath = field.parent?.path;
    const oldValue = cloneDeep(form.getValuesIn(parentPath));
    if (Array.isArray(oldValue)) {
      oldValue[index] = {
        ...oldValue[index],
        matchWay: FACTOR_CREATE,
      };
    }
    form.setValuesIn(parentPath, oldValue);
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
    field.selfModified = true;
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
    const parentPath = field.parent?.path;
    const oldValue = cloneDeep(form.getValuesIn(parentPath));
    if (Array.isArray(oldValue)) {
      oldValue[index] = {
        ...oldValue[index],
        matchWay: FACTOR,
      };
    }
    form.setValuesIn(parentPath, oldValue);
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
    field.selfModified = true;
  };

  const matchCreateFactorText = () => {
    if (!canSelectFactor) {
      return I18N.components.pleaseFillInTheFactor;
    }
    return I18N.components.notMatchedDueTo2;
  };

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

  const showText = shouldHideEcoinventValue(value)
    ? ECOINVENT_TEXT
    : `${value?.factor ?? ''} ${value?.unit ?? ''}`;

  const matchWay = () => {
    if (isTransport) {
      const matchWayPath =
        field.parent && field.parent.path
          ? `${field.parent.path}.[${index}].matchWay`
          : 'matchWay';
      return form.getValuesIn(matchWayPath)?.[index]?.matchWay;
    }
    return field.value?.matchWay;
  };

  return (
    <Spin spinning={props.loading}>
      <div
        className={classNames(styles.factorWrapper)}
        onClick={() => {
          if (value?.factor === undefined) {
            return;
          }
          let matchWay = null;
          if (isTransport) {
            // 单独处理 单元过程情况
            const matchWayPath =
              field.parent && field.parent.path
                ? `${field.parent.path}.[${index}].matchWay`
                : 'matchWay';
            matchWay = form.getValuesIn(matchWayPath)?.[0]?.matchWay;
          } else {
            matchWay = field.value?.matchWay;
          }
          if (matchWay === FACTOR) {
            setShowFactorDetail(true);
          } else {
            onClickFactorModalBtn();
            setFactorModalRead(true);
          }
        }}
      >
        <div className={styles.factorText}>
          {value?.factor !== undefined && showText}
        </div>
        <div className={styles.factorBtn}>
          {(matchWay() === FACTOR_CREATE || !field.value) && (
            <Tooltip
              title={
                value?.factor !== undefined
                  ? I18N.components.editingFactors
                  : I18N.carbonFootprint.manualFilling
              }
            >
              <div
                className={styles.BtnItem}
                onClick={e => {
                  e.stopPropagation();
                  onClickFactorModalBtn();
                }}
              >
                <img src={editSvg} alt='' />
              </div>
            </Tooltip>
          )}
          <Tooltip
            title={
              value?.factor !== undefined
                ? I18N.carbonFootprint.reSelect
                : I18N.carbonFootPrintLCA.selectionFactor
            }
          >
            <div
              className={styles.BtnItem}
              onClick={e => {
                e.stopPropagation();
                onClickSelectFactorBtn();
              }}
            >
              <img src={selectSvg} alt='' />
            </div>
          </Tooltip>
        </div>
      </div>
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
                <TextWidthOverflow
                  className={styles.titleText}
                  width={350}
                  value={value?.name}
                />
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
                <div className={styles.titleSetMain}>
                  {canSelectFactor && (
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
                  )}

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
                </div>
              )}
            </div>
            <div className={styles.factorDetail}>
              <div className={styles.factorEmission}>
                <div className={styles.factorValue}>
                  {shouldHideEcoinventValue(value)
                    ? ECOINVENT_TEXT
                    : `${value?.factor} ${value?.numeratorUnit}/${value?.denominatorUnit}`}
                </div>
                <div className={styles.factorDescribe}>
                  {I18N.carbonFootprint.factorValue}
                </div>
              </div>
              <div className={styles.factorEmission}>
                <div className={styles.factorValue}>{value?.institution}</div>
                <div className={styles.factorDescribe}>
                  {I18N.components.factorSources}
                </div>
              </div>
              <div className={styles.factorEmission}>
                <div className={styles.factorValue}>{value?.year}</div>
                <div className={styles.factorDescribe}>
                  {I18N.carbonFootprint.yearOfPublication}
                </div>
              </div>
            </div>
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

                <Button
                  // className={styles.factorNoDataSet}
                  type='link'
                  icon={<IconAlibaba type='icon-icon_sdtx' className='m-r-6' />}
                  onClick={onClickFactorModalBtn}
                >
                  <span>{I18N.carbonFootprint.manualFilling}</span>
                </Button>
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
            width={1200}
            maskClosable={false}
            destroyOnClose
            open={factorModalVisible}
            footer={null}
            style={{
              top: 50,
            }}
            onCancel={() => setFactorModalVisible(false)}
          >
            <SearchModalFactor
              subClick={selectFactor}
              AdditionalParams={{
                ...AdditionalParams,
                transportType,
                sourceType: !autoFactorName ? '2' : undefined,
                // factorUnitM
              }}
              emissionType={form.getValuesIn('type')}
              sourceType={!autoFactorName ? '2' : sourceType}
              factorName={
                autoFactorName ? form.getValuesIn(fieldFactorName) : ''
              }
              // factorUnitM={
              //   autoFactorName ? getFactorInfoByLabel(unitString) : undefined
              // }
              tableScrollOptions={{ y: 320 }}
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

export default connect(
  FormilyTableFactor,
  mapProps((props, field) => ({
    ...props,
    value: field.value,
    loading: field.loading,
  })),
);
