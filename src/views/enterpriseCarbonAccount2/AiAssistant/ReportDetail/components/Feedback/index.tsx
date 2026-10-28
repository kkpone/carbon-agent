import {
  FormGrid,
  FormItem,
  Input,
  Select,
  Cascader,
  DatePicker,
  ArrayItems,
  NumberPicker,
  Radio,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import FormilyImgUpload from '@src/views/carbonFootprint3/component/FormilyImgUpload';
import { Button, Modal, message } from 'antd';
import React, { useState, useMemo } from 'react';

import styles from './index.module.less';
import { baseSchema } from './schema';
import { postSuggestion } from '../../service';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Cascader,
    DatePicker,
    ArrayItems,
    NumberPicker,
    Radio,
    FormilyImgUpload,
  },
});
interface FeedbackProps {
  // Add your props here
  reportId: number;
}

export const Feedback: React.FC<FeedbackProps> = props => {
  const { reportId } = props;
  const [visible, setVisible] = useState(false);

  const formProduct = useMemo(
    () =>
      createForm({
        initialValues: {},
      }),
    [],
  );
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const data = (await formProduct.submit()) as any;
    await postSuggestion({
      ...data,
      reportId,
    }).finally(() => setLoading(false));
    message.success(I18N.carbonFootprint.submittedSuccessfully);
    formProduct.reset();
    setVisible(false);
  };
  return (
    <div>
      <Button type='text' onClick={() => setVisible(true)}>
        {I18N.enterpriseCarbonAccount2.problemFeedback}
      </Button>
      <Modal
        open={visible}
        title={I18N.enterpriseCarbonAccount2.problemFeedback}
        okText={I18N.components.submit}
        wrapClassName={styles.wrapper}
        onCancel={() => {
          formProduct.reset();
          setVisible(false);
        }}
        destroyOnClose
        bodyStyle={{ padding: '6px 24px' }}
        onOk={() => submit()}
        okButtonProps={{
          loading,
        }}
      >
        <FormilyCommon form={formProduct}>
          <div>
            <SchemaField schema={baseSchema()} />
          </div>
        </FormilyCommon>
      </Modal>
    </div>
  );
};
