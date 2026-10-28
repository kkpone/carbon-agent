/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-11-22 14:13:52
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-19 16:51:16
 */
/**
 * @file 导入排放源
 * @author lixingchen
 * */

import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import useSyncCallback from '@src/utils/useSyncCallback';
import { apiMnumListALLByDictTypeBatch } from '@src/views/emission/Show/service';
import { useIndexColumn } from '@src/views/emission/utils';
import {
  apiExcelList,
  apiExportTemplate,
  apiImportSource,
  apiModelImport,
} from '@src/views/enterpriseCarbonAccount2/service';
import { Button, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../../../style.less';
import { downloadFile } from '@src/components/DownLoadFile';
import ImportFileHead from '@src/components/ImportFileHead';

const SupplierDashboardPage = (props: {
  computationId: string;
  computationPeriod?: string;
  hideTitle?: boolean;
}) => {
  const history = useHistory();
  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const pageType =
    history.location.pathname ===
    RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicImport
      ? 'dic'
      : 'account';

  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);
  const [upLoadState, setUpLoadState] = useState<
    'default' | 'success' | 'error'
  >('default'); // 'none'|'success'|'error'
  const [tableList, setTableList] = useState<any>([]);

  const operateKey = new URLSearchParams(location.search).get('operateKey');

  const state = [
    { name: I18N.carbonFootprint.importing, className: 'woring btn-base' },
    { name: I18N.carbonFootprint3.importAllAs, className: 'succsse btn-base' },
    { name: I18N.carbonFootprint3.importAllLost, className: 'error btn-base' },
    {
      name: I18N.carbonFootprint3.partialImportAs,
      className: 'woring btn-base',
    },
  ];

  const { computationId, computationPeriod } = props;
  const columns: any = [
    {
      title: I18N.carbonFootprint.fileName,
      fixed: 'left',
      dataIndex: 'name',
      ellipsis: true,
      width: 240,
    },
    {
      title: I18N.carbonFootprint.totalNumberOfEntries,
      dataIndex: 'total',
      width: 100,
      render: txt => <div>{txt}</div>,
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
      width: 160,
      dataIndex: 'status',
      render: status => (
        <span className={state[status]?.className}>{state[status]?.name}</span>
      ),
    },
    {
      title: I18N.carbonFootprint.operator,
      width: 90,
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
      width: 180,
      fixed: 'right',
      dataIndex: 'supplyQuantity',
      render: (txt, record) => (
        <>
          <Button
            type='link'
            onClick={() => {
              record.url && downloadFile(record.name, record.url);
            }}
          >
            {I18N.carbonFootprint.sourceFile}
          </Button>
          {!(record.fail === 0 && record.status === 1) ? (
            <Button
              type='link'
              onClick={() => {
                downloadFile(record.name, record.failUrl);
              }}
            >
              {I18N.carbonFootprint.abnormalData}
            </Button>
          ) : (
            ''
          )}
        </>
      ),
    },
  ];
  const getList = async () => {
    const data = {
      pageNum: page.current,
      pageSize: page.pageSize,
      type: pageType === 'account' ? 0 : 1,
    };
    setPage(value => {
      data.pageNum = value.current;
      return value;
    });

    if (pageType === 'account') {
      Object.assign(data, {
        computationId,
      });
    }
    const res: any = await apiExcelList(data);
    setPage(value => ({ ...value, total: res.data.total }));
    const list = res.data.rows;
    setTableList(list);
  };
  const asnycGetList = useSyncCallback(getList);
  // const comparisonList = () => {
  //   const data = {
  //     // pageNum: num,
  //     // pageSize: size,
  //     type: pageType === 'account' ? 0 : 1,
  //   };
  //   if (pageType === 'account') {
  //     Object.assign(data, {
  //       computationId,
  //     });
  //   }
  //   apiExcelList(data).then((res: any) => {
  //     const newList = res.data.rows;
  //     const newStatus = newList.map(item => item.status);
  //     const oldStatus = oldList.map(item => item.status);
  //     if (JSON.stringify(oldStatus) !== JSON.stringify(newStatus)) {
  //       setTableList([...newList]);
  //     }
  //   });
  // };
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
    <div className='enterprise-carbon-account2'>
      <div className='importdis-box import-box'>
        {!props.hideTitle && (
          <p className='tit'>{I18N.carbonFootprint.importEmissionSources}</p>
        )}
        <ImportFileHead
          upLoadState={upLoadState}
          onDownTemplateLoadHandle={() => {
            if (pageType === 'account') {
              apiExportTemplate({ computationId, computationPeriod }).then(
                res => {
                  downloadFile(
                    I18N.enterpriseCarbonAccount2.emissionSourceTemplate,
                    res.data.data.path,
                  );
                },
              );
            } else {
              apiMnumListALLByDictTypeBatch({
                dictTypes: 'enterprise_export_template',
              }).then((res: any) => {
                downloadFile(
                  I18N.enterpriseCarbonAccount2.emissionSourceTemplate,
                  res.data.data.enterprise_export_template[0].relatedValue,
                );
              });
            }
          }}
          onImportSuccessHandle={fileList =>
            new Promise<void>(resCb => {
              const formData = new FormData();
              formData.append('file', fileList[0].originFileObj);
              formData.append('computationId	', computationId);
              if (computationPeriod) {
                formData.append('computationPeriod	', computationPeriod);
              }
              if (pageType === 'account') {
                if (operateKey) {
                  formData.append('operateKey', operateKey);
                }
                apiImportSource(formData)
                  .then(res => {
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
                  })
                  .finally(() => resCb());
              } else {
                apiModelImport(formData)
                  .then(res => {
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
                  })
                  .finally(() => resCb());
              }
            })
          }
        />

        <p className='import-word'>{I18N.carbonFootprint.importHistory}</p>
        <Table
          columns={[...indexColumn, ...columns]}
          scroll={{ y: 'calc(100vh - 483px)' }}
          dataSource={tableList}
          onChange={params => {
            setPage({
              ...page,
              pageSize: params?.pageSize || 1,
              current: params?.current || 10,
            });
            asnycGetList();
          }}
          pagination={{
            total: page.total,
            current: page.current,
            pageSize: page.pageSize,
          }}
        />
      </div>
    </div>
  );
};
export default SupplierDashboardPage;
