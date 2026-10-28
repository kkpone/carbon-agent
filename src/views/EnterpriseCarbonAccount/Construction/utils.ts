import { useState, useCallback, useEffect } from 'react';
import { apiMnumListALLByDictTypeBatch } from '@src/views/emission/Show/service';
import { Dicts } from '@src/views/emission/Show/type';
import { MumentListType } from './activityManage/addActivity';
import { apiComputationRoomValue } from './service';

function MumnentListFn(str: string) {
  const [mumentList, getMumentList] = useState<MumentListType>({});
  const [isFirst, changeIsFirst] = useState(false);
  const apiMnumListALLByDictTypeBatchFn = useCallback(async () => {
    if (!isFirst) {
      await apiMnumListALLByDictTypeBatch({
        dictTypes: str,
      }).then(({ data }) => {
        if (data.code === 200) {
          getMumentList({ ...data.data });
          changeIsFirst(true);
        }
        return mumentList;
      });
    }
  }, []);
  useEffect(() => {
    apiMnumListALLByDictTypeBatchFn();
  }, []);

  return mumentList;
}
function RoomListFn() {
  const [mumentList, getMumentList] = useState<
    Dicts[] & { illuminationTime?: string; powerDensity?: string }[]
  >([]);
  const [isFirst, changeIsFirst] = useState(false);
  const apiMnumListALLByDictTypeBatchFn = useCallback(async () => {
    if (!isFirst) {
      await apiComputationRoomValue<
        Dicts & { illuminationTime?: string; powerDensity?: string }
      >().then(({ data }) => {
        if (data.code === 200) {
          getMumentList([...data.data]);
          changeIsFirst(true);
        }
        return mumentList;
      });
    }
  }, []);
  useEffect(() => {
    apiMnumListALLByDictTypeBatchFn();
  }, []);

  return mumentList;
}
function getBit(value: string, num = 4) {
  const reg = num ? /([0-9]+\.[0-9]{4})[0-9]*/ : /([0-9]+\.[0-9]{0})[0-9]*/;
  let str = value.toString();
  str = str.replace(reg, '$1');
  return str;
}
export { MumnentListFn, RoomListFn, getBit };
