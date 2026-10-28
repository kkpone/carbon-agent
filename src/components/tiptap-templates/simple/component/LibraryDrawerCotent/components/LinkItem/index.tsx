import { FC } from 'react';
import styles from './index.module.less';
import { IconAlibaba } from '@/components/iconfont';
import { Tooltip } from 'antd';

export interface ILinkItemProps {
  /** 名称 */
  name: string;
  /** 创建时间 */
  createTime: string;
  /** 创建者 */
  createBy: string;
  /** URL */
  url: string;
  /** 点击插入报告回调 */
  onInsert?: () => void;
  /** 点击下载回调 */
  onDownload?: () => void;
  /** 点击删除回调 */
  onDelete?: () => void;
}

export const LinkItem: FC<ILinkItemProps> = props => {
  console.log(props);
  const { name, createTime, createBy, url, onInsert, onDownload, onDelete } =
    props;
  return (
    <div className={styles.linkItem}>
      <div className={styles.linkItemContent}>
        {/* <div className={styles.linkItemContentName}>{name}</div> */}
        <Tooltip title={url}>
          <div className={styles.linkItemContentUrl}>{url}</div>
        </Tooltip>
        <div className={styles.linkItemContentInfo}>
          <div className={styles.linkItemContentInfoItem}>{createBy}</div>
          <div className={styles.linkItemContentInfoItem}>
            {createTime ? createTime.split('T')[0] : ''}
          </div>
        </div>
      </div>
      <div className={styles.linkItemOperate} onClick={() => onDelete?.()}>
        <IconAlibaba type='icon-icon_delete' />
      </div>
    </div>
  );
};
