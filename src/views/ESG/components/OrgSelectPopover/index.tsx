import I18N from '@src/lang/I18N';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Popover, Spin } from 'antd';
import { FC, ReactElement, useState } from 'react';

import OrgTree, { ORG_TYPE } from '@/components/OrgTree';
import { Org } from '@/components/OrgTree/type';
import { GetComponentProps } from '@/utils/utilTypes';

import styles from './index.module.less';
import { getOrgList } from './service';

const OrgSelectPopover: FC<
  {
    children: ReactElement;
    orgs?: { id: number; orgName: string }[];
    onConfirm: (val: Org[]) => Promise<void>;
  } & GetComponentProps<typeof Popover>
> = ({ children, orgs, onConfirm, ...rest }) => {
  const [orgList, setOrgList] = useState<Org[]>([]);

  const [checkedOrgList, setCheckedOrgList] = useState<Org[]>([]);

  const checkedMainPartList = checkedOrgList.filter(
    ({ orgType }) => orgType === ORG_TYPE.MAIN_PART,
  );

  const [loading, setLoading] = useState(false);

  const onOpenChange = async (opened: boolean) => {
    if (opened) {
      getOrgList().then(({ data }) => {
        setOrgList(data.data);
      });
      setCheckedOrgList(
        (orgs || []).map(
          org =>
            ({
              id: org.id,
              name: org.orgName,
              orgType: ORG_TYPE.MAIN_PART,
            } as Org),
        ),
      );
    } else {
      setCheckedOrgList([]);
    }
  };

  const submit = async () => {
    try {
      setLoading(true);
      await onConfirm(checkedMainPartList);
    } finally {
      setLoading(false);
    }
  };

  const popoverContent = (
    <Spin spinning={false}>
      <div className={styles.orgSelectContent}>
        <div className={styles.content}>
          <div className={styles.orgBlock}>
            <OrgTree
              treeData={orgList}
              fieldNames={{ key: 'id', title: 'name' }}
              checkedKeys={checkedOrgList.map(({ id }) => id)}
              checkable
              selectable={false}
              onCheck={(_, checkedInfo) => {
                setCheckedOrgList(checkedInfo.checkedNodes as Org[]);
              }}
            />
          </div>
          <div className={styles.split} />
          <div className={styles.orgBlock}>
            <div className={styles.orgTagContent}>
              {checkedMainPartList.map(org => (
                <div className={styles.orgTag} key={org.id}>
                  <div className={styles.orgTagName} title={org.name}>
                    {org.name}
                  </div>
                  <CloseOutlined
                    className={styles.closeIcon}
                    onClick={() => {
                      setCheckedOrgList(
                        checkedOrgList.filter(
                          selectedOrg => selectedOrg.id !== org.id,
                        ),
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <div>
            <span className={styles.countDesc}>{I18N.workbench.common}</span>
            <span className={styles.count}>{checkedMainPartList.length}</span>
            <span className={styles.countDesc}>{I18N.esg.anOrganization}</span>
          </div>
          <Button type='primary' loading={loading} onClick={submit}>
            {I18N.base.confirm}
          </Button>
        </div>
      </div>
    </Spin>
  );

  return (
    <Popover
      overlayClassName={styles.popover}
      arrow={false}
      trigger={['click']}
      destroyTooltipOnHide
      content={popoverContent}
      onOpenChange={onOpenChange}
      {...rest}
    >
      {children}
    </Popover>
  );
};

export default OrgSelectPopover;
