import I18N from '@src/lang/I18N';
import { useState, useEffect } from 'react';
import useSyncCallback from '@utils/useSyncCallback';
import { ApiexecuteMen } from '../../service';
import { ComstomSelect } from '../Basic';

const ComexecuteMenData = ({ changeSaveSearchData, saveSearchData }) => {
  const [ecuteMenData, getEcuteMenData] = useState<number | string>('0');
  const [currentSaveData, changeCurrentSaveData] = useState<{
    '5-3': string;
  }>({ '5-3': '1' });
  const ApiexecuteMenFn = async () => {
    await ApiexecuteMen({ targetPublish: currentSaveData['5-3'] }).then(
      ({ data }) => {
        getEcuteMenData(data.data);
      },
    );
  };
  const syncCallbackFn = useSyncCallback(ApiexecuteMenFn);

  useEffect(() => {
    // changeSaveSearchData({ ...saveSearchData, '5-3': 1 });
    changeCurrentSaveData({ '5-3': saveSearchData['5-3'] });
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
        value={currentSaveData['5-3']}
        onChange={e => {
          // getEcuteMenData(e);
          changeSaveSearchData({ ...saveSearchData, '5-3': e });
          changeCurrentSaveData({ '5-3': e });
          syncCallbackFn();
          //   saveSearchData['5-3'] = e;
          //   changeSaveSearchData({ ...saveSearchData });
        }}
      />
      <p className='title1' style={{ marginTop: '25px' }}>
        {I18N.carbonDataManagemen.targetAssignor}</p>
      <p className='number'>{ecuteMenData}</p>
    </>
  );
};

export default ComexecuteMenData;
