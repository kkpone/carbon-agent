/**
 * @@description: 核算下拉
 */
import {
  CaretDownOutlined,
  PlusCircleFilled,
  RightOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { haveAccountEditPermissions } from '@src/views/carbonFootprint3/permissions';
import { useRequest } from 'ahooks';
import { Button, Dropdown, Select, Spin } from 'antd';
import classNames from 'classnames';
import { isEmpty } from 'lodash-es';
import { ReactNode, FC, memo, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import style from './index.module.less';
import './index.less';
import { ProductAccountingList, ProductSelectAccountProps } from './type';
import {
  FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION,
  FootprintAccountInfoUrlStatus,
  FootprintAccountStatusType,
} from '../../constant';
import { getAccountListData } from '../../service';
import { AccountProductDataAccountInfo } from '../../type';
import { BuildModelDescribeSet } from '../AccountInfoBuildModel/constant';

const { QUICK } = FootprintAccountStatusType;
const { EDIT, DETAIL } = FootprintAccountInfoUrlStatus;
const { VISUAL } = BuildModelDescribeSet;

export const ProductSelectAccount: FC<ProductSelectAccountProps> = memo(
  ({ productInfo }) => {
    const history = useHistory();
    // 当前屏幕尺寸
    /** 核算信息 */
    const [accountInfo, setAccountInfo] = useState<
      AccountProductDataAccountInfo | undefined
    >(productInfo?.account);

    /** 是否显示下拉 */
    const [visible, setVisible] = useState(false);

    /**
     * 设置核算下拉的每一项node元素
     * @param row 每一项的展示
     * @returns 返回dom元素
     */
    const listNode = (row: ProductAccountingList): ReactNode => (
      <div className='optionNodeMain'>
        <div>
          <TextWidthOverflow width={160} value={row.accountName} />
        </div>

        <div className='optionNodeDate'>
          {row.startTime}
          {I18N.carbonFootprint.to}
          {row.endTime}
        </div>
        <div
          className={`optionNodeType ${
            row.type === QUICK ? 'optionNodeTypeQuick' : 'optionNodeTypeProcess'
          }`}
        >
          {FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION[row.type]}
        </div>
      </div>
    );

    /**
     * 获取每一项node
     * @param rows 所有的options
     * @returns 设置后的Node
     */
    const setListLabelNode = (
      rows: ProductAccountingList[],
    ): ProductAccountingList[] =>
      rows.map(row => ({
        ...row,
        accountNameNode: listNode(row),
      }));

    /** 获取下拉功能单位列表 */
    const getList = async () => {
      const { data } = await getAccountListData({
        pageNum: 1,
        pageSize: 10000,
        productId: productInfo?.id,
      });
      return setListLabelNode(data.data.rows);
    };

    /** 请求接口 */
    const {
      loading,
      data: dataSource,
      runAsync,
    } = useRequest<ProductAccountingList[], []>(getList, {
      refreshDeps: [],
      manual: true,
    });

    /**
     * 手动触发获取核算列表
     */
    const getListClick = async () => {
      await runAsync();
      setVisible(true);
    };

    /**
     * 开始碳足迹核算 -  新增核算
     */
    const goAddAccount = () => {
      history.push(
        `${
          RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail
        }?productId=${productInfo?.id}&openAdd=${true}`,
      );
    };

    /** 点击前往详情页面 */
    const goAccountListInfo = (list: AccountProductDataAccountInfo) => {
      /** 编辑权限还是查看权限 */
      const Permissions = haveAccountEditPermissions() ? EDIT : DETAIL;

      history.push(
        `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail}?productId=${productInfo?.id}&status=${Permissions}&accountId=${list.id}&stepValue=${list.accountStatus}&listOrGraph=${VISUAL}`,
      );
    };

    useEffect(() => {
      document.addEventListener('click', () => {
        setVisible(false);
      });
      return () => {
        document.removeEventListener('click', () => {
          setVisible(false);
        });
      };
    }, []);

    const accountOver = (
      <div className={classNames(style.cardAccountMainList)}>
        <div className={style.accountTitle}>
          <span>{I18N.carbonFootprint3.productFunctionSheet}</span>
          <Dropdown
            open={visible}
            overlay={
              <div
                className='overlayWrapperAAA'
                onClick={ev => {
                  ev.stopPropagation();
                }}
              >
                <Select
                  loading={loading}
                  showSearch
                  allowClear
                  open
                  fieldNames={{
                    label: 'accountNameNode',
                    value: 'id',
                  }}
                  optionLabelProp='accountName'
                  value={accountInfo?.id}
                  onChange={(ev, opt) => {
                    if (ev && opt) {
                      setAccountInfo(opt as ProductAccountingList);
                      setVisible(false);
                    }
                  }}
                  autoFocus
                  placeholder={I18N.carbonFootprint3.pleaseEnterTheProduct2}
                  filterOption={(input, option) =>
                    (option?.accountName ?? '').includes(input)
                  }
                  getPopupContainer={a => a}
                  options={dataSource}
                />
              </div>
            }
            trigger={['click']}
          >
            <Spin spinning={loading}>
              <div
                className={style.selectAccountName}
                onClick={ev => {
                  ev.stopPropagation();
                  getListClick();
                }}
              >
                <div className={style.selectAccountNameInner}>
                  {accountInfo?.accountName}
                </div>
                <CaretDownOutlined className={style.selectAccountNameIcon} />
              </div>
            </Spin>
          </Dropdown>
        </div>
        <div className={style.accountInfo}>
          <div className={style.infoNameMain}>
            <span className={style.data}>
              {isEmpty(accountInfo?.emissionTotal)
                ? '-'
                : accountInfo?.emissionTotal}
            </span>
            <span className={style.dataUnit}>kgCO₂e</span>
          </div>
          <div className={style.infoAccountData}>
            <span className={style.infoDate}>
              {accountInfo?.startTime}
              {I18N.carbonFootprint.to}
              {accountInfo?.endTime}
            </span>
            <Button
              shape='round'
              className={style.infoDetailBtn}
              onClick={() => {
                if (accountInfo) {
                  goAccountListInfo(accountInfo);
                }
              }}
            >
              {I18N.carbonFootprint3.details}
            </Button>
          </div>
        </div>
      </div>
    );

    const accountNot = (
      <div>
        <div className={style.accountTitle}>
          <span>
            {I18N.carbonFootprint3.pleaseProceedWithCarbonTestingFirst}
          </span>
        </div>
        <div className={style.accountNotInfo} onClick={goAddAccount}>
          <PlusCircleFilled className={style.accountNotInfoIcon} />
          <span className='m-r-4'>
            {I18N.carbonFootprint3.startCarbonFootprint}
          </span>
          <RightOutlined className={style.accountNotInfoIcon} />
        </div>
      </div>
    );

    return (
      <div className={style.cardAccountMain}>
        {accountInfo ? accountOver : accountNot}
      </div>
    );
  },
);
