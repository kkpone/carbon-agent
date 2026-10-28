/*
 * @@description:排放源 新增 复制 编辑 详情
 * @Author: lixingchen qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 11:30:12
 */

import { InfoCircleOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import '../style.less';

import style from './index.module.less';
import {
  apiSourceCloseStatus,
  apiSourcePromptStatus,
} from '../../emissionAccount/service';

const EmissionFormPage = () => {
  const [showTip, setShowTip] = useState(false);
  // s,
  useEffect(() => {
    apiSourcePromptStatus().then(({ data }) => {
      setShowTip(data.data.showPrompt);
    });
  }, []);
  return showTip ? (
    <>
      <div className={classNames('tip-box flex-a-c flex-j-b', style.wrapper)}>
        <div>
          <InfoCircleOutlined className='cur-p color-0CBF9F padding-r-9' />
          <span className='tip-word'>
            {I18N.enterpriseCarbonAccount2.unmarkedIs}
          </span>
        </div>
        <div
          style={{
            width: '200px',
          }}
        >
          <span
            className='no-tip padding-r-12'
            onClick={() => {
              apiSourceCloseStatus().then(() => {
                setShowTip(false);
              });
            }}
          >
            {I18N.enterpriseCarbonAccount2.dontPromptAgain}
          </span>
          <span className='no-tip' onClick={() => setShowTip(false)}>
            {I18N.carbonFootprint3.close}
          </span>
        </div>
      </div>
      <div className={style.bg} />
    </>
  ) : (
    <div style={{ display: 'none' }} />
  );
};
export default EmissionFormPage;
