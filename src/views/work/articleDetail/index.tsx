import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import classNames from 'classnames';
import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { PageWrapper } from '@/components/PageWrapper';

import styles from './index.module.less';
import { getArticleDetail } from './service';

function formatPublishTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year} / ${month}`;
}

export interface IArticleDetailProps {}

export const ArticleDetail: FC<IArticleDetailProps> = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // 获取特定的查询参数
  const id = searchParams.get('id');

  const { data } = useRequest(() => getArticleDetail({ id: id || '0' }), {
    ready: !!id,
  });

  const articleInfo = data?.data.data;

  const publishTime = articleInfo?.publishTime;

  const date =
    typeof publishTime === 'string' ? new Date(publishTime) : publishTime;

  const formattedDate = formatPublishTime(date || new Date());

  return (
    <PageWrapper
      breadCrumbProps={{
        items: [
          {
            title: <Link to='/work/index'>{I18N.workbench.workbench}</Link>,
            href: '/work/index',
          },
          {
            title: I18N.workbench.lowCarbonInformation,
          },
        ],
      }}
      title={I18N.workbench.lowCarbonInformation}
    >
      <div className={styles.header}>
        <time dateTime={date?.toDateString()} className={styles.time}>
          <div className={styles.year}>{formattedDate}</div>
          <div className={styles.day}>{date?.getDate()}</div>
        </time>
        <div className={styles.titleWrapper}>
          <div className={styles.title}>{articleInfo?.title}</div>
          <div className={styles.labels}>
            {articleInfo?.articleLabelList.map(label => (
              <span className={styles.label} key={label.id}>
                {label.cname}
              </span>
            ))}
          </div>
        </div>
      </div>
      <article className={classNames(styles.article, styles.richText)}>
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: articleInfo?.content || '',
          }}
        />
      </article>
    </PageWrapper>
  );
};

export default ArticleDetail;
