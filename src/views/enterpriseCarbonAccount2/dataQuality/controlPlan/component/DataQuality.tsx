/**
 * @file 数据质量管理规定
 * @author lxc
 * */

import I18N from '@src/lang/I18N';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { FormProps } from 'antd/lib/form';
import { useEffect, useState } from 'react';
import { Button, Form } from 'antd';
import '../../../style.less';
import { PropsType } from '@src/views/enterpriseCarbonAccount2/service';

export const DataQuality = (props: PropsType) => {
  const [form] = Form.useForm();
  /** 基础信息表单 */
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => {
    form.setFieldsValue(props.data);
  }, [props]);
  const formItems: any = [
    {
      label: I18N.enterpriseCarbonAccount2.dataQualityManagement,
      name: 'dataQuality',
      placeholder: canEdit ? I18N.enterpriseCarbonAccount2.internalQualityOfData : '\n',
      type: 'textArea',
      rules: canEdit,
      col: 24,
      props: {
        disabled: !canEdit,
        rows: 10,
        maxLength: 5000,
        showCount: true,
      },
    },
  ];
  return (
    <div className='product padd-t-16'>
      <div className='flex-j-b'>
        {/* <p>功能描述：此处为一段描述</p> */}
        <p>&nbsp;</p>
        {props.pageType === 'detail' ? (
          ''
        ) : (
          <div>
            {canEdit ? (
              <Button
                style={{ marginRight: 20 }}
                type='default'
                onClick={() => {
                  setCanEdit(!canEdit);
                  props.getData();
                }}
              >
                {I18N.carbonFootprint.cancel}</Button>
            ) : (
              ''
            )}
            <Button
              ghost
              type='primary'
              onClick={() => {
                if (!canEdit) {
                  setCanEdit(!canEdit);
                } else {
                  form.validateFields().then(values => {
                    setCanEdit(!canEdit);
                    props.saveData(values);
                  });
                }
              }}
            >
              {canEdit ? I18N.carbonFootprint.preserve : I18N.carbonFootprint.edit}
            </Button>
          </div>
        )}
      </div>
      <FormItemUtil
        antdFormProps={basicsFormProps}
        formItems={formItems}
        paddRight={1}
      />
    </div>
  );
};
