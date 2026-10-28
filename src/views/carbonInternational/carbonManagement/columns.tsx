/**
 * @file 国际版 table column
 */
import I18N from '@src/lang/I18N';
import { Popconfirm } from 'antd';
import { Organizations } from '@api/carbon-international/types';
import { ColumnsType } from 'antd/es/table';
import { TableActions } from '@src/components/Table/components/TableActions';
import { compact } from 'lodash-es';
import { checkPermissions } from '@src/components/Permission/utils';
import style from './index.module.less';
import { transformTimestamp } from '../organizationalManagement/utils';

type OrganizationColumn = {
  onCancel?: (obj: Organizations) => void;
  onConfirm: (obj: Organizations) => Promise<any>;
  onEdit: (obj: Organizations) => void;
  onShow: (obj: Organizations) => void;
};

export const organizationColumns = ({
  onCancel,
  onConfirm,
  onEdit,
  onShow,
}: OrganizationColumn): ColumnsType<Organizations> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: 'index',
  },
  {
    title: I18N.Certification.reportSubject,
    dataIndex: 'organization_name',
    key: 'organization_name',
  },
  {
    title: I18N.carbonFootprint.creationTime,
    dataIndex: 'create_time',
    render: (txt: any) => transformTimestamp(txt),
  },
  {
    title: I18N.carbonInternational.lastCompilation,
    dataIndex: 'modification',
    render: (txt: any) => transformTimestamp(txt),
  },
  {
    title: I18N.carbonFootprint.operation,
    dataIndex: 'action',
    fixed: 'right',
    render: (t, record: Organizations) => (
      <div>
        <TableActions
          dropDownKey={record.id}
          menus={compact([
            checkPermissions(
              { key: 'show', label: I18N.carbonFootprint.check, onClick: () => onShow(record) },
              'internationalReportDetail',
            ),
            checkPermissions(
              {
                key: 'KVCuJwErPA',
                label: I18N.carbonFootprint.edit,
                onClick: () => onEdit(record),
              },
              'KVCuJwErPA',
            ),
            checkPermissions(
              {
                key: '7cQFpvnOiV',
                label: (
                  <Popconfirm
                    title={I18N.components.thisOperationWillForever}
                    onConfirm={() => onConfirm(record)}
                    onCancel={() => onCancel?.(record)}
                    okText={I18N.carbonFootprint.confirm}
                    cancelText={I18N.carbonFootprint.cancel}
                  >
                    <span className={style.row_delete}>{I18N.carbonFootprint.delete}</span>
                  </Popconfirm>
                ),
              },
              '7cQFpvnOiV',
            ),
          ])}
        />
      </div>
    ),
  },
];
