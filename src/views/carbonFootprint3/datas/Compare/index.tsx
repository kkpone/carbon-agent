import { RightOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { useRequest, useSize } from 'ahooks';
import { App, Empty, Spin } from 'antd';
import { useMemo, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Toast } from '@/utils';

import emptyImg from './empty.svg';
import style from './index.module.less';
import { deleteCompareInfo, getCompareList } from './service';
import { ProductData } from './types';
import { CompareCards } from '../components/CompareCards';
import CompareCard from '../components/CustomCard';

const Compare = () => {
  const {
    data: compareListData,
    refresh,
    loading,
  } = useRequest(async () =>
    getCompareList({
      pageNum: 1,
      pageSize: 10,
    }),
  );
  const history = useHistory();

  const ref = useRef<HTMLDivElement>(null);
  const size = ref.current?.getBoundingClientRect();
  const bodySize = useSize(document.querySelector('body'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const compareList = useMemo(
    () =>
      compareListData?.data.data.data.slice(
        0,
        size?.width ? Math.floor(size.width / 364) : 0,
      ),
    [compareListData, bodySize, size],
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
      `${RouteMapsCorbonFootprint3.carbonFootprint3DatasCompareDetail}?id=${info.accountId}&compareId=${info.compareAccountId}`,
    );
  };

  return (
    <div className={style.wrapper}>
      <div className={style.titleText}>
        {I18N.carbonFootprint3.productComparison}
      </div>

      <CompareCards />
      <footer>
        <div className={style.footer} ref={ref}>
          <div className={style.footerText}>
            {I18N.carbonFootprint3.historicalProducts}
          </div>
          {!!compareList?.length && (
            <Link
              to={RouteMapsCorbonFootprint3.carbonFootprint3DatasCompareList}
              className={style.more}
            >
              <span>{I18N.components.viewMore}</span>
              <RightOutlined />
            </Link>
          )}
        </div>
        {compareList?.length === 0 && (
          <Empty
            description={
              I18N.carbonFootprint3.noHistoricalProductsAvailableAtTheMoment
            }
            image={<img src={emptyImg} alt='' />}
          />
        )}
        <Spin spinning={loading}>
          <div className={style.compareList}>
            {compareList?.map(item => (
              <CompareCard
                key={item.id}
                info={item}
                onDelete={() => onDelete(item.id)}
                onDetail={() => onDetail(item)}
              />
            ))}
          </div>
        </Spin>
      </footer>
    </div>
  );
};

export default Compare;
