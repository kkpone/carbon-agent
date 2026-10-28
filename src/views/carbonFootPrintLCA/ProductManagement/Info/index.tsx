/**
 * @description 产品信息管理详情抽屉
 */
import { TextArea } from '@components/TextArea';
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
import { isArray } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { IconFont } from '@/components/LcaIconFont';
import { PageTypeInfo } from '@/router/utils/enums';
import { OrgPojo } from '@/sdks_v2/new/systemV2ApiDocs';
import { ORG_STATUS } from '@/utils/const';
import {
  ApiLanguageSourceList,
  LANG_TYPE,
  Toast,
  handleLangFields,
  reverseHandleLangFields,
} from '@/utils/index';

import style from './index.module.less';
import { schema } from './schemas';
import FormilyPictureCardUpload from '../../../../components/FormilyPictureCardUpload';
import { LcaEnumResp } from '../../hook/type';
import { SOURCE_TYPE_MAPPING } from '../../utils';
import {
  postProductionAdd,
  postProductionEdit,
  getProductionDetail,
} from '../service';
import { Product } from '../type';

const { add, edit, show } = PageTypeInfo;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    TextArea,
    FormilyPictureCardUpload,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});
interface ProductManagementInfoProps {
  /** 抽屉的显隐 */
  open: boolean;
  /** 列表操作按钮的类型 */
  actionBtnType?: string;
  /** 产品ID */
  productId?: number;
  /** 所属组织的枚举 */
  orgList: OrgPojo[];
  /** 来源系统的枚举 */
  sourceSystemList: LcaEnumResp[];
  /** 保存方法 */
  onOk: () => void;
  /** 取消方法 */
  onClose: () => void;
}
export const ProductManagementInfo = ({
  open,
  actionBtnType,
  productId,
  orgList,
  sourceSystemList,
  onOk,
  onClose,
}: ProductManagementInfoProps) => {
  const isAdd = actionBtnType === add;
  const isDetail = actionBtnType === show;

  /** 抽屉标题 */
  const titleMap = {
    [add]: I18N.carbonFootPrintLCA.newProductsAdded,
    [edit]: I18N.carbonFootPrintLCA.editProduct,
    [show]: I18N.carbonFootPrintLCA.productDetails,
  };
  const title = titleMap[actionBtnType as keyof typeof titleMap];

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 接口返回的languageSourceList */
  const [apiLanguageSourceList, setApiLanguageSourceList] =
    useState<ApiLanguageSourceList[]>();

  /** 保存时的api接口 */
  const postApi = isAdd ? postProductionAdd : postProductionEdit;

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
    /** 新增时：产品编码自动生成 */
    if (isAdd && !productId) {
      form.setFieldState('productCode', {
        value: new Date().getTime(),
      });
    }
    /** 获取产品详情 */
    if (!isAdd && productId) {
      /** 编辑时，所属组织不能编辑 */
      form.setFieldState('orgId', {
        disabled: true,
        required: false,
      });

      getProductionDetail({ id: productId }).then(({ data }) => {
        const result = data?.data || {};

        const { productImg } = result;
        /** 产品照片的名称 */
        const nameArr = productImg?.split('/');
        /** 产品照片 */
        const productImgArr = productImg
          ? [
              {
                url: productImg,
                uid: `${new Date().getTime() + 2}`,
                name: nameArr?.[nameArr.length - 1],
              },
            ]
          : undefined;
        setApiLanguageSourceList(result?.languageSourceList);
        /** 反处理多语言 */
        const langFields = reverseHandleLangFields(result?.languageSourceList);
        form.setValues({
          ...data?.data,
          ...langFields,
          productImg: productImgArr,
        });
      });
    }
  }, [isAdd, productId]);

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
    if (sourceSystemList) {
      /** 来源系统 */
      form.setFieldState('sourceSystem', {
        dataSource: sourceSystemList.map(item => ({
          label: item.name,
          value: item.code,
        })),
      });
    }
  }, [orgList, actionBtnType, sourceSystemList]);

  return (
    <Drawer
      className={`${style.wrapper}`}
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
              const values = await form.submit<Product>();
              const { productImg } = values || {};

              try {
                setBtnLoading(true);
                /** 处理多语言 */
                const languageSourceList = handleLangFields({
                  rawData: values,
                  langType: LANG_TYPE.EN,
                  sourceTypeMapping: SOURCE_TYPE_MAPPING,
                  apiLanguageSourceList,
                });
                const result = {
                  ...values,
                  languageSourceList,
                  productImg: isArray(productImg)
                    ? productImg[0]?.url
                    : productImg,
                };
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
