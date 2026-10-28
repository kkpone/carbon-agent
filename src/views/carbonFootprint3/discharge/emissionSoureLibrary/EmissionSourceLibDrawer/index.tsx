import {
  FormItem,
  FormGrid,
  ArrayCollapse,
  Input,
  NumberPicker,
  Select,
  Radio,
  Cascader,
  DatePicker,
  FormLayout,
} from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { FormConsumer, FormProvider, createSchemaField } from '@formily/react';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import FormilyFactor from '@src/components/FormilyUtil/FormilyFactor';
import ModalFactor from '@src/components/SearchFactor/ModalFactor';
import useFieldFlattenUnitDictSource from '@src/hooks/useFieldFlattenUnitDataSource';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { GetLocalStorageProductId } from '@src/utils/store';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { MODEL_EMISSION_MATCH_WAY } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { postAutoMatchFactor } from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/service';
import {
  ALL_EMISSION_LABEL,
  ECOINVENT_TEXT,
  QUICK_ACCOUNT_EMISSION,
} from '@src/views/carbonFootprint3/constant';
import { FactorPatternType } from '@src/views/emission/utils/index-type';
import { useMount, useUnmount } from 'ahooks';
import { App, Button, Drawer, Modal, Spin } from 'antd';
import classNames from 'classnames';
import { CSSProperties, FC, useMemo, useRef, useState } from 'react';

import { CustomHeaderIndex } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/CustomHeader';
import { ArrayRemove } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/Remove';
import {
  getNewEmissionFactorSchema,
  useFactorObjReaction,
  useNeedTransportReaction,
  AdditionalFormItemMaps,
  useFieldDataSourceReaction,
  useFactorObjUnitStringReaction,
  useUnitDataSourceReaction,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportSchema';

import styles from './index.module.less';
import { genEmissionBasicSchema, genEmissionMatchWaySchema } from './schema';
import { EmissionSourceLibDrawerProps } from './type';
import { CALC_WAY } from '../../process/constant';
import { getUnitValueByLabel } from '../../process/utils';
import {
  getEmissionSoureLibraryTableDataDetail,
  posEmissionSoureLibraryAdd,
  posEmissionSoureLibraryEdit,
} from '../service';

import './index.less';
import {
  serviceToForm,
  TransportListTransToService,
  formCache,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportUtil';
import { libTransportSchema } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/libTransportSchema';
import EmissionDescriptionSection from '../../../components/EmissionDescriptionSection';

import { toJS } from '@formily/reactive';

import { hasFactorObj } from '@/views/subModules/CarbonFootprintModel/util';

const footerStyle: CSSProperties = {
  padding: '0px 24px',
  height: 52,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const statusLabel = {
  add: I18N.carbonFootprint.newEmissionSourcesAdded,
  edit: I18N.carbonFootprint.editEmissionSources2,
  detail: I18N.carbonFootprint3.viewEmissionSources,
  copy: I18N.carbonFootprint3.copyingEmissionSources,
};

const { FACTOR, FACTOR_CREATE } = MODEL_EMISSION_MATCH_WAY;

export const EmissionSourceLibDrawer: FC<EmissionSourceLibDrawerProps> = ({
  visible,
  status,
  emissionId,
  onClose,
  onSub,
  initMenuCode,
}) => {
  // 缓存当前的表单旧名称，判断是否改变
  const formNameUseRef = useRef('');

  const readPretty = status === 'detail';

  const copyStatus = status === 'copy';

  /** 根据名称自动匹配因子loading */
  const [autoMatchFactorLoading, setAutoMatchFactorLoading] = useState(false);

  /** '1'-普通因子 '2'-ecoinvent因子 */
  const [factorPattern, setFactorPattern] = useState<FactorPatternType>();

  /** 储存因子数值 */
  const [fealFactor, setFealFactor] = useState<string | number>();

  const [submitLoading, setSubmitLoading] = useState(false);

  const [factorModalVisible, setFactorModalVisible] = useState(false);

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      FormGrid,
      FormLayout,
      Input,
      Select,
      Radio,
      Cascader,
      FormilyButtonSelect,
      DatePicker,
      FormilyFactor,
      ArrayCollapse,
      CustomHeaderIndex,
      NumberPicker,
      ArrayRemove,
    },
  });

  const form = useMemo(
    () =>
      createForm({
        readPretty,
        validateFirst: true,
        effects(form) {
          onFieldValueChange('files', field => {
            form.query('files').take()?.setComponentProps({
              fileListBack: field.value,
            });
          });
        },
      }),
    [visible],
  );

  const { clearCache } = formCache(
    form,
    'emissionSourceLibDrawer',
    status === 'add',
  );
  /**
   * 选择因子
   * @param data 因子信息
   */
  const selectFactor = async (data: Record<string, any>) => {
    const [numeratorUnit, denominatorUnit] = (data.unit || '').split('/');
    const [parentDenominatorUnitValue, denominatorUnitValue] =
      await getUnitValueByLabel(denominatorUnit);

    const { factor, factorPattern } = data;
    setFactorPattern(factorPattern);
    setFealFactor(factor);

    const formValues = form.values;

    form.setValues({
      ...formValues,
      factorObj: {
        ...data,
        numeratorUnit,
        denominatorUnit: [parentDenominatorUnitValue, denominatorUnitValue],
        factor: shouldHideEcoinventValue(data) ? ECOINVENT_TEXT : factor,
      },
    });

    form.setFieldState('factorObj.denominatorUnit', {
      data: {
        value: denominatorUnitValue,
      },
    });
    setFactorModalVisible(false);
  };

  const onSubmit = async () => {
    const formValues = await form.submit<Record<string, any>>();
    const { factorObj, ...restValues } = formValues;
    const { rate, ...restFactorObj } = factorObj || {};
    Object.assign(restFactorObj || {}, {
      ...restFactorObj,
      numeratorUnit: undefined,
      denominatorUnit: undefined,
      rate: undefined,
    });
    const submitData: any = {
      ...restValues,
      name: restValues.name || restValues.selectName,
      type: restValues.type,
      // 运输排放源不提交本次新增的描述字段。
      emissionSourceDescription:
        restValues.type === QUICK_ACCOUNT_EMISSION.TRANS
          ? undefined
          : restValues.emissionSourceDescription,
      matchWay: restValues.matchWay,
      rate,
      factorObj: restFactorObj,
      accountEmissionTransportList: TransportListTransToService(
        restValues.accountEmissionTransportList,
        restValues.name,
      ),
    };

    if (factorPattern === FactorPatternType.eCoinVent) {
      submitData.factorObj.factor = fealFactor;
    }

    // if (restValues.type !== ALL_EMISSION.TRANS) {
    submitData.unitCode = (restValues.unitCode as unknown as string[])?.[1];
    submitData.unitName =
      (
        form.getFieldState('unitCode')?.inputValues as {
          label: string;
        }[][]
      )?.[1]?.[1]?.label || form.getFieldState('unitCode').data?.label;
    // }

    try {
      setSubmitLoading(true);

      // 复制
      if (status === 'copy') {
        await posEmissionSoureLibraryAdd(submitData);
        Toast('success', I18N.carbonFootprint3.copySuccessful);

        if (onSub) onSub();

        setFactorPattern(FactorPatternType.ordinaryFactor);
        setSubmitLoading(false);
        return;
      }

      if (emissionId && status === 'edit') {
        await posEmissionSoureLibraryEdit({
          ...submitData,
          id: emissionId,
        });
        Toast('success', I18N.carbonFootprint.editSuccessful);
      } else {
        await posEmissionSoureLibraryAdd(submitData);
        Toast('success', I18N.carbonFootprint.newSuccessfullyAdded2);
      }

      if (onSub) onSub();

      setFactorPattern(FactorPatternType.ordinaryFactor);
    } finally {
      setSubmitLoading(false);
      clearCache();
    }
  };

  /**
   * 基本信息 名称输入框输入后动态获取因子信息
   * @param newName 名称
   */
  const onBasicNameChange = async (
    newName: string = '',
    needNew: boolean = false,
  ) => {
    if (readPretty || autoMatchFactorLoading) return;
    if (needNew) {
      if (hasFactorObj(toJS(form.getValuesIn('factorObj')))) {
        return;
      }
    }

    if (!newName) {
      newName = form.getValuesIn('name');
    }
    // 没有更改表单直接返回
    // if (!form.modified) return;

    // 如果因子为手动填写也返回 - 手动填写的因子更改名称不自动匹配因子
    if (
      form.getValuesIn('factorObj.matchWay') === FACTOR_CREATE ||
      form.getValuesIn('matchWay') === FACTOR_CREATE ||
      form.getValuesIn('type') === QUICK_ACCOUNT_EMISSION.TRANS ||
      form.getValuesIn('matchWay') === MODEL_EMISSION_MATCH_WAY.SUPPLIER
    )
      return;

    // 名称相同不出发
    // if (formNameUseRef.current === newName) return;

    // formNameUseRef.current = newName;

    const formType = form.getValuesIn('type');

    try {
      await form.validate('emissionSourceDescription');
    } catch {
      return;
    }
    // 只有排放源名称更改后才会自动匹配 不论是否已经存在因子 - 3.5.5测试用例评审更改需求 10-08
    // 当前口径：名称触发和主动重新匹配均使用当前编辑的排放源描述。
    try {
      setAutoMatchFactorLoading(true);
      const { data } = await postAutoMatchFactor({
        name: newName,
        emissionSourceDescription:
          form.getValuesIn('emissionSourceDescription') || undefined,
        factorType: '3',
        productId: GetLocalStorageProductId(),
        emissionType: formType ? ALL_EMISSION_LABEL()[formType] : undefined,
      });
      if (data.data) {
        const [numeratorUnit, denominatorUnit] = (data.data.unit || '').split(
          '/',
        );
        const formFactorObjValue = form.getValuesIn('factorObj');
        form.setValuesIn('factorObj', {
          ...formFactorObjValue,
          ...data.data,
          numeratorUnit,
          denominatorUnit,
          matchWay: FACTOR,
        });
        form.setValuesIn('matchWay', FACTOR);
      } else {
        form.setValuesIn('factorObj', undefined);
      }
    } catch (e) {
      form.setValuesIn('factorObj', undefined);
    } finally {
      setAutoMatchFactorLoading(false);
    }
  };

  useMount(async () => {
    if (emissionId && status !== 'add') {
      const back = await getEmissionSoureLibraryTableDataDetail({
        id: String(emissionId),
      });

      const {
        name,
        amount,
        type,
        matchWay,
        rate,
        unitCode,
        files,
        unitName,
        emissionSourceDescription,
        accountEmissionTransportList,
      } = back.data.data as unknown as Record<string, any>;
      let { factorObj, typeExtra } = back.data.data as unknown as Record<
        string,
        any
      >;

      factorObj = factorObj || {};
      typeExtra = typeExtra || {};
      factorObj.rate = rate;

      const { factorPattern, factor } = factorObj;
      setFealFactor(factor);
      setFactorPattern(factorPattern);

      const initialValues: Record<string, any> = {
        type,
        emissionSourceDescription,
        needTransport:
          accountEmissionTransportList?.length ||
          type === QUICK_ACCOUNT_EMISSION.TRANS
            ? 2
            : 1,
        accountEmissionTransportList: serviceToForm(
          accountEmissionTransportList,
        ),
        name: copyStatus
          ? I18N.template(I18N.carbonFootprint3.names3, { val1: name })
          : name,
        matchWay:
          MODEL_EMISSION_MATCH_WAY.FACTOR === matchWay ||
          MODEL_EMISSION_MATCH_WAY.FACTOR_CREATE === matchWay ||
          MODEL_EMISSION_MATCH_WAY.SUPPLIER === matchWay
            ? matchWay
            : MODEL_EMISSION_MATCH_WAY.FACTOR,
        files,
        factorObj: {
          ...factorObj,
          ...form.getValuesIn('factorObj'),
          matchWay,
          noMatchFactor: true,
          numeratorUnit: (factorObj.unit || '').split('/')[0] || undefined,
          denominatorUnit: (factorObj.unit || '').split('/')[1] || undefined,
          factor: shouldHideEcoinventValue(factorObj) ? ECOINVENT_TEXT : factor,
        },
      };

      form.setFieldState('unitCode', {
        data: { value: unitCode, label: unitName },
      });

      initialValues.amount = amount;
      if (typeExtra) {
        switch (typeExtra.way) {
          case CALC_WAY.PRODUCT_WEIGHT:
            initialValues.typeExtra = {
              way: typeExtra.way,
              unitCode: typeExtra.unitCode,
              unitName: typeExtra.unitName,
            };
            break;
          case CALC_WAY.BEARING_RATIO:
            initialValues.typeExtra = {
              way: typeExtra.way,
            };
            break;
          case CALC_WAY.ENERGY_CONSUMPTION:
            initialValues.typeExtra = {
              way: typeExtra.way,
            };
            form.setFieldState('typeExtra.energyUnitCode', {
              data: { value: typeExtra.unitCode, label: typeExtra.unitName },
            });
            break;
          default:
        }
      }
      // form.setFieldState('factorObj.denominatorUnit', {
      //   data: { label: (factorObj.unit || '').split('/')[1] },
      // });

      form.setValues(initialValues);
    }
    if (status === 'add' && initMenuCode) {
      form.setValuesIn('type', initMenuCode);
    }
  });

  useUnmount(() => {
    formNameUseRef.current = '';
  });

  const { modal } = App.useApp();

  return (
    <Drawer
      open={visible}
      width={728}
      destroyOnClose
      closable={false}
      rootClassName='emissionSourceDrawer'
      title={statusLabel[status]}
      styles={{
        footer: footerStyle,
        body: {
          padding: 16,
        },
      }}
      footer={
        !readPretty ? (
          <div>
            <Button
              rootClassName={styles.btns}
              onClick={() => {
                if (readPretty || !form.getFormState().modified) {
                  onClose();
                  return;
                }
                modal.confirm({
                  title: I18N.carbonFootprint3.confirmToGiveUpWhen,
                  onOk: () => {
                    clearCache();
                    onClose();
                  },
                });
              }}
            >
              {I18N.carbonFootprint.cancel}
            </Button>
            <FormProvider form={form}>
              <FormConsumer>
                {() => (
                  <Button
                    rootClassName={classNames(styles.btns, 'm-l-10')}
                    type='primary'
                    loading={submitLoading}
                    onClick={onSubmit}
                  >
                    {I18N.carbonFootprint.confirm}
                  </Button>
                )}
              </FormConsumer>
            </FormProvider>
          </div>
        ) : (
          <Button
            rootClassName={styles.btns}
            onClick={() => {
              if (readPretty || !form.getFormState().modified) {
                clearCache();
                onClose();
                return;
              }
              modal.confirm({
                title: I18N.carbonFootprint3.confirmToGiveUpWhen,
                onOk: () => {
                  clearCache();
                  onClose();
                },
              });
            }}
          >
            {I18N.carbonFootprint3.close}
          </Button>
        )
      }
      onClose={() => {
        if (readPretty || !form.getFormState().modified) {
          clearCache();
          onClose();
          return;
        }
        modal.confirm({
          title: I18N.carbonFootprint3.confirmToGiveUpWhen,
          onOk: () => {
            clearCache();
            onClose();
          },
        });
      }}
    >
      <FormilyCommon form={form}>
        <>
          <div className={styles.titleContainer}>
            <div className={styles.title}>
              {I18N.carbonFootprint.basicInformation}
            </div>
          </div>
          <SchemaField
            schema={genEmissionBasicSchema(onBasicNameChange)}
            scope={{
              useFieldUnitDictSource,
              useFieldSetValueByLabel,
              useFieldFlattenUnitDictSource,
            }}
          />
          <EmissionDescriptionSection
            readPretty={readPretty}
            loading={autoMatchFactorLoading}
            onMatch={() => onBasicNameChange()}
          />
          <FormConsumer>
            {_form => {
              const type = _form.getValuesIn('type');
              if (type !== 7) {
                return (
                  <div className={styles.titleContainer}>
                    <div className={styles.title}>
                      {I18N.carbonFootprint3.emissionData}
                    </div>
                  </div>
                );
              }
              return '';
            }}
          </FormConsumer>
          <div className={styles.matchWayContainer}>
            <SchemaField schema={genEmissionMatchWaySchema()} />
          </div>
          <Spin spinning={autoMatchFactorLoading}>
            <SchemaField
              schema={getNewEmissionFactorSchema(undefined, undefined, () =>
                onBasicNameChange('', false),
              )}
              scope={{ AdditionalFormItemMaps }}
            />
          </Spin>
          <div className={classNames(styles.titleContainer, styles.transTitle)}>
            <div className={styles.title}>
              {I18N.carbonFootprint3.transportationInformation}
            </div>
          </div>
          <div className={styles.wrapper}>
            <SchemaField
              schema={libTransportSchema(true)}
              scope={{
                useNeedTransportReaction,
                AdditionalFormItemMaps,
                useFieldUnitDictSource,
                useFieldSetValueByLabel,
                useFactorObjReaction,
                useFieldDataSourceReaction,
                useFactorObjUnitStringReaction,
                useUnitDataSourceReaction,
              }}
            />
          </div>
        </>
      </FormilyCommon>
      <Modal
        open={factorModalVisible}
        title={I18N.carbonFootprint3.chooseEmissionFactors}
        width={1200}
        maskClosable={false}
        getContainer={false}
        footer={null}
        style={{
          top: 50,
        }}
        bodyStyle={{
          paddingBottom: 0,
        }}
        onCancel={() => setFactorModalVisible(false)}
      >
        <ModalFactor
          factorName={form.values?.name || form.values?.selectName}
          factorUnitM={form.values?.unitCode}
          subClick={selectFactor}
          onCancel={async () => setFactorModalVisible(false)}
        />
      </Modal>
    </Drawer>
  );
};
