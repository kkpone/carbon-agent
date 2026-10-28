import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { PageTypeInfo } from '@/router/utils/enums';

import { SupplyInfo } from './type';

const { show } = PageTypeInfo;

export const columns = (): TableRenderProps<SupplyInfo>['columns'] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 80,
    },
    {
      title: I18N.carbonFootprint3.supplierName,
      dataIndex: 'supplyName',
    },
    {
      title: I18N.cbam.nameOfPrecursor,
      dataIndex: 'precursorName',
    },
    {
      title: I18N.cbam.productCategory,
      dataIndex: 'productCategoryName',
    },
    {
      title: I18N.Factors.updateTime,
      dataIndex: 'updateTime',
    },
    {
      title: I18N.Factors.operation,
      dataIndex: 'action',
      fixed: 'right',
      width: 80,
      render: (_v, row) => {
        const { id } = row;
        return (
          <TableActions
            menus={compact([
              checkAuth('/home', {
                label: I18N.Factors.check,
                key: I18N.Factors.check,
                onClick: () => {
                  if (id) {
                    window.open(
                      `${CBAMRouteMaps.cbamPrecursorDataInfo.replace(
                        ':pageTypeInfo',
                        `${show}`,
                      )}?id=${id}`,
                    );
                  }
                },
              }),
            ])}
          />
        );
      },
    },
  ]);
