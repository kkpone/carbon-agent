import { ProColumns } from '@ant-design/pro-components';

import { COLOR, ColorTag } from '@/components/ColorTag';
import I18N from '@/lang/I18N';

import { PrecursorDataFillFeedBackResq } from '../type';

export const columns = (): ProColumns<PrecursorDataFillFeedBackResq>[] => [
  {
    title: I18N.carbonFootPrintLCA.number,
    dataIndex: 'allIndex',
    width: 80,
    ellipsis: true,
  },
  {
    title: I18N.supplyChainCarbonManagement.feedbackResults,
    dataIndex: 'approvalStatus',
    width: 280,
    render: (value, record) => {
      const status = {
        0: COLOR.orange,
        1: COLOR.green,
        2: COLOR.red,
      } as {
        [key: number]: keyof typeof COLOR;
      };
      return (
        <ColorTag
          color={status[Number(value)]}
          text={record?.approvalStatus_name}
        />
      );
    },
  },
  {
    title: I18N.supplyChainCarbonManagement.feedbackPerson,
    dataIndex: 'auditByName',
    ellipsis: true,
  },
  {
    title: I18N.supplyChainCarbonManagement.contactInformation,
    dataIndex: 'auditByMobile	',
    ellipsis: true,
  },
  {
    title: I18N.supplyChainCarbonManagement.feedback,
    dataIndex: 'auditComment',
    ellipsis: true,
  },
  {
    title: I18N.supplyChainCarbonManagement.feedbackTime,
    dataIndex: 'auditTime',
    width: 180,
    ellipsis: true,
  },
];
