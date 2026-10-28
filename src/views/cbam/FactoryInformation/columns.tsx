import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';
import { TableContext, TableRenderProps } from 'table-render/dist/src/types';

import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { Toast, modalText, modelFooterBtnStyle } from '@/utils';

import { deleteFactoryDelete } from './service';
import { FactoryResp } from './type';

const { edit, show } = PageTypeInfo;

export const columns = ({
  refresh,
  onActionBtnClick,
}: {
  refresh: TableContext<FactoryResp>['refresh'];
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (type: string, id?: number) => void;
}): TableRenderProps<FactoryResp>['columns'] => [
  {
    title: I18N.cbam.factoryName,
    dataIndex: 'factorName',
    fixed: 'left',
  },
  {
    title: I18N.carbonData.affiliatedOrganization,
    dataIndex: 'orgName',
  },
  {
    title: I18N.cbam.factoryCode,
    dataIndex: 'factoryCode',
  },
  {
    title: I18N.Factors.updatedBy,
    dataIndex: 'updateByName',
  },
  {
    title: I18N.Factors.updateTime,
    dataIndex: 'updateTime',
    width: 180,
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 160,
    render(_, row) {
      const { id = 0, factorName } = row || {};
      return (
        <TableActions
          menus={compact([
            checkAuth('/cbam/factory/edit', {
              label: I18N.Factors.edit,
              key: I18N.Factors.edit,
              onClick: () => {
                onActionBtnClick?.(edit, id);
              },
            }),
            checkAuth('/cbam/factory/delete', {
              label: I18N.Factors.delete,
              key: I18N.Factors.delete,
              onClick: async () => {
                if (id) {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: (
                      <div>
                        {I18N.cbam.confirmToDeleteThis}
                        <span className={modalText}>{factorName}？</span>
                      </div>
                    ),
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: async () => {
                      await deleteFactoryDelete({
                        id,
                      });
                      Toast('success', I18N.Factors.deleteSuccessful);
                      refresh?.({ stay: true, tab: 1 });
                    },
                  });
                }
              },
            }),
            checkAuth('/cbam/factory/detail', {
              label: I18N.Factors.check,
              key: I18N.Factors.check,
              onClick: () => {
                onActionBtnClick?.(show, id);
              },
            }),
          ])}
        />
      );
    },
  },
];
