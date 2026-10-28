import { CloseOutlined } from '@ant-design/icons';
import OrgTree, { ORG_TYPE } from '@src/components/OrgTree';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Modal, Spin } from 'antd';
import { FC, useEffect, useState } from 'react';

import styles from './index.module.less';
import { getAccountOrgTree } from '../../service';
import { Org, SimpleOrg } from '../../type';

type OrgSelectModalProps = {
  visible: boolean;
  cYear: string;
  selectedOrgList: SimpleOrg[];
  onCancel: () => void;
  onConfirm: (orgList: SimpleOrg[]) => void;
};

const OrgSelectModal: FC<OrgSelectModalProps> = ({
  cYear,
  visible,
  selectedOrgList,
  onCancel,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  const [orgData, setOrgData] = useState<Org[]>([]);

  const [expandedOrgIds, setExpandedOrgIds] = useState<
    (number | string | bigint)[]
  >([]);

  const [checkedOrgList, setCheckOrgList] = useState<SimpleOrg[]>([]);

  const [hasComputationOrgIds, setHasComputationOrgIds] = useState<number[]>(
    [],
  );

  const getOrgTree = async (params: { cYear: string }) => {
    try {
      setLoading(true);
      const { data } = await getAccountOrgTree(params);
      const computationOrgIds: number[] = [];

      const transformOrgTree: (orgTree: Org[], parentOrg?: Org) => Org[] = (
        orgTree,
        parentOrg,
      ) =>
        orgTree.map(org => {
          const children = transformOrgTree(org.children || [], org);
          const hasComputation = !!org.existComputation;

          if (hasComputation) {
            computationOrgIds.push(org.id);
          }

          if (
            org.hasCheckableMainPart ||
            (org.orgType === ORG_TYPE.MAIN_PART && !hasComputation)
          ) {
            Object.assign(parentOrg || {}, {
              hasCheckableMainPart: true,
            });
          }

          return {
            ...org,
            key: org.id,
            selectable: false,
            disabled:
              org.orgType === ORG_TYPE.MAIN_PART
                ? hasComputation
                : !org.hasCheckableMainPart,
            children,
          };
        });

      setOrgData(transformOrgTree(data.data));
      setExpandedOrgIds(data.data.map(org => org.id));
      setHasComputationOrgIds(computationOrgIds);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      getOrgTree({ cYear });
    }
  }, [cYear, visible]);

  useEffect(() => {
    if (visible) {
      setCheckOrgList(selectedOrgList);
    }
  }, [selectedOrgList, visible]);

  useEffect(() => {
    if (!visible) {
      setOrgData([]);
      setCheckOrgList([]);
      setHasComputationOrgIds([]);
    }
  }, [visible]);

  return (
    <Modal
      className={styles.orgSelectModal}
      visible={visible}
      destroyOnClose
      width={896}
      title={I18N.enterpriseCarbonAccount2.selectOrganization}
      onCancel={onCancel}
      onOk={() => {
        onConfirm(checkedOrgList);
      }}
    >
      <Spin spinning={loading}>
        <div className={styles.modalContent}>
          <div className={styles.orgTreeContent}>
            <OrgTree
              treeData={orgData}
              width={390}
              fieldNames={{ key: 'id', title: 'name' }}
              expandedKeys={expandedOrgIds}
              onExpand={setExpandedOrgIds}
              checkable
              selectable={false}
              checkedKeys={[
                ...hasComputationOrgIds,
                ...checkedOrgList.map(({ orgId }) => orgId),
              ]}
              onSearch={matchKeys => {
                setExpandedOrgIds([
                  ...new Set([...matchKeys, ...expandedOrgIds]),
                ]);
              }}
              onCheck={(_, checkedInfo) => {
                const orgList = checkedInfo.checkedNodes as (Org & {
                  disabled: boolean;
                })[];

                setCheckOrgList(
                  orgList
                    .filter(
                      ({ orgType, disabled }) =>
                        orgType === ORG_TYPE.MAIN_PART && !disabled,
                    )
                    .map(
                      ({ id, name, emailList }) =>
                        checkedOrgList.find(org => org.orgId === id) || {
                          orgId: id,
                          orgName: name,
                          emailList: emailList || [],
                        },
                    ),
                );
              }}
            />
          </div>
          <div className={styles.orgContent}>
            <div className={styles.tip}>{I18N.components.selected2}</div>
            {checkedOrgList.map(({ orgId, orgName }) => (
              <div className={styles.orgMainPart} key={orgId}>
                <div className={styles.orgMainPartLeft}>
                  <div className={styles.orgMainPartImg}>
                    <IconAlibaba type='icon-icon_hesuanzhuti' />
                  </div>
                  <div className={styles.orgMainPartName}>{orgName}</div>
                </div>
                <CloseOutlined
                  className={styles.orgMainPartCloseIcon}
                  onClick={() => {
                    setCheckOrgList(
                      checkedOrgList.filter(({ orgId: id }) => id !== orgId),
                    );
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default OrgSelectModal;
