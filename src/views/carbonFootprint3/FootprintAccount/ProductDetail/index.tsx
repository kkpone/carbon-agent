/**
 * 碳足迹核算 - 产品详情页面
 * @returns
 */

import useUrlState from '@ahooksjs/use-url-state';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { useRequest } from 'ahooks';
import { debounce } from 'lodash-es';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { apiListALLByDictTypeData } from '@/views/emission/Show/service';

import { AccountListCard } from './AccountListCard';
import { ProductInfoCard } from './ProductInfoCard';
import style from './index.module.less';
import { AccountProductIdNext } from '../constant';
import { getAccountProductIdNext, getAccountProductInfo } from '../service';
import { AccountProductData } from '../type';

type UrlStateProps = {
  productId: string;
  status: string;
  search: string;
  productTypeName: string;
  isStartList: string;
  isEndList: string;
};

const FootprintAccountProductDetail = () => {
  const history = useHistory();
  /** 页面存储参数 */
  const [urlState, setUrlState] = useUrlState<UrlStateProps>();
  const { data: factorUnitMData } = useRequest(() =>
    apiListALLByDictTypeData({ dictType: 'factorUnitM' }),
  );

  /**
   * 获取产品详情
   * @returns 产品信息
   */
  const getInfo = async () => {
    const { data } = await getAccountProductInfo({ id: urlState.productId });
    return data.data;
  };

  /** 请求产品详情接口 */
  const {
    loading: infoLoading,
    data: info,
    refresh: refreshInfo,
  } = useRequest<AccountProductData, []>(getInfo, {
    refreshDeps: [urlState],
    debounceWait: 300,
  });

  const accountUnitName = useMemo(() => {
    let result = '';
    const factorList = factorUnitMData?.data.data || [];
    factorList.forEach(f => {
      f.enumList?.forEach(e => {
        if (e.dictValue === info?.accountUnitCode) {
          result = e.dictLabel;
        }
      });
    });
    return result;
  }, [factorUnitMData?.data.data, info]);

  /**
   * 切换上一个下一个
   * @param status 区分状态
   * @returns 接口返回值 不存在为null
   */
  const changeNext = async (status: AccountProductIdNext) => {
    const { data } = await getAccountProductIdNext({
      ...urlState,
      right: status,
    });
    if (data.data) {
      // 只要接口调通后  可选状态都会更新为false
      setUrlState({
        ...urlState,
        productId: data.data.id,
        isEndList: 'false',
        isStartList: 'false',
      });
    } else {
      if (status === AccountProductIdNext.BACK) {
        setUrlState({
          ...urlState,
          isStartList: 'true',
        });
      } else {
        setUrlState({
          ...urlState,
          isEndList: 'true',
        });
      }

      Toast(
        'warn',
        status === AccountProductIdNext.BACK
          ? I18N.carbonFootprint3.currentlyItIsAlready2
          : I18N.carbonFootprint3.currentlyItIsAlready,
      );
    }
  };

  /** 防抖函数包裹 */
  const debounceChangeNext = debounce(changeNext, 100);

  /**
   * 切换上一个下一个
   * @param status 上一个 下一个
   * @param id 切换到的id
   */
  const changeProductInfo = async (status: AccountProductIdNext) => {
    debounceChangeNext(status);
  };

  /**
   * 编辑成功后的回调
   */
  const eidtSubForm = async () => {
    refreshInfo();
  };

  /**
   * 点击返回产品列表
   */
  const backList = async () => {
    history.push(
      `${
        RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount
      }?productId=${urlState.productId}&status=${urlState.status || 2}&search=${
        urlState.search || ''
      }&productTypeName=${urlState.productTypeName || ''}`,
    );
  };

  return (
    <div className={style.ProductDetail}>
      <ProductInfoCard
        isStartList={urlState.isStartList}
        isEndList={urlState.isEndList}
        loading={infoLoading}
        info={info}
        accountUnitName={accountUnitName}
        changeProductInfo={changeProductInfo}
        eidtSubForm={eidtSubForm}
        backList={backList}
      />

      <AccountListCard id={urlState.productId} />
    </div>
  );
};

export default FootprintAccountProductDetail;
