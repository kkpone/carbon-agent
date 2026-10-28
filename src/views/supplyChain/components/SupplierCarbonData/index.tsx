/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormActions } from '@src/components/FormActions';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMapsSupplyChain2 } from '@src/router/route-paths/supplyChain2';
import { Toast } from '@src/utils/Toast';
import { Input, Tabs } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import AuditModal from './AuditModal';
import AuditRecordTable from './AuditRecordTable';
import Details from './Details';
import styles from './index.module.less';
import { carbonDataAudit } from './service';
import {
  CARBON_DATA_BORDER_TYPE_LABEL,
  CARBON_DATA_DATA_TYPE_LABEL,
  CARBON_DATA_REQ_TYPE_LABEL,
  CARBON_DATA_STATUS,
  SUPPLIER_CARBON_DATA_STATUS_LABEL,
} from '../../constant';
import { getSupplierCarbonData } from '../../service';
import { CarbonData } from '../../type';

const TAB_KEYS = {
  OVERVIEW: 'OVERVIEW',
  DETAILS: 'DETAILS',
  AUDIT_RECORD: 'AUDIT_RECORD',
};

const { OVERVIEW, DETAILS, AUDIT_RECORD } = TAB_KEYS;

type SupplierCarbonDataProps = {
  id: number | string;
  audit?: boolean;
  hiddenOperateButtons?: boolean;
};

const SupplierCarbonData: FC<SupplierCarbonDataProps> = ({
  id,
  audit,
  hiddenOperateButtons,
}) => {
  const history = useHistory();

  const [tabKey, setTabKey] = useState(OVERVIEW);

  const [auditModalVisible, setAuditModalVisible] = useState(false);

  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);

  const carbonDataId = Number(id);

  useEffect(() => {
    getSupplierCarbonData({
      id: carbonDataId,
    }).then(({ data }) => setCarbonData(data.data));
  }, [carbonDataId]);

  const cancel = () => {
    history.push({
      pathname: RouteMapsSupplyChain2.supplyChainCarbonDataFillList,
    });
  };

  const auditSubmit = async (data: {
    result:
      | typeof CARBON_DATA_STATUS.APPROVED
      | typeof CARBON_DATA_STATUS.DISAPPROVED;
    content?: string;
  }) => {
    await carbonDataAudit({ id: carbonDataId, ...data });
    Toast('success', I18N.enterpriseCarbonAccount2.reviewSuccessful);
    cancel();
  };

  return (
    <div className={styles.supplierCarbonData}>
      <Tabs activeKey={tabKey} onChange={setTabKey}>
        <Tabs.TabPane
          key={OVERVIEW}
          tab={I18N.carbonFootprint3.overviewOfCarbonData}
        />
        <Tabs.TabPane key={DETAILS} tab={I18N.router.carbonDataDetails} />
        <Tabs.TabPane
          key={AUDIT_RECORD}
          tab={I18N.carbonFootprint3.auditRecords}
        />
      </Tabs>
      <div className={styles.supplierCarbonDataContent}>
        {tabKey === OVERVIEW && (
          <>
            <div className={styles.carbonDataInfo}>
              <IconAlibaba
                className={styles.companyIcon}
                type='icon-icon_qiye'
              />
              <div className={styles.carbonDataInfoItem}>
                <span className={styles.caption}>
                  {I18N.supplyChain2.supplierName}
                </span>
                <span>{carbonData?.replyCompanyName || '-'}</span>
              </div>
              <div className={styles.carbonDataInfoItem}>
                <span className={styles.caption}>
                  {I18N.supplyChain.dataType}
                </span>
                <span>
                  {carbonData
                    ? CARBON_DATA_REQ_TYPE_LABEL[carbonData.reqType]
                    : '-'}
                </span>
              </div>
              <div className={styles.carbonDataInfoItem}>
                <span className={styles.caption}>
                  {I18N.supplyChain.submissionTime}
                </span>
                <span>{carbonData?.replyTime || '-'}</span>
              </div>
              <div className={styles.carbonDataInfoItem}>
                <span className={styles.caption}>{I18N.supplyChain.state}</span>
                <span>
                  {carbonData
                    ? SUPPLIER_CARBON_DATA_STATUS_LABEL[carbonData.status]
                    : '-'}
                </span>
              </div>
            </div>
            <div className={styles.secondaryTitle}>
              {I18N.supplyChain.dataRequestLetter}
            </div>
            <div className={styles.productInfo}>
              <div className={styles.productInfoItem}>
                <div className={styles.caption}>
                  {I18N.supplyChain.requestProduct}
                </div>
                <div>{carbonData?.name}</div>
              </div>
              <div className={styles.productInfoItem}>
                <div className={styles.caption}>
                  {I18N.carbonFootprint3.accountingUnit}
                </div>
                <div>{carbonData?.computeUnitDesc}</div>
              </div>
              <div className={styles.productInfoItem}>
                <div className={styles.caption}>
                  {I18N.carbonFootprint3.dataRequestClass}
                </div>
                <div>
                  {carbonData
                    ? `${CARBON_DATA_REQ_TYPE_LABEL[carbonData.reqType]}${
                        CARBON_DATA_DATA_TYPE_LABEL[carbonData.dataType]
                      }`
                    : ''}
                </div>
              </div>
            </div>
            <div className={styles.productInfo}>
              <div className={styles.productInfoItem}>
                <div className={styles.caption}>
                  {I18N.carbonFootprint3.theSystemBoundaryNeedsTo}
                </div>
                <div>
                  {carbonData
                    ? CARBON_DATA_BORDER_TYPE_LABEL[carbonData.footBorderType]
                    : ''}
                </div>
              </div>
            </div>
            <div className={styles.productInfo}>
              <div className={styles.productInfoItem}>
                <div className={styles.caption}>
                  {I18N.carbonFootprint3.dataRequirementDescription}
                </div>
                <div>{carbonData?.descr}</div>
              </div>
            </div>
            <div className={styles.productInfo}>
              <div className={styles.productInfoItem}>
                <div className={styles.caption}>{I18N.system.applicant}</div>
                <div>{carbonData?.contacts || '-'}</div>
              </div>
              <div className={styles.productInfoItem}>
                <div className={styles.caption}>
                  {I18N.supplyChain2.applicantContact}
                </div>
                <div>{carbonData?.phone || '-'}</div>
              </div>
              <div className={styles.productInfoItem}>
                <div className={styles.caption}>
                  {I18N.system.applicationTime}
                </div>
                <div>{carbonData?.createTime || '-'}</div>
              </div>
            </div>
          </>
        )}
        {tabKey === DETAILS && carbonData && (
          <Details carbonData={carbonData} />
        )}
        {tabKey === AUDIT_RECORD && <AuditRecordTable id={carbonDataId} />}
      </div>
      {!hiddenOperateButtons && (
        <FormActions
          place='center'
          buttons={
            audit
              ? [
                  {
                    title: I18N.carbonFootprint3.auditing,
                    type: 'primary',
                    loading: false,
                    permission: 'supplier:data:audit',
                    onClick: async () => setAuditModalVisible(true),
                  },
                  { title: I18N.carbonFootprint.cancel, onClick: cancel },
                ]
              : [{ title: I18N.carbonFootprint.return, onClick: cancel }]
          }
        />
      )}
      <AuditModal
        visible={auditModalVisible}
        onCancel={() => setAuditModalVisible(false)}
        onConfirm={auditSubmit}
      />
    </div>
  );
};

export default SupplierCarbonData;
