/**
 * @description 配置主要研究对象弹窗
 */

import { Form, FormItem, FormLayout, Input, Select } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Modal, Radio } from 'antd';
import { compact } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { usePageInfo } from '@/hooks';
// import { LCARouteMaps } from '@/router/utils/lcaEnums';
import { useLifeCycleList } from '@/views/carbonFootPrintLCA/hook';

import { MODELLING_WAY } from './constant';
import style from './index.module.less';
import { setMainResearchObjSchema } from './schema';
import { IO_TYPE } from '../../Info/constant';
import { SetMainResearchObjRequest } from '../../type';

const { MANUAL_MODELLING, AUTO_MODELLING } = MODELLING_WAY;

type SetMainResearchObjModalProps = {
  /** 默认生命周期阶段的ID */
  defaultLifeCycleId: number;
  /** 控制弹窗显隐 */
  open: boolean;
  /** 关闭弹窗的方法 */
  onCancel: () => void;
  /** 弹窗确定按钮的方法 */
  onOk: (values: SetMainResearchObjRequest) => void;
  /** 确定按钮的loading */
  confirmLoading?: boolean;
  /** 生命周期id列表 */
  lifeCycleListIds?: string;
  /** 产品名称 */
  productName?: string;
  /** 点击导入清单的方法 */
  onImport?: () => void;
};

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    FormLayout,
    Select,
  },
});

export const SetMainResearchObjModal: FC<SetMainResearchObjModalProps> = ({
  defaultLifeCycleId,
  open,
  onCancel,
  onOk,
  confirmLoading = false,
  lifeCycleListIds,
  productName,
  onImport,
}) => {
  // const navigate = useNavigate();

  // /** 模型ID */
  // const { id } = usePageInfo();

  /** 当前建模方式 */
  const [currentModelling, setCurrentModelling] = useState(MANUAL_MODELLING);

  /** 是否是手动建模 */
  const isManual = currentModelling === MANUAL_MODELLING;

  /** 生命周期枚举 */
  const lifeCycleListOptions = useLifeCycleList(lifeCycleListIds);

  const form = useMemo(() => createForm(), [open]);

  useEffect(() => {
    if (productName) {
      form.setValuesIn('productName', productName);
      form.setValuesIn(
        'processName',
        I18N.template(I18N.carbonFootPrintLCA.productProcessName, {
          val1: productName,
        }),
      );
    }

    if (lifeCycleListOptions) {
      form.setFieldState('lifeCycleId', {
        dataSource: lifeCycleListOptions.map(lifeCycle => {
          if (lifeCycle.id === defaultLifeCycleId) {
            form.setValuesIn('lifeCycleId', defaultLifeCycleId);
          }
          return {
            label: lifeCycle?.stageName,
            value: lifeCycle?.id,
          };
        }),
      });
    }
  }, [lifeCycleListOptions, productName, open, defaultLifeCycleId]);

  return (
    <Modal
      title=''
      open={open}
      confirmLoading={confirmLoading}
      maskClosable={false}
      width={400}
      onOk={async () => {
        const values = await form.submit<SetMainResearchObjRequest>();
        onOk({ ...values, ioType: IO_TYPE.OUTPUT });
      }}
      onCancel={onCancel}
      footer={compact([
        <Button key='cancel' onClick={onCancel}>
          {I18N.Factors.cancel}
        </Button>,
        isManual && (
          <Button
            key='ok'
            onClick={async () => {
              const values = await form.submit<SetMainResearchObjRequest>();
              onOk({ ...values, ioType: IO_TYPE.OUTPUT });
            }}
            type='primary'
          >
            {I18N.carbonFootPrintLCA.confirm}
          </Button>
        ),
        !isManual && (
          <Button
            key='list'
            type='primary'
            onClick={() => {
              // navigate(`${LCARouteMaps.lcaModelInfoImport}?modelId=${id}`);
              onImport?.();
            }}
          >
            {I18N.carbonFootPrintLCA.importInventory}
          </Button>
        ),
      ])}
    >
      <h3>{I18N.carbonFootPrintLCA.selectModelingParty}</h3>
      <Radio.Group
        onChange={e => {
          setCurrentModelling(e.target.value);
        }}
        defaultValue={currentModelling}
        className={style.radioGroup}
      >
        <Radio value={MANUAL_MODELLING}>
          {I18N.carbonFootPrintLCA.manualModeling}
        </Radio>
        <Radio value={AUTO_MODELLING}>
          {I18N.carbonFootPrintLCA.automaticModeling}
        </Radio>
      </Radio.Group>

      <Form form={form} previewTextPlaceholder='-'>
        {isManual ? (
          <div>
            <h3>{I18N.carbonFootPrintLCA.mainResearchOnConfiguration}</h3>
            <SchemaField schema={setMainResearchObjSchema()} />
          </div>
        ) : (
          <div>{I18N.carbonFootPrintLCA.clickImportClear}</div>
        )}
      </Form>
    </Modal>
  );
};
