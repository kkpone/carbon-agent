/**
 * @description CBAM报表列表页
 */
import { PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useHistory } from 'react-router-dom';
import { useTable, withTable } from 'table-render';

import { Page } from '@/components/Page';
import { TableRender } from '@/components/x-render/TableRender';
import type { CustomSearchProps } from '@/components/x-render/TableRender/types';
import { checkAuth } from '@/layout/utills';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { PageTypeInfo } from '@/router/utils/enums';

import { columns } from './columns';
import { searchSchema } from './schemas';
import { getCbamList } from './service';
import { GeneralInfoProps, CbamRequest } from './type';
import { useCbamOrgs } from '../hook';
import { toNavigate } from '../router';

const ReportForm = () => {
  const navigate = toNavigate(useHistory());
  const { refresh } = useTable();

  /** 所属组织枚举 */
  const orgList = useCbamOrgs();

  const searchApi: CustomSearchProps<GeneralInfoProps, CbamRequest> = args =>
    getCbamList(args).then(({ data }) => data?.data);

  return (
    <Page
      title={I18N.cbam.cbamNews}
      onBtnClick={async () => {
        navigate({
          pathname: CBAMRouteMaps.cbamReportInfo.replace(
            ':pageTypeInfo',
            `${PageTypeInfo.add}`,
          ),
        });
      }}
      actionBtnChild={checkAuth(
        '/cbam/report/add',
        <div>
          <PlusOutlined /> {I18N.Factors.newAddition}
        </div>,
      )}
    >
      <TableRender<GeneralInfoProps, CbamRequest>
        searchProps={{
          schema: searchSchema(orgList),
          api: searchApi,
        }}
        tableProps={{
          columns: columns({ refresh, navigate }),
          scroll: { x: 1500 },
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />
    </Page>
  );
};
export default withTable(ReportForm);
