import I18N from '@src/lang/I18N';
import { FC } from 'react';
import styles from './index.module.less';

export interface IssueCatalogProps {
  environmentalIssues: Array<{ id: number | string; name?: string }>;
  socialIssues: Array<{ id: number | string; name?: string }>;
  governanceIssues: Array<{ id: number | string; name?: string }>;
}

export const IssueCatalog: FC<IssueCatalogProps> = ({
  environmentalIssues,
  socialIssues,
  governanceIssues,
}) => {
  const renderPillar = (
    title: string,
    color: string,
    issues: Array<{ id: number | string; name?: string }>,
  ) => {
    if (!issues || issues.length === 0) return null;

    return (
      <>
        <div className={styles.pillarItem} style={{ borderLeftColor: color }}>
          <span className={styles.pillarTitle}>{title}</span>
        </div>
        {issues.map(issue => (
          <div
            key={issue.id}
            className={styles.issueItem}
            onClick={() => {
              const targetElement = document.getElementById(
                `issue-${issue.id}`,
              );
              if (targetElement) {
                targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }
            }}
          >
            <span className={styles.issueName}>
              {issue.name || I18N.esg.keyIssues}
            </span>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={styles.catalog}>
      {renderPillar(
        I18N.esg.environmentalPillar,
        '#3ab86e',
        environmentalIssues,
      )}
      {renderPillar(I18N.esg.pillarsOfSociety, '#f0d56c', socialIssues)}
      {renderPillar(I18N.esg.governancePillar, '#6e9fda', governanceIssues)}
    </div>
  );
};
