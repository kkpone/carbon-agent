/*
 * @@description:碳足迹结果页 - 过程核算、快速核算
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-01 11:07:31
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-27 15:42:09
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-04 09:50:36
 */
import { RedoOutlined } from '@ant-design/icons';
import { checkPermissions } from '@src/components/Permission/utils';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Button, Radio, Table, Tooltip } from 'antd';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { VFC, useEffect, useState, useMemo } from 'react';

import BarChart from './BarChart';
import Empty from './Empty';
import { productColumns, inOutColumns } from './columns';
import styles from './index.module.less';
import {
  getAccountExportResult,
  getAccountResult,
  getAccountTableInfo,
} from './service';
import { AccountChartData, Emission } from './type';
import { QuickBusinessAccountingInfo } from '../../QuickBusinessAccounting/type';
import TextOverflowTable from '../../component/TextOverflowTable';
import { ICON_IMG_MAP } from '../constant';

type CarbonFootprintResultProps = {
  accountId: number;
  accountInfo: QuickBusinessAccountingInfo | undefined;
  /** 更新基础信息 */
  getModelInfo?: () => Promise<void>;
};

const MAX_LABEL_LENGTH = 5;

const MAX_STAGE_VALUE_LENGTH = 10;

const CarbonFootprintResult: VFC<CarbonFootprintResultProps> = ({
  accountId,
  accountInfo,
  getModelInfo,
}) => {
  const [barChartType, setBarChartType] = useState<'in' | 'out'>('in');

  const [tableType, setTableType] = useState<'products' | 'inOuts'>('products');

  const [chartData, setChartData] = useState<AccountChartData>({
    byStages: [],
    byAccountIns: [],
    byAccountOuts: [],
    emissionTotal: '',
  });

  const [tableData, setTableData] = useState<{
    accountProcessInOutList: Emission[];
    accountProcessProductList: Emission[];
  }>({ accountProcessInOutList: [], accountProcessProductList: [] });

  const [accountTableList, setAccountTableList] = useState<Emission[]>([]);

  const [tableLoading, setTableLoading] = useState(false);

  const [, setExportButtonLoading] = useState(false);

  const [countButtonLoading, setCountButtonLoading] = useState(false);

  const [barData, setBarData] = useState<
    { label: string; value: number; [K: string]: any }[]
  >([]);

  const getTableData = async (id: number) => {
    try {
      setTableLoading(true);
      const resp = await getAccountTableInfo({ accountId: id });
      setTableData(resp.data.data);
    } finally {
      setTableLoading(false);
    }
  };

  const getChartData = async (id: number) => {
    const resp = await getAccountResult({ id });
    setChartData(resp?.data?.data);
  };

  const reCount = async () => {
    try {
      setCountButtonLoading(true);
      await Promise.all([
        getModelInfo?.(),
        getChartData(accountId),
        getTableData(accountId),
      ]);
      Toast('success', I18N.carbonFootprint3.accountingSuccessful);
    } finally {
      setCountButtonLoading(false);
    }
  };

  useEffect(() => {
    getChartData(accountId);
    getTableData(accountId);
  }, [accountId]);

  useEffect(() => {
    let stageName = '';
    let stageCount = 0;
    let processId = -1;
    let processCount = 0;
    const list =
      (tableType === 'products'
        ? tableData.accountProcessProductList
        : tableData.accountProcessInOutList) || [];

    setAccountTableList(
      list.map(emission => {
        if (stageName !== emission.stage) {
          stageName = emission.stage;
          stageCount = 1;
        } else {
          stageCount += 1;
        }
        if (processId !== emission.processId) {
          processId = emission.processId;
          processCount = 1;
        } else {
          processCount += 1;
        }
        return {
          ...emission,
          stageIndex: stageCount,
          processIndex: processCount,
        };
      }) || [],
    );
  }, [tableData, tableType]);

  useEffect(() => {
    const chartDataList =
      (barChartType === 'in'
        ? chartData.byAccountIns
        : chartData.byAccountOuts) || [];

    setBarData(
      chartDataList
        ?.sort((prev, curr) => Number(curr.total) - Number(prev.total))
        ?.map(({ rate, name, total, code }, index) => ({
          value: Number(total),
          label:
            name.length > MAX_LABEL_LENGTH
              ? `${name.slice(0, MAX_LABEL_LENGTH)}...`
              : name,
          rate,
          name,
          code,
          index,
        })) || [],
    );
  }, [barChartType, chartData]);

  const [stageCountMap, processCountMap]: Array<Record<string, number>> =
    useMemo(() => {
      const stageMap: Record<string, number> = {};
      const processMap: Record<string | number, number> = {};
      accountTableList?.forEach(({ stage, processId }) => {
        stageMap[stage] = stageMap[stage] ? stageMap[stage] + 1 : 1;
        processMap[processId] = processMap[processId]
          ? processMap[processId] + 1
          : 1;
      });
      return [stageMap, processMap];
    }, [accountTableList]);

  const exportResult = async () => {
    try {
      setExportButtonLoading(true);
      const res = await getAccountExportResult({ accountId });
      saveAs(
        res.data.data,
        I18N.template(I18N.carbonFootprint3.accou3, {
          val1: accountInfo?.productName,
          val2: moment().format('YYYY.MM.DD'),
          val3: res.data.data.split('.').pop(),
        }),
      );
    } finally {
      setExportButtonLoading(false);
    }
  };

  return (
    <div className={styles.carbonFootprintResultContainer}>
      <div className={styles.accountInfoContainer}>
        <div>
          <div className={styles.product}>
            <div className={styles.productName}>
              <TextOverflowTable
                value={accountInfo?.productName || '-'}
                maxLength={30}
                maxWidth={500}
              />
            </div>
            <div className={styles.accountTime}>
              {I18N.carbonFootprint.accountingCycle2}
              {accountInfo?.startTime}
              {I18N.carbonFootprint.to}
              {accountInfo?.endTime}
            </div>
          </div>
          <div className={styles.accountDetails}>
            {I18N.carbonFootprint3.functionalUnits2}
            {accountInfo?.accountName && accountInfo.accountName.length > 30 ? (
              <Tooltip title={accountInfo?.accountName}>
                <span className={styles.accountName}>
                  {accountInfo?.accountName}
                </span>
              </Tooltip>
            ) : (
              <span>{accountInfo?.accountName}</span>
            )}
            <div className={styles.split} />
            {I18N.carbonFootprint3.accountingQuantity}
            {accountInfo?.amount}
            <div className={styles.split} />
            {I18N.carbonFootprint3.accountingPersonnel}
            {accountInfo?.updateByName}
            <div className={styles.split} />
            {I18N.carbonFootprint3.recentAccountingDays}
            {accountInfo?.updateTime}
          </div>
        </div>
        {checkPermissions(
          <Button
            type='text'
            className={styles.restResultBtn}
            icon={<RedoOutlined />}
            loading={countButtonLoading}
            onClick={reCount}
          >
            {I18N.carbonFootprint3.refreshResults}
          </Button>,
          'footprint3:account:finish:fast',
        )}
      </div>
      <div className={styles.chartContainer}>
        <div className={styles.chartBlockLeft}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              {I18N.carbonFootprint3.emissionComposition}
            </div>
          </div>
          {chartData?.byStages?.length > 0 ? (
            <div className={styles.stageBlock}>
              {chartData.byStages.map(stage => {
                const { code } = stage;
                return code === 0 ? (
                  <div className={styles.totalStageItem} key={code}>
                    <img
                      className={styles.totalStageItemImage}
                      src={ICON_IMG_MAP[code]}
                      alt=''
                    />
                    <div className={styles.totalStageItemInfo}>
                      <div>
                        <TextOverflowTable
                          value={stage.name || '-'}
                          maxLength={10}
                          maxWidth={200}
                        />
                      </div>
                      <div style={{ display: 'flex' }}>
                        <TextOverflowTable
                          value={stage.total || '-'}
                          maxLength={10}
                          maxWidth={130}
                        />
                        <span className='m-l-8'>kgCO₂e</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.stageItem} key={code}>
                    <div className={styles.stageItemLeft}>
                      <img
                        className={styles.stageItemImage}
                        src={ICON_IMG_MAP[code]}
                        alt=''
                      />
                      <div>{stage.name}</div>
                    </div>
                    <div className={styles.stageItemRight}>
                      <Tooltip
                        overlay={
                          stage.total?.length > MAX_STAGE_VALUE_LENGTH &&
                          stage.total
                        }
                      >
                        <div className={styles.stageValueText}>
                          {stage.total}
                        </div>
                      </Tooltip>

                      <div className={styles.stageUnitText}>kgCO₂e</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty />
          )}
        </div>
        <div className={styles.chartBlockRight}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              {I18N.carbonFootprint3.emissionRanking}
            </div>
            <Radio.Group
              value={barChartType}
              optionType='button'
              options={[
                { label: I18N.carbonFootprint3.byInputType, value: 'in' },
                { label: I18N.carbonFootprint3.byOutputType, value: 'out' },
              ]}
              onChange={e => setBarChartType(e.target.value)}
            />
          </div>

          {barData.length > 0 ? <BarChart data={barData} /> : <Empty />}
        </div>
      </div>
      <div className={styles.tableControlMain}>
        <div className={styles.titleContainer}>
          <div className={styles.tableControl}>
            <div className={styles.title}>
              {I18N.carbonFootprint3.emissionInventory}
            </div>
            <Radio.Group
              className='m-l-24'
              value={tableType}
              optionType='button'
              options={[
                {
                  label: I18N.carbonFootprint3.outputEmissions,
                  value: 'products',
                },
                {
                  label: I18N.carbonFootprint3.inputOutputRow,
                  value: 'inOuts',
                },
              ]}
              onChange={e => setTableType(e.target.value)}
            />
          </div>
          {checkPermissions(
            <span
              onClick={exportResult}
              className={classNames(styles.importAndOutMain, 'm-l-16')}
            >
              <IconFont
                type='icon-icon-xiazai-1'
                style={{
                  fontSize: 16,
                  marginRight: 4,
                  transform: 'rotate(180deg)',
                  cursor: 'pointer',
                }}
              />
              {I18N.carbonFootprint3.exportEmissionSources}
            </span>,
            'footprint3:account:finish:fast',
          )}
        </div>
        <Table
          rowKey='id'
          bordered
          // scroll={{ x: 1200 }}
          columns={
            tableType === 'products'
              ? productColumns(stageCountMap)
              : inOutColumns(processCountMap)
          }
          dataSource={accountTableList}
          pagination={false}
          loading={tableLoading}
        />
      </div>
    </div>
  );
};

export default CarbonFootprintResult;
