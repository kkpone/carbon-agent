import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getSavedFactorScope } from '../../customFactorReuse/scope';

import type {
  SavedCustomFactor,
  SavedFactorService,
} from '../../customFactorReuse/types';
import manageFactorsIcon from './assets/manage-factors.svg';
import SavedFactorList from './components/SavedFactorList';
import styles from './index.module.less';

type Props = {
  service: SavedFactorService;
  onSelect: (record: SavedCustomFactor) => void;
  onClose: () => void;
};

export default function SavedFactorPicker({
  service,
  onSelect,
  onClose,
}: Props) {
  const [selectedFactor, setSelectedFactor] = useState<SavedCustomFactor>();
  const [managerOpen, setManagerOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<SavedCustomFactor>();
  const [deleting, setDeleting] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const active = useRef(false);
  const scope = useRef(getSavedFactorScope());
  const selectPending = useRef(false);
  const deletePending = useRef(false);
  const text = I18N.customFactorReuse;

  const closeManager = () => {
    if (deletePending.current) return;
    setDeleteTarget(undefined);
    setManagerOpen(false);
  };

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const confirmSelection = async () => {
    if (
      !selectedFactor ||
      managerOpen ||
      !active.current ||
      selectPending.current
    )
      return;
    selectPending.current = true;
    setSelecting(true);
    try {
      const record = await service.detail(selectedFactor.id);
      if (!active.current || scope.current !== getSavedFactorScope()) return;
      if (record) {
        onSelect(record);
      } else {
        setSelectedFactor(undefined);
        setRevision(value => value + 1);
      }
    } catch (error) {
      if (!active.current || scope.current !== getSavedFactorScope()) return;
      // 统一请求层已经提示；业务失败刷新列表，网络失败允许重试。
      if (typeof error === 'object' && error !== null && 'data' in error) {
        setSelectedFactor(undefined);
        setRevision(value => value + 1);
      }
    } finally {
      selectPending.current = false;
      if (active.current && scope.current === getSavedFactorScope())
        setSelecting(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget || deletePending.current) return;
    deletePending.current = true;
    setDeleting(true);
    try {
      await service.remove(deleteTarget.id);
      if (!active.current || scope.current !== getSavedFactorScope()) return;
      setSelectedFactor(undefined);
      setDeleteTarget(undefined);
      setRevision(value => value + 1);
    } catch {
      // 保留确认状态，错误提示统一由请求层处理。
    } finally {
      deletePending.current = false;
      if (active.current && scope.current === getSavedFactorScope())
        setDeleting(false);
    }
  };

  return (
    <>
      <Modal
        open
        title={text.chooseTitle}
        width='80%'
        className={styles.dialog}
        centered
        maskClosable={false}
        onCancel={onClose}
        onOk={confirmSelection}
        confirmLoading={selecting}
        okText={text.selectConfirm}
        cancelText={text.cancel}
        okButtonProps={{ disabled: !selectedFactor || managerOpen }}
      >
        <SavedFactorList
          service={service}
          revision={revision}
          mode='select'
          disabled={selecting}
          selectedFactor={selectedFactor}
          onSelectionChange={setSelectedFactor}
          toolbar={
            <Button
              className={styles.manageButton}
              disabled={selecting}
              icon={
                <img
                  className={styles.manageIcon}
                  src={manageFactorsIcon}
                  alt=''
                />
              }
              onClick={() => setManagerOpen(true)}
            >
              {text.manage}
            </Button>
          }
        />
      </Modal>
      <Modal
        open={managerOpen}
        title={text.manage}
        width='80%'
        className={styles.dialog}
        centered
        destroyOnClose
        maskClosable={!deleting}
        keyboard={!deleting}
        onCancel={closeManager}
        footer={null}
      >
        {managerOpen && (
          <SavedFactorList
            service={service}
            revision={revision}
            mode='manage'
            deletingId={deleting ? deleteTarget?.id : undefined}
            onDelete={setDeleteTarget}
          />
        )}
      </Modal>
      <Modal
        open={!!deleteTarget}
        title={text.deleteConfirm}
        confirmLoading={deleting}
        okText={text.confirm}
        cancelText={text.cancel}
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ disabled: deleting }}
        closable={!deleting}
        keyboard={!deleting}
        maskClosable={false}
        onOk={remove}
        onCancel={() => {
          if (!deletePending.current) setDeleteTarget(undefined);
        }}
      >
        {deleteTarget?.name}
      </Modal>
    </>
  );
}
