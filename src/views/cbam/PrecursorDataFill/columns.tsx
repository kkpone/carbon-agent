import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';
import { NavigateFunction } from '@/views/cbam/router';
import { TableContext, TableRenderProps } from 'table-render/dist/src/types';

import { COLOR, ColorTag } from '@/components/ColorTag';
import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { PageTypeInfo } from '@/router/utils/enums';
import { modelFooterBtnStyle, Toast } from '@/utils';

import { postPrecursorFillRollBack, postPrecursorFillSubmit } from './service';
import { PrecursorDataFillListResq } from './type';
import { PRECURSOR_DATA_STATUS } from '../PrecursorData/constants';

const { edit, show } = PageTypeInfo;
const {
  NOT_FILLED,
  FILLING,
  FILLED,
  PENDING_APPROVAL,
  APPROVAL_PASSED,
  APPROVAL_FAILED,
  WITHDRAWN,
  CLOSED,
} = PRECURSOR_DATA_STATUS;

const { grey, blue, lightBlue, orange, green, red, yellow, pink } = COLOR;
export const columns = ({
  refresh,
  navigate,
}: {
  refresh: TableContext<PrecursorDataFillListResq>['refresh'];
  navigate: NavigateFunction;
}): TableRenderProps<PrecursorDataFillListResq>['columns'] => [
  {
    title: I18N.supplyChainCarbonManagement.customerName,
    dataIndex: 'companyName',
    fixed: 'left',
  },
  {
    title: I18N.cbam.nameOfPrecursor,
    dataIndex: 'precursorName',
  },
  {
    title: I18N.supplyChainCarbonManagement.contacts,
    dataIndex: 'applyRealName',
  },
  {
    title: I18N.supplyChainCarbonManagement.contactInformation,
    dataIndex: 'applyMobile',
  },
  {
    title: I18N.supplyChainCarbonManagement.atTheTimeOfTaskInitiation,
    dataIndex: 'applyTime',
  },
  {
    title: I18N.cbam.taskDeadline,
    dataIndex: 'deadline',
  },
  {
    title: I18N.supplyChainCarbonManagement.fillInTheApprovalForm,
    dataIndex: 'applyStatus',
    render: (value, record) => {
      const status = {
        [NOT_FILLED]: grey,
        [FILLING]: blue,
        [FILLED]: lightBlue,
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
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 200,
    render(_, row) {
      const { id, applyStatus } = row || {};
      // 已关闭，无法操作
      const isClosed = applyStatus === CLOSED;
      return isClosed ? (
        '-'
      ) : (
        <TableActions
          menus={compact([
            // 未填报/填报中/已填报/审批不通过/已撤回 => 填报按钮
            [NOT_FILLED, FILLING, FILLED, APPROVAL_FAILED, WITHDRAWN].includes(
              applyStatus,
            ) &&
              checkAuth('/cbam/precursorFill/fill', {
                label: I18N.eca.fillInTheReport,
                key: I18N.eca.fillInTheReport,
                onClick: () => {
                  navigate({
                    pathname: CBAMRouteMaps.cbamPrecursorDataFillInfo.replace(
                      ':pageTypeInfo',
                      `${edit}`,
                    ),
                    search: `id=${id}`,
                  });
                },
              }),
            // 审批不通过/已撤回/已填报 => 提交按钮
            [APPROVAL_FAILED, WITHDRAWN, FILLED].includes(applyStatus) &&
              checkAuth('/cbam/precursorFill/submit', {
                label: I18N.components.submit,
                key: I18N.components.submit,
                onClick: () => {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: <span>{I18N.cbam.confirmSubmissionOfThis}</span>,
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: () => {
                      if (!id) return {};
                      return postPrecursorFillSubmit({
                        supplyInfoId: id,
                      }).then(() => {
                        Toast('success', I18N.eca.submittedSuccessfully);
                        refresh?.({ stay: true, tab: 1 });
                      });
                    },
                  });
                },
              }),
            // 待审批 => 撤回按钮
            [PENDING_APPROVAL].includes(applyStatus) &&
              checkAuth('/cbam/precursorFill/rollBack', {
                label: I18N.eca.withdraw,
                key: I18N.eca.withdraw,
                onClick: async () => {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: <span>{I18N.cbam.confirmToWithdrawThe}</span>,
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: () => {
                      if (!id) return {};
                      return postPrecursorFillRollBack({
                        id,
                      }).then(() => {
                        Toast('success', I18N.eca.recallSuccessful);
                        refresh?.({ stay: true, tab: 1 });
                      });
                    },
                  });
                },
              }),
            checkAuth('/cbam/precursorFill/detail', {
              label: I18N.Factors.check,
              key: I18N.Factors.check,
              onClick: () => {
                navigate({
                  pathname: CBAMRouteMaps.cbamPrecursorDataFillInfo.replace(
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
