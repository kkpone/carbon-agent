/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-01-04 11:07:30
 * @Date: 2022-12-26 11:10:09
 * @@description: 产品属性的新增
 */
import {
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ProductAttributeAddSchema } from './model';
import styleCarbonFootprint3 from '../../../index.module.less';
import {
  getProductAttributeDetail,
  postProductAttributeAdd,
  postProductAttributeEdit,
} from '../../service';
import { ProductAttributeAddForm } from '../../type';

const ProductAttributeAdd = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { pathname } = history.location;
  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = createForm<ProductAttributeAddForm>();
  // 创建一个 SchemaField 组件用于解析JSON-Schema动态渲染表单的组件
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Radio,
      Select,
    },
  });
  const initEdit = async () => {
    const info = await getProductAttributeDetail({ id });
    const { data } = info.data;
    form.setInitialValues(data);
    form.setFieldState('type', state => {
      state.disabled = true;
    });
  };
  /**
   * @description: 提交表单
   */
  const subForm = async () => {
    const isEdit = pathname.includes('edit');
    const formData = await form.submit<ProductAttributeAddForm>();
    const back = isEdit
      ? await postProductAttributeEdit({ ...formData, id })
      : await postProductAttributeAdd(formData);
    if (back.data.code === 200) {
      Toast('success', I18N.carbonFootprint.saveSuccessful);
      history.goBack();
    }
  };
  /** 初始化 */
  const init = async () => {
    if (pathname.includes('edit')) {
      await initEdit();
    }
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <div className={`${styleCarbonFootprint3.carbonFootprint3} m-b-60`}>
      <FormilyCommon<ProductAttributeAddForm> form={form}>
        <>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>
            {I18N.carbonFootprint.basicInformation}
          </div>
          <SchemaField schema={ProductAttributeAddSchema()} />
        </>
      </FormilyCommon>
      <FormActions
        place='center'
        buttons={[
          {
            type: 'primary',
            title: I18N.carbonFootprint.preserve,
            onClick: subForm,
          },
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.goBack();
            },
          },
        ]}
      />
    </div>
  );
};
export default ProductAttributeAdd;
