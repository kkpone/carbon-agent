import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Input, Table, TableColumnsType } from 'antd';
import { debounce } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibabaNew } from '@/components/iconfont';
import { RouteMapsSupplyChain2 } from '@/router/route-paths/supplyChain2';
import { Toast } from '@/utils';

import styles from './index.module.less';
import { deleteProduct, getProductList } from './service';

const ProductList: FC = () => {
  const history = useHistory();

  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    name?: string;
  }>({
    pageNum: 1,
    pageSize: 10,
  });
  const [productList, setProductList] = useState<Record<string, any>[]>([]);

  const [total, setTotal] = useState(0);

  const { pageNum, pageSize } = searchParams;

  const [loading, setLoading] = useState(false);

  const onSearchNameInput = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({ ...searchParams, name: name || undefined });
      }, 300),
    [searchParams],
  );

  const onProductDelete = async (record: Record<string, any>) => {
    await deleteProduct({ purchaseGoodsId: record.purchaseGoodsId });
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    setSearchParams({ ...searchParams });
  };

  const columns: TableColumnsType<Record<string, any>> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__no__',
      width: 68,
      fixed: 'left',
      render: (_, record, index) => (pageNum - 1) * pageSize + 1 + index,
    },
    {
      title: I18N.carbonFootprint.productName,
      dataIndex: 'name',
      width: 190,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootprint.specificationAndModel,
      dataIndex: 'specification',
      width: 120,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.unit,
      dataIndex: 'computationUnit',
      width: 120,
    },
    {
      title: I18N.carbonFootprint.updatedBy,
      dataIndex: 'updateBy',
      width: 120,
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      width: 162,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.operateColumn}>
          {checkPermissions(
            <Button
              type='link'
              onClick={() => {
                history.push({
                  pathname:
                    RouteMapsSupplyChain2.supplyChainPurchaseProductDetails.replace(
                      ':id',
                      `${record.purchaseGoodsId}`,
                    ),
                });
              }}
            >
              {I18N.carbonFootprint.check}
            </Button>,
            'supplier:goods:info',
          )}
          {checkPermissions(
            <Button type='link' danger onClick={() => onProductDelete(record)}>
              {I18N.carbonFootprint.delete}
            </Button>,
            'supplier:goods:deleted',
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    setLoading(true);
    getProductList(searchParams)
      .then(({ data }) => {
        setProductList(data.rows);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className={styles.productList}>
      <div className={styles.header}>
        <div className={styles.title}>
          {I18N.carbonFootprint3.purchasingProducts}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.operate}>
          <Input
            style={{ width: 240 }}
            placeholder={I18N.carbonFootprint.productName}
            suffix={<SearchOutlined style={{ color: '#999EA4' }} />}
            onChange={e => onSearchNameInput(e.target.value)}
          />
          {checkPermissions(
            <Button
              className={styles.tabBarButton}
              type='primary'
              icon={<PlusOutlined />}
              onClick={() =>
                history.push(
                  RouteMapsSupplyChain2.supplyChainPurchaseProductAddition,
                )
              }
            >
              {I18N.carbonFootprint.newAddition}
            </Button>,
            'supplier:goods:add',
          )}
          {checkPermissions(
            <Button
              className={styles.tabBarButton}
              icon={<IconAlibabaNew type='icon-icon-daoru' />}
              onClick={() =>
                history.push(
                  RouteMapsSupplyChain2.supplyChainPurchaseProductImport,
                )
              }
            >
              {I18N.carbonFootprint.import}
            </Button>,
            'supplier:goods:import',
          )}
        </div>
        <Table
          rowKey='purchaseGoodsId'
          columns={columns}
          loading={loading}
          pagination={{
            total,
            pageSize,
            current: pageNum,
            showSizeChanger: true,
            showTotal: count =>
              I18N.template(I18N.supplyChain.coCoun4, { val1: count }),
          }}
          scroll={{ x: 1200 }}
          dataSource={productList}
          onChange={pager => {
            setSearchParams({
              ...searchParams,
              pageNum: pager.current || 1,
              pageSize: pager.pageSize || 1,
            });
          }}
        />
      </div>
    </div>
  );
};

export default ProductList;
