import I18N from '@src/lang/I18N';
import { Empty, Spin } from 'antd';
import { useInfiniteScroll } from 'ahooks';
import { useRef } from 'react';

import { getModelList } from '../../service';
import { ModelItem, ModelListParams } from '../../type';
import ModelCard from '../ModelCard';
import style from './index.module.less';

interface CardViewProps {
  searchParams: ModelListParams;
  onEdit: (item: ModelItem) => void;
  onCopy: (item: ModelItem) => void;
  onDelete: (item: ModelItem) => void;
  onViewInfo: (item: ModelItem) => void;
  onCreateAccounting: (item: ModelItem) => void;
}

const PAGE_SIZE = 12;

type CardInfiniteData = {
  list: ModelItem[];
  total: number;
  currentPage: number;
  pageSize: number;
};

/** 纯函数：列表分页请求（不含组件状态） */
function fetchModelListPage(
  searchParams: ModelListParams,
  pageNum: number,
  pageSize: number,
) {
  const sp = searchParams;
  return getModelList({
    ...sp,
    pageNum,
    pageSize,
    industry: sp.industry === 'all' ? undefined : sp.industry,
  });
}

const CardView: React.FC<CardViewProps> = ({
  searchParams,
  onEdit,
  onCopy,
  onDelete,
  onViewInfo,
  onCreateAccounting,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, loading, loadingMore } = useInfiniteScroll<CardInfiniteData>(
    async d => {
      const pageNum = (d?.currentPage ?? 0) + 1;
      const { data: res } = await fetchModelListPage(
        searchParams,
        pageNum,
        PAGE_SIZE,
      );
      const rows = res?.data?.rows || [];
      const total = res?.data?.total || 0;
      return {
        list: rows,
        total,
        currentPage: pageNum,
        pageSize: PAGE_SIZE,
      };
    },
    {
      target: scrollRef,
      isNoMore: d =>
        typeof d?.currentPage === 'number' &&
        typeof d?.pageSize === 'number' &&
        typeof d?.total === 'number'
          ? d.currentPage * d.pageSize >= d.total
          : false,
      reloadDeps: [searchParams],
      threshold: 200,
    },
  );

  const modelList = data?.list ?? [];
  const showEmpty = !loading && modelList.length === 0;

  return (
    <div className={style.cardViewRoot}>
      <div className={style.spinWrap}>
        <Spin spinning={loading}>
          {showEmpty ? (
            <div className={style.emptyWrapper}>
              <Empty
                description={
                  I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable
                }
              />
            </div>
          ) : (
            <div className={style.cardListScroll} ref={scrollRef}>
              <div className={style.cardGrid}>
                {modelList.map(item => (
                  <ModelCard
                    key={item.id}
                    item={item}
                    onEdit={onEdit}
                    onCopy={onCopy}
                    onDelete={onDelete}
                    onViewInfo={onViewInfo}
                    onCreateAccounting={onCreateAccounting}
                  />
                ))}
              </div>
              {loadingMore ? (
                <div className={style.loadingMore}>
                  <Spin size='small' />
                </div>
              ) : null}
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default CardView;
