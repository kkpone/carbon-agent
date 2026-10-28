/**
 * @description CBAM前体数据审批详情
 */

import { compact } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { usePageInfo } from '@/hooks';
import I18N from '@/lang/I18N';
import { checkAuth } from '@/layout/utills';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import { toNavigate } from '../../router';
import { Toast } from '@/utils';
import ApproveInfo from '@/views/components/ApproveInfo';
import { ApproveModal } from '@/views/supplyChainCarbonManagement/components/ApproveModal';

import {
  getSchemas,
  TAB_LIST,
  TABS_TYPE,
} from '../../PrecursorData/Info/constants';
import { PRECURSOR_DATA_STATUS } from '../../PrecursorData/constants';
import { getPrecursorDataFillDataDetail } from '../../PrecursorDataFill/service';
import TabPage from '../../components/TabPage';
import {
  getPrecursorAuditProcessList,
  getPrecursorAuditRecordList,
  getPrecursorDataApprovalDetail,
  postPrecursorAudit,
} from '../service';
import {
  AuditListType,
  PrecursorAuditLogResq,
  PrecursorAuditNodeResq,
  PrecursorDataApprovalListProps,
} from '../type';

const { PENDING_APPROVAL } = PRECURSOR_DATA_STATUS;

const { DATA_OVERVIEW, FILLED_DATA, APPROVAL_DETAIL } = TABS_TYPE;

const PrecursorDataApprovalInfo = () => {
  const { isDetail, id } = usePageInfo();
  const navigate = toNavigate(useHistory());

  /** 审批id */
  const [auditDataId, setAuditDataId] = useState<number>();

  /** 是否是待审批 */
  const [isToBeReviewed, setIsToBeReviewed] = useState(false);

  /** 当前选择的TAB */
  const [currentTab, setCurrentTab] = useState(DATA_OVERVIEW);

  /** 审批详情数据 */
  const [approvalData, setApprovalData] =
    useState<PrecursorDataApprovalListProps>();

  /** 审批流程列表 */
  const [auditProcessList, setAuditProcessList] =
    useState<PrecursorAuditNodeResq[]>();

  /** 审批记录列表 */
  const [auditRecordList, setAuditRecordList] =
    useState<PrecursorAuditLogResq[]>();

  /** 控制审核弹窗的显隐 */
  const [open, setOpen] = useState(false);

  /** 公共单位 */
  const [unit, setUnit] = useState<string>(I18N.Factors.unit);

  /** 不同tab下的form schema */
  const schema = getSchemas(currentTab, unit);

  /** 获取CBAM前体数据审批-详情数据 */
  useEffect(() => {
    if (id && currentTab !== APPROVAL_DETAIL) {
      getPrecursorDataApprovalDetail({ id }).then(({ data }) => {
        setUnit(data?.data?.unitName || I18N.Factors.unit);
        setAuditDataId(data?.data?.auditDataId);
        setIsToBeReviewed(data?.data?.applyStatus === PENDING_APPROVAL);

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

  /** 获取审批详情Tab下的数据 */
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
      buttons={compact([
        !isDetail &&
          isToBeReviewed &&
          checkAuth('/cbam/precursorApproval/approve', {
            type: 'primary',
            title: I18N.eca.auditing,
            onClick: async () => {
              setOpen(true);
            },
          }),
        {
          title: I18N.Factors.return,
          onClick: async () => {
            navigate(CBAMRouteMaps.cbamPrecursorDataApproval);
          },
        },
      ])}
      onChange={key => setCurrentTab(key)}
    >
      {currentTab === APPROVAL_DETAIL && (
        <ApproveInfo
          processDataSource={auditProcessList}
          recordDataSource={auditRecordList}
        />
      )}
      {/* 审批弹窗 */}
      <ApproveModal
        open={open}
        handleCancel={() => {
          setOpen(false);
        }}
        handleOk={(value: AuditListType) => {
          if (auditDataId) {
            postPrecursorAudit({
              ...value,
              auditDataId,
            }).then(({ data }) => {
              if (data.code === 200) {
                setOpen(false);
                Toast(
                  'success',
                  I18N.supplyChainCarbonManagement.approvalSuccessful,
                );
                navigate(CBAMRouteMaps.cbamPrecursorDataApproval);
              }
            });
          }
        }}
      />
    </TabPage>
  );
};

export default PrecursorDataApprovalInfo;
