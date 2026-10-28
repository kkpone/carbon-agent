import { Input, FormGrid, FormItem, Cascader } from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import commonStyles from '@src/views/supplyChain/index.module.less';
import { Button, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import { isNil, omit } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { AsyncReturnType } from 'type-fest';

import { apiCity } from '@/api/api';

import styles from './index.module.less';
import {
  deleteInviteSupplier,
  editInviteSupplier,
  getInviteSupplierFilterOptions,
  getInviteSupplierList,
} from './service';
import {
  InviteSupplier,
  InviteSupplierFilterOptions,
  SearchParams,
} from './type';
import {
  INVITE_SUPPLIER_STATUS,
  INVITE_SUPPLIER_STATUS_LABEL,
} from '../../constant';
import { genSupplierSchema } from '../../schema';
import { transformFilterObj } from '../../utils';

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    FormItem,
    Input,
    Cascader,
  },
});

const InviteSupplierDetailsModal = ({
  visible,
  inviteSupplier,
  onCancel,
  onOk,
}: {
  visible: boolean;
  inviteSupplier?: InviteSupplier | null;
  onCancel: () => void;
  onOk: (val: InviteSupplier) => void | Promise<void>;
}) => {
  const [loading, setLoading] = useState(false);

  const form = useMemo(
    () =>
      createForm({
        initialValues: !isNil(inviteSupplier)
          ? {
              supplierMiddleId: inviteSupplier.supplierMiddleId,
              companyName: inviteSupplier.companyName,
              companyNumber: inviteSupplier.companyNumber,
              companyNum: inviteSupplier.companyNum,
              contacts: inviteSupplier.contacts,
              phone: inviteSupplier.phone,
              email: inviteSupplier.email,
              remark: inviteSupplier.remark,
              area:
                typeof inviteSupplier.area === 'string'
                  ? JSON.parse(inviteSupplier.area)
                  : undefined,
            }
          : undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, inviteSupplier],
  );

  const onConfirm = async () => {
    const values = await form.submit<InviteSupplier>();
    try {
      setLoading(true);
      await onOk({
        ...values,
        area: values.area ? JSON.stringify(values.area) : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      apiCity().then(options => {
        form.query('area')?.take()?.setComponentProps({
          options,
        });
      });
    }
  }, [visible, form]);

  return (
    <Modal
      title={I18N.supplyChain2.supplierDetails}
      open={visible}
      width={688}
      okText={I18N.carbonFootprint.preserve}
      okButtonProps={{ loading }}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      <FormilyCommon form={form}>
        <SchemaField
          schema={genSupplierSchema({
            columns: 2,
            columnGap: 16,
            isSelectSupplier: false,
            showAreaField: false,
          })}
        />
      </FormilyCommon>
    </Modal>
  );
};

type BatchInviteSupplierModalProps = {
  visible: boolean;
  operateKey: string;
  onCancel: () => void;
  onOk: (opt?: { inviteFlag?: boolean }) => void | Promise<void>;
};

const BatchInviteSupplierModal: FC<BatchInviteSupplierModalProps> = ({
  visible,
  operateKey,
  onCancel,
  onOk,
}) => {
  const [loading, setLoading] = useState(false);

  const [total, setTotal] = useState(0);

  const [sumTotal, setSumTotal] = useState(0);

  const [currInviteSupplier, setCurrInviteSupplier] =
    useState<InviteSupplier | null>(null);

  const [
    inviteSupplierDetailsModalVisible,
    setInviteSupplierDetailsModalVisible,
  ] = useState(false);

  const [searchParams, setSearchParams] = useState<
    SearchParams & { refreshFlag?: boolean }
  >({
    pageNum: 1,
    pageSize: 10,
  });

  const [filterOptions, setFilterOptions] =
    useState<InviteSupplierFilterOptions>([]);

  const { pageNum, pageSize, companyName, contacts, status } = searchParams;

  const getFilterOptions = async (key: string) => {
    if (key) {
      getInviteSupplierFilterOptions({ operateKey: key }).then(({ data }) => {
        setFilterOptions(data.data || []);
      });
    }
  };

  const onInviteSupplierDetailsModalClose = () => {
    setInviteSupplierDetailsModalVisible(false);
    setCurrInviteSupplier(null);
  };

  const onInviteSupplierEdit = (supplier: InviteSupplier) => {
    setCurrInviteSupplier(supplier);
    setInviteSupplierDetailsModalVisible(true);
  };

  const onInviteSupplierSave = async (supplier: InviteSupplier) => {
    await editInviteSupplier(supplier);
    Toast('success', I18N.carbonFootprint.saveSuccessful);
    onInviteSupplierDetailsModalClose();
    setSearchParams({
      ...searchParams,
      refreshFlag: !searchParams.refreshFlag,
    });
    getFilterOptions(operateKey);
  };

  const onInviteSupplierDelete = (supplier: InviteSupplier) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.supplyChain.doYouWantToRemoveTheSupply2, {
        val1: supplier.companyName,
      }),
      onOk: async () => {
        await deleteInviteSupplier({
          supplierMiddleId: supplier.supplierMiddleId,
        });
        Toast('success', I18N.supplyChain.removalSuccessful);
        setSearchParams({
          ...searchParams,
          refreshFlag: !searchParams.refreshFlag,
        });
        getFilterOptions(operateKey);
      },
    });
  };

  const columns: ColumnsType<InviteSupplier> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 84,
      ellipsis: true,
      fixed: 'left',
      render: (_, record, index) => pageSize * (pageNum - 1) + index + 1,
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'status',
      width: 106,
      ellipsis: true,
      filteredValue: !isNil(status) ? status.split(',') : undefined,
      filters: [
        {
          value: INVITE_SUPPLIER_STATUS.ENABLED,
          text: INVITE_SUPPLIER_STATUS_LABEL[INVITE_SUPPLIER_STATUS.ENABLED],
        },
        {
          value: INVITE_SUPPLIER_STATUS.DISABLED,
          text: INVITE_SUPPLIER_STATUS_LABEL[INVITE_SUPPLIER_STATUS.DISABLED],
        },
      ],
      render: (_, record) => (
        <div
          className={classNames(styles.status, {
            [styles.enabledStatus]:
              record.status === INVITE_SUPPLIER_STATUS.ENABLED,
            [styles.disabledStatus]:
              record.status === INVITE_SUPPLIER_STATUS.DISABLED,
          })}
        >
          {record.statusDesc}
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint3.supplierName,
      dataIndex: 'companyName',
      width: 204,
      ellipsis: true,
      filterSearch: true,
      filteredValue: !isNil(companyName) ? companyName.split(',') : undefined,
      filters: filterOptions.map(option => ({
        value: option.supplierMiddleId,
        text: option.companyName,
      })),
      render: (text, record) => (
        <>
          <span title={text || '-'}>{text || '-'}</span>
          {record.companyNameErrorMsg && (
            <div className={styles.unCompText}>
              {record.companyNameErrorMsg}
            </div>
          )}
        </>
      ),
    },
    {
      title: I18N.supplyChain2.supplierCode,
      dataIndex: 'companyNumber',
      width: 204,
      ellipsis: true,
      render: (text, record) => (
        <>
          <span title={text || '-'}>{text || '-'}</span>
          {record.companyNumberErrorMsg && (
            <div className={styles.unCompText}>
              {record.companyNumberErrorMsg}
            </div>
          )}
        </>
      ),
    },
    {
      title: I18N.supplyChain.organizationalCode,
      dataIndex: 'companyNum',
      width: 204,
      ellipsis: true,
      render: (text, record) => (
        <>
          <span title={text || '-'}>{text || '-'}</span>
          {record.companyNumErrorMsg && (
            <div className={styles.unCompText}>{record.companyNumErrorMsg}</div>
          )}
        </>
      ),
    },
    {
      title: I18N.carbonFootprint.contacts,
      dataIndex: 'contacts',
      width: 112,
      ellipsis: true,
      filterSearch: true,
      filteredValue: !isNil(contacts) ? contacts.split(',') : undefined,
      filters: filterOptions.map(option => ({
        value: option.supplierMiddleId,
        text: option.contacts,
      })),
      render: (text, record) => (
        <>
          <span title={text || '-'}>{text || '-'}</span>
          {record.contactsErrorMsg && (
            <div className={styles.unCompText}>{record.contactsErrorMsg}</div>
          )}
        </>
      ),
    },
    {
      title: I18N.carbonFootprint3.cellPhone,
      dataIndex: 'phone',
      width: 136,
      ellipsis: true,
      render: (text, record) => (
        <>
          <span title={text || '-'}>{text || '-'}</span>
          {record.phoneErrorMsg && (
            <div className={styles.unCompText}>{record.phoneErrorMsg}</div>
          )}
        </>
      ),
    },
    {
      title: I18N.carbonFootprint3.contactEmail,
      dataIndex: 'email',
      width: 192,
      ellipsis: true,
      render: (text, record) => (
        <>
          <span title={text || '-'}>{text || '-'}</span>
          {record.emailErrorMsg && (
            <div className={styles.unCompText}>{record.emailErrorMsg}</div>
          )}
        </>
      ),
    },
    {
      title: I18N.carbonFootprint.remarks,
      dataIndex: 'remark',
      width: 192,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 148,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            className={commonStyles.operateBtn}
            type='link'
            onClick={() => onInviteSupplierEdit(record)}
          >
            {I18N.carbonFootprint3.details}
          </Button>
          <Button
            className={commonStyles.operateBtn}
            type='link'
            danger
            onClick={() => onInviteSupplierDelete(record)}
          >
            {I18N.supplyChain.remove}
          </Button>
        </>
      ),
    },
  ];

  const onConfirm = async (opt?: { inviteFlag?: boolean }) => {
    try {
      setLoading(true);
      await onOk(opt);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      getFilterOptions(operateKey);
    }
  }, [visible, operateKey]);

  useEffect(() => {
    if (!visible) {
      setSumTotal(0);
      setSearchParams({ pageNum: 1, pageSize: 10 });
      setCurrInviteSupplier(null);
    }
  }, [visible]);
  return (
    <Modal
      className={classNames(styles.batchInviteSupplierModal, {
        [styles.emptyBatchInviteSupplierModal]: total === 0,
      })}
      title={
        <>
          <div>{I18N.supplyChain.invitationListConfirmed}</div>
          <div className={styles.modalTitleCaption}>
            {I18N.supplyChain.afterConfirmationOnlyFor}
          </div>
        </>
      }
      destroyOnClose
      open={visible}
      width={1024}
      footer={null}
      onCancel={onCancel}
    >
      <CommonTable
        columns={columns}
        rowKey='supplierMiddleId'
        pagination={{
          current: pageNum,
          pageSize,
          position: ['bottomLeft'],
          showTotal: totalCount =>
            I18N.template(I18N.supplyChain.totalTota9, { val1: totalCount }),
        }}
        searchParams={searchParams}
        scroll={{ y: 288 }}
        fetchApi={() =>
          getInviteSupplierList({
            ...omit(searchParams, 'refreshFlag'),
            operateKey,
          })
        }
        returnFetchApi={(
          back: AsyncReturnType<typeof getInviteSupplierList>,
        ) => {
          setTotal(back.data.total);
          setSumTotal(back.data.sumTotal);
          return {
            data: back.data.rows,
            count: back.data.total,
          };
        }}
        onChange={(pagination, filter, _, { action }) => {
          if (action === 'paginate') {
            setSearchParams({
              ...searchParams,
              pageNum: pagination.current ?? 1,
              pageSize: pagination.pageSize ?? 10,
            });
          } else if (action === 'filter') {
            setSearchParams({
              ...searchParams,
              ...transformFilterObj(filter),
              pageNum: 1,
            });
          }
        }}
      />
      <div className={styles.customFooter}>
        <Button onClick={onCancel}>{I18N.carbonFootprint.cancel}</Button>
        <Button
          className={styles.confirmButton}
          loading={loading}
          disabled={sumTotal === 0}
          onClick={() => onConfirm({ inviteFlag: false })}
        >
          {I18N.supplyChain.batchSave}
        </Button>
        <Button
          className={styles.confirmButton}
          type='primary'
          loading={loading}
          disabled={sumTotal === 0}
          onClick={() => onConfirm({ inviteFlag: true })}
        >
          {I18N.supplyChain.batchInvitation}
        </Button>
      </div>
      <InviteSupplierDetailsModal
        visible={inviteSupplierDetailsModalVisible}
        inviteSupplier={currInviteSupplier}
        onCancel={onInviteSupplierDetailsModalClose}
        onOk={onInviteSupplierSave}
      />
    </Modal>
  );
};

export default BatchInviteSupplierModal;
