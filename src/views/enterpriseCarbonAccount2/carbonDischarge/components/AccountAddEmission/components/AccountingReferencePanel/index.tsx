import { InfoCircleOutlined } from '@ant-design/icons';
import emptyImg from '@assets/svg/empty.svg';
import I18N from '@src/lang/I18N';
import { Button, InputNumber, Tooltip } from 'antd';

import { IconAlibaba } from '@/components/iconfont';

import styles from './index.module.less';
import {
  AccountingReferencePanelProps,
  AccountingReferenceValue,
} from './types';
import { ACCOUNT_REFERENCE_WAY } from '../../constant';

export type { AccountingReferenceValue } from './types';

const hasReference = (value?: AccountingReferenceValue) =>
  Boolean(
    value?.accountId ||
      value?.supplyAccountId ||
      value?.factorName ||
      value?.productName,
  );

const AccountingReferencePanel = ({
  value,
  readPretty = false,
  unitConver,
  unitConverError,
  activityUnitName,
  factorUnitName,
  functionalUnitName,
  onUnitConverChange,
  onSelect,
  onViewDetail,
}: AccountingReferencePanelProps) => {
  if (!hasReference(value)) {
    return (
      <div className={styles.panel}>
        <div className={styles.tip}>
          {I18N.enterpriseCarbonAccount2.accountingReferenceTip}
        </div>
        <div className={styles.empty}>
          <img
            className={styles.emptyIcon}
            src={emptyImg}
            width={64}
            height={64}
            alt=''
          />
          <div className={styles.emptyText}>
            {I18N.enterpriseCarbonAccount2.notAssociatedAccounting}
          </div>
          {!readPretty && (
            <Button
              className={styles.selectButton}
              type='link'
              onClick={onSelect}
            >
              {I18N.enterpriseCarbonAccount2.selectAccounting}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.tip}>
        {I18N.enterpriseCarbonAccount2.accountingReferenceTip}
      </div>
      <div className={styles.cardBorder}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span
              className={styles.accountName}
              title={value?.factorName || '-'}
            >
              {value?.factorName || '-'}
            </span>
            {onViewDetail && (
              <Tooltip title={I18N.carbonFootprint3.viewDetails}>
                <button
                  className={styles.detailTrigger}
                  type='button'
                  onClick={onViewDetail}
                  aria-label={I18N.carbonFootprint3.viewDetails}
                >
                  <IconAlibaba
                    className={styles.detailIcon}
                    type='icon-icon_chakanxiangqing'
                  />
                </button>
              </Tooltip>
            )}
            {!readPretty && (
              <Button
                className={styles.changeButton}
                type='link'
                onClick={onSelect}
              >
                <IconAlibaba
                  className={styles.changeIcon}
                  type='icon-icon-tongzhi-1'
                />
                {I18N.enterpriseCarbonAccount2.selectAccounting}
              </Button>
            )}
          </div>
          <div className={styles.dataGrid}>
            <div className={styles.dataItem}>
              <strong className={styles.dataValue}>
                {Number(value?.referWay) === ACCOUNT_REFERENCE_WAY.RESULT
                  ? I18N.carbonFootprint3.referenceResult
                  : Number(value?.referWay) === ACCOUNT_REFERENCE_WAY.MODEL
                  ? I18N.carbonFootprint3.referenceModel
                  : '-'}
              </strong>
              <span className={styles.dataLabel}>
                {I18N.enterpriseCarbonAccount2.referenceType}
              </span>
            </div>
            <div className={styles.dataItem}>
              <strong
                className={styles.dataValue}
                title={value?.productName || '-'}
              >
                {value?.productName || '-'}
              </strong>
              <span className={styles.dataLabel}>
                {I18N.enterpriseCarbonAccount2.productName}
              </span>
            </div>
            <div className={styles.dataItem}>
              <strong className={styles.dataValue}>
                {value?.factorValue ?? '-'}
                {factorUnitName ? ` ${factorUnitName}` : ''}
              </strong>
              <span className={styles.dataLabel}>
                {I18N.enterpriseCarbonAccount2.unitEmission}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.ratePanel}>
          <div className={styles.rateTitle}>
            {!readPretty && <span className={styles.required}>*</span>}
            {
              I18N.enterpriseCarbonAccount2
                .accountingReferenceUnitConversionRatio
            }
            <Tooltip title={I18N.components.activityDataSheet2}>
              <InfoCircleOutlined className={styles.rateInfoIcon} />
            </Tooltip>
          </div>
          <div className={styles.rateBody}>
            <div className={styles.rateRow}>
              <span className={styles.rateUnit}>
                1 {activityUnitName || '-'}
              </span>
              <span className={styles.rateEqual}>
                {I18N.components.equalTo}
              </span>
              {readPretty ? (
                <span className={styles.rateValue}>{unitConver ?? '-'}</span>
              ) : (
                <InputNumber
                  stringMode
                  controls={false}
                  min='0.0000000000001'
                  className={styles.rateInput}
                  status={unitConverError ? 'error' : undefined}
                  value={unitConver}
                  onChange={onUnitConverChange}
                />
              )}
              <span className={styles.rateUnit}>
                {functionalUnitName || '-'}
              </span>
            </div>
            <div className={styles.rateHint}>
              {I18N.components.activityDataSheet}
            </div>
          </div>
          {unitConverError && (
            <div className={styles.error}>{unitConverError}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountingReferencePanel;
