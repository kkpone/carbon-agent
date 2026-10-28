import { FC } from 'react';
import styles from './index.module.less';
import { Markdown } from '@/components/Markdown';
import { AppendixItem, AppendixList } from '@/components/Appendix/ShowList';
import refSvg from './ref.svg';

export interface IQuestionProps {
  content: string;
  appendix: AppendixItem[];
  referContent?: string;
}

export const Question: FC<IQuestionProps> = props => {
  const { content, appendix, referContent } = props;
  return (
    <div>
      {referContent && (
        <div className={styles.ref}>
          <div className={styles.refIcon}>
            <img src={refSvg} alt='' />
          </div>
          <div>{referContent}</div>
        </div>
      )}
      <div className={styles.question}>
        {/* <div className={styles.avatar}>xq</div> */}
        <div className={styles.content}>
          <Markdown content={content} />
        </div>
      </div>
      {!!appendix?.length && (
        <div className={styles.appendixWrapper}>
          <AppendixList items={appendix} canDelete={false} readyOnly />
        </div>
      )}
    </div>
  );
};
