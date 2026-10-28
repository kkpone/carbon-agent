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

import { PRECURSOR_DATA_STATUS } from './constants';
import { postCloseSupplyApply } from './service';
import { PrecursorDataResp } from './type';

const { show } = PageTypeInfo;

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
  refresh,
  navigate,
}: {
  refresh: TableContext<PrecursorDataResp>['refresh'];
  navigate: NavigateFunction;
}): TableRenderProps<PrecursorDataResp>['columns'] => [
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
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 150,
    render(_, row) {
      const { id, applyStatus } = row || {};
      // 除审批通过的前体数据外，其他审批状态下的前体数据均可关闭任务
      const isPassed = Number(applyStatus) === APPROVAL_PASSED;
      // 关闭状态的数据不可操作
      const isClosed = Number(applyStatus) === CLOSED;
      return isClosed ? (
        '-'
      ) : (
        <TableActions
          menus={compact([
            checkAuth('/cbam/precursorData/detail', {
              label: I18N.Factors.check,
              key: I18N.Factors.check,
              onClick: () => {
                navigate({
                  pathname: CBAMRouteMaps.cbamPrecursorDataInfo.replace(
                    ':pageTypeInfo',
                    `${show}`,
                  ),
                  search: `id=${id}`,
                });
              },
            }),
            !isPassed &&
              checkAuth('/cbam/precursorData/close', {
                label: I18N.supplyChainCarbonManagement.closeTask,
                key: I18N.supplyChainCarbonManagement.closeTask,
                onClick: async () => {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: <span>{I18N.cbam.confirmToCloseWhen}</span>,
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: () => {
                      if (!id) return {};
                      return postCloseSupplyApply({
                        id,
                      }).then(() => {
                        Toast(
                          'success',
                          I18N.supplyChainCarbonManagement.closedSuccessfully,
                        );
                        refresh?.({ stay: true, tab: 1 });
                      });
                    },
                  });
                },
              }),
          ])}
        />
      );
    },
  },
];
