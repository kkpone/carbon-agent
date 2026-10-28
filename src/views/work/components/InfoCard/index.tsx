import I18N from '@src/lang/I18N';
import { FC } from 'react';
import { Link } from 'react-router-dom';

import { RouteMaps } from '@/router/route-paths';

import styles from './index.module.less';
import rightArrowSvg from '../../images/rightArrow.svg';
import { ArticleData } from '../../type';

interface IInfoCardProps {
  info: ArticleData;
}

export const InfoCard: FC<IInfoCardProps> = props => {
  const { info } = props;
  return (
    <div className={styles.card}>
      <img src={info.imageUrl} alt='' className={styles.img} />
      <div className={styles.info}>
        <div className={styles.tags}>
          {info.articleLabelList.map(tag => (
            <div
              className={styles.tag}
              style={{
                backgroundColor: tag.icon,
              }}
              key={tag.id}
            >
              {tag.cname}
            </div>
          ))}
        </div>
        <Link
          className={styles.titleLink}
          to={`${RouteMaps.workArticleDetail}?id=${info.id}`}
        >
          <div className={styles.title}>{info.title}</div>
        </Link>
      </div>
      <Link
        className={styles.link}
        to={`${RouteMaps.workArticleDetail}?id=${info.id}`}
      >
        {I18N.work.viewArticle}
        <img src={rightArrowSvg} alt='' />
      </Link>
    </div>
  );
};
