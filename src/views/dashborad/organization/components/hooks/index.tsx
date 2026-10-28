import { getUserInfo } from '@src/utils';
import { useMount } from 'ahooks';
import { isUndefined } from 'lodash-es';
import { useCallback, useState } from 'react';

import { getFrameOrgTree, getOrgTree, OrgInfo } from '../../services';

function TransformTreeData(treeData: OrgInfo[]) {
  return treeData?.map(item => ({
    ...item,
    label: item.name,
    value: item.code,
    children: item.children ? TransformTreeData(item.children) : [],
  }));
}

export const useOrgTreeData = (mountRequest: boolean = true) => {
  const userInfo = getUserInfo();

  const [treeData, setTreeData] = useState<OrgInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = userInfo?.userInfo.userId;
  const refresh = useCallback(async () => {
    if (!isUndefined(userId)) {
      setLoading(true);
      try {
        const { data } = await getOrgTree({ userId });
        setTreeData(TransformTreeData(data.data.tree));
      } finally {
        setLoading(false);
      }
    }
  }, [userId]);

  useMount(() => {
    if (mountRequest) {
      refresh();
    }
  });

  return [treeData, refresh, loading] as const;
};

export const useFrameOrgTreeData = (mountRequest: boolean = true) => {
  const userInfo = getUserInfo();

  const [treeData, setTreeData] = useState<OrgInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = userInfo?.userInfo.userId;
  const refresh = useCallback(async () => {
    if (!isUndefined(userId)) {
      setLoading(true);
      try {
        const { data } = await getFrameOrgTree({ userId });
        setTreeData(TransformTreeData(data.data));
      } finally {
        setLoading(false);
      }
    }
  }, [userId]);

  useMount(() => {
    if (mountRequest) {
      refresh();
    }
  });

  return [treeData, refresh, loading] as const;
};
