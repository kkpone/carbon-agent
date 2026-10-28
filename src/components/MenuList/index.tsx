import I18N from '@src/lang/I18N';
import dateImg from '@assets/svg/carbonFootprint/graph/date.svg';
import { QUICK_ACCOUNT_EMISSION_ICONFONT_MAP } from '@src/views/carbonFootprint3/constant';
import { Button, Image, Spin, Tree } from 'antd';
import { VFC, memo, useState } from 'react';

import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL,
  FootprintAccountStatusType,
} from '@/views/carbonFootprint3/FootprintAccount/constant';

import style from './index.module.less';
import { MenuData, MenuListProps } from './type';
import { IconAlibaba, IconAlibabaNew } from '../iconfont';
import CarbonLabelFormDrawer from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/components/CarbonLabelFormDrawer';
import { getSnapInfoByReportId } from '@/views/Certification/carbonFootprintCertification/certificationProject/component/ApplayCertification/service';
import { getReportScope } from '@/views/carbonFootprint3/Report/Info/service';
import { AddReportModal } from '../AddReportModal';

export const MenuList: VFC<MenuListProps> = memo(
  ({
    accountInfo,
    productInfo: { productPic, accountName, emission, unit },
    treeMenus,
    treeLoading,
    menuValue = [],
    onSelectMenu,
    editAccount,
    reportSnapCode,
    authType,
    hideAccountPeriodAndEmission = false,
  }) => {
    const defaultUnit = unit ?? 'kgCO₂e';

    const [carbonLabelDrawerProps, setCarbonLabelDrawerProps] = useState<{
      open: boolean;
      productReportInfo?: Record<string, any>;
    }>({
      open: false,
    });

    const [reportSnapLoading, setReportSnapLoading] = useState(false);
    /**
     * 格式化菜单Node 添加count数量
     * @param nodeData 每个节点数据
     */
    const treeNodeRender = (nodeData: MenuData) => (
      <div className={style.menuDataTextCount}>
        {nodeData.type && (
          // <img
          //   className={style.menuDataImg}
          //   src={QUICK_ACCOUNT_EMISSION_ICON_MAP[nodeData.type]}
          //   alt='排放源icon'
          // />
          <IconAlibaba
            type={QUICK_ACCOUNT_EMISSION_ICONFONT_MAP[nodeData.type].icon}
            size={20}
            style={{
              color: QUICK_ACCOUNT_EMISSION_ICONFONT_MAP[nodeData.type].color,
              marginRight: 4,
            }}
          />
        )}

        {/* <TextWidthOverflow width={140} value={nodeData.name} /> */}
        <div
          className={style.menuName}
          style={{
            maxWidth: treeMenus?.some(item => item.id === nodeData.id)
              ? 130
              : 90,
          }}
          title={nodeData.name}
        >
          {nodeData.name}
        </div>
        <span className={style.menuCount}>{nodeData.count}</span>
      </div>
    );

    /**
     * 点击目标菜单返回
     * @param menuData 选中的菜单
     */
    const onSelect = (menuData: MenuData) => {
      onSelectMenu(menuData);
    };

    const isCarbonLabelCert = authType === '3' && reportSnapCode;
    const isProductCert = authType === '0' && reportSnapCode;
    return (
      <div className={style.menuList}>
        <div className={style.accountInfo}>
          <div className={style.accountInfoRow}>
            <Image width={40} height={40} src={productPic} />
            <div className={style.accountName} title={accountName}>
              {accountName}
            </div>
            <IconAlibabaNew
              className={style.editBtn}
              type='icon-account-edit'
              onClick={editAccount}
            />
          </div>
          <div className={style.accountInfoRow}>
            <div className={style.accountTypeTag}>
              <IconAlibaba type='icon-icon_kuaisu' />
              <div className={style.tagText}>
                {
                  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL[
                    FootprintAccountStatusType.QUICK
                  ]
                }
              </div>
            </div>
            <div className={style.accountLifecycleTag}>
              <div className={style.tagText}>
                {ACCOUNT_SELECT_LIFE_CYCLE_LABEL[accountInfo.scope]}
              </div>
            </div>
          </div>
          {!hideAccountPeriodAndEmission && (
            <>
              <div className={style.accountInfoRow}>
                <img alt='' src={dateImg} />
                <div className={style.accountDate}>
                  {accountInfo.startTime} ~ {accountInfo.endTime}
                </div>
              </div>
              <div className={style.accountInfoRow}>
                <div className={style.accountEmission} title={`${emission}`}>
                  {emission}
                </div>
                <div className={style.accountUnit}>{defaultUnit}</div>
              </div>
            </>
          )}
        </div>

        <div className={style.menuMain}>
          <div className={style.treeMenuMain}>
            <Spin spinning={treeLoading}>
              <Tree<MenuData>
                onSelect={(keys, info) => {
                  onSelect(info.selectedNodes[0]);
                }}
                selectedKeys={menuValue}
                fieldNames={{
                  title: 'name',
                  key: 'id',
                }}
                titleRender={treeNodeRender}
                treeData={treeMenus}
              />
            </Spin>
          </div>
          <div className={style.reportActions}>
            {isCarbonLabelCert && (
              <Button
                className={style.reportSnapBtn}
                type='primary'
                loading={reportSnapLoading}
                onClick={async () => {
                  setReportSnapLoading(true);
                  const { data } = await getSnapInfoByReportId({
                    snapCode: reportSnapCode,
                  });
                  const productReportInfo = data.data as unknown as Record<
                    string,
                    any
                  >;
                  setCarbonLabelDrawerProps({
                    open: true,
                    productReportInfo: {
                      ...productReportInfo,
                      account: {
                        ...productReportInfo.account,
                        productId: productReportInfo.productName,
                        oldAccountId: productReportInfo.account?.accountName,
                      },
                      reportExtraInfo: {
                        ...productReportInfo.reportExtraInfo,
                        productType:
                          productReportInfo.reportExtraInfo.productTypeName,
                      },
                    },
                  });
                  setReportSnapLoading(false);
                }}
              >
                {I18N.router.viewReport}
              </Button>
            )}
            {isProductCert && (
              <AddReportModal
                snapCode={reportSnapCode}
                readPretty
                submit={() => {}}
              >
                <Button type='primary'>{I18N.router.viewReport}</Button>
              </AddReportModal>
            )}
          </div>
        </div>
        {isCarbonLabelCert && (
          <CarbonLabelFormDrawer
            {...carbonLabelDrawerProps}
            readPretty
            getReportScope={getReportScope}
            onClose={() => setCarbonLabelDrawerProps({ open: false })}
          />
        )}
      </div>
    );
  },
);
