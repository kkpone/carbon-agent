import I18N from '@src/lang/I18N';
import React, { useState, useEffect } from 'react';
import useSyncCallback from '@utils/useSyncCallback';
import { ApiexecuteCount } from '../../service';
import { ComstomSelect } from '../Basic';

const ComexecuteMenData = ({ changeSaveSearchData, saveSearchData }) => {
  const [ecuteMenData, getEcuteMenData] = useState<number | string>('0');
  const [currentSaveData, changeCurrentSaveData] = useState<{
    '7-1': string;
  }>({ '7-1': '1' });
  const ApiexecuteCountFn = async () => {
    await ApiexecuteCount({ targetPublish: currentSaveData['7-1'] }).then(
      ({ data }) => {
        getEcuteMenData(data.data);
      },
    );
  };
  const syncCallbackFn = useSyncCallback(ApiexecuteCountFn);

  useEffect(() => {
    // changeSaveSearchData({ ...saveSearchData, '7-1': 1 });
    changeCurrentSaveData({ '7-1': saveSearchData['7-1'] });
    syncCallbackFn();
  }, []);
  return (
    <>
      <ComstomSelect
        style={{
          width: '30%',
          maxWidth: '240px',
          position: 'absolute',
          top: '10px',
          right: '10px',
        }}
        placeholder={I18N.carbonDataManagemen.thisMonth}
        options={[
          {
            label: I18N.carbonDataManagemen.thisMonth,
            value: '1',
          },
          {
            label: I18N.carbonDataManagemen.inThePastThreeMonths,
            value: '2',
          },
          {
            label: I18N.carbonDataManagemen.sinceThisYearOn,
            value: '3',
          },
          {
            label: I18N.carbonDataManagemen.throughoutHistory,
            value: '4',
          },
        ]}
        value={currentSaveData['7-1']}
        onChange={e => {
          // getEcuteMenData(e);
          changeSaveSearchData({ ...saveSearchData, '7-1': e });
          changeCurrentSaveData({ '7-1': e });
          syncCallbackFn();
          //   saveSearchData['7-1'] = e;
          //   changeSaveSearchData({ ...saveSearchData });
        }}
      />
      <p className='title1' style={{ marginTop: '20px' }}>
        {I18N.carbonDataManagemen.targetAllocationTimes}</p>
      <p className='number'>{ecuteMenData}</p>
    </>
  );
};

export default ComexecuteMenData;
