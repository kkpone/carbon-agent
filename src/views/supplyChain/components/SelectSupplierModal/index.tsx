import I18N from '@src/lang/I18N';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { Button, Form, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import { AsyncReturnType } from 'type-fest';

import styles from './index.module.less';
import { getSelectSupplierList } from './service';
import { Supplier } from '../../type';

type SelectSupplierModalProps = {
  visible: boolean;
  purchaseProductId: number;
  onCancel: () => void;
  onOk: (ids: number[]) => Promise<void> | void;
};

const SelectSupplierModal: FC<SelectSupplierModalProps> = ({
  visible,
  purchaseProductId,
  onCancel,
  onOk,
}) => {
  const [loading, setLoading] = useState(false);

  const [searchForm] = Form.useForm();

  const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);

  const [pager, setPager] = useState({ pageNum: 1, pageSize: 10 });

  const [total, setTotal] = useState(0);

  const [formSearchParams, setFormSearchParams] = useState<{
    companyName?: string;
    companyNumber?: string;
  }>({
    companyName: '',
    companyNumber: '',
  });

  const searchParams = useMemo(
    () => ({
      ...pager,
      purchaseGoodsId: purchaseProductId,
      companyName: formSearchParams.companyName,
      companyNumber: formSearchParams.companyNumber,
    }),
    [pager, formSearchParams, purchaseProductId],
  );

  const columns: ColumnsType<Supplier> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 84,
      ellipsis: true,
      fixed: 'left',
      render: (_, record, index) =>
        pager.pageSize * (pager.pageNum - 1) + index + 1,
    },
    {
      title: I18N.carbonFootprint3.supplierName,
      dataIndex: 'companyName',
      width: 168,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootprint.contacts,
      dataIndex: 'contacts',
      width: 152,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.cellPhone,
      dataIndex: 'phone',
      width: 152,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.contactEmail,
      dataIndex: 'email',
      width: 192,
      ellipsis: true,
    },
    {
      title: I18N.supplyChain2.supplierCode,
      dataIndex: 'companyNumber',
      width: 136,
      ellipsis: true,
    },
  ];

  useEffect(() => {
    if (!visible) {
      setPager({ pageNum: 1, pageSize: 10 });
      setFormSearchParams({ companyName: '', companyNumber: '' });
      setSelectedSupplierIds([]);
    }

    setTimeout(() => searchForm.resetFields());
  }, [visible, searchForm]);

  return (
    <Modal
      className={classNames(styles.selectSupplierModal, {
        [styles.emptySelectSupplierModal]: total === 0,
      })}
      title={I18N.supplyChain.selectSupplier}
      open={visible}
      width={1024}
      footer={null}
      destroyOnClose
      onCancel={onCancel}
    >
      <SearchFormUtil
        antdFormProps={{ layout: 'inline', form: searchForm }}
        formItems={[
          {
            label: '',
            name: 'companyName',
            type: 'input',
            placeholder: I18N.carbonFootprint3.supplierName,
            rules: false,
          },
          {
            label: '',
            name: 'companyNumber',
            type: 'input',
            placeholder: I18N.supplyChain2.supplierCode,
            rules: false,
          },
        ]}
        searchButtonProps={{ type: 'primary' }}
        searchSub={() => {
          setPager({ ...pager, pageNum: 1 });
          setFormSearchParams({ ...searchForm.getFieldsValue() });
        }}
        resetBack={() => {
          setPager({ ...pager, pageNum: 1 });
          setFormSearchParams({ companyName: '', companyNumber: '' });
        }}
      />
      <CommonTable
        columns={columns}
        rowKey='supplierId'
        pagination={{
          current: pager.pageNum,
          pageSize: pager.pageSize,
          position: ['bottomLeft'],
          showTotal: totalCount =>
            I18N.template(I18N.supplyChain.totalTota13, { val1: totalCount }),
        }}
        searchParams={searchParams}
        scroll={{ y: 288 }}
        rowSelection={{
          type: 'checkbox',
          fixed: true,
          selectedRowKeys: selectedSupplierIds,
          columnWidth: 48,
          onSelect: ({ supplierId }, selected) => {
            setSelectedSupplierIds(
              selected
                ? [...new Set([...selectedSupplierIds, supplierId])]
                : selectedSupplierIds.filter(id => id !== supplierId),
            );
          },
          onSelectAll: (selected, _, changeRows) => {
            const changeIds = changeRows.map(row => row.supplierId);
            setSelectedSupplierIds(
              selected
                ? [...new Set([...selectedSupplierIds, ...changeIds])]
                : selectedSupplierIds.filter(id => !changeIds.includes(id)),
            );
          },
        }}
        fetchApi={() => getSelectSupplierList(searchParams)}
        returnFetchApi={(
          back: AsyncReturnType<typeof getSelectSupplierList>,
        ) => {
          setTotal(back.data.total);
          return {
            data: back.data.rows,
            count: back.data.total,
          };
        }}
        onChange={pagination => {
          setPager({
            pageNum: pagination.current ?? 1,
            pageSize: pagination.pageSize ?? 10,
          });
        }}
      />
      <div className={styles.customFooter}>
        <Button onClick={onCancel}>{I18N.carbonFootprint.cancel}</Button>
        <Button
          className={styles.confirmButton}
          type='primary'
          loading={loading}
          disabled={selectedSupplierIds.length === 0}
          onClick={async () => {
            try {
              setLoading(true);
              await onOk(selectedSupplierIds);
            } finally {
              setLoading(false);
            }
          }}
        >
          {I18N.carbonFootprint3.confirmSelection}
        </Button>
      </div>
    </Modal>
  );
};

export default SelectSupplierModal;
