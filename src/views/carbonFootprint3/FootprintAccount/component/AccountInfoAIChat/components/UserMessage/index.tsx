import { FileOutlined } from '@ant-design/icons';
import { FC } from 'react';

import referenceIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/history-dialogue.svg';
import { Markdown } from '@/components/Markdown';

import styles from './index.module.less';
import { ChatAppendix } from '../../type';

interface UserMessageProps {
  content: string;
  appendix?: ChatAppendix[];
  referContent?: string;
}

export const UserMessage: FC<UserMessageProps> = ({
  content,
  appendix,
  referContent,
}) => (
  <div className={styles.userMessage}>
    {referContent && (
      <div className={styles.referenceContent} title={referContent}>
        <img src={referenceIcon} alt='' />
        <span>{referContent}</span>
      </div>
    )}
    <div className={styles.bubble}>
      <Markdown content={content ?? ''} />
    </div>
    {!!appendix?.length && (
      <div className={styles.appendixList}>
        {appendix.map(file => (
          <a
            key={file.url}
            className={styles.appendixItem}
            href={file.url}
            target='_blank'
            rel='noreferrer'
          >
            <FileOutlined className={styles.fileIcon} />
            <span className={styles.fileName}>{file.name}</span>
          </a>
        ))}
      </div>
    )}
  </div>
);
