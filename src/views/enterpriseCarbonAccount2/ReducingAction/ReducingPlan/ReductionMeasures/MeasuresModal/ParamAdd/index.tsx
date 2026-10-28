import I18N from '@src/lang/I18N';
import { PlusCircleFilled } from '@ant-design/icons';
import { ArrayField } from '@formily/core';
import { FormConsumer, observer, useForm } from '@formily/react';
import { Button } from 'antd';

import { nanoid } from '@/utils';

import styles from './index.module.less';
import { PARAM_TYPE } from '../../constant';

const ParamAdd = observer(() => {
  const form = useForm();

  const paramArrayField = form.query('paramItem').take() as ArrayField;

  const add = () => {
    paramArrayField.push({ id: nanoid(), type: PARAM_TYPE.ABSOLUTE });
  };

  return (
    <FormConsumer>
      {formIns =>
        formIns.readPretty ? (
          <div />
        ) : (
          <Button
            className={styles.addBtn}
            icon={<PlusCircleFilled />}
            type='dashed'
            onClick={add}
          >
            {I18N.enterpriseCarbonAccount2.addParameters}
          </Button>
        )
      }
    </FormConsumer>
  );
});

export default ParamAdd;
