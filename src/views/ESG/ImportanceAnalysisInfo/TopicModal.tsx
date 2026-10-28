/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import classNames from 'classnames';
import { cloneDeep } from 'lodash-es';
import { FC, useEffect, useState } from 'react';

import { LocaleType } from '@/lang/I18N';

import styles from './TopicModal.module.less';

const noCheckedIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='14'
    height='14'
    viewBox='0 0 14 14'
    fill='none'
  >
    <circle cx='7' cy='7' r='6.5' fill='white' stroke='#D2D6DA' />
  </svg>
);

const checkedIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='14'
    height='14'
    viewBox='0 0 14 14'
    fill='none'
  >
    <circle cx='7' cy='7' r='7' fill='#026961' />
    <path
      d='M4 7L6.5 9.5L10.5 5.5'
      stroke='white'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

type TopicModalProps = {
  open: boolean;
  locale: LocaleType;
  topics: Record<string, any>[];
  onCancel: () => void;
  onConfirm: (data) => void;
};
const TopicModal: FC<TopicModalProps> = ({
  open,
  locale,
  topics: topicsFromProps,
  onCancel,
  onConfirm,
}) => {
  const [topics, setTopics] = useState<Record<string, any>[]>([]);

  const isZh = locale === LocaleType.zhCN;

  useEffect(() => {
    if (open) {
      setTopics(cloneDeep(topicsFromProps));
    }
  }, [open, topicsFromProps]);

  return (
    <Modal
      title={I18N.esg.addATopic}
      width={920}
      open={open}
      onClose={onCancel}
      onCancel={onCancel}
      onOk={() => onConfirm(topics)}
      afterClose={() => setTopics([])}
    >
      <div className={styles.topicContent}>
        {topics.map(topicGroup => (
          <div
            className={classNames(styles.topicGroup, {
              [styles.ETopicGroup]: topicGroup.moduleType === '1',
              [styles.STopicGroup]: topicGroup.moduleType === '2',
              [styles.GTopicGroup]: topicGroup.moduleType === '3',
            })}
          >
            <div className={styles.topicGroupHeader}>
              <div className={styles.topicGroupBar} />
              <div className={styles.topicGroupName}>
                {topicGroup[isZh ? 'moduleName' : 'moduleNameEn']}
              </div>
            </div>
            <div className={styles.topicList}>
              {topicGroup.topicList.map(topic => (
                <div
                  className={styles.topicItem}
                  onClick={() => {
                    Object.assign(topic, {
                      related: topic.related === 1 ? 0 : 1,
                    });
                    setTopics([...topics]);
                  }}
                >
                  {topic.related === 1 ? checkedIcon : noCheckedIcon}
                  <div
                    className={styles.topicName}
                    title={topic[isZh ? 'name' : 'nameEn']}
                  >
                    {topic[isZh ? 'name' : 'nameEn']}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default TopicModal;
