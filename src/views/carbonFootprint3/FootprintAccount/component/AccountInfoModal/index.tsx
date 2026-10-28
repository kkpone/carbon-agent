/* eslint-disable no-nested-ternary */
import {
  Form,
  FormItem,
  Input,
  DatePicker,
  NumberPicker,
  Cascader,
  Select,
} from '@formily/antd-v5';
import { createForm, onFieldChange } from '@formily/core';
import { FormConsumer, Field } from '@formily/react';
import defaultImg from '@src/assets/svg/accountProductImg.svg';
import I18N from '@src/lang/I18N';
import { Image, Modal } from 'antd';
import { isNil } from 'lodash-es';
import classNames from 'classnames';
import {
  FC,
  useEffect,
  useMemo,
  useRef,
  useState,
  MutableRefObject,
} from 'react';

import { useAICarbonFloating } from '@/components/AICarbonFloating/AICarbonContext';
import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import useFieldUnitDictSource from '@/hooks/useFieldUnitDictSource';
import FormilyImgUpload from '@/views/carbonFootprint3/component/FormilyImgUpload';
import FormilySystemBoundaryRadio from '@/views/carbonFootprint3/component/FormilySystemBoundaryRadio';
import { QUICK_ACCOUNT_LIFE_CYCLE } from '@/views/carbonFootprint3/constant';

import styles from './index.module.less';
import { getAccountingInfo } from '../../AccountDetail/AccountInfo/service';
import { AccountingInfoData } from '../../AccountDetail/AccountInfo/type';
import { getSelectModelInfo } from '../../SelectModel/service';
import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL,
  FootprintAccountStatusType,
} from '../../constant';
import {
  getPublishedGlobalFactorPreferencePlans,
  getGlobalFactorPreferencePlanInfo,
} from '../GlobalFactorPreference/service';
import { GlobalFactorPreferencePlan } from '../GlobalFactorPreference/type';
import { getAccountProductData, getAccountProductInfo } from '../../service';
import { AccountProductData } from '../../type';

const { MATERIAL, PRODUCT, DISTRIBUTION } = QUICK_ACCOUNT_LIFE_CYCLE;
const ALL_FACTOR_PREFERENCE_VALUE = 'ALL';

type FactorPreferenceValue = string;

type FactorPreferenceOption = {
  value: FactorPreferenceValue;
  label: string;
  sourceNames: string;
};

const getSourceNamesText = (sourceNames?: string) => sourceNames || '-';

const getFactorPreferenceOptions = (
  plans: GlobalFactorPreferencePlan[],
): FactorPreferenceOption[] => [
  {
    value: ALL_FACTOR_PREFERENCE_VALUE,
    label: I18N.carbonFootprint3.whole,
    sourceNames: I18N.carbonFootprint3.allBackgroundDatabaseSources,
  },
  ...plans.map(plan => ({
    value: String(plan.id),
    label: plan.name,
    sourceNames: getSourceNamesText(plan.sourceNames),
  })),
];

const resolveDefaultFactorPreferenceValue = (
  plans: GlobalFactorPreferencePlan[],
): FactorPreferenceValue => {
  const defaultPlanId = plans.find(plan => plan.isDefault)?.id;
  return isNil(defaultPlanId)
    ? ALL_FACTOR_PREFERENCE_VALUE
    : String(defaultPlanId);
};

const resolveAccountFactorPreferenceValue = (
  value?: number | string,
): FactorPreferenceValue => {
  if (isNil(value) || value === '' || Number(value) === 0) {
    return ALL_FACTOR_PREFERENCE_VALUE;
  }

  return String(value);
};

/** 核算详情写入表单；编辑态额外同步产品 Select 的 dataSource */
const applyAccountInfoToForm = (
  form: ReturnType<typeof createForm>,
  accountData: AccountingInfoData,
  productNameRef: MutableRefObject<string>,
  isReadonly?: boolean,
) => {
  const { unitCode, unitType, unitName, aiStatus, aiType, ...rest } =
    accountData;
  productNameRef.current = accountData.productName;

  // 只读模式用 productName 字段展示，不依赖产品列表接口
  if (!isReadonly) {
    const productOption = {
      label: accountData.productName || '-',
      value: accountData.productId,
    };
    form.setFieldState('productId', state => {
      const list = Array.isArray(state.dataSource) ? [...state.dataSource] : [];
      if (
        !list.some(item => String(item.value) === String(accountData.productId))
      ) {
        list.unshift(productOption);
      }
      return { dataSource: list };
    });
  }

  form.setValues({
    ...rest,
    productName: accountData.productName,
    factorPrefId: resolveAccountFactorPreferenceValue(rest.factorPrefId),
    unitName,
    unit: [unitType, unitCode],
  });
};

/** 只读态：按 factorPrefId 调 /factorPref/info 获取方案名称，0/空为「全部」 */
const fetchFactorPrefDisplayName = async (
  factorPrefId?: number | string,
): Promise<string> => {
  if (
    isNil(factorPrefId) ||
    factorPrefId === '' ||
    Number(factorPrefId) === 0
  ) {
    return I18N.carbonFootprint3.whole;
  }
  try {
    const plan = await getGlobalFactorPreferencePlanInfo(Number(factorPrefId));
    return plan.name || I18N.carbonFootprint3.whole;
  } catch {
    return I18N.carbonFootprint3.whole;
  }
};

const AccountInfoModal: FC<{
  open: boolean;
  readonly?: boolean;
  /** 编辑态 disabled：保留输入框/下拉框，不可改（仅核算详情弹框 shareFlag 场景） */
  formDisabled?: boolean;
  productId?: string;
  accountType?: number;
  accountId?: string | number;
  modelId?: number;
  apiExtraParams?: Record<string, any>;
  isCopy?: boolean;
  onClose: () => void;
  scopeDisabled?: boolean;
  onConfirm: (val: Record<string, any>) => Promise<void> | void;
}> = ({
  open,
  productId,
  accountType,
  accountId,
  modelId,
  readonly,
  formDisabled,
  isCopy,
  apiExtraParams,
  onClose,
  onConfirm,
  scopeDisabled,
}) => {
  const [accountInfo, setAccountInfo] = useState<AccountingInfoData>();

  const [productInfo, setProductInfo] = useState<AccountProductData>();

  const [factorPreferencePlans, setFactorPreferencePlans] = useState<
    GlobalFactorPreferencePlan[]
  >([]);

  const [submitLoading, setSubmitLoading] = useState(false);

  const unitNameRef = useRef('');
  const productNameRef = useRef('');
  const manualProductRef = useRef(false);
  const factorPreferencePlansRef = useRef<GlobalFactorPreferencePlan[]>([]);
  const factorPreferencePlansLoadedRef = useRef(false);
  /** 产品列表缓存，用于切换产品时更新顶部预览图等 */
  const productRowsRef = useRef<AccountProductData[]>([]);

  const { isExpanded } = useAICarbonFloating();

  /** readPretty 纯文本；formDisabled 时保留输入框/下拉框 disabled */
  const isFormReadPretty = Boolean(readonly && !formDisabled);
  const isModalReadonly = Boolean(readonly || formDisabled);

  const factorPreferenceOptions = useMemo<FactorPreferenceOption[]>(
    () => getFactorPreferenceOptions(factorPreferencePlans),
    [factorPreferencePlans],
  );

  const renderFactorPreferenceOption = (option: {
    data?: FactorPreferenceOption;
  }) => {
    const label = option.data?.label || '-';
    const sourceNames = option.data?.sourceNames || '-';

    return (
      <div className={styles.factorPreferenceOption}>
        <div className={styles.factorPreferenceOptionName} title={label}>
          {label}
        </div>
        <div
          className={styles.factorPreferenceOptionSource}
          title={sourceNames}
        >
          {sourceNames}
        </div>
      </div>
    );
  };

  const form = useMemo(
    () =>
      createForm({
        readPretty: isFormReadPretty,
        disabled: !!formDisabled,
        effects: () => {
          onFieldChange('unit', ['value', 'dataSource'], field => {
            const { value = [], dataSource = [] } = field as unknown as {
              value: string[];
              dataSource: {
                value: string;
                label: string;
                children: { value: string; label: string }[];
              }[];
            };
            if (value.length > 0 && dataSource.length > 0) {
              for (let i = 0; i < dataSource.length; i += 1) {
                const unitType = dataSource[i];
                for (let j = 0; j < unitType.children.length; j += 1) {
                  const unit = unitType.children[j];
                  if (unit.value === value[1]) {
                    unitNameRef.current = unit.label;
                    form.setValues({ unitName: unit.label });
                    return;
                  }
                }
              }
            }
          });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, isCopy, isFormReadPretty, formDisabled],
  );

  const submit = async () => {
    setSubmitLoading(true);
    try {
      const {
        unit,
        productId: productIdValue,
        factorPrefId: factorPrefIdValue,
        ...values
      } = await form.submit<{
        unit: string[];
        productId: string;
        factorPrefId?: FactorPreferenceValue;
        supplierName?: string;
      }>();
      const factorPrefId =
        factorPrefIdValue === ALL_FACTOR_PREFERENCE_VALUE ||
        isNil(factorPrefIdValue)
          ? 0
          : Number(factorPrefIdValue);
      await onConfirm({
        unitCode: unit?.[1],
        unitType: unit?.[0],
        productId: !manualProductRef.current ? productIdValue : null,
        ...values,
        factorPrefId,
      });
      onClose();
    } finally {
      setSubmitLoading(false);
    }
  };

  /** 关弹后清空：与 destroyOnClose 配合，避免再次打开时残留图片、文案与表单值 */
  const clearModalState = () => {
    form.reset();
    setAccountInfo(undefined);
    setProductInfo(undefined);
    setFactorPreferencePlans([]);
    setSubmitLoading(false);
    unitNameRef.current = '';
    productNameRef.current = '';
    manualProductRef.current = false;
    factorPreferencePlansRef.current = [];
    factorPreferencePlansLoadedRef.current = false;
    productRowsRef.current = [];
  };

  useEffect(() => {
    if (!open || isFormReadPretty) {
      return undefined;
    }

    let cancelled = false;
    getPublishedGlobalFactorPreferencePlans().then(plans => {
      if (cancelled) {
        return;
      }

      factorPreferencePlansRef.current = plans;
      factorPreferencePlansLoadedRef.current = true;
      setFactorPreferencePlans(plans);
      form.setFieldState('factorPrefId', {
        dataSource: getFactorPreferenceOptions(plans),
      });
      form.setValues({
        factorPrefId: !isNil(accountId)
          ? resolveAccountFactorPreferenceValue(form.values.factorPrefId)
          : resolveDefaultFactorPreferenceValue(plans),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [open, form, accountId, isFormReadPretty]);

  useEffect(() => {
    if (open) {
      if (!isFormReadPretty) {
        getAccountProductData({ pageNum: 1, pageSize: 10000 }).then(resp => {
          const enumData = resp.data.data.rows;
          productRowsRef.current = enumData;
          form.setFieldState('productId', {
            dataSource: enumData.map(data => ({
              label: data.productName,
              value: data.id,
              unitCode: data.accountUnitCode,
              isCustom: false,
            })),
          });
        });
      }
      if (!isNil(accountId)) {
        getAccountingInfo({ id: accountId as string, ...apiExtraParams }).then(
          async ({ data }) => {
            setAccountInfo(data.data);
            applyAccountInfoToForm(
              form,
              data.data,
              productNameRef,
              isFormReadPretty,
            );
            if (isFormReadPretty) {
              const factorPrefName = await fetchFactorPrefDisplayName(
                data.data.factorPrefId,
              );
              form.setValuesIn('factorPrefName', factorPrefName);
            }
          },
        );
      } else {
        if (!isNil(productId)) {
          getAccountProductInfo({ id: productId }).then(({ data }) => {
            const info = data.data;
            productNameRef.current = info.productName;

            setProductInfo(info);
            form.setValues({
              productId: info.id,
              productName: info.productName,
              unitName: info.accountUnitName,
              unit: [info.unitType, info.accountUnitCode],
            });
          });
        }
        if (!isNil(accountType)) {
          form.setValues({
            type: accountType,
            scopeValue:
              accountType === FootprintAccountStatusType.QUICK
                ? `${MATERIAL},${PRODUCT},${DISTRIBUTION},`
                : `${PRODUCT},${DISTRIBUTION},`,
          });
        }
        if (!isNil(modelId)) {
          getSelectModelInfo({ id: modelId }).then(({ data }) => {
            const {
              amount,
              type,
              scope,
              scopeValue,
              specification,
              unitName,
              unitCodeArr,
            } = data.data as unknown as Record<string, any>;
            form.setValues({
              amount,
              type,
              scope,
              scopeValue,
              specification,
              unit: unitCodeArr ? JSON.parse(unitCodeArr) : undefined,
              unitName,
              modelId,
            });
          });
        }
      }
    }
  }, [
    open,
    accountId,
    accountType,
    modelId,
    apiExtraParams,
    productId,
    form,
    isFormReadPretty,
    isModalReadonly,
  ]);

  return (
    <Modal
      title={
        isModalReadonly
          ? I18N.carbonFootprint3.accountingDetails
          : isNil(accountId)
          ? I18N.carbonFootprint3.addAccounting
          : isCopy
          ? I18N.carbonFootprint3.copyAccountingLetter
          : I18N.carbonFootprint3.editAccountingLetter
      }
      zIndex={isExpanded ? 20000 : undefined}
      open={open}
      width={888}
      destroyOnClose
      afterClose={clearModalState}
      centered
      okText={I18N.carbonFootprint.preserve}
      cancelText={
        isModalReadonly
          ? I18N.carbonFootprint3.close
          : I18N.carbonFootprint.cancel
      }
      okButtonProps={{
        loading: submitLoading,
        style: { display: isModalReadonly ? 'none' : 'inline' },
      }}
      onClose={onClose}
      onCancel={onClose}
      onOk={submit}
    >
      <Form
        form={form}
        layout='vertical'
        colon={false}
        className={formDisabled ? styles.modalFormReadonly : undefined}
      >
        <div className={styles.header}>
          <Image
            width={152}
            height={152}
            preview={{ getContainer: false }}
            src={
              productInfo?.productPic || accountInfo?.productPic || defaultImg
            }
            onClick={e => {
              e.stopPropagation();
            }}
          />
          <div className={styles.infoGrid}>
            {isFormReadPretty ? (
              <Field
                name='productName'
                required
                title={I18N.carbonFootprint.productName}
                decorator={[FormItem]}
                component={[
                  Input,
                  { placeholder: I18N.carbonFootprint.productName },
                ]}
              />
            ) : (
              <Field
                name='productId'
                required
                title={I18N.carbonFootprint.productName}
                decorator={[FormItem]}
                component={[
                  Select,
                  {
                    disabled: !!formDisabled || (!isCopy && !!productId),
                    showSearch: true,
                    optionFilterProp: 'label',
                    placeholder: I18N.carbonFootprint.pleaseSelect,
                    onBlur: (e: { target: HTMLInputElement }) => {
                      if (formDisabled) return;
                      const searchText = e.target.value;
                      if (searchText) {
                        manualProductRef.current = true;
                        form.setValues({
                          productName: searchText,
                          productId: searchText,
                        });
                        productNameRef.current = searchText;
                      }
                    },
                    onChange: (val: string | number | null | undefined) => {
                      if (formDisabled) return;
                      if (val === undefined || val === null || val === '') {
                        return;
                      }
                      manualProductRef.current = false;
                      const row = productRowsRef.current.find(
                        p => String(p.id) === String(val),
                      );
                      if (row) {
                        productNameRef.current = row.productName;
                        form.setValues({ productName: row.productName });
                        setProductInfo(row);
                      }
                    },
                  },
                ]}
              />
            )}
            <div className={styles.amountGrid}>
              <Field
                name='amount'
                required
                title={I18N.carbonFootprint.accountingQuantity}
                decorator={[FormItem]}
                component={[
                  NumberPicker,
                  {
                    disabled: !!formDisabled,
                    placeholder: I18N.carbonFootprint.accountingQuantity,
                    controls: false,
                    min: 0,
                    max: 10000000000,
                    onBlur: () => {
                      setTimeout(() => {
                        const { accountName, amount } = form.values;
                        if (!accountName && !isNil(amount)) {
                          form.setValues({
                            accountName: `${amount}${unitNameRef.current}${productNameRef.current}`,
                          });
                        }
                      });
                    },
                  },
                ]}
              />
              <Field
                name='unit'
                required
                title=' '
                decorator={[FormItem, { asterisk: false }]}
                component={[
                  Cascader,
                  {
                    disabled: !!formDisabled,
                    showSearch: true,
                    placeholder: I18N.carbonFootprint.unit,
                  },
                ]}
                reactions={[useFieldUnitDictSource('factorUnitM')]}
              />
            </div>
            <Field
              name='accountName'
              required
              title={I18N.carbonFootprint3.functionalUnits}
              decorator={[FormItem]}
              component={[
                Input,
                {
                  disabled: !!formDisabled,
                  placeholder: I18N.carbonFootprint3.functionalUnits,
                },
              ]}
            />
            <Field
              name='[startTime,endTime]'
              required
              title={I18N.carbonFootprint.accountingCycle}
              decorator={[FormItem]}
              component={[DatePicker.RangePicker, { disabled: !!formDisabled }]}
            />
          </div>
        </div>
        <div className={styles.splitLine} />
        <FormConsumer>
          {formIns => {
            const { type } = formIns.values as { type: number };
            if (isNil(type)) {
              return '';
            }

            return (
              <div
                className={classNames(styles.accountTypeContent, {
                  [styles.accountTypeReadonly]: !!formDisabled,
                })}
              >
                <div>{I18N.carbonFootprint3.accountingMethod}</div>
                <div className={styles.accountType}>
                  <IconAlibaba
                    className={styles.accountTypeIcon}
                    type={
                      type === FootprintAccountStatusType.QUICK
                        ? 'icon-icon_kuaisu'
                        : 'icon-icon_qiehuanzhikeshihua'
                    }
                  />
                  <div className={styles.accountTypeName}>
                    {FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL[type]}
                  </div>
                  <IconAlibabaNew
                    className={styles.accountTypeCheckIcon}
                    type='icon-slect'
                  />
                </div>
              </div>
            );
          }}
        </FormConsumer>

        <Field
          name='scope'
          title={I18N.carbonFootprint.systemBoundary}
          required
          disabled={scopeDisabled || !!formDisabled}
          decorator={[FormItem]}
          component={[FormilySystemBoundaryRadio]}
        />
        <div className={styles.extraInfoGrid}>
          {isFormReadPretty ? (
            <Field
              name='factorPrefName'
              title={I18N.carbonFootprint3.backgroundDatabaseRange}
              decorator={[FormItem]}
              component={[
                Input,
                {
                  placeholder: I18N.carbonFootprint3.backgroundDatabaseRange,
                },
              ]}
            />
          ) : (
            <Field
              name='factorPrefId'
              title={I18N.carbonFootprint3.backgroundDatabaseRange}
              decorator={[FormItem]}
              component={[
                Select,
                {
                  disabled: !!formDisabled,
                  className: styles.factorPreferenceSelect,
                  popupClassName: styles.factorPreferencePopup,
                  popupMatchSelectWidth: true,
                  optionFilterProp: 'label',
                  optionLabelProp: 'label',
                  dataSource: factorPreferenceOptions,
                  placeholder:
                    I18N.carbonFootprint3.selectGlobalFactorPreferencePlan,
                  allowClear: true,
                  showSearch: true,
                  optionRender: renderFactorPreferenceOption,
                },
              ]}
            />
          )}
          <Field
            name='supplierName'
            title={I18N.carbonFootprint3.supplier}
            decorator={[FormItem]}
            component={[
              Input,
              {
                disabled: !!formDisabled,
              },
            ]}
          />
        </div>
        <Field
          name='files'
          title={I18N.carbonFootprint.systemBoundaryEngineer}
          decorator={[FormItem]}
          component={[FormilyImgUpload]}
        />
      </Form>
    </Modal>
  );
};

export default AccountInfoModal;
