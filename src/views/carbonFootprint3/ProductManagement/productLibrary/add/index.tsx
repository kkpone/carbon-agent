/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-10 17:13:57
 * @Date: 2022-12-23 16:43:00
 * @@description: 产品库 - 新增，编辑和详情
 */
import {
  FormItem,
  Input,
  Select,
  FormLayout,
  FormGrid,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import FormilyImgUpload from '@src/views/carbonFootprint3/component/FormilyImgUpload';
import { Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  productLibraryBasicSchema,
  productLibraryAttributeSchema,
} from './model';
import styleCarbonFootprint3 from '../../../index.module.less';
import {
  getProductLibraryAddInit,
  getProductLibraryTableInfo,
  postProductLibraryAddData,
  postProductLibraryEditData,
} from '../../service';
import {
  ProductExtra,
  ProductLibraryAddData,
  ProductLibraryTableDataDetail,
  ProductLibraryTableDataInit,
} from '../../type';

const showExtras = false;

const ProductLibraryAdd = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { pathname } = history.location;
  /** 是否是编辑状态 */
  const isEdit = pathname.includes('edit');
  /** 是否是查看状态 */
  const isDetail = pathname.includes('detail');
  /** 自定义属性的加载状态 */
  const [extrasLoading, setExtrasLoading] = useState<boolean>(false);
  /** 新增初始化 - 获取产品属性和产品编码 */
  const [initInfo, setInitInfo] = useState<ProductLibraryTableDataInit>();
  /** 编辑的详情信息 */
  const [detailInfo, setDetailInfo] = useState<ProductLibraryTableDataDetail>();
  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = useMemo(createForm, []);
  // 创建一个 SchemaField 组件用于解析JSON-Schema动态渲染表单的组件
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormilyImgUpload,
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Select,
    },
  });

  /**
   * @description: 提交表单的form
   */
  const subForm = async () => {
    const backForm: ProductLibraryAddData = await form.submit();
    let productExtras =
      initInfo?.productExtras || detailInfo?.productExtras || [];
    productExtras = productExtras.map(extra => ({
      ...extra,
      value: backForm[`${extra.extraId}_KEY`],
    }));

    const back = isEdit
      ? await postProductLibraryEditData({
          ...backForm,
          id,
          productExtras,
        })
      : await postProductLibraryAddData({
          ...backForm,
          productExtras,
        });
    if (back.data.code === 200) {
      Toast(
        'success',
        isEdit
          ? I18N.carbonFootprint.editSuccessful
          : I18N.carbonFootprint.newSuccessfullyAdded2,
      );
      history.goBack();
    }
  };

  /**
   * @description: 初始化详情状态
   */
  const initDetail = async () => {
    setExtrasLoading(true);
    const back = await getProductLibraryTableInfo({ id });
    const { data } = back.data;
    form.setValues(data);
    form.setFormState({
      // disabled: true,
      readPretty: true,
    });
    setDetailInfo(data);
    setExtrasLoading(false);
  };

  /**
   * @description: 初始化编辑状态
   */
  const initEdit = async () => {
    setExtrasLoading(true);
    const back = await getProductLibraryTableInfo({ id });
    const { data } = back.data;
    form.setValues(data);
    form.setFieldState('productCode', state => {
      state.disabled = true;
    });
    setDetailInfo(data);
    setExtrasLoading(false);
  };

  /**
   * @description: 新增产品的时候，初始化
   */
  const initAdd = async () => {
    setExtrasLoading(true);
    const back = await getProductLibraryAddInit();
    const { data } = back.data;
    form.setValues({
      productCode: data.productCode,
    });
    setInitInfo(data);
    setExtrasLoading(false);
  };

  /**
   * @description: 只显示被启用的属性
   * @param {ProductExtra} extras 产品属性接口返回的值
   */
  const filtrationExtras = (extras: ProductExtra[]) => {
    // 返回启用的属性
    const extrasData = extras.filter(back => back.status === 0);

    return extrasData;
  };

  const init = async () => {
    if (pathname.includes('add')) {
      await initAdd();
    }
    if (isEdit) {
      await initEdit();
    }
    if (isDetail) {
      await initDetail();
    }
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <div className={`${styleCarbonFootprint3.carbonFootprint3} m-b-60`}>
      <FormilyCommon form={form}>
        <>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>
            {I18N.carbonFootprint.basicInformation}
          </div>
          <SchemaField schema={productLibraryBasicSchema()} />
          {showExtras && (
            <>
              <div style={{ fontWeight: 600, marginBottom: 16, marginTop: 20 }}>
                {initInfo &&
                initInfo.productExtras &&
                initInfo.productExtras.length > 0
                  ? I18N.carbonFootprint3.productAttributes
                  : ''}
                {detailInfo &&
                detailInfo.productExtras &&
                detailInfo.productExtras.length > 0
                  ? I18N.carbonFootprint3.productAttributes
                  : ''}
              </div>
              <Spin style={{ minHeight: 200 }} spinning={extrasLoading}>
                {initInfo && (
                  <SchemaField
                    schema={productLibraryAttributeSchema(
                      filtrationExtras(initInfo.productExtras),
                      isDetail,
                    )}
                  />
                )}
                {detailInfo && (
                  <SchemaField
                    schema={productLibraryAttributeSchema(
                      filtrationExtras(detailInfo.productExtras),
                      isDetail,
                    )}
                  />
                )}
              </Spin>
            </>
          )}
        </>
      </FormilyCommon>
      <FormActions
        place='center'
        buttons={
          isDetail
            ? [
                {
                  title: I18N.carbonFootprint.return,
                  onClick: async () => {
                    history.goBack();
                  },
                },
              ]
            : [
                {
                  type: 'primary',
                  title: I18N.carbonFootprint.preserve,
                  onClick: async () => subForm(),
                },
                {
                  title: I18N.carbonFootprint.return,
                  onClick: async () => {
                    history.goBack();
                  },
                },
              ]
        }
      />
    </div>
  );
};

export default ProductLibraryAdd;
