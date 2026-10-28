/**
 * 地图column
 */

import I18N from '@src/lang/I18N';
import { TableActions } from '@src/components/Table/components/TableActions';
import { TableRef } from '@src/components/TableUtil/types/common';
import {
  deleteTripUsingPOSTDefaultApi,
  SceneTripDto,
} from '@src/sdks/java/carbonAccount';
import { addEllipsisToColumn } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { ColumnsType } from 'antd/es/table';
import { Modal } from 'antd';
import { compact } from 'lodash-es';
import { MutableRefObject } from 'react';
import { Organizations } from '../../baseSetting/utils/types';

export const limitRecordRange = () => [
  {
    label: I18N.carbonAccount.weekend,
    value: 2,
  },
  {
    label: I18N.carbonAccount.weekday,
    value: 1,
  },
];

export const mapColumns = ({
  orgs,
  onEdit,
  onShow,
  tableRef,
}: {
  tableRef: MutableRefObject<TableRef | undefined>;
  orgs: Organizations[];
  onEdit: (id: string) => void;
  onShow: (id: string) => void;
}): ColumnsType<SceneTripDto> =>
  addEllipsisToColumn([
    {
      dataIndex: 'index',
      title: I18N.carbonFootprint.number,
    },
    {
      dataIndex: 'orgIds',
      title: I18N.carbonAccount.effectiveGrouping,
      render: (t, record) => {
        if (record?.limitOrg === 0) return I18N.carbonAccount.unrestricted;
        const orgList = t?.split(',');
        if (!orgList?.length) return '-';
        return compact(
          orgList.map(t => orgs.find(o => o.id === +t)?.orgName),
        ).join('、');
      },
    },
    {
      dataIndex: 'effectPeriod',
      title: I18N.carbonAccount.effectivePeriod,
      render(t, record) {
        if (record?.limitEffectPeriod === 0) return I18N.carbonAccount.unrestricted;
        return limitRecordRange().find(l => l.value === +t)?.label;
      },
    },
    {
      dataIndex: 'punchStartTime',
      title: I18N.carbonAccount.checkInTime,
      width: 290,
      render(t, record) {
        if (record?.limitPunch === 0) return I18N.carbonAccount.unrestricted;
        return `${t} - ${record.punchEndTime}`;
      },
    },
    {
      dataIndex: 'punchStartAddress',
      title: I18N.carbonAccount.checkInStartingPoint,
      render(t, record) {
        if (record?.limitPunchStart === 0) return I18N.carbonAccount.unrestricted;
        return t;
      },
    },
    {
      dataIndex: 'punchEndAddress',
      title: I18N.carbonAccount.checkInEndpoint,
      render(t, record) {
        if (record?.limitPunchEnd === 0) return I18N.carbonAccount.unrestricted;
        return t;
      },
    },
    {
      dataIndex: 'speedDown',
      title: I18N.carbonAccount.speedLimitK,
      width: 160,
      render(t, record) {
        if (record?.limitSpeed === 0) return I18N.carbonAccount.unrestricted;
        return `${t} - ${record.speedUp}`;
      },
    },
    {
      dataIndex: 'id',
      title: I18N.carbonFootprint.operation,
      render(id) {
        return (
          <TableActions
            menus={[
              {
                key: I18N.carbonFootprint.check,
                label: I18N.carbonFootprint.check,
                onClick: async () => {
                  onShow(id);
                },
              },
              {
                key: I18N.carbonFootprint.edit,
                label: I18N.carbonFootprint.edit,
                onClick: async () => {
                  onEdit(id);
                },
              },
              {
                key: I18N.carbonFootprint.delete,
                label: I18N.carbonFootprint.delete,
                onClick: async () => {
                  Modal.confirm({
                    title: I18N.carbonAccount.areYouSureYouWantToDeleteIt,
                    okText: I18N.carbonFootprint.confirm,
                    cancelText: I18N.carbonFootprint.cancel,
                    onOk: () => {
                      deleteTripUsingPOSTDefaultApi(id).then(({ data }) => {
                        if (data?.code === 200) {
                          Toast('info', I18N.carbonFootprint.deleteSuccessful);
                          tableRef.current?.reset();
                        }
                      });
                    },
                  });
                },
              },
            ]}
          />
        );
      },
    },
  ]);
