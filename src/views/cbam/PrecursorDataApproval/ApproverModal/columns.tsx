import { ProColumns } from '@ant-design/pro-components';

import I18N from '@/lang/I18N';

import { AuditUserListResq } from '../type';

export const columns = (): ProColumns<AuditUserListResq>[] => [
  {
    title: I18N.system.name,
    dataIndex: 'realName',
  },
  {
    title: I18N.carbonData.affiliatedOrganization,
    dataIndex: 'orgName',
  },
];
