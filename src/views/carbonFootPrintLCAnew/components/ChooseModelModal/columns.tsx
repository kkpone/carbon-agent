import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render/dist/src/types';

import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { LCARouteMaps } from '@/router/utils/lcaEnumsnew';
import { AssociationIo } from '@/views/carbonFootPrintLCAnew/components/ProcessManageDrawer/type';

export const columns = (): TableRenderProps<AssociationIo>['columns'] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      fixed: 'left',
      width: 68,
    },
    {
      title: I18N.carbonFootPrintLCA.modelName,
      dataIndex: 'modelName',
      fixed: 'left',
      width: 160,
    },
    {
      title: I18N.carbonFootPrintLCA.modelCodingFor,
      dataIndex: 'modelCode',
      width: 220,
    },
    {
      title: I18N.carbonFootPrintLCA.functionalUnits,
      dataIndex: 'funcUnit',
    },
    {
      title: I18N.carbonData.affiliatedOrganization,
      dataIndex: 'orgName',
    },
    {
      title: I18N.Factors.productName,
      dataIndex: 'productName',
    },
    {
      title: I18N.carbonFootprint.supplierName,
      dataIndex: 'supplierName',
    },
    {
      title: I18N.carbonFootPrintLCA.actionBar,
      dataIndex: 'action',
      fixed: 'right',
      width: 80,
      render: (_v, row) => {
        const { id } = row;

        return (
          <TableActions
            menus={compact([
              checkAuth('/carbonFootprintLCAnew/model/detail', {
                label: I18N.Factors.check,
                key: I18N.Factors.check,
                onClick: () => {
                  if (id) {
                    window.open(
                      `${LCARouteMaps.lcaModelInfo.replace(
                        ':pageTypeInfo',
                        `${PageTypeInfo.show}`,
                      )}?id=${id}`,
                      '_blank',
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
