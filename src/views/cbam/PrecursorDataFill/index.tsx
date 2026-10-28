/**
 * @description CBAM前体数据填报
 */
import I18N from '@src/lang/I18N';
import { useHistory } from 'react-router-dom';
import { withTable, useTable } from 'table-render';

import { Page } from '@/components/Page';
import { TableRender } from '@/components/x-render/TableRender';
import { CustomSearchProps } from '@/components/x-render/TableRender/types';

import { columns } from './columns';
import { searchSchema } from './schemas';
import { getPrecursorDataFillList } from './service';
import {
  PrecursorDataFillListResq,
  PrecursorDataFillListRequest,
} from './type';
import { defaultProps } from '../PrecursorData/constants';
import { useSupplyChainEnums } from '../hook';
import { toNavigate } from '../router';

const PrecursorDataFill = () => {
  const { refresh } = useTable();
  const navigate = toNavigate(useHistory());

  /** 填报审批状态枚举 */
  const applyStatusOptions = useSupplyChainEnums('ApplyStatus');

  const searchApi: CustomSearchProps<
    PrecursorDataFillListResq,
    PrecursorDataFillListRequest
  > = args =>
    getPrecursorDataFillList({
      ...defaultProps,
      ...args,
    }).then(({ data }) => data?.data);
  return (
    <Page title={I18N.cbam.beforeCbam3}>
      <TableRender<PrecursorDataFillListResq, PrecursorDataFillListRequest>
        searchProps={{
          schema: searchSchema({ applyStatusOptions }),
          api: searchApi,
        }}
        tableProps={{
          columns: columns({ refresh, navigate }),
          scroll: { x: 1800 },
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />
    </Page>
  );
};

export default withTable(PrecursorDataFill);
