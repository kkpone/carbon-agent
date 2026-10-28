/**
 * @description 工序详情抽屉
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
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { IconFont } from '@/components/LcaIconFont';
import { PageTypeInfo } from '@/router/utils/enums';
import { omitInfoFn, Toast } from '@/utils/index';
import {
  getConfigProcessList,
  getConfigProductList,
  getProductProcessDetail,
  postProductProcessAdd,
  putProductProcessEdit,
} from '@/views/cbam/ReportForm/service';
import { ProductProcessResp } from '@/views/cbam/ReportForm/type';
import {
  usePrecursorList,
  useProcessList,
  useParameterProductCategoryList,
} from '@/views/cbam/hook';

import style from './index.module.less';
import { schema } from './schemas';

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
interface ProcessInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 过程ID */
  processId?: number;
  /** 报表ID */
  cbamId?: number;
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}
export const ProcessInfo = ({
  open,
  actionBtnType,
  processId,
  cbamId,
  onOk,
  onClose,
}: ProcessInfoProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.cbam.newProcess,
    [edit]: I18N.cbam.editProcess,
    [show]: I18N.cbam.processDetails,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  /** 上级工序列表 */
  const preProcessList = useProcessList(cbamId, processId, open);

  /** 外购前体列表 */
  const precursorList = usePrecursorList(cbamId, open);

  /** 工序产物类型-参数配置产品类别列表 */
  const parameterList = useParameterProductCategoryList();

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects: productForm => {
          onFieldValueChange('productCategoryId', field => {
            if (field.selfModified) {
              /** 工序产物类型变化清空生产路线 */
              productForm.setValuesIn('productRoute', []);
              /** 工序产物类型变化清空前置工序 */
              productForm.setValuesIn('elseProduct', []);
            }
          });
          onFieldValueChange('includeType', field => {
            if (field.selfModified) {
              /** 前置工序类型变化清空前置工序 */
              productForm.setValuesIn('elseProduct', []);
            }
          });
        },
      }),
    [actionBtnType, processId],
  );

  /** 根据选中的工序产物类型设置生产路线（参数配置对应产品分类的生产工序）的枚举值 */
  const useAsyncRouterDataSource = () => async (field: Field) => {
    /** 选中的工序产物类型id */
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

  /** 根据选中的工序产物类型设置手动填写下的所有前置工序（参数配置对应产品分类的包含产品）的枚举值 */
  const useAsyncElseProductDataSource = () => async (field: Field) => {
    /** 选中的工序产物类型id */
    const selectProductCategoryId =
      field?.form?.getValuesIn('productCategoryId');

    /** 查询对应枚举值 */
    const { data } = await getConfigProductList({
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
  const postApi = isAdd ? postProductProcessAdd : putProductProcessEdit;

  /** 关闭弹窗初始化 */
  const onCloseInit = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    /** 获取详情 */
    if (!isAdd && processId) {
      getProductProcessDetail({ id: processId }).then(({ data }) => {
        const result = data?.data || {};
        const { preId, preProcess, elseProduct, productRoute } = result;
        const preIdArr = preId ? preId.split(',').map(id => Number(id)) : [];
        const preProcessArr = preProcess
          ? preProcess.split(',').map(process => Number(process))
          : [];
        const elseProductArr = elseProduct
          ? elseProduct.split(',').map(product => Number(product))
          : [];
        const productRouteArr = productRoute
          ? productRoute.split(',').map(route => Number(route))
          : [];

        form.setValues({
          ...result,
          productRoute: productRouteArr,
          preId: preIdArr,
          preProcess: preProcessArr,
          elseProduct: elseProductArr,
        });
      });
    }
  }, [isAdd, processId]);

  /** 设置表单枚举值 */
  useEffect(() => {
    if (!actionBtnType) {
      return;
    }

    /** 自厂上级工序 */
    if (preProcessList) {
      form.setFieldState('preId', {
        dataSource: preProcessList?.map(item => ({
          label: item.processName,
          value: item.id,
        })),
      });
    }

    /** 外购前体列表 */
    if (precursorList) {
      form.setFieldState('preProcess', {
        dataSource: precursorList?.map(item => ({
          label: item.preName,
          value: item.id,
        })),
      });
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
  }, [preProcessList, precursorList, parameterList, actionBtnType]);

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
              const values = await form.submit<ProductProcessResp>();

              const { preId, preProcess, elseProduct, productRoute } =
                values || {};

              const result = omitInfoFn({
                ...values,
                cbamId,
                preId: preId?.toString(),
                preProcess: preProcess?.toString(),
                elseProduct: elseProduct?.toString(),
                productRoute: productRoute?.toString(),
              });

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
            }}
          >
            {I18N.Factors.preserve}
          </Button>
        ),
      ]}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField
          schema={schema()}
          scope={{ useAsyncRouterDataSource, useAsyncElseProductDataSource }}
        />
      </Form>
    </Drawer>
  );
};
