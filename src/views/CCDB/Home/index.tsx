import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Spin } from 'antd';
import { FC } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import hotSvg from './hot.svg';
import styles from './index.module.less';
import { CollectCard } from '../components/CollectCard';
import { SearchInput } from '../components/SearchInput';
import collect from '../image/collect.svg';
import { ccdbRecommendData, ccloudCcdbInfo } from '../service';

export interface IHomeProps {}

export const Home: FC<IHomeProps> = () => {
  const { data, loading } = useRequest(ccloudCcdbInfo);
  const location = useLocation<{ type: string }>();

  const searchParams = new URLSearchParams(location.search);

  const type = searchParams.get('type') || '';

  const isPermissionDenied = false;

  const { one, three } = data?.data?.data || { one: [], three: [] };

  const { data: recommendData, run } = useRequest(ccdbRecommendData);

  const history = useHistory();

  const recommendInfo = recommendData?.data.data;

  return (
    // console.log(props);
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div
          className={styles.stars}
          onClick={() => {
            history.push(`/CCDB/Collect`);
          }}
        >
          <img src={collect} alt='' />
          {I18N.ccdb.myCollection}
        </div>
        <div className={styles.content}>
          <div className={styles.title}>{I18N.ccdb.inCcdb}</div>
          <div className={styles.des}>{I18N.ccdb.integratingGlobalCarbon}</div>
          <SearchInput
            search={e => {
              if (e.length === 0) {
                return;
              }
              history.push(
                `/CCDB/Search?name=${e}${
                  type.length > 0 ? `&type=${type}` : ''
                }`,
              );
            }}
            showTips={!isPermissionDenied}
          />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.title}>
          <img src={hotSvg} alt='' /> {I18N.ccdb.popularSearchReasons}
        </div>
        <div className={styles.hot}>
          {recommendInfo?.map(item => (
            <CollectCard
              {...item}
              key={`${item.id}${item.isCollectFactor}`}
              run={run}
            />
          ))}
        </div>
        <Spin spinning={loading}>
          <div className={styles.title}>{I18N.ccdb.databaseHighlights}</div>
          <div className={styles.lightPoint}>
            {one.map(item => (
              <div className={styles.card} key={item.id}>
                <div className={styles.icon}>
                  <img src={item.ccdbIcon} alt='' />
                </div>
                <div>
                  <div className={styles.des}>{item.title}</div>
                  <div className={styles.detail} title={item.content}>
                    {item.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.title}>{I18N.ccdb.ccdBs}</div>
          <div className={styles.lightPoint}>
            {three.map(item => (
              <div className={styles.AdvantageCard} key={item.id}>
                <div className={styles.des}>{item.title}</div>
                <div className={styles.detail} title={item.content}>
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default Home;
