/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-02-17 17:28:12
 * @Date: 2022-12-26 11:10:09
 * @@description: 表单通用型组件 - 产品碳足迹3.0正在使用
 */
import { Form, FormLayout } from '@formily/antd-v5';
import classNames from 'classnames';
import { memo } from 'react';

import styles from './index.module.less';
import { FormilyCommonProps } from './type';

const FormilyCommon = memo(
  <FormDataType extends object = any>(
    props: FormilyCommonProps<FormDataType>,
  ) => {
    const { form, children, className, colon = true } = props;
    const curMount = form.onMount;
    // const cuReactions = {
    //   when: '{{$self.value.length > 20 && $form.readPretty}}',
    //   fulfill: {
    //     schema: {
    //       'x-component': data => (
    //         <div
    //           style={{
    //             backgroundColor: '#f7f8f9',
    //             width: '100%',
    //             overflow: 'hidden',
    //             whiteSpace: 'nowrap',
    //             textOverflow: 'ellipsis',
    //             wordBreak: 'break-all',
    //             padding: '0 10px',
    //             fontWeight: 500,
    //           }}
    //         >
    //           <TextOverflowTable value={data.value} maxLength={20} />
    //         </div>
    //       ),
    //     },
    //   },
    // };
    form.onMount = () => {
      curMount();

      const formFieldsArr = Object.keys(form.fields);
      formFieldsArr.forEach(fieldPath => {
        const getField = form.getFieldState(fieldPath);
        if (getField.validator && Array.isArray(getField.validator)) {
          // form.setFieldState(fieldPath, {
          //   validator: [...getField.validator, cuReactions],
          // });
          // getField.validator = [...getField.validator, cuReactions];
          // console.log(getField.validator);
        }
      });
    };

    return (
      <div className={classNames(styles.formilyCommon, className)}>
        <Form form={form} previewTextPlaceholder='-'>
          <FormLayout layout='vertical' colon={colon}>
            {children}
          </FormLayout>
        </Form>
      </div>
    );
  },
);
export default FormilyCommon as <FormDataType extends object = any>(
  props: FormilyCommonProps<FormDataType>,
) => JSX.Element;
