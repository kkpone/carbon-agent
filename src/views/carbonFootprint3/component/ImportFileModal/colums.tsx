/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-09 19:11:13
 * @Date: 2023-05-09 17:14:15
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';

import TextOverflowTable from '../TextOverflowTable';

/**
 * 导入弹框展示的表头
 */
export const importFileModalTableCol = <
  TableList,
>(): ColumnsType<TableList> => [
  {
    title: I18N.carbonFootprint.number,
    width: 70,
    dataIndex: 'index',
    fixed: 'left',
  },
  {
    title: I18N.carbonFootprint.fileName,
    width: 200,
    dataIndex: 'name',
    fixed: 'left',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable value={val} maxLength={15} />;
      }
      return '-';
    },
  },
  {
    title: I18N.carbonFootprint.totalNumberOfEntries,
    width: 100,
    dataIndex: 'totalRows',
  },
  {
    title: I18N.carbonFootprint.numberOfImports,
    width: 100,
    dataIndex: 'normalRows',
  },
  {
    title: I18N.carbonFootprint.numberOfExceptions,
    width: 100,
    dataIndex: 'errorRows',
  },
  {
    title: I18N.carbonFootprint.state,
    width: 130,
    dataIndex: 'status',
    render: (val: number) => {
      const styleOb: React.CSSProperties = {
        width: '120px',
        minHeight: '28px',
        lineHeight: '30px',
        textAlign: 'center',
        borderRadius: '15px',
      };
      const ValNode: {
        text: string;
        styleNode: React.CSSProperties;
      }[] = [
        {
          text: I18N.carbonFootprint.importing,
          styleNode: {
            background: 'rgba(248,162,49,0.06)',
            color: '#F8A231',
          },
        },
        {
          text: I18N.carbonFootprint3.importAllAs,
          styleNode: {
            background: 'rgba(9,193,153,0.06)',
            color: '#09C199',
          },
        },
        {
          text: I18N.carbonFootprint3.partialImportAs,
          styleNode: {
            background: 'rgba(248,162,49,0.06)',
            color: '#F8A231',
          },
        },
        {
          text: I18N.carbonFootprint3.importAllLost,
          styleNode: {
            background: 'rgba(253, 246, 246)',
            color: '#ED5555',
          },
        },
      ];
      return (
        <div
          style={{
            ...styleOb,
            ...ValNode[val].styleNode,
          }}
        >
          {ValNode[val].text}
        </div>
      );
    },
  },
  {
    title: I18N.carbonFootprint.operator,
    width: 100,
    dataIndex: 'updateByName',
  },
  {
    title: I18N.carbonFootprint.importTime,
    width: 200,
    dataIndex: 'createTime',
  },
];
