import qrCodeImg from '@assets/svg/service_qr_code.png';
import I18N from '@src/lang/I18N';
import { Button, Popover } from 'antd';
import { FC } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import companySvg from './company.svg';
import styles from './index.module.less';
import productSvg from './product.svg';
import { IdentityData } from '../../type';

interface IDemoCardsProps {
  demoData?: IdentityData['demoDataList'];
  trialExpired?: 0 | 1;
  duration?: number;
}

export const DemoCards: FC<IDemoCardsProps> = props => {
  const { demoData, trialExpired, duration } = props;
  return (
    <div className={styles.cardsWrapper}>
      <div className={styles.title}>{I18N.work.productExperience}</div>
      <div className={styles.subTitle}>
        {I18N.work.throughDem}
        <span className={styles.days}>{duration}</span>
        {I18N.work.day}
      </div>
      <div className={styles.cards}>
        {demoData?.map((item, index) => (
          <div className={styles.card}>
            <div className={styles.left}>
              <div className={styles.cardTitle}>{item.productName}</div>
              <div className={styles.cardBtns}>
                <a
                  href={item.jumpUrl}
                  target='_blank'
                  rel='noreferrer'
                  onClick={e => {
                    if (item.jumpUrl.length === 0) {
                      e.stopPropagation();
                      return false;
                    }
                    return true;
                  }}
                >
                  <Button
                    icon={
                      <IconAlibabaNew
                        type='icon-icon-chanpintanzuji'
                        className={styles.icon}
                      />
                    }
                    disabled={trialExpired === 1 || item.jumpUrl.length === 0}
                  >
                    {I18N.work.startExperiencing}
                  </Button>
                </a>
                <Popover
                  content={
                    <div className={styles.contactBox}>
                      <div className={styles.contactText}>
                        {I18N.carbonFootprint3.contactExclusiveCustomers}
                      </div>
                      <div className={styles.img}>
                        <img
                          className={styles.img}
                          src={qrCodeImg}
                          alt={I18N.carbonAccount.picture}
                        />
                      </div>
                    </div>
                  }
                  title=''
                  trigger='hover'
                  placement='bottom'
                >
                  <Button
                    icon={
                      <IconAlibabaNew
                        type='icon-icon-lianxiwomen'
                        className={styles.icon}
                      />
                    }
                  >
                    {I18N.system.contactUs}
                  </Button>
                </Popover>
              </div>
            </div>
            <img
              className={styles.right}
              src={index === 0 ? productSvg : companySvg}
              alt=''
            />
          </div>
        ))}
      </div>
    </div>
  );
};
