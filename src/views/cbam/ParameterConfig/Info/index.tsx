/**
 * @description CBAM参数配置详情抽屉
 */
import {
  ArrayTable,
  Cascader,
  Checkbox,
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  PreviewText,
  Radio,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { IconFont } from '@/components/LcaIconFont';
import { PageTypeInfo } from '@/router/utils/enums';
import {
  changeFactorM2cascaderOptions,
  Dicts,
  omitInfoFn,
  Toast,
} from '@/utils/index';

import style from './index.module.less';
import { schema } from './schemas';
import { useCbamEnums } from '../../hook';
import {
  postParameterAdd,
  putParameterEdit,
  getParameterDetail,
} from '../service';
import { ParameterResp } from '../type';

const { add, edit, show } = PageTypeInfo;

const SchemaField = createSchemaField({
  components: {
    Form,
    FormItem,
    FormGrid,
    FormLayout,
    Input,
    Cascader,
    Radio,
    ArrayTable,
    PreviewText,
    Checkbox,
    NumberPicker,
  },
});
interface FactoryInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 参数配置ID */
  configId?: number;
  /** 单位的枚举 */
  unitEnum?: Dicts[];
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}
export const ParameterInfo = ({
  open,
  actionBtnType,
  configId,
  unitEnum,
  onOk,
  onClose,
}: FactoryInfoProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.cbam.addParameterConfiguration,
    [edit]: I18N.cbam.editParameterConfiguration,
    [show]: I18N.cbam.detailedParameterConfiguration,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 保存时的api接口 */
  const postApi = isAdd ? postParameterAdd : putParameterEdit;

  /** 是否包含间接排放枚举 */
  const isExistsOptions = useCbamEnums('IsExists');

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
      }),
    [actionBtnType],
  );

  /** 关闭弹窗初始化 */
  const onCloseInit = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    /** 获取产品详情 */
    if (!isAdd && configId) {
      getParameterDetail({ id: configId }).then(({ data }) => {
        const result = data?.data || {};
        const { unit, defaultSaleList = [] } = result;

        /** 单位 */
        const unitArr = unit ? unit?.split(',') : [];

        /** 外售产品填报信息 */
        const defaultSaleListArr = defaultSaleList?.map(item => ({
          ...item,
          isRequired: !item.isRequired,
          isShow: !item.isShow,
        }));

        form.setValues({
          ...result,
          unit: unitArr,
          defaultSaleList: defaultSaleListArr,
        });
      });
    }
  }, [isAdd, configId]);

  /** 设置表单枚举值 */
  useEffect(() => {
    if (!actionBtnType) {
      return;
    }
    if (unitEnum) {
      /** 单位 */
      form.setFieldState('unit', {
        dataSource: changeFactorM2cascaderOptions(unitEnum),
      });
    }
    if (isExistsOptions) {
      /** 是否包含间接排放 */
      form.setFieldState('isExists', {
        dataSource: isExistsOptions
          ?.filter(option => option.code)
          ?.map(isExist => ({
            label: isExist.name,
            value: isExist.code,
          })),
      });
    }
  }, [actionBtnType, unitEnum]);

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
              const values = await form.submit<ParameterResp>();
              const { unit, defaultSaleList } = values || {};

              /** 外售产品填报信息 */
              const defaultSaleListArr = defaultSaleList?.map(item => ({
                ...item,
                isRequired: Number(!item.isRequired),
                isShow: Number(!item.isShow),
              }));

              const result = omitInfoFn({
                ...values,
                unit: unit ? String(unit) : undefined,
                defaultSaleList: defaultSaleListArr,
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
        <SchemaField schema={schema()} />
      </Form>
    </Drawer>
  );
};
