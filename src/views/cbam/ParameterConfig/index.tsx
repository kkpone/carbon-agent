/**
 * @description CBAM参数配置列表
 */
import I18N from '@src/lang/I18N';
import { useState } from 'react';
import { useTable, withTable } from 'table-render';

import { Page } from '@/components/Page';
import { TableRender } from '@/components/x-render/TableRender';
import type { CustomSearchProps } from '@/components/x-render/TableRender/types';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';

import { ParameterInfo } from './Info';
import { columns } from './columns';
import { getParameterList } from './service';
import { ParameterResp, ParameterRequest } from './type';

const ParameterConfig = () => {
  const { refresh } = useTable();

  const enumOptions = useAllEnumsBatch('factorUnitM');
  /** 单位枚举 */
  const unitEnum = enumOptions?.factorUnitM;

  /** 控制产品详情的抽屉 */
  const [open, setOpen] = useState(false);

  /** 参数配置ID */
  const [configId, setConfigId] = useState<number>();

  /** 列表操作按钮的类型 */
  const [actionBtnType, setActionBtnType] = useState<string>();

  /** 列表操作按钮 */
  const onActionBtnClick = (type: string, id?: number) => {
    /** 操作按钮的类型 */
    setActionBtnType(type);
    /** 参数配置ID */
    setConfigId(id);
    /* 打开详情抽屉 */
    setOpen(true);
  };

  const onInit = () => {
    setConfigId(undefined);
    setActionBtnType(undefined);
    setOpen(false);
  };

  const searchApi: CustomSearchProps<ParameterResp, ParameterRequest> = args =>
    getParameterList(args).then(({ data }) => data?.data);

  return (
    <Page
      title={I18N.cbam.cbamParticipation}
      // onBtnClick={async () => {
      //   setActionBtnType?.(add);
      //   setConfigId(undefined);
      //   setOpen(true);
      // }}
      // actionBtnChild={checkAuth(
      //   '/carbonFootprintLCA/production/add',
      //   <div>
      //     <PlusOutlined /> {I18N.Factors.newAddition}
      //   </div>,
      // )}
    >
      <TableRender<ParameterResp, ParameterRequest>
        searchProps={{
          schema: { type: 'void', properties: {} },
          hidden: true,
          api: searchApi,
        }}
        tableProps={{
          columns: columns({ refresh, onActionBtnClick }),
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />
      {/* 参数配置详情抽屉 */}
      <ParameterInfo
        open={open}
        configId={configId}
        actionBtnType={actionBtnType}
        unitEnum={unitEnum}
        onOk={() => {
          onInit();
          refresh?.({ stay: true, tab: 1 });
        }}
        onClose={() => onInit()}
      />
    </Page>
  );
};
export default withTable(ParameterConfig);
