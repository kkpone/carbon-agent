import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact, includes } from 'lodash-es';
import { NavigateFunction } from '@/views/cbam/router';

import { COLOR, ColorTag } from '@/components/ColorTag';
import { TableActions } from '@/components/Table/TableActions';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { PageTypeInfo } from '@/router/utils/enums';
import { modelFooterBtnStyle } from '@/utils';

import { OutsourcedPrecursorResp } from '../../../type';
import { PRECURSOR_SET_STATUS, PROCESS_SET_STATUS } from '../../constant';

const {
  NOT_FILL,
  FILLED,
  PENDING_COLLECTION,
  FILLING,
  PENDING_APPROVAL,
  COLLECTED,
} = PRECURSOR_SET_STATUS;

const { edit, show } = PageTypeInfo;

/** 前体列表表头 */
export const precursorColumns = ({
  navigate,
  isDetail,
  onActionBtnClick,
  onSupplyCollection,
}: {
  navigate: NavigateFunction;
  isDetail: boolean;
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (type: string, id?: number) => void;
  /** 供应商收数 */
  onSupplyCollection?: (row: OutsourcedPrecursorResp) => void;
}): ProColumns<OutsourcedPrecursorResp>[] =>
  compact([
    {
      title: I18N.cbam.nameOfPrecursor,
      dataIndex: 'preName',
      ellipsis: true,
    },
    {
      title: I18N.cbam.outsourcedPrecursorProducts,
      dataIndex: 'defaultProcessNames',
      ellipsis: true,
    },
    {
      title: I18N.cbam.totalUsage,
      dataIndex: 'allUse',
      ellipsis: true,
      render: (_, record) => {
        const { allUse, unit } = record || {};
        return allUse || allUse === 0 ? `${allUse}${unit || ''}` : '-';
      },
    },
    {
      title: I18N.cbam.productionRoute,
      dataIndex: 'productRouteNames',
      ellipsis: true,
    },
    {
      title: (
        <span style={{ whiteSpace: 'nowrap' }}>
          {I18N.cbam.activityDataMatching}
        </span>
      ),
      dataIndex: 'activeFillStatus',
      width: 155,
      ellipsis: false,
      render: (_, record) => {
        const status = {
          [PROCESS_SET_STATUS.NOT_FILL]: COLOR.grey,
          [PROCESS_SET_STATUS.FILLED]: COLOR.green,
        } as {
          [key: number]: keyof typeof COLOR;
        };
        return (
          <ColorTag
            color={status[Number(record?.activeFillStatus)]}
            text={record?.activeFillStatus_name}
          />
        );
      },
    },
    {
      title: I18N.cbam.emissionDataMatching,
      dataIndex: 'fillStatus',
      width: 155,
      ellipsis: false,
      render: (_, record) => {
        const status = {
          [NOT_FILL]: COLOR.grey,
          [FILLED]: COLOR.blue,
          [PENDING_COLLECTION]: COLOR.grey,
          [FILLING]: COLOR.orange,
          [PENDING_APPROVAL]: COLOR.pink,
          [COLLECTED]: COLOR.green,
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
      width: 320,
      fixed: 'right',
      render(_, row) {
        const { id, fillStatus, linkId } = row || {};
        return (
          <TableActions
            menus={compact([
              // 待审批 => 前往审批按钮
              !isDetail &&
                includes([PENDING_APPROVAL], fillStatus) && {
                  label: I18N.cbam.goToApproval,
                  key: I18N.cbam.goToApproval,
                  onClick: () => {
                    navigate({
                      pathname:
                        CBAMRouteMaps.cbamPrecursorDataApprovalInfo.replace(
                          ':pageTypeInfo',
                          `${edit}`,
                        ),
                      search: `id=${linkId}`,
                    });
                  },
                },
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
              // 待发起供应商收数/供应商填报中/供应商数据待审批/供应商数据收集完毕 => 供应商收数按钮
              !isDetail &&
                includes(
                  [PENDING_COLLECTION, FILLING, PENDING_APPROVAL, COLLECTED],
                  fillStatus,
                ) && {
                  label: I18N.cbam.newSupplier,
                  key: I18N.cbam.supplierReceipts,
                  onClick: () => {
                    if (id) {
                      if (
                        includes(
                          [FILLING, PENDING_APPROVAL, COLLECTED],
                          fillStatus,
                        )
                      ) {
                        Modal.confirm({
                          title: I18N.Factors.prompt,
                          icon: '',
                          content: (
                            <div>{I18N.cbam.thePrecursorHasBeenReleased}</div>
                          ),
                          ...modelFooterBtnStyle,
                          okText: I18N.base.confirm,
                          cancelText: I18N.Factors.cancel,
                          onOk: async () => {
                            onSupplyCollection?.(row);
                          },
                        });
                      } else {
                        onSupplyCollection?.(row);
                      }
                    }
                  },
                },
            ])}
          />
        );
      },
    },
  ]);
