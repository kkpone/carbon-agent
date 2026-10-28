import I18N from '@src/lang/I18N';
import { Checkbox, Form, FormInstance, Modal } from 'antd';
import { CheckboxOptionType } from 'antd/es/checkbox';
import { compact } from 'lodash-es';
import { NavigateFunction } from 'react-router-dom';
import { TableContext, TableRenderProps } from 'table-render/dist/src/types';

import { TableActions } from '@/components/Table/TableActions';
import { checkAuth } from '@/layout/utills';
import { RouteMaps } from '@/router/route-paths';
import { PageTypeInfo } from '@/router/utils/enums';
import { Toast, modalText, modelFooterBtnStyle } from '@/utils';

import { postReportCreateStandards, postReportDelete } from './service';
import { ReportProps } from './type';

const { edit, show } = PageTypeInfo;

const CheckboxGroup = Checkbox.Group;

export const columns = ({
  refresh,
  onActionBtnClick,
  form,
  // plainOptions,
  dataQualityCategoryOptions,
  navigate,
}: {
  navigate: NavigateFunction;
  /** 语言枚举 */
  // plainOptions: CheckboxOptionType[];
  /** 数据质量类别枚举 */
  dataQualityCategoryOptions: CheckboxOptionType[];
  refresh: TableContext<any>['refresh'];
  /** 操作按钮的方法 */
  onActionBtnClick?: (type: PageTypeInfo, id?: number) => void;
  form?: FormInstance<any> | undefined;
}): TableRenderProps<ReportProps>['columns'] => [
  {
    title: I18N.carbonFootPrintLCA.reportName,
    dataIndex: 'reportName',
    fixed: 'left',
  },
  // {
  //   title: I18N.carbonData.affiliatedOrganization,
  //   dataIndex: 'orgName',
  // },
  {
    title: I18N.carbonFootPrintLCA.modelName,
    dataIndex: 'modelName',
  },
  {
    title: I18N.carbonFootPrintLCA.functionalUnits,
    dataIndex: 'funcUnit',
  },
  {
    title: I18N.carbonFootPrintLCA.productionCycle,
    dataIndex: 'productionCycle',
    width: 200,
    render(_, row) {
      const { startTime, endTime } = row || {};
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
    width: 180,
  },
  {
    title: I18N.Factors.operation,
    dataIndex: 'action',
    fixed: 'right',
    width: 280,
    render(_, row) {
      const { id, reportName, assessmentId } = row || {};
      return (
        <TableActions
          menus={compact([
            checkAuth('/carbonFootprintLCAnew/report/create', {
              label: I18N.carbonFootPrintLCA.generateReport,
              key: I18N.carbonFootPrintLCA.generateReport,
              onClick: async () => {
                /** 展示去掉英文筛选 */
                if (assessmentId) {
                  Modal.confirm({
                    title: I18N.carbonFootPrintLCA.generateReport,
                    icon: '',
                    content: (
                      <Form layout='vertical' form={form}>
                        {/* <Form.Item
                            label={I18N.carbonFootPrintLCA.reportLanguage}
                            name='language'
                            required
                          >
                            <CheckboxGroup options={plainOptionsBack} />
                          </Form.Item> */}
                        <Form.Item
                          label={I18N.carbonFootPrintLCA.dataQualityCategory}
                          name='dataQualityCategory'
                          required
                        >
                          <CheckboxGroup options={dataQualityCategoryOptions} />
                        </Form.Item>
                      </Form>
                    ),
                    ...modelFooterBtnStyle,
                    okText: I18N.base.confirm,
                    cancelText: I18N.Factors.cancel,
                    okCancel: false,
                    onOk: async () => {
                      /** 暂时去掉语言选择 */
                      // const errorText =
                      //   I18N.carbonFootPrintLCA.pleaseSelectAtLeast2;
                      try {
                        const values = await form?.validateFields();
                        const { dataQualityCategory } = values;
                        // if (!language || language.length === 0) {
                        //   throw new Error(errorText);
                        // }
                        if (
                          !dataQualityCategory ||
                          dataQualityCategory.length === 0
                        ) {
                          throw new Error(
                            I18N.carbonFootPrintLCA.pleaseSelectAtLeast3,
                          );
                        }
                        await postReportCreateStandards({
                          dataQualityCategoryList: dataQualityCategory,
                          reportId: Number(id),
                          langTypeList: [1],
                        });
                        Modal.confirm({
                          title: I18N.carbonFootPrintLCA.generateReport,
                          content: I18N.eca.generateReportTask,
                          ...modelFooterBtnStyle,
                          okText: I18N.base.confirm,
                          cancelText: I18N.Factors.cancel,
                          onOk: async () => {
                            navigate(RouteMaps.downloadManage);
                          },
                        });
                      } catch (e) {
                        // Toast('error', errorText);
                        // throw new Error(errorText);
                        Toast(
                          'error',
                          I18N.carbonFootPrintLCA.pleaseSelectAtLeast3,
                        );
                        throw new Error(
                          I18N.carbonFootPrintLCA.pleaseSelectAtLeast3,
                        );
                      }
                    },
                  });
                } else {
                  Toast(
                    'error',
                    I18N.carbonFootPrintLCA.pleaseAssociateTheModuleFirst,
                  );
                }
              },
            }),
            checkAuth('/carbonFootprintLCAnew/report/edit', {
              label: I18N.Factors.edit,
              key: I18N.Factors.edit,
              onClick: () => {
                onActionBtnClick?.(edit, id);
              },
            }),
            checkAuth('/carbonFootprintLCAnew/report/delete', {
              label: I18N.Factors.delete,
              key: I18N.Factors.delete,
              onClick: async () => {
                Modal.confirm({
                  title: I18N.Factors.prompt,
                  icon: '',
                  content: (
                    <div>
                      {I18N.carbonFootprint.confirmDeletionOfThis3}
                      <span className={modalText}>{reportName}?</span>
                    </div>
                  ),
                  ...modelFooterBtnStyle,
                  okText: I18N.base.confirm,
                  cancelText: I18N.Factors.cancel,
                  onOk: async () => {
                    if (id) {
                      await postReportDelete({
                        id,
                      });
                      Toast('success', I18N.Factors.deleteSuccessful);
                      refresh?.({ stay: true, tab: 1 });
                    }
                  },
                });
              },
            }),
            checkAuth('/carbonFootprintLCAnew/report/detail', {
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
