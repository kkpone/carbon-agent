/**
 * @description 工厂信息列表页
 */
import { PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useState } from 'react';
import { useTable, withTable } from 'table-render';

import { Page } from '@/components/Page';
import { TableRender } from '@/components/x-render/TableRender';
import type { CustomSearchProps } from '@/components/x-render/TableRender/types';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { useCbamOrgs } from '@/views/cbam/hook';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';

import { FactoryInfo } from './Info';
import { columns } from './columns';
import { searchSchema } from './schemas';
import { getFactoryList } from './service';
import { FactoryResp, FactoryRequest } from './type';

const { add } = PageTypeInfo;

const FactoryInformation = () => {
  const { refresh } = useTable();

  /** 所属组织枚举 */
  const orgList = useCbamOrgs();

  const enumOptions = useAllEnumsBatch('CBAMcountryinfo');
  /** 国家名称枚举 */
  const countryList = enumOptions?.CBAMcountryinfo;

  /** 控制产品详情的抽屉 */
  const [open, setOpen] = useState(false);

  /** 工厂ID */
  const [factoryId, setFactoryId] = useState<number>();

  /** 列表操作按钮的类型 */
  const [actionBtnType, setActionBtnType] = useState<string>();

  /** 列表操作按钮 */
  const onActionBtnClick = (type: string, id?: number) => {
    /** 操作按钮的类型 */
    setActionBtnType(type);
    /** 工厂id */
    setFactoryId(id);
    /* 打开详情抽屉 */
    setOpen(true);
  };

  const onInit = () => {
    setFactoryId(undefined);
    setActionBtnType(undefined);
    setOpen(false);
  };

  const searchApi: CustomSearchProps<FactoryResp, FactoryRequest> = args =>
    getFactoryList(args).then(({ data }) => data?.data);

  return (
    <Page
      title={I18N.cbam.factoryInformation}
      onBtnClick={async () => {
        setActionBtnType?.(add);
        setFactoryId(undefined);
        setOpen(true);
      }}
      actionBtnChild={checkAuth(
        '/cbam/factory/add',
        <div>
          <PlusOutlined /> {I18N.Factors.newAddition}
        </div>,
      )}
    >
      <TableRender<FactoryResp, FactoryRequest>
        searchProps={{
          schema: searchSchema(orgList),
          api: searchApi,
        }}
        tableProps={{
          columns: columns({ refresh, onActionBtnClick }),
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />
      {/* 工厂信息详情抽屉 */}
      <FactoryInfo
        open={open}
        factoryId={factoryId}
        actionBtnType={actionBtnType}
        orgList={orgList}
        countryList={countryList}
        onOk={() => {
          onInit();
          refresh?.({ stay: true, tab: 1 });
        }}
        onClose={() => onInit()}
      />
    </Page>
  );
};
export default withTable(FactoryInformation);
