/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-empty */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-05 10:20:48
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-06 23:38:03
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
import {
  createForm,
  ObjectField,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import FormilyButtonSelect from '@src/components/FormilyUtil/FormilyButtonSelect';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import SearchModalFactor from '@src/components/SearchFactor/ModalFactor';
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import useFieldSetValueByLabel from '@src/hooks/useFieldSetValueByLabel';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import {
  getProcessAccountProduct,
  postProcessAccountProductAdd,
  postProcessAccountProductEdit,
} from '@src/views/carbonFootprint3/ProcessBusinessAccounting/service';
import ModalProcessLib from '@src/views/carbonFootprint3/component/ProcessLibProductSelect/ModalProcessLib';
import { ProcessProduct } from '@src/views/carbonFootprint3/component/ProcessLibProductSelect/type';
import CarbonFootprint3UploadFile from '@src/views/carbonFootprint3/component/uploadFile';
import styleCarbonFootprint3 from '@src/views/carbonFootprint3/index.module.less';
import {
  AddFileData,
  AddFileDataAndUid,
} from '@src/views/carbonFootprint3/type';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import {
  useMemo,
  useEffect,
  useRef,
  useImperativeHandle,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

import {
  URL_PARAMS_KEY,
  PROCESS_PRODUCT_TYPE,
  PROCESS_PRODUCT_TYPE_LABEL,
  MATCH_WAY,
  PROCESS_LIB_ACCESSORY,
} from '../../constant';
import {
  postProcessLibProductAdd,
  getProcessLibProduct,
  postProcessLibProductEdit,
  getCheckProcessProduct,
} from '../../service';
import { ProcessLibProduct as ProcessLibProductType } from '../../type';
import {
  genProductBasicSchema,
  genMatchWaySchema,
  genFactorOrProcessSchema,
  calcUnitRate,
  onFieldsValueChange,
  deleteUrlSearchParams,
  getUnitValueByLabel,
} from '../../utils';
import { ProcessLibProductAddProps } from '../ProcessLibInOutTab/type';
import styles from '../index.module.less';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Radio,
    Cascader,
    FormilyButtonSelect,
    DatePicker,
  },
});

const ProcessLibProductTSX = (props: ProcessLibProductAddProps) => {
  const {
    isEdit,
    productId,
    processLibName,
    cRef,
    formValuesString,
    isProcessBusinessAccount,
    processTreeInfo,
  } = props;

  const childRef = useRef<{ subFilesData: () => AddFileData[] }>(null);

  const location = useLocation();

  const paramsQuery = new URLSearchParams(location.search);

  const processLibId = props.id;

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileData[]>([]);

  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    if (formValuesString) return formValuesString;
    return undefined;
  });

  const isCancel = paramsQuery.get(URL_PARAMS_KEY.IS_CANCEL) === 'true';

  const formStatusRef = useRef({ dataInitializing: false });

  const [showModalFactor, setShowModalFactor] = useState(false);

  const [showModalProcess, setShowModalProcess] = useState(false);

  const [productName, setProductName] = useState<string>();

  const [factorName, setFactorName] = useState<string>();

  const form = useMemo(
    () =>
      createForm<ProcessLibProductType>({
        validateFirst: true,
        readPretty: !isEdit,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        effects(form) {
          onFieldInputValueChange('matchWay', () => {
            (form.query('factorObj').take() as ObjectField)?.reset();
            (form.query('processProduct').take() as ObjectField)?.reset();
          });
          onFieldValueChange('unitCode', () => {
            if (!formStatusRef.current.dataInitializing) {
              calcUnitRate(form);
            }
          });
          onFieldValueChange('factorObj.denominatorUnit', () => {
            if (!formStatusRef.current.dataInitializing) {
              calcUnitRate(form);
            }
          });
          onFieldValueChange('processProduct.unitCode', () => {
            if (!formStatusRef.current.dataInitializing) {
              calcUnitRate(form);
            }
          });
        },
      }),
    [isEdit],
  );

  const submit = async () => {
    try {
      const {
        processLibName: processLibNameValue,
        factorObj,
        processProduct,
        ...formValues
      } = await form.submit<
        ProcessLibProductType & { processLibName: string }
      >();

      let rate: number | string | undefined;

      if (factorObj) {
        // 选择因子or新建因子
        rate = ((factorObj as unknown as { rate: string }) || {}).rate;
        Object.assign(factorObj || {}, {
          ...factorObj,
          unit: `${form.getValuesIn(['factorObj', 'numeratorUnit'])}/${
            (
              form.getFieldState(['factorObj', 'denominatorUnit'])
                .inputValues as {
                label: string;
              }[][]
            )?.[1]?.[1].label
          }`,
          numeratorUnit: undefined,
          denominatorUnit: undefined,
          rate: undefined,
        });
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
        unitCode: (formValues.unitCode as unknown as string[])[1],
        unitName: (
          form.getFieldState('unitCode')?.inputValues as {
            label: string;
          }[][]
        )?.[1]?.[1]?.label,
        rate,
        factorObj,
        processProduct,
        files:
          isProcessBusinessAccount && isEdit
            ? childRef.current?.subFilesData()
            : [],
      };

      if (!productId || productId === null) {
        if (isProcessBusinessAccount && processTreeInfo) {
          await postProcessAccountProductAdd({
            ...productData,
            accountId: processLibId,
            processId: processTreeInfo.dataId,
          });
        } else {
          await postProcessLibProductAdd(productData);
        }
        Toast('success', I18N.carbonFootprint3.addProductAs);
      } else {
        isProcessBusinessAccount
          ? await postProcessAccountProductEdit(productData)
          : await postProcessLibProductEdit(productData);
        Toast('success', I18N.carbonFootprint3.editProductInto);
      }
      return 'ok';
    } catch {}
    return undefined;
  };

  /**
   * @description: 选择因子的回调
   * @param {SerachCarbonFactorResult} data 选中的因子数据
   */
  const selectFactor = async (data: SerachCarbonFactorResult) => {
    const [numeratorUnit, denominatorUnit] = (data.unit || '').split('/');
    const [parentDenominatorUnitValue, denominatorUnitValue] =
      await getUnitValueByLabel(denominatorUnit);
    setFormValues({
      ...formValues,
      name: factorName,
      factorObj: {
        ...data,
        numeratorUnit,
        denominatorUnit: [parentDenominatorUnitValue, denominatorUnitValue],
      },
      matchWay: MATCH_WAY.FACTOR,
    });
    setShowModalFactor(false);
  };

  /**
   * @description: 选择过程库
   * @param {ProcessProduct} product 选中的过程
   */
  const selectFactorProcess = async (product: ProcessProduct) => {
    try {
      // 过程核算不需要该参数
      if (!isProcessBusinessAccount) {
        await getCheckProcessProduct({
          oldProcessId: processLibId,
          id: product.id,
        });
      }
      setFormValues({
        ...formValues,
        name: productName,
        processProduct: {
          ...(formValues?.processProduct || {}),
          processName: product.processName,
          productName: product.productName,
          accountYear: product.accountYear,
          unitName: product.unitName,
          unitCode: product.unitCode,
          type: product.type,
          id: product.id,
          processId: product.processId,
        },
        matchWay: MATCH_WAY.PROCESS_LIB,
      });
    } catch {}
    setShowModalProcess(false);
  };

  /**
   * 主动触发子组件表格更新
   */
  useImperativeHandle(cRef, () => ({
    okSub: async () => submit(),
    cancelSub: () => {},
  }));

  useEffect(() => {
    form.setValues({ processLibName, processId: processLibId });

    if (formValues) {
      try {
        form.setValues(formValues);

        // 设置支撑材料
        if (formValues.files) {
          const getFilesBack: AddFileData[] = formValues.files.map(
            (backFile: AddFileDataAndUid) => {
              const fileSuffx = backFile.name.split('.');
              return {
                ...backFile,
                suffix: fileSuffx[fileSuffx.length - 1],
              };
            },
          );
          setFileListBack(getFilesBack);
        }

        if (isCancel && formValues?.type === PROCESS_PRODUCT_TYPE.RECYCLED) {
          formStatusRef.current.dataInitializing = true;
          const baseUnitCodePath = 'unitCode';
          const unitCodePath =
            formValues?.matchWay === MATCH_WAY.PROCESS_LIB
              ? 'processProduct.unitCode'
              : 'factorObj.denominatorUnit';
          if (
            form.getValuesIn(baseUnitCodePath) &&
            form.getValuesIn(unitCodePath)
          ) {
            Promise.resolve().then(() => {
              onFieldsValueChange(
                form,
                [baseUnitCodePath, unitCodePath],
                () => {
                  formStatusRef.current.dataInitializing = false;
                  deleteUrlSearchParams(URL_PARAMS_KEY.IS_CANCEL);
                },
              );
            });
          } else {
            formStatusRef.current.dataInitializing = false;
            deleteUrlSearchParams(URL_PARAMS_KEY.IS_CANCEL);
          }
        }

        if (formValues.unitCode) {
          const unitCode = formValues.unitCode as string[];
          form.setFieldState('unitCode', {
            data: {
              value: unitCode[1],
            },
          });
        }

        if (formValues.processProduct) {
          const processProduct = formValues.processProduct as {
            unitCode: number | string;
          };
          form.setFieldState('processProduct.unitCode', {
            data: {
              value: processProduct.unitCode,
            },
          });
        }

        if (formValues.factorObj) {
          form.setFieldState('factorObj.denominatorUnit', {
            data: {
              value: formValues.factorObj.denominatorUnit?.[1],
            },
          });
        }

        // if (typeof productId === 'number') {
        //   if (formValues.type === PROCESS_PRODUCT_TYPE.RECYCLED) {
        //     form.setFieldState('type', { disabled: true });
        //   } else {
        //     form.setFieldState('type', {
        //       dataSource: [
        //         {
        //           value: PROCESS_PRODUCT_TYPE.MAIN,
        //           label: PROCESS_PRODUCT_TYPE_LABEL[PROCESS_PRODUCT_TYPE.MAIN],
        //         },
        //         {
        //           value: PROCESS_PRODUCT_TYPE.BY,
        //           label: PROCESS_PRODUCT_TYPE_LABEL[PROCESS_PRODUCT_TYPE.BY],
        //         },
        //       ],
        //     });
        //   }
        // }
      } catch {}
    } else if (productId && productId !== null) {
      (isProcessBusinessAccount
        ? getProcessAccountProduct({ id: productId })
        : getProcessLibProduct({ id: productId })
      ).then(resp => {
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
        } = resp?.data?.data || {};

        if (files) {
          setFileListBack(files);
        } else {
          setFileListBack([]);
        }

        if (type === PROCESS_PRODUCT_TYPE.RECYCLED) {
          formStatusRef.current.dataInitializing = true;
          Promise.resolve().then(() => {
            onFieldsValueChange(
              form,
              [
                'unitCode',
                matchWay === MATCH_WAY.PROCESS_LIB
                  ? 'processProduct.unitCode'
                  : 'factorObj.denominatorUnit',
              ],
              () => {
                formStatusRef.current.dataInitializing = false;
              },
            );
          });
        }

        form.setValues({
          id,
          name,
          amount,
          type,
        });

        form.setFieldState('unitCode', {
          data: {
            value: unitCode,
          },
        });

        if (type === PROCESS_PRODUCT_TYPE.RECYCLED) {
          // 编辑产品类型初始为回用产品时，则产品类型不能变更
          form.setFieldState('type', { readPretty: true });
          if (factorObj) {
            form.setValues({
              matchWay,
              factorObj: {
                id: factorObj.id,
                name: factorObj.name,
                factor: factorObj.factor,
                numeratorUnit:
                  (factorObj.unit || '').split('/')[0] || undefined,
                rate,
                institution: factorObj.institution,
                year: factorObj.year,
              },
            });
            form.setFieldState('factorObj.denominatorUnit', {
              data: {
                label: (factorObj.unit || '').split('/')[1],
              },
            });
          }

          if (processProduct) {
            form.setValues({
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
            });

            form.setFieldState('processProduct.unitCode', {
              data: {
                value: processProduct.unitCode,
              },
            });
          }
        } else {
          // 编辑产品类型初始为主，复产品时，则产品类型不显示回用产品选项
          form.setFieldState('type', {
            dataSource: [
              {
                value: PROCESS_PRODUCT_TYPE.MAIN,
                label: PROCESS_PRODUCT_TYPE_LABEL[PROCESS_PRODUCT_TYPE.MAIN],
              },
              {
                value: PROCESS_PRODUCT_TYPE.BY,
                label: PROCESS_PRODUCT_TYPE_LABEL[PROCESS_PRODUCT_TYPE.BY],
              },
            ],
          });
        }
      });
    }
  }, [form, processLibName, processLibId, formValues, productId]);

  return (
    <div
      className={classNames(
        styles.mainContainer,
        styleCarbonFootprint3.carbonFootprint3,
      )}
    >
      <FormilyCommon form={form}>
        <>
          <div className={styles.formSection}>
            <div className={styles.formTitle}>
              {I18N.carbonFootprint.basicInformation}
            </div>
            <SchemaField
              schema={genProductBasicSchema()}
              scope={{ useFieldUnitDictSource, useFieldSetValueByLabel }}
            />
          </div>
          <FormConsumer>
            {productForm =>
              productForm.getValuesIn('type') ===
                PROCESS_PRODUCT_TYPE.RECYCLED && isEdit ? (
                <div className={styles.splitBar} />
              ) : (
                ''
              )
            }
          </FormConsumer>
          <FormConsumer>
            {productForm =>
              productForm.getValuesIn('type') ===
              PROCESS_PRODUCT_TYPE.RECYCLED ? (
                <div className={styles.formSection}>
                  <div className={styles.formTitle}>
                    {I18N.carbonFootprint3.emissionData}
                  </div>
                  <div className={styles.btnContainer}>
                    <SchemaField
                      schema={genMatchWaySchema(PROCESS_LIB_ACCESSORY.PRODUCT)}
                    />
                    <FormConsumer>
                      {productFormBtn => {
                        const productType = productFormBtn.getValuesIn('type');
                        const productMatchWay =
                          productFormBtn.getValuesIn('matchWay');
                        if (
                          productType !== PROCESS_PRODUCT_TYPE.RECYCLED ||
                          productMatchWay === MATCH_WAY.FACTOR_CREATE ||
                          !isEdit
                        ) {
                          return '';
                        }

                        return (
                          <Button
                            type='primary'
                            onClick={() => {
                              if (productMatchWay === MATCH_WAY.FACTOR) {
                                setShowModalFactor(true);

                                setFactorName(form.values.name);
                              } else {
                                setShowModalProcess(true);
                                setProductName(form.values.name);
                              }
                            }}
                          >
                            {productMatchWay === MATCH_WAY.FACTOR
                              ? I18N.carbonFootprint3.chooseEmissionFactors
                              : I18N.carbonFootprint3.selectProcessLibrary2}
                          </Button>
                        );
                      }}
                    </FormConsumer>
                  </div>
                  <SchemaField
                    schema={genFactorOrProcessSchema(
                      PROCESS_LIB_ACCESSORY.PRODUCT,
                    )}
                    scope={{ useFieldUnitDictSource, useFieldSetValueByLabel }}
                  />
                </div>
              ) : (
                ''
              )
            }
          </FormConsumer>

          <div className={styles.formSection}>
            <FormConsumer>
              {() =>
                isProcessBusinessAccount ? (
                  // <div className={styles.formTitle}>支撑材料</div>
                  <>
                    <div className={styles.formTitle}>
                      {I18N.carbonFootprint3.supportingMaterials}
                    </div>
                    <div
                      style={{
                        color: '#999EA4',
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      {I18N.carbonFootprint3.supportPdf}
                    </div>
                    <CarbonFootprint3UploadFile
                      col={24}
                      cRef={childRef}
                      isDetail={!isEdit}
                      fileListBack={fileListBack}
                    />
                  </>
                ) : (
                  ''
                )
              }
            </FormConsumer>
          </div>
        </>
      </FormilyCommon>
      <Modal
        title={I18N.carbonFootprint3.chooseEmissionFactors}
        width={1200}
        maskClosable={false}
        key={`${uniqueId(factorName)}}`}
        getContainer={false}
        open={showModalFactor}
        footer={null}
        style={{
          top: 50,
        }}
        bodyStyle={{
          paddingBottom: 0,
        }}
        onCancel={() => setShowModalFactor(false)}
      >
        <SearchModalFactor
          subClick={selectFactor}
          factorName={factorName}
          onCancel={async () => {
            setShowModalFactor(false);
          }}
        />
      </Modal>
      <Modal
        title={I18N.carbonFootprint3.selectionProcess}
        width={1200}
        maskClosable={false}
        getContainer={false}
        key={`${uniqueId(productName)}}`}
        open={showModalProcess}
        footer={null}
        style={{
          top: 50,
        }}
        bodyStyle={{
          paddingBottom: 0,
        }}
        onCancel={() => setShowModalProcess(false)}
      >
        <ModalProcessLib
          processLibId={processLibId}
          onCancel={() => {
            setShowModalProcess(false);
          }}
          processProductParams={{
            productName,
          }}
          onConfirm={selectFactorProcess}
        />
      </Modal>
    </div>
  );
};

export default ProcessLibProductTSX;
