import { createContext } from 'react';
import '../carbon-greenMeeting.scss';
// 进度条
import { Dicts } from '@src/views/emission/Show/type';

export const TableContact: any = createContext({});
/**
 * BCA_Room_Type_Heating?: Dicts[]; //房间类型-制热字典标识
 *BCA_Heating_Mode?: Dicts[]; //采暖方式字典标识
 * BCA_Cooling_Equipment?: Dicts[]; //制冷设备字典标识
 *HFCsEnum?: Dicts[]; //制冷剂字典标识
 * BCA_Room_Type_Cooling?: Dicts[]; //房间类型-制冷字典标识：
 *
 */
export interface MumentListType {
  BCA_Room_Type_Heating?: Dicts[]; // 房间类型-制热字典标识
  BCA_Heating_Mode?: Dicts[]; // 采暖方式字典标识
  BCA_Cooling_Equipment?: Dicts[]; // 制冷设备字典标识
  HFCsEnum?: Dicts[]; // 制冷剂字典标识
  BCA_Room_Type_Cooling?: Dicts[]; // 房间类型-制冷字典标识：
  BCA_Current_Stage?: Dicts[];
  BCA_Use_Frequency?: Dicts[]; // 使用频率
}
[];
