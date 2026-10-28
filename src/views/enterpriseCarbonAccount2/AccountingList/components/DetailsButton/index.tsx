import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { FC, useMemo, useState } from 'react';

import { ORG_TYPE } from '@/components/OrgTree';
import { IconAlibaba } from '@/components/iconfont';
import {
  COMPUTATION_STATUS,
  COMPUTATION_STATUS_LABEL,
} from '@/views/enterpriseCarbonAccount2/constant';

import styles from './index.module.less';
import { OrgAccount, OrgAccountData } from '../../type';

type DetailsButtonProps = {
  orgAccountData: OrgAccountData;
  goToDetails: (org: OrgAccount, periodName: string) => void;
};

const DetailsButton: FC<DetailsButtonProps> = ({
  orgAccountData,
  goToDetails,
}) => {
  const [open, setOpen] = useState(false);

  const orgMainPartGroup = useMemo(() => {
    const findOrgMainPart = (orgList?: OrgAccount[]) => {
      const orgMainPart: OrgAccount[] = [];

      const travelOrgList = (org: OrgAccount) => {
        if (org.orgType === ORG_TYPE.MAIN_PART) {
          orgMainPart.push(org);
        }

        org.children?.forEach(travelOrgList);
      };
      orgList?.forEach(travelOrgList);
      return orgMainPart;
    };

    return orgAccountData.orgInfoList.map(
      ({ title, computationPeriod, orgList }) => ({
        title,
        computationPeriod,
        orgList: findOrgMainPart(orgList),
      }),
    );
  }, [orgAccountData]);

  return (
    <>
      <Button
        type='primary'
        onClick={() => {
          if (
            orgMainPartGroup.length === 1 &&
            orgMainPartGroup[0].orgList.length === 1
          ) {
            goToDetails(
              orgMainPartGroup[0].orgList[0],
              orgMainPartGroup[0].title,
            );
          } else {
            setOpen(true);
          }
        }}
      >
        <IconAlibaba type='icon-icon_chakanxiangqing' />
        <span>{I18N.enterpriseCarbonAccount2.dataDetails}</span>
      </Button>
      <Modal
        className={styles.modal}
        open={open}
        width={512}
        title={
          <div>{I18N.enterpriseCarbonAccount2.pleaseSelectTheSubject}</div>
        }
        footer={null}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        <div className={styles.content}>
          {orgMainPartGroup.map(group => {
            const { title, orgList } = group;

            return (
              <div className={styles.group} key={title}>
                <div className={styles.groupTitle}>{title}</div>
                {orgList.map(org => {
                  const { id, name, status } = org;

                  return (
                    <div
                      className={classNames(styles.orgItem, {
                        [styles.notStartOrgItem]:
                          status === COMPUTATION_STATUS.NOT_START,
                      })}
                      key={id}
                      onClick={() => {
                        if (status !== COMPUTATION_STATUS.NOT_START) {
                          goToDetails(org, title);
                        }
                      }}
                    >
                      <div className={styles.orgInfo}>
                        <div className={styles.orgIconContent}>
                          <IconAlibaba
                            className={styles.orgIcon}
                            type='icon-icon_hesuanzhuti'
                          />
                        </div>

                        <div className={styles.orgName} title={name}>
                          {name}
                        </div>
                        <div
                          className={classNames(styles.statusTag, {
                            [styles.fillingStatusTag]:
                              status === COMPUTATION_STATUS.FILLING,
                            [styles.completedStatusTag]:
                              status === COMPUTATION_STATUS.COMPLETE,
                          })}
                        >
                          {COMPUTATION_STATUS_LABEL[status]}
                        </div>
                      </div>
                      {status !== COMPUTATION_STATUS.NOT_START && (
                        <div className={styles.detailsBtn}>
                          <span>{I18N.carbonFootprint3.details}</span>
                          <IconAlibaba
                            className={styles.detailsBtnIcon}
                            type='icon-icon_arrow_rioght'
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default DetailsButton;
