import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableContext, TableRenderProps } from 'table-render/dist/src/types';

import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';

import { ParameterResp } from './type';

const { edit } = PageTypeInfo;

export const columns = ({
  onActionBtnClick,
}: {
  refresh: TableContext<ParameterResp>['refresh'];
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (type: string, id?: number) => void;
}): TableRenderProps<ParameterResp>['columns'] => [
  {
    title: I18N.cbam.productCategoryName3,
    dataIndex: 'categoryName',
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 160,
    render(_, row) {
      const { id = 0 } = row || {};
      return (
        <TableActions
          menus={compact([
            checkAuth('/cbam/parameter/edit', {
              label: I18N.Factors.edit,
              key: I18N.Factors.edit,
              onClick: () => {
                onActionBtnClick?.(edit, id);
              },
            }),
          ])}
        />
      );
    },
  },
];
