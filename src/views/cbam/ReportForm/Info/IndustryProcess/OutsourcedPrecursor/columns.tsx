import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact, includes } from 'lodash-es';
import { NavigateFunction } from '@/views/cbam/router';

import { COLOR, ColorTag } from '@/components/ColorTag';
import { TableActions } from '@/components/Table/TableActions';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { PageTypeInfo } from '@/router/utils/enums';
import { modelFooterBtnStyle, Toast } from '@/utils';

import {
  deleteOutsourcedPrecursorDelete,
  getOutsourcedPrecursorCopy,
} from '../../../service';
import { OutsourcedPrecursorResp } from '../../../type';
import { PRECURSOR_SET_STATUS } from '../../constant';

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
  reload,
}: {
  navigate: NavigateFunction;
  isDetail: boolean;
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (type: string, id?: number) => void;
  /** 供应商收数 */
  onSupplyCollection?: (row: OutsourcedPrecursorResp) => void;
  /** 刷新表格 */
  reload?: () => void;
}): ProColumns<OutsourcedPrecursorResp>[] =>
  compact([
    {
      title: '',
      dataIndex: 'id',
      width: 30,
    },
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
      title: I18N.cbam.productionRoute,
      dataIndex: 'productRouteNames',
      ellipsis: true,
    },
    {
      title: I18N.cbam.originOfPrecursor,
      dataIndex: 'countryCode',
      ellipsis: true,
    },
    {
      title: I18N.cbam.precursorConfiguration,
      dataIndex: 'configStatus',
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
            color={status[Number(record?.configStatus)]}
            text={record?.configStatus_name}
          />
        );
      },
    },
    {
      title: I18N.Factors.operation,
      dataIndex: 'action',
      width: 290,
      fixed: 'right',
      render(_, row) {
        const { id, configStatus, linkId } = row || {};
        return (
          <TableActions
            menus={compact([
              // 待审批 => 前往审批按钮
              !isDetail &&
                includes([PENDING_APPROVAL], configStatus) && {
                  label: I18N.cbam.goToApproval,
                  key: I18N.cbam.goToApproval,
                  onClick: () => {
                    if (linkId) {
                      navigate({
                        pathname:
                          CBAMRouteMaps.cbamPrecursorDataApprovalInfo.replace(
                            ':pageTypeInfo',
                            `${edit}`,
                          ),
                        search: `id=${linkId}`,
                      });
                    }
                  },
                },
              !isDetail && {
                label: I18N.Factors.edit,
                key: I18N.Factors.edit,
                onClick: () => {
                  onActionBtnClick?.(edit, id);
                },
              },
              !isDetail && {
                label: I18N.Factors.delete,
                key: I18N.Factors.delete,
                onClick: async () => {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: (
                      <div>
                        {I18N.cbam.confirmToDeleteThis2}
                        <div className='primaryColor'>
                          {I18N.cbam.noteToDeleteTheCurrent}
                        </div>
                      </div>
                    ),
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: async () => {
                      if (id) {
                        await deleteOutsourcedPrecursorDelete({
                          id,
                        });
                        Toast('success', I18N.Factors.deleteSuccessful);
                        reload?.();
                      }
                    },
                  });
                },
              },
              // 待发起供应商收数/供应商填报中/供应商数据待审批/供应商数据收集完毕 => 供应商收数按钮
              !isDetail &&
                includes(
                  [PENDING_COLLECTION, FILLING, PENDING_APPROVAL, COLLECTED],
                  configStatus,
                ) && {
                  label: I18N.cbam.newSupplier,
                  key: I18N.cbam.supplierReceipts,
                  onClick: () => {
                    if (id) {
                      if (
                        includes(
                          [FILLING, PENDING_APPROVAL, COLLECTED],
                          configStatus,
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
              // 已填写/待发起供应商收数 => 复制按钮
              !isDetail &&
                includes([FILLED, PENDING_COLLECTION], configStatus) && {
                  label: I18N.carbonFootPrintLCA.copy,
                  key: I18N.carbonFootPrintLCA.copy,
                  onClick: async () => {
                    if (id) {
                      await getOutsourcedPrecursorCopy({ id });
                      Toast('success', I18N.carbonFootPrintLCA.copySuccessful);
                      reload?.();
                    }
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
