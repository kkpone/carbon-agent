import {
  FormLayout,
  FormGrid,
  FormItem,
  Radio,
  Input,
  Cascader,
  Select,
  DatePicker,
  TreeSelect,
  NumberPicker,
  Checkbox,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { LocaleContext } from '@src/components/LocaleProvider';
import { FormilyAreaCodeInput } from '@src/components/formily/components/AreaCodeInput/index';
import { useRoleIds } from '@src/hooks/useRoleIds';
import { useOrgTreeData } from '@src/views/dashborad/organization/components/hooks';
import { getAreaCode } from '@src/views/system/login/service';
import { useRequest } from 'ahooks';
import { Spin } from 'antd';
import React, {
  FC,
  useState,
  useMemo,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import I18N, { serviceLangMap } from 'src/lang/I18N';

import { CustomDrawer } from '@/components/CustomDrawer';

import { ApprovalUserSelect } from './ApprovalUserSelect';
import styles from './index.module.less';
import { baseInfoSchema, RoleIdsSchema, ApprovalConfigSchema } from './schema';
import {
  apiAddUser,
  AddUserType,
  apiEditUser,
  apiEmployInfo,
  apiGetUserCompanyList,
  EmployeeListItem,
} from '../../service';

const SchemaField = createSchemaField({
  // 组件列表
  components: {
    FormLayout,
    FormGrid,
    FormItem,
    Radio,
    Input,
    Cascader,
    Select,
    DatePicker,
    TreeSelect,
    NumberPicker,
    Checkbox,
    FormilyAreaCodeInput,
    ApprovalUserSelect,
  },
});

interface UserDrawerProps {
  refresh?: () => void;
  type?: 'add' | 'edit';
  initValue?: any;
  readPretty: boolean;
  children?: React.ReactNode;
}
export const UserDrawer: FC<UserDrawerProps> = props => {
  const { refresh, type = 'add', initValue, readPretty } = props;
  // const [readPretty] = useState(false);
  const [visible, setVisible] = useState(false);
  const [employeeList, setEmployeeList] = useState<EmployeeListItem[]>([]);

  const { transformData: roleIds, refetch: refreshRoleList } = useRoleIds();

  const Form = useMemo(
    () =>
      createForm<AddUserType>({
        readPretty: false,
      }),
    [visible],
  );

  const { locale } = useContext(LocaleContext);

  const { data = [] } = useRequest(
    () =>
      getAreaCode({
        lang: serviceLangMap[locale],
      }),
    {
      cacheKey: locale,
      // 30 分钟
      staleTime: 30 * 1000 * 60,
      refreshDeps: [locale],
    },
  );

  // 这里不用 areaCode 作为 key，是因为不同 option 的 areaCode 可能会相同。例如美国加拿大区号都是 1 。
  const options = useMemo(
    () =>
      data.map(item => ({
        label: item.areaContent,
        value: item.areaContent,
      })),
    [data],
  );

  useEffect(() => {
    Form.setFieldState('.employPhone', {
      dataSource: options,
    });
  }, [options, Form]);

  useEffect(() => {
    if (visible) {
      refreshRoleList();
    }
  }, [visible, refreshRoleList]);

  // 获取员工列表（用于配置审批对象）
  // userId: 当前操作的员工ID，用于获取该员工可以配置的下级员工列表
  const fetchEmployeeList = useCallback(
    async (userId?: number, searchName?: string) => {
      try {
        const { data } = await apiGetUserCompanyList({
          userId, // 接口参数名为 orgId，但实际传递 userId
          searchName,
        });
        if (data.code === 200) {
          setEmployeeList(data.data);
          return data.data;
        }
      } catch (error) {
        // console.error('获取员工列表失败:', error);
      }
      return [];
    },
    [],
  );

  useEffect(() => {
    const getInfo = async () => {
      const { data } = await apiEmployInfo({ id: initValue.id });
      const {
        employName,
        orgId,
        employPhone,
        employEmail,
        employPhoneCode,
        roleIds: originRoleIds,
        superApproval,
        subApprovalList,
        superApprovalData,
      } = data.data;

      // 获取员工列表并设置审批负责人名称（传递当前编辑员工的 userId）
      const list = await fetchEmployeeList(initValue.userId);
      let approvalUserName = I18N.DomesticVersion.nothing;

      // 优先使用 superApprovalData 中的 employName
      if (superApprovalData?.employName) {
        approvalUserName = superApprovalData.employName;
      } else if (superApproval) {
        // 如果没有 superApprovalData，则从员工列表中查找
        const approvalUser = list.find(item => item.userId === superApproval);
        if (approvalUser) {
          approvalUserName = approvalUser.employName;
        }
      }

      Form.setValues({
        employName,
        orgId: Number(orgId),
        employPhone: {
          areaCode: employPhoneCode,
          phone_number: employPhone,
        },
        employEmail,
        roleIds: originRoleIds.map(Number),
        superApprovalName: approvalUserName,
        approvalConfig:
          subApprovalList && subApprovalList.length > 0
            ? 'config'
            : 'notConfig',
        subApprovalList: subApprovalList || [],
      });
    };
    if (type === 'edit' && visible) {
      getInfo();
    }
  }, [type, initValue, Form, visible, fetchEmployeeList]);

  useEffect(() => {
    Form.setFieldState('.roleIds', {
      dataSource: roleIds,
    });
  }, [roleIds, Form]);

  // 设置员工列表数据源，处理置灰逻辑
  useEffect(() => {
    const options = employeeList.map(item => ({
      label: item.employName,
      value: item.userId,
      disabled: item.isChoose === '0', // isChoose 为 "0" 表示已被其他人配置
      title:
        item.isChoose === '0'
          ? I18N.dashborad.theEmployeeAlreadyHas
          : undefined,
      id: item.id,
      companyId: item.companyId,
    }));

    Form.setFieldState('.subApprovalList', {
      dataSource: options,
      componentProps: {
        onLoadEmployees: fetchEmployeeList,
      },
    });
  }, [employeeList, Form, fetchEmployeeList]);

  // 初始化时加载员工列表（新增模式）
  useEffect(() => {
    if (visible && type === 'add') {
      // 新增模式下，获取当前登录用户的 userId
      fetchEmployeeList();
    }
  }, [visible, type, fetchEmployeeList]);

  useEffect(() => {
    Form.setFormState({
      readPretty,
    });
  }, [readPretty, Form]);

  const [treeData, getTreeData] = useOrgTreeData(false);

  useEffect(() => {
    if (visible) {
      getTreeData();
    }
  }, [visible, getTreeData]);

  useEffect(() => {
    Form.setFieldState('.orgId', {
      dataSource: treeData,
    });
  }, [treeData, Form]);

  const onSubmit = async () => {
    if (type === 'add') {
      const formValue = await Form.submit<any>();
      if (!formValue.employPhone?.phone_number && !formValue.employEmail) {
        (Form.query('employPhone').take() as any)?.setSelfErrors([
          I18N.dashborad.pleaseEnterMobilePhoneNumber,
        ]);
        await Form.validate();
        return;
      }
      await Form.validate();

      // 处理审批配置数据
      const subApprovalList =
        formValue.approvalConfig === 'config'
          ? formValue.subApprovalList || []
          : [];

      await apiAddUser({
        ...formValue,
        employPhone: formValue.employPhone?.phone_number,
        employPhoneCode: formValue.employPhone?.areaCode,
        subApprovalList,
      });
      setVisible(false);
      refresh?.();
    } else {
      await Form.validate();
      const formValue = await Form.submit<any>();

      // 处理审批配置数据
      const subApprovalList =
        formValue.approvalConfig === 'config'
          ? formValue.subApprovalList || []
          : [];

      await apiEditUser({
        id: initValue.id,
        userId: initValue.userId,
        udId: initValue.udId,
        type: initValue.ucType,
        ...formValue,
        employPhone: formValue.employPhone?.phone_number,
        employPhoneCode: formValue.employPhone?.areaCode,
        subApprovalList,
      });
      setVisible(false);
      refresh?.();
    }
  };

  const childrenWithOnClick = React.Children.map(props.children, child => {
    if (!child) {
      return child;
    }

    // Child is boolean, number etc.
    if (typeof child !== 'object') {
      return child;
    }

    // Child is React Element
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: () => {
          setVisible(true);
        },
      } as { [key: string]: any });
    }
    return null;
  });

  return (
    <div>
      <CustomDrawer
        open={visible}
        destroyOnClose
        width={560}
        title={
          type === 'add'
            ? I18N.dashborad.addNewEmployees
            : I18N.dashborad.employeeDetails
        }
        onClose={() => setVisible(false)}
      >
        <div>
          <Spin spinning={false}>
            <FormilyCommon form={Form}>
              <div className={styles.userDrawer}>
                <div className={styles.titleWrapper}>
                  {/* <div className={styles.title}>基本信息</div> */}
                </div>
                <SchemaField schema={baseInfoSchema()} />
                {type === 'edit' && (
                  <div className={styles.extraInfo}>
                    <div className={styles.mobile}>
                      {I18N.dashborad.notAffectedAfterModification2}
                    </div>
                    <div className={styles.email}>
                      {I18N.dashborad.notAffectedAfterModification}
                    </div>
                  </div>
                )}
                <SchemaField schema={ApprovalConfigSchema()} />
                <SchemaField schema={RoleIdsSchema()} />
              </div>
            </FormilyCommon>
            <div>
              <FormActions
                width={558}
                place='center'
                buttons={[
                  {
                    type: 'primary',
                    title: I18N.carbonFootprint.confirm2,
                    onClick: async () => onSubmit(),
                  },
                  {
                    title: I18N.carbonFootprint.cancel,
                    onClick: () => setVisible(false),
                  },
                ]}
              />
            </div>
          </Spin>
        </div>
      </CustomDrawer>
      {childrenWithOnClick}
    </div>
  );
};
