import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Button, Modal, ModalProps, Spin, Table } from 'antd';
import saveAs from 'file-saver';
import { FC, memo, useState } from 'react';

import style from './index.module.less';
import { FileListType } from '../../../carbonFootprintCertification/type';

interface DownLoadModalProps extends ModalProps {
  fileList: FileListType[];
}

const DownLoadModal: FC<DownLoadModalProps> = ({ fileList = [], ...rest }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const onChange = s => {
    setSelectedRowKeys(s);
  };

  const onSave = async (url: string, name: string) => {
    try {
      if (loading) return;
      setLoading(true);
      await saveAs(url, name);
    } finally {
      setLoading(false);
    }
    // @ts-ignore
    rest?.onCancel?.();
  };

  const onSaveCheck = async () => {
    const files = fileList.filter(f => selectedRowKeys.includes(Number(f.id)));

    files?.forEach(f => {
      onSave(f?.url || '', f.name || I18N.Certification.file);
    });
    // @ts-ignore
    rest?.onCancel?.();
  };

  return (
    <Modal
      {...rest}
      destroyOnClose
      width={760}
      keyboard={false}
      closable={!loading}
      okText={I18N.carbonFootprint.download}
      className={style.downLoadModal}
      onOk={() => {
        if (!selectedRowKeys.length) {
          Toast('error', I18N.Certification.pleaseSelectAFile);
        }
        onSaveCheck();
      }}
      okButtonProps={{
        loading,
        disabled: !fileList.length,
      }}
      cancelButtonProps={{
        disabled: loading,
      }}
    >
      <Spin spinning={loading}>
        <Table
          rowKey='id'
          pagination={false}
          dataSource={fileList}
          columns={[
            {
              title: I18N.carbonFootprint.fileName,
              width: 536,
              fixed: 'left',
              dataIndex: 'name',
              ellipsis: true,
            },
            {
              title: I18N.carbonFootprint.operation,
              width: 102,
              dataIndex: 'action',
              render(t, r) {
                return (
                  <Button
                    type='link'
                    className={style.downBtn}
                    onClick={() => onSave(r.url || '', r.name || '')}
                  >
                    {I18N.carbonFootprint.download}
                  </Button>
                );
              },
            },
          ]}
          scroll={
            fileList?.length > 5
              ? {
                  y: 325,
                }
              : {}
          }
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange,
          }}
        />
      </Spin>
    </Modal>
  );
};

export default memo(DownLoadModal);
