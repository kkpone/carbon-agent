/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-04 11:51:47
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-04-17 16:23:20
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @file 欢迎页
 */
import { Page } from '@src/components/Page';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import useSyncCallback from '@src/utils/useSyncCallback';
import { Radio } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import style from './index.module.less';
import PageBar from './pageBar';
import { apiArticleList, apiArticleProductList } from './service';
import { apiMnumListALLByDictTypeBatch } from '../emission/Show/service';
import { Dicts } from '../emission/Show/type';

const InformationList = () => {
  // fix: 当跳转到首页没有导航栏时，清空数据，重新登录
  const history = useHistory();
  const getDataList = async () => {
    const res: any = await apiArticleList({
      tagId: currentRadio,
      pageNum: page.pageNum,
      pageSize: page.pageSize,
    });
    setInformationList([...res.data.rows]);
    setPage({ ...page, total: res.data.total });
  };
  const [productList, setProductList] = useState<any[]>([]);
  const [classifyList, setClassifyList] = useState<Dicts[]>([]);
  const [informationList, setInformationList] = useState<any[]>([]);
  const [page, setPage] = useState({
    pageSize: 10,
    pageNum: 1,
    total: 0,
  });
  const [currentRadio, setCurrentRadio] = useState('');
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
  const syncCallbackFn = useSyncCallback(getDataList);
  const syncProductCallbackFn = useSyncCallback(getListData);
  const onChange = (pageNum, pageSize) => {
    setPage({ ...page, pageSize, pageNum });
    if (currentRadio !== '135') {
      syncCallbackFn();
    } else {
      syncProductCallbackFn();
    }
  };

  const onChangeRadio = e => {
    const { value } = e.target;
    setCurrentRadio(value);
    if (value !== '135') {
      syncCallbackFn();
    } else {
      syncProductCallbackFn();
    }
  };
  const getDictData = async () => {
    const res = await apiMnumListALLByDictTypeBatch({
      dictTypes: 'informationClassify',
    });
    const list = res.data.data.informationClassify;
    setClassifyList([
      ...list,
      {
        dictValue: '135',
        dictLabel: I18N.workbench.carbonCloudDynamics,
        value: '135',
        label: I18N.workbench.carbonCloudDynamics,
        dictSort: 1,
        dictType: 'informationClassify',
        id: 1111111,
        relatedValue: 'null',
        sourceName: I18N.workbench.informationClassification,
        sourceType: 'informationClassify',
      },
    ]);
    list.length && setCurrentRadio(list[0].dictValue);
    syncCallbackFn();
  };
  useEffect(() => {
    getDictData();
  }, []);

  return (
    <Page
      styles={{
        background: '#f7f8f9',
      }}
      breadCrumbs={[
        {
          title: I18N.workbench.workbench,
          key: I18N.workbench.workbench,
          href: RouteMaps.workIndex,
        },
        {
          title: I18N.workbench.lowCarbonInformation,
          key: I18N.workbench.lowCarbonInformation,
          href: ``,
        },
      ]}
    >
      <div className={style.informationListBox} id='box'>
        <Radio.Group
          onChange={onChangeRadio}
          value={currentRadio}
          // size='middle'
        >
          {classifyList?.map(item => (
            <Radio.Button value={item.dictValue}>{item.dictLabel}</Radio.Button>
          ))}
        </Radio.Group>
        {currentRadio === '135' ? (
          <div className={style.productListBox}>
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
        ) : (
          informationList.map(item => (
            <div
              className={style.infomationItem}
              onClick={() => {
                history.push(
                  `${RouteMaps.informationDetail}?informationMessageId=${item.informationMessageId}`,
                );
              }}
            >
              <img className={style.poster} src={item.titleUrl} alt='' />
              <div className={style.infoBox}>
                <p className={style.tit}>{item.title}</p>
                {/* <p className={style.desc}>{item.mainKeyword}</p> */}
                <div className={style.bottomBox}>
                  <div className={style.sorce}>
                    {I18N.carbonFootprint.source}
                    {item.source}
                  </div>
                  <div className={style.time}>
                    {I18N.workbench.time}
                    {item.createTime}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <PageBar
        domId='box'
        pageOptions={page}
        onChange={onChange}
        reset={currentRadio}
      />
    </Page>
  );
};

export default InformationList;
