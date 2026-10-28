/**
 * @description 产品信息配置列表页
 */
import { PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useState } from 'react';
import { useTable, withTable } from 'table-render';

import { Page } from '@/components/LcaPage';
import { TableRender } from '@/components/x-render/TableRender';
import type { CustomSearchProps } from '@/components/x-render/TableRender/types';
import { useOrgs } from '@/hooks';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { useNavigate } from '@/utils/polyfill';

import { ProductManagementInfo } from './Info';
import { columns } from './columns';
import { searchSchema } from './schemas';
import { getProductionList } from './service';
import { Product, Request } from './type';
import { useLcaEnums } from '../hook';

const { add } = PageTypeInfo;

const ProductManagement = () => {
  const navigate = useNavigate();
  const { refresh } = useTable();

  /** 所属组织枚举 */
  const orgList = useOrgs();

  /** 来源系统枚举 */
  const sourceSystemList = useLcaEnums('SourceSystem');

  /** 控制产品详情的抽屉 */
  const [open, setOpen] = useState(false);

  /** 产品ID */
  const [productId, setProductId] = useState<number>();

  /** 列表操作按钮的类型 */
  const [actionBtnType, setActionBtnType] = useState<string>();

  /** 列表操作按钮 */
  const onActionBtnClick = (type: string, id?: number) => {
    /** 操作按钮的类型 */
    setActionBtnType(type);
    /** 产品id */
    setProductId(id);
    /* 打开详情抽屉 */
    setOpen(true);
  };

  const onInit = () => {
    setProductId(undefined);
    setActionBtnType(undefined);
    setOpen(false);
  };

  const searchApi: CustomSearchProps<Product, Request> = args =>
    getProductionList(args).then(({ data }) => data?.data);

  return (
    <Page
      title={I18N.carbonFootPrintLCA.productInformationManagement}
      onBtnClick={async () => {
        setActionBtnType?.(add);
        setProductId(undefined);
        setOpen(true);
      }}
      actionBtnChild={checkAuth(
        '/carbonFootprintLCA/production/add',
        <div>
          <PlusOutlined /> {I18N.Factors.newAddition}
        </div>,
      )}
    >
      <TableRender<Product, Request>
        searchProps={{
          schema: searchSchema(orgList),
          api: searchApi,
        }}
        tableProps={{
          columns: columns({ refresh, navigate, onActionBtnClick }),
          scroll: { x: 1400 },
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />
      {/* 产品信息管理详情抽屉 */}
      <ProductManagementInfo
        open={open}
        productId={productId}
        actionBtnType={actionBtnType}
        orgList={orgList}
        sourceSystemList={sourceSystemList}
        onOk={() => {
          onInit();
          refresh?.({ stay: true, tab: 1 });
        }}
        onClose={() => onInit()}
      />
    </Page>
  );
};
export default withTable(ProductManagement);
