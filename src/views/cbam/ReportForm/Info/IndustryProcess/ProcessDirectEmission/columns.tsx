import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';

import { TableActions } from '@/components/Table/TableActions';
import { PageTypeInfo } from '@/router/utils/enums';
import { modelFooterBtnStyle, Toast } from '@/utils';

import {
  DrawerType,
  EMISSION_DRAWER_TYPE,
  EMISSION_TYPE_PREFIX,
} from './constant';
import { deleteProcessEmissionDelete } from '../../../service';
import { ProcessEmissionResp } from '../../../type';

const { edit, show } = PageTypeInfo;

/** 过程直接排放表头 */
export const processColumns = ({
  isDetail,
  onActionBtnClick,
  reload,
}: {
  isDetail: boolean;
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (
    type: string,
    drawerType?: DrawerType,
    id?: number,
  ) => void;
  /** 刷新表格 */
  reload?: () => void;
}): ProColumns<ProcessEmissionResp>[] =>
  compact([
    {
      title: I18N.cbam.typesOfEmissions,
      dataIndex: 'sourceType_name',
    },
    {
      title: I18N.eca.name,
      dataIndex: 'sourceName',
      ellipsis: true,
    },
    {
      title: I18N.cbam.emissionInformation,
      dataIndex: 'processMethod',
      render: (_, row) => {
        const { sourceType, processMethod_name } = row;
        if (sourceType) {
          return (
            EMISSION_TYPE_PREFIX[Number(sourceType)] +
            (processMethod_name || '-')
          );
        }
        return '-';
      },
    },
    {
      title: I18N.cbam.fossilEmissions,
      dataIndex: 'energyFossil',
    },
    {
      title: I18N.Factors.operation,
      dataIndex: 'action',
      width: 155,
      fixed: 'right',
      render(_, row) {
        const { id, sourceType } = row || {};
        /** 抽屉类型 */
        const drawerType = EMISSION_DRAWER_TYPE[
          Number(sourceType)
        ] as DrawerType;
        return (
          <TableActions
            menus={compact([
              !isDetail && {
                label: I18N.Factors.edit,
                key: I18N.Factors.edit,
                onClick: () => {
                  onActionBtnClick?.(edit, drawerType, id);
                },
              },
              !isDetail && {
                label: I18N.Factors.delete,
                key: I18N.Factors.delete,
                onClick: async () => {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: <div>{I18N.cbam.confirmToDeleteThis3}</div>,
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: async () => {
                      if (id) {
                        await deleteProcessEmissionDelete({
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
                  onActionBtnClick?.(show, drawerType, id);
                },
              },
            ])}
          />
        );
      },
    },
  ]);
