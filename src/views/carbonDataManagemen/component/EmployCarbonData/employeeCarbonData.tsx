/** **
 * @file 分组减排量排行榜
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { queryCersByOrgUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { Row, Radio, Table } from 'antd';
import moment from 'moment';
import { useState, useEffect } from 'react';

export default function ComanalysisLastStrengthData({
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
    const type = +saveSearchData['0-2'];
    if (beginTime && endTime && type) {
      await queryCersByOrgUsingPOSTAccountControllerApi({
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
      +document.querySelector('#comanalysisLastStrengthData')?.offsetHeight;
    if (rankHeightOrigin) {
      // @ts-ignore
      const rankHeight = rankHeightOrigin.toFixed(0);

      // @ts-ignore
      let h6Height =
        document.querySelector('#comanalysisLastStrengthData .title')
          ?.clientHeight || 0;
      if (h6Height) {
        // eslint-disable-next-line no-unsafe-optional-chaining
        h6Height = +h6Height?.toFixed(0);
      }
      const antHeight = Number(
        document.querySelector('#comanalysisLastStrengthData .ant-row')
          ?.clientHeight,
      )?.toFixed(0);
      const tableHead = Number(
        document.querySelector('#comanalysisLastStrengthData .ant-table-header')
          ?.clientHeight,
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
  }, [timeRange, saveSearchData['0-2']]);
  return (
    <>
      <p className='title'>{I18N.carbonDataManagemen.groupEmissionReduction}</p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <Radio.Group
          value={saveSearchData['0-2']}
          onChange={e => {
            // getEcuteMenData(e.target.value);
            changeSaveSearchData({ ...saveSearchData, '0-2': e.target.value });
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
              title: I18N.carbonDataManagemen.groupName,
              dataIndex: 'orgName',
              key: 'orgName',
            },
            +saveSearchData['0-2'] === 1
              ? {
                  title: I18N.carbonFootprint.totalEmissionsK,
                  dataIndex: 'cers',
                  key: 'cers',
                  width: '200px',
                }
              : {
                  title: I18N.carbonDataManagemen.perCapitaEmissionReduction,
                  dataIndex: 'cers',
                  key: 'cers',
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
