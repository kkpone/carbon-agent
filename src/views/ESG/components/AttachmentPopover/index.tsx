import { Popover } from 'antd';
import { FC, ReactElement } from 'react';

import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { downloadFile } from '@/utils';

import styles from './index.module.less';
import { Indicator } from '../../type';

const AttachmentPopover: FC<{
  fileList: Indicator['fileList'];
  children: ReactElement;
  onDelete: (file: Indicator['fileList'][number]) => void;
}> = ({ fileList, children, onDelete }) => (
  <Popover
    rootClassName={styles.popover}
    content={
      <div
        onClick={e => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        <div className={styles.fileList}>
          {fileList.map(file => (
            <div className={styles.fileItem} key={file.url}>
              <IconAlibabaNew type='icon-link' />
              <div className={styles.fileName} title={file.name}>
                {file.name}
              </div>
              <IconAlibaba
                className={styles.downloadIcon}
                type='icon-icon_daoru'
                onClick={() => downloadFile(file.url || '', file.name)}
              />
              <IconAlibaba
                className={styles.deleteIcon}
                type='icon-icon_delete'
                onClick={() => onDelete(file)}
              />
            </div>
          ))}
        </div>
      </div>
    }
  >
    {children}
  </Popover>
);

export default AttachmentPopover;
