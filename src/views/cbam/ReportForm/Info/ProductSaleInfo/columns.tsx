import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';

import { COLOR, ColorTag } from '@/components/ColorTag';
import { TableActions } from '@/components/Table/TableActions';
import { PageTypeInfo } from '@/router/utils/enums';
import { modelFooterBtnStyle, Toast } from '@/utils';

import { INFO_SET_STATUS } from './constant';
import { deleteSaleProductDelete } from '../../service';
import { SaleProductResp } from '../../type';

const { IN_CONFIG, COMPLETED } = INFO_SET_STATUS;

const { edit, show } = PageTypeInfo;

/** 外售产品信息列表表头 */
export const productColumns = ({
  isDetail,
  onActionBtnClick,
  reload,
}: {
  isDetail: boolean;
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (type: string, id?: number) => void;
  /** 刷新表格 */
  reload?: () => void;
}): ProColumns<SaleProductResp>[] =>
  compact([
    {
      title: I18N.Factors.productName,
      dataIndex: 'productName',
      ellipsis: true,
    },
    {
      title: I18N.cbam.informationConfigurationStatus,
      dataIndex: 'fillStatus',
      ellipsis: true,
      render: (_, record) => {
        const status = {
          [IN_CONFIG]: COLOR.orange,
          [COMPLETED]: COLOR.green,
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
      title: I18N.cbam.cnClassificationName,
      dataIndex: 'cnName',
      ellipsis: true,
    },
    {
      title: I18N.cbam.processName,
      dataIndex: 'processName',
      ellipsis: true,
    },
    {
      title: I18N.Factors.operation,
      dataIndex: 'action',
      width: 155,
      fixed: 'right',
      render(_, row) {
        const { id, productName } = row || {};
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
                        {I18N.cbam.confirmToDeleteThis5}
                        <span color='primaryColor'>{productName}</span>？
                      </div>
                    ),
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: async () => {
                      if (id) {
                        await deleteSaleProductDelete({
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
            ])}
          />
        );
      },
    },
  ]);
