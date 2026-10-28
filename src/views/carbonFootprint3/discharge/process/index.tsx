/* eslint-disable no-empty */
/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 14:06:32
 * @Date: 2022-12-23 15:45:59
 * @@description: 过程库
 */

import { PlusOutlined } from '@ant-design/icons';
import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { utilGetUrlParams } from '@src/components/SearchForm/util';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps, TableColumnsType, Modal } from 'antd';
import { omit } from 'lodash-es';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  URL_PARAMS_KEY,
  PROCESS_TAB_KEYS,
  DYNAMICS_ROUTE_ID,
  MAX_ELLIPSIS_LENGTH,
} from './constant';
import styles from './index.module.less';
import { carbonFootprintProcessSearchForm } from './model';
import {
  getProcessLibList,
  getUnitProcessInfo,
  postProcessAdd,
  postProcessLibDelete,
} from './service';
import { ProcessLibData } from './type';
import ProcessDrawer from '../../component/AccessoryDrawer/ProcessDrawer';
import TextOverflowTable from '../../component/TextOverflowTable';
import styleCarbonFootprint3 from '../../index.module.less';
import {
  checkEmissionSoureProcessEditPermissions,
  checkEmissionSoureProcessInfoPermissions,
} from '../../util/permissions';

const { confirm } = Modal;

const { IS_EDIT, TAB_KEY } = URL_PARAMS_KEY;

const CarbonFootprint3ProcessSourceLibrary = () => {
  const history = useHistory();

  const [searchForm] =
    Form.useForm<Partial<Pick<ProcessLibData, 'name' | 'type' | 'status'>>>();

  const [addDrawerVisible, setAddDrawerVisible] = useState(false);

  const tableRef = useRef<TableRef>();

  const [searchParams, setSearchParams] = useState<
    Partial<Pick<ProcessLibData, 'name' | 'type' | 'status'>>
  >(() => {
    const searchParamsString = utilGetUrlParams('search') || '{}';
    try {
      return JSON.parse(searchParamsString);
    } catch {
      return {};
    }
  });

  // 复制
  const [copyStatus, setCopyStatus] = useState(false);
  const [processInitialValues, setProcessInitialValues] =
    useState<Record<string, any>>();

  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };

  // const processLibType = classesLeiBie();

  const deleteProcessLib = (processLib: ProcessLibData) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis15, {
        val1: processLib.name,
      }),
      icon: null,
      onOk: async () => {
        try {
          await postProcessLibDelete({ id: processLib.id });
          Toast('success', I18N.carbonFootprint.deleteSuccessful);
          tableRef.current?.initTableData();
        } catch {}
      },
    });
  };

  /**
   * 复制过程库过程
   * @param processLib 复制的数据
   */
  const copyProcess = async (processLib: ProcessLibData) => {
    const { id } = processLib;
    const { data } = await getUnitProcessInfo({
      dataId: id as number,
      parentId: '0',
    });
    setProcessInitialValues(data.data);
    setCopyStatus(true);
    setAddDrawerVisible(true);
  };

  /** 取消过程 */
  const cancelProcess = () => {
    setProcessInitialValues(undefined);
    setCopyStatus(false);
    setAddDrawerVisible(false);
  };

  const processLibTableColumns: TableColumnsType<ProcessLibData> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__index__',
      fixed: 'left',
      width: 70,
      render: (_, processLib, index) => index + 1,
    },
    {
      title: I18N.carbonFootprint3.processName,
      fixed: 'left',
      width: 208,
      dataIndex: 'name',
      render: text => (
        <TextOverflowTable
          value={text || '-'}
          maxLength={MAX_ELLIPSIS_LENGTH}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.updatedBy,
      width: 112,
      dataIndex: 'updateByName',
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      width: 160,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      fixed: 'right',
      width: 120,
      render: (_, processLib) => (
        <div className={styles.operateColumn}>
          {checkPermissions(
            <Button
              type='link'
              onClick={() => {
                if (checkEmissionSoureProcessEditPermissions()) {
                  history.push(
                    `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryEdit.replace(
                      DYNAMICS_ROUTE_ID,
                      String(processLib.id),
                    )}?${IS_EDIT}=true&${TAB_KEY}=${PROCESS_TAB_KEYS.IN_OUT}`,
                  );
                } else if (checkEmissionSoureProcessInfoPermissions()) {
                  history.push(
                    `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryDetails.replace(
                      DYNAMICS_ROUTE_ID,
                      String(processLib.id),
                    )}?${IS_EDIT}=false&${TAB_KEY}=${PROCESS_TAB_KEYS.IN_OUT}`,
                  );
                }
              }}
            >
              {I18N.carbonFootprint3.details}
            </Button>,
            'footprint3:libProcess:info',
          )}

          {checkPermissions(
            <Button type='link' onClick={() => copyProcess(processLib)}>
              {I18N.carbonFootprint.copy}
            </Button>,
            'footprint3:libProcess:edit',
          )}

          {checkPermissions(
            <Button type='link' onClick={() => deleteProcessLib(processLib)}>
              {I18N.carbonFootprint.delete}
            </Button>,
            'footprint3:libProcess:delete',
          )}
        </div>
      ),
    },
  ];

  /** 搜索 */
  const searchSub = () => setSearchParams(searchForm.getFieldsValue());
  const resetBack = () => {
    setSearchParams({});
  };

  return (
    <div className={styles.processLib}>
      <div className={styles.header}>
        <div className={styles.title}>
          {I18N.carbonFootprint3.processLibrary}
        </div>
      </div>
      <div className={styles.searchContent}>
        <SearchFormUtil
          antdFormProps={searchFormProps}
          searchSub={searchSub}
          resetBack={resetBack}
          formItems={carbonFootprintProcessSearchForm()}
        />
        {checkPermissions(
          <Button
            icon={<PlusOutlined />}
            onClick={() => setAddDrawerVisible(true)}
            className={`${styleCarbonFootprint3.btn}`}
            type='primary'
          >
            {I18N.carbonFootprint.newAddition}
          </Button>,
          'footprint3:libProcess:add',
        )}
      </div>
      <div className={styles.tableContent}>
        <CommonTable<
          ProcessLibData,
          { data: { total: number; rows: ProcessLibData[] } }
        >
          columns={processLibTableColumns}
          searchParams={searchParams}
          cRef={tableRef}
          pageSize={10}
          rowKey='id'
          scroll={{ x: 1200 }}
          pagePosition={false}
          fetchApi={params =>
            getProcessLibList({
              ...params,
              pageSize: params.size,
              pageNum: params.page,
            })
          }
          returnFetchApi={back => ({
            data: back?.data?.data?.rows || [],
            count: back?.data?.data?.total || 0,
          })}
        />
      </div>
      {addDrawerVisible && (
        <ProcessDrawer
          isProcess
          copyStatus={copyStatus}
          visible={addDrawerVisible}
          initialValues={processInitialValues}
          onOk={async values => {
            const changeValue = values;
            if (copyStatus) {
              if (changeValue?.processProducts) {
                changeValue.processProducts = changeValue.processProducts.map(
                  product => omit(product, 'id'),
                );
              }
              changeValue.reSelect = 1;
            }

            const resp = await postProcessAdd(changeValue);

            if (resp.data.code === 200) {
              Toast(
                'success',
                copyStatus
                  ? I18N.carbonFootprint3.copySuccessful
                  : I18N.carbonFootprint.successfullyAdded,
              );
              cancelProcess();
              history.push(
                `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryEdit.replace(
                  DYNAMICS_ROUTE_ID,
                  String(resp.data.data),
                )}?${IS_EDIT}=true&${TAB_KEY}=${PROCESS_TAB_KEYS.IN_OUT}`,
              );
            }
          }}
          onCancel={cancelProcess}
        />
      )}
    </div>
  );
};

export default CarbonFootprint3ProcessSourceLibrary;
