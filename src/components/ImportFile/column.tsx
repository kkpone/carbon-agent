/**
 * @description 导入文件历史-默认表头
 */
import { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { commonRequestDownloadFile } from '@/api/commonRequest';
import { COLOR, ColorTag } from '@/components/ColorTag';
import { TableActions } from '@/components/Table/TableActions';

import { IMPORT_STATUS } from './constants';
import { ImportLogResp } from './type';

const { PENDING, IMPORTED, FAILED } = IMPORT_STATUS;

export const defaultColumns = (): ProColumns<ImportLogResp>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    width: 88,
  },
  {
    title: I18N.components.fileName,
    dataIndex: 'fileName',
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
    title: I18N.components.operator,
    dataIndex: 'createByName',
    ellipsis: true,
  },
  {
    title: I18N.components.importTime,
    dataIndex: 'importTime',
    ellipsis: true,
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
            label: I18N.components.sourceFile,
            key: I18N.components.sourceFile,
            onClick: async () => {
              commonRequestDownloadFile(
                record?.fileUrl || '',
                `${record?.fileName}`,
              );
            },
          },

          record?.failedFileUrl && {
            label: I18N.components.abnormalData,
            key: I18N.components.abnormalData,
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
