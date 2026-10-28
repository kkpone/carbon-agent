import I18N, { LocaleType } from '@src/lang/I18N';
import { Tabs, Image } from 'antd';
import React, { useContext } from 'react';

import styles from './index.module.less';
import type { HomeTabsInfo } from './type';
import { LocaleContext } from '../LocaleProvider';

const { TabPane } = Tabs;

export interface HomePageProps {
  introTabs: HomeTabsInfo[];
  title: string;
  introduction: string[];
  introImage: string;
}

export const HomePage: React.FC<HomePageProps> = props => {
  const { introTabs, title, introduction, introImage } = props;

  const { locale } = useContext(LocaleContext);

  const isEn = locale === LocaleType.enUS;

  return (
    <div className={styles.homePage}>
      <div className={styles.infoBox}>
        <div className={styles.introBox}>
          <div className={styles.title}>{title}</div>
          {introduction.map((item: string) => (
            <div className={styles.introText}>{item}</div>
          ))}
        </div>
        <div className={styles.homeTitleIllustration}>
          <Image width={550} preview={false} src={introImage} />
        </div>
      </div>

      <div className={styles.homeTab}>
        <div className={styles.TabTitle}>
          {I18N.carbonFootprint.functionIntroduction}
        </div>
        <div className={styles.TabMain}>
          <Tabs>
            {introTabs.map((item: HomeTabsInfo) => (
              <TabPane tab={item.label} key={item.id}>
                <div className={styles.tabMainItem}>
                  <div className={styles.cont}>{item.cont}</div>
                  <Image
                    height={380}
                    preview={false}
                    src={isEn ? item.enImgPath : item.imgPath}
                  />
                </div>
              </TabPane>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};
