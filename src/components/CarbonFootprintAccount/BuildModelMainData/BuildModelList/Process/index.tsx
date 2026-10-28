import { PROCESS_TAB_KEYS } from '@src/views/carbonFootprint3/discharge/process/constant';
import { useRequest } from 'ahooks';
import { cloneDeep } from 'lodash-es';
import { FC, Key, memo, useState } from 'react';

import { ProcessMenuList } from './Menu';
import { BuildModelListProcessTable } from './ProcessTable';
import style from './index.module.less';
import { getProcessProcessMenu, postProcessNextMenu } from './service';
import { ProcessAccounMenu, ProcessBuildListProps } from './type';

const { IN_OUT } = PROCESS_TAB_KEYS;

export const ProcessBuildList: FC<ProcessBuildListProps> = memo(
  ({
    accountInfo,
    isDetail,
    apiExtraParams,
    updateAccountInfo,
    editAccount,
    enableFactorSourceRange,
  }) => {
    const { id } = accountInfo;
    /** 左侧tree拖拽 */
    const [currentWidth, setCurrentWidth] = useState(320);

    /** 选中菜单信息 */
    const [menuInfo, setMenuInfo] = useState<ProcessAccounMenu>();

    /** 展开节点 */
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

    /** 当前选中的key */
    const [selectKey, setSelectKey] = useState<Key[]>();

    /** 选中 - 父级 - 菜单信息 */
    const [parentMenuInfo, setParentMenuInfo] = useState<ProcessAccounMenu>();

    /**
     * 拖拽左侧菜单
     * @param changeWidth 改变的宽度
     */
    const changeCurrentWidth = (changeWidth: number) => {
      setCurrentWidth(changeWidth);
    };

    /**
     * @description: 根据接口返回的menus数据转换成菜单需要的类型
     */
    const transformMenuInitInfo = (
      apiData: ProcessAccounMenu,
    ): ProcessAccounMenu[] => {
      const { name, id, children } = apiData;

      const dataNode: ProcessAccounMenu[] = [
        {
          ...apiData,
          title: name,
          key: id,
          children: [],
        },
      ];

      if (children && children.length > 0) {
        dataNode[0].children = children.map(child => ({
          ...child,
          title: child.name,
          key: child.id,
          children: child.children?.map(cChild => ({
            ...cChild,
            title: cChild.name,
            key: cChild.id,
            children: [],
          })),
        }));
        return dataNode;
      }
      return [];
    };

    /**
     * 核算菜单列表
     */
    const getAccountLis = async () => {
      const { data } = await getProcessProcessMenu({ ...apiExtraParams, id });
      const menusData = transformMenuInitInfo(data.data);
      // 将接口的完整树形信息存储到缓存中，每次都需要完善最新的
      sessionStorage.setItem('processAccountTree', JSON.stringify(menusData));
      const parentInfo = menusData[0];
      setSelectKey([parentInfo.id]);
      setExpandedKeys([menusData[0].id]);
      setMenuInfo(parentInfo);
      return menusData;
    };
    const {
      data: menuApiData,
      loading: treeLoading,
      mutate,
    } = useRequest(getAccountLis, { refreshDeps: [accountInfo] });

    /**
     * 递归处理菜单展开的子级
     * @param keys 被展开的树形key
     * @param info 被收起的key
     * @returns 过滤被收起的所有子级
     */
    const recursionExpandedKeysChilds = (
      keys: Key[],
      info: ProcessAccounMenu,
    ) => {
      let letKeys: Key[] = keys;
      if (info.children) {
        info.children.forEach(infoChild => {
          if (keys.includes(infoChild.id)) {
            letKeys = letKeys.filter(menuKey => menuKey !== infoChild.id);
          }

          if (infoChild.children && infoChild.children.length > 0) {
            letKeys = recursionExpandedKeysChilds(letKeys, infoChild);
          }
        });
      }

      return letKeys;
    };

    /**
     * @description: 通过id找到完整的api接口信息
     * @param {number} id tree的唯一标识
     * @param {ProcessAccounMenu[]} treeData 传递完整的树形
     * @return {ProcessAccounMenu}
     */
    const getTreeApiInfo = (
      id: string,
      treeData?: ProcessAccounMenu[],
    ): ProcessAccounMenu[] => {
      const sessionTreeData = sessionStorage.getItem('processAccountTree');
      const nowTreeData: ProcessAccounMenu[] = treeData || [
        JSON.parse(sessionTreeData || ''),
      ];

      let findTreeData: ProcessAccounMenu[] = [];

      nowTreeData.every(data => {
        if (data.id === id) {
          findTreeData = [data];
          return false;
        }

        if (findTreeData.length === 0 && data.children) {
          findTreeData = getTreeApiInfo(id, data.children);
        }
        return true;
      });

      return findTreeData;
    };

    /**
     * @description: 选中菜单
     */
    const selectTreeNode = (node: ProcessAccounMenu) => {
      setMenuInfo(node);
      setSelectKey([node.id]);

      if (node.parentId !== '0') {
        const parentTreeInfo = getTreeApiInfo(node.parentId, menuApiData);

        if (parentTreeInfo) {
          setParentMenuInfo(parentTreeInfo[0]);
        }
      } else {
        setParentMenuInfo(undefined);
      }
    };

    /**
     * @description: 根据指定的id，前往修改父级的子级信息
     * @param {string} id 父级的id
     * @param {ProcessAccounMenu} treeData 需要替换的父级children
     * @return {ProcessAccounMenu[]} 被替换过子级的树形
     */
    const changeParentChildren = (
      id: string,
      apiTreeData: ProcessAccounMenu[],
      treeData: ProcessAccounMenu[] = [],
    ) => {
      treeData.every(data => {
        if (data.id === id) {
          data.children = apiTreeData;
          return false;
        }

        if (data.children) {
          changeParentChildren(id, apiTreeData, data.children);
        }
        return true;
      });

      return treeData;
    };

    /**
     * @description: 需要前往更新最新的父级树形节点
     */
    const updateTreeNode = async (info: ProcessAccounMenu) => {
      const data = await postProcessNextMenu({ ...apiExtraParams, ...info });
      const menusData = changeParentChildren(
        info.id,
        data.data.data,
        menuApiData,
      );
      // 将接口的完整树形信息存储到缓存中，每次都需要完善最新的
      sessionStorage.setItem('processAccountTree', JSON.stringify(menusData));

      const menusDataClone = cloneDeep(menusData);
      mutate(menusDataClone);

      // 更新accountInfo
      updateAccountInfo();
    };

    const onUpdateClickBack = async () => {
      if (menuInfo) {
        // 因为过程库的根节点可以编辑
        const getParnet = getTreeApiInfo(menuInfo.parentId, menuApiData);

        // 过程核算功能单位不需要更新树形
        if (menuInfo.parentId !== '0') {
          const parentMenuData = getParnet[0];
          /** 更新左侧树形菜单 */
          await updateTreeNode(parentMenuData);
        }
      }
    };
    return (
      <div className={style.ProcessAccountListMain}>
        {menuApiData && menuInfo && selectKey && (
          <ProcessMenuList
            treeLoading={treeLoading}
            currentWidth={currentWidth}
            changeCurrentWidth={changeCurrentWidth}
            selectKey={selectKey}
            defaultExpandedKeys={expandedKeys}
            treeMenus={menuApiData}
            selectTreeNode={selectTreeNode}
            updateTreeNode={updateTreeNode}
            recursionExpandedKeysChilds={recursionExpandedKeysChilds}
            accountInfo={accountInfo}
            editAccount={editAccount}
          />
        )}

        <div
          className={style.businessAccountRight}
          style={{
            width: `calc(100% - ${currentWidth}px)`,
            padding: ' 12px 0 0 0 ',
          }}
        >
          {menuInfo && (
            <BuildModelListProcessTable
              apiExtraParams={apiExtraParams}
              isOnlyDetail={isDetail}
              isEdit={!isDetail}
              parentMenuInfo={parentMenuInfo}
              processTabUrlKey={IN_OUT}
              accountInfo={accountInfo}
              currentWidth={currentWidth}
              menuInfo={menuInfo}
              updateTreeNode={updateTreeNode}
              onUpdateMenuClickBack={onUpdateClickBack}
              enableFactorSourceRange={enableFactorSourceRange}
            />
          )}
        </div>
      </div>
    );
  },
);
