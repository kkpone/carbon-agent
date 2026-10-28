import { Markdown } from '@/components/Markdown';
import { FC } from 'react';
import styles from './index.module.less';
import ai from './ai.svg';
import insertSvg from './insert.svg';
import copySvg from './copy.svg';
import resendSvg from './resend.svg';
import { Tooltip } from 'antd';
import copyToClipboard from 'copy-to-clipboard';
import { Toast } from '@/utils';
import I18N from '@/lang/I18N';
import { Spin } from 'antd';

export interface IAnswerProps {
  content: string;
  loading?: boolean;
  resend?: (id: number) => void;
  insert?: () => void;
  selected?: boolean;
}

export const Answer: FC<IAnswerProps> = props => {
  const { content, loading, insert, selected } = props;

  const onCopy = () => {
    if (loading) {
      return;
    }
    const copySuccess = copyToClipboard(content);
    if (copySuccess) {
      Toast('success', I18N.carbonFootprint3.copySuccessful);
    } else {
      Toast('error', I18N.dashborad.copyFailed);
    }
  };

  return (
    <div className={styles.answer}>
      <div className={styles.avatar}>
        <img src={ai} alt='' />
      </div>
      <div className={styles.answerContent}>
        <div className={styles.content}>
          <Markdown content={content} />
        </div>
        <div className={styles.btns}>
          <Spin spinning={loading}>
            <div
              className={styles.insert}
              onClick={() => {
                if (insert) {
                  insert();
                }
              }}
            >
              <img src={insertSvg} alt='' />
              {selected ? I18N.components.replace : I18N.components.insert}
            </div>
          </Spin>
          <div className={styles.right}>
            <Tooltip title={I18N.carbonFootprint.copy} placement='top'>
              <div className={styles.operation} onClick={onCopy}>
                <img src={copySvg} alt='' />
              </div>
            </Tooltip>
            <Tooltip title={I18N.components.reAnswer} placement='top'>
              <div
                className={styles.operation}
                onClick={() => props.resend?.()}
              >
                <img src={resendSvg} alt='' />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
