/**
 * @file 组织边界
 * @author lxc
 * */

import I18N from '@src/lang/I18N';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { FormProps } from 'antd/lib/form';
import { useEffect, useState } from 'react';
// import { FormActions } from '@src/components/FormActions';
// import { Toast } from '@src/utils/Toast';
import { Button, Form } from 'antd';
import { useHistory } from 'react-router-dom';
import '../../../style.less';
import { FormActions } from '@src/components/FormActions';
import { PropsType } from '@src/views/enterpriseCarbonAccount2/service';
// import { apiEnterprisePlanDetail } from '../../../service';

export const Boundary = (props: PropsType) => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [canEdit, setCanEdit] = useState(false);
  // let pageType = '';
  /** 基础信息表单 */
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  // const id = new URLSearchParams(location.search).get('id');
  useEffect(() => {
    form.setFieldsValue(props.data);
  }, [props]);
  const formItems: any = [
    {
      label: I18N.enterpriseCarbonAccount2.organizationalBoundaryDesign,
      name: 'borderMethod',
      type: 'select',
      rules: canEdit,
      placeholder: canEdit ? I18N.carbonFootprint.pleaseSelect : '\n',
      col: 12,
      props: {
        disabled: !canEdit,
        options: [
          { value: '0', label: I18N.enterpriseCarbonAccount2.operationalControl },
          { value: '1', label: I18N.enterpriseCarbonAccount2.financialControl },
          { value: '2', label: I18N.enterpriseCarbonAccount2.equityRatioMethod },
        ],
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.organizationalBoundaryTracing,
      name: 'borderDesc',
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      type: 'textArea',
      rules: canEdit,
      col: 24,
      props: {
        rows: 4,
        disabled: !canEdit,
        maxLength: 1000,
        showCount: true,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.organizationalBoundaryChange,
      name: 'borderChange',
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      type: 'textArea',
      rules: false,
      col: 24,
      props: {
        rows: 4,
        disabled: !canEdit,
        maxLength: 5000,
        showCount: true,
      },
    },
  ];
  return (
    <div className='boundary'>
      <div className='form-width'>
        <div className='edit-box'>
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
                      props.saveData({
                        ...values,
                      });
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
          paddRight={30}
        />
      </div>
      <FormActions
        place='center'
        buttons={[
          {
            type: 'default',
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.go(-1);
            },
          },
        ]}
      />
    </div>
  );
};
