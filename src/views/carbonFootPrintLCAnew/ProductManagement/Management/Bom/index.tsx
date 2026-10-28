/**
 * @description 产品信息配置-BOM清单
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
import { getBomList } from './service';
import { BomResp } from './type';
import { BasicProps } from '../type';

const BomList = ({ onClickBack, productId }: BasicProps) => {
  const navigate = useNavigate();

  /** 表格数据 */
  const [bomDataSource, setBomDataSource] = useState<BomResp[]>([]);

  /** 获取表格数据 */
  const getDataSource = async () => {
    await getBomList({
      productId: Number(productId),
    }).then(({ data }) => {
      const result = data?.data || [];
      setBomDataSource(result);
    });
  };

  useEffect(() => {
    if (productId) {
      getDataSource();
    }
  }, [productId]);

  return (
    <Page
      title={I18N.carbonFootPrintLCA.bomList}
      onBtnClick={async () => {
        if (productId) {
          navigate({
            pathname: LCARouteMaps.lcaProductionBomImport.replace(
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
      <ProTable<BomResp>
        columns={columns()}
        key='bom'
        pagination={false}
        search={false}
        bordered
        rowKey='id'
        toolBarRender={false}
        dataSource={bomDataSource}
        scroll={{
          x: 1600,
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
export default BomList;
