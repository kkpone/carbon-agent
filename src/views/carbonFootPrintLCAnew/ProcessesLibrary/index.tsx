/**
 * @description 过程库列表页
 */
import { PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { useTable, withTable } from 'table-render';

import { Page } from '@/components/LcaPage';
import { TableRender } from '@/components/x-render/TableRender';
import type { CustomSearchProps } from '@/components/x-render/TableRender/types';
import { useDrawer } from '@/hooks/useDrawer';
import usePageType from '@/hooks/usePageType';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { useNavigate } from '@/utils/polyfill';

import ProcessSetDrawer from './ProcessSetDrawer';
import { columns } from './columns';
import { searchSchema } from './schemas';
import { getProcessLibraryList } from './service';
import { ProcessLibrary, Request } from './type';
import { getCommonOrgsList } from '../utils/org';

const { add, edit, show } = PageTypeInfo;

const ProductManagement = () => {
  const navigate = useNavigate();
  const { refresh } = useTable();
  /** 设置页面抽屉状态 */
  const { pageType, setModelAction } = usePageType(add);

  const { visible, showDrawer, onClose } = useDrawer();

  /** 所属组织列表 */
  const [orgsList, setOrgsList] = useState<any[]>([]);
  /** 设置点击编辑时，数据id值 */
  const [processLibraryDetailId, setProcessLibraryDetailId] =
    useState<number>();

  /** 列表操作按钮 */
  const onActionBtnClick = (type: string, id?: number) => {
    /** 校验ID */
    if (!id) return; // 如果没有 id 直接返回，避免无效操作

    /** 根据类型设置操作 */
    switch (type) {
      case edit:
      case show:
        setProcessLibraryDetailId(id); // 设置详情ID
        setModelAction(type); // 设置模型操作类型
        showDrawer(); // 显示抽屉
        break;
      default:
    }
  };

  /** 列表数据 */
  const searchApi: CustomSearchProps<ProcessLibrary, Request> = args =>
    getProcessLibraryList(args).then(({ data }) => data?.data);

  useEffect(() => {
    const loadData = async () => {
      // 获取所属组织列表
      const orgsPromise = getCommonOrgsList();
      // 所有接口执行完毕
      const [orgs] = await Promise.all([orgsPromise]);
      setOrgsList(orgs || []);
    };
    loadData();
  }, []);

  return (
    <Page
      title={I18N.carbonFootPrintLCA.processLibrary}
      onBtnClick={async () => {
        setModelAction(add);
        showDrawer();
      }}
      actionBtnChild={checkAuth(
        '/carbonFootprintLCAnew/processLibrary/add',
        <div>
          <PlusOutlined /> {I18N.Factors.newAddition}
        </div>,
      )}
    >
      <TableRender<ProcessLibrary, Request>
        searchProps={{
          schema: searchSchema(orgsList),
          api: searchApi,
        }}
        tableProps={{
          columns: columns({ navigate, refresh, onActionBtnClick }),
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />
      {/* 新版过程库抽屉 */}
      <ProcessSetDrawer
        processLibraryDetailId={Number(processLibraryDetailId)}
        visible={visible}
        acquisitionActionType={pageType}
        onClose={() => {
          onClose();
          refresh?.({ stay: true, tab: 1 });
        }}
      />
    </Page>
  );
};
export default withTable(ProductManagement);
