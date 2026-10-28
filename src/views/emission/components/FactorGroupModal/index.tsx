import { SearchOutlined } from '@ant-design/icons';
import emptyImg from '@src/assets/svg/enterprise_empty.svg';
import I18N from '@src/lang/I18N';
import { Checkbox, Input, Modal, Spin } from 'antd';
import {
  cloneElement,
  FC,
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import { getFactorGroup } from './service';
import { getGroupList } from '../../EmissionFactorList/service';

const FactorGroup = forwardRef<
  string[],
  { factorId: string; factorUse: string; setLoading: (val: boolean) => void }
>(({ factorId, factorUse, setLoading }, ref) => {
  const [groupList, setGroupList] = useState<
    { groupName: string; id: string }[]
  >([]);

  const [filterText, setFilterText] = useState('');

  const [groupIds, setGroupIds] = useState<string[]>([]);

  useImperativeHandle(ref, () => groupIds, [groupIds]);

  const filterGroups = groupList.filter(group =>
    group.groupName.includes(filterText),
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([getFactorGroup({ id: factorId, factorUse }), getGroupList()])
      .then(([factorGroupResp, groupResp]) => {
        setGroupIds(factorGroupResp.data.data);
        setGroupList(groupResp.data.data);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factorId, factorUse]);

  return (
    <div className={styles.content}>
      <div className={styles.groupContent}>
        <div className={styles.groupContentHeader}>
          <Input
            value={filterText}
            placeholder={I18N.components.search}
            prefix={<SearchOutlined style={{ color: '#B5B8BB' }} />}
            onChange={e => setFilterText(e.target.value.trim())}
          />
        </div>
        <div className={styles.groupList}>
          {filterGroups.length === 0 && (
            <div className={styles.empty}>
              <img className={styles.emptyImg} src={emptyImg} alt='' />
              <div className={styles.emptyText}>
                {I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable}
              </div>
            </div>
          )}
          {filterGroups.map(group => {
            const checked = groupIds.includes(`${group.id}`);
            const groupId = `${group.id}`;
            return (
              <div className={styles.groupItem} key={groupId}>
                <Checkbox
                  checked={checked}
                  onChange={e => {
                    setGroupIds(
                      e.target.checked
                        ? [...groupIds, groupId]
                        : groupIds.filter(i => i !== groupId),
                    );
                  }}
                />
                <div className={styles.groupName} title={group.groupName}>
                  {group.groupName}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.groupContent}>
        <div className={styles.groupContentHeader}>
          <span>{I18N.carbonDataManagemen.selected}</span>
          <span>{groupIds.length}</span>
          <span>{I18N.dashborad.grouping}</span>
        </div>
        <div className={styles.groupList}>
          {groupIds.map(groupId => {
            const group = groupList.find(
              groupItem => `${groupItem.id}` === groupId,
            );

            if (!group) {
              return null;
            }

            return (
              <div className={styles.selectGroupItem} key={groupId}>
                <div className={styles.groupName} title={group.groupName}>
                  {group.groupName}
                </div>
                <IconAlibabaNew
                  className={styles.closeIcon}
                  type='icon-icon-guanbi'
                  onClick={() => {
                    setGroupIds(groupIds.filter(i => i !== groupId));
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const FactorGroupModal: FC<{
  children: ReactElement;
  factorId: string;
  factorUse: string;
  onConfirm: (val: string[]) => void | Promise<void>;
}> = ({ children, factorId, factorUse, onConfirm }) => {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [confirmLoading, setConfirmLoading] = useState(false);

  const groupIdsRef = useRef<string[]>(null);

  const submit = async () => {
    try {
      setConfirmLoading(true);
      const groupIds = groupIdsRef.current;
      await onConfirm(groupIds || []);
      setOpen(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={I18N.carbonAccount.editGrouping}
        open={open}
        width={608}
        destroyOnClose
        okButtonProps={{ loading: confirmLoading }}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        afterClose={() => {
          setLoading(false);
          setConfirmLoading(false);
        }}
        onOk={submit}
      >
        <Spin spinning={loading}>
          <FactorGroup
            ref={groupIdsRef}
            factorId={factorId}
            factorUse={factorUse}
            setLoading={setLoading}
          />
        </Spin>
      </Modal>
      {cloneElement(children, { onClick: () => setOpen(!open) })}
    </>
  );
};

export default FactorGroupModal;
