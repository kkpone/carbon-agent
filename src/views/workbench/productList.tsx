/*
 * @@description:欢迎页
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-04 11:51:47
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:12:17
 */

import I18N from '@src/lang/I18N';
import { Page } from '@src/components/Page';
import { RouteMaps } from '@src/router/route-paths';
import useSyncCallback from '@utils/useSyncCallback';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import style from './index.module.less';
import PageBar from './pageBar';
import { apiArticleProductList } from './service';

const ProductList = () => {
  // fix: 当跳转到首页没有导航栏时，清空数据，重新登录
  const history = useHistory();

  const [productList, setProductList] = useState<any[]>([]);
  const [page, setPage] = useState({
    pageSize: 10,
    pageNum: 1,
    total: 0,
  });

  const getListData = async () => {
    const res: any = await apiArticleProductList({
      pageSize: page.pageSize,
      pageNum: page.pageNum,
    });
    setPage({ ...page, total: res.data.data.total });
    setProductList(
      res.data.data.rows.map(item => ({
        ...item,
        day: moment(item.publishTime).format('DD'),
        year: moment(item.publishTime).format('YYYY-MM'),
      })),
    );
  };
  const syncCallbackFn = useSyncCallback(getListData);
  const onChange = (pageNum, pageSize) => {
    setPage({ ...page, pageSize, pageNum });
    syncCallbackFn();
  };
  useEffect(() => {
    syncCallbackFn();
  }, []);

  return (
    <Page
      breadCrumbs={[
        {
          title: I18N.workbench.workbench,
          key: I18N.workbench.workbench,
          href: RouteMaps.workIndex as string,
        },
        {
          title: I18N.workbench.productDynamics,
          key: I18N.workbench.productDynamics,
          href: '',
        },
      ]}
    >
      <div className={style.productListBox} id='box'>
        {productList.map(item => (
          <div
            className={style.productListItem}
            onClick={() => {
              history.push(`${RouteMaps.productDetail}?id=${item.id}`);
            }}
          >
            <div className={style.timeBox}>
              <span className={style.day}>{item.day}</span>
              <span className={style.year}>{item.year}</span>
            </div>
            <div className={style.infoBox}>
              <span className={style.tit}>{item.title}</span>
              <span className={style.desc}>{item.type}</span>
            </div>
          </div>
        ))}
      </div>
      <PageBar domId='box' pageOptions={page} onChange={onChange} />
    </Page>
  );
};

export default ProductList;
