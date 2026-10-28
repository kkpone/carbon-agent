import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';
import { TableContext, TableRenderProps } from 'table-render/dist/src/types';

import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
// import { CertifiCatioinReviewCenterMaps } from '@/router/utils/certificationReviewCenterEmums';
import { PageTypeInfo } from '@/router/utils/enums';
import { LCARouteMaps } from '@/router/utils/lcaEnumsnew';
import { Toast, modalText, modelFooterBtnStyle } from '@/utils';

// import { SYSTEM_BOUNDARY_TYPE } from './Info/ObjectivesAndScope/constant';
import { INFO_SOURCE } from './Info/constant';
import { AuthorizationModelInfo } from './components/AuthorizationModal';
import { postModelCopy, postModelDelete } from './service';
import { ModelInfo } from './type';

const { edit, show } = PageTypeInfo;

export const columns = ({
  refresh,
  navigate,
}: // onOpenAuthorizationModal,
{
  refresh: TableContext<any>['refresh'];
  navigate: any;
  onOpenAuthorizationModal: ({
    id,
    modelInfo,
  }: {
    id: number;
    modelInfo: AuthorizationModelInfo;
  }) => void;
}): TableRenderProps<ModelInfo>['columns'] => [
  {
    title: I18N.carbonFootPrintLCA.modelName,
    dataIndex: 'modelName',
    fixed: 'left',
  },
  {
    title: I18N.certificationReviewCenter.modelCoding,
    dataIndex: 'modelCode',
    width: 220,
  },
  {
    title: I18N.carbonFootPrintLCA.functionalUnits,
    dataIndex: 'funcUnit',
  },
  // {
  //   title: I18N.carbonData.affiliatedOrganization,
  //   dataIndex: 'orgName',
  // },
  {
    title: I18N.carbonFootPrintLCA.productionCycle,
    dataIndex: 'startTime',
    width: 200,
    render: (startTime, row) => {
      const { endTime } = row;
      if (startTime && endTime) {
        return `${startTime}~${endTime}`;
      }
      return '-';
    },
  },
  {
    title: I18N.Factors.productName,
    dataIndex: 'productName',
  },
  {
    title: I18N.carbonFootPrintLCA.productCode,
    dataIndex: 'productCode',
  },
  {
    title: I18N.Factors.updatedBy,
    dataIndex: 'updateByName',
  },
  {
    title: I18N.Factors.updateTime,
    dataIndex: 'updateTime',
    ellipsis: false,
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 300,
    render(_, row) {
      const {
        id,
        funcUnit,
        // modelName,
        // productName,
        // modelCode,
        // systemBoundaryType,
      } = row || {};
      return (
        <TableActions
          menus={compact([
            checkAuth('/carbonFootprintLCAnew/model/edit', {
              label: I18N.carbonFootPrintLCA.productModeling,
              key: I18N.carbonFootPrintLCA.productModeling,
              onClick: () => {
                navigate({
                  pathname: LCARouteMaps.lcaModelInfo.replace(
                    ':pageTypeInfo',
                    `${edit}`,
                  ),
                  search: `id=${id}`,
                });
              },
            }),
            checkAuth('/carbonFootprintLCAnew/model/copy', {
              label: I18N.carbonFootPrintLCA.copy,
              key: I18N.carbonFootPrintLCA.copy,
              onClick: async () => {
                if (id) {
                  await postModelCopy({ id });
                  Toast('success', I18N.carbonFootPrintLCA.copySuccessful);
                  refresh?.();
                }
              },
            }),
            checkAuth('/carbonFootprintLCAnew/model/delete', {
              label: I18N.Factors.delete,
              key: I18N.Factors.delete,
              onClick: async () => {
                Modal.confirm({
                  title: I18N.Factors.prompt,
                  icon: '',
                  content: (
                    <div>
                      {I18N.carbonFootPrintLCA.confirmDeletionOfThis}
                      <span className={modalText}>{funcUnit} ?</span>
                    </div>
                  ),
                  ...modelFooterBtnStyle,
                  okText: I18N.base.confirm,
                  cancelText: I18N.Factors.cancel,
                  onOk: async () => {
                    if (id) {
                      await postModelDelete({
                        id,
                      });
                      Toast('success', I18N.Factors.deleteSuccessful);
                      refresh?.();
                    }
                  },
                });
              },
            }),
            checkAuth('/carbonFootprintLCAnew/model/detail', {
              label: I18N.Factors.check,
              key: I18N.Factors.check,
              onClick: () => {
                navigate({
                  pathname: LCARouteMaps.lcaModelInfo.replace(
                    ':pageTypeInfo',
                    `${show}`,
                  ),
                  search: `id=${id}&source=${INFO_SOURCE.LCA_MODEL}`,
                });
              },
            }),
            // checkAuth('/carbonFootprintLCAnew/model/authorization', {
            //   label: I18N.carbonFootPrintLCA.authorization,
            //   key: I18N.carbonFootPrintLCA.authorization,
            //   onClick: () => {
            //     if (
            //       systemBoundaryType === SYSTEM_BOUNDARY_TYPE.CUSTOM_LIFE_CYCLE
            //     ) {
            //       Toast('warn', I18N.carbonFootPrintLCA.dataAuthCheck);
            //     } else if (id) {
            //       onOpenAuthorizationModal({
            //         id,
            //         modelInfo: { modelName, productName, modelCode },
            //       });
            //     }
            //   },
            // }),
            // checkAuth('/carbonFootprintLCAnew/model/initiateReview', {
            //   label: I18N.carbonFootPrintLCA.initiateReview,
            //   key: I18N.carbonFootPrintLCA.initiateReview,
            //   onClick: () => {
            //     // 发起审核 跳转认证审核中心新建单据界面
            //     navigate(
            //       virtualLinkTransform(
            //         CertifiCatioinReviewCenterMaps.certificationReviewCenterFootprintLInfo,
            //         [PAGE_TYPE_VAR, ':id'],
            //         [PageTypeInfo.add, 0],
            //       ),
            //     );
            //   },
            // }),
          ])}
        />
      );
    },
  },
];
