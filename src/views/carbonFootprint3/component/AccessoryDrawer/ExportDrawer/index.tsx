/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-01 19:43:40
 * @Date: 2023-05-17 17:57:42
 * @@description:
 */
/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-22 09:54:17
 * @Date: 2023-03-14 09:44:19
 * @@description: 输出
 */
import { PlusOutlined } from '@ant-design/icons';
import {
  FormItem,
  FormGrid,
  Input,
  Select,
  Radio,
  Cascader,
  DatePicker,
} from '@formily/antd-v5';
import {
  createForm,
  Field,
  ObjectField,
  onFieldInputValueChange,
} from '@formily/core';
import { createSchemaField } from '@formily/react';
import { listALLByDictTypeBatch } from '@src/api/api';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import IconFont, { IconAlibaba } from '@src/components/iconfont';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource, {
  Dicts,
} from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import ModalEmissionSourceTable from '@src/views/carbonFootprint3/component/EmissionSourceTable/ModalEmissionSource';
import FormilyFileUpload from '@src/views/carbonFootprint3/component/FormilyFileUpload';
import FormilySelectAndButton from '@src/views/carbonFootprint3/component/FormilySelectAndButton';
import ImportFileModal from '@src/views/carbonFootprint3/component/ImportFileModal';
import {
  getFileOutImportApi,
  postFileImportProcessOutApi,
} from '@src/views/carbonFootprint3/component/ImportFileModal/service';
import {
  ImportParams,
  OutImportTableList,
} from '@src/views/carbonFootprint3/component/ImportFileModal/type';
import { FOOTPRINT3_IMPORT_MODAL_FILE_KEY } from '@src/views/carbonFootprint3/constant';
import { OptionsTypesData } from '@src/views/carbonFootprint3/type';
import { Button, Collapse, Drawer, Modal, Spin } from 'antd';
import { omit } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { getProcessOutPutSchema } from './schema';
import { getFormDataByTypeApi } from './service';
import { AccessoryExportDrawerProps } from './type';
import { initExportDrawerForm, subForm } from './util';
import styleCarbonFootprint3 from '../../../index.module.less';
import { CustomInput } from '../../formily/input';
import AccessoryFooterDrawer from '../FooterDrawer';
import { AccessoryProductData } from '../ProductDrawer/type';
import styles from '../index.module.less';
import '../index.less';
import { calcUnitRate } from '../utils';

const { Panel } = Collapse;

const AccessoryExportDrawer = ({
  isEdit,
  isOnlyDetail,
  isProcess,
  visible,
  accountId,
  processId,
  initValues,
  loading,
  onCancel,
  onOk,
}: AccessoryExportDrawerProps) => {
  const title = isEdit
    ? I18N.carbonFootprint3.editOutput
    : I18N.carbonFootprint3.outputDetails;

  const [outsArr, setOutsArr] = useState<number[]>([]);

  const form = useMemo(
    () =>
      createForm({
        readPretty: !!isOnlyDetail,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        effects(form) {
          onFieldInputValueChange('*.matchWay', field => {
            // 原先没有用ArrayField，只能通过这种方式拿到“index”
            const indexKey = (field.path.entire as string).split('.')[0];
            (
              form.query(`${indexKey}.factorObj`).take() as ObjectField
            )?.reset();
            (
              form
                .query(`${indexKey}.factorObj.denominatorUnit`)
                .take() as Field
            )?.setData({});
          });
        },
      }),
    [visible],
  );

  /** 被激活的展开面板 */
  const [collapseKeys, setCollapseKeys] = useState<number[]>([]);

  /** 下载模版 - 模版地址 */
  const [downLoadTemplateUrl, setDownLoadTemplateUrl] = useState<string>('');

  /** 导入文件弹框显示 */
  const [importFileVisible, setImportFileVisible] = useState(false);

  /** 导入输出文件的查询参数 */
  const [searchImportParams] = useState<ImportParams>({
    pageNum: 1,
    pageSize: 10,
    type: 1,
    module: `${accountId}`,
  });

  /** 排放源中的搜索类别 */
  const [emissionOptions, setEmissionOptions] = useState<OptionsTypesData[]>(
    [],
  );

  /** 选择输出弹框的显隐控制 */
  const [emissionSourceModalVisible, setEmissionSourceModalVisible] =
    useState(false);

  /** 选择输出当前选择的是哪个展开的输出 - 通过下标来进行区分 */
  const [selectOutBtnIndex, setSelectOutBtnIndex] = useState<number>();

  const SchemaField = createSchemaField({
    components: {
      FormItem,
      FormGrid,
      Input,
      Select,
      Radio,
      Cascader,
      FormilySelectAndButton,
      FormilyFileUpload,
      DatePicker,
      CustomInput,
    },
  });

  /**
   * @description: 给自动获取单位换算比例添加字段监听
   * @param {string} key 要监听的字段关键字
   */
  const addFormFieldEffect = (key: string) => {
    const fieldKey = `outArr${key}`;
    // const fieldKeyEffectId = `outEffect${key}`;

    // 添加新的输出的时候，将输出类型也赋值进去
    if (emissionOptions && emissionOptions.length > 0) {
      form.setFieldState([fieldKey, 'type'], {
        dataSource: emissionOptions,
        value: emissionOptions[0].value,
      });
    }
  };

  /**
   * @description: 添加输出
   */
  const addOutputFun = () => {
    const backArr = [...outsArr];
    const lastIndex = outsArr.length > 0 ? outsArr.length - 1 : 0;
    if (outsArr.length === 0) {
      backArr.push(1001);
      addFormFieldEffect(`${1001}`);
      setCollapseKeys([...collapseKeys, 1001]);
    } else {
      const key = outsArr[lastIndex] + 1;
      backArr.push(key);
      addFormFieldEffect(`${key}`);
      setCollapseKeys([...collapseKeys, key]);
    }

    setOutsArr(backArr);
  };

  const changeCollapse = (key: number[]) => {
    setCollapseKeys(key);
  };

  /**
   * @description: 删除输出
   * @param {number} data 要被删除的code
   */
  const removeOuput = (data: number) => {
    const fieldKey = `outArr${data}`;

    form.clearFormGraph(`* (${fieldKey},${fieldKey}.*)`);

    const newArr = outsArr.filter(code => code !== data);
    setOutsArr(newArr);
  };

  /**
   * @description: 设置输出的form表单值
   * @param {AccessoryProductData} data 接口返回的值
   * @param {number} arrIndex 自动生成的标识
   */
  const setOutFormValues = (
    data: AccessoryProductData,
    arrIndex: number,
    typeData?: { label: string; value: number }[],
  ) => {
    const formOtherKey = `outArr${arrIndex}`;
    const {
      id,
      name,
      matchWay,
      amount,
      unitCode,
      type,
      rate,
      matchObject,
      processProduct,
      files,
      typeExtra,
    } = data;

    let { factorObj } = data;

    form.setValues({
      processLibId: accountId,
      [formOtherKey]: {
        id,
        name,
        amount,
        type,
        matchWay,
        files,
        typeExtra,
      },
    });

    // 选择输出 - 排放源旧版本中没有factor用的是matchObject 所以要将matchObject赋值过去
    if (!factorObj && matchObject) {
      factorObj = matchObject;
    }

    // 动态设置输出的类型 - 默认为第一个废气
    if (typeData) {
      form.setFieldState([formOtherKey, 'type'], {
        dataSource: typeData,
        value: Number(type) || typeData[0].value,
      });
    }

    form.setFieldState([formOtherKey, 'unitCode'], {
      data: {
        value: unitCode,
      },
    });

    if (factorObj) {
      form.setValues({
        [formOtherKey]: {
          factorObj: {
            id: factorObj.id,
            name: factorObj.name,
            factor: factorObj.factor,
            numeratorUnit: (factorObj.unit || '').split('/')[0] || undefined,
            rate,
            institution: factorObj.institution,
            year: factorObj.year,
            unit: factorObj.unit,
            factorPattern: factorObj.factorPattern,
            ecoinventValueVisible: factorObj.ecoinventValueVisible,
          },
        },
      });
      form.setFieldState([formOtherKey, 'factorObj', 'denominatorUnit'], {
        data: {
          label: (factorObj.unit || '').split('/')[1],
        },
      });
    }

    if (processProduct) {
      form.setValues({
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

      form.setFieldState([formOtherKey, 'processProduct', 'unitCode'], {
        data: {
          value: processProduct.unitCode,
        },
      });
    }
  };

  /**
   * @description: 选择输出的按钮点击
   * @param {number} outArrIndex
   * @return {*}
   */
  const selectOutBtnClick = (outArrIndex: number) => {
    setEmissionSourceModalVisible(true);
    setSelectOutBtnIndex(outArrIndex);
  };

  /**
   * @description: 选择输出的确认弹框回调
   * @param {Record} emission 当前选择的排放源
   */
  const selectEmissionSource = async (emission: Record<string, any>) => {
    if (selectOutBtnIndex || selectOutBtnIndex === 0) {
      // 去除掉对象中的id属性
      const omitDataById = omit(emission, ['id']);

      await setOutFormValues(
        omitDataById as AccessoryProductData,
        selectOutBtnIndex,
      );
      setEmissionSourceModalVisible(false);
      setTimeout(() => {
        form.validate();
      }, 200);
    }
  };

  /**
   * @description: 取消弹框的展示
   */
  const onCancelImportFile = () => {
    setImportFileVisible(false);
  };

  /**
   * @description: 导入文件后的回调方法
   */
  const importFileRequestBack = async (url: string, fileName?: string) => {
    const { data } = await postFileImportProcessOutApi(
      { fileUrl: url, fileName },
      {
        accountId: `${accountId}`,
        processId: `${processId}`,
      },
    );

    return { code: data.code };
  };

  /**
   * @description: 设置从接口拿到的输出类型
   */
  const getOptionTypeData = async () => {
    // 设置输出类型
    const typeData = await getFormDataByTypeApi();
    setEmissionOptions(typeData.data.data);
    return typeData.data.data;
  };

  /**
   * @description: 提交输出表单前进行字段校验，然后将错误字段展开
   */
  const subFormBeforeValidate = async () => {
    try {
      await form.validate();
    } catch (error: any) {
      const errorArr: { path: string }[] = error;
      let indexArr: number[] = [];
      if (errorArr && errorArr.length > 0) {
        indexArr = errorArr.map(arr => {
          const pathString = arr.path.split('.');
          const pathStringArr =
            pathString && pathString.length > 0 ? pathString[0] : undefined;
          const indexNumberArr = pathStringArr
            ? pathStringArr.split('outArr')
            : undefined;
          return indexNumberArr ? Number(indexNumberArr[1]) : 0;
        });

        setCollapseKeys(indexArr);
      }
    }
  };

  const init = async () => {
    const dic = await listALLByDictTypeBatch<{
      footprint3_export_template: Dicts[];
    }>({
      dictTypes: 'footprint3_export_template',
    });
    const { footprint3_export_template } = dic.data.data;

    const getExportData = footprint3_export_template.find(
      ex =>
        ex.dictValue === FOOTPRINT3_IMPORT_MODAL_FILE_KEY.PROCESS_ACCOUNT_OUT,
    );

    if (getExportData && getExportData.relatedValue) {
      setDownLoadTemplateUrl(getExportData.relatedValue);
    }
  };

  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (initValues) {
      getOptionTypeData().then(async optionsType => {
        const { exportArrs, collapseKeys: keysArr } =
          await initExportDrawerForm(accountId, form, optionsType, initValues);
        setCollapseKeys(keysArr);
        setOutsArr(exportArrs);
      });
    }
  }, [initValues]);

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
          onSubClick={async () => {
            await subFormBeforeValidate();
            const backArr = await subForm(form, outsArr);
            onOk && (await onOk(backArr));
          }}
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
          <div className={styles.paddingMain}>
            <div className={`${styles.titleMain} m-b-10`}>
              <div className={styles.titleStyle}>
                {I18N.carbonFootprint3.outputInformation}
              </div>
              {!isProcess && !isOnlyDetail && (
                <Button
                  icon={
                    <IconAlibaba
                      type='icon-icon_daoru'
                      style={{ fontSize: 16 }}
                    />
                  }
                  onClick={async () => {
                    setImportFileVisible(true);
                  }}
                >
                  {I18N.carbonFootprint3.importOutput}
                </Button>
              )}
            </div>
            <Spin spinning={loading}>
              <FormilyCommon form={form}>
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
                    {outsArr.map(data => (
                      <Panel
                        forceRender
                        header={
                          <>
                            <span>{I18N.carbonFootprint3.output}</span>
                            {collapseKeys.includes(data) && !isOnlyDetail && (
                              <Button
                                type='primary'
                                className={styles.outsArrSelect}
                                icon={<PlusOutlined />}
                                onClick={async e => {
                                  e.stopPropagation();
                                  selectOutBtnClick(data);
                                }}
                              >
                                {I18N.carbonFootprint3.selectOutput}
                              </Button>
                            )}

                            {!isOnlyDetail && (
                              <IconFont
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: 16,
                                  fontSize: 16,
                                  cursor: 'pointer',
                                }}
                                type='icon-icon-shanshu-2'
                                onClick={() => removeOuput(data)}
                              />
                            )}
                          </>
                        }
                        key={data}
                      >
                        <SchemaField
                          schema={getProcessOutPutSchema(data, {
                            isProcess,
                            onUnitChange: async () => {
                              await calcUnitRate({
                                form,
                                baseUnitFieldPath: [
                                  `outArr${data}`,
                                  'unitCode',
                                ],
                                unitFieldPath: [
                                  `outArr${data}`,
                                  'factorObj.denominatorUnit',
                                ],
                                rateFieldPath: [
                                  `outArr${data}`,
                                  'factorObj.rate',
                                ],
                              });
                            },
                          })}
                          scope={{
                            useFieldUnitDictSource,
                            useFieldSetValueByLabel,
                          }}
                        />
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              </FormilyCommon>
              {!isOnlyDetail && (
                <div className={styles.addProductMain}>
                  <IconFont type='icon-icon_add_fill2' />

                  <span
                    onClick={addOutputFun}
                    className={styles.addProductText}
                  >
                    {I18N.carbonFootprint3.addOutput}
                  </span>
                </div>
              )}
            </Spin>
          </div>
        </div>
        <ImportFileModal<OutImportTableList, ImportParams>
          title={I18N.carbonFootprint3.importOutput}
          visible={importFileVisible}
          onCancelBack={onCancelImportFile}
          downLoadTemplateUrl={downLoadTemplateUrl}
          importFileRequestBack={importFileRequestBack}
          searchParamsData={searchImportParams}
          getFileListRequest={getFileOutImportApi}
        />
        <Modal
          title={I18N.carbonFootprint3.selectOutput}
          width={1200}
          maskClosable={false}
          getContainer={false}
          open={emissionSourceModalVisible}
          footer={null}
          style={{
            top: 50,
          }}
          bodyStyle={{
            paddingBottom: 0,
          }}
          onCancel={() => setEmissionSourceModalVisible(false)}
        >
          <ModalEmissionSourceTable
            onCancel={async () => setEmissionSourceModalVisible(false)}
            onConfirm={selectEmissionSource}
            options={emissionOptions}
          />
        </Modal>
      </div>
    </Drawer>
  );
};

export default AccessoryExportDrawer;
