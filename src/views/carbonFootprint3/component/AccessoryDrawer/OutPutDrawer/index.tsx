/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 20:06:12
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
import { FOOTPRINT3_TOOLTIP_DETAIL } from '@src/views/carbonFootprint3/constant';
import {
  MATCH_WAY,
  PROCESS_PRODUCT_TYPE,
} from '@src/views/carbonFootprint3/discharge/process/constant';
import { Collapse, Drawer, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getAccessoryMainOutPutSchema,
  getAccessoryOtherOutPutSchema,
} from './schema';
import { AccessoryOutPutData, AccessoryOutPutDrawerProps } from './type';
import { initOutPutDrawerFormValues, subForm } from './util';
import styleCarbonFootprint3 from '../../../index.module.less';
import FormilyFileUpload from '../../FormilyFileUpload';
import { CustomInput } from '../../formily/input';
import AccessoryFooterDrawer from '../FooterDrawer';
import styles from '../index.module.less';
import '../index.less';
import CommonTitleTooltip from '../../CommonTitleTooltip';
import { postAutoMatchFactor } from '../EmissionDrawer/service';

import { useUnmount } from 'ahooks';

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

const { Panel } = Collapse;
const { RECYCLED } = PROCESS_PRODUCT_TYPE;

const { FACTOR, FACTOR_CREATE } = MATCH_WAY;

const AccessoryOutPutDrawer = ({
  initValues,
  isOnlyDetail,
  isEdit,
  isProcess,
  visible,
  onOk,
  onCancel,
  loading,
  parentProcessNodeInfo,
  parentProcessNodeInfoName,
  enableFactorSourceRange,
  factorPrefId,
}: AccessoryOutPutDrawerProps) => {
  // 记录所有其他产出物中的产出物名称
  const formOutNameUseRef = useRef<Record<string, string>>({});

  const parentNodeName =
    parentProcessNodeInfoName || parentProcessNodeInfo?.name;

  const isRoot = isProcess && !parentProcessNodeInfo;

  // const [parentNodeName] = useState(
  //   parentProcessNodeInfoName || parentProcessNodeInfo?.name,
  // );
  const title = isEdit
    ? I18N.carbonFootprint3.editingOutput
    : I18N.carbonFootprint3.outputDetails2;

  /** 根据名称自动匹配因子loading */
  const [autoMatchFactorLoading, setAutoMatchFactorLoading] = useState(false);

  /** 主产出物 */
  const [mainOutPut, setMainOutPut] = useState<AccessoryOutPutData>();

  /** 副产出物 */
  const [otherOutPutArr, setOtherOutPutArr] = useState<number[]>([]);

  const formOutPut = useMemo(
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
   * @description: 添加产出物
   */
  const addOtherOutPutFun = () => {
    const backArr = [...otherOutPutArr];
    const lastIndex = otherOutPutArr.length > 0 ? otherOutPutArr.length - 1 : 0;
    if (otherOutPutArr.length === 0) {
      backArr.push(1001);
      setCollapseKeys([...collapseKeys, 1001]);
    } else {
      const key = otherOutPutArr[lastIndex] + 1;
      backArr.push(key);
      setCollapseKeys([...collapseKeys, key]);
    }

    setOtherOutPutArr(backArr);
  };

  /**
   * @description: 删除产出物
   * @param {number} data 要被删除的code
   */
  const removeOtherOutPut = (data: number) => {
    const formOtherKey = `otherOutPut${data}`;

    formOutPut.clearFormGraph(`* (${formOtherKey},${formOtherKey}.*)`);

    const newArr = otherOutPutArr.filter(code => code !== data);
    setOtherOutPutArr(newArr);
  };

  /**
   * @description:
   * @return {*}
   */
  const getSubFormValues = async () => {
    const formValues = await subForm(formOutPut, otherOutPutArr, mainOutPut);
    if (onOk) {
      await onOk(formValues);
    }
  };

  useEffect(() => {
    formOutPut.setFieldState('superiorAmountAndUnit', {
      visible: !!parentNodeName,
      title: (
        <CommonTitleTooltip
          title={I18N.template(I18N.carbonFootprint3.paren, {
            val1: parentNodeName,
          })}
          tooltip={FOOTPRINT3_TOOLTIP_DETAIL.USEAMOUNT}
        />
      ),
    });
    formOutPut.setFieldState('noData', {
      visible: !parentNodeName,
    });
  }, [parentProcessNodeInfo, parentProcessNodeInfoName]);

  useEffect(() => {
    formOutPut.setFieldState('', {});
  }, []);

  /** 动态添加其他产出物的上级名称 */
  useEffect(() => {
    if (otherOutPutArr) {
      otherOutPutArr.forEach(arr => {
        const formOtherKey = `otherOutPut${arr}`;
        const getType = formOutPut.getValuesIn(`${formOtherKey}.type`);

        if (
          getType !== PROCESS_PRODUCT_TYPE.RECYCLED &&
          parentNodeName !== 'undefined'
        ) {
          formOutPut.setFieldState(
            [`${formOtherKey}`, 'superiorAmountAndUnit'],
            {
              visible: !!parentNodeName,
              title: (
                <CommonTitleTooltip
                  title={I18N.template(I18N.carbonFootprint3.paren, {
                    val1: parentNodeName,
                  })}
                  tooltip={FOOTPRINT3_TOOLTIP_DETAIL.USEAMOUNT}
                />
              ),
            },
          );

          if (parentNodeName) {
            formOutPut.setValuesIn(
              [`${formOtherKey}`, 'parentNodeName'],
              parentNodeName,
            );
          }
        }
      });
    }
  }, [otherOutPutArr, parentProcessNodeInfo, parentProcessNodeInfoName]);

  /**
   * 基本信息 名称输入框输入后动态获取因子信息
   * @param newName 名称
   */
  const onBasicNameChange = async (newName: string, parentKey: string) => {
    // 只有回用产出物才会 自动匹配排放因子
    const formProductParentTypeValue = formOutPut.getValuesIn(
      `${parentKey}.type`,
    );

    // 如果因子为手动填写也返回 - 手动填写的因子更改名称不自动匹配因子
    if (
      formOutPut.getValuesIn(`${parentKey}.factorObj.matchWay`) ===
      FACTOR_CREATE
    )
      return;

    // 不等于回用产品都将返回
    if (formProductParentTypeValue !== RECYCLED) return;

    // 没有更改表单直接返回
    if (!formOutPut.modified) return;

    // 名称相同不触发
    if (formOutNameUseRef.current[parentKey] === newName) return;

    formOutNameUseRef.current[parentKey] = newName;
    const fieldPath = `${parentKey}.factorObj`;
    try {
      // 只有排放源名称更改后才会自动匹配 不论是否已经存在因子 - 3.5.5测试用例评审更改需求 10-08
      setAutoMatchFactorLoading(true);
      const { data } = await postAutoMatchFactor({
        name: newName,
        factorType: '3',
        productId: GetLocalStorageProductId(),
      });
      if (data.data) {
        const [numeratorUnit, denominatorUnit] = (data.data.unit || '').split(
          '/',
        );

        const formFactorObjValue = formOutPut.getValuesIn(fieldPath);
        formOutPut.setValuesIn(fieldPath, {
          ...formFactorObjValue,
          ...data.data,
          numeratorUnit,
          denominatorUnit,
          matchWay: FACTOR,
        });
        formOutPut.setValuesIn(`${parentKey}.matchWay`, FACTOR);
      } else {
        formOutPut.setValuesIn(fieldPath, undefined);
      }
    } catch (e) {
      formOutPut.setValuesIn(fieldPath, undefined);
    } finally {
      setAutoMatchFactorLoading(false);
    }
  };

  useEffect(() => {
    // 如果存在初始化的value则设置回显
    if (initValues) {
      initOutPutDrawerFormValues(formOutPut, initValues, isOnlyDetail).then(
        ({ mainInitOutPut, otherInitOutPut }) => {
          setMainOutPut(mainInitOutPut);
          setOtherOutPutArr(otherInitOutPut);
        },
      );
    }
  }, [initValues]);

  useUnmount(() => {
    formOutNameUseRef.current = {};
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
      onClose={() => {
        if (onCancel) {
          onCancel();
        }
      }}
    >
      <div className={styleCarbonFootprint3.carbonFootprint3}>
        <div className={styles.accessoryDrawer}>
          <div className={styles.paddingMain} style={{ paddingTop: 0 }}>
            <Spin spinning={loading}>
              <FormilyCommon form={formOutPut}>
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
                    {mainOutPut && (
                      <Panel
                        forceRender
                        header={I18N.carbonFootprint3.mainProducts}
                        key={999}
                      >
                        <SchemaField
                          schema={getAccessoryMainOutPutSchema(isProcess)}
                          scope={{
                            useFieldUnitDictSource,
                            useFieldSetValueByLabel,
                          }}
                        />
                      </Panel>
                    )}

                    {otherOutPutArr.map(data => (
                      <Panel
                        forceRender
                        header={
                          <>
                            <span>{I18N.carbonFootprint3.otherOutputs}</span>
                            {!isOnlyDetail && (
                              <IconFont
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  fontSize: 16,
                                  cursor: 'pointer',
                                }}
                                type='icon-icon-shanshu-2'
                                onClick={() => removeOtherOutPut(data)}
                              />
                            )}
                          </>
                        }
                        key={data}
                      >
                        <Spin spinning={autoMatchFactorLoading}>
                          <SchemaField
                            schema={getAccessoryOtherOutPutSchema(
                              data,
                              onBasicNameChange,
                              {
                                isProcess,
                                isRoot,
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
                    onClick={addOtherOutPutFun}
                    className={styles.addProductText}
                  >
                    {I18N.carbonFootprint3.addOutput2}
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

export default AccessoryOutPutDrawer;
