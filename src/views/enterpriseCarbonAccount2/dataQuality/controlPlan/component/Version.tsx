/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-10-18 14:21:08
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-09 11:20:48
 */
/**
 * @file 版本及修订
 * @author lixingchen
 * */

import I18N from '@src/lang/I18N';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { FormProps } from 'antd/lib/form';
import { useState, useEffect } from 'react';
import { Button, Form } from 'antd';
import '../../../style.less';
import { PropsType } from '@src/views/enterpriseCarbonAccount2/service';

export const Version = (props: PropsType) => {
  const [form] = Form.useForm();
  /** 基础信息表单 */
  const [canEdit, setCanEdit] = useState(props.setPropCanEdit);
  useEffect(() => {
    form.setFieldsValue({ ...props.data });
  }, [props.data]);
  useEffect(() => {
    setCanEdit(props.setPropCanEdit);
  }, [props.setPropCanEdit]);
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const formItems: any = [
    {
      label: I18N.Certification.versionNumber2,
      name: 'versionCode',
      type: 'input',
      rules: canEdit,
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      col: 12,
      props: {
        disabled: !canEdit,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.whenFormulatingRevisions,
      name: 'enactTime',
      placeholder: canEdit ? I18N.carbonFootprint.pleaseSelect : '\n',
      rules: canEdit,
      type: 'date',
      col: 12,
      props: {
        disabled: !canEdit,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.withinTheFormulationAndRevision,
      name: 'enactContent',
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      type: 'textArea',
      rules: canEdit,
      col: 24,
      props: {
        disabled: !canEdit,
        maxLength: 500,
        showCount: true,
        rows: 4,
      },
    },
    {
      label: I18N.carbonFootprint.remarks,
      name: 'remark',
      placeholder: canEdit ? I18N.carbonFootprint.pleaseEnter : '\n',
      type: 'textArea',
      rules: false,
      col: 24,
      props: {
        disabled: !canEdit,
        maxLength: 500,
        showCount: true,
        rows: 4,
      },
    },
  ];
  return (
    <div>
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
                    // form.resetFields();
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
          paddRight={30}
        />
      </div>
    </div>
  );
};
