/** **
 * @file 奖品排行榜
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { recordUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
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
    const type = saveSearchData['10-2'];
    await recordUsingPOSTAccountControllerApi({
      beginTime,
      endTime,
      type,
    }).then(({ data }) => {
      // @ts-ignore
      getEcuteMenData(data.data);
    });
  };
  // const syncCallbackFn = useSyncCallback(ApiSeniorityRankFn);
  const culHeight = () => {
    const rankHeightOrigin =
      // @ts-ignore
      // eslint-disable-next-line no-unsafe-optional-chaining
      +document.querySelector('#prizeTopData')?.offsetHeight;
    if (rankHeightOrigin) {
      // @ts-ignore
      const rankHeight = rankHeightOrigin.toFixed(0);

      // @ts-ignore
      let h6Height =
        document.querySelector('#prizeTopData .title')?.clientHeight || 0;
      if (h6Height) {
        // eslint-disable-next-line no-unsafe-optional-chaining
        h6Height = +h6Height?.toFixed(0);
      }
      const antHeight = Number(
        document.querySelector('#prizeTopData .ant-row')?.clientHeight,
      )?.toFixed(0);
      const tableHead = Number(
        document.querySelector('#prizeTopData .ant-table-header')?.clientHeight,
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
  }, [timeRange, saveSearchData['10-2']]);
  return (
    <>
      <p className='title'>{I18N.carbonDataManagemen.prizeList}</p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <Radio.Group
          value={saveSearchData['10-2']}
          onChange={e => {
            // getEcuteMenData(e.target.value);
            changeSaveSearchData({ ...saveSearchData, '10-2': e.target.value });
          }}
        >
          <Radio.Button value='1'>{I18N.carbonAccount.redeemed}</Radio.Button>
          <Radio.Button value='2'>
            {I18N.carbonDataManagemen.inventory}
          </Radio.Button>
        </Radio.Group>
      </Row>
      {ecuteMenData.length > 0 ? (
        <Table
          pagination={false}
          dataSource={[...ecuteMenData]}
          scroll={{ y: culTableHeight }}
          columns={
            Number(saveSearchData['10-2']) === 1
              ? [
                  {
                    title: I18N.carbonDataManagemen.ranking,
                    dataIndex: 'id',
                    key: 'id',
                    width: '90px',
                    render: (text, record, index: number) => (
                      <span>{index + 1}</span>
                    ),
                  },
                  {
                    title: I18N.carbonAccount.prizeName,
                    dataIndex: 'goodsName',
                    key: 'goodsName',
                  },
                  {
                    title: I18N.carbonDataManagemen.thumbnail,
                    dataIndex: 'imgPath',
                    key: 'imgPath',
                    render: (text: string) =>
                      text ? (
                        <img
                          style={{ width: '45px', height: '34px' }}
                          src={text}
                          alt={I18N.carbonDataManagemen.thumbnail}
                        />
                      ) : (
                        '-'
                      ),
                  },
                  {
                    title: I18N.carbonFootprint.quantity,
                    dataIndex: 'countNum',
                    key: 'countNum',
                  },
                ]
              : [
                  {
                    title: I18N.carbonDataManagemen.ranking,
                    dataIndex: 'id',
                    key: 'id',
                    width: '90px',
                    render: (text, record, index: number) => (
                      <span>{index + 1}</span>
                    ),
                  },
                  {
                    title: I18N.carbonAccount.prizeName,
                    dataIndex: 'goodsName',
                    key: 'goodsName',
                  },
                  {
                    title: I18N.carbonDataManagemen.thumbnail,
                    dataIndex: 'imgPath',
                    key: 'imgPath',
                    render: (text: string) =>
                      text ? (
                        <img
                          style={{ width: '45px', height: '34px' }}
                          src={text}
                          alt={I18N.carbonDataManagemen.thumbnail}
                        />
                      ) : (
                        '-'
                      ),
                  },
                  {
                    title: I18N.carbonFootprint.quantity,
                    dataIndex: 'amount',
                    key: 'amount',
                  },
                ]
          }
        />
      ) : (
        <Nodata />
      )}
    </>
  );
}
