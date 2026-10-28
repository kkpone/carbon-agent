import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

import styles from './index.module.less';
import { ReportData } from '../../service';

export const ReportYearModal = (props: { reportData?: ReportData }) => {
  const [visible, setVisible] = useState(false);
  const { reportData } = props;
  return (
    <>
      <div className={styles.more} onClick={() => setVisible(true)}>
        {I18N.components.viewMore}
      </div>
      <Modal
        open={visible}
        title={I18N.enterpriseCarbonAccount2.reportedAnnualEmissions}
        width={768}
        onCancel={() => setVisible(false)}
        onOk={() => setVisible(false)}
      >
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
          <div className={classNames(styles.scope1, styles.scope3)}>
            <div className={styles.scopeTitle}>
              {I18N.enterpriseCarbonAccount2.fanWeisan}
            </div>
            {reportData?.scope3Emission?.map(item => (
              <div className={styles.scope3Item} key={item.category}>
                <div className={styles.title}>{item.category}</div>
                <div className={styles.value}>{item.emissions}</div>
              </div>
            ))}
          </div>
          <div className={styles.sum}>
            <div className={styles.scopeTitle}>
              {I18N.carbonFootprint.total}
            </div>
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
        <div className={styles.unit}>
          {I18N.enterpriseCarbonAccount2.unitTCo}
        </div>
      </Modal>
    </>
  );
};
