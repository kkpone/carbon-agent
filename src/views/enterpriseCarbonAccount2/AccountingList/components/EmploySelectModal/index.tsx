import I18N from '@src/lang/I18N';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input, Modal, Spin } from 'antd';
import { debounce } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import { getEmployList } from './service';
import { Employ } from '../../type';

type EmploySelectModalProps = {
  visible: boolean;
  selectedEmployList: Employ[];
  onCancel: () => void;
  onConfirm: (data: Employ[]) => void;
};

const EmploySelectModal: FC<EmploySelectModalProps> = props => {
  const { visible, selectedEmployList, onCancel, onConfirm } = props;

  const [loading, setLoading] = useState(false);

  const [employList, setEmployList] = useState<Employ[]>([]);

  const [checkedEmployList, setCheckedEmployList] = useState<Employ[]>([]);

  const getEmploy = useMemo(
    () =>
      debounce(async (params: { searchName: string }) => {
        setLoading(true);
        try {
          const { data } = await getEmployList(params);
          setEmployList(data.data);
        } finally {
          setLoading(false);
        }
      }, 300),
    [],
  );

  useEffect(() => {
    if (visible) {
      getEmploy({ searchName: '' });
    }
  }, [visible, getEmploy]);

  useEffect(() => {
    if (visible) {
      setCheckedEmployList(selectedEmployList);
    }
  }, [selectedEmployList, visible]);

  useEffect(() => {
    if (!visible) {
      setEmployList([]);
      setCheckedEmployList([]);
    }
  }, [visible]);
  return (
    <Modal
      className={styles.employSelectModal}
      visible={visible}
      destroyOnClose
      width={896}
      title={I18N.enterpriseCarbonAccount2.addEmployee}
      onCancel={onCancel}
      onOk={() => {
        onConfirm(checkedEmployList);
      }}
    >
      <Spin spinning={loading}>
        <div className={styles.modalContent}>
          <div className={styles.employContent}>
            <Input
              className={styles.searchInput}
              placeholder={I18N.enterpriseCarbonAccount2.pleaseEnterEmployee}
              suffix={<SearchOutlined />}
              onChange={e => getEmploy({ searchName: e.target.value })}
            />
            {employList.map(employ => {
              const { userId, employName, employEmail, employPhone } = employ;
              return (
                <div className={styles.employItem} key={userId}>
                  <Checkbox
                    className={styles.employCheckbox}
                    disabled={!employEmail}
                    checked={checkedEmployList.some(
                      checkedEmploy => checkedEmploy.userId === userId,
                    )}
                    onChange={e => {
                      if (e.target.checked) {
                        setCheckedEmployList([...checkedEmployList, employ]);
                      } else {
                        setCheckedEmployList(
                          checkedEmployList.filter(
                            checkedEmploy => checkedEmploy.userId !== userId,
                          ),
                        );
                      }
                    }}
                  />
                  <div>
                    <div className={styles.employName}>
                      {employName || '--'}
                    </div>
                    <div className={styles.employInfo}>
                      <div>{employPhone || '--'}</div>
                      <div className={styles.employInfoSplit} />
                      <div>{employEmail || '--'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.employContent}>
            <div className={styles.tip}>{I18N.components.selected2}</div>
            {checkedEmployList.map(employ => {
              const { userId, employName, employEmail, employPhone } = employ;
              return (
                <div className={styles.employCheckedItem} key={userId}>
                  <div>
                    <div className={styles.employName}>
                      {employName || '--'}
                    </div>
                    <div className={styles.employInfo}>
                      <div>{employPhone || '--'}</div>
                      <div className={styles.employInfoSplit} />
                      <div>{employEmail || '--'}</div>
                    </div>
                  </div>
                  <CloseOutlined
                    className={styles.employCloseIcon}
                    onClick={() => {
                      setCheckedEmployList(
                        checkedEmployList.filter(
                          checkedEmploy => checkedEmploy.userId !== userId,
                        ),
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default EmploySelectModal;
