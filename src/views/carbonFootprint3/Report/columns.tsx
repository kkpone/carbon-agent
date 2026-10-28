/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-14 14:37:41
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-03 17:11:09
 */
import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/es/table';

import styles from './index.module.less';
import { TableRow } from './types';
import TextWidthOverflow from '../component/TextOverflowTable/byWidth';
import { REPORT_TYPE, REPORT_TYPE_LABEL } from '../constant';

const { REPORT } = REPORT_TYPE;

export const columns = (): ColumnsType<TableRow> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: 'index',
    fixed: 'left',
    width: 90,
    render: (_, processLib, index) => index + 1,
  },
  {
    title: I18N.carbonFootprint.reportName,
    width: 200,
    fixed: 'left',
    dataIndex: 'reportName',
    render: (val: string) => <TextWidthOverflow value={val} width={180} />,
  },
  {
    title: I18N.carbonFootprint.reportType,
    width: 220,
    dataIndex: 'type',
    render: (val: number) => {
      if (val === REPORT) {
        return <div className={styles.report}>{REPORT_TYPE_LABEL[val]()}</div>;
      }

      return <div className={styles.template}>{REPORT_TYPE_LABEL[val]()}</div>;
    },
  },
  {
    title: I18N.carbonFootprint3.productQuantity,
    width: 100,
    dataIndex: 'productCount',
  },
  {
    dataIndex: 'updateByName',
    title: I18N.carbonFootprint.updatedBy,
    width: 100,
  },
  {
    dataIndex: 'updateTime',
    width: 200,
    title: I18N.carbonFootprint.updateTime,
  },
];
