import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { compact } from 'lodash-es';
import { NavigateFunction } from '@/views/cbam/router';
import { TableContext, TableRenderProps } from 'table-render/dist/src/types';

import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { PageTypeInfo } from '@/router/utils/enums';
import { RouteMaps } from '@/router/route-paths';
import { Toast, modalText, modelFooterBtnStyle } from '@/utils';

import { INFO_SOURCE } from './Info/constant';
import {
  deleteCbamDelete,
  getCbamReportCopy,
  postCbamReportCreate,
} from './service';
import { GeneralInfoProps } from './type';

const { edit, show } = PageTypeInfo;

export const columns = ({
  refresh,
  navigate,
}: {
  refresh: TableContext<any>['refresh'];
  navigate: NavigateFunction;
}): TableRenderProps<GeneralInfoProps>['columns'] => [
  {
    title: I18N.cbam.reportName,
    dataIndex: 'reportName',
    fixed: 'left',
  },
  {
    title: I18N.carbonData.affiliatedOrganization,
    dataIndex: 'orgName',
  },
  {
    title: I18N.cbam.factoryName,
    dataIndex: 'factoryName',
  },
  {
    title: I18N.cbam.reportCycle,
    dataIndex: 'collectDate',
  },
  {
    title: I18N.Factors.updatedBy,
    dataIndex: 'updateByName',
  },
  {
    title: I18N.Factors.updateTime,
    dataIndex: 'updateTime',
    width: 170,
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 290,
    render(_, row) {
      const { id = 0, reportName } = row || {};
      return (
        <TableActions
          menus={compact([
            checkAuth('/cbam/report/edit', {
              label: I18N.Factors.edit,
              key: I18N.Factors.edit,
              onClick: () => {
                navigate({
                  pathname: CBAMRouteMaps.cbamReportInfo.replace(
                    ':pageTypeInfo',
                    `${edit}`,
                  ),
                  search: `id=${id}`,
                });
              },
            }),
            checkAuth('/cbam/report/report', {
              label: I18N.cbam.generateReport,
              key: I18N.cbam.generateReport,
              onClick: async () => {
                if (id) {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: <div>{I18N.cbam.isItBasedOnWhen}</div>,
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: async () => {
                      await postCbamReportCreate({
                        cbamId: Number(id),
                      });
                      Modal.confirm({
                        title: I18N.Factors.prompt,
                        icon: '',
                        content: I18N.cbam.generateReports,
                        ...modelFooterBtnStyle,
                        okText: I18N.base.confirm,
                        cancelText: I18N.Factors.cancel,
                        onOk: async () => {
                          navigate(RouteMaps.downloadManage);
                        },
                      });
                    },
                  });
                }
              },
            }),
            checkAuth('/cbam/report/copy', {
              label: I18N.carbonFootPrintLCA.copy,
              key: I18N.carbonFootPrintLCA.copy,
              onClick: () => {
                Modal.confirm({
                  title: I18N.Factors.prompt,
                  icon: '',
                  content: (
                    <div>
                      <span>{I18N.cbam.confirmToCopyThis}</span>
                      <span className={modalText}>{reportName}？</span>
                    </div>
                  ),
                  ...modelFooterBtnStyle,
                  okText: I18N.base.confirm,
                  cancelText: I18N.Factors.cancel,
                  onOk: async () => {
                    if (id) {
                      await getCbamReportCopy({
                        id,
                      });
                      Toast('success', I18N.carbonFootPrintLCA.copySuccessful);
                      refresh?.();
                    }
                  },
                });
              },
            }),
            checkAuth('/cbam/report/delete', {
              label: I18N.Factors.delete,
              key: I18N.Factors.delete,
              onClick: async () => {
                if (id) {
                  Modal.confirm({
                    title: I18N.Factors.prompt,
                    icon: '',
                    content: (
                      <div>
                        {I18N.cbam.confirmToDeleteThis6}
                        <span className={modalText}>{reportName}？</span>
                      </div>
                    ),
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    onOk: async () => {
                      await deleteCbamDelete({
                        id,
                      });
                      Toast('success', I18N.Factors.deleteSuccessful);
                      refresh?.({ stay: true, tab: 1 });
                    },
                  });
                }
              },
            }),
            checkAuth('/cbam/report/detail', {
              label: I18N.Factors.check,
              key: I18N.Factors.check,
              onClick: () => {
                navigate({
                  pathname: CBAMRouteMaps.cbamReportInfo.replace(
                    ':pageTypeInfo',
                    `${show}`,
                  ),
                  search: `id=${id}&source=${INFO_SOURCE.CBAM}`,
                });
              },
            }),
          ])}
        />
      );
    },
  },
];
