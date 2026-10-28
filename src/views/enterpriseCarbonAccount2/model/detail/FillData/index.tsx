import { FormActions } from '@src/components/FormActions';
import {
  TreeCollapse,
  TreeCollapseDataNode,
} from '@src/components/TreeCollapse';
import { TreeTitle } from '@src/components/TreeTitle';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { useMount } from 'ahooks';
import { noop } from 'lodash-es';
import { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { columns } from './columns';
import { tableBottom } from './components/TableBottom';
import styles from './index.module.less';
import { getSourceList } from './service';

type FillDataType = {
  modelId: string;
  backStep: () => void;
  isShow?: boolean;
};

export const FillData: FC<FillDataType> = props => {
  const history = useHistory();

  const { modelId, backStep, isShow = false } = props;
  const [treeData, setTreeData] = useState<TreeCollapseDataNode[]>([]);
  const [loading, setLoading] = useState(false);
  const refreshSourceList = async () => {
    setLoading(true);
    try {
      const sourceList = await getSourceList(modelId);
      const newTreeData = sourceList.map(item => ({
        ...item,
        title: TreeTitle(item.name, item.count),
        collapseTitle: item.name,
        key: item.name,
        modelId,
        icon: null,
        children: item.nodes.map(childrenItem => ({
          ...childrenItem,
          title: TreeTitle(childrenItem.name, childrenItem.count),
          key: childrenItem.name,
          collapseTitle: (
            <span className={styles.bold}>{childrenItem.name}</span>
          ),
          ghgCategoryName: item.name,
          modelId,
          icon: null,
          dataSource: childrenItem.dictSourceList.map(source => ({
            ...source,
            modelId,
          })),
        })),
      }));
      setTreeData(newTreeData);
    } finally {
      setLoading(false);
    }
  };
  useMount(() => {
    refreshSourceList();
  });
  return (
    <div className={styles.fillData}>
      <div className={styles.wrapper}>
        <div className={styles.treeCollapseWrapper}>
          <TreeCollapse
            loading={loading}
            treeData={treeData}
            expandAll
            columns={columns({
              isShow,
              refreshSourceList,
            })}
            tableBottom={isShow ? noop : tableBottom(refreshSourceList)}
            canHideTree
          />
        </div>
      </div>
      <FormActions
        width='100%'
        place='center'
        buttons={[
          // {
          //   type: 'primary',
          //   title: '使用',
          //   onClick: async () => {
          //     history.push({
          //       pathname: RouteMaps.enterpriseCarbonAccountingAccounting,
          //       search: `?modelId=${modelId}`,
          //     });
          //   },
          // },
          {
            type: 'primary',
            title: I18N.carbonFootprint.preserve,
            onClick: async () => {
              history.push(
                RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountModelList,
              );
            },
          },
          {
            type: 'default',
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              backStep();
            },
          },
        ]}
      />
    </div>
  );
};
