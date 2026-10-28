/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-24 16:58:37
 * @Date: 2023-02-21 11:27:56
 * @@description: 表头文件
 */
import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import { Popover, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';

import {
  ProcessAccountStatus,
  ProcessBusinessAccountingTableData,
} from './type';
import TableFilterStatus from '../component/TableFilterStatus';
import TextOverflowTable from '../component/TextOverflowTable';
import { PROCESS_ACCOUNT_STATUS_TEXT } from '../util/constant';

// 核算状态的筛选值
const columnsFilters = Object.keys(PROCESS_ACCOUNT_STATUS_TEXT).map(status => ({
  label: PROCESS_ACCOUNT_STATUS_TEXT[status],
  value: status,
}));

/**
 * 快速核算 - 表格的表头
 */
export const carbonFootprintProcessBusinessAccountingTableCol = (
  onConfirmClick: (selectNum: number[]) => void,
  showSelectPropver: boolean,
  setShowSelectPropver,
): ColumnsType<ProcessBusinessAccountingTableData> => [
  {
    title: I18N.carbonFootprint.number,
    width: 70,
    fixed: 'left',
    dataIndex: 'index',
  },
  {
    title: I18N.carbonFootprint3.functionalUnits,
    width: 200,
    fixed: 'left',
    dataIndex: 'accountName',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable value={val} maxLength={10} />;
      }
      return '-';
    },
  },
  {
    title: I18N.carbonFootprint.productName,
    width: 200,
    dataIndex: 'productName',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable value={val} maxLength={20} />;
      }
      return '-';
    },
  },
  {
    title: I18N.carbonFootprint.accountingQuantity,
    width: 150,
    dataIndex: 'amount',
    render: (val, item) => `${val}${item.unitName}`,
  },

  {
    title: I18N.carbonFootprint3.totalEmissionsK,
    width: 200,
    dataIndex: 'emissionTotal',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable value={val} maxLength={15} />;
      }
      return '-';
    },
  },
  {
    title: (
      <div>
        {I18N.carbonFootprint.unitProductScheduling}
        <Tooltip overlay={I18N.carbonFootprint3.kgCOe2}>
          <IconFont
            style={{ cursor: 'pointer' }}
            className='m-l-10'
            type='icon-icon-bangchuzhongxin'
            aria-label='bangchuzhongxin'
          />
        </Tooltip>
      </div>
    ),
    width: 200,
    dataIndex: 'factor',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable value={val} maxLength={15} />;
      }
      return '-';
    },
  },
  {
    title: (
      <div className='processAccountTablePopoverMain'>
        {I18N.carbonFootprint3.accountingStatus}
        <Popover
          placement='bottom'
          overlayClassName='processAccountTablePopover'
          visible={showSelectPropver}
          content={
            <TableFilterStatus
              listArr={columnsFilters}
              onConfirmClick={selectNum => {
                onConfirmClick(selectNum);
              }}
            />
          }
          onVisibleChange={newOpen => {
            setShowSelectPropver(newOpen);
          }}
          trigger='click'
        >
          <IconFont
            className='processAccountTablePopoverIcon'
            onClick={() => setShowSelectPropver(true)}
            style={showSelectPropver ? { color: '#0cbf9f' } : {}}
            type='icon-icon_filter'
            aria-label='xiaoxizhongxin'
          />
        </Popover>
      </div>
    ),
    width: 150,
    dataIndex: 'accountStatus',
    render: (val: ProcessAccountStatus) => {
      const styleArr = [
        {
          background: '#F0F9FF',
          color: '#3491FA',
        },
        {
          background: '#FFFAED',
          color: '#FBA93E',
        },
        {
          background: '#E6FFF6',
          color: '#0CBF9F',
        },
      ];
      return (
        <div
          style={{
            ...styleArr[val],
            height: 24,
            padding: '3px 8px',
            display: 'inline',
            borderRadius: 100,
          }}
        >
          {PROCESS_ACCOUNT_STATUS_TEXT[val]}
        </div>
      );
    },
  },
  {
    title: I18N.carbonFootprint.accountingCycle,
    width: 250,
    dataIndex: 'scope',
    render: (val: 0 | 1, item) =>
      I18N.template(I18N.carbonFootprint3.items, {
        val1: item.startTime,
        val2: item.endTime,
      }),
  },
  {
    title: I18N.carbonFootprint.productCode,
    width: 250,
    dataIndex: 'productCode',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable maxWidth={250} value={val} maxLength={15} />;
      }
      return '-';
    },
  },
  {
    title: I18N.carbonFootprint.updatedBy,
    width: 100,
    dataIndex: 'updateByName',
  },

  {
    title: I18N.carbonFootprint.updateTime,
    width: 200,
    dataIndex: 'updateTime',
  },
];
