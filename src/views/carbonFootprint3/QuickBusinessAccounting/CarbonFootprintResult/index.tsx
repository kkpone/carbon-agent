/*
 * @@description:碳足迹结果页 - 过程核算、快速核算
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-01 11:07:31
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-27 15:44:05
 */
import { RedoOutlined } from '@ant-design/icons';
import emptyImg from '@src/assets/svg/empty.svg';
import { checkPermissions } from '@src/components/Permission/utils';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Button, Radio, Table, Tooltip } from 'antd';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { VFC, useEffect, useState, useMemo } from 'react';

import BarChart from './BarChart';
import PieChart from './PieChart';
import { tableColumns } from './columns';
import styles from './index.module.less';
import {
  getAccountExportResult,
  getAccountResult,
  getAccountTableInfo,
} from './service';
import { AccountChartData, ChartData, Emission } from './type';
import { QuickBusinessAccountingInfo } from '../type';

type CarbonFootprintResultProps = {
  accountId: number;
  accountInfo: QuickBusinessAccountingInfo | undefined;
  /** 跟新基础信息 */
  getModelInfo?: () => Promise<void>;
};

const MAX_LABEL_LENGTH = 5;

const MAX_NAME_LENGTH = 16;

const CarbonFootprintResult: VFC<CarbonFootprintResultProps> = ({
  accountId,
  accountInfo,
  getModelInfo,
}) => {
  const [pieChartType, setPieChartType] = useState<'stage' | 'type'>('stage');

  const [barChartType, setBarChartType] = useState<
    'stage' | 'type' | 'emission'
  >('stage');

  const [chartData, setChartData] = useState<AccountChartData>({
    byStages: [],
    byEmissions: [],
    byTypes: [],
    emissionTotal: '',
  });

  const [accountTableList, setAccountTableList] = useState<Emission[]>([]);

  const [tableLoading, setTableLoading] = useState(false);

  const [, setExportButtonLoading] = useState(false);

  const [countButtonLoading, setCountButtonLoading] = useState(false);

  const [pieData, setPieData] = useState<
    { label: string; value: number; [K: string]: any }[]
  >([]);

  const [barData, setBarData] = useState<
    { label: string; value: number; [K: string]: any }[]
  >([]);

  const getTableData = async (id: number) => {
    try {
      setTableLoading(true);
      const resp = await getAccountTableInfo({ accountId: id });
      let stageName = '';
      let stageCount = 0;
      setAccountTableList(
        resp?.data?.data?.accountList?.map(emission => {
          if (stageName !== emission.stage) {
            stageName = emission.stage;
            stageCount = 1;
          } else {
            stageCount += 1;
          }
          return {
            ...emission,
            stageIndex: stageCount,
          };
        }) || [],
      );
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
    const chartDataList = (
      pieChartType === 'stage' ? chartData.byStages : chartData?.byTypes
    )?.sort((prevData, data) => prevData.code - data.code);

    setPieData(
      chartDataList?.map(({ rate, name, total }) => ({
        value: rate,
        label:
          name.length > MAX_LABEL_LENGTH
            ? `${name.slice(0, MAX_LABEL_LENGTH)}...`
            : name,
        total,
        name,
      })) || [],
    );
  }, [pieChartType, chartData]);

  useEffect(() => {
    let chartDataList: ChartData[] = [];
    switch (barChartType) {
      case 'stage':
        chartDataList = chartData.byStages;
        break;
      case 'type':
        chartDataList = chartData.byTypes;
        break;
      default:
        chartDataList = chartData.byEmissions;
    }
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

  const stageCountMap: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    accountTableList?.forEach(({ stage }) => {
      map[stage] = map[stage] ? map[stage] + 1 : 1;
    });
    return map;
  }, [accountTableList]);

  const exportResult = async () => {
    try {
      setExportButtonLoading(true);
      const res = await getAccountExportResult({ accountId });
      saveAs(
        res.data.data,
        I18N.template(I18N.carbonFootprint3.accou4, {
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
            <Tooltip
              overlay={
                accountInfo && accountInfo.productName?.length > MAX_NAME_LENGTH
                  ? accountInfo?.productName
                  : false
              }
            >
              <div className={styles.productName}>
                {accountInfo &&
                accountInfo.productName?.length > MAX_NAME_LENGTH
                  ? `${accountInfo.productName.slice(0, 16)}...`
                  : accountInfo?.productName}
              </div>
            </Tooltip>
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
        <div className={styles.chartBlock}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              {I18N.carbonFootprint3.emissionComposition}
            </div>
            <Radio.Group
              value={pieChartType}
              optionType='button'
              options={[
                { label: I18N.carbonFootprint3.byStage, value: 'stage' },
                { label: I18N.carbonFootprint3.byType, value: 'type' },
              ]}
              onChange={e => setPieChartType(e.target.value)}
            />
          </div>
          {pieData.length > 0 ? (
            <PieChart data={pieData} emissionTotal={chartData.emissionTotal} />
          ) : (
            <div className={styles.empty}>
              <img src={emptyImg} alt='' />
              <span className={styles.emptyText}>
                {I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable}
              </span>
            </div>
          )}
        </div>
        <div className={styles.chartBlock}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              {I18N.carbonFootprint3.emissionRanking}
            </div>
            <Radio.Group
              value={barChartType}
              optionType='button'
              options={[
                { label: I18N.carbonFootprint3.byStage, value: 'stage' },
                { label: I18N.carbonFootprint3.byType, value: 'type' },
                {
                  label: I18N.carbonFootprint3.byEmissionSource,
                  value: 'emission',
                },
              ]}
              onChange={e => setBarChartType(e.target.value)}
            />
          </div>

          {barData.length > 0 ? (
            <BarChart data={barData} />
          ) : (
            <div className={styles.empty}>
              <img src={emptyImg} alt='' />
              <span className={styles.emptyText}>
                {I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.titleContainerMain}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>
            {I18N.carbonFootprint3.emissionInventory}
          </div>

          {checkPermissions(
            <span
              onClick={exportResult}
              className={classNames(styles.outFile, 'm-l-16')}
            >
              <IconAlibaba
                type='icon-icon_daochu'
                style={{
                  fontSize: 16,
                  marginRight: 4,
                }}
              />
              {I18N.carbonFootprint3.export}
            </span>,
            'footprint3:account:finish:fast',
          )}
        </div>
        <Table
          rowKey='id'
          bordered
          // scroll={{ x: 1200 }}
          columns={tableColumns(stageCountMap)}
          dataSource={accountTableList}
          pagination={false}
          loading={tableLoading}
        />
      </div>
    </div>
  );
};

export default CarbonFootprintResult;
