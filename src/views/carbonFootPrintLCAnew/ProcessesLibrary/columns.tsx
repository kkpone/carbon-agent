/*
 * @@description:
 */
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

import { postProcessLibraryCopy, postProcessLibraryDelete } from './service';
import { ProcessLibrary } from './type';

const { edit, show } = PageTypeInfo;

export const columns = ({
  navigate,
  refresh,
  onActionBtnClick,
}: {
  navigate: NavigateFunction;
  refresh: TableContext<any>['refresh'];
  /** 操作按钮的方法 */
  onActionBtnClick?: (type: string, id?: number) => void;
}): TableRenderProps<ProcessLibrary>['columns'] => [
  {
    title: I18N.carbonFootPrintLCA.processSetName,
    dataIndex: 'processLibName',
    fixed: 'left',
    width: 160,
  },
  // {
  //   title: I18N.carbonData.affiliatedOrganization,
  //   dataIndex: 'orgName',
  //   width: 120,
  // },
  {
    title: I18N.carbonFootPrintLCA.lifeCycleStage,
    dataIndex: 'lifeCycleName',
    width: 220,
  },
  {
    title: I18N.Factors.updatedBy,
    dataIndex: 'updateByName',
    width: 120,
  },
  {
    title: I18N.Factors.updateTime,
    dataIndex: 'updateTime',
    width: 150,
    ellipsis: false,
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 280,
    render(_, row) {
      const { id, processLibName, modelId } = row || {};
      return (
        <TableActions
          menus={compact([
            checkAuth('/carbonFootprintLCAnew/processLibrary/model', {
              label: I18N.carbonFootPrintLCA.processModeling,
              key: I18N.carbonFootPrintLCA.processModeling,
              onClick: () => {
                navigate({
                  pathname: LCARouteMaps.lcaProcessLibraryInfo.replace(
                    ':pageTypeInfo',
                    `${edit}`,
                  ),
                  search: `id=${modelId}&processLibId=${id}`,
                });
              },
            }),
            checkAuth('/carbonFootprintLCAnew/processLibrary/edit', {
              label: I18N.Factors.edit,
              key: I18N.Factors.edit,
              onClick: () => {
                onActionBtnClick?.(edit, id);
              },
            }),
            checkAuth('/carbonFootprintLCAnew/processLibrary/copy', {
              label: I18N.carbonFootPrintLCA.copy,
              key: I18N.carbonFootPrintLCA.copy,
              onClick: () => {
                Modal.confirm({
                  title: I18N.Factors.prompt,
                  icon: '',
                  content: (
                    <div>
                      <span>{I18N.carbonFootPrintLCA.confirmCopyingThe}</span>
                      <span className={modalText}>{processLibName}?</span>
                    </div>
                  ),
                  ...modelFooterBtnStyle,
                  okText: I18N.base.confirm,
                  cancelText: I18N.Factors.cancel,
                  onOk: async () => {
                    if (id) {
                      await postProcessLibraryCopy({
                        id,
                      });
                      Toast('success', I18N.carbonFootPrintLCA.copySuccessful);
                      refresh?.();
                    }
                  },
                });
              },
            }),
            checkAuth('/carbonFootprintLCAnew/processLibrary/delete', {
              label: I18N.Factors.delete,
              key: I18N.Factors.delete,
              onClick: async () => {
                Modal.confirm({
                  title: I18N.Factors.prompt,
                  icon: '',
                  content: (
                    <div>
                      <span>
                        {I18N.carbonFootPrintLCA.confirmDeletionOfThis3}
                      </span>
                      <span className={modalText}>{processLibName}?</span>
                    </div>
                  ),
                  ...modelFooterBtnStyle,
                  okText: I18N.base.confirm,
                  cancelText: I18N.Factors.cancel,
                  onOk: async () => {
                    if (id) {
                      await postProcessLibraryDelete({
                        id,
                      });
                      Toast('success', I18N.Factors.deleteSuccessful);
                      refresh?.();
                    }
                  },
                });
              },
            }),
            checkAuth('/carbonFootprintLCAnew/processLibrary/detail', {
              label: I18N.Factors.check,
              key: I18N.Factors.check,
              onClick: () => {
                onActionBtnClick?.(show, id);
              },
            }),
          ])}
        />
      );
    },
  },
];
