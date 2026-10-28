import I18N from '@src/lang/I18N';
import { compact } from 'lodash-es';
import { NavigateFunction } from '@/views/cbam/router';
import { TableRenderProps } from 'table-render/dist/src/types';

import { COLOR, ColorTag } from '@/components/ColorTag';
import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { PageTypeInfo } from '@/router/utils/enums';

import { ApproverPopover } from './ApproverModal';
import { PrecursorDataApprovalListProps } from './type';
import { PRECURSOR_DATA_STATUS } from '../PrecursorData/constants';

const { edit, show } = PageTypeInfo;

const {
  NOT_FILLED,
  FILLING,
  PENDING_APPROVAL,
  APPROVAL_PASSED,
  APPROVAL_FAILED,
  WITHDRAWN,
  CLOSED,
} = PRECURSOR_DATA_STATUS;

const { grey, blue, orange, green, red, yellow, pink } = COLOR;

export const columns = ({
  navigate,
}: {
  navigate: NavigateFunction;
}): TableRenderProps<PrecursorDataApprovalListProps>['columns'] => [
  {
    title: I18N.cbam.nameOfPrecursor,
    dataIndex: 'precursorName',
  },
  {
    title: I18N.carbonFootprint3.supplierName,
    dataIndex: 'supplyName',
  },
  {
    title: I18N.supplyChainCarbonManagement.fillInTheApprovalForm,
    dataIndex: 'applyStatus',
    render: (value, record) => {
      const status = {
        [NOT_FILLED]: grey,
        [FILLING]: blue,
        [PENDING_APPROVAL]: orange,
        [APPROVAL_PASSED]: green,
        [APPROVAL_FAILED]: red,
        [WITHDRAWN]: yellow,
        [CLOSED]: pink,
      };
      return (
        <ColorTag
          color={status[Number(value)]}
          text={record?.applyStatus_name}
        />
      );
    },
  },
  {
    title: I18N.eca.submissionTime,
    dataIndex: 'submitTime',
    width: 180,
  },
  {
    title: I18N.supplyChainCarbonManagement.pendingApprover,
    dataIndex: 'auditUserDtoList',
    width: 150,
    render: (value, record) => {
      const { applyStatus, auditDataId } = record || {};
      const isApproval = applyStatus === PENDING_APPROVAL;
      return isApproval && value ? (
        <ApproverPopover auditDataId={auditDataId}>{value}</ApproverPopover>
      ) : (
        '-'
      );
    },
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 150,
    render(_, row) {
      const { id, applyStatus, userBtnFlag } = row || {};
      const isNotApproval = applyStatus === PENDING_APPROVAL;
      const isClosed = applyStatus === CLOSED;
      return isClosed ? (
        '-'
      ) : (
        <TableActions
          menus={compact([
            isNotApproval &&
              userBtnFlag &&
              checkAuth('/cbam/precursorApproval/approve', {
                label: I18N.eca.auditing,
                key: I18N.eca.auditing,
                onClick: () => {
                  navigate({
                    pathname:
                      CBAMRouteMaps.cbamPrecursorDataApprovalInfo.replace(
                        ':pageTypeInfo',
                        `${edit}`,
                      ),
                    search: `id=${id}`,
                  });
                },
              }),
            checkAuth('/cbam/precursorApproval/detail', {
              label: I18N.Factors.check,
              key: I18N.Factors.check,
              onClick: () => {
                navigate({
                  pathname: CBAMRouteMaps.cbamPrecursorDataApprovalInfo.replace(
                    ':pageTypeInfo',
                    `${show}`,
                  ),
                  search: `id=${id}`,
                });
              },
            }),
          ])}
        />
      );
    },
  },
];
