import I18N from '@src/lang/I18N';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { Button, Form, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import { AsyncReturnType } from 'type-fest';

import styles from './index.module.less';
import { getSelectProductList } from './service';
import { PurchaseProduct } from '../../type';

type SelectProductModalProps = {
  visible: boolean;
  supplierId: number;
  onCancel: () => void;
  onOk: (ids: number[]) => Promise<void> | void;
};

const SelectProductModal: FC<SelectProductModalProps> = ({
  visible,
  supplierId,
  onCancel,
  onOk,
}) => {
  const [loading, setLoading] = useState(false);

  const [searchForm] = Form.useForm();

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const [pager, setPager] = useState({ pageNum: 1, pageSize: 10 });

  const [total, setTotal] = useState(0);

  const [formSearchParams, setFormSearchParams] = useState<{ name?: string }>({
    name: '',
  });

  const searchParams = useMemo(
    () => ({ ...pager, supplierId, name: formSearchParams.name }),
    [pager, formSearchParams, supplierId],
  );

  const columns: ColumnsType<PurchaseProduct> = [
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
      title: I18N.carbonFootprint.productName,
      dataIndex: 'name',
      width: 216,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootprint3.specificationAndModel,
      dataIndex: 'specification',
      width: 216,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.accountingUnit,
      dataIndex: 'computationUnit',
      width: 216,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.productDescription,
      dataIndex: 'descr',
      width: 216,
      ellipsis: true,
    },
  ];

  useEffect(() => {
    if (!visible) {
      setPager({ pageNum: 1, pageSize: 10 });
      setFormSearchParams({ name: '' });
      setSelectedProductIds([]);
    }

    setTimeout(() => searchForm.resetFields());
  }, [visible, searchForm]);

  return (
    <Modal
      className={classNames(styles.selectProductModal, {
        [styles.emptySelectProductModal]: total === 0,
      })}
      title={I18N.supplyChain.selectProcurementProducts}
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
            name: 'name',
            type: 'input',
            placeholder: I18N.carbonFootprint.productName,
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
          setFormSearchParams({ name: '' });
        }}
      />
      <CommonTable
        columns={columns}
        rowKey='purchaseGoodsId'
        pagination={{
          current: pager.pageNum,
          pageSize: pager.pageSize,
          position: ['bottomLeft'],
          showTotal: totalCount =>
            I18N.template(I18N.supplyChain.totalTota12, { val1: totalCount }),
        }}
        searchParams={searchParams}
        scroll={{ y: 288 }}
        rowSelection={{
          type: 'checkbox',
          fixed: true,
          selectedRowKeys: selectedProductIds,
          columnWidth: 48,
          onSelect: ({ purchaseGoodsId }, selected) => {
            setSelectedProductIds(
              selected
                ? [...new Set([...selectedProductIds, purchaseGoodsId])]
                : selectedProductIds.filter(id => id !== purchaseGoodsId),
            );
          },
          onSelectAll: (selected, _, changeRows) => {
            const changeIds = changeRows.map(row => row.purchaseGoodsId);
            setSelectedProductIds(
              selected
                ? [...new Set([...selectedProductIds, ...changeIds])]
                : selectedProductIds.filter(id => !changeIds.includes(id)),
            );
          },
        }}
        fetchApi={() => getSelectProductList(searchParams)}
        returnFetchApi={(
          back: AsyncReturnType<typeof getSelectProductList>,
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
          disabled={selectedProductIds.length === 0}
          onClick={async () => {
            try {
              setLoading(true);
              await onOk(selectedProductIds);
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

export default SelectProductModal;
