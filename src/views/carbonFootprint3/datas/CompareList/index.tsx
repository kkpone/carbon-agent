import useUrlState from '@ahooksjs/use-url-state';
import I18N from '@src/lang/I18N';
import { useRequest, useSize } from 'ahooks';
import { App, Pagination, Spin } from 'antd';
import { FC, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { PageWrapper } from '@/components/PageWrapper';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { Toast } from '@/utils';

import style from './index.module.less';
import { deleteCompareInfo, getCompareList } from '../Compare/service';
import { ProductData } from '../Compare/types';
import CompareCard from '../components/CustomCard';

export interface ICompareListProps {}

export const CompareList: FC<ICompareListProps> = () => {
  const history = useHistory();

  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);

  const widthNumber = size?.width ? Math.floor(size.width / 364) : 0;
  const heightNumber = size?.height ? Math.floor(size.height / 230) : 0;

  const [state, setState] = useUrlState({ pageNum: '1' });

  const pageSize = widthNumber * heightNumber;

  const {
    data: compareListData,
    refresh,
    loading,
  } = useRequest(
    async () =>
      getCompareList({
        pageNum: state.pageNum,
        pageSize,
      }),
    {
      refreshDeps: [pageSize, state.pageNum],
      ready: !!pageSize,
    },
  );
  const { modal } = App.useApp();
  const onDelete = async (id: number) => {
    modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.carbonFootprint3.confirmToDeleteThis,
      onOk: async () => {
        await deleteCompareInfo({ id });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        refresh();
      },
    });
  };

  const onDetail = (info: ProductData) => {
    history.push(
      `${RouteMapsCorbonFootprint3.carbonFootprint3DatasCompareDetail}?id=${info.accountId}&compareId=${info.compareAccountId}&showListTag=true`,
    );
  };
  return (
    <PageWrapper
      breadCrumbProps={{
        items: [
          {
            title: (
              <Link to={RouteMapsCorbonFootprint3.carbonFootprint3DatasCompare}>
                {I18N.carbonFootprint3.productComparison}
              </Link>
            ),
            href: RouteMapsCorbonFootprint3.carbonFootprint3DatasCompare,
          },
          {
            title: I18N.carbonFootprint3.historicalProducts,
          },
        ],
      }}
    >
      <div className={style.compareList} ref={ref}>
        <div className={style.compareListHeader}>
          {I18N.carbonFootprint3.historicalProducts}
        </div>
        <Spin spinning={loading}>
          <div
            className={style.compareListContent}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${widthNumber}, 1fr)`,
              gridTemplateRows: `repeat(${heightNumber}, 1fr)`,
              gap: '24px',
            }}
          >
            {compareListData?.data.data.data.map(item => (
              <CompareCard
                key={item.id}
                info={item}
                onDelete={() => onDelete(item.id)}
                onDetail={() => onDetail(item)}
              />
            ))}
          </div>
        </Spin>
        <div className={style.compareListFooter}>
          <Pagination
            current={Number(state.pageNum)}
            pageSize={pageSize}
            total={compareListData?.data.data.total}
            onChange={page => setState({ pageNum: page })}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default CompareList;
