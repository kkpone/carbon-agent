/*
 * @Author: 张明尧
 * @Date: 2022-09-22 10:14:27
 */
interface AddFileData {
  suffix: string;
  name: string;
  url: string;
}

export interface AddFileDataAndUid extends Omit<AddFileData, 'suffix'> {
  uid: string;
}
