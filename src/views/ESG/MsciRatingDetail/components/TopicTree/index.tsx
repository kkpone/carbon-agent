import I18N from '@src/lang/I18N';
import { FC } from 'react';

import styles from './index.module.less';
import { TopicData } from '../../service';

export interface TopicTreeProps {
  topics: TopicData[];
  selectedTopicId: string;
  onSelect: (topicId: string) => void;
}

const PILLAR_CONFIG = {
  environment: {
    name: I18N.esg.environmentalPillar,
    color: '#3ab86e',
  },
  social: {
    name: I18N.esg.pillarsOfSociety,
    color: '#f0d56c',
  },
  governance: {
    name: I18N.esg.governancePillar,
    color: '#6e9fda',
  },
};

export const TopicTree: FC<TopicTreeProps> = ({
  topics,
  selectedTopicId,
  onSelect,
}) => {
  const groupedTopics = topics.reduce((acc, topic) => {
    if (!acc[topic.pillar]) {
      acc[topic.pillar] = [];
    }
    acc[topic.pillar].push(topic);
    return acc;
  }, {} as Record<string, TopicData[]>);

  return (
    <div className={styles.topicTree}>
      <div className={styles.treeContent}>
        {(['environment', 'social', 'governance'] as const).map(pillar => {
          const pillarTopics = groupedTopics[pillar] || [];
          const config = PILLAR_CONFIG[pillar];

          return (
            <div key={pillar} className={styles.pillarGroup}>
              <div
                className={styles.pillarHeader}
                style={{ borderLeftColor: config.color }}
              >
                <span className={styles.pillarName}>{config.name}</span>
              </div>
              <div className={styles.topicsList}>
                {pillarTopics.map(topic => (
                  <div
                    key={topic.id}
                    className={`${styles.topicItem} ${
                      selectedTopicId === topic.id ? styles.topicItemActive : ''
                    }`}
                    style={{
                      borderLeftColor:
                        selectedTopicId === topic.id ? config.color : undefined,
                    }}
                    onClick={() => onSelect(topic.id)}
                  >
                    <span className={styles.topicName}>{topic.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
