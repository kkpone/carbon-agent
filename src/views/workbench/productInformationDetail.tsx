/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-04 14:17:33
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-04-18 10:15:42
 */
/**
 * @file 欢迎页
 */
import I18N from '@src/lang/I18N';
import { EmptyPage } from '@src/components/EmptyPage';
import { FormActions } from '@src/components/FormActions';
import { Page } from '@src/components/Page';
import { RouteMaps } from '@src/router/route-paths';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import style from './index.module.less';
import {
  apiArticleDownload,
  apiArticleInfo,
  apiArticleProductInfo,
} from './service';

const ProductInformationDetail = () => {
  // fix: 当跳转到首页没有导航栏时，清空数据，重新登录
  const history = useHistory();
  const path = history.location.pathname;
  const [pageType, setPageType] = useState<'product' | 'information'>(
    'information',
  );
  const [articleInfo, setArticleInfo] = useState({
    title: '',
    source: '',
    createTime: '',
    content: '',
    publishTime: '',
    type: '',
    orPayUser: null,
    categorys: '',
  });
  const typeObj = {
    notice_1: I18N.workbench.versionIteration,
    notice_2: I18N.workbench.systemMaintenance,
    notice_3: I18N.workbench.operationsNotification,
  };
  const informationMessageId =
    new URLSearchParams(window.location.search).get('informationMessageId') ||
    '';
  const id = new URLSearchParams(window.location.search).get('id') || '';
  const addDownloadHistory = (e: any) => {
    const { target } = e;
    if (target.className === 'download') {
      apiArticleDownload({ informationMessageId }).then(() => {});
    }
  };
  useEffect(() => {
    if (path === RouteMaps.informationDetail) {
      setPageType('information');
      apiArticleInfo({ informationMessageId }).then((res: any) => {
        setArticleInfo({ ...res.data.data });
      });
    }
    if (path === RouteMaps.productDetail) {
      setPageType('product');
      apiArticleProductInfo({ id }).then((res: any) => {
        setArticleInfo(res.data.data);
      });
    }

    document.addEventListener('click', addDownloadHistory);
    return () => {
      document.removeEventListener('click', addDownloadHistory);
    };
  }, []);

  return (
    <Page
      breadCrumbs={[
        {
          title: I18N.workbench.workbench,
          key: I18N.workbench.workbench,
          href: RouteMaps.workIndex,
        },
        {
          title: I18N.workbench.lowCarbonInformation,
          key: I18N.workbench.lowCarbonInformation,
          href: RouteMaps.informationList,
        },
        {
          title: `${
            pageType === 'information'
              ? I18N.workbench.productInformationDetail
              : I18N.workbench.carbonCloudDynamics
          }`,
          key: I18N.carbonFootprint3.details,
          href: ``,
        },
      ]}
    >
      <div className={style.articleDetailBox}>
        <div className={style.topBox}>
          <p className={style.tit}>{articleInfo.title}</p>
          <div className={style.infoBox}>
            <span className={style.source}>
              {articleInfo.source
                ? I18N.template(I18N.workbench.source, {
                    val1: articleInfo.source,
                  })
                : I18N.template(I18N.workbench.type, {
                    val1:
                      typeObj[articleInfo.type] ||
                      I18N.workbench.versionIteration,
                  })}
            </span>
            <span>
              {I18N.workbench.time}
              {articleInfo.createTime || articleInfo.publishTime}
            </span>
          </div>
        </div>
        {articleInfo.orPayUser === 0 ? (
          <EmptyPage
            className={style.contentBox}
            tipWord={I18N.workbench.noPermissionToOpenTemporarily}
          />
        ) : (
          <div
            className={classNames(style.contentBox, 'richText')}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: articleInfo.content }}
          />
        )}

        {path === RouteMaps.informationDetail && articleInfo.orPayUser !== 0 ? (
          <div className={style.liability}>
            {I18N.workbench.statement}{' '}
            {articleInfo.categorys.includes('1')
              ? I18N.workbench.thisArticleBelongsTo
              : I18N.workbench.theServicesProvidedByThisWebsite}
          </div>
        ) : (
          ''
        )}
      </div>
      <FormActions
        place='center'
        buttons={[
          {
            type: 'default',
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.goBack();
            },
          },
        ]}
      />
    </Page>
  );
};

export default ProductInformationDetail;
