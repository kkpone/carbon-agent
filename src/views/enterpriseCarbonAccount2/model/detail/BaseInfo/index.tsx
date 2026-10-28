import {
  FormLayout,
  FormGrid,
  FormItem,
  Input,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { GET1b7ca30eecc5240178811374fdaae26d as GetModelInfo } from '@src/sdks_v2/enterpriseV2ApiDocs';
import { useMount } from 'ahooks';
import { FC, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './index.module.less';
import { baseSchema } from './schema';
import { apiAccountModeAdd, apiAccountModeEdit } from './service';

type BaseInfoProps = {
  isShow?: boolean;
  isEdit?: boolean;
  modelId?: string;
  nextStep?: (computationId?: string) => void;
};

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormLayout,
    FormGrid,
    FormItem,
    Input,
    Select,
  },
});

export const BaseInfo: FC<BaseInfoProps> = props => {
  const { isShow = false, isEdit = false, modelId, nextStep } = props;
  const history = useHistory();

  const Form = useMemo(
    () =>
      createForm({
        values: {
          quantization: '0',
          // gwp: '2',
        },
        readPretty: isShow,
      }),
    [isShow],
  );

  useMount(() => {
    if (modelId) {
      GetModelInfo({ modelId }).then(({ data }) => {
        const result = data?.data;
        if (result) {
          Form.setValues({ ...result });
        }
      });
    }
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.header}>
          {I18N.carbonFootprint.basicInformation}
        </div>
        <FormilyCommon form={Form}>
          <SchemaField schema={baseSchema()} />
        </FormilyCommon>
      </div>
      <FormActions
        width='100%'
        place='center'
        buttons={[
          {
            type: 'primary',
            title: I18N.carbonFootprint.nextStep,
            onClick: async () => {
              const values: Object = await Form.submit();
              if (isEdit) {
                await apiAccountModeEdit({
                  ...values,
                  modelId,
                });
                nextStep?.();
              } else if (isShow) {
                nextStep?.();
              } else {
                const result = await apiAccountModeAdd(values);
                nextStep?.(result.data.data.modelId.toString());
              }
            },
          },
          {
            type: 'default',
            title: I18N.carbonFootprint.cancel,
            onClick: async () => {
              history.push(
                RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountModelList,
              );
            },
          },
        ]}
      />
    </div>
  );
};
