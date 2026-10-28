import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';

import { COLOR, ColorTag } from '@/components/ColorTag';
import { TableActions } from '@/components/Table/TableActions';
import { PageTypeInfo } from '@/router/utils/enums';
import { modelFooterBtnStyle, Toast } from '@/utils';

import {
  deleteProductProcessDelete,
  getProductProcessCopy,
} from '../../../service';
import { SourceFlowResp } from '../../../type';
import { PROCESS_SET_STATUS } from '../../constant';

const { NOT_FILL, FILLED } = PROCESS_SET_STATUS;

const { edit, show } = PageTypeInfo;

/** 工序列表表头 */
export const processColumns = ({
  isDetail,
  onActionBtnClick,
  reload,
}: {
  isDetail: boolean;
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (type: string, id?: number) => void;
  /** 刷新表格 */
  reload?: () => void;
}): ProColumns<SourceFlowResp>[] =>
  compact([
    {
      title: '',
      dataIndex: 'id',
      width: 30,
    },
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
      title: I18N.cbam.preProcess,
      dataIndex: 'elseProductName',
      ellipsis: true,
    },
    {
      title: I18N.cbam.externalPurchasesIncluded,
      dataIndex: 'preProcessNames',
      ellipsis: true,
    },
    {
      title: I18N.cbam.productionRoute,
      dataIndex: 'productRouteNames',
      ellipsis: true,
    },
    {
      title: I18N.cbam.processConfigurationStatus,
      dataIndex: 'sourceFillStatus',
      width: 155,
      ellipsis: false,
      render: (_, record) => {
        const status = {
          [NOT_FILL]: COLOR.grey,
          [FILLED]: COLOR.green,
        } as {
          [key: number]: keyof typeof COLOR;
        };
        return (
          <ColorTag
            color={status[Number(record?.sourceFillStatus)]}
            text={record?.sourceFillStatus_name}
          />
        );
      },
    },
    {
      title: I18N.Factors.operation,
      dataIndex: 'action',
      width: 210,
      fixed: 'right',
      render(_, row) {
        const { id } = row || {};
        return (
          <TableActions
            menus={compact([
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
                        {I18N.cbam.confirmToDeleteThis4}
                        <div className='primaryColor'>
                          {I18N.cbam.noteToDeleteFromFactory}
                        </div>
                      </div>
                    ),
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: async () => {
                      if (id) {
                        await deleteProductProcessDelete({
                          id,
                        });
                        Toast('success', I18N.Factors.deleteSuccessful);
                        reload?.();
                      }
                    },
                  });
                },
              },
              {
                label: I18N.Factors.check,
                key: I18N.Factors.check,
                onClick: () => {
                  onActionBtnClick?.(show, id);
                },
              },
              !isDetail && {
                label: I18N.carbonFootPrintLCA.copy,
                key: I18N.carbonFootPrintLCA.copy,
                onClick: async () => {
                  if (id) {
                    await getProductProcessCopy({ id });
                    Toast('success', I18N.carbonFootPrintLCA.copySuccessful);
                    reload?.();
                  }
                },
              },
            ])}
          />
        );
      },
    },
  ]);
