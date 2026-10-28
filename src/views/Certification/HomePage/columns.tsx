/* eslint-disable @typescript-eslint/no-unused-vars */

import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import I18N from '@src/lang/I18N';
import { Button, message, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { compact } from 'lodash-es';

import {
  CERTIFYPROJECTSTATUS,
  CERTIFYPROJECTSTATUS_COLOR,
  CERTIFYPROJECTSTATUS_LABEL,
  CERTIFYPROJECTTYPE,
  CERTIFYPROJECTTYPE_LABEL,
  PAGETAYPE,
} from './const';
import style from './index.module.less';
// import Tags from '../component/Tags';
import { CarbonAuthInfoReturn } from './type';
import { ComfirmCertificate } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/components/ComfirmCertificate';

export const columns = ({
  onSubmit,
  onRetract,
  onDelete,
  onPageTo,
  onDownload,
  onDownloadComfirmFile,
  refresh,
}: {
  onSubmit: (id: number, name: string, authFile: any[]) => Promise<void>;
  onRetract: (id: number, name: string) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
  onPageTo: (
    pageType: PAGETAYPE,
    id?: number,
    applyNo?: string,
    authType?: number,
  ) => void;
  onDownload: (id: number) => void;
  onDownloadComfirmFile: (id: number, status: CERTIFYPROJECTSTATUS) => void;
  refresh?: () => void;
}): ColumnsType<CarbonAuthInfoReturn> => [
  {
    title: I18N.carbonFootprint.number,
    width: 68,
    fixed: 'left',
    dataIndex: 'allIndex',
  },
  {
    title: I18N.subModules.certificationProjectName,
    width: 228,
    fixed: 'left',
    dataIndex: 'projectName',
    ellipsis: {
      showTitle: false,
    },
    render: projectName => (
      <Tooltip placement='topLeft' title={projectName}>
        {projectName}
      </Tooltip>
    ),
  },
  {
    title: I18N.Certification.certificationBodies,
    dataIndex: 'certOrgName',
    width: 240,
    ellipsis: true,
    render: (t: string) => t || '-',
  },
  {
    title: 'ID',
    width: 200,
    dataIndex: 'projectNo',
  },
  {
    title: I18N.Certification.authenticationType,
    width: 150,
    dataIndex: 'authType',
    render: (t: CERTIFYPROJECTTYPE) =>
      CERTIFYPROJECTTYPE_LABEL[t] ? CERTIFYPROJECTTYPE_LABEL[t] : '-',
  },
  // {
  //   title: I18N.Certification.certificationContent,
  //   width: 192,
  //   dataIndex: 'reportName',
  //   ellipsis: true,
  // },
  {
    title: I18N.Certification.certificationStatus,
    dataIndex: 'status',
    width: 190,
    render: (t: CERTIFYPROJECTSTATUS) =>
      CERTIFYPROJECTSTATUS_LABEL[t] ? (
        // <Badge
        //   className={style.certificationBadage}
        //   color={CERTIFYPROJECTSTATUS_COLOR[t]}
        //   text={CERTIFYPROJECTSTATUS_LABEL[t]}
        // />
        <div
          className={style.certificationBadage}
          style={{
            backgroundColor: CERTIFYPROJECTSTATUS_COLOR[t] || '#F3F3F3',
          }}
        >
          {CERTIFYPROJECTSTATUS_LABEL[t]}
        </div>
      ) : (
        '-'
      ),
  },
  {
    dataIndex: 'contract',
    title: I18N.Certification.contract,
    width: 130,
    render: (_, { confirmFile }) => {
      const contractFile = confirmFile?.find(
        item => item.type === 'contractFile',
      )?.file;
      return contractFile ? (
        <Button
          className={style.textBtn}
          type='link'
          onClick={() => window.open(contractFile.url, '_blank')}
        >
          {I18N.carbonFootprint.download}
        </Button>
      ) : (
        '-'
      );
    },
  },
  {
    dataIndex: 'auditReport',
    title: I18N.subModules.onSiteInspectionReport,
    width: 130,
    render: (_, { confirmFile }) => {
      const auditRptFile = confirmFile?.find(
        item => item.type === 'auditRpt',
      )?.file;
      return auditRptFile ? (
        <Button
          className={style.textBtn}
          type='link'
          onClick={() => window.open(auditRptFile.url, '_blank')}
        >
          {I18N.carbonFootprint.download}
        </Button>
      ) : (
        '-'
      );
    },
  },
  {
    dataIndex: 'inspectionReport',
    title: I18N.subModules.verificationReport,
    width: 130,
    render: (_, { confirmFile }) => {
      const verifyRptFile = confirmFile?.find(
        item => item.type === 'verifyRpt',
      )?.file;
      return verifyRptFile ? (
        <Button
          className={style.textBtn}
          type='link'
          onClick={() => window.open(verifyRptFile.url, '_blank')}
        >
          {I18N.carbonFootprint.download}
        </Button>
      ) : (
        '-'
      );
    },
  },
  {
    dataIndex: 'updateTime',
    title: I18N.subModules.confirmFile,
    width: 130,
    // fixed: 'right',
    render: (t, r) => {
      const hasAudit = checkPermissions(
        true,
        'CertificationCarbonFootprintProject:Download',
      );
      if (
        ![
          CERTIFYPROJECTSTATUS.WAIT_CONFIRM,
          CERTIFYPROJECTSTATUS.SUCCESS,
          CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE,
        ].includes(r.status) ||
        !hasAudit
      ) {
        return <div className={style.center}>-</div>;
      }

      const { authType, confirmFile } = r;

      const certSignFile = confirmFile?.find(
        item => item.type === 'certSign',
      )?.file;
      const certFile = confirmFile?.find(
        item => item.type === 'certFile',
      )?.file;
      if (certSignFile) {
        return (
          <Button
            className={style.textBtn}
            type='link'
            onClick={() => window.open(certSignFile.url, '_blank')}
          >
            {I18N.Certification.downloadTheSignedVersion}
          </Button>
        );
      }
      if (certFile) {
        return (
          <Button
            className={style.textBtn}
            type='link'
            onClick={() => window.open(certFile.url, '_blank')}
          >
            {I18N.carbonFootprint.download}
          </Button>
        );
      }
      return <div className={style.center}>-</div>;

      // return (
      //   <div className={style.center}>
      //     <Button
      //       className={style.textBtn}
      //       type='link'
      //       onClick={() => onDownloadComfirmFile(r?.id, r?.status)}
      //     >
      //       {[
      //         CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE,
      //         CERTIFYPROJECTSTATUS.SUCCESS,
      //       ].includes(r?.status)
      //         ? I18N.Certification.downloadTheSignedVersion
      //         : I18N.carbonFootprint.download}
      //     </Button>
      //   </div>
      // );
    },
  },
  {
    title: I18N.Certification.authenticationCertificate,
    width: 120,
    // fixed: 'right',
    dataIndex: 'set',
    render: (t, r) => {
      const hasAudit = checkPermissions(
        true,
        'CertificationCarbonFootprintProject:Download',
      );
      if (r.status !== CERTIFYPROJECTSTATUS.SUCCESS) {
        return <div className={style.center}>-</div>;
      }

      return (
        <div className={style.center}>
          <Button
            className={style.textBtn}
            type='link'
            onClick={hasAudit ? () => onDownload(r?.id) : () => {}}
          >
            {hasAudit ? I18N.carbonFootprint.download : '-'}
          </Button>
        </div>
      );
    },
  },
  {
    title: I18N.carbonFootprint.operation,
    width: 220,
    fixed: 'right',
    dataIndex: 'set',
    render: (t, r) => {
      const { status } = r;

      const showRetract =
        ![
          CERTIFYPROJECTSTATUS.AWAIT_AUDIT,
          CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE,
          CERTIFYPROJECTSTATUS.SUCCESS,
          CERTIFYPROJECTSTATUS.RETRACT,
          CERTIFYPROJECTSTATUS.INITIAL_AUDIT_FAIL,
          CERTIFYPROJECTSTATUS.FAIL,
          CERTIFYPROJECTSTATUS.ON_SITE_AUDIT_FAIL,
          CERTIFYPROJECTSTATUS.NOT_ACCEPT,
        ].includes(status) && !r.accept;

      const showEditSub = [
        CERTIFYPROJECTSTATUS.AWAIT_AUDIT,
        CERTIFYPROJECTSTATUS.FAILURE,
        CERTIFYPROJECTSTATUS.FAIL,
        CERTIFYPROJECTSTATUS.RETRACT,
        CERTIFYPROJECTSTATUS.INITIAL_AUDIT_FAIL,
        CERTIFYPROJECTSTATUS.ON_SITE_AUDIT_FAIL,
      ].includes(status);
      const showDelete = [CERTIFYPROJECTSTATUS.AWAIT_AUDIT].includes(status);

      return (
        <div className={style.opeColumn}>
          {status === CERTIFYPROJECTSTATUS.WAIT_CONFIRM &&
            checkPermissions(
              <ComfirmCertificate
                id={r?.id}
                certFile={
                  r.confirmFile?.find(item => item.type === 'certFile')?.file
                }
                callback={() => refresh?.()}
              >
                <Button
                  type='link'
                  style={{
                    paddingLeft: 0,
                    marginRight: 8,
                  }}
                >
                  {I18N.subModules.fileConfirmation}
                </Button>
              </ComfirmCertificate>,
              'CertificationCarbonFootprintProject:Edit',
            )}
          <TableActions
            menus={compact([
              showEditSub &&
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.edit,
                    key: 'edit',
                    onClick: () =>
                      onPageTo(PAGETAYPE.EDIT, r.id, r.applyNo, r.authType),
                  },
                  'CertificationCarbonFootprintProject:Edit',
                ),
              showEditSub &&
                status !== CERTIFYPROJECTSTATUS.WAIT_CONFIRM &&
                checkPermissions(
                  {
                    label: I18N.components.submit,
                    key: 'sub',
                    onClick: () => onSubmit(r.id, r.projectName, r.authFile),
                  },
                  'CertificationCarbonFootprintProject:Submit',
                ),
              !(
                showEditSub &&
                checkPermissions(
                  true,
                  'CertificationCarbonFootprintProject:Edit',
                )
              ) &&
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.check,
                    key: 'view',
                    onClick: () =>
                      onPageTo(PAGETAYPE.SHOW, r.id, r.applyNo, r.authType),
                  },
                  'CertificationCarbonFootprintProject:Detail',
                ),
              showDelete &&
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.delete,
                    key: 'del',
                    onClick: () => onDelete(r.id, r.projectName),
                  },
                  'CertificationCarbonFootprintProject:Del',
                ),
              showRetract &&
                checkPermissions(
                  {
                    label: I18N.Certification.withdrawalOfApplication,
                    key: 'retract',
                    onClick: () => onRetract(r.id, r.projectName),
                  },
                  'CertificationCarbonFootprintProject:Retract',
                ),

              status === CERTIFYPROJECTSTATUS.WAIT_UPLOAD_CONFIRM_FILE && {
                label: I18N.base.confirm,
                key: 'cor',
                onClick: () =>
                  message.info(I18N.Certification.theReviewerDidNotSubmit),
              },
            ])}
          />
        </div>
      );
    },
  },
];
