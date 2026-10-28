/*
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-11-15 11:16:12
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-19 11:16:47
 * @FilePath: /new_carbon_cloud/src/views/carbonAccount/userManagement/userList/importUser/index.tsx
 * @Description: 导入用户
 */

import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Button, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useIndexColumn } from '@src/views/emission/utils';
import { FormActions } from '@src/components/FormActions';
import { downloadFile } from '@src/components/DownLoadFile';
import { apiMnumListALLByDictTypeBatch } from '@src/views/emission/Show/service';
import useSyncCallback from '@src/utils/useSyncCallback';
import ImportFileHead from '@src/components/ImportFileHead';
import '../../../index.less';
import {
  ApicarbonAccountUserExcelList,
  ApicarbonAccountUserImportUser,
} from '../service';

const CarbonAccountUserImport = () => {
  const history = useHistory();
  const [page, setPage] = useState({
    page: 1,
    size: 10,
    total: 0,
  });
  const indexColumn = useIndexColumn<any>((page.page - 1) * page.size);
  const [upLoadState, setUpLoadState] = useState<
    'default' | 'success' | 'error'
  >('default'); // 'none'|'success'|'error'
  const [tableList, setTableList] = useState<any>([]);

  // const [refeashKey, setRefeashKey] = useState<number>(1);
  // let oldList1: any = [];
  // let num = 0;
  // let size = 0;
  const state = [
    { name: I18N.carbonAccount.in, className: 'woring btn-base' },
    { name: I18N.components.success, className: 'succsse btn-base' },
    { name: I18N.components.fail, className: 'error btn-base' },
  ];

  const columns: any = [
    {
      title: I18N.carbonFootprint.fileName,
      fixed: 'left',
      dataIndex: 'name',
      width: 240,
    },
    {
      title: I18N.carbonFootprint.totalNumberOfEntries,
      dataIndex: 'total',
      width: 100,
      render: txt => <div>{txt || '-'}</div>,
    },
    {
      title: I18N.carbonFootprint.numberOfImports,
      dataIndex: 'success',
      width: 100,
      render: txt => <div>{txt}</div>,
    },
    {
      title: I18N.carbonFootprint.numberOfExceptions,
      width: 100,
      dataIndex: 'fail',
      render: txt => <div style={{ color: '#EC5B56' }}>{txt}</div>,
    },
    {
      title: I18N.carbonFootprint.state,
      width: 120,
      dataIndex: 'status',
      render: status => (
        <span className={state[status]?.className}>
          {I18N.carbonFootprint.import}{state[status]?.name}
        </span>
      ),
    },
    {
      title: I18N.carbonFootprint.operator,
      width: 120,
      dataIndex: 'createUser',
      render: txt => <div>{txt}</div>,
    },
    {
      title: I18N.carbonFootprint.importTime,
      width: 190,
      dataIndex: 'createTime',
      render: txt => <div>{txt}</div>,
    },

    {
      title: I18N.carbonFootprint.operation,
      width: 200,
      fixed: 'right',
      dataIndex: 'supplyQuantity',
      render: (txt, record) => (
        <>
          <Button
            type='link'
            disabled={!record.url}
            onClick={() => {
              record.url && downloadFile(record.name, record.url);
            }}
          >
            {I18N.carbonFootprint.sourceFile}</Button>
          <Button
            type='link'
            disabled={!record.failUrl}
            onClick={() => {
              downloadFile(record.name, record.failUrl);
            }}
          >
            {I18N.carbonFootprint.abnormalData}</Button>
        </>
      ),
    },
  ];
  const getList = async () => {
    const data = {
      page: page.page,
      size: page.size,
    };
    setPage(value => {
      data.page = value.page;
      return value;
    });

    const res: any = await ApicarbonAccountUserExcelList(data);
    setPage(value => ({ ...value, total: res.data.data.total }));
    const list = res.data.data.rows;
    setTableList(list);
  };
  const asnycGetList = useSyncCallback(getList);

  useEffect(() => {
    getList();
  }, []);
  useEffect(() => {
    const requestTimer = window.setInterval(() => {
      getList();
    }, 5000);
    return () => {
      window.clearInterval(requestTimer);
    };
  }, []);

  return (
    <div className='importdi-box import-box'>
      <p className='tit'>{I18N.carbonAccount.importUsers}</p>
      <ImportFileHead
        upLoadState={upLoadState}
        onDownTemplateLoadHandle={() => {
          apiMnumListALLByDictTypeBatch({
            dictTypes: 'account_import_user',
          }).then((res: any) => {
            downloadFile(
              I18N.carbonAccount.userTemplate,
              res.data.data.account_import_user[0].relatedValue,
            );
          });
        }}
        onImportSuccessHandle={fileList => {
          const formData = new FormData();
          formData.append('file', fileList[0].originFileObj);

          ApicarbonAccountUserImportUser(formData).then(res => {
            if (res.data.code === 200) {
              setUpLoadState('success');
              Toast('success', I18N.carbonFootprint.importSuccessful);
              getList();
              setTimeout(() => {
                setUpLoadState('default');
              }, 1000);
            } else {
              setUpLoadState('error');
            }
          });
        }}
      />

      <p className='import-word'>{I18N.carbonFootprint.importHistory}</p>
      <Table
        className='table-style'
        columns={[...indexColumn, ...columns]}
        scroll={{ y: 'calc(100vh - 483px)' }}
        dataSource={tableList}
        onChange={params => {
          setPage({
            ...page,
            size: params?.pageSize || 1,
            page: params?.current || 10,
          });
          asnycGetList();
        }}
        pagination={{
          total: page.total,
          current: page.page,
          pageSize: page.size,
        }}
      />

      <FormActions
        place='center'
        buttons={[
          {
            type: 'default',
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.goBack();
            },
          },
        ]}
      />
    </div>
  );
};
export default CarbonAccountUserImport;
