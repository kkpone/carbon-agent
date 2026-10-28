/*
 * @@description: 导入文件历史-表头
 */

import { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { commonRequestDownloadFile } from '@/api/commonRequest';
import { COLOR, ColorTag } from '@/components/ColorTag';
import { IMPORT_STATUS } from '@/components/ImportFile/constants';
import { ImportLogResp } from '@/components/ImportFile/type';
import { TableActions } from '@/components/Table/TableActions';

const { PENDING, IMPORTED, FAILED } = IMPORT_STATUS;

export const columns = (): ProColumns<ImportLogResp>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    width: 68,
  },
  {
    title: I18N.dashborad.fileName,
    dataIndex: 'fileName',
    ellipsis: true,
  },
  {
    title: I18N.carbonData.affiliatedOrganization,
    dataIndex: 'orgName',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootprint.totalNumberOfEntries,
    dataIndex: 'totalCount',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootprint.numberOfExceptions,
    dataIndex: 'failedCount',
    ellipsis: true,
  },
  {
    title: I18N.Factors.state,
    dataIndex: 'importStatus',
    render: (value, record) => {
      const status = {
        [PENDING]: COLOR.orange,
        [IMPORTED]: COLOR.green,
        [FAILED]: COLOR.red,
      } as {
        [key: number]: keyof typeof COLOR;
      };
      return (
        <ColorTag
          color={status[Number(value)]}
          text={record?.importStatus_name}
        />
      );
    },
  },
  {
    title: I18N.carbonFootprint.operator,
    dataIndex: 'createByName',
    ellipsis: true,
    width: 90,
  },
  {
    title: I18N.carbonFootprint.importTime,
    dataIndex: 'importTime',
    ellipsis: true,
    width: 180,
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 200,
    render: (_, record) => (
      <TableActions
        menus={compact([
          record.fileUrl && {
            label: I18N.carbonFootprint.sourceFile,
            key: I18N.carbonFootprint.sourceFile,
            onClick: async () => {
              commonRequestDownloadFile(
                record?.fileUrl || '',
                `${record?.fileName}`,
              );
            },
          },

          record?.failedFileUrl && {
            label: I18N.carbonFootprint.abnormalData,
            key: I18N.carbonFootprint.abnormalData,
            onClick: async () => {
              commonRequestDownloadFile(
                record?.failedFileUrl || '',
                `error_${record?.fileName}`,
              );
            },
          },
        ])}
      />
    ),
  },
];
