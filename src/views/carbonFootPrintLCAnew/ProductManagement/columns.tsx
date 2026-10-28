import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';
import { NavigateFunction } from 'react-router-dom';
import { TableContext, TableRenderProps } from 'table-render/dist/src/types';

import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { LCARouteMaps } from '@/router/utils/lcaEnumsnew';
import { Toast, modalText, modelFooterBtnStyle } from '@/utils';

import { getProductIlcd, postProductionDelete } from './service';
import { Product } from './type';

const { edit } = PageTypeInfo;

export const columns = ({
  refresh,
  navigate,
  onActionBtnClick,
}: {
  refresh: TableContext<any>['refresh'];
  navigate: NavigateFunction;
  /** 操作按钮的方法 type：按钮的类型枚举值add、edit、show、copy， id：所在行的id */
  onActionBtnClick?: (type: string, id?: number) => void;
}): TableRenderProps<Product>['columns'] => [
  {
    title: I18N.Factors.productName,
    dataIndex: 'productName',
    fixed: 'left',
  },
  // {
  //   title: I18N.carbonData.affiliatedOrganization,
  //   dataIndex: 'orgName',
  // },
  {
    title: I18N.carbonFootPrintLCA.productCode,
    dataIndex: 'productCode',
  },
  {
    title: I18N.productDigitalPassport.productModel,
    dataIndex: 'productModel',
  },
  {
    title: I18N.productDigitalPassport.productSpecifications,
    dataIndex: 'specification',
  },
  // {
  //   title: I18N.supplyChainCarbonManagement.sourceSystem,
  //   dataIndex: 'sourceSystem_name',
  // },
  {
    title: I18N.Factors.updatedBy,
    dataIndex: 'updateByName',
  },
  {
    title: I18N.Factors.updateTime,
    dataIndex: 'updateTime',
    width: 180,
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 380,
    render(_, row) {
      const { id = 0, productName } = row || {};
      return (
        <TableActions
          menus={compact([
            // checkAuth('/carbonFootprintLCAnew/production/bom', {
            //   label: I18N.carbonFootPrintLCA.bomList,
            //   key: I18N.carbonFootPrintLCA.bomList,
            //   onClick: () => {
            //     navigate({
            //       pathname: LCARouteMaps.lcaProductionBom.replace(
            //         ':productId',
            //         `${id}`,
            //       ),
            //     });
            //   },
            // }),
            checkAuth('/carbonFootprintLCAnew/production/edit', {
              label: I18N.carbonFootPrintLCA.manageProductInformation,
              key: I18N.Factors.edit,
              onClick: () => {
                onActionBtnClick?.(edit, id);
                navigate({
                  pathname: LCARouteMaps.lcaProductionManage.replace(
                    ':productId',
                    `${id}`,
                  ),
                });
              },
            }),
            checkAuth('/carbonFootprintLCAnew/production/delete', {
              label: I18N.Factors.delete,
              key: I18N.Factors.delete,
              onClick: async () => {
                if (id) {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: (
                      <div>
                        {I18N.carbonFootPrintLCA.deleteProduct}
                        <span className={modalText}>{productName}?</span>
                      </div>
                    ),
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: async () => {
                      await postProductionDelete({
                        id,
                      });
                      Toast('success', I18N.Factors.deleteSuccessful);
                      refresh?.({ stay: true, tab: 1 });
                    },
                  });
                }
              },
            }),
            checkAuth('/carbonFootprintLCAnew/production/exportPoductIlcd', {
              label: I18N.eca.export,
              key: I18N.eca.export,
              onClick: () => {
                Toast('warn', I18N.carbonFootPrintLCA.factorFileGenerating);
                getProductIlcd({ productId: id }).then(({ data }) => {
                  if (data.code === 200) {
                    // Toast('success', I18N.carbonFootPrintLCA.success);
                  } else {
                    // Toast('error', I18N.carbonFootPrintLCA.error);
                  }
                });
              },
            }),
            // checkAuth('/carbonFootprintLCAnew/production/detail', {
            //   label: I18N.Factors.check,
            //   key: I18N.Factors.check,
            //   onClick: () => {
            //     onActionBtnClick?.(show, id);
            //   },
            // }),
          ])}
        />
      );
    },
  },
];
