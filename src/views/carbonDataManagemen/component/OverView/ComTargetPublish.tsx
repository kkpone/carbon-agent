import I18N from '@src/lang/I18N';
import { useState, useEffect } from 'react';
import useSyncCallback from '@utils/useSyncCallback';
import { ApitargetPublish } from '../../service';
import { ComstomSelect } from '../Basic';

export default function ComSubmissionTrend({
  changeSaveSearchData,
  saveSearchData,
}) {
  const [ecuteMenData, getEcuteMenData] = useState<number | string>('0');
  const [currentSaveData, changeCurrentSaveData] = useState<{
    '7-2': string;
  }>({ '7-2': '1' });
  const ApitargetPublishFn = async () => {
    await ApitargetPublish({ targetPublish: currentSaveData['7-2'] }).then(
      ({ data }) => {
        getEcuteMenData(data.data);
      },
    );
  };
  const syncCallbackFn = useSyncCallback(ApitargetPublishFn);

  useEffect(() => {
    // changeSaveSearchData({ ...saveSearchData, '7-2': 1 });
    changeCurrentSaveData({ '7-2': saveSearchData['7-2'] });
    syncCallbackFn();
  }, []);
  return (
    <>
      {/* {JSON.stringify(currentSaveData['7-2'])}=1212121 */}
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
        value={currentSaveData['7-2']}
        onChange={e => {
          // getEcuteMenData(e);
          changeSaveSearchData({ ...saveSearchData, '7-2': e });
          changeCurrentSaveData({ '7-2': e });
          syncCallbackFn();
          //   saveSearchData['7-2'] = e;
          //   changeSaveSearchData({ ...saveSearchData });
        }}
      />
      <p className='title1' style={{ marginTop: '20px' }}>
        {I18N.carbonDataManagemen.numberOfTargetReleases}</p>
      <p className='number'>{ecuteMenData}</p>
    </>
  );
}
