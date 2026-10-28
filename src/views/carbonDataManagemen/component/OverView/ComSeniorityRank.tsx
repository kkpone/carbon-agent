/** **
 * @file 部门排行榜
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { useState, useEffect } from 'react';
import { Row, Radio, Table } from 'antd';
import useSyncCallback from '@utils/useSyncCallback';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { ApiSeniorityRank } from '../../service';

export default function ComSeniorityRank({
  changeSaveSearchData,
  saveSearchData,
  companyName,
  layout,
}) {
  const [ecuteMenData, getEcuteMenData] = useState<
    { name: string; value: string }[]
  >([]);
  const [currentSaveData, changeCurrentSaveData] = useState<{
    '3-2': string;
  }>({ '3-2': '1' });
  const [culTableHeight, getCuleableHeight] = useState<number | string>('auto');
  const ApiSeniorityRankFn = async () => {
    await ApiSeniorityRank({ rank: currentSaveData['3-2'] }).then(
      ({ data }) => {
        getEcuteMenData(data.data);
      },
    );
  };
  const syncCallbackFn = useSyncCallback(ApiSeniorityRankFn);
  const culHeight = () => {
    const rankHeightOrigin =
      // @ts-ignore
      // eslint-disable-next-line no-unsafe-optional-chaining
      +document.querySelector('#ComSeniorityRank')?.offsetHeight;
    if (rankHeightOrigin) {
      // @ts-ignore
      const rankHeight = rankHeightOrigin.toFixed(0);

      // @ts-ignore
      let h6Height =
        document.querySelector('#ComSeniorityRank h6')?.clientHeight || 0;
      if (h6Height) {
        // eslint-disable-next-line no-unsafe-optional-chaining
        h6Height = +h6Height?.toFixed(0);
      }
      const antHeight = Number(
        document.querySelector('#ComSeniorityRank .ant-row')?.clientHeight,
      )?.toFixed(0);
      const tableHead = Number(
        document.querySelector('#ComSeniorityRank .ant-table-header')
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
    changeCurrentSaveData({ '3-2': saveSearchData['3-2'] });
    syncCallbackFn();
  }, [saveSearchData['3-2']]);
  return (
    <>
      <h6 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {I18N.template(I18N.carbonDataManagemen.compa18, { val1: companyName })}
      </h6>
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <Radio.Group
          value={currentSaveData['3-2']}
          onChange={e => {
            // getEcuteMenData(e.target.value);
            changeSaveSearchData({ ...saveSearchData, '3-2': e.target.value });
            changeCurrentSaveData({ '3-2': e.target.value });
            syncCallbackFn();
          }}
        >
          <Radio.Button value='1'>{I18N.carbonDataManagemen.lastMonth}</Radio.Button>
          <Radio.Button value='2'>{I18N.carbonDataManagemen.inThePastThreeMonths}</Radio.Button>
          <Radio.Button value='3'>{I18N.carbonDataManagemen.sinceThisYearOn}</Radio.Button>
          <Radio.Button value='4'>{I18N.carbonDataManagemen.throughoutHistory}</Radio.Button>
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
              render: (text, record, index: number) => <span>{index + 1}</span>,
            },
            {
              title: I18N.dashborad.departmentName,
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: I18N.enterpriseCarbonAccount2.emissionsTC2,
              dataIndex: 'value',
              key: 'value',
            },
          ]}
        />
      ) : (
        <Nodata />
      )}
    </>
  );
}
