import I18N from '@src/lang/I18N';
import React from 'react';

import frame from './Frame.png';
import styles from './index.module.less';
import { ReportData } from '../../service';

interface EnergyProps {
  // Add any props you need for the component here
  reportData?: ReportData;
}

export const Energy: React.FC<EnergyProps> = props => (
  // Add your component logic here

  // Add your JSX code here
  <div>
    <div className={styles.title}>
      {props?.reportData?.energy}
      {/* <div className={styles.left}>
        <div className={styles.label}>报告年营收</div>
        <div className={styles.value}>多于</div>
        <div className={styles.percent}>10%</div>
      </div>
      <div className={styles.left}>
        <div className={styles.value}>2021年4月1日-2022年3月31日</div>
        <div className={styles.percent}>美元</div>
      </div> */}
    </div>
    <div className={styles.table}>
      <div className={styles.scope1}>
        <div className={styles.scopeTitle}>
          <img src={frame} alt='' />
          {I18N.enterpriseCarbonAccount2.renewableEnergy}</div>
        <div className={styles.info}>
          <div className={styles.infoTitle}>{I18N.enterpriseCarbonAccount2.totalConsumption}</div>
          <div className={styles.infoValue}>{props?.reportData?.renewable}</div>
        </div>
      </div>
      <div className={styles.scope1}>
        <div className={styles.scopeTitle}>{I18N.enterpriseCarbonAccount2.nonRenewableEnergy}</div>
        <div className={styles.info}>
          <div className={styles.infoTitle}>{I18N.enterpriseCarbonAccount2.totalConsumption}</div>
          <div className={styles.infoValue}>
            {props?.reportData?.nonRenewable}
          </div>
        </div>
      </div>
      <div className={styles.sum}>
        <div className={styles.scopeTitle}>{I18N.carbonFootprint.total}</div>
        <div className={styles.info}>
          <div className={styles.infoTitle}>{I18N.enterpriseCarbonAccount2.totalConsumption}</div>
          <div className={styles.infoValue}>
            {props?.reportData?.renewableTotal}
          </div>
        </div>
      </div>
    </div>
    <div className={styles.unit}>{I18N.enterpriseCarbonAccount2.unitMWh}</div>
  </div>
);
