/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-20 09:47:43
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 10:03:50
 */
import I18N from '@src/lang/I18N';
import { Key, useEffect, useState } from 'react';
import '../style.less';
import { SourceCategoryListType } from '@src/views/enterpriseCarbonAccount2/utils/type';
import { Tree, TreeProps } from 'antd';
import { DataNode } from 'antd/lib/tree';

type ClassifyTreeProps = {
  onAllClick: () => void;
  selectedKeys: Key[];
  treeData: (DataNode & Record<string, any>)[];
  total?: number;
  finishTotal?: number;
} & TreeProps;
const ClassifyTree = (props: ClassifyTreeProps) => {
  const {
    onAllClick,
    selectedKeys,
    treeData,
    total,
    finishTotal,
    ...TreeProps
  } = props;
  const [treeDatas, setTreeDatas] = useState();
  useEffect(() => {
    const titleNode = (node: SourceCategoryListType) => {
      const title = node.name;
      const totalNum = node.total > 99 ? '99+' : node.total;
      return title.includes(I18N.carbonFootprint3.category) ? (
        <div
          className={`${
            node.level === 1 ? 'flex-j-b flex-a-c' : 'flex-a-s'
          } classify-height`}
        >
          <div className='flex-d-c'>
            <span title={title.split('：')?.[1]} className='word-ellipsis'>
              {title.split('：')?.[1]}
            </span>
            <span className='classify'>{title.split('：')?.[0]}</span>
          </div>
          <span className='total'>
            {typeof node?.finishCount !== 'undefined' &&
            node?.finishCount !== null
              ? `${node?.finishCount}/`
              : ''}
            {totalNum}
          </span>
        </div>
      ) : (
        <div className={`flex-a-c ${node.level === 1 ? 'flex-j-b' : ''}`}>
          <span title={title} className='word-ellipsis'>
            {title}
          </span>
          <span className='total'>
            {typeof node?.finishCount !== 'undefined' &&
            node?.finishCount !== null
              ? `${node?.finishCount}/`
              : ''}

            {totalNum}
          </span>
        </div>
      );
    };
    const listToTree = (list: string | any[]) => {
      const map: any = {};
      let node;
      const tree: any = [];
      let i;
      // eslint-disable-next-line no-plusplus
      for (i = 0; i < list.length; i++) {
        list[i].children = [];
        list[i].key = i;
        map[list[i].id] = list[i];
        list[i].selectable = list[i].requestFlag;
      }
      for (i = 0; i < list.length; i += 1) {
        // eslint-disable-next-line
        list[i].key = 1000 + i;
        node = list[i];
        if (node.parentId !== 0) {
          map[node.parentId]?.children.push({
            ...node,
            key: node.id,
            title: titleNode(node),
          });
        } else {
          tree.push({
            ...node,
            key: node.id,
            title: titleNode(node),
          });
        }
      }
      return tree;
    };
    setTreeDatas(listToTree(treeData));
  }, [props]);

  return (
    <div className='flex-j-b table-tree-box'>
      <div className='dict-tree'>
        <div className='ghg-classify'>
          {I18N.enterpriseCarbonAccount2.dividedByGhg}
        </div>
        <div
          className={`flex-a-c flex-j-b all-box ${
            selectedKeys?.toString() === '0'
          }`}
          onClick={() => onAllClick()}
        >
          <div className='flex-a-c'>
            <img
              className='file-icon'
              src='https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/saas-product/icon_%20folder.svg'
              alt=''
            />
            <span className={`'word' ${selectedKeys?.toString() === '0'}`}>
              {I18N.carbonFootprint3.whole}
            </span>
          </div>
          <span>
            {finishTotal === undefined ? '' : `${finishTotal}/`}
            {total}
          </span>
        </div>
        <Tree {...TreeProps} selectedKeys={selectedKeys} treeData={treeDatas} />
      </div>
    </div>
  );
};
export default ClassifyTree;
