/**
 * @description 前体详情抽屉
 */
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Radio,
  Select,
} from '@formily/antd-v5';
import { createForm, Field, onFieldValueChange } from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer, Modal } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { IconFont } from '@/components/LcaIconFont';
import { InfoTitle } from '@/components/InfoTitle';
import { PageTypeInfo } from '@/router/utils/enums';
import { modelFooterBtnStyle, omitInfoFn, Toast } from '@/utils/index';
import {
  getConfigProcessList,
  getOutsourcedPrecursorDetail,
  postOutsourcedPrecursorAdd,
  putOutsourcedPrecursorEdit,
} from '@/views/cbam/ReportForm/service';
import { OutsourcedPrecursorResp } from '@/views/cbam/ReportForm/type';
import {
  useCbamEnums,
  useParameterProductCategoryList,
} from '@/views/cbam/hook';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';

import style from './index.module.less';
import { precursorSchema, supplySchema } from './schemas';
import { FILL_WAY_ENUM, PRECURSOR_SET_STATUS } from '../../../constant';
import ChooseSupplyCbamModal from '../components/ChooseSupplyCbamModal';
import { SupplyInfo } from '../components/ChooseSupplyCbamModal/type';

const { COLLECTED } = PRECURSOR_SET_STATUS;

const { SUPPLY_FILL } = FILL_WAY_ENUM;

const { add, edit, show } = PageTypeInfo;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    NumberPicker,
    Radio,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});
interface PrecursorInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 前体ID */
  precursorId?: number;
  /** 报表ID */
  cbamId?: number;
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}
export const PrecursorInfo = ({
  open,
  actionBtnType,
  precursorId,
  cbamId,
  onOk,
  onClose,
}: PrecursorInfoProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.cbam.addPrecursor,
    [edit]: I18N.cbam.editPrecursor,
    [show]: I18N.cbam.precursorDetails,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  /** 外购前体类别-参数配置产品类别列表 */
  const parameterList = useParameterProductCategoryList();

  const enumOptions = useAllEnumsBatch('CBAMcountryinfo');
  /** 国家名称枚举 */
  const countryCodeList = enumOptions?.CBAMcountryinfo;

  /** 填报状态 */
  const fillStatuesList = useCbamEnums('PreFillStatus');

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects: productForm => {
          onFieldValueChange('productCategoryId', field => {
            if (field.selfModified) {
              /** 外购前体类别变化清空生产路线 */
              productForm.setValuesIn('productRoute', []);
            }
          });
          onFieldValueChange('manual', field => {
            if (field.selfModified) {
              /** 填报方式变化清空填报状态、供应商名称、来源国家或地区、供应商id */
              productForm?.setValues({
                fillStatus: null,
                fillStatus_name: null,
                supplierName: null,
                countryCode: null,
                linkId: null,
              });
            }
          });
        },
      }),
    [actionBtnType, open],
  );

  /** 根据选中的外购前体类别设置生产路线（参数配置对应产品分类的生产工序）的枚举值 */
  const useAsyncRouterDataSource = () => async (field: Field) => {
    /** 选中的外购前体类别id */
    const selectProductCategoryId =
      field?.form?.getValuesIn('productCategoryId');

    /** 查询对应枚举值 */
    const { data } = await getConfigProcessList({
      pageNum: 1,
      pageSize: 10000,
      productCategoryId: selectProductCategoryId,
    });
    const { records = [] } = data?.data || {};
    const dataSource = records?.map(item => ({
      label: item.defaultName,
      value: item.id,
    }));

    /** 设置枚举值 */
    field.setDataSource(dataSource);
  };

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 保存时的api接口 */
  const postApi = isAdd
    ? postOutsourcedPrecursorAdd
    : putOutsourcedPrecursorEdit;

  /** 关闭弹窗初始化 */
  const onCloseInit = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    /** 获取详情 */
    if (!isAdd && precursorId) {
      getOutsourcedPrecursorDetail({ id: precursorId }).then(({ data }) => {
        const result = data?.data || {};
        const { productRoute, linkId, productCategoryId } = result;

        const productRouteArr = productRoute
          ? productRoute.split(',').map(route => Number(route))
          : [];

        /** 记录供应商id初始值 */
        form.setInitialValuesIn('linkId', linkId);

        /** 记录外购前体类别初始值 */
        form.setInitialValuesIn('productCategoryId', productCategoryId);

        form.setValues({
          ...result,
          productRoute: productRouteArr,
        });
      });
    }
  }, [isAdd, precursorId, open]);

  /** 设置表单枚举值 */
  useEffect(() => {
    if (!open) return;

    if (!actionBtnType) {
      return;
    }

    /** 工序产物类型 */
    if (parameterList) {
      form.setFieldState('productCategoryId', {
        dataSource: parameterList?.map(product => ({
          ...product,
          label: product.categoryName,
          value: product.id,
        })),
      });
    }

    /** 来源国家或地区 */
    if (countryCodeList) {
      form.setFieldState('countryCode', {
        dataSource: countryCodeList?.map(item => ({
          ...item,
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });
    }

    /** 填报状态 */
    if (fillStatuesList) {
      form.setFieldState('fillStatus', {
        dataSource: fillStatuesList?.map(item => ({
          ...item,
          label: item.name,
          value: item.code,
        })),
      });
    }
  }, [parameterList, countryCodeList, actionBtnType, fillStatuesList, open]);

  /** --------------------------------------------选择供应商CBAM弹窗相关-------------------------------------------- */
  /** 供应商CBAM弹窗的显隐 */
  const [chooseCbamOpen, setChooseCbamOpen] = useState(false);

  return (
    <Drawer
      className={style.wrapper}
      title={title}
      open={open}
      closeIcon={false}
      maskClosable={false}
      destroyOnClose
      placement='right'
      size='large'
      extra={
        <div className={style.closeIcon} onClick={() => onCloseInit()}>
          <IconFont icon='icon-icon-guanbi' />
        </div>
      }
      onClose={() => onCloseInit()}
      footer={[
        <Button onClick={() => onCloseInit()}>
          {isDetail ? I18N.carbonFootPrintLCA.close : I18N.Factors.cancel}
        </Button>,
        !isDetail && (
          <Button
            type='primary'
            loading={btnLoading}
            onClick={async () => {
              const values = await form.submit<OutsourcedPrecursorResp>();

              const { productRoute, linkId } = values || {};

              const result = omitInfoFn({
                ...values,
                cbamId,
                productRoute: productRoute?.toString(),
              });

              const saveFn = async () => {
                try {
                  setBtnLoading(true);
                  await postApi(result);
                  Toast('success', I18N.Factors.saveSuccessful);
                  setBtnLoading(false);
                  form.reset();
                  onOk();
                } catch (e) {
                  setBtnLoading(false);
                  throw e;
                }
              };

              /** 校验供应商数据ID，若无变化则可直接保存，若有变化则弹窗提示 */
              const supplierIdChange =
                form?.getFieldState('linkId')?.initialValue !== linkId;

              if (supplierIdChange && !isAdd) {
                Modal.confirm({
                  title: I18N.Factors.prompt,
                  icon: '',
                  content: <div>{I18N.cbam.detectedSupply}</div>,
                  ...modelFooterBtnStyle,
                  okText: I18N.base.confirm,
                  cancelText: I18N.Factors.cancel,
                  onOk: async () => {
                    saveFn();
                  },
                });
              } else {
                saveFn();
              }
            }}
          >
            {I18N.Factors.preserve}
          </Button>
        ),
      ]}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField
          schema={precursorSchema()}
          scope={{ useAsyncRouterDataSource }}
        />
        <FormConsumer>
          {currentForm => {
            /** 供应商信息填写方式 */
            const supplierInfoType = currentForm.getValuesIn('manual');

            /** 是否是供应商填写 */
            const isSupplyFill = supplierInfoType === SUPPLY_FILL;

            /** 关联供应商数据id */
            const supplierId = currentForm.getValuesIn('linkId');

            return (
              <InfoTitle
                title={I18N.cbam.supplierSpecific}
                rightRender={
                  !isDetail &&
                  isSupplyFill && (
                    <Button
                      key='chooseSupplyCbam'
                      type='primary'
                      onClick={() => {
                        if (supplierId) {
                          Modal.confirm({
                            title: I18N.Factors.prompt,
                            icon: '',
                            content: (
                              <div>
                                {I18N.cbam.confirmSelectionOfNew}
                                <div className='primaryColor'>
                                  {I18N.cbam.noteToReselect}
                                </div>
                              </div>
                            ),
                            ...modelFooterBtnStyle,
                            okText: I18N.base.confirm,
                            cancelText: I18N.Factors.cancel,
                            onOk: async () => {
                              setChooseCbamOpen(true);
                            },
                          });
                          return;
                        }
                        setChooseCbamOpen(true);
                      }}
                    >
                      {I18N.cbam.selectSupplier}
                    </Button>
                  )
                }
              />
            );
          }}
        </FormConsumer>

        <SchemaField schema={supplySchema()} />
      </Form>

      {/* 选择供应商CBAM弹窗 */}
      <ChooseSupplyCbamModal
        open={chooseCbamOpen}
        handleOk={({ selectRows }: { selectRows: SupplyInfo[] }) => {
          const { supplyName, countryValue, productCategoryId } =
            selectRows?.[0] || {};

          const preProductCategoryId = form.getValuesIn('productCategoryId');

          if (preProductCategoryId !== productCategoryId) {
            /** 选中供应商CBAM数据时，设置表单值 */
            form.setValues({
              supplierName: supplyName,
              fillStatus: COLLECTED,
              countryCode: countryValue,
              linkId: selectRows[0]?.id,
              productCategoryId,
              productRoute: [],
            });
          } else {
            /** 选中供应商CBAM数据时，设置表单值 */
            form.setValues({
              supplierName: supplyName,
              fillStatus: COLLECTED,
              countryCode: countryValue,
              linkId: selectRows[0]?.id,
              productCategoryId,
            });
          }

          setChooseCbamOpen(false);
        }}
        handleCancel={() => {
          setChooseCbamOpen(false);
        }}
      />
    </Drawer>
  );
};
