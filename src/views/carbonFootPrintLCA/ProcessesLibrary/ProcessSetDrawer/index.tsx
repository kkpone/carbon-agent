/*
 * @@description:新增过程集抽屉
 */
import {
  Checkbox,
  Form,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Radio,
  Select,
} from '@formily/antd-v5';
import { createForm, onFormInit } from '@formily/core';
import { createSchemaField } from '@formily/react';
import I18N from '@src/lang/I18N';
import { isArray } from 'lodash-es';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import CustomDrawer from '@/components/LcaCustomDrawer';
import { FormilySelectableTable } from '@/components/formily/SelectableTable';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { Org } from '@/sdks/systemV2ApiDocs';
import { Toast } from '@/utils';
import { getButtonText } from '@/utils/buttonText';

import { processSetDrawerSchema } from './schema';
import { updateFormFieldStates } from './utils';
import { SYSTEM_BOUNDARY_TYPE } from '../../CarbonFootprintModel/Info/ObjectivesAndScope/constant';
import { useLcaDbList, useSysLifeCycleList } from '../../hook';
import { getCommonOrgsList } from '../../utils/org';
import {
  getNewProcessLibraryDetailApi,
  postProcessLibraryAdd,
  postProcessLibraryEdit,
} from '../service';
import { NewProcessLibrary } from '../type';

interface ProcessSetDrawerProps {
  /** 列表item的ID */
  processLibraryDetailId: number;
  /** 当前抽屉展开的状态类型值：新增、编辑、查看 */
  acquisitionActionType: PageTypeInfo;
  visible: boolean;
  onClose: () => void;
}

const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    Form,
    FormItem,
    FormGrid,
    FormLayout,
    Radio,
    Checkbox,
    FormilySelectableTable,
  },
});

const { CUSTOM_LIFE_CYCLE } = SYSTEM_BOUNDARY_TYPE;

const ProcessSetDrawer: FC<ProcessSetDrawerProps> = ({
  processLibraryDetailId,
  acquisitionActionType,
  visible,
  onClose,
}) => {
  /** 生命周期枚举 */
  const lifeCycleList = useSysLifeCycleList(CUSTOM_LIFE_CYCLE)?.map(
    lifeCycle => ({
      label: lifeCycle.stageName,
      value: lifeCycle.id,
    }),
  );

  /** 数据库列表 */
  const lcaDbList = useLcaDbList();

  /** 抽屉状态 */
  const { show, add, edit } = PageTypeInfo;

  /** 是否是新增 */
  const isAdd = acquisitionActionType === add;

  /** 是否是详情 */
  const isDetail = acquisitionActionType === show;

  /** 数据库权限 */
  const hasDbAuth = checkAuth(
    '/carbonFootprintLCA/processLibrary/database',
    true,
  );

  const form = useMemo(
    () =>
      createForm({
        readPretty: isDetail,
        effects() {
          onFormInit(current => {
            current.setFieldState(`selectedDb`, {
              disabled: !hasDbAuth || isDetail,
            });
          });
        },
      }),
    [acquisitionActionType, visible],
  );
  /** 存放数据所属域字段数据源 */
  const [formFieldsDataSource, setFormFieldsDataSource] = useState<{
    orgList: Org[];
  }>({
    /** 数据所属域列表 */
    orgList: [],
  });

  /** 保存时的api对应的接口 */
  const postApi = {
    // 新增接口
    [add]: postProcessLibraryAdd,
    // 编辑接口
    [edit]: postProcessLibraryEdit,
  };

  /** 查看状态 */
  const disabledStatus = isDetail;

  const titleMap = {
    [add]: I18N.carbonFootPrintLCA.addProcessSet,
    [edit]: I18N.carbonFootPrintLCA.editProcessSet,
    [show]: I18N.carbonFootPrintLCA.processSetDetails,
  };

  /** 渲染抽屉标题 */
  const drawerTitle = titleMap[acquisitionActionType as keyof typeof titleMap];

  /** 获取过程库的详情 */
  const getProcessLibraryDetail = async () => {
    const { data } = await getNewProcessLibraryDetailApi({
      id: Number(processLibraryDetailId),
    });
    /** 处理生命周期阶段 */
    const lifecycleList = isArray(data?.data?.lifeCycleList)
      ? data?.data?.lifeCycleList
      : data?.data?.lifeCycleList?.split(',').map(Number);

    /** 处理数据库格式 */
    const selectedDbArr = data?.data?.selectedDb
      ? data?.data?.selectedDb?.split(',').map(s => Number(s))
      : [];

    form.setValues({
      ...data?.data,
      selectedDb: selectedDbArr,
      lifeCycleList: lifecycleList,
    });
  };

  /** 保存数据采集 */
  const saveDataAcForm = async () => {
    const values = await form.submit<NewProcessLibrary>();
    const lifeCycleListArr = isArray(values.lifeCycleList)
      ? values.lifeCycleList.toString()
      : undefined;
    const result = {
      ...values,
      lifeCycleList: lifeCycleListArr,
      selectedDb: values.selectedDb
        ? String(values.selectedDb)
        : values.selectedDb,
    };
    const api = postApi[acquisitionActionType as keyof typeof postApi];
    await api(result);
    Toast('success', I18N.Factors.saveSuccessful);
    form.reset();
    onClose();
  };

  /**  获取所属组织、生命周期阶段数据 */
  const loadData = useCallback(async () => {
    const [orgs] = await Promise.all([getCommonOrgsList()]);
    setFormFieldsDataSource({
      orgList: orgs || [],
    });
  }, []);

  useEffect(() => {
    /** 抽屉状态不是新增的时候请求查看详情数据 */
    if (visible && acquisitionActionType !== add) {
      getProcessLibraryDetail();
    }
  }, [visible]);

  /** 加载所属组织、生命周期阶段表单中下拉框数据 */
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  useEffect(() => {
    if (visible) {
      /** 已选数据库 */
      if (lcaDbList) {
        /** 数据库列表 */
        const newLcaDbList =
          lcaDbList?.map(item => ({
            id: item?.id,
            dbName: item?.dbName,
          })) || [];

        /** 第一个数据的ID */
        const firstId = newLcaDbList?.[0]?.id;

        form.setFieldState('selectedDb', {
          dataSource: newLcaDbList,
        });

        /** 新增时默认选中第一个 */
        if (firstId && isAdd) {
          form.setValuesIn('selectedDb', [firstId]);
        }
      }

      /** 生命周期阶段 */
      if (lifeCycleList) {
        form.setFieldState('lifeCycleList', {
          dataSource: lifeCycleList,
        });
      }

      const fieldsConfig = [
        {
          /** 数据所属域 */
          fieldName: 'orgId',
          dataList: formFieldsDataSource.orgList,
          labelKey: 'orgName',
          valueKey: 'id',
          isDisabled: disabledStatus,
        },
      ];
      // 更新所属域字段数据源
      updateFormFieldStates(form, fieldsConfig);
    }
  }, [formFieldsDataSource, visible, lcaDbList]);

  return (
    <CustomDrawer
      title={drawerTitle}
      isDetail={acquisitionActionType === PageTypeInfo.show}
      visible={visible}
      onClose={() => {
        form.reset();
        onClose();
      }}
      onSave={saveDataAcForm}
      saveBtnText={getButtonText(acquisitionActionType)}
    >
      <Form form={form} previewTextPlaceholder='-'>
        <SchemaField schema={processSetDrawerSchema} />
      </Form>
    </CustomDrawer>
  );
};

export default ProcessSetDrawer;
