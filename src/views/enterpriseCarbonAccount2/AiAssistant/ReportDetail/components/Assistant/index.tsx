import { Modal } from 'antd';
import React, { useState } from 'react';

import AI_ICON from './aiTitle.svg';
import { Content } from './components/Content';
import styles from './index.module.less';

interface AssistantProps {
  // Add any props you need for your component here
  reportId?: string;
}

export const Assistant: React.FC<AssistantProps> = props => {
  const [visible, setVisible] = useState(false);
  const { reportId } = props;

  return (
    // Add your JSX code here
    <>
      <div className={styles.assistant} onClick={() => setVisible(true)}>
        <img src={AI_ICON} alt='' />
        {/* AI 助手 */}
      </div>
      <Modal
        open={visible}
        mask={false}
        width={384}
        styles={{
          content: {
            padding: '20px 24px',
          },
        }}
        onCancel={() => setVisible(false)}
        footer={null}
        destroyOnClose
        style={{
          top: '62px',
          height: '592px',
          left: 'calc(50% - 216px)',
        }}
      >
        <Content reportId={reportId || ''} />
      </Modal>
    </>
  );
};
