/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-04 09:53:10
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 19:58:11
 */
import {
  FormGrid,
  FormItem,
  Input,
  Select,
  DatePicker,
} from '@formily/antd-v5';
import { Form } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import { ProcessBusinessAccountingMenu } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/type';
import { processSourceLibraryBasicSchema } from '@src/views/carbonFootprint3/discharge/process/model';
import { ReactNode } from 'react';

import styles from './index.module.less';

const SchemaField = createSchemaField({
  components: { FormItem, FormGrid, Input, Select, DatePicker },
});

type ProcessLibBasicFormProps<T extends object = {}> = {
  form: Form<T>;
  isEdit?: boolean;
  isProcessBusinessAccount?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  isProcess?: boolean;
  operateNode?: ReactNode;
  processTreeInfo?: ProcessBusinessAccountingMenu;
};

const ProcessLibBasicForm = <T extends object>(
  props: ProcessLibBasicFormProps<T>,
) => {
  const {
    form,
    operateNode,
    isEdit = true,
    isProcessBusinessAccount,
    processTreeInfo,
  } = props;

  // 是否是过程核算的根节点
  const isProcessAccountRoot =
    isProcessBusinessAccount && processTreeInfo?.parentId === '0';

  return (
    <FormilyCommon form={form}>
      <div className={styles.formSection}>
        <div className={styles.formTitle}>
          {I18N.carbonFootprint.basicInformation}
          {operateNode}
        </div>
        <SchemaField
          schema={processSourceLibraryBasicSchema({
            isEdit,
            isProcessBusinessAccount,
            isProcessAccountRoot,
          })}
        />
      </div>
    </FormilyCommon>
  );
};

export default ProcessLibBasicForm;
