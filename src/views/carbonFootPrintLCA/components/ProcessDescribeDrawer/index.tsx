/**
 * @description 过程描述详情抽屉
 */
import { TextArea } from '@components/TextArea';
import {
  DatePicker,
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Drawer } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { IconFont } from '@/components/LcaIconFont';
import { useAllEnumsBatch } from '@/hooks';
import { PageTypeInfo } from '@/router/utils/enums';
import { Toast } from '@/utils';

import { DRAWER_TITLE } from './constant';
import style from './index.module.less';
import { processSchema, otherSchema } from './schemas';
import { OptionsType } from '../../CarbonFootprintModel/type';
import { LifeCycleDataResponse } from '../../ProductManagement/Management/LifeCycleData/type';
import { useLcaEnums } from '../../hook';
import ChooseLifeCycleDataModal from '../ChooseLifeCycleDataModal';

const { show, add } = PageTypeInfo;

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    TextArea,
    Radio,
    DatePicker,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
  },
});

const isValidTimeRange = (timeRepresent: string): boolean =>
  /^\d{4}-\d{4}$/.test(timeRepresent);

interface ProcessDescribeProps<T extends object> {
  /** 当前选择的组织id */
  orgId?: number;
  /** 默认选择组织下的产品id */
  defaultProductId?: number;
  /** 是否展示报告披露字段 */
  showReportDisclosureField?: boolean;
  /** 生命周期枚举 */
  lifeCycleList?: OptionsType[];
  /** 操作按钮的类型 */
  actionBtnType?: string;
  /** 控制抽屉的显隐 */
  open: boolean;
  /** 过程描述详情 */
  processDescDataSource?: T & {
    timeRepresentStart?: number;
    timeRepresentEnd?: number;
    areaRepresent?: string;
  };
  /** 过程描述详情 */
  defaultProcessDescData?: T & {
    timeRepresentStart?: number;
    timeRepresentEnd?: number;
    areaRepresent?: string;
  };
  /** 保存方法 */
  onSave: (
    /** 表单要保存的数据 */
    values: T,
    /** 成功回调 */
    successCallBack: () => void,
    /** 失败回调 */
    failCallBack: () => void,
  ) => void;
  /** 关闭抽屉的方法 */
  onClose: () => void;
}

const ProcessDescribeDrawer = <T extends object = any>({
  orgId,
  defaultProductId,
  showReportDisclosureField = false,
  lifeCycleList,
  actionBtnType,
  open,
  processDescDataSource,
  defaultProcessDescData,
  onSave,
  onClose,
}: ProcessDescribeProps<T>) => {
  /** 是否是详情 */
  const isDetail = actionBtnType === show;

  /** 是否是新增 */
  const isAdd = actionBtnType === add;

  /** 抽屉标题 */
  const title = DRAWER_TITLE[actionBtnType as keyof typeof DRAWER_TITLE];

  /** 地理代表性枚举 */
  const areaRepresentOptions = useAllEnumsBatch('productOrigin')?.productOrigin;

  /** 多输出分配方式 */
  const multiOutputTypeOptions = useLcaEnums('MultiOutputType');

  /** 数据类型 */
  const processDataTypeOptions = useLcaEnums('ProcessDataType');

  /** 保存按钮的loading */
  const [btnLoading, setBtnLoading] = useState(false);

  /** 选择过程数据弹窗的显隐 */
  const [chooseLifeCycleDataModalOpen, setChooseLifeCycleDataModalOpen] =
    useState(false);

  /** 选择的过程数据Code */
  const [selectedLifeCycleDataCode, setSelectedLifeCycleDataCode] =
    useState<string>();

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
      }),
    [isDetail],
  );

  /** 判断是否展示数据披露字段 */
  useEffect(() => {
    form.setFieldState('reportFlag', {
      visible: showReportDisclosureField,
    });
  }, [showReportDisclosureField]);

  useEffect(() => {
    /** 0724新增逻辑 新增过程变更位置 并携带默认阶段 */
    if (isAdd) {
      form.setValues(defaultProcessDescData || {});
    }
  }, [actionBtnType, defaultProcessDescData]);

  /** 详情展示 */
  useEffect(() => {
    if (!actionBtnType || !processDescDataSource || isAdd) {
      return;
    }
    const { timeRepresentStart, timeRepresentEnd, areaRepresent } =
      processDescDataSource;
    form.setValues({
      ...processDescDataSource,
      timeRepresentStart: timeRepresentStart || undefined,
      timeRepresentEnd: timeRepresentEnd || undefined,
      areaRepresent: areaRepresent || undefined,
    });
    if (isDetail && !timeRepresentStart && !timeRepresentEnd) {
      form.setValuesIn('timeRepresentStart', '-');
    }
  }, [processDescDataSource, actionBtnType]);

  /** 表单枚举 */
  useEffect(() => {
    if (!actionBtnType) {
      return;
    }

    if (lifeCycleList) {
      /** 生命周期阶段 */
      form.setFieldState('lifeCycleId', {
        dataSource: lifeCycleList,
      });
    }

    /** 地理代表性 */
    if (areaRepresentOptions) {
      form.setFieldState('areaRepresent', {
        dataSource: areaRepresentOptions.map(item => ({
          label: item.dictLabel,
          value: item.dictValue,
        })),
      });
    }

    /** 多输出分配方式 */
    if (multiOutputTypeOptions) {
      form.setFieldState('multiOutputType', {
        dataSource: multiOutputTypeOptions.map(item => ({
          label: item.name,
          value: item.code,
        })),
      });
    }

    /** 数据类型 */
    if (processDataTypeOptions) {
      form.setFieldState('processDataType', {
        dataSource: processDataTypeOptions.map(item => ({
          label: item.name,
          value: item.code,
        })),
      });
    }
  }, [
    areaRepresentOptions,
    actionBtnType,
    lifeCycleList,
    multiOutputTypeOptions,
    processDataTypeOptions,
  ]);

  /** 抽屉关闭 */
  const onDrawerClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Drawer
      className={`${style.wrapper}`}
      title={title}
      open={open}
      closeIcon={false}
      maskClosable={false}
      destroyOnClose
      placement='right'
      size='large'
      width='55%'
      extra={
        <div className={style.closeIcon} onClick={() => onDrawerClose()}>
          <IconFont icon='icon-icon-guanbi' />
        </div>
      }
      onClose={() => onDrawerClose()}
      footer={[
        <Button onClick={() => onDrawerClose()}>
          {isDetail ? I18N.carbonFootPrintLCA.close : I18N.Factors.cancel}
        </Button>,
        !isDetail && (
          <Button
            type='primary'
            loading={btnLoading}
            onClick={async () => {
              const values = await form.submit<T>();
              setBtnLoading(true);
              onSave(
                { ...values, impProcessCode: selectedLifeCycleDataCode },
                () => {
                  Toast('success', I18N.Factors.saveSuccessful);
                  form.reset();
                  setBtnLoading(false);
                },
                () => {
                  setBtnLoading(false);
                },
              );
            }}
          >
            {I18N.Factors.preserve}
          </Button>
        ),
      ]}
    >
      <div className={style.content}>
        {/* 选择过程数据按钮-只在新增过程时展示 */}
        {isAdd && (
          <Button
            type='primary'
            className={style.chooseProcessDataBtn}
            onClick={() => setChooseLifeCycleDataModalOpen(true)}
          >
            {I18N.carbonFootPrintLCA.numberOfSelectionProcesses}
          </Button>
        )}
        <Form form={form} previewTextPlaceholder='-'>
          <SchemaField schema={processSchema()} />
          <SchemaField schema={otherSchema()} />
        </Form>
      </div>

      {/* 选择过程数据弹窗 */}
      <ChooseLifeCycleDataModal
        orgId={orgId}
        defaultProductId={defaultProductId}
        open={chooseLifeCycleDataModalOpen}
        handleCancel={() => setChooseLifeCycleDataModalOpen(false)}
        handleOk={({ selectRows }: { selectRows: LifeCycleDataResponse[] }) => {
          const {
            processName,
            processDesc,
            timeRepresent,
            areaRepresent,
            techRepresent,
            processCode,
          } = selectRows[0];
          /** 判断时间代表性是否符合规范 */
          const timeRepresentBack = isValidTimeRange(timeRepresent)
            ? timeRepresent
            : undefined;
          const timeRepresentStart = timeRepresentBack?.split('-')[0];
          const timeRepresentEnd = timeRepresentBack?.split('-')[1];

          /** 判断地理代表性是否符合规范 */
          const areaRepresentBack = areaRepresentOptions?.find(
            v => v.dictLabel === areaRepresent,
          )?.dictValue;

          setSelectedLifeCycleDataCode(processCode);

          form.setValues({
            processName,
            processDesc,
            timeRepresentStart,
            timeRepresentEnd,
            areaRepresent: areaRepresentBack,
            techRepresent,
          });
          setChooseLifeCycleDataModalOpen(false);
        }}
      />
    </Drawer>
  );
};
export default ProcessDescribeDrawer;
