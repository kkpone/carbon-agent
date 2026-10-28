/**
 * @file 通知详情
 * @author qifeng
 */

import I18N from '@src/lang/I18N';
import { getMessage, getNotice, listALLByDictTypeBatch } from '@src/api/api';
import { BroadcastDetailData } from '@src/api/types';
import { FormActions } from '@src/components/FormActions';
import { PRODUCT_NAME } from '@src/components/LayoutNavBar';
import { getProductPermission } from '@src/components/LayoutNavBar/utils';
import { RouteMaps } from '@src/router/route-paths';
import { FlattenRoutes } from '@src/router/type';
import { businessRouteList } from '@src/router/utils';
import store from '@src/store';
import { CompanyUserInfoAction } from '@src/store/module/user';
import {
  getNoticesAndMessagesCount,
  getScrollMessage,
} from '@src/store/notices-and-messages/actions';
import { Toast } from '@src/utils/Toast';
import { Dicts } from '@src/views/emission/Show/type';
import { messageType } from '@src/views/system/utils';
import {
  BroadcastDetailType,
  BroadcastTabType,
} from '@src/views/system/utils/type';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';
import style from './index.module.less';

export type BroadcastDetailProps = {
  message?: BroadcastDetailData;
};

const BroadcastDetail = ({ message }: BroadcastDetailProps) => {
  const { id, type } = useParams<{ id: string; type: BroadcastDetailType }>();
  const history = useHistory();
  const usedId = id;
  // eslint-disable-next-line
  const usedType = message
    ? BroadcastDetailType.notice
    : type?.toLowerCase() === BroadcastDetailType.notice
    ? BroadcastDetailType.notice
    : BroadcastDetailType.message;

  const [data, setData] = useState<BroadcastDetailData>();
  const [publisher, setPublisher] = useState<
    Record<'message_publish' | 'notice_publish', Dicts[]>
  >({
    notice_publish: [],
    message_publish: [],
  });

  /** 内容点击事件拦截 */
  const contentClickFn = (ev: MouseEvent) => {
    const { target } = ev;
    const disPermissionFn = () =>
      Toast('error', I18N.system.currentLinkNotAvailable);
    ev.preventDefault();
    // @ts-ignore
    const hrefTarget = target?.target || 'self';
    // @ts-ignore
    const href = target?.href as string | null;
    if (!href) return null;
    if (!href?.startsWith(window.location.origin)) {
      return disPermissionFn();
    }
    const { origin } = window.location;
    if (href && href.includes(origin)) {
      const jumpPath = new RegExp(`${origin}(/.*)`).exec(
        href.split('?')[0],
      )?.[1];
      if (!jumpPath) {
        return disPermissionFn();
      }
      const matchedPath: FlattenRoutes | undefined = businessRouteList?.filter(
        r =>
          !!matchPath(jumpPath, {
            path: r.path,
            exact: true,
            strict: false,
            // 过滤掉无用的匹配值
          }) && !r.redirect,
      )[0];
      if (!matchedPath) {
        return disPermissionFn();
      }

      const matchParents: FlattenRoutes[] = [];
      let matchParent = matchedPath?.parent;
      while (matchParent) {
        matchParents.push(matchParent);
        matchParent = matchParent.parent;
      }
      matchParent = undefined;

      const search = new URLSearchParams(href?.split('?')[1]);
      const productId = search.get(PRODUCT_NAME);
      if (productId) {
        // eslint-disable-next-line
        getProductPermission(productId).then(([res, info]) => {
          const allMenus = info?.permissionSet;

          if (!allMenus) {
            return disPermissionFn();
          }
          /** 记录匹配的菜单权限 路由深度、路由 */
          let macthLength = 0;
          let matchRoute: string | undefined;

          allMenus?.forEach(p => {
            // 找到符合条件的路由 当前路由是否能匹配
            let isMatch = jumpPath === p.path;
            // 当前路由不能匹配就去父路由去匹配
            if (!isMatch) {
              // 父级路由一旦有可以匹配的就不再去上一级查找匹配
              matchParents.some(r => {
                isMatch = !!matchPath(p.path, {
                  path: r.path,
                  exact: true,
                  strict: false,
                });
                if (isMatch) {
                  const currentMatchLen = p.path.split('/').length;
                  if (currentMatchLen > macthLength) {
                    macthLength = currentMatchLen;
                    matchRoute = p.path;
                  }
                }
                return isMatch;
              });
            }

            // 找到最匹配的路由
            const macthLengthNow = p.path.split('/').length;
            if (macthLengthNow > macthLength) return p.path;
            return null;
          });

          if (!matchRoute) {
            return disPermissionFn();
          }
          store.dispatch<CompanyUserInfoAction>({
            type: 'UPDATE_INFO',
            payload: info,
          });
          setTimeout(() => {
            window.open(href, hrefTarget);
          }, 200);
        });
      }
      return disPermissionFn();
    }
    return undefined;
  };
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.addEventListener('click', contentClickFn, true);
    }
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('click', contentClickFn, true);
      }
    };
  });
  useEffect(() => {
    listALLByDictTypeBatch({
      dictTypes: 'notice_publish,message_publish',
    }).then(({ data }) => {
      if (data?.data) {
        setPublisher(data?.data);
      }
    });
  }, []);

  useEffect(() => {
    if (message) {
      setData(message);
    } else if (usedType && usedId) {
      if (usedType === BroadcastDetailType.message) {
        getMessage(usedId).then(({ data }) => {
          setData(data?.data);
        });
      } else {
        getNotice(usedId)
          .then(({ data }) => {
            setData(data?.data);
          })
          .finally(getNoticesAndMessagesCount);
      }
      getScrollMessage();
    }
  }, [usedType, usedId]);
  if (!message && (!usedId || !usedType)) return null;
  if (!data) return <h1>{I18N.system.dataAcquisitionLoss}</h1>;
  const noticeType = {
    1: I18N.system.ordinaryNotice,
    2: I18N.system.popUpNotification,
    3: I18N.system.rollingNotifications,
  };
  return (
    <div className={classNames(style.wrapper, style.inModal)}>
      <div className={style.top}>
        <h1>{data.title}</h1>
        <div className={style.tips}>
          {usedType === BroadcastDetailType.notice ? (
            <div>
              {I18N.system.notificationType}
              {noticeType[data.showType] || noticeType[1]}
            </div>
          ) : (
            <div>
              {I18N.system.messageType}
              {messageType[data.showType] || messageType[1]}
            </div>
          )}
          <div>
            {I18N.system.releaseTime}
            {data.publishTime}
          </div>
          <div>
            {I18N.system.publisher}
            {publisher[
              type === BroadcastDetailType.notice
                ? 'notice_publish'
                : 'message_publish'
            ]?.find(d => data.publish === d.dictValue)?.dictLabel ||
              data.publish}
          </div>
        </div>
      </div>
      <div
        ref={contentRef}
        className={classNames(style.bottom, 'richText')}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
      {!message && (
        <FormActions
          place='center'
          buttons={[
            // {
            //   title: '下一条',
            //   type: 'primary',
            // },
            {
              title: I18N.carbonFootprint.return,
              onClick: async () =>
                history.push(
                  I18N.template(I18N.system.route, {
                    val1: RouteMaps.broadcast,
                    val2:
                      usedType === BroadcastDetailType.message
                        ? BroadcastTabType.message
                        : BroadcastTabType.notice,
                  }),
                ),
            },
          ]}
        />
      )}
    </div>
  );
};

export default BroadcastDetail;
