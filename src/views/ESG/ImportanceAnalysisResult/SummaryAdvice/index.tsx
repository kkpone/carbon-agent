import I18N from '@src/lang/I18N';
import aiSvg from '@src/assets/icon/esg/ai.svg';
import { Spin } from 'antd';
import { FC, useState } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import { genSummaryAdvice } from './service';

const SummaryAdvice: FC<{
  id: string;
  analysisInfo: Record<string, any>;
  editPermission: boolean;
  updateImportanceAnalysis: () => Promise<void>;
}> = ({ id, analysisInfo, editPermission, updateImportanceAnalysis }) => {
  const [loading, setLoading] = useState(false);

  const [closed, setClosed] = useState(false);

  const { chartAnalysis } = analysisInfo;

  const generateAdvice = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setClosed(false);
      await genSummaryAdvice({ id });
      await updateImportanceAnalysis();
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.summaryAdvice}>
      <div className={styles.title}>
        {I18N.esg.topicResults}
        {editPermission && (
          <div className={styles.AiBtn} onClick={generateAdvice}>
            <IconAlibabaNew className={styles.AiIcon} type='icon-a-AItag' />
            <span className={styles.AiBtnText}>{I18N.esg.analysis}</span>
          </div>
        )}
      </div>
      {!closed && (
        <div className={styles.adviceContent}>
          <Spin spinning={loading}>
            <div className={styles.adviceContentHeader}>
              <div className={styles.adviceContentHeaderTitle}>
                <img src={aiSvg} className={styles.svg} alt='' />
                {I18N.esg.analysisResults}
              </div>
              <IconAlibabaNew
                className={styles.closeIcon}
                type='icon-icon-guanbi'
                onClick={() => setClosed(true)}
              />
            </div>
            <div>{chartAnalysis}</div>
          </Spin>
        </div>
      )}
    </div>
  );
};

export default SummaryAdvice;
