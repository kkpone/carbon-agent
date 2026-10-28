/**
 * @description 外售产品信息详情抽屉
 */
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
} from '@formily/antd-v5';
import { createForm, Field, onFieldValueChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { includes } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';

import { IconFont } from '@/components/LcaIconFont';
import { PageTypeInfo } from '@/router/utils/enums';
import { omitInfoFn, Toast } from '@/utils/index';
import {
  getCNList,
  getConfigSale,
  getSaleProductDetail,
  postSaleProductAdd,
  putSaleProductEdit,
} from '@/views/cbam/ReportForm/service';
import { useProductProcessList, useCbamEnums } from '@/views/cbam/hook';

import { configFieldsArray } from './constant';
import style from './index.module.less';
import {
  schemaOne,
  schemaTwo,
  schemaThree,
  schemaFour,
  schemaFive,
  schemaSix,
  schemaSeven,
} from './schemas';
import { SaleProductResp } from '../../../type';

const { add, edit, show } = PageTypeInfo;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    NumberPicker,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});
interface ProductInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 产品ID */
  productId?: number;
  /** 报表ID */
  cbamId?: number;
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}
export const ProductInfo = ({
  open,
  actionBtnType,
  productId,
  cbamId,
  onOk,
  onClose,
}: ProductInfoProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.cbam.addExternalSalesProducts,
    [edit]: I18N.cbam.configureExternalSalesProducts,
    [show]: I18N.cbam.externalSalesProductLetter,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  /** 工序列表 */
  const processList = useProductProcessList(cbamId);
  const processListRef = useRef(processList);
  processListRef.current = processList;

  /** 前体的主要还原剂 */
  const reducingEnums = useCbamEnums('Reducing');

  /** 获取当前的产品类别id */
  const getCurrentProcessCategoryId = (currentProcessId?: number) => {
    if (!currentProcessId) return undefined;

    /** 当前工序信息 */
    const currentProcessInfo =
      processListRef.current?.filter(
        item => item.id === currentProcessId,
      )?.[0] || {};

    /** 对应的产品类别id */
    const currentProductCategoryId = currentProcessInfo?.productCategoryId;
    return currentProductCategoryId;
  };

  /** 根据产品类别应用外售产品参数配置 */
  const applySaleConfig = async (
    currentForm: ReturnType<typeof createForm>,
    currentProcessId?: number,
  ) => {
    const configFieldPath = configFieldsArray.toString();
    currentForm.setFieldState(`*(${configFieldPath})`, {
      visible: false,
      required: false,
    });

    const currentProductCategoryId =
      getCurrentProcessCategoryId(currentProcessId);
    if (!currentProcessId || !currentProductCategoryId) return;

    const { data } = await getConfigSale({
      productCategoryId: currentProductCategoryId,
    });

    /** 请求期间工序发生变化时，不使用旧类别的配置 */
    const latestProcessId = currentForm.getValuesIn('processId');
    if (
      getCurrentProcessCategoryId(latestProcessId) !== currentProductCategoryId
    ) {
      return;
    }

    data?.data?.forEach(item => {
      /** 后端实体属性为cPer，前端表单和接口字段为cper */
      const configField = item.link === 'cPer' ? 'cper' : item.link;
      if (configField && includes(configFieldsArray, configField)) {
        currentForm.setFieldState(configField, {
          visible: !item.isShow,
          required: !item.isRequired,
        });
      }
    });
  };

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects: currentForm => {
          onFieldValueChange('processId', async field => {
            /** 所有配置字段路径 */
            const configFieldPath = configFieldsArray.toString();

            /** 产品类别变化清空所有配置字段及CN分类名称 */
            if (field.selfModified) {
              currentForm.reset(`*(${configFieldPath},cnCode)`);
            }

            await applySaleConfig(currentForm, field.value);
          });
        },
      }),
    [actionBtnType],
  );

  /** 根据选中的工序对应的产品类别设置CN分类名称（参数配置对应产品分类的CN编码及名称） */
  const loadCNDataSource = async (field: Field) => {
    /** 当前工序id */
    const currentProcessId = field?.form?.getValuesIn('processId');

    /** 对应的产品类别id */
    const currentProductCategoryId =
      getCurrentProcessCategoryId(currentProcessId);

    /** 工序列表尚未加载完成时，禁止退化为查询全部产品类别 */
    if (!currentProductCategoryId) {
      field.setDataSource([]);
      return;
    }

    /** 查询对应枚举值 */
    const { data } = await getCNList({
      pageNum: 1,
      pageSize: 10000,
      productCategoryId: currentProductCategoryId,
      deduplicateCode: true,
    });
    const { records = [] } = data?.data || {};
    const dataSource = records?.map(item => ({
      ...item,
      label: `${item.defaultCode || ''}${item.defaultName || ''}`,
      value: item.defaultCode,
    }));

    /** 请求期间工序发生变化时，不使用旧类别的查询结果 */
    const latestProcessId = field?.form?.getValuesIn('processId');
    if (
      getCurrentProcessCategoryId(latestProcessId) !== currentProductCategoryId
    ) {
      return;
    }

    /** 设置枚举值 */
    field.setDataSource(dataSource);
    if (
      !isDetail &&
      field.value &&
      !records.some(item => item.defaultCode === field.value)
    ) {
      field.setValue(undefined);
    }
  };
  const useAsyncCNDataSource = () => loadCNDataSource;

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 保存时的api接口 */
  const postApi = isAdd ? postSaleProductAdd : putSaleProductEdit;

  /** 关闭弹窗初始化 */
  const onCloseInit = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    /** 获取详情 */
    if (!isAdd && productId) {
      getSaleProductDetail({ id: productId }).then(({ data }) => {
        const result = data?.data || {};
        form.setValues({
          ...result,
        });
      });
    }
  }, [isAdd, productId]);

  /** 设置表单枚举值 */
  useEffect(() => {
    if (!actionBtnType) {
      return;
    }
    /** 工序名称 */
    if (processList) {
      form.setFieldState('processId', {
        dataSource: processList?.map(item => ({
          ...item,
          label: item.processName,
          value: item.id,
        })),
      });

      /** 编辑回显可能早于工序列表返回，列表就绪后按工序产物类别重新加载CN */
      const currentProcessId = form.getValuesIn('processId');
      if (getCurrentProcessCategoryId(currentProcessId)) {
        applySaleConfig(form, currentProcessId);
        form.query('cnCode').take(field => {
          loadCNDataSource(field as Field);
        });
      }
    }
    /** 前体的主要还原剂 */
    if (reducingEnums) {
      form.setFieldState('reducing', {
        dataSource: reducingEnums?.map(item => ({
          label: item.name,
          value: item.code,
        })),
      });
    }
  }, [processList, actionBtnType]);

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
              const values = await form.submit<SaleProductResp>();

              const result = omitInfoFn({ ...values, cbamId });

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
          schema={schemaOne()}
          scope={{ useAsyncCNDataSource }}
          key='1'
        />
        <SchemaField schema={schemaTwo()} key='2' />
        <SchemaField schema={schemaThree()} key='3' />
        <SchemaField schema={schemaFour()} key='4' />
        <SchemaField schema={schemaFive()} key='5' />
        <SchemaField schema={schemaSix()} key='6' />
        <SchemaField schema={schemaSeven()} key='7' />
      </Form>
    </Drawer>
  );
};
