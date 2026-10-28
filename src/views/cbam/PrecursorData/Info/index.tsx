/**
 * @description CBAM前体数据详情
 */
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { usePageInfo } from '@/hooks';
import I18N from '@/lang/I18N';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { toNavigate } from '../../router';
import ApproveInfo from '@/views/components/ApproveInfo';

import { getSchemas, TAB_LIST, TABS_TYPE } from './constants';
import {
  getPrecursorAuditProcessList,
  getPrecursorAuditRecordList,
  getPrecursorDataApprovalDetail,
} from '../../PrecursorDataApproval/service';
import {
  PrecursorAuditLogResq,
  PrecursorAuditNodeResq,
  PrecursorDataApprovalListProps,
} from '../../PrecursorDataApproval/type';
import { getPrecursorDataFillDataDetail } from '../../PrecursorDataFill/service';
import TabPage from '../../components/TabPage';

const { DATA_OVERVIEW, FILLED_DATA, APPROVAL_DETAIL } = TABS_TYPE;

const PrecursorDataInfo = () => {
  const { id } = usePageInfo();

  const navigate = toNavigate(useHistory());

  /** 当前tab值 */
  const [currentTab, setCurrentTab] = useState(DATA_OVERVIEW);

  /** 详情数据 */
  const [approvalData, setApprovalData] =
    useState<PrecursorDataApprovalListProps>();

  /** 审批流程列表 */
  const [auditProcessList, setAuditProcessList] =
    useState<PrecursorAuditNodeResq[]>();

  /** 审批记录列表 */
  const [auditRecordList, setAuditRecordList] =
    useState<PrecursorAuditLogResq[]>();

  /** 公共单位 */
  const [unit, setUnit] = useState<string>(I18N.Factors.unit);

  const schema = getSchemas(currentTab, unit);

  /** 获取CBAM前体数据-详情数据 */
  useEffect(() => {
    if (id && currentTab !== APPROVAL_DETAIL) {
      getPrecursorDataApprovalDetail({ id }).then(({ data }) => {
        setUnit(data?.data?.unitName || I18N.Factors.unit);

        if (currentTab === FILLED_DATA) {
          /** 隐含排放数据 */
          getPrecursorDataFillDataDetail({ id }).then(({ data: result }) => {
            const { supplyAttributionList = [] } = result?.data || {};

            setApprovalData({
              ...data?.data,
              supplyAttributionList,
            });
          });
        } else {
          setApprovalData(data?.data);
        }
      });
    }
  }, [id, currentTab]);

  /** 获取审批详情数据 */
  useEffect(() => {
    if (id && currentTab === APPROVAL_DETAIL) {
      /** 审批流程 */
      getPrecursorAuditProcessList({ id }).then(({ data }) => {
        setAuditProcessList(data?.data);
      });
      /** 审批记录 */
      getPrecursorAuditRecordList({ id }).then(({ data }) => {
        setAuditRecordList(data?.data);
      });
    }
  }, [id, currentTab]);

  return (
    <TabPage
      showDetail
      initialValues={approvalData}
      currentTab={currentTab}
      tabList={TAB_LIST}
      schema={schema}
      buttons={[
        {
          title: I18N.Factors.return,
          onClick: async () => {
            navigate(CBAMRouteMaps.cbamPrecursorData);
          },
        },
      ]}
      onChange={key => setCurrentTab(key)}
    >
      {/* 审批详情 */}
      {currentTab === APPROVAL_DETAIL && (
        <ApproveInfo
          processDataSource={auditProcessList}
          recordDataSource={auditRecordList}
        />
      )}
    </TabPage>
  );
};

export default PrecursorDataInfo;
