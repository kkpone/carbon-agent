/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 17:43:47
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 16:29:33
 * @Date: 2022-12-27 10:34:47
 * @@description: 快速核算 - 列表
 */

import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formItemInitInput } from '@src/components/FormUtil/util';
import {
  initFormilyInput,
  initFormilyInputTextArea,
  initFormilyRadio,
} from '@src/components/FormilyUtil/util';
import IconFont from '@src/components/iconfont';
import { Popover, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';

import { ACCOUNT_STATUS, ACCOUNT_STATUS_LABEL } from './constant';
import styles from './index.module.less';
import { QuickBusinessAccountingTableData } from './type';
import TableFilterStatus from '../component/TableFilterStatus';
import TextOverflowTable from '../component/TextOverflowTable';
import ShareStatusTag from '../component/ShareStatusTag';
import { PROCESS_ACCOUNT_STATUS_TEXT } from '../util/constant';

// 核算状态的筛选值
const columnsFilters = Object.keys(PROCESS_ACCOUNT_STATUS_TEXT).map(status => ({
  label: PROCESS_ACCOUNT_STATUS_TEXT[status],
  value: status,
}));

/**
 * 碳足迹核算3.0 - 快速核算
 */
export const carbonFootprintQuickBusinessAccountingSearchForm =
  (): FromItemProps<any>[] => {
    const data: FromItemProps<any>[] = [
      {
        ...formItemInitInput('', 'productName', false),
        props: {
          placeholder: I18N.carbonFootprint.productName,
        },
      },
      {
        ...formItemInitInput('', 'productCode', false),
        props: {
          placeholder: I18N.carbonFootprint.productCode,
        },
      },
    ];
    return data.map(item => {
      const back = item;
      back.props = {
        style: { width: '200px' },
        ...back.props,
      };
      return back;
    });
  };

/**
 * 快速核算 - 表格的表头
 */
export const carbonFootprintQuickBusinessAccountingTableCol = (
  onConfirmClick: (selectNum: number[]) => void,
  showSelectPropver: boolean,
  setShowSelectPropver,
): ColumnsType<QuickBusinessAccountingTableData> => [
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
    render: (val: string, item) => (
      <div>
        <div>
          {val ? <TextOverflowTable value={val} maxLength={15} /> : '-'}
        </div>
        <ShareStatusTag
          shareFlag={item.shareFlag}
          sourceCompanyName={item.sourceCompanyName}
        />
      </div>
    ),
  },
  {
    title: I18N.carbonFootprint.productName,
    width: 200,
    dataIndex: 'productName',
    render: (val: string) => {
      if (val) {
        return <TextOverflowTable value={val} maxLength={15} />;
      }
      return '-';
    },
  },
  {
    title: I18N.carbonFootprint.accountingQuantity,
    width: 200,
    dataIndex: 'amount',
    render: (val, item: QuickBusinessAccountingTableData) =>
      `${val}${item.unitName}`,
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
      <div className='quickAccountTablePopoverMain'>
        {I18N.carbonFootprint3.accountingStatus}
        <Popover
          placement='bottom'
          overlayClassName='quickAccountTablePopover'
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
            className='quickAccountTablePopoverIcon'
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
    render: (_, { accountStatus }) => (
      <div
        className={classNames(styles.accountStatus, {
          [styles.createStatus]: accountStatus === ACCOUNT_STATUS.CREATED,
          [styles.modelingStatus]: accountStatus === ACCOUNT_STATUS.MODELING,
          [styles.finishStatus]: accountStatus === ACCOUNT_STATUS.FINISHED,
        })}
      >
        {ACCOUNT_STATUS_LABEL[accountStatus]}
      </div>
    ),
  },
  {
    title: I18N.carbonFootprint.accountingCycle,
    width: 250,
    dataIndex: 'scope',
    render: (val: 0 | 1, item) =>
      I18N.template(I18N.carbonFootprint3.items2, {
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

/** 保存为模型弹框 */
export const BusinessAccountinInModelSchema = () => {
  const data = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 1,
        },

        properties: {
          modelName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint.modelName, true),
          },
          accountName: {
            type: 'string',
            ...initFormilyInput(I18N.carbonFootprint3.functionalUnits, true),
          },
        },
      },
    },
  };
  return data;
};

export const BusinessAccountinInModelRadioSchema = () => {
  const data = {
    type: 'object',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'FormGrid',
        'x-component-props': {
          maxColumns: 1,
        },
        properties: {
          scope: {
            type: 'number',
            enum: [
              {
                label: (
                  <>
                    <span>{I18N.carbonFootprint3.halfLifeCycle}</span>
                    <span style={{ color: '#999EA4' }}>
                      {I18N.carbonFootprint3.fromResourceExtraction2}
                    </span>
                  </>
                ),
                value: 0,
              },
              {
                label: (
                  <>
                    <span>{I18N.carbonFootprint3.halfLifeCycle}</span>
                    <span
                      style={{
                        color: '#999EA4',
                        display: 'inline-block',
                        marginTop: 16,
                      }}
                    >
                      {I18N.carbonFootprint3.fromResourceExtraction}
                    </span>
                  </>
                ),
                value: 1,
              },
            ],
            default: 0,
            ...initFormilyRadio(I18N.carbonFootprint.systemBoundary, true, {
              style: {
                display: 'grid',
              },
            }),
          },
          description: {
            type: 'string',
            ...initFormilyInputTextArea(
              I18N.carbonFootprint.modelDescription2,
              false,
              {
                rows: 4,
              },
            ),
          },
        },
      },
    },
  };
  return data;
};
