/**
 * @description 产品基本信息
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
import { Button } from 'antd';
import { compact, isArray } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import FormilyPictureCardUpload from '@/components/FormilyPictureCardUpload';
import { Page } from '@/components/LcaPage';
import { TextArea } from '@/components/formily/TextArea';
import { useOrgs } from '@/hooks';
import {
  ApiLanguageSourceList,
  handleLangFields,
  LANG_TYPE,
  reverseHandleLangFields,
  Toast,
} from '@/utils';
import { ORG_STATUS } from '@/utils/const';
import { useLcaEnums } from '@/views/carbonFootPrintLCAnew/hook';
import { SOURCE_TYPE_MAPPING } from '@/views/carbonFootPrintLCAnew/utils';

import { schema } from './schemas';
import {
  getProductionDetail,
  postProductionAdd,
  postProductionEdit,
} from '../../service';
import { Product } from '../../type';
import { BasicProps } from '../type';

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

const BasicInfo = ({ onClickBack, productId }: BasicProps) => {
  const isAdd = false;

  /** 所属组织枚举 */
  const orgList = useOrgs();

  /** 来源系统枚举 */
  const sourceSystemList = useLcaEnums('SourceSystem');

  /** 接口返回的languageSourceList */
  const [apiLanguageSourceList, setApiLanguageSourceList] =
    useState<ApiLanguageSourceList[]>();

  /** 是否是详情态 */
  const [isDetail, setIsDetail] = useState(true);

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 保存时的api接口 */
  const postApi = isAdd ? postProductionAdd : postProductionEdit;

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
      }),
    [isDetail],
  );

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

      getProductionDetail({ id: Number(productId) }).then(({ data }) => {
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
  }, [isDetail, productId]);

  /** 设置表单枚举值 */
  useEffect(() => {
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
  }, [isDetail, orgList, sourceSystemList]);

  return (
    <div>
      <Page
        title={I18N.carbonFootPrintLCA.basicProductInformation}
        rightRender={
          <Button
            type='primary'
            loading={!isDetail && btnLoading}
            key='save'
            onClick={async () => {
              // 编辑保存按钮切换
              if (!isDetail) {
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
                } catch (e) {
                  setBtnLoading(false);
                  throw e;
                }
              }
              setIsDetail(!isDetail);
            }}
          >
            {isDetail ? I18N.Factors.edit : I18N.Factors.preserve}
          </Button>
        }
      >
        <Form form={form} previewTextPlaceholder='-'>
          <SchemaField schema={schema()} />
        </Form>

        <FormActions
          place='center'
          buttons={compact([
            {
              title: I18N.Factors.return,
              onClick: async () => {
                onClickBack();
              },
            },
          ])}
        />
      </Page>
    </div>
  );
};

export default BasicInfo;
