/**
 * @description 产品环境足迹建模列表页
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
import { LCARouteMaps } from '@/router/utils/lcaEnums';
import { Toast } from '@/utils';
import { useNavigate } from '@/utils/polyfill';

import { columns } from './columns';
import {
  AuthorizationModal,
  AuthorizationModelInfo,
} from './components/AuthorizationModal';
import { searchSchema } from './schemas';
import { getModelList, postModelAuth } from './service';
import { ModelInfo, Request } from './type';

const CarbonFootprintModel = () => {
  const navigate = useNavigate();
  const { refresh } = useTable();

  /** 所属组织枚举 */
  const orgList = useOrgs();

  const searchApi: CustomSearchProps<ModelInfo, Request> = args =>
    getModelList(args).then(({ data }) => data?.data);

  /** 当前模型id */
  const [modelId, setModelId] = useState<number>();

  /** 当前行的基本信息 */
  const [rowModelInfo, setRowModelInfo] = useState<AuthorizationModelInfo>({});

  /** 控制数据授权弹窗显隐 */
  const [openAuthorizationModal, setOpenAuthorizationModal] = useState(false);

  /** 数据授权弹窗确认按钮loading */
  const [
    authorizationModalConfirmLoading,
    setAuthorizationModalConfirmLoading,
  ] = useState(false);

  /** 打开数据授权弹窗方法 */
  const onOpenAuthorizationModal = ({
    id,
    modelInfo,
  }: {
    id: number;
    modelInfo: AuthorizationModelInfo;
  }) => {
    setModelId(id);
    setRowModelInfo(modelInfo);
    setOpenAuthorizationModal(true);
  };

  return (
    <Page
      title={I18N.carbonFootPrintLCA.theProductEnvironmentIsSufficient}
      onBtnClick={async () => {
        navigate(
          LCARouteMaps.lcaModelInfo.replace(
            ':pageTypeInfo',
            `${PageTypeInfo.add}`,
          ),
        );
      }}
      actionBtnChild={checkAuth(
        '/carbonFootprintLCA/model/add',
        <div>
          <PlusOutlined /> {I18N.carbonFootPrintLCA.newModel}
        </div>,
      )}
    >
      <TableRender<ModelInfo, Request>
        searchProps={{
          schema: searchSchema(orgList),
          api: searchApi,
        }}
        tableProps={{
          columns: columns({ refresh, navigate, onOpenAuthorizationModal }),
          scroll: { x: 1800 },
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />

      {openAuthorizationModal && (
        <AuthorizationModal
          modelId={Number(modelId)}
          modelInfo={rowModelInfo}
          open={openAuthorizationModal}
          onCancel={() => {
            setOpenAuthorizationModal(false);
          }}
          confirmLoading={authorizationModalConfirmLoading}
          onOk={async values => {
            try {
              setAuthorizationModalConfirmLoading(true);
              if (modelId) {
                await postModelAuth(values);
                Toast('success', I18N.carbonFootPrintLCA.modelAuth);
                setOpenAuthorizationModal(false);
                setAuthorizationModalConfirmLoading(false);
              }
            } catch {
              setAuthorizationModalConfirmLoading(false);
            }
          }}
        />
      )}
    </Page>
  );
};
export default withTable(CarbonFootprintModel);
