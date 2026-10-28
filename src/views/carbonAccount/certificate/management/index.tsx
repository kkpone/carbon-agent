import I18N from '@src/lang/I18N';
import { PlusOutlined } from '@ant-design/icons';
import { checkPermissions } from '@src/components/Permission/utils';
import { useMount } from 'ahooks';
import { Button, Modal, Input, Spin, message } from 'antd';
import classNames from 'classnames';
import { pick } from 'lodash-es';
import { useState } from 'react';

import { CertificateDrawer } from './components/Drawer';
import deleteIcon from './delete.png';
import styles from './index.module.less';
import { certificateList, certificateDelete } from './service';

const { Search } = Input;

const Management = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [drawerInitialValues, setDrawerInitialValues] = useState<any>();
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = (await certificateList({
        page: 1,
        size: 1000,
      })) as any;
      setList(data.data.data.rows);
    } finally {
      setLoading(false);
    }
  };

  useMount(refresh);

  const del = async item => {
    await certificateDelete({ id: item.id });
    refresh();
  };
  const onSearch = async value => {
    setLoading(true);
    try {
      const data = (await certificateList({
        page: 1,
        size: 1000,
        name: value,
      })) as any;
      setList(data.data.data.rows);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={classNames(styles.page, styles.main)}>
      <div className={styles.titleWrapper}>
        <h1>{I18N.carbonAccount.certificateManagement}</h1>
        {checkPermissions(
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setDrawerVisible(true)}
          >
            {I18N.carbonAccount.addCertificate}</Button>,
          'carbonAccount:certificate:add',
        )}
      </div>
      <Search
        placeholder={I18N.carbonAccount.certificateNameI}
        onSearch={onSearch}
        style={{ width: 200, marginBottom: 20 }}
      />
      <Spin spinning={loading}>
        <div className={styles.wrapper}>
          {list.map(item => (
            <div
              className={styles.card}
              onClick={() => {
                if (!checkPermissions(true, 'carbonAccount:certificate:info')) {
                  message.error(I18N.carbonAccount.noPermissionTemporarily);
                  return;
                }
                setDrawerInitialValues(
                  pick(
                    {
                      ...item,
                      stylePic: [{ url: item.stylePic }],
                      unlockPic: [{ url: item.unlockPic }],
                    },
                    [
                      'id',
                      'name',
                      'certificate',
                      'periodBegin',
                      'periodEnd',
                      'stylePic',
                      'unlockPic',
                      'showType',
                      'conditionList',
                    ],
                  ),
                );
                setDrawerVisible(true);
              }}
            >
              <div className={styles.tag}>{item.count}{I18N.carbonAccount.peopleHaveObtained}</div>
              <img className={styles.stylePic} src={item.stylePic} alt='' />
              <div className={styles.stylePicBg} />
              <div className={styles.info}>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.id}>
                  <span>id</span> <span>{item.certificate}</span>
                </div>
                <div className={styles.time}>
                  {I18N.carbonAccount.activityTime}{item.periodBegin}{I18N.carbonFootprint.to}{item.periodEnd}
                </div>
              </div>
              <img className={styles.unlockPic} src={item.unlockPic} alt='' />
              {checkPermissions(
                <div
                  onClick={e => {
                    e.stopPropagation();
                    Modal.confirm({
                      title: I18N.carbonAccount.confirmDeletionOfThis2,
                      content: I18N.carbonAccount.afterCertificateDeletion,
                      onOk: async () => {
                        await del(item);
                      },
                      onCancel: () => {},
                      okText: I18N.carbonFootprint.confirm,
                      cancelText: I18N.carbonFootprint.cancel,
                    });
                  }}
                  className={styles.delWrapper}
                >
                  <img src={deleteIcon} className={styles.del} alt='' />
                </div>,
                'carbonAccount:certificate:deleted',
              )}
            </div>
          ))}
        </div>
      </Spin>
      <CertificateDrawer
        drawerVisible={drawerVisible}
        setDrawerVisible={visible => {
          if (!visible) {
            setDrawerInitialValues(undefined);
          }
          setDrawerVisible(visible);
        }}
        initialValues={drawerInitialValues}
        refresh={refresh}
      />
    </div>
  );
};

export default Management;
