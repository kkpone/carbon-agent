/**
 * @description: 产品管理-生命周期数据
 */
import { ProTable } from '@ant-design/pro-components';

import { FormActions } from '@/components/FormActions';
import { Page } from '@/components/LcaPage';
import I18N from '@/lang/I18N';
import { checkAuth } from '@/layout/utills';
import { LCARouteMaps } from '@/router/utils/lcaEnums';
import { useNavigate } from '@/utils/polyfill';

import { columns } from './columns';
import { getLifeCycleDataList } from './service';
import { LifeCycleDataResponse } from './type';
import { BasicProps } from '../type';

export default function LifeCycleData({ productId, onClickBack }: BasicProps) {
  const navigate = useNavigate();

  const onJumpToDetail = (processCode: string) => {
    navigate({
      pathname: LCARouteMaps.lcaProductionLifeCycleInfo.replace(
        ':productId',
        `${productId}`,
      ),
      search: `?processCode=${processCode}`,
    });
  };
  return (
    <Page
      title={I18N.carbonFootPrintLCA.numberOfLifeCycles}
      onBtnClick={async () => {
        if (productId) {
          navigate({
            pathname: LCARouteMaps.lcaProductionLifeCycleImport.replace(
              ':productId',
              `${productId}`,
            ),
          });
        }
      }}
      actionBtnChild={checkAuth(
        '/carbonFootprintLCA/production/lifeCycleImport',
        <div>{I18N.carbonFootprint.import}</div>,
      )}
      wrapperClass='marginBottomFormActionsHeight'
    >
      <ProTable<LifeCycleDataResponse>
        columns={columns({
          onJumpToDetail,
        })}
        key='lifeCycleData'
        pagination={false}
        search={false}
        bordered
        rowKey='id'
        toolBarRender={false}
        scroll={{ y: 'calc(100vh - 300px)' }}
        params={{
          productId,
        }}
        request={async params =>
          getLifeCycleDataList({
            pageNum: 1,
            pageSize: 10,
            productId: params.productId,
          }).then(({ data }) => data?.data)
        }
      />
      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.Factors.return,
            onClick: async () => {
              onClickBack();
            },
          },
        ]}
      />
    </Page>
  );
}
