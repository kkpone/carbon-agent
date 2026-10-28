/**
 * @description 产品信息配置-供应商数据
 */
import { ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { Page } from '@/components/LcaPage';
import { checkAuth } from '@/layout/utills';
import { LCARouteMaps } from '@/router/utils/lcaEnumsnew';
import { useNavigate } from '@/utils/polyfill';

import { columns } from './columns';
import { getSupplyDataList } from './service';
import { SupplierData } from './type';
import { BasicProps } from '../type';

const SupplyData = ({ onClickBack, productId }: BasicProps) => {
  const navigate = useNavigate();

  /** 表格数据 */
  const [dataSource, setDataSource] = useState<SupplierData[]>([]);

  /** 获取表格数据 */
  const getDataSource = async () => {
    await getSupplyDataList({
      productId: Number(productId),
    }).then(({ data }) => {
      const result = data?.data || [];
      setDataSource(result);
    });
  };

  useEffect(() => {
    if (productId) {
      getDataSource();
    }
  }, [productId]);

  return (
    <Page
      title={I18N.components.supplierData}
      onBtnClick={async () => {
        if (productId) {
          navigate({
            pathname: LCARouteMaps.lcaProductionSupplyImport.replace(
              ':productId',
              `${productId}`,
            ),
          });
        }
      }}
      actionBtnChild={checkAuth(
        '/carbonFootprintLCAnew/production/bomImport',
        <div>{I18N.carbonFootprint.import}</div>,
      )}
      wrapperClass='marginBottomFormActionsHeight'
    >
      <ProTable<SupplierData>
        columns={columns()}
        key='bom'
        pagination={false}
        search={false}
        bordered
        rowKey='id'
        toolBarRender={false}
        dataSource={dataSource}
        scroll={{
          x: 4400,
          y: '56vh',
        }}
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
};
export default SupplyData;
