import I18N from '@src/lang/I18N';
import { Cascader, Modal } from 'antd';
import { FC, useEffect, useState } from 'react';
import styles from './index.module.less';
import { IconAlibabaNew } from '@/components/iconfont';
import OrgTree from '@/components/OrgTree';
import { ComputationYear } from './type';
import { OrgAccount } from '../../AccountingList/type';
import { getOrgAccountData } from '../../AccountingList/service';
import { getComputationYearList } from './service';
import { COMPUTATION_STATUS, COMPUTATION_STATUS_LABEL } from '../../constant';
import { ORG_TYPE } from '@/hooks/useOrgType';
import classNames from 'classnames';
import { Toast } from '@/utils';

const SelectComputationOrgModal: FC<{
  open: boolean;
  onCancel: () => void;
  onConfirm: (
    checkedOrgs: OrgAccount[],
    selectedYear: ComputationYear[],
  ) => Promise<void> | void;
}> = ({ open, onCancel, onConfirm }) => {
  const [computationYearList, setComputationYearList] = useState<
    ComputationYear[]
  >([]);

  const [selectedYear, setSelectedYear] = useState<ComputationYear[]>([]);

  const [orgList, setOrgList] = useState<OrgAccount[]>([]);

  const [checkedOrgs, setCheckedOrgs] = useState<OrgAccount[]>([]);

  const [expandedOrgIds, setExpandedOrgIds] = useState<
    (number | string | bigint)[]
  >([]);

  const [submitLoading, setSubmitLoading] = useState(false);

  const checkedMainPart = checkedOrgs.filter(
    org => org.orgType === ORG_TYPE.MAIN_PART,
  );

  const transformOrgList = (orgs: OrgAccount[]) =>
    orgs.map(org => ({
      ...org,
      selectable: false,
      disabled: org.status === COMPUTATION_STATUS.COMPLETE,
      children: org.children ? transformOrgList(org.children) : undefined,
    }));

  const submit = async () => {
    if (checkedMainPart.length === 0) {
      Toast('warn', I18N.enterpriseCarbonAccount2.pleaseSelectAtLeast3);
      return;
    }
    try {
      setSubmitLoading(true);
      await onConfirm(checkedMainPart, selectedYear);
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      getComputationYearList().then(({ data }) => {
        setComputationYearList(data.data || []);
      });
    }
  }, [open]);

  useEffect(() => {
    if (selectedYear.length > 0) {
      const { year, orgId } = selectedYear[0];
      getOrgAccountData({
        year: `${year}`,
        orgId,
        period: selectedYear[1]?.value,
      }).then(({ data }) => {
        const orgs = transformOrgList(data.data.orgInfoList[0].orgList);
        setOrgList(orgs);
        setExpandedOrgIds(orgs.map(org => org.id));
        setCheckedOrgs([]);
      });
    }
  }, [selectedYear]);

  return (
    <Modal
      width={768}
      title={I18N.enterpriseCarbonAccount2.selectAccountingScore}
      open={open}
      okButtonProps={{ loading: submitLoading }}
      onCancel={onCancel}
      onOk={submit}
      afterClose={() => {
        setSelectedYear([]);
        setComputationYearList([]);
        setOrgList([]);
        setCheckedOrgs([]);
      }}
    >
      <Cascader
        className={styles.periodCascader}
        allowClear={false}
        value={selectedYear.map(year => year.value)}
        options={computationYearList.map(year => ({
          ...year,
          value: year.year,
          label: year.year,
          children: year.periodList.map(period => ({
            ...period,
            value: period.value,
            label: period.name,
          })),
        }))}
        placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectAccounting3}
        onChange={(_, val) => setSelectedYear(val)}
      />
      <div className={styles.tipContent}>
        <IconAlibabaNew type='icon-Warning' />
        <div className={styles.tipText}>
          {I18N.enterpriseCarbonAccount2.currentAccountingWeek}
        </div>
      </div>
      <div className={styles.orgContent}>
        <div className={styles.orgContentLeft}>
          <OrgTree
            fieldNames={{ key: 'id' }}
            showOrgIcon={false}
            treeData={orgList as []}
            expandedKeys={expandedOrgIds}
            checkable
            checkedKeys={checkedOrgs.map(org => org.id)}
            selectable={false}
            onSearch={matchKeys => {
              setExpandedOrgIds([
                ...new Set([...matchKeys, ...expandedOrgIds]),
              ]);
            }}
            onExpand={setExpandedOrgIds}
            onCheck={(_, { checkedNodes }) => {
              setCheckedOrgs(
                (checkedNodes as OrgAccount[]).filter(
                  org => org.orgType === ORG_TYPE.MAIN_PART,
                ),
              );
            }}
            orgNameSuffix={org => (
              <div
                className={classNames(styles.orgTag, {
                  [styles.fillingOrgTag]:
                    org.status === COMPUTATION_STATUS.FILLING,
                  [styles.completedOrgTag]:
                    org.status === COMPUTATION_STATUS.COMPLETE,
                })}
              >
                {COMPUTATION_STATUS_LABEL[org.status]}
              </div>
            )}
          />
        </div>
        <div className={styles.orgContentRight}>
          <div className={styles.checkedCount}>
            {I18N.template(I18N.enterpriseCarbonAccount2.selectedChe, {
              val1: checkedMainPart.length,
            })}
          </div>
          <div className={styles.checkedOrgList}>
            {checkedMainPart.map(org => (
              <div className={styles.checkedOrgItem} key={org.id}>
                <div className={styles.checkedOrgName}>{org.name}</div>
                <IconAlibabaNew
                  className={styles.closeIcon}
                  type='icon-icon-guanbi'
                  onClick={() => {
                    setCheckedOrgs(
                      checkedOrgs.filter(item => item.id !== org.id),
                    );
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SelectComputationOrgModal;
