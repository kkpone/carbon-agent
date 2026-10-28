import { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';

import { COLOR, ColorTag } from '@/components/ColorTag';

import { MATCH_STATUS } from './constant';
import { IOFactorResp } from './type';

const { UNMATCHED, MATCH_SUCCESS, MATCH_ERROR } = MATCH_STATUS;

export const columns = (): ProColumns<IOFactorResp>[] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.lifeCycleStage,
      dataIndex: 'lifeCycleName',
    },
    {
      title: I18N.carbonFootPrintLCA.processName,
      dataIndex: 'processName',
    },
    {
      title: I18N.carbonFootPrintLCA.inputOutput,
      dataIndex: 'ioType_name',
    },
    {
      title: I18N.carbonFootPrintLCA.type,
      dataIndex: 'dataType_name',
    },
    {
      title: I18N.eca.name,
      dataIndex: 'ioName',
    },
    {
      title: I18N.carbonFootPrintLCA.supplementaryDescription,
      dataIndex: 'suppDesc',
    },
    {
      title: I18N.carbonFootPrintLCA.matchingFactor,
      dataIndex: 'factorName',
    },
    {
      title: I18N.carbonFootPrintLCA.matchingStatus,
      dataIndex: 'matchStatus',
      width: 155,
      ellipsis: false,
      render: (_, record) => {
        const status = {
          [UNMATCHED]: COLOR.grey,
          [MATCH_SUCCESS]: COLOR.green,
          [MATCH_ERROR]: COLOR.red,
        } as {
          [key: number]: keyof typeof COLOR;
        };
        return (
          <ColorTag
            color={status[Number(record?.matchStatus)]}
            text={record?.matchStatus_name}
          />
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.matchTagNames,
      dataIndex: 'tagName',
    },
  ]);
