/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-24 11:53:01
 * @Date: 2023-05-11 10:38:33
 * @@description:
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
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import FormilyFactor from '@src/components/FormilyUtil/FormilyFactor';
import IconFont from '@src/components/iconfont';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { GetLocalStorageProductId } from '@src/utils/store';
import { ALL_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import {
  MATCH_WAY,
  PROCESS_PRODUCT_TYPE,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import { useUnmount } from 'ahooks';
import { Collapse, Drawer, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getAccessoryMainProductSchema,
  getAccessoryOtherProductSchema,
} from './schema';
import { AccessoryProductData, AccessoryProductDrawerProps } from './type';
import { initProductDrawerFormValues, subForm } from './util';
import styleCarbonFootprint3 from '../../../index.module.less';
import FormilyFileUpload from '../../FormilyFileUpload';
import { CustomInput } from '../../formily/input';
import { postAutoMatchFactor } from '../EmissionDrawer/service';
import AccessoryFooterDrawer from '../FooterDrawer';
import styles from '../index.module.less';

const { Panel } = Collapse;
const { RECYCLED } = PROCESS_PRODUCT_TYPE;

const { FACTOR, FACTOR_CREATE } = MATCH_WAY;

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

const AccessoryProductDrawer = ({
  initValues,
  isEdit,
  isOnlyDetail,
  visible,
  onOk,
  onCancel,
  loading,
  enableFactorSourceRange,
  factorPrefId,
}: AccessoryProductDrawerProps & { isOnlyDetail?: boolean }) => {
  const title = isEdit
    ? I18N.carbonFootprint3.editProduct
    : I18N.carbonFootprint3.productDetails;

  // 记录所有其他产出物中的产出物名称
  const formNameUseRef = useRef<Record<string, string>>({});

  /** 根据名称自动匹配因子loading */
  const [autoMatchFactorLoading, setAutoMatchFactorLoading] = useState(false);

  /** 主产品 */
  const [mainProduct, setMainProduct] = useState<AccessoryProductData>();

  /** 副产品 */
  const [otherProductArr, setOtherProductArr] = useState<number[]>([]);

  const formProduct = useMemo(
    () =>
      createForm({
        readPretty: !!isOnlyDetail,
      }),
    [visible, isOnlyDetail],
  );

  /** 被激活的展开面板 */
  const [collapseKeys, setCollapseKeys] = useState<number[]>([999]);

  /** 当前点击展开的面板 */
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

  /**
   * @description:
   * @return {*}
   */
  const getSubFormValues = async () => {
    const formValues = await subForm(formProduct, otherProductArr, mainProduct);
    await onOk(formValues);
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
    const fieldPath = `${parentKey}.factorObj`;

    const formType = formProduct.getValuesIn(`${parentKey}.type`);
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

  useEffect(() => {
    // 如果存在初始化的value则设置回显
    if (initValues) {
      initProductDrawerFormValues(formProduct, initValues).then(
        ({ mainInitProduct, otherInitProduct }) => {
          setMainProduct(mainInitProduct);
          setOtherProductArr(otherInitProduct);
        },
      );
    }
  }, [initValues]);

  useEffect(() => {
    formProduct
      .query('shareRate')
      .take()
      ?.setState({ readPretty: !!isOnlyDetail });
  }, [isOnlyDetail, formProduct, mainProduct]);

  useUnmount(() => {
    formNameUseRef.current = {};
  });
  return (
    <Drawer
      width={700}
      closable={false}
      title={title}
      placement='right'
      open={visible}
      bodyStyle={{
        padding: 0,
      }}
      footerStyle={{
        boxShadow: '0 -4px 8px 0 rgba(0,0,0,0.04)',
        height: 52,
      }}
      rootClassName='processAccessoryDrawer'
      footer={
        <AccessoryFooterDrawer
          isOnlyDetail={isOnlyDetail}
          onSubClick={getSubFormValues}
          onCancelClick={() => {
            if (onCancel) {
              onCancel();
            }
          }}
        />
      }
    >
      <div className={styleCarbonFootprint3.carbonFootprint3}>
        <div className={styles.accessoryDrawer}>
          <div className={styles.paddingMain} style={{ paddingTop: 0 }}>
            <Spin spinning={loading}>
              <FormilyCommon form={formProduct}>
                <div className='m-t-10'>
                  <Collapse
                    activeKey={collapseKeys}
                    onChange={key => {
                      const backKey: number[] = (key as string[]).map(b =>
                        Number(b),
                      );
                      changeCollapse(backKey);
                    }}
                    ghost
                  >
                    {mainProduct && (
                      <Panel
                        forceRender
                        header={I18N.carbonFootprint3.mainProduct}
                        key={999}
                      >
                        <SchemaField
                          schema={getAccessoryMainProductSchema()}
                          scope={{
                            useFieldUnitDictSource,
                            useFieldSetValueByLabel,
                          }}
                        />
                      </Panel>
                    )}

                    {otherProductArr.map(data => (
                      <Panel
                        forceRender
                        header={
                          <>
                            <span>{I18N.carbonFootprint3.otherProducts}</span>
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
                            schema={getAccessoryOtherProductSchema(
                              data,
                              onBasicNameChange,
                              {
                                enableFactorSourceRange:
                                  enableFactorSourceRange && !isOnlyDetail,
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
                    {I18N.carbonFootprint3.addProduct}
                  </span>
                </div>
              )}
            </Spin>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default AccessoryProductDrawer;
