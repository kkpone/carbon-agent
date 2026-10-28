/*
 * @Author: 张明尧
 * @Date: 2022-07-29 11:37:25
 */
/**
 * 表单的通用的组件
 * @returns
 */
import I18N from '@src/lang/I18N';
import { Col, Form, Row } from 'antd';
// import { Fragment } from 'react';
import { getFormItem } from './FormItemUtilItem';
import { FromUtilProps } from './type';

const FormItemUtil = (props: FromUtilProps) => {
  const {
    antdFormProps: { readonly, ...formProps },
    paddRight,
  } = props;

  return (
    <div className='util-form-box'>
      <Form {...formProps}>
        <Row key='form_row'>
          {props.formItems &&
            props.formItems.map(item => (
              <>
                <Col
                  span={item.col || 8}
                  key={item.name}
                  className={item.colClassName}
                  offset={item.offset}
                  style={
                    item?.padding
                      ? { padding: item.padding }
                      : { paddingRight: paddRight || 40 }
                  }
                >
                  <Form.Item
                    label={item.label}
                    style={item.noShow ? { display: 'none' } : {}}
                    key={item.name}
                    name={item.name}
                    dependencies={item.dependencies}
                    rules={[
                      !item.rulesCustom
                        ? {
                            required: item.rules,
                            message: I18N.template(I18N.components.iteml2, { val1: item.label }),
                          }
                        : {
                            required: item.rules,
                            message: '',
                          },
                      ...(item.rulesCustom ? item.rulesCustom : []),
                    ]}
                  >
                    {getFormItem({ item, readOnly: readonly })}
                  </Form.Item>
                </Col>
                {item.rightOff ? <Col span={item.rightOff} /> : ''}
              </>
            ))}
        </Row>
      </Form>
    </div>
  );
};

export default FormItemUtil;
