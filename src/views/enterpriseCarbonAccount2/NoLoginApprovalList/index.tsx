import avatarImg from '@assets/svg/icon_avatar.svg';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { FC, useEffect, useState } from 'react';

import enterpriseImg from '@/assets/images/enterprise.png';
import whiteLogo from '@/assets/images/logo.png';
import greenLogo from '@/assets/images/logo_cn_dark.png';
import { FullscreenModal } from '@/components/FullscreenModal';
import { SelectLanguage } from '@/components/SelectLanguage';
import { IconAlibaba } from '@/components/iconfont';
import { logout } from '@/utils';

import styles from './index.module.less';
import { getApprovalUserInfo } from './service';
import ApprovalList from '../ApprovalList';

const NoLoginApprovalList: FC = () => {
  const [showFillPage, setShowFillPage] = useState(false);

  const [userInfo, setUserInfo] = useState<{
    name: string;
    waitDealCount: number;
  }>();

  const ticket =
    new URLSearchParams(location.search).get('ticket') || undefined;

  useEffect(() => {
    getApprovalUserInfo({ ticket }).then(({ data }) => {
      setUserInfo(data.data);
    });
  }, [ticket]);

  return (
    <FullscreenModal>
      <div className={styles.noLoginApprovalFill}>
        {!showFillPage && (
          <div className={styles.startFill}>
            <div className={styles.startFillLeft}>
              <img className={styles.greenLogo} src={greenLogo} alt='' />
              <img className={styles.avatar} src={avatarImg} alt='' />
              <div className={styles.username}>{userInfo?.name}</div>
              {/* <div className={styles.tip}>
                <span>{I18N.supplyChain.youHave}</span>
                <span className={styles.count}>{userInfo?.waitDealCount}</span>
                <span>{I18N.enterpriseCarbonAccount2.pendingApproval}</span>
              </div> */}
              <Button
                className={styles.fillBtn}
                type='primary'
                onClick={() => setShowFillPage(true)}
              >
                {I18N.enterpriseCarbonAccount2.startApproval}
              </Button>
            </div>
            <div className={styles.startFillRight}>
              <img
                className={styles.enterpriseImg}
                src={enterpriseImg}
                alt=''
              />
            </div>
          </div>
        )}
        {showFillPage && (
          <>
            <div className={styles.header}>
              <img className={styles.whiteLogo} src={whiteLogo} alt='' />
              <div className={styles.headerRight}>
                <SelectLanguage ticket={ticket} />
                <div className={styles.loginBtn} onClick={() => logout()}>
                  <IconAlibaba
                    className={styles.loginIcon}
                    type='icon-icon_chakanxiangqing'
                  />
                  <span>{I18N.enterpriseCarbonAccount2.loginToView}</span>
                </div>
              </div>
            </div>
            <ApprovalList className={styles.approvalFill} ticket={ticket} />
          </>
        )}
      </div>
    </FullscreenModal>
  );
};

export default NoLoginApprovalList;
