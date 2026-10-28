import I18N from '@src/lang/I18N';
import { DownOutlined } from '@ant-design/icons';
import { FC, useState } from 'react';

import styles from './index.module.less';
import { MsciRatingDetailData } from '../../service';

export interface TopicDetailProps {
  topicId: string;
  data: MsciRatingDetailData | null;
}

const PILLAR_CONFIG = {
  environment: {
    name: I18N.esg.environmentalPillar,
    color: '#3ab86e',
    bgColor: 'rgba(58, 184, 110, 0.1)',
    progressBgColor: '#d8f1e2',
  },
  social: {
    name: I18N.esg.pillarsOfSociety,
    color: '#f0d56c',
    bgColor: 'rgba(240, 213, 108, 0.2)',
    progressBgColor: '#faf2d3',
  },
  governance: {
    name: I18N.esg.governancePillar,
    color: '#6e9fda',
    bgColor: 'rgba(110, 159, 218, 0.15)',
    progressBgColor: '#e2ecf8',
  },
};

// 渲染进度条
const renderProgressBar = (percent: number, bgColor: string) => {
  const filledCount = Math.round((percent / 100) * 10);
  return (
    <div className={styles.progressBar}>
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          // key={index}
          className={styles.progressItem}
          style={{
            backgroundColor: index < filledCount ? bgColor : '#fff',
          }}
        />
      ))}
    </div>
  );
};

export const TopicDetail: FC<TopicDetailProps> = ({ topicId, data }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  if (!data || !topicId) {
    return (
      <div className={styles.emptyState}>
        <p>{I18N.esg.pleaseSelectFromTheLeftSide}</p>
      </div>
    );
  }

  const selectedTopic = data.topics.find(t => t.id === topicId);
  if (!selectedTopic) {
    return (
      <div className={styles.emptyState}>
        <p>{I18N.esg.theProposalWasNotFound}</p>
      </div>
    );
  }

  const pillarConfig = PILLAR_CONFIG[selectedTopic.pillar];
  const isExpanded = expandedSections.has('exposure');
  const isManagementExpanded = expandedSections.has('management');

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className={styles.topicDetail}>
      <div className={styles.content}>
        {/* 支柱标题 */}
        <div
          className={styles.pillarHeader}
          style={{
            borderLeftColor: pillarConfig.color,
            backgroundColor: pillarConfig.bgColor,
          }}
        >
          <div className={styles.pillarHeaderLeft}>
            <span className={styles.pillarTitle}>{pillarConfig.name}</span>
            <div className={styles.pillarScore}>
              <span className={styles.scoreValue}>{selectedTopic.score}</span>
              <span className={styles.scorePercent}>
                {selectedTopic.percent}%
              </span>
            </div>
            {renderProgressBar(selectedTopic.percent, pillarConfig.color)}
          </div>
        </div>

        {/* 议题项 */}
        <div
          className={styles.topicItem}
          style={{
            borderLeftColor: pillarConfig.color,
            backgroundColor: '#f7f8f9',
          }}
        >
          <div className={styles.topicItemContent}>
            <div className={styles.topicItemLeft}>
              <div
                className={styles.pillarBar}
                style={{ backgroundColor: pillarConfig.color }}
              />
              <DownOutlined
                className={`${styles.chevron} ${
                  isExpanded ? styles.chevronExpanded : ''
                }`}
              />
              <span className={styles.topicName}>{selectedTopic.name}</span>
              <span className={styles.topicScore}>{selectedTopic.score}</span>
              <span className={styles.topicPercent}>
                {selectedTopic.percent}%
              </span>
              {renderProgressBar(
                selectedTopic.percent,
                pillarConfig.progressBgColor,
              )}
            </div>
          </div>
        </div>

        {/* 敞口得分 */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleSection('exposure')}
          >
            {/* <ChevronDownOutlined
              className={`${styles.chevron} ${
                isExpanded ? styles.chevronExpanded : ''
              }`}
            /> */}
            <span className={styles.sectionTitle}>
              {I18N.esg.exposureScore}
            </span>
            <span className={styles.sectionScore}>{selectedTopic.score}</span>
          </div>
          {isExpanded && (
            <div className={styles.sectionContent}>
              <div className={styles.subSection}>
                <div className={styles.subSectionHeader}>
                  <span className={styles.subSectionTitle}>
                    {I18N.esg.businessExposure2}
                  </span>
                  <span className={styles.subSectionScore}>
                    {selectedTopic.score}
                  </span>
                </div>
                <div className={styles.businessList}>
                  <div className={styles.businessItem}>
                    <div className={styles.businessHeader}>
                      <span className={styles.businessName}>
                        {I18N.esg.beverageProductionIndustry}
                      </span>
                      <span className={styles.businessScore}>
                        {selectedTopic.score}
                      </span>
                    </div>
                    <div className={styles.businessContent}>
                      <div className={styles.businessIcon}>📄</div>
                      <p className={styles.businessText}>
                        {I18N.esg.extractInformation}
                      </p>
                    </div>
                  </div>
                  <div className={styles.businessItem}>
                    <div className={styles.businessHeader}>
                      <span className={styles.businessName}>
                        {I18N.esg.directOperatedStoreBusiness}{' '}
                        <span className={styles.businessScoreInline}>7.3</span>
                      </span>
                    </div>
                    <div className={styles.businessContent}>
                      <div className={styles.businessIcon}>📄</div>
                      <p className={styles.businessText}>
                        {I18N.esg.extractInformation}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={styles.optimizationSuggestion}>
                  <div className={styles.optimizationTag}>
                    {I18N.carbonFootprint3.optimizationSuggestions}
                  </div>
                  <p className={styles.optimizationText}>
                    {I18N.esg.optimizationSuggestions}
                  </p>
                </div>
              </div>
              <div className={styles.subSection}>
                <div className={styles.subSectionHeader}>
                  <span className={styles.subSectionTitle}>
                    {I18N.esg.geographicalExposure}
                  </span>
                  <span className={styles.subSectionScore}>
                    {selectedTopic.score}
                  </span>
                </div>
                <div className={styles.businessList}>
                  <div className={styles.businessItem}>
                    <div className={styles.businessHeader}>
                      <span className={styles.businessName}>
                        {I18N.esg.beverageProductionIndustry}
                      </span>
                      <span className={styles.businessScore}>
                        {selectedTopic.score}
                      </span>
                    </div>
                    <div className={styles.businessContent}>
                      <div className={styles.businessIcon}>📄</div>
                      <p className={styles.businessText}>
                        {I18N.esg.extractInformation}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={styles.optimizationSuggestion}>
                  <div className={styles.optimizationTag}>
                    {I18N.carbonFootprint3.optimizationSuggestions}
                  </div>
                  <p className={styles.optimizationText}>
                    {I18N.esg.optimizationSuggestions}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 管理得分 */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            onClick={() => toggleSection('management')}
          >
            {/* <ChevronDownOutlined
              className={`${styles.chevron} ${
                isManagementExpanded ? styles.chevronExpanded : ''
              }`}
            /> */}
            <span className={styles.sectionTitle}>
              {I18N.esg.managementScore}
            </span>
            <span className={styles.sectionScore}>3.7</span>
          </div>
          {isManagementExpanded && (
            <div className={styles.sectionContent}>
              <div className={styles.managementItem}>
                <DownOutlined className={styles.chevron} />
                <span>{I18N.esg.emissionReductionMeasures}</span>
              </div>
              <div className={styles.managementItem}>
                <DownOutlined className={styles.chevron} />
                <span>{I18N.esg.performanceScore}</span>
              </div>
              <div className={styles.managementItem}>
                <DownOutlined className={styles.chevron} />
                <span>{I18N.esg.disputeDeductionPoints}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
