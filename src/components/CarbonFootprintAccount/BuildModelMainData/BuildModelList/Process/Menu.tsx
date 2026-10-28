import dateImg from '@assets/svg/carbonFootprint/graph/date.svg';
import defaultImg from '@src/assets/svg/accountProductImg.svg';
import CustResizable from '@src/components/Resizable';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { Image, Spin, Tree } from 'antd';
import { FC, Key, memo, useState } from 'react';

import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL,
  FootprintAccountStatusType,
} from '@/views/carbonFootprint3/FootprintAccount/constant';

import style from './index.module.less';
import { ProcessAccounMenu, ProcessListMenuProps } from './type';

export const ProcessMenuList: FC<ProcessListMenuProps> = memo(
  ({
    accountInfo,
    treeLoading,
    currentWidth,
    selectKey,
    treeMenus,
    defaultExpandedKeys,
    selectTreeNode,
    recursionExpandedKeysChilds,
    changeCurrentWidth,
    updateTreeNode,
    editAccount,
  }) => {
    /** 展开节点 */
    const [expandedKeys, setExpandedKeys] =
      useState<Key[]>(defaultExpandedKeys);

    const titleRender = (nodeData: ProcessAccounMenu) => (
      <TextWidthOverflow value={nodeData.name} width={currentWidth - 50} />
    );

    const { productPic, accountName, emissionTotal } = accountInfo;

    return (
      <div className={style.processMenu} style={{ marginBottom: 0 }}>
        <div className={style.treeProcessUtilMain}>
          <CustResizable
            defaultPropsWidth={currentWidth}
            // eslint-disable-next-line react/no-unstable-nested-components
            childRender={() => (
              <Spin spinning={treeLoading}>
                <div className={style.businessAccountTreeMain}>
                  <div className={style.accountInfo}>
                    <div className={style.accountInfoRow}>
                      <Image
                        width={40}
                        height={40}
                        src={productPic || defaultImg}
                      />
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
                        <IconAlibaba type='icon-icon_qiehuanzhikeshihua' />
                        <div className={style.tagText}>
                          {
                            FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL[
                              FootprintAccountStatusType.PROCESS
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
                    <div className={style.accountInfoRow}>
                      <img alt='' src={dateImg} />
                      <div className={style.accountDate}>
                        {accountInfo.startTime} ~ {accountInfo.endTime}
                      </div>
                    </div>
                    <div className={style.accountInfoRow}>
                      <div
                        className={style.accountEmission}
                        title={`${emissionTotal}`}
                      >
                        {emissionTotal}
                      </div>
                      <div className={style.accountUnit}>kgCO₂e</div>
                    </div>
                  </div>
                  <Tree<ProcessAccounMenu>
                    selectedKeys={selectKey}
                    treeData={treeMenus}
                    expandedKeys={expandedKeys}
                    onExpand={async (keys, info) => {
                      const { expanded } = info;

                      // 收起
                      if (expanded === false) {
                        const expandRSKey = recursionExpandedKeysChilds(
                          keys,
                          info.node,
                        );
                        setExpandedKeys(expandRSKey);
                        return;
                      }

                      // 展开
                      setExpandedKeys(keys);
                      if (keys.length > 0) {
                        await updateTreeNode(info.node);
                      }
                    }}
                    onSelect={(keys, info) => {
                      if (!keys || keys.length === 0) return;
                      selectTreeNode(info.selectedNodes[0]);
                    }}
                    fieldNames={{
                      title: 'name',
                      key: 'id',
                    }}
                    titleRender={titleRender}
                  />
                </div>
              </Spin>
            )}
            resizableCurrentSize={({ width }) => {
              changeCurrentWidth(width);
            }}
          />
        </div>
      </div>
    );
  },
);
