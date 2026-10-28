/*
 * @@description: 核算报告
 * @Author: lxc qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-10 16:07:40
 */

import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import Permission from '@src/components/Permission';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps, Modal } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FC, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import '../style.less';
import { formItems } from './utils';
import { columns } from './utils/columns';
import {
  apiReportList,
  apiInventoryReportGhg,
  apiInventoryReportIso,
  apiInventoryReportWordGhg,
  apiInventoryReportSimpleGhg,
  apiInventoryReportSimpleIso,
  apiInventoryReportWordIso,
  reGenerateReport,
  deleteReport,
} from '../service';

const EnterpriseCarbonAccountingList: FC = () => {
  // 当前标题
  const currentName = I18N.enterpriseCarbonAccount2.accountingReport;

  const [deleteId, setDeleteId] = useState<string | number>('');
  const [dowloadModel, setDowloadModel] = useState<boolean>(false);

  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  const [generateReportVisible, setGenerateReportVisible] =
    useState<boolean>(false);

  const [genModalBtnLoading, setGenModalBtnLoading] = useState(false);

  const [searchSupplyForm] = Form.useForm();
  const searchFormProps: FormProps = {
    layout: 'inline',
    form: searchSupplyForm,
  };
  const history = useHistory();

  const childRef = useRef<TableRef>();
  const [searchParamsData, setSearchParamsData] = useState<any>();

  const searchSupplySub = () => {
    const res = searchSupplyForm.getFieldsValue();

    setSearchParamsData(res);
  };

  const accountReport = (type, record) => {
    if (type === 'generateReport') {
      generateForm.setFieldsValue(record);
      setGenerateReportVisible(true);
    }
    if (type === 'delete') {
      setDeleteVisible(true);
      setDeleteId(record.reportFileRecordId);
    }
  };

  const tableColumns: ColumnsType<any> = columns({
    history,
    accountReport,
    reGenerateReport: async ({ reportFileRecordId }) => {
      await reGenerateReport({ reportFileRecordId });
      childRef.current?.initTableData();
    },
  });
  const deleteOpretion = res => {
    if (res.data.code === 200) {
      Toast('success', I18N.carbonFootprint.deleteSuccessful);
      setDeleteVisible(false);

      childRef.current?.reset();
    } else {
      Toast('warn', I18N.enterpriseCarbonAccount2.deleteFailedPlease);
    }
  };
  // 生成报告弹窗
  const [generateForm] = Form.useForm();
  const renderGenerateReportModal = () => {
    generateForm.setFieldsValue({ ghg: [1], iso: [1] });
    const itemForm: any = [
      {
        label: I18N.enterpriseCarbonAccount2.ghgPr,
        name: 'ghg',
        type: 'checkbox',
        rules: false,
        placeholder: I18N.carbonFootprint.pleaseEnter,
        col: 24,
        props: {
          options: [
            { value: 1, label: I18N.enterpriseCarbonAccount2.reportSummary },
            { value: 2, label: I18N.enterpriseCarbonAccount2.completeReport },
            { value: 3, label: I18N.enterpriseCarbonAccount2.inventoryFile },
          ],
        },
      },
      {
        label: I18N.enterpriseCarbonAccount2.isoVersion,
        name: 'iso',
        type: 'checkbox',
        rules: false,
        placeholder: I18N.carbonFootprint.pleaseEnter,
        col: 24,
        props: {
          options: [
            { value: 1, label: I18N.enterpriseCarbonAccount2.reportSummary },
            { value: 2, label: I18N.enterpriseCarbonAccount2.completeReport },
            { value: 3, label: I18N.enterpriseCarbonAccount2.inventoryFile },
          ],
        },
      },
    ];
    const modelFormProps: FormProps = {
      ...formPropsInit(),
      form: generateForm,
      layout: 'vertical',
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };

    return (
      <>
        <Modal
          open={generateReportVisible}
          title={I18N.carbonFootprint.generateReport}
          className='generate-modal'
          onCancel={() => {
            setGenerateReportVisible(false);
          }}
          okButtonProps={{ loading: genModalBtnLoading }}
          onOk={() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const data = generateForm.getFieldsValue(true);
            const { ghg, iso, reportId } = data;

            setGenModalBtnLoading(true);
            if (ghg.includes(3)) {
              apiInventoryReportGhg({ reportId })
                .then((res: any) => {
                  if (res.data.code === 200) {
                    setDowloadModel(true);
                    setGenerateReportVisible(false);
                  }
                })
                .finally(() => {
                  setGenModalBtnLoading(false);
                });
            }
            if (ghg.includes(2)) {
              apiInventoryReportWordGhg({ reportId })
                .then((res: any) => {
                  if (res.data.code === 200) {
                    setDowloadModel(true);
                    setGenerateReportVisible(false);
                  }
                })
                .finally(() => {
                  setGenModalBtnLoading(false);
                });
            }
            if (ghg.includes(1)) {
              apiInventoryReportSimpleGhg({ reportId })
                .then((res: any) => {
                  if (res.data.code === 200) {
                    setDowloadModel(true);
                    setGenerateReportVisible(false);
                  }
                })
                .finally(() => {
                  setGenModalBtnLoading(false);
                });
            }
            if (iso.includes(3)) {
              apiInventoryReportIso({ reportId })
                .then((res: any) => {
                  if (res.data.code === 200) {
                    setDowloadModel(true);
                    setGenerateReportVisible(false);
                  }
                })
                .finally(() => {
                  setGenModalBtnLoading(false);
                });
            }
            if (iso.includes(2)) {
              apiInventoryReportWordIso({ reportId })
                .then((res: any) => {
                  if (res.data.code === 200) {
                    setDowloadModel(true);
                    setGenerateReportVisible(false);
                  }
                })
                .finally(() => {
                  setGenModalBtnLoading(false);
                });
            }
            if (iso.includes(1)) {
              apiInventoryReportSimpleIso({ reportId })
                .then((res: any) => {
                  if (res.data.code === 200) {
                    setDowloadModel(true);
                    setGenerateReportVisible(false);
                  }
                })
                .finally(() => {
                  setGenModalBtnLoading(false);
                });
            }
          }}
        >
          <FormItemUtil
            antdFormProps={modelFormProps}
            formItems={itemForm}
            paddRight={30}
          />
        </Modal>
        <Modal
          width={400}
          title={I18N.carbonFootprint.generateReport}
          open={dowloadModel}
          okText={I18N.carbonFootprint.confirm}
          cancelText={I18N.carbonFootprint.cancel}
          onCancel={() => setDowloadModel(false)}
          onOk={() => {
            history.push(RouteMaps.enterpriseCarbonAccountingDownloadList);
            setDowloadModel(false);
          }}
        >
          <span>{I18N.enterpriseCarbonAccount2.generatingReports}</span>
        </Modal>
      </>
    );
  };

  const formLists = useMemo(() => formItems(), []);

  return (
    <div className='enterprise-carbon-account2' style={{ overflow: 'initial' }}>
      <div className='list-component'>
        <div className='title-box'>
          <span className='title'>{currentName}</span>
          <div>
            <Permission flag='enterprise:report:add'>
              <Button
                type='primary'
                onClick={() => {
                  history.push(
                    RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportAdd,
                  );
                }}
                className='btn-style'
              >
                {I18N.carbonFootprint.newAddition}
              </Button>
            </Permission>
          </div>
        </div>

        <div className='form-style'>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            formItems={formLists}
            searchSub={searchSupplySub}
            resetBack={() => {
              setSearchParamsData(undefined);
            }}
          />
        </div>
        <CommonTable
          columns={[...tableColumns]}
          cRef={childRef}
          scroll={{ y: 'calc(100vh - 305px)' }}
          pageSize={10}
          pagination={{
            showTotal: total =>
              I18N.template(I18N.enterpriseCarbonAccount2.totalTota2, {
                val1: total,
              }),
          }}
          showPageBar
          // @ts-ignore
          fetchApi={params =>
            // @ts-ignore
            apiReportList({
              pageNum: params.page,
              pageSize: params.size,
              ...params,
            })
          }
          returnFetchApi={back => ({
            // @ts-ignore
            data: back.data?.rows,
            // @ts-ignore
            count: back.data?.total,
          })}
          searchParams={searchParamsData}
          pagePosition
        />
      </div>
      <Modal
        open={deleteVisible}
        okButtonProps={{ type: 'default' }}
        title={I18N.carbonFootprint.delete}
        className='delete-modal'
        onCancel={() => {
          setDeleteVisible(false);
        }}
        onOk={async () => {
          const res = await deleteReport({ reportFileRecordId: deleteId });
          deleteOpretion(res);
        }}
      >
        <span className='text'>
          {I18N.enterpriseCarbonAccount2.confirmDeletionOfThis2}
          {currentName}？
        </span>
      </Modal>
      {renderGenerateReportModal()}
    </div>
  );
};

export default EnterpriseCarbonAccountingList;
