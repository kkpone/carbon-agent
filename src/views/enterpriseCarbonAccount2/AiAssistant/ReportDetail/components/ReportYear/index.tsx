import I18N from '@src/lang/I18N';
import moment from 'moment';
import React from 'react';

import styles from './index.module.less';
import { ReportData } from '../../service';
import { ReportYearModal } from '../ReportYearModal';

interface ReportYearProps {
  // Add any props you need for the component here
  reportData?: ReportData;
}

export const ReportYear: React.FC<ReportYearProps> = props => {
  const { reportData } = props;
  return (
    // Add your component logic here

    // Add your JSX code here
    <div>
      <div className={styles.title}>
        <div className={styles.left}>
          <div className={styles.label}>
            {I18N.enterpriseCarbonAccount2.reportedAnnualRevenue}
          </div>
          <div className={styles.value}>{reportData?.revenue}</div>
          <div className={styles.label}>{reportData?.currency}</div>
        </div>
        <div className={styles.right}>
          <div className={styles.label}>
            {I18N.enterpriseCarbonAccount2.cycleTime}
          </div>
          <div className={styles.value}>
            {moment(reportData?.reportStartDate).format(
              I18N.enterpriseCarbonAccount2.yyyy,
            )}
            -
            {moment(reportData?.reportEndDate).format(
              I18N.enterpriseCarbonAccount2.yyyy,
            )}
          </div>
        </div>
      </div>
      <div className={styles.table}>
        <div className={styles.scope1}>
          <div className={styles.scopeTitle}>
            {I18N.enterpriseCarbonAccount2.scopeOne}
          </div>
          <div className={styles.info}>
            <div className={styles.infoTitle}>
              {I18N.carbonFootprint.emissions}
            </div>
            <div className={styles.infoValue}>
              {reportData?.scope1Emissions}
            </div>
          </div>
        </div>
        <div className={styles.scope1}>
          <div className={styles.scopeTitle}>
            {I18N.enterpriseCarbonAccount2.scope2}
          </div>
          <div className={styles.info}>
            <div className={styles.infoTitle}>
              {I18N.enterpriseCarbonAccount2.basedOnLocation}
            </div>
            <div className={styles.infoValue}>
              {reportData?.scope2EmissionsLocation}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.infoTitle}>
              {I18N.enterpriseCarbonAccount2.basedOnTheMarket}
            </div>
            <div className={styles.infoValue}>
              {reportData?.scope2EmissionsMarket}
            </div>
          </div>
        </div>
        <div className={styles.scope1}>
          <div className={styles.scopeTitle}>
            {I18N.enterpriseCarbonAccount2.fanWeisan}
          </div>
          <div className={styles.info}>
            <div className={styles.infoTitle}>
              {I18N.enterpriseCarbonAccount2.purchasedGoodsAnd}
            </div>
            <div className={styles.infoValue}>
              {reportData?.scope3Emission[0]?.emissions}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.infoTitle}>
              {I18N.enterpriseCarbonAccount2.equityAsACommodity}
            </div>
            <div className={styles.infoValue}>
              {reportData?.scope3Emission[1]?.emissions}
            </div>
          </div>
          <ReportYearModal reportData={reportData} />
          {/* <div className={styles.more}>查看更多</div> */}
          <div className={styles.info}>
            <div className={styles.infoTitle}>{I18N.carbonFootprint.total}</div>
            <div className={styles.infoValue}>{reportData?.scope3Total}</div>
          </div>
        </div>
        <div className={styles.sum}>
          <div className={styles.scopeTitle}>{I18N.carbonFootprint.total}</div>
          <div className={styles.info}>
            <div className={styles.infoTitle}>
              {I18N.enterpriseCarbonAccount2.basedOnLocation}
            </div>
            <div className={styles.infoValue}>
              {reportData?.yearEmissionLocation}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.infoTitle}>
              {I18N.enterpriseCarbonAccount2.basedOnTheMarket}
            </div>
            <div className={styles.infoValue}>
              {reportData?.yearEmissionMarket}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.unit}>{I18N.enterpriseCarbonAccount2.unitTCo}</div>
    </div>
  );
};
