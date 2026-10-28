/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-20 18:34:51
 * @Date: 2023-02-07 09:44:02
 * @@description: 产品碳足迹-快速核算-导入排放源
 */

import CarbonFootprint3ImportFile from '@src/views/carbonFootprint3/component/ImportFile';
import { useParams } from 'react-router-dom';

const AccountEmissionSourceImport = () => {
  const { id, stage } = useParams<{ id: string; stage: string }>();
  return (
    <div className='m-b-60'>
      <CarbonFootprint3ImportFile
        status='accountMission'
        apiParams={{ accountId: id, stage }}
      />
    </div>
  );
};

export default AccountEmissionSourceImport;
