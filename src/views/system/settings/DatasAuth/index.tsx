/**
 * @file 数据权限
 */
import I18N from '@src/lang/I18N';
import { dataPermissions, editDataPermission } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import { addEllipsisToColumn } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { Radio, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  DataPermission,
  DataPermissionDataPermissionEnum,
  editInitBatchUsingPOSTDataPermissionControllerApi,
} from '@src/sdks/java/management/api';
import { compact } from 'lodash-es';
import { checkPermissions } from '@src/components/Permission/utils';
import style from './index.module.less';
import { DataPermissionValue } from '../../utils/type';

const DatasAuth = () => {
  const [originValues, setOriginValues] = useState<
    DataPermissionDataPermissionEnum[]
  >([]);
  const [pages, setPages] = useState({ pageNum: 1, pageSize: 10, total: 0 });
  // const [permissionsDataType, setPermissionsDataType] = useState<Dicts[]>([]);
  const [data, setData] = useState<DataPermission[]>([]);
  const changedData = useMemo(
    () => data.filter((d, i) => d.dataPermission !== originValues?.[i]),
    [originValues, data],
  );

  const columns = addEllipsisToColumn<DataPermission>([
    {
      title: I18N.carbonFootprint3.dataType,
      dataIndex: 'dataTypeName',
      width: 266,
    },
    {
      title: I18N.system.dataPermissionAllocation,
      dataIndex: 'dataPermission',
      className: style.settingsTd,
      align: 'center',
      render: (t, r, index) => (
        <Radio.Group
          className={style.radios}
          onChange={e =>
            setData(s => {
              const currentIndex = (pages.pageNum - 1) * pages.pageSize + index;
              const newval = [...s];
              newval[currentIndex].dataPermission = e.target.value;
              return newval;
            })
          }
          value={t}
          options={Object.entries(DataPermissionValue)
            // 过滤中文 value
            .filter(([value]) => /^[A-Z]/.test(value))
            .map(([value, label]) => ({ label, value }))}
        />
      ),
    },
  ]);
  const getDefaultPermission = () =>
    dataPermissions(pages).then(({ data }) => {
      setData(data?.data?.rows || []);
      setOriginValues(
        compact(data?.data?.rows?.map(row => row.dataPermission) || []),
      );
      setPages({ ...pages, total: data?.data?.total || 0 });
    });
  /** 数据权限数据分类	目前用不到  */
  // const getDataType = () =>
  //   listALLByDictTypeBatch<{ permission_data_type: Dicts[] }>({
  //     dictTypes: 'permission_data_type',
  //   }).then(({ data }) => {
  //     setPermissionsDataType(data?.data?.permission_data_type || []);
  //   });
  useEffect(() => {
    getDefaultPermission();
    // if (!permissionsDataType.length) {
    //   getDataType();
    // }
  }, [pages.pageNum, pages.pageSize]);

  const saveData = async (data: DataPermission[], successMsg: string) =>
    editDataPermission(data).then(({ data }) => {
      // @ts-ignore
      if (data.code === 200) {
        Toast('success', successMsg);
        getDefaultPermission();
      }
    });

  return (
    <div className={style.wrapper}>
      <div className={style.top}>
        <h3>{I18N.system.dataPermissionTheory}</h3>
        <p>{I18N.system.publiclyReadAndWriteThis}</p>
        <p>
          {I18N.system.publiclyReadOnlyThis}</p>
        <p>
          {I18N.system.theDepartmentHasPubliclyDisclosedThis}</p>
        <p>
          {I18N.system.privateDataShould}</p>
      </div>
      <Table
        bordered
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: pages.pageSize,
          current: pages.pageNum,
          total: pages.total,
          onChange(pageNum, pageSize) {
            setPages({ ...pages, pageNum, pageSize });
          },
        }}
      />
      <FormActions
        place='center'
        buttons={compact([
          checkPermissions(
            {
              type: 'primary',
              title: I18N.carbonFootprint.preserve,
              disabled: !changedData.length,
              onClick: async () => saveData(changedData, I18N.system.saved),
            },
            'system:dataPermission:editBatch',
          ),
          checkPermissions(
            {
              title: I18N.system.restoreDefault,
              onClick: async () => {
                const newData = data.map(v => ({
                  ...v,
                  dataPermission: DataPermissionValue[I18N.system.publicReadingAndWriting],
                })) as DataPermission[];
                return editInitBatchUsingPOSTDataPermissionControllerApi(
                  newData,
                ).then(({ data }) => {
                  // @ts-ignore
                  if (data.code === 200) {
                    Toast('success', I18N.system.restoredDefault);
                    getDefaultPermission();
                  }
                });
              },
            },
            'system:dataPermission:editInitBatch',
          ),
        ])}
      />
    </div>
  );
};

export default DatasAuth;
