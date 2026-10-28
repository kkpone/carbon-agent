/*
 * @@description: 左侧卡片
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-23 10:03:28
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-15 16:18:49
 */
import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { useInfiniteScroll, useRequest } from 'ahooks';
import { Input, Spin } from 'antd';
import classNames from 'classnames';
import { uniqueId } from 'lodash-es';
import { memo, useEffect, useRef, useState } from 'react';

import style from './index.module.less';
import { getDatasFiltrateList } from './service';
import { DatasFiltrateListScrollData } from './type';
import { DATAS_TYPE_LABEL, DatasTypeValue } from '../../constant';
import { DatasFiltrateListData } from '../../type';

type Props = {
  clickCard: (id?: number) => void;
  info?: DatasFiltrateListData;
  accountId?: number;
};

const PAGE_SIZE = 10;
export const Cards = memo(({ clickCard, accountId, info }: Props) => {
  /** 当前选中的tab */
  const [actFilter, setActFilter] = useState<number | undefined>(undefined);

  /** 查询收入框的内容 */
  const [inputValue, setInputValue] = useState<string>();

  /** 选中的id */
  const [actCard, setActCard] = useState<number | undefined>(accountId);

  const listCard = useRef<HTMLDivElement>(null);

  /**
   * @description:获取列表的data
   */
  const getData = async (pageNum: number) => {
    const newParams = {
      pageNum,
      pageSize: PAGE_SIZE,
      productName: inputValue,
      type: actFilter,
    };

    const { data } = await getDatasFiltrateList(newParams);

    /** 只在初始化的时候设置默认的第一条数据 */
    if (!accountId) {
      const dataId =
        data.data.rows && data.data.rows.length > 0
          ? data.data.rows[0].id
          : undefined;
      setActCard(dataId);
      clickCard(dataId);
    }

    let { rows } = data.data;
    // 如果当前有激活的id，在后续的请求中重新查到，将不再激活
    // inputValue 有值的时候才做去除，清空输入后不再处理
    if (actCard && newParams.productName) {
      rows = rows.filter(rowInfo => rowInfo.id !== actCard);
    }

    return {
      list: rows,
      currentPage: pageNum,
      isNoMore: pageNum * PAGE_SIZE >= data.data.total,
    };
  };

  /** 列表数据请求 */
  const { data, loading, loadingMore, noMore, mutate } =
    useInfiniteScroll<DatasFiltrateListScrollData>(
      d => {
        const page = d ? Math.ceil(d.list.length / PAGE_SIZE) + 1 : 1;
        return getData(page);
      },
      {
        target: listCard,
        isNoMore: d => d?.isNoMore || false,
        reloadDeps: [actFilter, inputValue],
      },
    );

  /**
   * @description: 切换type
   * @param {number} type 选中的类型
   */
  const changeListTag = (type?: number) => {
    setActFilter(type);
  };

  /**
   * @description: 防抖 - 输入后 500毫秒后执行该方法
   * @param {string} val 输入框 输入的值
   */
  const debounceInputValue = async (val?: string) => {
    setInputValue(val);
  };

  /**
   * @description: ahooks 防抖方法
   */
  const { run: runDebounce } = useRequest(debounceInputValue, {
    debounceWait: 500,
    manual: true,
  });

  useEffect(() => {
    if (info && info.id !== actCard && data?.list) {
      const top7List = data?.list.filter((d, dIndex) => dIndex < 7);
      const topActiveInfo = top7List?.find(top7 => top7.id === info.id);
      // 如果前7个有的话就直接激活,没有的话就准备将数据放到第一个
      if (topActiveInfo) {
        setActCard(topActiveInfo.id);
      } else {
        const newList = {
          ...data,
          list: [
            info,
            ...data.list.filter(dataList => dataList.id !== info.id),
          ],
        };
        setActCard(info.id);
        mutate(newList);
      }
    }
  }, [info]);

  return (
    <div className={style.wrapper}>
      <div className={style.top}>
        <Input
          allowClear
          className={style.search}
          onChange={e => {
            runDebounce(e.target.value);
          }}
          prefix={<SearchOutlined className={style.searchIcon} />}
          placeholder={I18N.carbonFootprint3.pleaseEnterTheProduct2}
        />
        <div className={style.filters}>
          <div
            className={classNames(
              { [style.active]: actFilter === undefined },
              style.filterItem,
            )}
            onClick={() => changeListTag(undefined)}
          >
            {I18N.carbonFootprint3.whole}
          </div>
          <div
            className={classNames(
              { [style.active]: actFilter === 0 },
              style.filterItem,
            )}
            onClick={() => changeListTag(0)}
          >
            {I18N.carbonFootprint3.quickAccounting}
          </div>
          <div
            className={classNames(
              { [style.active]: actFilter === 1 },
              style.filterItem,
            )}
            onClick={() => changeListTag(1)}
          >
            {I18N.carbonFootprint3.processAccounting}
          </div>
        </div>
      </div>
      <div className={style.bottom} ref={listCard}>
        {loading ? (
          <div className={style.bottomLoading}>
            <Spin />
          </div>
        ) : (
          data?.list.map(d => (
            <div
              className={classNames(style.card, {
                [style.active]: actCard === d.id,
              })}
              key={uniqueId(`${d.id}`)}
              onClick={() => {
                setActCard(d.id);
                clickCard(d.id);
              }}
            >
              <div className={style.cardTitle}>
                <TextWidthOverflow
                  className={style.cardProductName}
                  width={140}
                  value={d.productName}
                />
                <span
                  className={classNames(style.tag, {
                    [style.tagProcess]: d.type === DatasTypeValue.PROCESS,
                  })}
                >
                  {DATAS_TYPE_LABEL[d.type]}
                </span>
              </div>
              <TextWidthOverflow
                className={style.cardAccountName}
                width={200}
                value={d.accountName}
              />
              <div className={classNames(style.date, style.row)}>
                {d.startTime}
                {I18N.carbonFootprint.to}
                {d.endTime}
              </div>
            </div>
          ))
        )}
        {loadingMore && <Spin />}
        {noMore && (
          <div className={style.noMore}>
            {I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable}
          </div>
        )}
      </div>
    </div>
  );
});
