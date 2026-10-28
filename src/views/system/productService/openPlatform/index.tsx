import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Button, Form, Input, Modal, Space, Switch, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';

import {
  createApiKey,
  getApiKeyList,
  rotateApiKey,
  updateApiKeyStatus,
} from './service';
import {
  ApiKeySecretData,
  CreateApiKeyReq,
  OpenPlatformApiKeyItem,
} from './type';
import style from '../index.module.less';
import styles from './index.module.less';

const OpenPlatform = () => {
  const [form] = Form.useForm<CreateApiKeyReq>();
  const [loading, setLoading] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [secretVisible, setSecretVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiKeys, setApiKeys] = useState<OpenPlatformApiKeyItem[]>([]);
  const [secretData, setSecretData] = useState<ApiKeySecretData>();

  const fetchList = async () => {
    setLoading(true);
    try {
      const back = await getApiKeyList();
      setApiKeys(back?.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const showSecretModal = (data?: ApiKeySecretData) => {
    if (!data?.apiKey) return;
    setSecretData(data);
    setSecretVisible(true);
  };

  const copyApiKey = async () => {
    if (!secretData?.apiKey) return;
    await navigator.clipboard.writeText(secretData.apiKey);
    Toast('success', I18N.components.apiKeyCopied);
  };

  const onCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const back = await createApiKey(values);
      Toast('success', I18N.components.success);
      setCreateVisible(false);
      form.resetFields();
      showSecretModal(back?.data?.data);
      await fetchList();
    } finally {
      setSubmitting(false);
    }
  };

  const onStatusChange = async (
    item: OpenPlatformApiKeyItem,
    checked: boolean,
  ) => {
    const targetStatus: 0 | 1 = checked ? 1 : 0;
    await updateApiKeyStatus({
      id: item.id,
      status: targetStatus,
    });
    Toast('success', I18N.components.success);
    await fetchList();
  };

  const onRotate = async (item: OpenPlatformApiKeyItem) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.components.apiKeyConfirmReset,
      onOk: async () => {
        const back = await rotateApiKey({ id: item.id });
        Toast('success', I18N.components.success);
        showSecretModal(back?.data?.data);
        await fetchList();
      },
    });
  };

  const columns: ColumnsType<OpenPlatformApiKeyItem> = [
    {
      title: I18N.components.apiKeyName,
      dataIndex: 'name',
      width: 220,
    },
    {
      title: 'Key ID',
      dataIndex: 'keyId',
      width: 200,
    },
    {
      title: I18N.components.apiKeyMasked,
      dataIndex: 'apiKeyMasked',
      width: 260,
      render: (_, record) => (
        <span className={styles.maskedKey}>
          {record.apiKeyMasked || record.keyId || '-'}
        </span>
      ),
    },
    {
      title: I18N.components.apiKeyStatus,
      dataIndex: 'status',
      width: 130,
      render: (_, record) => (
        <Space size={8}>
          <Switch
            checked={record.status === 1}
            onChange={checked => onStatusChange(record, checked)}
          />
          <span className={styles.statusText}>
            {record.status === 1
              ? I18N.components.apiKeyEnabled
              : I18N.components.apiKeyDisabled}
          </span>
        </Space>
      ),
    },
    {
      title: I18N.components.apiKeyOperation,
      dataIndex: 'operation',
      width: 120,
      render: (_, record) => (
        <Button type='link' onClick={() => onRotate(record)}>
          {I18N.components.apiKeyReset}
        </Button>
      ),
    },
    {
      title: I18N.system.lastLogin,
      dataIndex: 'lastUsedAt',
      width: 180,
      render: val => val || '-',
    },
    {
      title: I18N.system.applicationTime,
      dataIndex: 'createTime',
      width: 180,
      render: val => val || '-',
    },
  ];

  return (
    <div
      className={`${style.homeProductOrder} ${styles.openPlatformPage} m-b-60`}
    >
      <div className={styles.headerCard}>
        <div className={styles.titleBlock}>
          <div className={styles.title}>{I18N.components.openPlatform}</div>
          <div className={styles.desc}>
            {I18N.components.apiKeyShowOnceDesc}
          </div>
        </div>
        <Button
          type='primary'
          className={style.btn}
          onClick={() => setCreateVisible(true)}
        >
          {I18N.components.createApiKey}
        </Button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableTitle}>{I18N.components.apiKeyList}</div>
        <Table<OpenPlatformApiKeyItem>
          rowKey='id'
          bordered={false}
          loading={loading}
          dataSource={apiKeys}
          columns={columns}
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </div>

      <Modal
        title={I18N.components.createApiKey}
        open={createVisible}
        onCancel={() => setCreateVisible(false)}
        onOk={onCreate}
        okButtonProps={{ loading: submitting }}
      >
        <Form<CreateApiKeyReq> form={form} layout='vertical'>
          <Form.Item
            label={I18N.components.apiKeyName}
            name='name'
            rules={[
              {
                required: true,
                message: `${I18N.components.apiKeyName}${I18N.system.cannotBeEmpty}`,
              },
            ]}
          >
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item
            label={I18N.components.apiKeyRemark}
            name='remark'
            rules={[
              {
                required: true,
                message: `${I18N.components.apiKeyRemark}${I18N.system.cannotBeEmpty}`,
              },
            ]}
          >
            <Input.TextArea rows={4} maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={I18N.components.apiKeyShowOnceTitle}
        open={secretVisible}
        onCancel={() => {
          setSecretVisible(false);
          setSecretData(undefined);
        }}
        footer={[
          <Button key='copy' type='primary' onClick={copyApiKey}>
            {I18N.carbonFootprint.copy}
          </Button>,
          <Button
            key='close'
            onClick={() => {
              setSecretVisible(false);
              setSecretData(undefined);
            }}
          >
            {I18N.components.gotIt}
          </Button>,
        ]}
      >
        <div className={styles.secretDesc}>
          {I18N.components.apiKeyShowOnceDesc}
        </div>
        <Input.TextArea
          value={secretData?.apiKey}
          autoSize={{ minRows: 3, maxRows: 6 }}
          readOnly
        />
      </Modal>
    </div>
  );
};

export default OpenPlatform;
