import I18N from '@src/lang/I18N';
import { CloseOutlined } from '@ant-design/icons';
import { Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';
import { getFileIcon } from '@/utils';

import styles from './index.module.less';
import linkIcon from '../Link/icon.svg';
import textIcon from '../Text/icon.svg';

export type AppendixItem = {
  fileUid?: string;
  status?: string;
  type: 'text' | 'link' | 'file';
  value: {
    showName: string;
    fileSize?: string;
    fileUrl?: string;
    status?: string;
  };
  uuid: string;
  id?: string;
};

export interface IAppendixListProps {
  items: AppendixItem[];
  canDelete?: boolean;
  del?: (uuid: string) => void;
  readyOnly?: boolean;
}

export const AppendixList: FC<IAppendixListProps> = props => {
  const { items, canDelete, del, readyOnly } = props;
  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.right]: readyOnly,
      })}
    >
      {items?.map(item => (
        <Spin spinning={item.value.status === 'uploading'}>
          <div
            key={item.uuid}
            className={styles.appendix}
            style={{
              borderBottom:
                item.value.status === 'error'
                  ? '1px solid #FF4D4F'
                  : readyOnly
                  ? 'none'
                  : '1px solid #d9d9d9',
            }}
          >
            <Tooltip
              title={
                item.value.status === 'error'
                  ? I18N.components.uploadFailedPlease
                  : ''
              }
            >
              <div className={styles.icon}>
                {item.type === 'text' && (
                  <span className={styles.textIcon}>
                    <img src={textIcon} alt='' />
                  </span>
                )}
                {item.type === 'link' && (
                  <span className={styles.linkIcon}>
                    <img src={linkIcon} alt='' />
                  </span>
                )}
                {item.type === 'file' && (
                  <span className={styles.fileIcon}>
                    <IconAlibabaNew
                      style={{
                        fontSize: 22,
                      }}
                      type={getFileIcon(
                        item.value.fileUrl || item.value.showName,
                      )}
                    />
                  </span>
                )}
              </div>
            </Tooltip>
            <Tooltip
              title={
                item.value.status === 'error'
                  ? I18N.components.uploadFailedPlease
                  : ''
              }
            >
              <div className={styles.text}>
                <Tooltip
                  title={`${(item.value?.showName || '')?.slice(0, 200)}${
                    item.value.showName?.length > 200 ? ' ...' : ''
                  }`}
                  placement='topLeft'
                >
                  <div className={styles.showName}>{item.value.showName}</div>
                </Tooltip>
                <div className={styles.fileSize}>
                  {item.type === 'file' &&
                    item.value.fileSize &&
                    ` (${item.value.fileSize})`}
                </div>
              </div>
            </Tooltip>
            {canDelete && (
              <CloseOutlined
                className={styles.close}
                onClick={() => {
                  if (canDelete) {
                    del?.(item.uuid);
                  }
                }}
              />
            )}
          </div>
        </Spin>
      ))}
    </div>
  );
};
