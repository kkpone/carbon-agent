import { useSubscriptionServiceModal } from '@src/components/SubscriptionServiceModal';
import I18N from '@src/lang/I18N';
import { Button, Spin } from 'antd';
import { FC, useEffect, useState } from 'react';

import { ECompanyType } from '@/api/types';
import businessRiskIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/business-risk.svg';
import businessScopeIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/business-scope.svg';
import businessStandardIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/business-standard.svg';
import { getUserInfo } from '@/utils';
import { ProductSource } from '@/views/system/login/component/Login';

import styles from './index.module.less';
import { BusinessForesightData, getBusinessForesight } from './service';

interface Topic {
  key: keyof BusinessForesightData;
  label: string;
  rowClass: 'standardRow' | 'scopeRow' | 'riskRow';
  icon: string;
}

const TOPICS: Topic[] = [
  {
    key: 'standard',
    label: I18N.carbonFootprint3.referenceStandard,
    rowClass: 'standardRow',
    icon: businessStandardIcon,
  },
  {
    key: 'scope',
    label: I18N.carbonFootprint3.applicationScope,
    rowClass: 'scopeRow',
    icon: businessScopeIcon,
  },
  {
    key: 'riskAvoidance',
    label: I18N.carbonFootprint3.riskAvoidance,
    rowClass: 'riskRow',
    icon: businessRiskIcon,
  },
];

interface BusinessForesightCardProps {
  accountId: number | string;
}

const BusinessForesightCard: FC<BusinessForesightCardProps> = ({
  accountId,
}) => {
  /** 仅 companyType=ECompanyType.lite（轻量版）展示头部两个订阅入口按钮 */
  const hideExpertActions =
    String(getUserInfo()?.userInfo?.companyType ?? '') !== ECompanyType.lite;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BusinessForesightData | null>(null);
  const { openSubscriptionModal } = useSubscriptionServiceModal();

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    getBusinessForesight({ accountId })
      .then(res => {
        setData(res?.data?.data ?? null);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accountId]);

  if (!loading && !data) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.aiPrefix}>AI</span>
          <span className={styles.title}>
            {I18N.carbonFootprint3.businessForesight}
          </span>
        </div>
        {!hideExpertActions && (
          <div className={styles.actions}>
            <Button
              className={styles.actionBtn}
              onClick={() =>
                openSubscriptionModal({
                  productSource: ProductSource.product,
                  preselectProfessionalSupportKeyword:
                    I18N.carbonFootprint3.expertReview,
                })
              }
            >
              {I18N.carbonFootprint3.expertReview}
            </Button>
            <Button
              className={styles.actionBtnPrimary}
              onClick={() =>
                openSubscriptionModal({
                  productSource: ProductSource.product,
                  preselectProfessionalSupportKeyword:
                    I18N.carbonFootprint3.productCertification,
                })
              }
            >
              {I18N.carbonFootprint3.productCertification}
            </Button>
          </div>
        )}
      </div>
      <Spin spinning={loading}>
        <div className={styles.topicList}>
          {TOPICS.map(topic => (
            <div
              key={topic.key}
              className={`${styles.topicRow} ${styles[topic.rowClass]}`}
            >
              <div className={styles.topicHeader}>
                <img className={styles.topicIcon} src={topic.icon} alt='' />
                <span className={styles.topicTitle}>{topic.label}</span>
              </div>
              <span className={styles.topicContent}>
                {data?.[topic.key] ?? ''}
              </span>
            </div>
          ))}
        </div>
      </Spin>
    </div>
  );
};

export default BusinessForesightCard;
