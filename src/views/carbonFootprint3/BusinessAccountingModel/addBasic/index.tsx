/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-21 10:11:16
 * @Date: 2023-01-09 14:42:14
 * @@description: 核算模型 新增基本信息
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
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
  BusinessAccountinModelBasicRadioSchema,
  BusinessAccountinModelBasicSchema,
} from './model';
import styleCarbonFootprint3 from '../../index.module.less';
import {
  getQuickModelInfo,
  postBusinessAccountingModelAdd,
  postBusinessAccountingModelCopy,
  postBusinessAccountingModelEdit,
} from '../service';
import { BusinessAccountingModelAdd } from '../type';

const BusinessAccountingModelBasic = (props: {
  id?: string;
  modalDetail?: boolean;
}) => {
  // 因为在模型详情中会已弹出框的形式展示，所以id需要通过组件才能获取
  let { id } = useParams<{ id: string }>();
  if (props.id) id = props.id;
  // 弹框展示详情
  const { modalDetail } = props;

  const history = useHistory();
  const { pathname } = history.location;
  /** 是否是编辑状态 */
  const isEdit = pathname.includes('edit');
  /** 是否是复制状态 */
  const isCopy = pathname.includes('copy');
  // 用来创建表单核心领域模型，它是作为MVVM设计模式的标准 ViewModel
  const form = createForm();
  // 创建一个 SchemaField 组件用于解析JSON-Schema动态渲染表单的组件
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Select,
      Radio,
    },
  });
  /**
   * @description: 提交表单
   */
  const addForm = async () => {
    const formData = await form.submit<BusinessAccountingModelAdd>();
    let keyVal = 'Add';

    if (isEdit) keyVal = 'Edit';
    if (isCopy) keyVal = 'Copy';

    const statusKeyApi = {
      Add: postBusinessAccountingModelAdd,
      Edit: postBusinessAccountingModelEdit,
      Copy: postBusinessAccountingModelCopy,
    };

    // 调用分类接口
    const back = await statusKeyApi[keyVal]({ ...formData, id });

    if (back.data.code === 200) {
      // 编辑情况下 - 不需要跳转下个页面
      if (isEdit) {
        Toast('success', I18N.carbonFootprint.editSuccessful);
        history.goBack();
        return;
      }

      // 快速核算 - 核算管理页面
      if (formData.type === 0) {
        history.push(
          `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagement}/${back.data.data}`,
        );
      }
    }
  };

  /**
   * @description: 编辑初始化
   */
  const initEdit = async () => {
    const back = await getQuickModelInfo({ id });
    const { data } = back.data;
    form.setValues(data);
    form.setFieldState('type', state => {
      state.readPretty = true;
    });
  };

  /**
   * @description: 复制初始化
   */
  const initCopy = async () => {
    const back = await getQuickModelInfo({ id });
    const { data } = back.data;
    form.setValues({
      ...data,
      modelName: I18N.template(I18N.carbonFootprint3.datam, {
        val1: data.modelName,
      }),
    });
    form.setFieldState('type', state => {
      state.readPretty = true;
    });
  };

  /**
   * @description: 详情初始化
   */
  const initDetail = async () => {
    const back = await getQuickModelInfo({ id });
    const { data } = back.data;
    form.setValues(data);
    form.setFormState({
      readPretty: true,
    });
  };

  /**
   * @description: 页面初始化
   */
  const init = () => {
    if (isEdit) {
      initEdit();
    }

    if (isCopy) {
      initCopy();
    }

    if (modalDetail) {
      initDetail();
    }
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <div className={`${styleCarbonFootprint3.carbonFootprint3} m-b-60`}>
      <FormilyCommon form={form}>
        <>
          <SchemaField schema={BusinessAccountinModelBasicSchema()} />
          <SchemaField
            schema={BusinessAccountinModelBasicRadioSchema(modalDetail)}
          />
        </>
      </FormilyCommon>
      {!modalDetail && (
        <FormActions
          place='center'
          buttons={[
            {
              type: 'primary',
              title: isEdit
                ? I18N.carbonFootprint.preserve
                : I18N.carbonFootprint3.saveNextStep,
              onClick: addForm,
            },
            {
              title: I18N.carbonFootprint.return,
              onClick: async () => {
                history.goBack();
              },
            },
          ]}
        />
      )}
    </div>
  );
};

export default BusinessAccountingModelBasic;
