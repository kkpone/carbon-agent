/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 20:13:29
 * @Date: 2023-02-21 17:22:49
 * @@description: 新增核算 - 基本信息
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
import { Button } from '@src/components/Button';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { checkPermissions } from '@src/components/Permission/utils';
import { JavaUpload } from '@src/components/Upload/JavaUpload';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { replaceParamVal } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { getDictInfoByDictValue } from '@src/utils/dict';
import { Dicts } from '@src/views/emission/Show/type';
import { Modal, Spin } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import { cloneDeep, compact, throttle } from 'lodash-es';
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { processBusinessAccountingBasicSchema } from './Schema';
import styles from './index.module.less';
import { ProcessBusinessAccountingAddBasicProps } from './type';
import { getProductLibraryTableData } from '../../ProductManagement/service';
import { ProductLibraryTableData } from '../../ProductManagement/type';
import { QuickBusinessAccountingInfo } from '../../QuickBusinessAccounting/type';
import styleCarbonFootprint3 from '../../index.module.less';
import '../index.less';
import { AddFileDataAndUid } from '../../type';
import { LIST_OR_GRAPH_VAL, PROCESS_URL_PARAMS_KEY } from '../../util/constant';
import {
  postProcessAccountCopyBasicScope,
  postProcessAccountCopyViewBasicScope,
  postProcessBusinessAccountingBasic,
  postProcessBusinessAccountingBasicAddview,
  postProcessBusinessAccountingBasicAndView,
} from '../service';
import {
  ProcessBusinessAccountingAddBasicData,
  ProcessBusinessAccountingAddBasicForm,
} from '../type';
import { checkProcessAccountEditPermissions } from '../util';
import FormilySystemBoundaryRadio from '../../component/FormilySystemBoundaryRadio';

const { INFO_ID, INFO_IS_EDIT, SCOPE_VALUE, LIST_OR_GRAPH } =
  PROCESS_URL_PARAMS_KEY;

const { GRAPH } = LIST_OR_GRAPH_VAL;

const ProcessBusinessAccountingAddBasic = ({
  modalDetail,
  onSub,
  basicInfo,
  isCopy,
  isEdit: isEditStatus,
  cRef,
  changeStepBack,
}: ProcessBusinessAccountingAddBasicProps) => {
  const history = useHistory();

  const { id } = useParams<{ id: string }>();

  // 核算产品输入值不存在的时候显示输入值
  const productSearchRef = useRef<{
    productSearchValue: string;
  }>({ productSearchValue: '' });

  /** 主内容的加载中 */
  const [mainLoading] = useState<boolean>(false);

  /** 前往下一步的弹框展示 */
  const [jumpToStepStatus, setJumpToStepStatus] = useState<boolean>(false);

  /** 复制核算 - 点击仅保存后将复制状态改变 */
  const [isCopyStatus, setIsCopyStatus] = useState(isCopy);

  /** 是否是可编辑 */
  const [isEdit, setIsEdit] = useState<boolean>(isEditStatus || false);

  /** 是否点击编辑功能 */
  const [editStatus, setEditStatus] = useState<boolean>(false);

  /** 单位的字典值 */
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);

  /** 根据步骤条点击要跳转的步骤 */
  const [needGoStep, setNeedGoStep] = useState<number>();

  /** 保存返回的值 */
  const [, setSaveBackData] = useState<ProcessBusinessAccountingAddBasicData>();

  /** 仅保存的返回的id */
  const [saveBackId, setSaveBackId] = useState<number>();

  /** 是否点击的保存并去提交按钮 */
  const [clickSaveAndViewBtn, setClickSaveAndViewBtn] = useState(false);

  /** 产品列表 */
  const [productLibraryList, setProductLibraryList] = useState<
    ProductLibraryTableData[]
  >([]);

  /** 上传的文件列表 */
  const [fileListBack, setFileListBack] = useState<AddFileDataAndUid[]>([]);

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

  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = useMemo(
    () =>
      createForm({
        // initialValues: initSelectFormVal(),
        effects() {
          onFormInit(async form => {
            form.addEffects('accountName', form => {
              // onFieldChange('amount', ['value'], () => {
              //   throttleFunc(form);
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

  const subAddData: () => Promise<ProcessBusinessAccountingAddBasicData> =
    useCallback(async () => {
      const formData: ProcessBusinessAccountingAddBasicForm =
        await form.submit();

      const fieldUnitData = form.getFieldState('unitData');

      const dicts: Dicts[] = cascaderOptions;

      // 处理单位信息
      const unitInfo = getDictInfoByDictValue(fieldUnitData.value[1], dicts);

      // 获取选中产品的详细信息
      const productInfo = productLibraryList.find(
        data =>
          data.productCode === formData.productCode ||
          data.productName === formData.productCode,
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

      const subData: ProcessBusinessAccountingAddBasicData = {
        ...formData,
        type: 1,
        startTime: formData.dateTime[0],
        endTime: formData.dateTime[1],
        unitName: unitInfo?.dictLabel || '',
        unitCode: unitInfo?.dictValue || '',
        productName: productInfo
          ? productInfo.productName
          : customProductInfo.productName,
        productCode: productInfo
          ? productInfo.productCode
          : customProductInfo.productCode,
        productId: productInfo ? productInfo.id : undefined,
        files: fileListBack,
      };
      // 如果是编辑状态
      if (basicInfo) {
        subData.id = basicInfo.id;
      } else if (isCopyStatus) {
        subData.id = Number(id);
      } else {
        subData.id = saveBackId;
      }

      return subData;
    }, [productLibraryList, saveBackId, fileListBack, cascaderOptions]);

  /**
   * @description: 更新产品的值
   */
  const updateFiledProductData = async () => {
    const backDataSource = await getProductLibraryTableData({
      pageNum: 1,
      pageSize: 10000,
    });
    const enumData = backDataSource.data.data.rows;
    const enumDataMap = enumData.map(data => ({
      label: data.productName,
      value: data.productCode,
    }));

    form.setFieldState('productCode', {
      dataSource: enumDataMap,
    });
    setProductLibraryList(enumData);
    return enumDataMap;
  };

  /**
   * @description: 新增基本信息
   */
  const subAddBasic = async (saveAndView?: boolean, onlyBuild?: boolean) => {
    const subData = await subAddData();
    /** 不是点击的保存建模或者去建模 */
    if (isCopyStatus) {
      const data = onlyBuild
        ? await postProcessBusinessAccountingBasicAddview({ id: subData.id })
        : saveAndView
        ? await postProcessAccountCopyViewBasicScope(subData)
        : await postProcessAccountCopyBasicScope(subData);

      if (data.data.code === 200) {
        setSaveBackId(data.data.data);
        setSaveBackData(subData);

        if (saveAndView || onlyBuild) {
          history.push(
            `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingAddOrDetail}?${SCOPE_VALUE}=1&${INFO_ID}=${data.data.data}&${INFO_IS_EDIT}=true`,
          );
        } else {
          form.setFormState({
            readPretty: true,
          });
          setIsEdit(true);
          setIsCopyStatus(false);
        }
        Toast('success', I18N.carbonFootprint.saveSuccessful);
      } else if (
        data.data.code === 611 &&
        `${data.data.data}` === 'accountName'
      ) {
        form.setFieldState('accountName', {
          validator: [
            {
              required: true,
            },
            () => data.data.msg,
          ],
        });
        form.validate();
      }

      setEditStatus(false);
      return;
    }

    const data = onlyBuild
      ? await postProcessBusinessAccountingBasicAddview({ id: subData.id })
      : saveAndView
      ? await postProcessBusinessAccountingBasicAndView(subData)
      : await postProcessBusinessAccountingBasic(subData);

    if (data.data.code === 200) {
      setSaveBackId(data.data.data);
      setSaveBackData(subData);

      if (saveAndView || onlyBuild) {
        if (basicInfo) {
          const bUrl = replaceParamVal(SCOPE_VALUE, 1);
          const nUrl = replaceParamVal(LIST_OR_GRAPH, GRAPH, bUrl);
          window.history.replaceState(null, '', nUrl);

          onSub(data.data.data);
        } else {
          history.push(
            `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingAddOrDetail}?${SCOPE_VALUE}=1&${INFO_ID}=${data.data.data}&${INFO_IS_EDIT}=true`,
          );
        }

        Toast('success', I18N.carbonFootprint.saveSuccessful);
        setEditStatus(false);
        return;
      }

      Toast('success', I18N.carbonFootprint.saveSuccessful);
      setEditStatus(false);

      form.setFormState({
        readPretty: true,
      });
      setIsEdit(true);
      // 更新产品字段
      updateFiledProductData();
    } else if (
      data.data.code === 611 &&
      `${data.data.data}` === 'accountName'
    ) {
      form.setFieldState('accountName', {
        validator: [
          {
            required: true,
          },
          () => data.data.msg,
        ],
      });
      form.validate();
    }
  };

  const clickEdit = () => {
    setEditStatus(true);
    form.setFormState({
      readPretty: false,
    });
  };

  /**
   * @description: 不保存或者保存，切换到下一步
   */
  const changeNextStep = async (isSave: boolean) => {
    if (basicInfo && needGoStep) {
      setEditStatus(false);
      setJumpToStepStatus(false);

      // 如果是保存并切换的话，需要调用保存接口
      if (isSave) {
        const subData = await subAddData();
        await postProcessBusinessAccountingBasic(subData);
        Toast('success', I18N.carbonFootprint.saveSuccessful);
      }

      const bUrl = replaceParamVal(SCOPE_VALUE, needGoStep);
      const nUrl = replaceParamVal(LIST_OR_GRAPH, GRAPH, bUrl);

      window.history.replaceState(null, '', nUrl);

      changeStepBack(needGoStep, basicInfo.id);
    }
  };

  /**
   * @description: 即将前往下一步,但是基本信息处于编辑状态
   */
  const goNextStep = async (needGoStep: number) => {
    if (editStatus && !clickSaveAndViewBtn) {
      setNeedGoStep(needGoStep);
      setJumpToStepStatus(true);

      return true;
    }
    setNeedGoStep(undefined);
    return false;
  };

  /**
   * 主动触发子组件 - 获取文件
   */
  useImperativeHandle(cRef, () => ({
    goNextStep,
  }));

  /**
   * @description: 初始化 - 设置回显值
   */
  const initInfoValue = async (
    dicts: Dicts[],
    data: QuickBusinessAccountingInfo,
  ) => {
    const { files } = data;

    // 获取数量单位的code
    const child = dicts.find(op => op.dictValue === data.unitCode);
    const parent = dicts.find(op => op.dictValue === child?.sourceType);
    const unitData =
      parent && child ? [parent.dictValue, child.dictValue] : undefined;

    // 设置图片
    if (files && files.length > 0) {
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
  };

  const init = async () => {
    const dic = await listALLByDictTypeBatch<{ factorUnitM: Dicts[] }>({
      dictTypes: 'factorUnitM',
    });

    if (basicInfo) {
      initInfoValue(dic.data.data.factorUnitM, basicInfo);

      if (!isCopy) {
        form.setFormState({
          readPretty: true,
        });
      }
    }

    setCascaderOptions(dic.data.data.factorUnitM);
  };

  useEffect(() => {
    init();
  }, [basicInfo]);

  /**
   * @description: 基本信息的底部按钮
   */
  const FormFooterButtons = useMemo(() => {
    const goBuildBtn = checkPermissions(
      {
        type: 'primary',
        title: I18N.carbonFootprint3.toModel,
        onClick: async () => {
          await subAddBasic(false, true);
        },
      },
      'footprint3:account:addView:process',
    );

    const onlySave = checkPermissions(
      {
        title: I18N.carbonFootprint3.saveOnly,
        onClick: async () => {
          await subAddBasic();
        },
      },
      'footprint3:account:save:process',
    );

    const saveAndView = checkPermissions(
      {
        type: 'primary',
        title: I18N.carbonFootprint3.nextStepOfConstruction,
        onClick: async () => {
          setClickSaveAndViewBtn(true);
          await subAddBasic(true);
        },
      },
      'footprint3:account:saveAndView:process',
    );

    // const goBack = {
    //   title: '返回',
    //   onClick: async () => {
    //     history.push(
    //       `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccounting}`,
    //     );
    //   },
    // };

    const cancelClick = {
      title: I18N.carbonFootprint.cancel,
      onClick: async () => {
        if (basicInfo) {
          initInfoValue(cascaderOptions, basicInfo);
        }

        setEditStatus(false);
        form.setFormState({
          readPretty: true,
        });
      },
    };

    let formBtns = [saveAndView, onlySave];

    if (isEdit) {
      if (editStatus) {
        formBtns = [saveAndView, onlySave, cancelClick];
        form.setFieldState('scope', {
          disabled: false,
        });
      } else {
        formBtns = [goBuildBtn];
        form.setFieldState('scope', {
          disabled: true,
        });
      }
    }

    return formBtns;
  }, [
    isEdit,
    editStatus,
    productLibraryList,
    saveBackId,
    fileListBack,
    cascaderOptions,
  ]);

  return (
    <div
      className={`${styleCarbonFootprint3.carbonFootprint3} ${styles.processBasic}`}
    >
      <Spin spinning={mainLoading}>
        <div className={styleCarbonFootprint3.quickBusinessAccountingForm}>
          <div className={styles.businessTitle}>
            <div>{I18N.carbonFootprint3.basicInformation}</div>

            {editStatus
              ? undefined
              : isEdit &&
                checkProcessAccountEditPermissions() && (
                  <div>
                    <Button onClick={async () => clickEdit()}>
                      {I18N.carbonFootprint.edit}
                    </Button>
                  </div>
                )}
          </div>
          <FormilyCommon form={form}>
            <SchemaField
              schema={processBusinessAccountingBasicSchema(
                productSearchRef,
                form,
                throttleFunc,
              )}
              scope={{ useAsyncProductDataSource, useFieldUnitDictSource }}
            />
          </FormilyCommon>
        </div>
        <div className={`${styleCarbonFootprint3.uploadMain} m-t-16`}>
          <div className={styleCarbonFootprint3.uploadTitle}>
            {I18N.carbonFootprint3.systemBoundaryCarbon}
          </div>
          <div className={`${styleCarbonFootprint3.uploadDetail} m-t-8`}>
            {I18N.carbonFootprint3.supportPng6}
          </div>
          <div className='m-t-10'>
            <JavaUpload
              disabled={!editStatus && isEdit}
              fileList={fileListBack}
              accept='.png, .PNG, .jpg, .JPG,.jpeg, .JPEG, .gif, .GIF'
              listType='picture-card'
              maxSize={5 * 1024 * 1024}
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
                      return { ...item.response.data, uid: index };
                    }
                  }
                  return item;
                });
                setFileListBack([...newArr]);
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
      <Modal
        open={jumpToStepStatus}
        title={I18N.carbonFootprint.prompt}
        bodyStyle={{
          padding: '20px 24px',
        }}
        footer={
          <div>
            <Button
              onClick={async () => {
                setJumpToStepStatus(false);
              }}
            >
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button onClick={async () => changeNextStep(false)}>
              {I18N.carbonFootprint3.confirmSwitch}
            </Button>
            <Button
              type='primary'
              onClick={async () => {
                await changeNextStep(true);
              }}
            >
              {I18N.carbonFootprint3.saveAndSwitch}
            </Button>
          </div>
        }
        onCancel={async () => {
          setJumpToStepStatus(false);
        }}
      >
        <div>{I18N.carbonFootprint3.theCurrentPageIsNotYetAvailable}</div>
      </Modal>
      {!modalDetail && (
        <FormActions
          width='100%'
          place='center'
          buttons={compact(FormFooterButtons)}
        />
      )}
    </div>
  );
};

export default memo(ProcessBusinessAccountingAddBasic);
