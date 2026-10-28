/**
 * @description 工厂信息详情抽屉
 */
import {
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { IconFont } from '@/components/LcaIconFont';
import { PageTypeInfo } from '@/router/utils/enums';
import { OrgPojo } from '@/sdks_v2/new/systemV2ApiDocs';
import { ORG_STATUS } from '@/utils/const';
import { Dicts, omitInfoFn, Toast } from '@/utils/index';
import { TextArea } from '@/views/eca/component/TextArea';

import style from './index.module.less';
import { schema } from './schemas';
import { postFactoryAdd, putFactoryEdit, getFactoryDetail } from '../service';
import { FactoryResp } from '../type';

const { add, edit, show } = PageTypeInfo;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    TextArea,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});
interface FactoryInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 工厂ID */
  factoryId?: number;
  /** 所属组织的枚举 */
  orgList: OrgPojo[];
  /** 国家的枚举 */
  countryList?: Dicts[];
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}
export const FactoryInfo = ({
  open,
  actionBtnType,
  factoryId,
  orgList,
  countryList,
  onOk,
  onClose,
}: FactoryInfoProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.cbam.addFactory,
    [edit]: I18N.cbam.editFactory,
    [show]: I18N.cbam.factoryDetails,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 保存时的api接口 */
  const postApi = isAdd ? postFactoryAdd : putFactoryEdit;

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
    /** 新增时：工厂编码自动生成 */
    if (isAdd && !factoryId) {
      form.setFieldState('factoryCode', {
        value: new Date().getTime(),
      });
    }
    /** 获取产品详情 */
    if (!isAdd && factoryId) {
      /** 编辑时，所属组织不能编辑 */
      form.setFieldState('orgId', {
        disabled: true,
        required: false,
      });

      getFactoryDetail({ id: factoryId }).then(({ data }) => {
        const result = data?.data || {};
        form.setValues({
          ...result,
        });
      });
    }
  }, [isAdd, factoryId]);

  /** 设置表单枚举值 */
  useEffect(() => {
    if (!actionBtnType) {
      return;
    }
    if (orgList) {
      /** 所属组织 */
      form.setFieldState('orgId', {
        dataSource: orgList.map(item => ({
          label: item.orgName,
          value: item.id,
          disabled: item.orgStatus === ORG_STATUS.DISABLE,
        })),
      });
    }
    if (countryList) {
      /** 国家 */
      form.setFieldState('country', {
        dataSource: countryList.map(item => ({
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });
    }
  }, [orgList, actionBtnType, countryList]);

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
      footer={
        <>
          <Button onClick={() => onCloseInit()}>
            {isDetail ? I18N.carbonFootPrintLCA.close : I18N.Factors.cancel}
          </Button>
          {!isDetail && (
            <Button
              type='primary'
              loading={btnLoading}
              onClick={async () => {
                const values = await form.submit<FactoryResp>();

                const result = omitInfoFn(values);

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
          )}
        </>
      }
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={schema()} />
      </Form>
    </Drawer>
  );
};
