import { FC } from 'react';
import styles from './index.module.less';
import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { getFileIcon } from '@/utils';
import TextWidthOverflow from '@/views/subModules/CarbonFootprintModel/components/byWidth';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
export interface IFileItemProps {
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
  /** 是否可以下载 */
  canDownload?: boolean;
  /** 是否隐藏图标 */
  hiddenIcon?: boolean;
}

export const FileItem: FC<IFileItemProps> = props => {
  const {
    name,
    createTime,
    createBy,
    url,
    onInsert,
    onDownload,
    onDelete,
    canDownload,
    hiddenIcon,
  } = props;
  return (
    <div className={styles.fileItem}>
      <div className={styles.fileItemContent}>
        {!hiddenIcon && (
          <div className={styles.fileItemIcon}>
            <IconAlibabaNew
              style={{
                fontSize: 32,
              }}
              type={getFileIcon(name || '') || ''}
            />
          </div>
        )}
        <div className={styles.fileItemInfo}>
          <TextWidthOverflow value={name} width={380} />
          {/* <div className={styles.fileItemContentName}>{name}{name}{name}{name}{name}"fileItemContentNamefileItemContentNamefileItemContentName"</div> */}
          <div className={styles.fileItemContentInfo}>
            <div className={styles.fileItemContentTime}>
              {createTime ? createTime.split('T')[0] : ''}
            </div>
            <div className={styles.fileItemContentBy}>{createBy}</div>
          </div>
        </div>
      </div>
      <div className={styles.fileItemOperate}>
        {canDownload && (
          <div
            className={styles.maskHeaderIconGroupItem}
            onClick={() => saveAs(url, name)}
          >
            <DownloadOutlined />
          </div>
        )}
        <div
          className={styles.maskHeaderIconGroupItem}
          onClick={() => onDelete?.()}
        >
          <IconAlibaba type='icon-icon_delete' />
        </div>
      </div>
    </div>
  );
};
