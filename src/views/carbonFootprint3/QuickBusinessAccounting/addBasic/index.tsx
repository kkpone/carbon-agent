/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 20:11:44
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 15:28:37
 * @Date: 2023-01-05 11:02:01
 * @@description: 快速核算 - 新增核算基本信息
 */
import { PlusOutlined } from '@ant-design/icons';
import {
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
  DatePicker,
  Radio,
  Cascader,
  Space,
} from '@formily/antd-v5';
import {
  createForm,
  Field,
  Form,
  onFieldChange,
  onFormInit,
  onFormUnmount,
} from '@formily/core';
import { createSchemaField } from '@formily/react';
import { listALLByDictTypeBatch } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { JavaUpload } from '@src/components/Upload/JavaUpload';
import IconFont from '@src/components/iconfont';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { AddFileDataAndUid } from '@src/views/carbonFootprint/xproductManagement/add/type';
import { Dicts } from '@src/views/emission/Show/type';
import { Button, Spin, Steps } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { cloneDeep, throttle } from 'lodash-es';
import {
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory, useParams } from 'react-router-dom';

import styles from './index.module.less';
import { quickBusinessAccountingBasicSchema } from './model';
import { BusinessAccountingModelTableData } from '../../BusinessAccountingModel/type';
import { getProductLibraryTableData } from '../../ProductManagement/service';
import { ProductLibraryTableData } from '../../ProductManagement/type';
import FormilySystemBoundaryRadio from '../../component/FormilySystemBoundaryRadio';
import TextWidthOverflow from '../../component/TextOverflowTable/byWidth';
import styleCarbonFootprint3 from '../../index.module.less';
import {
  ACCOUNT_DISPLAY_TYPE,
  STEP_OPTION,
  URL_PARAMS_KEY,
  URL_QUICK_ACCOUNT_KEY,
} from '../constant';
import {
  getQuickBusinessAccountingInfo,
  postQuickBusinessAccountingBasic,
  postQuickBusinessAccountingCopyAndView,
  postQuickBusinessAccountingCopyBasic,
  postQuickBusinessAccountingEditBasic,
  postQuickBusinessAccountingSaveAndView,
} from '../service';
import {
  QuickBusinessAccountingAddBasic,
  QuickBusinessAccountingAddBasicForm,
  QuickBusinessAccountingInfo,
} from '../type';
import { checkQuickAccountEditPermissions } from '../utils';

const QuickBusinessAccountingBasic: ForwardRefRenderFunction<
  { isEdit: boolean },
  {
    id?: string;
    managementFill?: boolean;
    isDetails?: boolean;
    modalDetail?: boolean;
    onEditSuccess?: (toView?: boolean) => Promise<void>;
    modeling?: () => Promise<void>;
  }
> = (props, ref) => {
  // 弹框展示详情
  const { modalDetail, isDetails, onEditSuccess, modeling, managementFill } =
    props;

  let { id } = useParams<{ id: string }>();
  if (props.id) id = props.id;

  const paramsQuery = new URLSearchParams(location.search);

  const modelInfo = paramsQuery.get(URL_QUICK_ACCOUNT_KEY.SELECT_MODEL_LIST);

  const history = useHistory();

  const { pathname } = history.location;
  /** 是否是编辑状态 */
  // const isEdit = pathname.includes('edgetQuickBusinessAccountingInfoit');
  /** 是否是复制状态 */
  const isCopy = pathname.includes('copy');

  /** 基本信息 */
  const [Basic, setBasic] = useState<QuickBusinessAccountingInfo>();

  /** 单位的字典值 */
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);

  /** 主内容的加载中 */
  const [mainLoading, setMainLoading] = useState<boolean>(false);

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileDataAndUid[]>([]);

  // 核算产品输入值不存在的时候显示输入值
  const productSearchRef = useRef<{
    productSearchValue: string;
  }>({ productSearchValue: '' });

  /** 产品列表 */
  const [productLibraryList, setProductLibraryList] = useState<
    ProductLibraryTableData[]
  >([]);

  const [isEdit, setIsEdit] = useState(false);

  // fixme 这个场景有问题
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editLoading, setEditLoading] = useState(false);

  /**
   * @description: 新增情况下初始化回显
   * @return {object}
   */
  const initSelectFormVal = () => {
    if (modelInfo) {
      const modelInfoParse: BusinessAccountingModelTableData =
        JSON.parse(modelInfo);
      return {
        scope: modelInfoParse.scope,
        accountName: modelInfoParse.accountName,
      };
    }
    return {};
  };

  /**
   * @description: 被节流的函数
   */
  const throttleFunc = throttle(
    async (form: Form<any>) => {
      if (
        form.getFieldState('amount') &&
        form.getFieldState('unitData') &&
        form.getFieldState('productCode')
      ) {
        const amountVal = form.getFieldState('amount').value;
        const unitDataVal = form.getFieldState('unitData').value;
        const productCodeval = form.getFieldState('productCode').value;
        const accountNameval = form.getFieldState('accountName').value;

        // 不存在功能单位的情况下才会自动生成 - 最低标准是必须存在核算数量的值
        if (!accountNameval && unitDataVal && amountVal && productCodeval) {
          // 功能单位的名称
          let accountName = '';
          if (amountVal) {
            accountName = amountVal;
          }

          // 获取单位信息和产品信息
          if (form.getFieldState('unitData').inputValues) {
            const unitDicts = form.getFieldState('unitData')
              .inputValues as Dicts[];
            accountName = `${accountName}${
              unitDicts.length > 0 ? unitDicts[1][1].dictLabel : ''
            }`;
          }

          // 获取核算产品名称
          if (productCodeval) {
            const productData = form.getFieldState('productCode')
              .dataSource as { label: string; value: string }[];
            const productName = productData.find(
              data => data.value === productCodeval,
            );
            accountName = `${accountName}${
              productName ? productName.label : ''
            }`;
          }

          form.setFieldState('accountName', {
            value: accountName,
          });
        }
      }
    },
    1000,
    {
      leading: true,
      trailing: true,
    },
  );

  /**
   * @description: 异步获取产品数据源
   * @param {Field} field
   */
  const useAsyncProductDataSource = () => (field: Field) => {
    field.loading = true;
    getProductLibraryTableData({ pageNum: 1, pageSize: 10000 }).then(back => {
      const enumData = back.data.data.rows;
      setProductLibraryList(enumData);
      field.dataSource = enumData.map(data => ({
        label: data.productName,
        value: data.productCode,
      }));
      field.loading = false;
    });
  };

  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = useMemo(
    () =>
      createForm({
        initialValues: initSelectFormVal(),
        effects() {
          onFormInit(async form => {
            form.addEffects('accountName', form => {
              // onFieldChange('amount', ['value'], () => {
              //   form.setFieldState('accountName', {
              //     loading: true,
              //   });

              //   // 暂停1s后再设置进去  因为没有onBlur事件
              //   setTimeout(() => {
              //     throttleFunc(form);
              //     form.setFieldState('accountName', {
              //       loading: false,
              //     });
              //   }, 1500);
              // });

              // 处理计算方式是产品重量，将公里转换为km
              onFieldChange('unitData', ['value'], () => {
                throttleFunc(form);
              });

              onFieldChange('productCode', ['value'], () => {
                throttleFunc(form);
              });

              onFieldChange('accountName', ['value'], (field, backForm) => {
                if (backForm.getValuesIn('accountName')) {
                  form.setFieldState('accountName', {
                    validator: [
                      {
                        required: true,
                      },
                      () => '',
                    ],
                  });
                  form.validate('accountName');
                }
              });
            });
          });

          onFormUnmount(form => {
            form.removeEffects('accountName');
          });
        },
      }),
    [],
  );
  // 创建一个 SchemaField 组件用于解析JSON-Schema动态渲染表单的组件
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      DatePicker,
      Select,
      Radio,
      Cascader,
      Space,
      FormilySystemBoundaryRadio,
    },
  });

  /**
   * @description: 提交表单
   */
  const subForm = async (options?: {
    apiKey: string;
    onSuccess?: () => void;
  }) => {
    const formData: QuickBusinessAccountingAddBasicForm = await form.submit();

    // 处理单位信息
    const unitInfo = cascaderOptions.find(
      dic => dic.dictValue === formData.unitData[1],
    );

    // 获取选中产品的详细信息
    const productInfo = productLibraryList.find(
      data => data.productCode === formData.productCode,
    );

    const customProductInfo = {
      productName: '',
      productCode: '',
    };
    // 如果没有查找到对应的信息 说明很有可能是自己输入的名称
    if (!productInfo && formData.productCode) {
      const productData = form.getFieldState('productCode').dataSource as {
        label: string;
        value: string;
      }[];
      const currentInfo = productData.find(
        currentData => currentData.value === formData.productCode,
      );
      if (currentInfo) {
        customProductInfo.productName = currentInfo.label;
        customProductInfo.productCode = currentInfo.value;
      }
    }

    if ((productInfo || customProductInfo) && unitInfo) {
      const subData: QuickBusinessAccountingAddBasic = {
        ...formData,
        type: 0,
        startTime: formData.dateTime[0],
        endTime: formData.dateTime[1],
        unitName: unitInfo.dictLabel,
        unitCode: unitInfo.dictValue,
        productName: productInfo
          ? productInfo.productName
          : customProductInfo.productName,
        productCode: productInfo
          ? productInfo.productCode
          : customProductInfo.productCode,
        productId: productInfo ? productInfo.id : undefined,
        files: fileListBack,
      };

      let keyVal = 'Add';

      // if (isEdit) keyVal = 'Edit';
      if (isCopy) keyVal = 'Copy';

      const statusKeyApi = {
        Add: postQuickBusinessAccountingBasic,
        Edit: postQuickBusinessAccountingEditBasic,
        Copy: postQuickBusinessAccountingCopyBasic,
        View: postQuickBusinessAccountingSaveAndView,
        CopyView: postQuickBusinessAccountingCopyAndView,
      };

      keyVal = options?.apiKey || keyVal;

      // 调用分类接口
      const addFormBack = await statusKeyApi[keyVal]({ ...subData, id });
      if (addFormBack.data.code === 200) {
        // 编辑情况下 - 不需要跳转下个页面
        // if (isEdit) {
        //   Toast('success', '编辑成功');
        //   history.goBack();
        //   return;
        // }

        if (typeof options?.onSuccess === 'function') {
          options.onSuccess();
          return;
        }

        let urlParams = '';
        if (keyVal === 'View' || keyVal === 'CopyView') {
          urlParams = `?${URL_PARAMS_KEY.STEP}=1&${URL_PARAMS_KEY.DISPLAY}=${ACCOUNT_DISPLAY_TYPE.VISUALIZATION}`;
        }
        // 进入核算管理
        history.push(
          `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagement}/${addFormBack.data.data}${urlParams}`,
        );
      } else if (
        addFormBack.data.code === 611 &&
        `${addFormBack.data.data}` === 'accountName'
      ) {
        form.setFieldState('accountName', {
          validator: [
            {
              required: true,
            },
            () => addFormBack.data.msg,
          ],
        });
        form.validate();
      }
    }
  };

  /**
   * @description: 初始化 - 设置回显值
   * @param {Dicts} dicts
   */
  const initInfoValue = async (dicts: Dicts[]) => {
    const back = await getQuickBusinessAccountingInfo({ id }, false);
    const { data } = back.data;
    const { files } = data;

    // 获取数量单位的code
    const child = dicts.find(op => op.dictValue === data.unitCode);
    const parent = dicts.find(op => op.dictValue === child?.sourceType);
    const unitData =
      parent && child ? [parent.dictValue, child.dictValue] : undefined;

    // 设置图片
    if (files instanceof Array) {
      const filesBack: AddFileDataAndUid[] = files.map(fileData => ({
        name: fileData.name,
        url: fileData.url,
        uid: `${fileData.id}`,
      }));
      setFileListBack(filesBack);
    }

    form.setValues({
      ...data,
      unitData,
      dateTime: [data.startTime, data.endTime],
    });

    setBasic(data);
  };

  /**
   * @description: 初始化编辑
   */
  // const initEdit = async (dicts: Dicts[]) => {
  //   await initInfoValue(dicts);
  // };

  /**
   * @description: 初始化编辑
   */
  const initCopy = async (dicts: Dicts[]) => {
    await initInfoValue(dicts);
  };

  /**
   * @description: 初始化编辑
   */
  const initDetail = async (dicts: Dicts[]) => {
    await initInfoValue(dicts);
    form.setFormState({
      readPretty: true,
    });
  };

  const init = async () => {
    setMainLoading(true);
    const dic = await listALLByDictTypeBatch<{ factorUnitM: Dicts[] }>({
      dictTypes: 'factorUnitM',
    });
    setCascaderOptions(dic.data.data.factorUnitM);

    // if (isEdit) {
    //   initEdit(dic.data.data.factorUnitM);
    // }

    if (isCopy) {
      initCopy(dic.data.data.factorUnitM);
    }

    if (modalDetail || isDetails) {
      initDetail(dic.data.data.factorUnitM);
    }
    setMainLoading(false);
  };

  const cancelEdit = () => {
    setIsEdit(false);
    init();
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isDetails) {
      form.setState({ readPretty: !isEdit });
      form.setFieldState('scope', {
        disabled: !isEdit,
      });
    }
  }, [isEdit, isDetails, form]);

  useImperativeHandle(
    ref,
    () => ({
      isEdit,
      setIsEdit,
      submit: async () => {
        await subForm({
          apiKey: 'Add',
          onSuccess: () => {
            Toast('success', I18N.carbonFootprint.editSuccessful);
          },
        });
      },
    }),
    [isEdit],
  );

  return (
    <div
      className={`${styleCarbonFootprint3.carbonFootprint3} ${styles.quickBusinessAccountingMain}`}
    >
      {!modalDetail && !isDetails && (
        <section className={styles.stepBox}>
          <div
            onClick={() => {
              // history.push(
              //   RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccounting,
              // );
              history.push(
                `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail}?productId=${Basic?.productId}`,
              );
            }}
            className={styles.stepBoxBack}
          >
            <IconFont
              type='icon-icon-zuojiantou'
              style={{ fontSize: 24, marginRight: 8 }}
            />
            <span>{I18N.carbonFootprint3.quickAccounting2}</span>
            <TextWidthOverflow
              width={300}
              value={`${Basic?.accountName || '-'}`}
            />
            <span>）</span>
          </div>
          <Steps className={styles.stepsClass}>
            {STEP_OPTION.map(({ title, value }) => (
              <Steps.Step key={value} title={title} />
            ))}
          </Steps>
        </section>
      )}
      <div
        style={
          managementFill
            ? { height: 'calc(100% - 50px)' }
            : { height: 'calc(100% - 120px)' }
        }
        className={styles.quickBusinessAccountingBasicFormMainDiv}
      >
        <div className={styles.quickBusinessAccountingBasicFormMain}>
          <Spin spinning={mainLoading}>
            <div className={styleCarbonFootprint3.quickBusinessAccountingForm}>
              <div className={styles.operateBox}>
                <div className={styles.title}>
                  {I18N.carbonFootprint3.basicInformation}
                </div>
                {!isDetails ? null : (
                  <div style={{ minHeight: 32 }}>
                    {!isEdit && checkQuickAccountEditPermissions() && (
                      <Button onClick={() => setIsEdit(true)}>
                        {I18N.carbonFootprint.edit}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <FormilyCommon form={form}>
                <SchemaField
                  schema={quickBusinessAccountingBasicSchema(
                    productSearchRef,
                    form,
                    throttleFunc,
                  )}
                  scope={{
                    useAsyncProductDataSource,
                    useFieldUnitDictSource,
                  }}
                />
              </FormilyCommon>
            </div>
            <div className={`${styleCarbonFootprint3.uploadMain} m-t-16`}>
              <div className={styleCarbonFootprint3.uploadTitle}>
                {I18N.carbonFootprint.systemBoundaryEngineer}
              </div>
              <div className={`${styleCarbonFootprint3.uploadDetail} m-t-8`}>
                {I18N.carbonFootprint3.supportPng7}
              </div>
              <div className='m-t-10'>
                <JavaUpload
                  disabled={modalDetail || (isDetails && !isEdit)}
                  fileList={fileListBack}
                  accept='.png, .PNG, .jpg, .JPG,.jpeg, .JPEG, .gif, .GIF'
                  listType='picture-card'
                  maxSize={5 * 1024 * 1024}
                  useMoreType
                  onFileCountChange={(flie: RcFile) => {
                    const { type } = flie;
                    const isFormat = [
                      'image/jpeg',
                      'image/png',
                      'image/jpg',
                      'image/gif',
                    ].includes(type);
                    if (!isFormat) {
                      Toast('warn', I18N.carbonFootprint.fileFormatIsIncorrect);
                      return true;
                    }

                    if (fileListBack.length >= 5) {
                      Toast('warn', I18N.carbonFootprint.maximumNumberOfFiles);
                      return true;
                    }
                    return false;
                  }}
                  onChange={(
                    file: UploadChangeParam<
                      UploadFile<{ code: number; data: any }>
                    >,
                  ) => {
                    const newArr = file.fileList.map((item, index) => {
                      if (item.status === 'done' && item.originFileObj) {
                        if (item.response?.code === 200) {
                          return {
                            name: item.name,
                            url: item.response.data,
                            uid: index,
                          };
                        }
                      }
                      return item;
                    });
                    setFileListBack([...newArr] as AddFileDataAndUid[]);
                  }}
                  onRemove={(item: any) => {
                    const oldFile = cloneDeep(fileListBack).filter(
                      res => res.url !== item.url,
                    );
                    setFileListBack(oldFile);
                  }}
                  // eslint-disable-next-line react/no-children-prop
                  children={
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>
                        {I18N.carbonFootprint.uploadImages}
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </Spin>

          {!modalDetail && !isDetails && (
            <FormActions
              width='100%'
              place='center'
              buttons={[
                {
                  type: 'primary',
                  title: I18N.carbonFootprint3.nextStepOfConstruction,
                  permission: isCopy
                    ? 'footprint3:account:copy:fast'
                    : 'footprint3:account:saveAndView:fast',
                  onClick: () =>
                    subForm({ apiKey: isCopy ? 'CopyView' : 'View' }),
                },
                {
                  title: I18N.carbonFootprint3.saveOnly,
                  permission: isCopy
                    ? 'footprint3:account:copy:fast'
                    : 'footprint3:account:save:fast',
                  onClick: () => subForm(),
                },
              ]}
            />
          )}
          {isDetails && (
            <FormActions
              width='100%'
              place='center'
              buttons={
                isEdit
                  ? [
                      {
                        type: 'primary',
                        title: I18N.carbonFootprint3.nextStepOfConstruction,
                        permission: 'footprint3:account:saveAndView:fast',
                        onClick: async () => {
                          setEditLoading(true);
                          try {
                            await subForm({
                              apiKey: 'View',
                              onSuccess: () => {
                                Toast(
                                  'success',
                                  I18N.carbonFootprint.editSuccessful,
                                );
                                setIsEdit(false);
                                init();
                                onEditSuccess?.(true);
                              },
                            });
                          } finally {
                            setEditLoading(false);
                          }
                        },
                      },
                      {
                        title: I18N.carbonFootprint3.saveOnly,
                        permission: 'footprint3:account:save:fast',
                        onClick: async () => {
                          setEditLoading(true);
                          try {
                            await subForm({
                              apiKey: 'Add',
                              onSuccess: () => {
                                Toast(
                                  'success',
                                  I18N.carbonFootprint.editSuccessful,
                                );
                                setIsEdit(false);
                                init();
                                onEditSuccess?.();
                              },
                            });
                          } finally {
                            setEditLoading(false);
                          }
                        },
                      },
                      {
                        title: I18N.carbonFootprint.cancel,
                        onClick: async () => {
                          cancelEdit();
                        },
                      },
                    ]
                  : [
                      {
                        type: 'primary',
                        title: I18N.carbonFootprint3.toModel,
                        permission: 'footprint3:account:addView:fast',
                        onClick: modeling,
                      },
                    ]
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default forwardRef(QuickBusinessAccountingBasic);
