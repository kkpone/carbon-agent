/**
 * @description CBAM前体数据
 */
import I18N from '@src/lang/I18N';
import { useHistory } from 'react-router-dom';
import { withTable, useTable } from 'table-render';

import { Page } from '@/components/Page';
import { TableRender } from '@/components/x-render/TableRender';
import { CustomSearchProps } from '@/components/x-render/TableRender/types';

import { columns } from './columns';
import { defaultProps, PRECURSOR_DATA_STATUS } from './constants';
import { searchSchema } from './schemas';
import { getPrecursorDataList } from './service';
import { PrecursorDataRequest, PrecursorDataResp } from './type';
import { useSupplyChainEnums } from '../hook';
import { toNavigate } from '../router';

const { FILLED } = PRECURSOR_DATA_STATUS;

const PrecursorData = () => {
  const navigate = toNavigate(useHistory());
  const { refresh } = useTable();

  /** 填报审批状态枚举 */
  const applyStatusOptions = useSupplyChainEnums('ApplyStatus')?.filter(
    item => item.code !== FILLED,
  );

  /** 碳数据填报列表 */
  const searchApi: CustomSearchProps<
    PrecursorDataResp,
    PrecursorDataRequest
  > = args =>
    getPrecursorDataList({
      ...defaultProps,
      ...args,
      type: 0,
    }).then(
      ({ data }) =>
        // type 0的时候是全量的,1的时候是审批的
        data?.data,
    );

  return (
    <Page title={I18N.cbam.beforeCbam}>
      <TableRender<PrecursorDataResp, PrecursorDataRequest>
        searchProps={{
          schema: searchSchema({ applyStatusOptions }),
          api: searchApi,
        }}
        tableProps={{
          columns: columns({ refresh, navigate }),
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />
    </Page>
  );
};

export default withTable(PrecursorData);
