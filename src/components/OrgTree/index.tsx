import emptyImg from '@src/assets/svg/enterprise_empty.svg';
import I18N from '@src/lang/I18N';
import { GetComponentProps } from '@src/utils/utilTypes';
import { Input, Tree } from 'antd';
import classNames from 'classnames';
import { cloneDeep, debounce } from 'lodash-es';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import { Org } from './type';
import { IconAlibaba } from '../iconfont';

export const ORG_TYPE = {
  ENTERPRISE: 1,
  ORG: 2,
  MAIN_PART: 3,
} as const;

export const attachOrgLevel: <T extends { children: any[] | undefined }>(
  orgList: T[] | undefined,
  level?: number,
) => T[] | undefined = (orgList, level: number = 1) =>
  orgList?.map(org => ({
    ...org,
    level,
    className: level === 1 ? 'root-node' : undefined,
    children: attachOrgLevel(org.children, level + 1),
  }));

const OrgTree: FC<
  GetComponentProps<typeof Tree> & {
    width?: number;
    emptyText?: string;
    showOrgIcon?: boolean;
    orgNameSuffix?: ReactNode | ((org: Org) => ReactNode);
    onSearch?: (matchKeys: number[]) => void;
  }
> = props => {
  const {
    treeData,
    emptyText = I18N.components.currentlyUnorganized,
    width,
    showOrgIcon = true,
    orgNameSuffix,
    onSearch,
    ...restProps
  } = props;

  const [searchText, setSearchText] = useState('');

  const [filterOrgData, setFilterOrgData] = useState<Org[]>();

  const orgNameRender = (name: string) => {
    const index = name.indexOf(searchText);
    const beforeStr = name.substring(0, index);
    const afterStr = name.slice(index + searchText.length);
    return index > -1 ? (
      <span>
        {beforeStr}
        <span className={styles.matchText}>{searchText}</span>
        {afterStr}
      </span>
    ) : (
      <span>{name}</span>
    );
  };

  const titleRender = (org: Org) => {
    const { orgType, name } = org;

    if (orgType === ORG_TYPE.ENTERPRISE) {
      return (
        <span
          className={classNames(styles.title, styles.enterpriseTitle)}
          title={name}
        >
          {showOrgIcon && (
            <span className={styles.iconImg}>
              <IconAlibaba
                className={styles.orgIcon}
                type='icon-a-icon-qiyebeijing'
              />
            </span>
          )}

          <span className={styles.orgName} title={name}>
            {orgNameRender(name)}
          </span>
          {typeof orgNameSuffix === 'function'
            ? orgNameSuffix(org)
            : orgNameSuffix}
        </span>
      );
    }

    return (
      <span className={styles.title} title={name}>
        {showOrgIcon && (
          <span className={classNames(styles.iconImg, styles.orgIconImg)}>
            <IconAlibaba
              className={styles.orgIcon}
              type={
                orgType === ORG_TYPE.MAIN_PART
                  ? 'icon-icon_hesuanzhuti'
                  : 'icon-icon_hesuanfenzu'
              }
            />
          </span>
        )}
        <span className={styles.orgName} title={name}>
          {orgNameRender(name)}
        </span>
        {typeof orgNameSuffix === 'function'
          ? orgNameSuffix(org)
          : orgNameSuffix}
      </span>
    );
  };

  const onSearchInputChange = useMemo(
    () =>
      debounce((text: string) => {
        setSearchText(text);
      }, 300),
    [],
  );

  const renderTreeData = attachOrgLevel((filterOrgData || treeData) as Org[]);

  useEffect(() => {
    if (!searchText) {
      setFilterOrgData(undefined);
    } else {
      const matchKeys: number[] = [];

      const iter = (orgList: Org[] | undefined, parents: Org[] = []) =>
        orgList?.filter(org => {
          Object.assign(org, {
            children: iter(org.children, [...parents, org]),
          });

          const parent = [...parents].pop();
          const match = org.name.includes(searchText) || !!org.hasMatchChild;

          if (parent && match) {
            parent.hasMatchChild = true;
          }

          if (match) {
            matchKeys.push(...[...parents, org].map(({ id }) => id));
          }
          return match;
        });

      setFilterOrgData(iter(cloneDeep(treeData as Org[])));
      onSearch?.([...new Set([...matchKeys])]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, treeData]);

  return (
    <>
      <Input
        className={styles.orgSearchInput}
        placeholder={I18N.carbonFootprint3.organizationName}
        onChange={e => onSearchInputChange(e.target.value.trim())}
      />
      {renderTreeData && (renderTreeData as Org[]).length > 0 ? (
        <Tree
          {...restProps}
          treeData={renderTreeData}
          rootClassName={styles.tree}
          titleRender={titleRender}
        />
      ) : (
        <div className={styles.empty}>
          <img alt='' src={emptyImg} />
          <div className={styles.emptyText}>
            {searchText && (treeData || []).length > 0
              ? I18N.components.noSearchResults
              : emptyText}
          </div>
        </div>
      )}
    </>
  );
};

export default OrgTree;
