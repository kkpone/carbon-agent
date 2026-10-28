import approvedIcon from '@src/assets/images/carbonLabel/agent/approved.svg';
import rejectedIcon from '@src/assets/images/carbonLabel/agent/rejected.svg';
import submittedIcon from '@src/assets/images/carbonLabel/agent/submitted.svg';
import avatarIcon from '@src/assets/svg/icon_avatar.svg';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Button, Popover, Spin } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import { AuditStatusType, AuditStatusTypeText } from './constant';
import style from './index.module.less';
import { AuditListData, AuditListProps } from './type';
import { getCarbonLabelAuditDiff } from '../../service';
import { PreviewH5 } from '../PreviewH5';
import './index.less';
import { PreviewH5Props } from '../PreviewH5/type';

const { SUB, PASS, NOT, ANNUL } = AuditStatusType;
const timelineIcons = {
  [SUB]: submittedIcon,
  [PASS]: approvedIcon,
  [NOT]: rejectedIcon,
};

export const AuditList: FC<AuditListProps> = ({ auditLists, embedded }) => {
  /** 版本对比信息 */
  const [versionPreview, setVersionPreview] = useState<{
    key: string;
    loading: boolean;
    info?: PreviewH5Props['info'];
  }>();
  const versionRequest = useRef(0);
  useEffect(
    () => () => {
      versionRequest.current += 1;
    },
    [],
  );

  const getTitle = (info: AuditListData) => {
    if (embedded && info.actType !== ANNUL) {
      return (
        <div
          className={classNames(style.titleMain, {
            [style.passTitleMain]: info.actType === PASS,
            [style.noPassTitleMain]: info.actType === NOT,
          })}
        >
          <img
            className={style.timelineIcon}
            src={timelineIcons[info.actType] || submittedIcon}
            width={16}
            height={16}
            alt=''
          />
          <span className={style.titleText}>
            {AuditStatusTypeText[info.actType]}
          </span>
        </div>
      );
    }
    if (info.actType === PASS) {
      return (
        <div className={classNames(style.titleMain, style.passTitleMain)}>
          <div className={style.iconMain}>
            <IconAlibaba className={style.iconPass} type='icon-icon_approve' />
          </div>
          <span className={style.titleText}>
            {AuditStatusTypeText[info.actType]}
          </span>
        </div>
      );
    }

    if (info.actType === NOT) {
      return (
        <div className={classNames(style.titleMain, style.noPassTitleMain)}>
          <div className={style.iconMain}>
            <IconAlibaba
              className={style.iconNotPass}
              type='icon-icon_reject'
            />
          </div>
          <span className={style.titleText}>
            {AuditStatusTypeText[info.actType]}
          </span>
        </div>
      );
    }

    if (info.actType === ANNUL) {
      return (
        <div className={classNames(style.titleMain, style.annulTitleMain)}>
          <div className={style.iconMain}>
            <IconAlibaba
              className={style.iconAnnulPass}
              type='icon-icon_retract'
            />
          </div>
          <span className={style.titleText}>
            {AuditStatusTypeText[info.actType]}
          </span>
        </div>
      );
    }
    return (
      <div className={classNames(style.titleMain)}>
        <div className={style.icon} />
        <span className={style.titleText}>
          {AuditStatusTypeText[info.actType]}
        </span>
      </div>
    );
  };

  /**
   * 选择版本信息
   * @param params 版本参数
   */
  const openVersion = async (
    key: string,
    params: { labelId: number; version: number },
  ) => {
    const request = ++versionRequest.current;
    setVersionPreview({ key, loading: true });
    try {
      const { data } = await getCarbonLabelAuditDiff(params);
      if (request !== versionRequest.current) return;
      setVersionPreview(current =>
        current?.key === key
          ? { key, loading: false, info: data.data }
          : current,
      );
    } catch {
      // 请求层统一提示，不能回退展示上一次打开的版本。
    } finally {
      if (request === versionRequest.current) {
        setVersionPreview(current =>
          current?.key === key ? { ...current, loading: false } : current,
        );
      }
    }
  };

  return (
    <div
      className={classNames(style.auditListMain, {
        [style.embedded]: embedded,
      })}
    >
      {auditLists.map(listInfo => {
        const versionKey = `${listInfo.labelId}:${listInfo.version}:${listInfo.id}`;
        const versionOpen = versionPreview?.key === versionKey;
        return (
          <div className={style.list} key={listInfo.id}>
            {getTitle(listInfo)}
            <div className={style.dateTime}>
              <span className={style.time}>{listInfo.createTime}</span>
              <span className={style.useName}>
                {embedded && (
                  <img src={avatarIcon} width={24} height={24} alt='' />
                )}
                {embedded &&
                  (listInfo.actType === SUB
                    ? I18N.carbonAgent.labelApplication.applicant
                    : I18N.carbonAgent.labelApplication.reviewer)}
                {listInfo.updateByName}
              </span>
              {!!listInfo?.version && (
                <Popover
                  open={versionOpen}
                  onOpenChange={open => {
                    if (open && listInfo.version) {
                      openVersion(versionKey, {
                        labelId: listInfo.labelId,
                        version: listInfo.version,
                      });
                    } else {
                      setVersionPreview(current =>
                        current?.key === versionKey ? undefined : current,
                      );
                    }
                  }}
                  arrowPointAtCenter
                  overlayClassName='auditPopoverClass'
                  placement='left'
                  title={
                    <div className={style.popoverTitle}>
                      <span className={style.title}>
                        {I18N.carbonFootprint3.historicalVersionsOf}
                      </span>
                      <span className={style.describe}>
                        {I18N.carbonFootprint3.useRedInDifferentPlaces}
                      </span>
                      <span className={style.blockColor} />
                    </div>
                  }
                  content={
                    <div
                      className={classNames(style.popoverMain, {
                        [style.agentPopoverMain]: embedded,
                      })}
                    >
                      <Spin spinning={versionOpen && versionPreview?.loading}>
                        <PreviewH5
                          info={versionOpen ? versionPreview?.info : undefined}
                          variant={embedded ? 'agent-version' : 'legacy'}
                        />
                      </Spin>
                    </div>
                  }
                  trigger='click'
                >
                  <Button type='text' className={style.version}>
                    {I18N.carbonFootprint3.version}
                    {listInfo.version}
                  </Button>
                </Popover>
              )}
            </div>
            {listInfo.comment && (
              <div
                className={classNames(style.content, {
                  [style.rejectedFeedback]:
                    embedded && listInfo.actType === NOT,
                })}
              >
                {embedded && listInfo.actType === NOT && (
                  <span className={style.commentLabel}>
                    {I18N.carbonAgent.labelApplication.rejectedReason}：
                  </span>
                )}
                {listInfo.comment}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
