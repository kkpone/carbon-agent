import { checkPermissions } from '@src/components/Permission/utils';
import { TableActions } from '@src/components/Table/components/TableActions';
import I18N from '@src/lang/I18N';
import { Badge, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { compact } from 'lodash-es';

import {
  CERTIFYPROJECTSTATUS,
  CERTIFYPROJECTSTATUS_COLOR,
  CERTIFYPROJECTSTATUS_LABEL,
  CERTIFYPROJECTTYPE,
  CERTIFYPROJECTTYPE_CLASS,
  CERTIFYPROJECTTYPE_LABEL,
  PAGETAYPE,
} from './const';
import style from './index.module.less';
import Tags from '../component/Tags';
import { CarbonAuthInfoReturn } from '../type';

export const columns = ({
  onSubmit,
  onRetract,
  onDelete,
  onPageTo,
  onDownload,
}: {
  onSubmit: (id: number, name: string) => Promise<void>;
  onRetract: (id: number, name: string) => Promise<void>;
  onDelete: (id: number, name: string) => Promise<void>;
  onPageTo: (pageType: PAGETAYPE, id?: number, applyNo?: string) => void;
  onDownload: (id: number) => void;
}): ColumnsType<CarbonAuthInfoReturn> => [
  {
    title: I18N.carbonNeutral.entryName,
    width: 228,
    fixed: 'left',
    dataIndex: 'projectName',
    ellipsis: true,
  },
  {
    title: I18N.Certification.projectId,
    width: 200,
    dataIndex: 'projectNo',
  },
  {
    title: I18N.Certification.certificationProject,
    width: 150,
    dataIndex: 'authType',
    render: (t: CERTIFYPROJECTTYPE) =>
      CERTIFYPROJECTTYPE_LABEL[t] ? (
        <Tags
          text={CERTIFYPROJECTTYPE_LABEL[t]}
          status={CERTIFYPROJECTTYPE_CLASS[t]}
        />
      ) : (
        '-'
      ),
  },
  {
    title: I18N.carbonFootprint.reportName,
    width: 192,
    dataIndex: 'reportName',
    ellipsis: true,
  },
  {
    title: I18N.carbonFootprint.state,
    dataIndex: 'status',
    width: 150,
    render: (t: CERTIFYPROJECTSTATUS) =>
      CERTIFYPROJECTSTATUS_LABEL[t] ? (
        <Badge
          className={style.certificationBadage}
          color={CERTIFYPROJECTSTATUS_COLOR[t]}
          text={CERTIFYPROJECTSTATUS_LABEL[t]}
        />
      ) : (
        '-'
      ),
  },
  {
    dataIndex: 'updateTime',
    title: I18N.carbonFootprint.updateTime,
    width: 200,
  },
  {
    title: I18N.Certification.certificationCertificateReport,
    width: 200,
    fixed: 'right',
    dataIndex: 'set',
    render: (t, r) => {
      const { status } = r;

      const showDownload = ![
        CERTIFYPROJECTSTATUS.AWAIT_AUDIT,
        CERTIFYPROJECTSTATUS.RETRACT,
      ].includes(status);

      const hasAudit = checkPermissions(
        true,
        'CertificationCarbonFootprintProject:Download',
      );

      return (
        <div className={style.center}>
          <Button
            type='link'
            onClick={
              showDownload && hasAudit ? () => onDownload(r?.id) : () => {}
            }
          >
            {showDownload && hasAudit ? I18N.carbonFootprint.download : '-'}
          </Button>
        </div>
      );
    },
  },
  {
    title: I18N.carbonFootprint.operation,
    width: 280,
    fixed: 'right',
    dataIndex: 'set',
    render: (t, r) => {
      const { status } = r;

      const showRetract = status === CERTIFYPROJECTSTATUS.IN_AUDIT;
      const showEditSub = [
        CERTIFYPROJECTSTATUS.AWAIT_AUDIT,
        CERTIFYPROJECTSTATUS.FAIL,
        CERTIFYPROJECTSTATUS.RETRACT,
      ].includes(status);
      const showDelete = [
        CERTIFYPROJECTSTATUS.AWAIT_AUDIT,
        CERTIFYPROJECTSTATUS.RETRACT,
      ].includes(status);

      return (
        <TableActions
          menus={compact([
            showEditSub &&
              checkPermissions(
                {
                  label: I18N.carbonFootprint.edit,
                  key: 'edit',
                  onClick: () => onPageTo(PAGETAYPE.EDIT, r.id),
                },
                'CertificationCarbonFootprintProject:Edit',
              ),
            showEditSub &&
              checkPermissions(
                {
                  label: I18N.components.submit,
                  key: 'sub',
                  onClick: () => onSubmit(r.id, r.projectName),
                },
                'CertificationCarbonFootprintProject:Submit',
              ),
            checkPermissions(
              {
                label: I18N.carbonFootprint.check,
                key: 'view',
                onClick: () => onPageTo(PAGETAYPE.SHOW, r.id, r.applyNo),
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
          ])}
        />
      );
    },
  },
];
