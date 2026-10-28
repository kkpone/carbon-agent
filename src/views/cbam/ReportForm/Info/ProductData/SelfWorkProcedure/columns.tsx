import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { COLOR, ColorTag } from '@/components/ColorTag';
import { TableActions } from '@/components/Table/TableActions';
import { PageTypeInfo } from '@/router/utils/enums';

import { SourceFlowResp } from '../../../type';
import { PROCESS_SET_STATUS } from '../../constant';

const { NOT_FILL, FILLED } = PROCESS_SET_STATUS;
const { edit, show } = PageTypeInfo;

/** 工序列表表头 */
export const processColumns = ({
  isDetail,
  onActionBtnClick,
}: {
  isDetail: boolean;
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (type: string, id?: number) => void;
}): ProColumns<SourceFlowResp>[] =>
  compact([
    {
      title: I18N.cbam.processName,
      dataIndex: 'processName',
      ellipsis: true,
    },
    {
      title: I18N.cbam.processProductCategory,
      dataIndex: 'productCategoryName',
      ellipsis: true,
    },
    {
      title: I18N.cbam.totalProductionVolume2,
      dataIndex: 'totalVolume',
      render: (_, record) => {
        const { totalVolume, unit } = record || {};
        return totalVolume || totalVolume === 0
          ? `${totalVolume}${unit || ''}`
          : '-';
      },
    },
    {
      title: I18N.cbam.externalSalesVolume2,
      dataIndex: 'salesVolume',
      render: (_, record) => {
        const { salesVolume, unit } = record || {};
        return salesVolume || salesVolume === 0
          ? `${salesVolume}${unit || ''}`
          : '-';
      },
    },
    {
      title: I18N.cbam.productionRoute,
      dataIndex: 'productRouteNames',
      ellipsis: true,
    },
    {
      title: I18N.cbam.dataConfigurationStatus,
      dataIndex: 'fillStatus',
      ellipsis: true,
      render: (_, record) => {
        const status = {
          [NOT_FILL]: COLOR.grey,
          [FILLED]: COLOR.green,
        } as {
          [key: number]: keyof typeof COLOR;
        };
        return (
          <ColorTag
            color={status[Number(record?.fillStatus)]}
            text={record?.fillStatus_name}
          />
        );
      },
    },
    {
      title: I18N.Factors.operation,
      dataIndex: 'action',
      width: 165,
      fixed: 'right',
      render(_, row) {
        const { id } = row || {};
        return (
          <TableActions
            menus={compact([
              !isDetail && {
                label: I18N.cbam.configureData,
                key: I18N.cbam.configureData,
                onClick: () => {
                  onActionBtnClick?.(edit, id);
                },
              },
              {
                label: I18N.Factors.check,
                key: I18N.Factors.check,
                onClick: () => {
                  onActionBtnClick?.(show, id);
                },
              },
            ])}
          />
        );
      },
    },
  ]);
