/*
 * @@description:碳足迹结果页 - 过程核算、快速核算
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-01 11:07:31
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-27 15:42:09
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-04 09:50:36
 */

import defaultImg from '@src/assets/svg/accountProductImg.svg';
import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import I18N from '@src/lang/I18N';
import TextOverflowTable from '@src/views/carbonFootprint3/component/TextOverflowTable';
import { ACCOUNT_RESULT_LIFE_CYCLE_ICON_MAP } from '@src/views/carbonFootprint3/constant';
import { haveAccountEditPermissions } from '@src/views/carbonFootprint3/permissions';
import { Button, Radio, Table, Tooltip } from 'antd';
import classNames from 'classnames';
import EChartsReact from 'echarts-for-react';
import { saveAs } from 'file-saver';
import { FC, useEffect, useState, useMemo, memo } from 'react';

import exportIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/export.svg';

import Empty from './Empty';
import { productColumns, inOutColumns } from './columns';
import styles from './index.module.less';
import {
  getAccountExportResult,
  getAccountResult,
  getAccountTableInfo,
} from './service';
import { AccountChartData, Emission } from './type';
import { AccountingInfoData } from '../../../AccountDetail/AccountInfo/type';
import { getPaletteColor } from '../chartColor';
import type { AccountEmissionTaskTarget } from '../type';

type CarbonFootprintResultProps = {
  accountInfo: AccountingInfoData;
  isDetail?: boolean;
  apiExtraParams?: ApiExtraParams;
  onEmissionTaskCreate?: (target: AccountEmissionTaskTarget) => void;
};

const MAX_LABEL_LENGTH = 5;
const MAX_AXIS_LABEL_LENGTH = 10;
const BAR_AXIS_LABEL_WIDTH = 64;
const BAR_GRID_RIGHT = 72;

const formatAxisLabel = (value: string | number) => {
  const numberValue = Number(value);
  const text =
    Number.isFinite(numberValue) && String(value).trim() !== ''
      ? Number(numberValue.toFixed(6)).toString()
      : String(value);
  return text.length > MAX_AXIS_LABEL_LENGTH
    ? `${text.slice(0, MAX_AXIS_LABEL_LENGTH)}...`
    : text;
};

const BAR_CHART_COLORS = [
  '#57D9B8',
  '#0CBF9F',
  '#08A28B',
  '#048677',
  '#026961',
  '#005854',
  '#004541',
  '#004245',
  '#002A23',
];

export const ProcessAccountResult: FC<CarbonFootprintResultProps> = memo(
  ({ accountInfo, isDetail, apiExtraParams, onEmissionTaskCreate }) => {
    const { id: accountId, productPic } = accountInfo;
    const [barChartType] = useState<'in' | 'out'>('in');

    const [tableType, setTableType] = useState<'products' | 'inOuts'>(
      'products',
    );

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

    const [barData, setBarData] = useState<
      { label: string; value: number; [K: string]: any }[]
    >([]);

    const getTableData = async (id: number) => {
      try {
        setTableLoading(true);
        const resp = await getAccountTableInfo({
          ...apiExtraParams,
          accountId: id,
        });
        setTableData(resp.data.data);
      } finally {
        setTableLoading(false);
      }
    };

    const getChartData = async (id: number) => {
      const resp = await getAccountResult({ ...apiExtraParams, id });
      setChartData(resp?.data?.data);
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
        const res = await getAccountExportResult({
          ...apiExtraParams,
          accountId,
        });
        saveAs(res.data.data.url, res.data.data.name);
      } finally {
        setExportButtonLoading(false);
      }
    };

    const barColors = useMemo(
      () =>
        Array.from({ length: barData.length }, (_, index) =>
          getPaletteColor(
            BAR_CHART_COLORS,
            barData.length - 1 - index,
            barData.length,
          ),
        ),
      [barData.length],
    );

    return (
      <div className={styles.carbonFootprintResultContainer}>
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
                        src={productPic || defaultImg}
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
                          src={ACCOUNT_RESULT_LIFE_CYCLE_ICON_MAP[code]}
                          alt=''
                        />
                      </div>
                      <div className={styles.stageItemRight}>
                        <div>{stage.name}</div>
                        <div className={styles.values}>
                          <Tooltip
                            overlay={
                              // stage.total?.length > MAX_STAGE_VALUE_LENGTH &&
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty />
            )}
          </div>
          <div className={styles.chartBlockRight}>
            {barData.length > 0 ? (
              <EChartsReact
                className={styles.chart}
                style={{ height: '100%', width: '100%' }}
                option={{
                  tooltip: {},
                  grid: {
                    left: 16,
                    right: BAR_GRID_RIGHT,
                    top: 16,
                    bottom: 34,
                    containLabel: true,
                  },
                  xAxis: {
                    type: 'value',
                    axisLabel: {
                      color: '#999EA4',
                      fontSize: 12,
                      hideOverlap: true,
                      margin: 12,
                      overflow: 'truncate',
                      ellipsis: '...',
                      width: BAR_AXIS_LABEL_WIDTH,
                      formatter: formatAxisLabel,
                    },
                    splitLine: {
                      lineStyle: {
                        color: '#E7EAEE',
                      },
                    },
                  },
                  yAxis: {
                    type: 'category',
                    axisLine: {
                      show: false,
                    },
                    axisTick: {
                      show: false,
                    },
                    axisLabel: {
                      color: '#999EA4',
                      fontSize: 12,
                      margin: 8,
                      overflow: 'truncate',
                      width: 66,
                    },
                    data: (barData || []).map(item => item.label),
                  },
                  series: [
                    {
                      type: 'bar',
                      barMaxWidth: 12,
                      data: (barData || []).map((item, index) => ({
                        value: item.value,
                        itemStyle: {
                          color: barColors[index],
                          borderRadius:
                            Number(item.value) < 0
                              ? [4, 0, 0, 4]
                              : [0, 4, 4, 0],
                        },
                      })),
                    },
                  ],
                }}
              />
            ) : (
              <Empty />
            )}
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
                    label: I18N.carbonFootprint3.inputEmissionCleaning,
                    value: 'inOuts',
                  },
                ]}
                onChange={e => setTableType(e.target.value)}
              />
            </div>
            {haveAccountEditPermissions() && !isDetail && (
              <Button
                type='default'
                onClick={exportResult}
                className={classNames(styles.importAndOutMain, 'm-l-16')}
                icon={
                  <img className={styles.exportIcon} src={exportIcon} alt='' />
                }
              >
                {I18N.carbonFootprint3.exportEmissionSources}
              </Button>
            )}
          </div>
          <Table
            rowKey='id'
            bordered
            // scroll={{ x: 1200 }}
            columns={
              tableType === 'products'
                ? productColumns(stageCountMap, onEmissionTaskCreate)
                : inOutColumns(processCountMap, onEmissionTaskCreate)
            }
            dataSource={accountTableList}
            pagination={false}
            loading={tableLoading}
          />
        </div>
      </div>
    );
  },
);
