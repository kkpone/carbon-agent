import I18N from '@src/lang/I18N';
import { InfoCircleOutlined } from '@ant-design/icons';
import Permission from '@src/components/Permission';
import { IconAlibaba } from '@src/components/iconfont';
import { Dropdown, Menu, Tree, Input, Tooltip, Modal } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { difference, isUndefined } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import company from '../../assets/company.svg';
import del from '../../assets/del.svg';
import more from '../../assets/more.svg';
import { OrgInfo, OrgType, deleteOrg } from '../../services';
import { AddOrganization } from '../AddOrganization';

const { Search } = Input;

const treeMaxDepth = 9;

const menu = (
  treeData: OrgInfo[],
  initPid: number,
  refresh: () => void,
  initOrgIndustry: string,
) => (
  <Menu>
    <Menu.Item key={1}>
      <AddOrganization
        initPid={initPid}
        orgType={OrgType.accounting}
        treeData={treeData}
        initOrgIndustry={initOrgIndustry}
        refresh={refresh}
      >
        {I18N.dashborad.addAccountingMaster}</AddOrganization>
    </Menu.Item>
    <Menu.Item key={2}>
      <AddOrganization
        initPid={initPid}
        orgType={OrgType.group}
        treeData={treeData}
        refresh={refresh}
        initOrgIndustry={initOrgIndustry}
      >
        {I18N.dashborad.addGrouping}</AddOrganization>
    </Menu.Item>
  </Menu>
);

function TransformTreeData(
  treeData: OrgInfo[],
  refresh: () => void,
  depth: number,
) {
  return treeData.map(item => ({
    ...item,
    key: item.code,
    depth,
    children: item.children
      ? TransformTreeData(item.children, refresh, depth + 1)
      : [],
  }));
}

interface OrganizationTreeProps {
  onSelect?: (selectedKeys: React.Key[], info: any) => void;
  selectedKeys?: React.Key[];
  treeData: OrgInfo[];
  refresh: () => void;
}

const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const renderCompanyTitle = (
  name,
  treeData,
  code,
  refresh,
  expandedKeys,
  setExpandedKeys,
  initOrgIndustry,
  allExpandedKeys,
) => {
  const canExpand = allExpandedKeys.length > expandedKeys.length;
  return (
    <div className={styles.companyTitleWrapper}>
      <div className={styles.info}>
        <Tooltip overlay={canExpand ? I18N.dashborad.clickToExpand : I18N.dashborad.clickToCollapse}>
          <div
            className={styles.logo}
            onClick={e => {
              e.stopPropagation();
              if (canExpand) {
                setExpandedKeys(allExpandedKeys);
              } else {
                setExpandedKeys([code]);
              }
            }}
          >
            <img src={company} alt='' />
          </div>
        </Tooltip>
        <div className={styles.name}>{name}</div>
      </div>
      <Permission flag='management:companyOrg:add'>
        <div className={styles.more} onClick={e => e.stopPropagation()}>
          <Dropdown overlay={menu(treeData, code, refresh, initOrgIndustry)}>
            <img src={more} alt='' />
          </Dropdown>
        </div>
      </Permission>
    </div>
  );
};

const renderOrgTitle = (params: {
  node: OrgInfo;
  treeData: OrgInfo[];
  refresh: () => void;
}) => {
  const { node, treeData, refresh } = params;
  const { name, code, orgType, depth = 0 } = node;
  return (
    <div className={styles.orgTitleWrapper}>
      <div className={styles.info}>
        <IconAlibaba
          style={{
            width: '16px',
            height: '16px',
            marginRight: '8px',
          }}
          type={
            orgType === OrgType.accounting
              ? 'icon-icon_hesuanzhuti'
              : 'icon-icon_hesuanfenzu'
          }
        />
        <div className={styles.name}>{name}</div>
      </div>
      <div className={styles.more} onClick={e => e.stopPropagation()}>
        <Permission flag='management:companyOrg:delete'>
          <div
            className={styles.del}
            onClick={e => {
              e.stopPropagation();
              Modal.confirm({
                title: I18N.dashborad.confirmDeletionOfThis,
                onOk: async () => {
                  await deleteOrg({ id: code });
                  refresh();
                },
              });
            }}
          >
            <Tooltip overlay={I18N.carbonFootprint.delete}>
              <img src={del} alt='' />
            </Tooltip>
          </div>
        </Permission>

        {depth < treeMaxDepth && orgType !== OrgType.accounting && (
          <Permission flag='management:companyOrg:add'>
            <Dropdown
              overlay={menu(treeData, code, refresh, node.orgIndustry!)}
            >
              <img src={more} alt='' />
            </Dropdown>
          </Permission>
        )}
      </div>
    </div>
  );
};

export const OrganizationTree: FC<OrganizationTreeProps> = props => {
  const { onSelect, selectedKeys, treeData, refresh } = props;

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const transTreeData = useMemo(
    () => TransformTreeData(treeData, refresh, 0),
    [treeData],
  );

  const allExpandedKeys = useMemo(() => {
    const keys: React.Key[] = [];
    const generateKeys = (data: OrgInfo[]) => {
      data.forEach(item => {
        if (item.children.length > 0) {
          keys.push(item.code);
          generateKeys(item.children);
        }
      });
    };
    generateKeys(treeData);
    return keys;
  }, [treeData]);

  useEffect(() => {
    const needAddKeys = ([treeData?.[0]?.code] || []).filter(
      item => !isUndefined(item),
    );
    setExpandedKeys(pre => [...pre, ...difference(needAddKeys, pre)]);
  }, [treeData]);

  const dataList = useMemo(() => {
    const list: any[] = [];
    const generateList = (data: DataNode[]) => {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const { key } = node;
        list.push({ title: key as string, ...node });
        if (node.children) {
          generateList(node.children);
        }
      }
    };

    generateList(transTreeData);
    return list;
  }, [transTreeData]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExpandedKeys = dataList
      .map(item => {
        if (item.name.indexOf(value) > -1) {
          return getParentKey(item.key, transTreeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(newExpandedKeys as React.Key[]);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  return (
    <div className={styles.treeWrapper}>
      <div className={styles.title}>
        {I18N.dashborad.organizationalManagement}{' '}
        <Tooltip title={I18N.dashborad.maximumSupportLevel}>
          <InfoCircleOutlined
            style={{
              color: '#B5B8BB',
            }}
          />
        </Tooltip>
      </div>
      <Search
        value={searchValue}
        style={{ marginBottom: 8 }}
        placeholder={I18N.dashborad.pleaseEnterTheOrganization2}
        onChange={onChange}
      />
      <Tree<OrgInfo>
        blockNode
        treeData={transTreeData}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        titleRender={node => {
          if (node.orgType === OrgType.company) {
            return renderCompanyTitle(
              node.name,
              treeData,
              node.code,
              refresh,
              expandedKeys,
              setExpandedKeys,
              node.orgIndustry,
              allExpandedKeys,
            );
          }
          return renderOrgTitle({
            node,
            treeData,
            refresh,
          });
        }}
        rootClassName={styles.tree}
        autoExpandParent={autoExpandParent}
        onSelect={onSelect}
        selectedKeys={selectedKeys}
        fieldNames={{
          key: 'code',
          title: 'name',
        }}
      />
    </div>
  );
};
