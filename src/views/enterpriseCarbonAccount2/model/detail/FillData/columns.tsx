/*
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import { PageInfoType } from '@src/router/type';
import { GETb98408d1cb055318468a28eb74dec1da } from '@src/sdks_v2/enterpriseV2ApiDocs';
import { AddSource } from '@src/views/enterpriseCarbonAccount2/accounting/fillData/components/addSource';
import { compact } from 'lodash-es';

export const columns = ({
  modelId,
  isShow,
  refreshSourceList,
}: {
  modelId?: string;
  refreshSourceList?: () => void;
  isShow?: boolean;
}) => [
  {
    title: I18N.carbonFootprint3.emissionSourceName,
    dataIndex: 'name',
    ellipsis: true,
    width: 150,
  },
  {
    title: I18N.components.emissionFacilityActivity,
    dataIndex: 'facility',
    ellipsis: true,
    width: 140,
  },
  {
    title: I18N.components.activityDataSheet3,
    dataIndex: 'activityUnitDesc',
    ellipsis: true,
    width: 140,
  },
  {
    title: I18N.carbonFootprint.operation,
    width: 120,
    dataIndex: 'supplyQuantity',
    render: (
      text,
      record: {
        dictSourceId: string;
        computationId: string;
        sourceCategoryMiddleId: number;
      },
    ) =>
      !isShow ? (
        <TableActions
          menus={compact([
            checkPermissions(
              {
                label: (
                  <AddSource
                    dictSourceId={record.dictSourceId}
                    computationId={record.computationId}
                    modelId={modelId}
                    pageInfoType={PageInfoType.edit}
                    fromSource='model'
                    readPretty
                  >
                    {I18N.carbonFootprint.check}</AddSource>
                ),
                key: I18N.carbonFootprint.edit,
              },
              'enterprise:dictSource:edit',
            ),
            {
              label: I18N.carbonFootprint.delete,
              key: I18N.carbonFootprint.delete,
              onClick: async () => {
                await GETb98408d1cb055318468a28eb74dec1da({
                  sourceCategoryMiddleId: record.sourceCategoryMiddleId,
                });
                refreshSourceList?.();
              },
            },
          ])}
        />
      ) : (
        '-'
      ),
  },
];
