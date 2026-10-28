import { LinkOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import styles from './index.module.less';
import { getAccountShareFlagText, isSharedAccount } from '../../share';

type ShareStatusTagProps = {
  shareFlag?: number | null;
  sourceCompanyName?: string | null;
  /** 受共享模型是否在 hover 时展示来源组织 */
  showSourceTooltip?: boolean;
  className?: string;
};

/** 核算列表共享状态 tag，视觉对齐产品详情 AccountListCard */
const ShareStatusTag: FC<ShareStatusTagProps> = ({
  shareFlag,
  sourceCompanyName,
  showSourceTooltip = true,
  className,
}) => {
  const shareText = getAccountShareFlagText(shareFlag);
  if (!shareText) return null;

  const tag = (
    <div className={classNames(styles.shareStatus, className)}>
      <span className={styles.shareStatusIcon}>
        <LinkOutlined />
      </span>
      <span className={styles.shareStatusText}>{shareText}</span>
    </div>
  );

  const shouldShowSource =
    showSourceTooltip &&
    isSharedAccount(shareFlag) &&
    Boolean(sourceCompanyName?.trim());

  if (!shouldShowSource) {
    return <div className={styles.shareStatusWrap}>{tag}</div>;
  }

  return (
    <div className={styles.shareStatusWrap}>
      <Tooltip
        color='#fff'
        title={
          <div
            style={{
              color: '#04252b',
              fontSize: 12,
              lineHeight: '18px',
              whiteSpace: 'nowrap',
            }}
          >
            {I18N.template(I18N.carbonFootprint3.sourceCompanyNameWithValue, {
              val1: sourceCompanyName,
            })}
          </div>
        }
        overlayInnerStyle={{
          padding: '8px 12px',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgb(4 37 43 / 12%)',
        }}
      >
        {tag}
      </Tooltip>
    </div>
  );
};

export default ShareStatusTag;
