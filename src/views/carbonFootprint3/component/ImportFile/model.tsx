/*
 * @Author: 张明尧
 * @Date: 2022-07-26 09:33:27
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';
import { ProductImportTableList } from './type';

/**
 * 初始化导入的表头
 */
export const importFileInitTableCol =
  (): ColumnsType<ProductImportTableList> => [
    {
      title: I18N.carbonFootprint.number,
      width: 70,
      dataIndex: 'index',
    },
    {
      title: I18N.carbonFootprint.fileName,
      dataIndex: 'name',
    },
    {
      title: I18N.carbonFootprint.totalNumberOfEntries,
      dataIndex: 'totalRows',
    },
    {
      title: I18N.carbonFootprint.numberOfImports,
      dataIndex: 'normalRows',
    },
    {
      title: I18N.carbonFootprint.numberOfExceptions,
      dataIndex: 'errorRows',
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'status',
      render: (val: number) => {
        // 状态: 0-导入中;1-已导入;2-导入异常
        const styleOb: React.CSSProperties = {
          width: '70px',
          height: '28px',
          lineHeight: '30px',
          textAlign: 'center',
          borderRadius: '15px',
        };
        if (val === 0) {
          return (
            <div
              style={{
                ...styleOb,
                background: 'rgba(248,162,49,0.06)',
                color: '#F8A231',
              }}
            >
              {I18N.carbonFootprint.importing}
            </div>
          );
        }
        if (val === 2) {
          return (
            <div
              style={{
                ...styleOb,
                background: 'rgba(253, 246, 246)',
                color: '#ED5555',
              }}
            >
              {I18N.carbonFootprint.importFailed}
            </div>
          );
        }
        return (
          <div
            style={{
              ...styleOb,
              background: 'rgba(9,193,153,0.06)',
              color: '#09C199',
            }}
          >
            {I18N.carbonFootprint.importSuccessful}
          </div>
        );
      },
    },
    {
      title: I18N.carbonFootprint.operator,
      dataIndex: 'updateByName',
    },
    {
      title: I18N.carbonFootprint.importTime,
      dataIndex: 'createTime',
    },
  ];
