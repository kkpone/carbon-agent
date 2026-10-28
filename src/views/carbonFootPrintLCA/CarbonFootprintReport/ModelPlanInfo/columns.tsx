import { compact } from 'lodash-es';
import { TableRenderProps } from 'table-render';

import { TableActions } from '@/components/Table/TableActions';
import I18N from '@/lang/I18N';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { LCARouteMaps } from '@/router/utils/lcaEnums';

import { AssessmentResp } from '../type';

const { show } = PageTypeInfo;

/** 方案列表 */
export const modelPlanColumns =
  (): TableRenderProps<AssessmentResp>['columns'] => [
    {
      title: I18N.carbonFootPrintLCA.modelName,
      dataIndex: 'modelName',
      fixed: 'left',
    },
    {
      title: I18N.certificationReviewCenter.modelCoding,
      dataIndex: 'modelCode',
      width: '220px',
    },
    {
      title: I18N.carbonFootPrintLCA.functionalUnits,
      dataIndex: 'funcUnit',
    },
    {
      title: I18N.certificationReviewCenter.planName,
      dataIndex: 'planName',
    },
    {
      title: I18N.certificationReviewCenter.evaluationMethods,
      dataIndex: 'assessmentMethodName',
    },
    {
      title: I18N.certificationReviewCenter.evaluatingIndicator,
      dataIndex: 'assessmentTargetNames',
    },
    // {
    //   title: I18N.carbonData.affiliatedOrganization,
    //   dataIndex: 'orgName',
    // },
    {
      title: I18N.Factors.productName,
      dataIndex: 'productName',
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
      key: 'action',
      render(_, row) {
        const { modelId } = row || {};
        return (
          <TableActions
            menus={compact([
              checkAuth('/carbonFootprintLCA/report/detail', {
                label: I18N.Factors.check,
                key: I18N.Factors.check,
                onClick: () => {
                  if (modelId) {
                    window.open(
                      `${LCARouteMaps.lcaModelInfo.replace(
                        ':pageTypeInfo',
                        `${show}`,
                      )}?id=${modelId}`,
                    );
                  }
                },
              }),
            ])}
          />
        );
      },
    },
  ];
