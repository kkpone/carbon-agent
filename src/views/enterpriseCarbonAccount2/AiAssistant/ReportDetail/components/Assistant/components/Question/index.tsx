import React from 'react';

import styles from './index.module.less';
import { IMessage } from '../../type';

type QuestionProps = {
  // Define your props here
  message: IMessage;
};

export const Question: React.FC<QuestionProps> = props => {
  // Access and use the props here
  const { message } = props;
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>{message.content}</div>
    </div>
  );
};
