/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-10 16:45:56
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 17:23:57
 */
import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import I18N from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { PageInfoType, PageInfoTypeName } from '@src/router/type';
import { ColumnsType } from 'antd/es/table';
import { DataNode } from 'antd/lib/tree';
import { compact } from 'lodash-es';
import { useHistory } from 'react-router-dom';

import { GHGSecondSelect } from '../../listInfo/util';

type EmissionColsType = <T = any>(props: {
  history: ReturnType<typeof useHistory>;
  selectedClassify?: DataNode;
  onDel: (row: T) => any;
}) => ColumnsType<T>;

export const emissionCols: EmissionColsType = ({
  history,
  selectedClassify,
  onDel,
}) =>
  // 排放源库列表
  [
    {
      title: I18N.carbonFootprint3.emissionSourceName,
      dataIndex: 'name',
      ellipsis: true,
      width: 150,
      render: (text: number) => text || '-',
    },
    {
      title: I18N.components.emissionFacilityActivity,
      dataIndex: 'facility',
      ellipsis: true,
      width: 140,
      render: (text: number) => text || '-',
    },
    {
      title: I18N.carbonFootprint.classification,
      dataIndex: 'ghgClassify',
      ellipsis: true,
      width: 140,
      render: classify =>
        GHGSecondSelect.find(({ id }) => id === classify)?.category || '-',
    },
    {
      title: I18N.components.activityDataSheet3,
      dataIndex: 'activityUnitDesc',
      ellipsis: true,
      width: 140,
      render: (text: number) => text || '-',
    },

    {
      title: I18N.carbonFootprint.updatedBy,
      dataIndex: 'updateBy',
      ellipsis: true,
      width: 90,
      render: (text: number) => text || '-',
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      ellipsis: true,
      width: 190,
      render: (text: string) => (text || '-').split(' ')[0],
    },
    {
      title: I18N.carbonFootprint.operation,
      fixed: 'right',
      width: 230,
      dataIndex: 'supplyQuantity',
      render: (text, record: any) => (
        <TableActions
          menus={compact([
            // checkPermissions(
            //   {
            //     label: '编辑',
            //     key: '编辑',
            //     onClick: async () => {
            //       history.push(
            //         virtualLinkTransform(
            //           RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
            //           [PageInfoTypeName, ':id'],
            //           [PageInfoType.edit, record.dictSourceId],
            //         ),
            //       );
            //     },
            //   },
            //   'enterprise:dictSource:edit',
            // ) !== null
            //   ? checkPermissions(
            //       {
            //         label: '详情',
            //         key: '编辑',
            //         onClick: async () => {
            //           history.push(
            //             virtualLinkTransform(
            //               RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
            //               [PageInfoTypeName, ':id'],
            //               [PageInfoType.edit, record.dictSourceId],
            //             ),
            //           );
            //         },
            //       },
            //       'enterprise:dictSource:edit',
            //     )
            //   :
            checkPermissions(
              {
                label: I18N.carbonFootprint3.details,
                key: I18N.carbonFootprint.check,
                onClick: async () => {
                  if (selectedClassify) {
                    sessionStorage.setItem(
                      'selectedClassify',
                      JSON.stringify(selectedClassify),
                    );
                  }
                  history.push(
                    virtualLinkTransform(
                      RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
                      [PageInfoTypeName, ':id'],
                      [PageInfoType.show, record.dictSourceId],
                    ),
                  );
                },
              },
              'enterprise:dictSource:info',
            ),
            checkPermissions(
              {
                label: I18N.carbonFootprint.copy,
                key: I18N.carbonFootprint.copy,
                onClick: async () => {
                  history.push(
                    virtualLinkTransform(
                      RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
                      [PageInfoTypeName, ':id'],
                      [PageInfoType.copy, record.dictSourceId],
                    ),
                  );
                },
              },
              'enterprise:dictSource:copy',
            ),
            checkPermissions(
              {
                label: I18N.carbonFootprint.delete,
                key: I18N.carbonFootprint.delete,
                onClick: async () => onDel(record),
              },
              'enterprise:dictSource:deleted',
            ),
          ])}
        />
      ),
    },
  ];
