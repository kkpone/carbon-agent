import useUrlState from '@ahooksjs/use-url-state';
import carbonCoin from '@src/assets/svg/accountProductImg.svg';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { useRequest } from 'ahooks';
import { Spin } from 'antd';
import classNames from 'classnames';
import { ceil, divide } from 'lodash-es';
import { ReactNode, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import style from './index.module.less';
import { getProductListData, getProductListInfoData } from './service';
import {
  ProductListData,
  ProductListInfoData,
  ProductListParams,
} from './types';
import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION,
  FootprintAccountStatusType,
} from '../../../FootprintAccount/constant';
import TextWidthOverflow from '../../../component/TextOverflowTable/byWidth';
import { CompareDetail } from '../CompareDetail';
import { EmptySelect } from '../EmptySelect';

const { QUICK } = FootprintAccountStatusType;
export const CompareCards = (props: {
  refreshDetail?: () => void;
  isDetail?: boolean;
}) => {
  const history = useHistory();
  const { refreshDetail, isDetail } = props;

  const [state, setState] = useUrlState({
    id: null,
    compareId: null,
  });
  const { id, compareId } = state;

  /** 对比产品的id */
  const [compareLeftId, setCompareLeftId] = useState<
    number | string | undefined
  >();
  const [compareRightId, setCompareRightId] = useState<
    number | string | undefined
  >();

  /** 对比报告左侧 */
  const [compareLeftInfo, setCompareLeftInfo] = useState<ProductListInfoData>();
  /** 对比报告右侧 */
  const [compareRightInfo, setCompareRightInfo] =
    useState<ProductListInfoData>();

  /** 对比详情后的差异值 - 要在1上面展示 */
  const [contrast, setContrast] = useState<number>();
  const [contrastStatus, setContrastStatus] = useState<'up' | 'down'>();

  const [compareIdsInfo1Loading, setCompareIdsInfo1Loading] = useState(false);
  const [compareIdsInfo2Loading, setCompareIdsInfo2Loading] = useState(false);

  /**
   * 设置核算下拉的每一项node元素
   * @param row 每一项的展示
   * @returns 返回dom元素
   */
  const listNode = (row: ProductListData): ReactNode => (
    <div className='optionNodeMain'>
      <div className='optionNodeMainImg'>
        <img src={row.productPic || carbonCoin} alt='' />
      </div>
      <div className='optionNodeMainText'>
        <div className='optionNodeMainTextTitle'>
          <TextWidthOverflow width={150} value={row.productName} />
        </div>
        <div className='optionNodeMainTextSubtitle'>
          <TextWidthOverflow width={150} value={row.accountName} />
        </div>
      </div>
      <div className='optionNodeMainDate'>
        <div
          className={`optionNodeType ${
            row.type === QUICK ? 'optionNodeTypeQuick' : 'optionNodeTypeProcess'
          }`}
        >
          {FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION[row.type]}
        </div>
        <div className='optionNodeDate'>
          {row.startTime}
          {I18N.carbonFootprint.to}
          {row.endTime}
        </div>
      </div>
    </div>
  );

  /** 查询逻辑 */
  const [params] = useState<ProductListParams>({
    pageNum: 1,
    pageSize: 1000,
  });
  const getProductList = async (pageParams?: ProductListParams) => {
    const { data } = await getProductListData(pageParams || params);
    return data.data.rows.map(row => ({
      ...row,
      accountNameNode: listNode(row),
    }));
  };

  /**
   * @description: 获取产品详情
   * @param {number} id 产品id
   */
  const getProductListInfo = async (paramsId: number) => {
    const { data } = await getProductListInfoData({ id: paramsId });
    return data.data.detail;
  };

  /**
   * @description: 选择产品
   * @param {1} key 选择产品的关键下标
   * @param {number} id 选中产品的id
   */
  const changeProduct = async (
    key: 1 | 2,
    productId: number,
    refresh?: boolean,
  ) => {
    const data = await getProductListInfo(productId);
    if (key === 1) {
      setCompareLeftInfo(data);
      setCompareLeftId(productId);
      setState({ id: productId });
    } else {
      setCompareRightInfo(data);
      setCompareRightId(productId);
      setState({ compareId: productId });
    }

    if (refresh) {
      /**
       * ids 是通过 url 参数传递的，所以需要延迟一下再刷新
       */
      setTimeout(() => {
        refreshDetail?.();
      }, 400);
    }
  };

  /**
   * 清除目标产品
   */
  const clearLeftSelect = () => {
    setCompareLeftInfo(undefined);
    setCompareLeftId(undefined);
    sessionStorage.removeItem('compareLeft');
  };

  /**
   * 清除基准产品
   */
  const clearRightSelect = () => {
    setCompareRightInfo(undefined);
    setCompareRightId(undefined);
    sessionStorage.removeItem('compareRight');
  };

  /**
   * @description:产品列表的下拉框
   */
  const { data } = useRequest(getProductList, {
    manual: false,
  });

  const changeProdBtn = (noWrapper?: boolean) => (
    <EmptySelect<string | number>
      selectName={I18N.carbonFootprint3.selectTargetProduct}
      value={compareLeftId}
      options={(data || []).filter(op => {
        if (compareRightInfo) {
          return (
            op.type === compareRightInfo.account.type &&
            op.id !== compareRightInfo.account.id
          );
        }
        return true;
      })}
      noWrapper={noWrapper}
      onChange={async val => {
        try {
          setCompareIdsInfo1Loading(true);
          await changeProduct(1, Number(val), true);
          sessionStorage.setItem('compareLeft', `${val}`);
        } finally {
          setCompareIdsInfo1Loading(false);
        }
      }}
      onClear={clearLeftSelect}
    />
  );

  const changeProdBtn2 = (noWrapper?: boolean) => (
    <EmptySelect<string | number>
      selectName={I18N.carbonFootprint3.selectBenchmarkProduction}
      value={compareRightId}
      options={(data || []).filter(op => {
        if (compareLeftInfo) {
          return (
            op.type === compareLeftInfo.account.type &&
            op.id !== compareLeftInfo.account.id
          );
        }
        return true;
      })}
      noWrapper={noWrapper}
      onChange={async val => {
        try {
          setCompareIdsInfo2Loading(true);
          await changeProduct(2, Number(val), true);
          sessionStorage.setItem('compareRight', `${val}`);
        } finally {
          setCompareIdsInfo2Loading(false);
        }
      }}
      onClear={clearRightSelect}
    />
  );

  useEffect(() => {
    // 如果选择了两个产品后
    if (compareLeftInfo && compareRightInfo) {
      const val1 = Number(compareLeftInfo.card.emissionTotal) * 1000000;
      const val2 = Number(compareRightInfo.card.emissionTotal) * 1000000;
      const contrastData = divide(val1 || 1, val2 || 1) - 1;
      const ceilData = val2 === 0 ? 0 : ceil(contrastData, 2);
      if (ceilData > 0) {
        setContrastStatus('up');
        setContrast(ceilData || undefined);
      } else {
        setContrastStatus('down');
        setContrast(ceilData === 0 ? undefined : ceilData * -1);
      }
    }
  }, [compareLeftInfo, compareRightInfo]);

  const init = async () => {
    if (id && compareId) {
      const letfId = id;
      const rightId = compareId;

      if (letfId) {
        try {
          setCompareIdsInfo2Loading(true);
          await changeProduct(1, Number(letfId));
        } finally {
          setCompareIdsInfo2Loading(false);
        }
      }

      if (rightId) {
        try {
          setCompareIdsInfo2Loading(true);
          await changeProduct(2, Number(rightId));
        } finally {
          setCompareIdsInfo2Loading(false);
        }
      }
    }
  };

  useEffect(() => {
    if (data) {
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className={style.wrapper}>
      <main>
        <section className={style.left}>
          <Spin spinning={compareIdsInfo1Loading}>
            {!compareLeftId ? (
              changeProdBtn()
            ) : (
              <CompareDetail
                primaryColor='#64DBC5'
                contrast={contrast}
                contrastStatus={contrastStatus}
                detail={compareLeftInfo}
                changeProdBtn={changeProdBtn(true)}
              />
            )}
          </Spin>
        </section>
        <section className={style.right}>
          <Spin spinning={compareIdsInfo2Loading}>
            {!compareRightId ? (
              changeProdBtn2()
            ) : (
              <CompareDetail
                detail={compareRightInfo}
                primaryColor='#5EAFFF'
                isRight
                changeProdBtn={changeProdBtn2(true)}
              />
            )}
          </Spin>
        </section>
        <div
          className={classNames(style.startCompare, {
            [style.enable]: !isDetail && compareLeftId && compareRightId,
            [style.detailStart]: isDetail,
          })}
          onClick={() => {
            if (isDetail) {
              return;
            }
            if (compareLeftId && compareRightId) {
              history.push(
                `${RouteMapsCorbonFootprint3.carbonFootprint3DatasCompareDetail}?id=${compareLeftId}&compareId=${compareRightId}`,
              );
            }
            refreshDetail?.();
          }}
        >
          {!isDetail && compareLeftId && compareRightId ? 'GO' : 'VS'}
        </div>
      </main>
    </div>
  );
};
