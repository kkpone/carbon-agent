import useUrlState from '@ahooksjs/use-url-state';
import { checkPermissions } from '@src/components/Permission/utils';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import ProductSupplierModal from '@src/views/supplyChain/components/ProductSupplierModal';
import SelectSupplierModal from '@src/views/supplyChain/components/SelectSupplierModal';
import commonStyles from '@src/views/supplyChain/index.module.less';
import {
  editPurchaseProductSupplier,
  getSupplierDetails,
} from '@src/views/supplyChain/service';
import { ProductSupplier, SupplierDetails } from '@src/views/supplyChain/type';
import { transformFilterObj } from '@src/views/supplyChain/utils';
import { Button, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { isNil, omit } from 'lodash-es';
import {
  useEffect,
  useState,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import {
  addProductSupplier,
  deleteProductSupplier,
  getProductSupplierFilterOptions,
  getProductSupplierList,
  selectProductSupplier,
} from '../../service';
import { ProductSupplierFilterOptions } from '../../type';

type ProductSupplierTableProps = {
  id: number;
};

const ProductSupplierTable: ForwardRefRenderFunction<
  { addSupplier: () => void; selectSupplier: () => void },
  ProductSupplierTableProps
> = ({ id }, ref) => {
  const [productSupplierModalVisible, setProductSupplierModalVisible] =
    useState(false);

  const [currProductSupplier, setCurrProductSupplier] =
    useState<SupplierDetails | null>(null);

  const [selectSupplierModalVisible, setSelectSupplierModalVisible] =
    useState(false);

  const [urlParams, setUrlParams] = useUrlState<{
    pageNum: number;
    pageSize: number;
    companyName?: string;
    refreshFlag?: boolean;
  }>({ pageNum: 1, pageSize: 10 });

  const [filterOptions, setFilterOptions] =
    useState<ProductSupplierFilterOptions>([]);

  const { companyName } = urlParams;

  const pageNum = Number(urlParams.pageNum);

  const pageSize = Number(urlParams.pageSize);

  const refreshFlag = `${urlParams.refreshFlag}` === 'true';

  const getFilterOptions = (purchaseGoodsId: number) => {
    getProductSupplierFilterOptions({ purchaseGoodsId }).then(({ data }) => {
      setFilterOptions(
        (data.data || []).map(option => ({ ...option, id: `${option.id}` })),
      );
    });
  };

  const onProductSupplierEdit = async (supplierId: number) => {
    const { data } = await getSupplierDetails({ supplierId });
    setCurrProductSupplier({
      ...data.data,
      area:
        typeof data.data.area === 'string'
          ? JSON.parse(data.data.area)
          : undefined,
    });
    setProductSupplierModalVisible(true);
  };

  const onProductSupplierDelete = async (supplier: ProductSupplier) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.supplyChain.doYouWantToRemoveTheSupply, {
        val1: supplier.companyName,
      }),
      onOk: async () => {
        await deleteProductSupplier({ id: supplier.id });
        Toast('success', I18N.supplyChain.removalSuccessful);
        setUrlParams({ refreshFlag: !refreshFlag });
        getFilterOptions(id);
      },
    });
  };

  const columns: ColumnsType<ProductSupplier> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 74,
      ellipsis: true,
      fixed: 'left',
      render: (_, record, index) => pageSize * (pageNum - 1) + index + 1,
    },
    {
      title: I18N.carbonFootprint3.supplierName,
      dataIndex: 'companyName',
      width: 204,
      ellipsis: true,
      fixed: 'left',
      filterSearch: true,
      filteredValue: !isNil(companyName)
        ? (companyName as string).split(',')
        : undefined,
      filters: filterOptions.map(option => ({
        value: option.id,
        text: option.companyName,
      })),
    },
    {
      title: I18N.carbonFootprint.contacts,
      dataIndex: 'contacts',
      width: 136,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.cellPhone,
      dataIndex: 'phone',
      width: 136,
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
      width: 152,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 148,
      fixed: 'right',
      render: (_, record) => (
        <>
          {checkPermissions(
            <Button
              className={commonStyles.operateBtn}
              type='link'
              onClick={() => onProductSupplierEdit(record.supplierId)}
            >
              {I18N.carbonFootprint.edit}
            </Button>,
            'supplier:goods:editSupplier',
          )}
          {checkPermissions(
            <Button
              className={commonStyles.operateBtn}
              type='link'
              danger
              onClick={() => onProductSupplierDelete(record)}
            >
              {I18N.supplyChain.remove}
            </Button>,
            'supplier:goods:deletedSupplier',
          )}
        </>
      ),
    },
  ];

  const onProductSupplierModalClose = () => {
    setProductSupplierModalVisible(false);
    setCurrProductSupplier(null);
  };

  const onProductSupplierModalConfirm = async (formValues: SupplierDetails) => {
    const onUpdateSuccess = (restPage?: number) => {
      onProductSupplierModalClose();
      getFilterOptions(id);
      setUrlParams({
        pageNum: restPage ?? pageNum,
        refreshFlag: !refreshFlag,
      });
    };

    const supplierValues = {
      ...formValues,
      supplierIdName: omit(formValues.supplierIdName, 'isManualInput'),
    };

    if (currProductSupplier) {
      await editPurchaseProductSupplier(supplierValues);
      Toast('success', I18N.carbonFootprint.saveSuccessful);
      onUpdateSuccess();
    } else {
      await addProductSupplier({ ...supplierValues, purchaseGoodsId: id });
      Toast('success', I18N.supplyChain.invitationSuccessful);
      onUpdateSuccess(1);
    }
  };

  const onSelectSupplierModalClose = () => {
    setSelectSupplierModalVisible(false);
  };

  const onSelectSupplier = async (supplierIds: number[]) => {
    await selectProductSupplier({ supplierIds, purchaseGoodsId: id });
    Toast('success', I18N.supplyChain.selectionSuccessful);
    setUrlParams({ pageNum: 1, refreshFlag: !refreshFlag });
    onSelectSupplierModalClose();
    getFilterOptions(id);
  };

  useImperativeHandle(
    ref,
    () => ({
      addSupplier: () => {
        setCurrProductSupplier(null);
        setProductSupplierModalVisible(true);
      },
      selectSupplier: () => {
        setSelectSupplierModalVisible(true);
      },
    }),
    [],
  );

  useEffect(() => {
    getFilterOptions(id);
  }, [id]);

  return (
    <>
      <CommonTable
        columns={columns}
        rowKey='id'
        pagination={{
          current: pageNum,
          pageSize,
          showTotal: total =>
            I18N.template(I18N.supplyChain.totalTota6, { val1: total }),
        }}
        searchParams={urlParams}
        scroll={{ x: 1200 }}
        fetchApi={() =>
          getProductSupplierList({
            purchaseGoodsId: id,
            companyName,
            pageNum,
            pageSize,
          })
        }
        returnFetchApi={back => ({
          data: back.data.rows,
          count: back.data.total,
        })}
        onChange={(pagination, filter, _, { action }) => {
          if (action === 'paginate') {
            setUrlParams({
              pageNum: pagination.current,
              pageSize: pagination.pageSize,
            });
          } else if (action === 'filter') {
            setUrlParams({
              ...transformFilterObj(filter),
              pageNum: 1,
            });
          }
        }}
      />
      <ProductSupplierModal
        visible={productSupplierModalVisible}
        productSupplier={currProductSupplier}
        onCancel={onProductSupplierModalClose}
        onOk={onProductSupplierModalConfirm}
      />
      <SelectSupplierModal
        visible={selectSupplierModalVisible}
        purchaseProductId={id}
        onCancel={onSelectSupplierModalClose}
        onOk={onSelectSupplier}
      />
    </>
  );
};

export default forwardRef(ProductSupplierTable);
