import { CloudUploadOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Checkbox, Button } from 'antd';
import classNames from 'classnames';
import { FC, useState } from 'react';

import FileUploadDrawer from '@/components/FileUploadDrawer';
import NumberInputTableCell from '@/components/NumberInputTableCell';

import styles from './index.module.less';
import { NEED_DEFAULT, PARAM_TYPE } from '../../FormulaSetting/constant';
import { ACTIVITY_TYPE } from '../../carbonDischarge/components/AccountAddEmission/constant';
import AuditRecordDrawer from '../AuditRecordDrawer';
import { TASK_STATUS, TASK_STATUS_LABEL } from '../constant';
import { Task } from '../type';

interface TaskItemProps {
  task: Task;
  checked: boolean;
  onCheckChange: (id: number, checked: boolean) => void;
  onSubmit: (idList: number[]) => void;
  uploadAttachment: (
    files: { name: string; url: string }[],
    idList: number[],
  ) => Promise<void>;
  deleteAttachment: (files: { id: number; url: string }[]) => Promise<void>;
  batchDownloadAttachment: (supportImgIds: number[]) => Promise<void>;
  updateActivityData: (
    id: number,
    val: string | number | undefined | null,
    paramId?: number,
  ) => Promise<void>;
  disabled: boolean;
  isApproval?: boolean;
  ticket?: string;
  onReject?: (id: number) => void;
  onApprove?: (id: number) => void;
}

const TaskItem: FC<TaskItemProps> = ({
  task,
  checked,
  onCheckChange,
  onSubmit,
  uploadAttachment,
  deleteAttachment,
  batchDownloadAttachment,
  updateActivityData,
  disabled: itemDisabled,
  isApproval,
  ticket,
  onReject,
  onApprove,
}) => {
  const {
    id,
    status,
    name,
    activityType,
    activityData,
    activityUnit,
    imgList,
    orgName,
    ghgClassifyName,
    periodDesc,
    facility,
    methodObj,
    grouping,
  } = task;

  const disabled = itemDisabled;
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);

  return (
    <div
      className={classNames(styles.taskItem, {
        // [styles.taskItemDisabled]: disabled,
        [styles.taskItemHover]: checked,
      })}
    >
      <div className={styles.taskItemHeader}>
        <div className={styles.taskItemHeaderBlock}>
          {!disabled && (
            <Checkbox
              checked={checked}
              disabled={disabled}
              onChange={e => onCheckChange(id, e.target.checked)}
            />
          )}
          <div
            className={classNames(styles.statusTag, {
              [styles.beFilledStatusTag]: status === TASK_STATUS.BE_FILLED,
              [styles.filledStatusTag]: status === TASK_STATUS.FILLED,
              [styles.approvalStatusTag]:
                status === TASK_STATUS.APPROVING ||
                status === TASK_STATUS.REJECTED ||
                status === TASK_STATUS.COMPLETED,
            })}
          >
            {TASK_STATUS_LABEL()[status]}
          </div>
          <div className={styles.emissionName} title={name}>
            {name}
          </div>
          <div className={styles.facility}>{facility}</div>
        </div>
        <div
          className={styles.auditRecord}
          onClick={() => setAuditDrawerOpen(true)}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
          >
            <path
              d='M12.1338 1.2002C12.4223 1.22244 12.6887 1.28879 12.9551 1.42188C13.2217 1.53297 13.4221 1.71116 13.6221 1.91113C14.0221 2.35558 14.2227 2.8668 14.2227 3.4668V9.15527C14.2227 9.28861 14.1553 9.40037 14.0664 9.48926C13.9997 9.55575 13.8883 9.59961 13.7773 9.59961C13.6666 9.59949 13.5779 9.55567 13.4893 9.48926C13.3781 9.40037 13.333 9.28861 13.333 9.15527V3.4668C13.333 3.08902 13.222 2.77741 12.9775 2.51074C12.7332 2.24427 12.4443 2.08862 12.0889 2.06641H4.06641C3.71109 2.06647 3.40032 2.20013 3.13379 2.44434C2.86714 2.68877 2.71071 2.99994 2.68848 3.35547V12.8223C2.68849 13.2 2.80049 13.5107 3.04492 13.7773C3.28937 14.044 3.57804 14.2004 3.93359 14.2227H6.59961C6.84405 14.2227 7.04492 14.4225 7.04492 14.667C7.04474 14.9113 6.84395 15.1113 6.59961 15.1113H3.88867C3.59986 15.0891 3.33301 15.022 3.06641 14.8887C2.80006 14.7776 2.60019 14.6002 2.40039 14.4004C2.00045 13.956 1.79987 13.4446 1.7998 12.8447V3.28906C1.84425 2.71133 2.08858 2.19979 2.51074 1.7998C2.93296 1.3998 3.44492 1.2002 4.04492 1.2002H12.1338ZM11.0889 9C11.6 9.02222 12.0448 9.22257 12.4004 9.57812C12.5779 9.7557 12.711 9.93335 12.7998 10.1553C12.8886 10.3996 12.956 10.6219 12.9561 10.8662C12.9561 11.1107 12.9112 11.3559 12.8223 11.5781C12.7334 11.8002 12.622 12 12.4443 12.1777C12.3779 12.2221 12.3558 12.2666 12.3115 12.333H13.3115C13.578 12.3331 13.8226 12.4222 14.0225 12.6221C14.2224 12.822 14.3332 13.0665 14.3555 13.333V14.4443C14.3555 14.5999 14.2888 14.7336 14.1777 14.8447C14.0667 14.9557 13.9328 15 13.7773 15H8.2666C8.11108 15 7.9773 14.9558 7.86621 14.8447C7.75516 14.7336 7.68848 14.5998 7.68848 14.4443V13.333C7.68856 13.0443 7.80008 12.822 8 12.6221C8.19994 12.4222 8.42217 12.333 8.71094 12.333H9.71094C9.66662 12.2665 9.62207 12.2003 9.55566 12.1338C9.22233 11.8005 9.06641 11.3776 9.06641 10.8887C9.06643 10.6443 9.11158 10.3996 9.22266 10.1553C9.33373 9.93318 9.46711 9.71088 9.66699 9.5332C10.0447 9.15559 10.5334 8.97779 11.0889 9ZM11.0889 9.64453C10.7113 9.62233 10.4004 9.73333 10.1338 9.97754C9.86724 10.2219 9.73352 10.5331 9.7334 10.8662C9.7334 11.1773 9.8227 11.4663 10.0449 11.6885C10.3115 11.9772 10.444 12.2887 10.5107 12.5996L10.5781 13H8.71094C8.59992 13.0001 8.51096 13.0447 8.44434 13.1113C8.37785 13.1779 8.33312 13.2444 8.33301 13.333V14.333H13.7109V13.2891C13.7109 13.2002 13.6663 13.1331 13.5996 13.0664C13.5109 12.9999 13.444 12.9551 13.333 12.9551H11.4668L11.5332 12.5781C11.5999 12.2226 11.7331 11.9329 11.9775 11.6885C12.1996 11.4441 12.3115 11.1557 12.3115 10.8447C12.3115 10.5338 12.2002 10.2668 11.9561 10.0225C11.7116 9.77802 11.4222 9.66675 11.0889 9.64453ZM14.1113 8.86621C14.1779 8.95502 14.2226 9.04429 14.2227 9.15527C14.2226 9.04426 14.1779 8.93282 14.1113 8.86621ZM8.55566 7.55566C8.80006 7.55572 9 7.75559 9 8L8.55566 8.44434H4.66699C4.55595 8.44434 4.44433 8.40031 4.35547 8.31152C4.26658 8.22263 4.22266 8.11111 4.22266 8C4.22266 7.88889 4.26658 7.77737 4.35547 7.68848C4.44433 7.59969 4.55595 7.55566 4.66699 7.55566H8.55566ZM10.8887 4.44434C11.133 4.44434 11.3329 4.64433 11.333 4.88867C11.333 4.99978 11.2891 5.11131 11.2002 5.2002C11.1113 5.28908 10.9998 5.33301 10.8887 5.33301H4.66699C4.42255 5.33301 4.22266 5.13312 4.22266 4.88867C4.22277 4.64433 4.42262 4.44434 4.66699 4.44434H10.8887Z'
              fill='#04252B'
            />
          </svg>
          <span>{I18N.supplyChainCarbonManagement.approvalRecords}</span>
        </div>
      </div>

      <div className={styles.paramContent}>
        <div className={styles.paramList}>
          {activityType === ACTIVITY_TYPE.EMISSION_FACTOR ? (
            <div className={styles.paramItem}>
              <div className={styles.parmaName}>
                {I18N.enterpriseCarbonAccount2.numberOfActivities}
              </div>
              <NumberInputTableCell
                className={styles.activeDataInput}
                disabled={disabled || isApproval}
                value={activityData}
                controls={false}
                min={0}
                stringMode
                maxDecimals={10}
                addonAfter={
                  <div className={styles.unitAddon}>{activityUnit}</div>
                }
                onBlur={val => updateActivityData(id, val)}
              />
            </div>
          ) : (
            (methodObj?.paramItem ?? [])
              .filter(p => p.show !== 0)
              .map(param => {
                const { paramType, hasValue, defaultValue, unitName } = param;
                return (
                  <div className={styles.paramItem} key={param.id}>
                    <div className={styles.parmaName} title={param.name}>
                      {param.name}
                    </div>
                    <NumberInputTableCell
                      className={styles.activeDataInput}
                      disabled={
                        disabled || hasValue === NEED_DEFAULT.NEED || isApproval
                      }
                      value={defaultValue}
                      controls={false}
                      min={0}
                      stringMode
                      maxDecimals={10}
                      addonAfter={
                        <div className={styles.unitAddon}>
                          {paramType === PARAM_TYPE.PERCENT ? '%' : unitName}
                        </div>
                      }
                      onBlur={val => updateActivityData(id, val, param.id)}
                    />
                  </div>
                );
              })
          )}
        </div>
      </div>

      <div className={styles.taskItemFooter}>
        <div className={styles.footerInfo}>
          <div className={styles.attachmentWrapper}>
            <FileUploadDrawer
              files={imgList.map(img => ({
                name: img.name,
                id: img.supportImgId,
                url: img.url,
              }))}
              disabled={disabled || isApproval}
              onSuccess={files => uploadAttachment(files, [id])}
              onDelete={deleteAttachment}
              onBatchDownload={async files =>
                batchDownloadAttachment(files.map(file => file.id as number))
              }
            >
              {imgList?.length > 0 || !!isApproval ? (
                <div
                  className={styles.attachmentName}
                  title={imgList.map(img => img.name).join(', ')}
                >
                  <span className={styles.attachmentNameText}>
                    {imgList[0]?.name || I18N.carbonFootPrintLCA.nothing}
                  </span>
                  {imgList.length > 1 && (
                    <span className={styles.attachmentCount}>
                      {I18N.enterpriseCarbonAccount2.wait}
                      {imgList.length}
                      {I18N.enterpriseCarbonAccount2.aFile2}
                    </span>
                  )}
                </div>
              ) : (
                <div className={styles.uploadBtn}>
                  <CloudUploadOutlined />
                  <span>{I18N.components.uploadAttachments}</span>
                </div>
              )}
            </FileUploadDrawer>
          </div>
          <div className={styles.orgInfo}>
            <span className={styles.orgName}>{orgName}</span>
            <span className={styles.period}>{periodDesc}</span>
          </div>
          <div className={styles.ghgInfo}>
            <span className={styles.ghg}>{ghgClassifyName}</span>
          </div>
          {grouping && (
            <div className={styles.ghgInfo}>
              <span className={styles.ghg}>{grouping}</span>
            </div>
          )}
          {isApproval &&
            (task.oldActivityData != null || task.activityData != null) && (
              <div className={styles.modifyRecord}>
                <span>{I18N.enterpriseCarbonAccount2.revisionRecord}</span>
                <span className={styles.oldVal}>
                  {I18N.enterpriseCarbonAccount2.original}
                  {task.oldActivityData ?? '-'}{' '}
                </span>
                <span className={styles.newVal}>
                  {I18N.enterpriseCarbonAccount2.new2}
                  {String(task.activityData ?? '-')}
                </span>
              </div>
            )}
          {/* 这里假设驳回原因字段为 rejectReason, 如果接口有该字段请自行对应 */}
          {/* @ts-ignore */}
          {task.opinion && (
            <div className={styles.rejectReason}>
              <span>{I18N.enterpriseCarbonAccount2.reasonForRejection}</span>
              {/* @ts-ignore */}
              <span className={styles.reasonText}>{task.opinion}</span>
            </div>
          )}
        </div>
        <div className={styles.footerActions}>
          {isApproval && !disabled ? (
            <>
              <Button
                className={styles.rejectBtn}
                onClick={() => onReject?.(id)}
                size='small'
              >
                {I18N.carbonAccount.reject}
              </Button>
              <Button
                className={styles.approveBtn}
                onClick={() => onApprove?.(id)}
                size='small'
              >
                {I18N.carbonAccount.adopt}
              </Button>
            </>
          ) : (
            !disabled && (
              <Button
                className={styles.submitBtn}
                onClick={() => onSubmit([id])}
                size='small'
              >
                {I18N.components.submit}
              </Button>
            )
          )}
        </div>
      </div>

      <AuditRecordDrawer
        taskId={id}
        ticket={ticket}
        open={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
      />
    </div>
  );
};

export default TaskItem;
