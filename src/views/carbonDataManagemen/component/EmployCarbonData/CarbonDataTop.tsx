/** **
 * @file 分组减排量排行榜
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { cersRankUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { Row, Radio, Table } from 'antd';
import moment from 'moment';
import { useState, useEffect } from 'react';

export default function ComSeniorityRank({
  changeSaveSearchData,
  saveSearchData,
  layout,
  timeRange,
}) {
  const [ecuteMenData, getEcuteMenData] = useState<
    { name: string; value: string }[]
  >([]);
  const [culTableHeight, getCuleableHeight] = useState<number | string>('auto');
  const ApiSeniorityRankFn = async () => {
    const beginTime =
      (timeRange && moment(timeRange[0]).format('YYYY-MM-DD')) || '';
    const endTime =
      (timeRange && moment(timeRange[1]).format('YYYY-MM-DD')) || '';
    const type = saveSearchData['8-2'];
    if (beginTime && endTime && type) {
      await cersRankUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
        type,
      }).then(({ data }) => {
        // @ts-ignore
        getEcuteMenData(data.data);
      });
    }
  };
  // const syncCallbackFn = useSyncCallback(ApiSeniorityRankFn);
  const culHeight = () => {
    const rankHeightOrigin =
      // @ts-ignore
      // eslint-disable-next-line no-unsafe-optional-chaining
      +document.querySelector('#ComEffect')?.offsetHeight;
    if (rankHeightOrigin) {
      // @ts-ignore
      const rankHeight = rankHeightOrigin.toFixed(0);

      // @ts-ignore
      let h6Height =
        document.querySelector('#ComEffect .title')?.clientHeight || 0;
      if (h6Height) {
        // eslint-disable-next-line no-unsafe-optional-chaining
        h6Height = +h6Height?.toFixed(0);
      }
      const antHeight = Number(
        document.querySelector('#ComEffect .ant-row')?.clientHeight,
      )?.toFixed(0);
      const tableHead = Number(
        document.querySelector('#ComEffect .ant-table-header')?.clientHeight,
      )?.toFixed(0);
      if (rankHeight && h6Height && antHeight && antHeight) {
        const culH =
          Number(rankHeight) -
          Number(h6Height) -
          Number(antHeight) -
          Number(tableHead);
        if (culH) {
          getCuleableHeight(culH - 90);
        }
      }
    }
  };
  useEffect(() => {
    culHeight();
  }, [ecuteMenData, layout]);
  useEffect(() => {
    ApiSeniorityRankFn();
  }, [timeRange, saveSearchData['8-2']]);
  return (
    <>
      <p className='title'>
        {I18N.carbonDataManagemen.scenarioEmissionReduction}
      </p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <Radio.Group
          value={saveSearchData['8-2']}
          onChange={e => {
            // getEcuteMenData(e.target.value);
            changeSaveSearchData({ ...saveSearchData, '8-2': e.target.value });
          }}
        >
          <Radio.Button value='1'>
            {I18N.enterpriseCarbonAccount2.totalEmissionReduction}
          </Radio.Button>
          <Radio.Button value='2'>
            {I18N.carbonDataManagemen.perCapitaEmissionReduction2}
          </Radio.Button>
        </Radio.Group>
      </Row>
      {ecuteMenData.length > 0 ? (
        <Table
          pagination={false}
          dataSource={[...ecuteMenData]}
          scroll={{ y: culTableHeight }}
          columns={[
            {
              title: I18N.carbonDataManagemen.ranking,
              dataIndex: 'id',
              key: 'id',
              width: '90px',
              render: (text, record, index: number) => <span>{index + 1}</span>,
            },
            {
              title: I18N.carbonAccount.sceneName,
              dataIndex: 'tplName',
              key: 'tplName',
            },
            Number(saveSearchData['8-2']) === 1
              ? {
                  title: I18N.carbonFootprint.totalEmissionsK,
                  dataIndex: 'cers',
                  key: 'cers',
                  width: '200px',
                }
              : {
                  title: I18N.carbonDataManagemen.perCapitaEmissions,
                  dataIndex: 'avgCers',
                  key: 'avgCers',
                  width: '200px',
                },
          ]}
        />
      ) : (
        <Nodata />
      )}
    </>
  );
}
