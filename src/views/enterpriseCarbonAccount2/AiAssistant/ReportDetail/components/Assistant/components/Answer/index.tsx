import React from 'react';

import styles from './index.module.less';
import { IMessage } from '../../type';
import { Markdown } from '@/components/Markdown';

type AnswerProps = {
  // Define your props here
  message: IMessage;
};

export const Answer: React.FC<AnswerProps> = props => {
  const { message } = props;
  // Access and use the props here
  return (
    <div className={styles.answer}>
      <div className={styles.content}>
        <Markdown content={message.content as string} />
      </div>
    </div>
  );
};
