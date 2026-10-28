import useUrlState from '@ahooksjs/use-url-state';
import { checkPermissions } from '@src/components/Permission/utils';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import SelectProductModal from '@src/views/supplyChain/components/SelectProductModal';
import SupplierProductModal from '@src/views/supplyChain/components/SupplierProductModal';
import commonStyles from '@src/views/supplyChain/index.module.less';
import { SupplierProduct } from '@src/views/supplyChain/type';
import { transformFilterObj } from '@src/views/supplyChain/utils';
import { Button, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { isNil } from 'lodash-es';
import {
  useEffect,
  useState,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
} from 'react';

import {
  addSupplierProduct,
  deleteSupplierProduct,
  editSupplierProduct,
  getSupplierProductDetails,
  getSupplierProductFilterOptions,
  getSupplierProductList,
  selectSupplierProduct,
} from '../../service';
import { SupplierProductFilterOptions } from '../../type';

type SupplierProductProps = {
  id: number;
};

const SupplierProductTable: ForwardRefRenderFunction<
  { addProduct: () => void; selectProduct: () => void },
  SupplierProductProps
> = ({ id }, ref) => {
  const [supplierProductModalVisible, setSupplierProductModalVisible] =
    useState(false);

  const [selectProductModalVisible, setSelectProductModalVisible] =
    useState(false);

  const [currSupplierProduct, setCurrSupplierProduct] =
    useState<SupplierProduct | null>(null);

  const [urlParams, setUrlParams] = useUrlState<{
    pageNum: number;
    pageSize: number;
    name?: string;
    specification?: string;
    refreshFlag?: boolean;
  }>({ pageNum: 1, pageSize: 10 });

  const [filterOptions, setFilterOptions] =
    useState<SupplierProductFilterOptions>([]);

  const { name, specification } = urlParams;

  const pageNum = Number(urlParams.pageNum);

  const pageSize = Number(urlParams.pageSize);

  const refreshFlag = `${urlParams.refreshFlag}` === 'true';

  const getFilterOptions = (supplierId: number) => {
    getSupplierProductFilterOptions({ supplierId }).then(({ data }) => {
      setFilterOptions(
        (data.data || []).map(option => ({ ...option, id: `${option.id}` })),
      );
    });
  };

  const onSupplierProductEdit = async (productId: number) => {
    const { data } = await getSupplierProductDetails({ id: productId });
    setCurrSupplierProduct(data.data);
    setSupplierProductModalVisible(true);
  };

  const onSupplierProductDelete = async (product: SupplierProduct) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.supplyChain.whetherToRemoveProduction, {
        val1: product.name,
      }),
      onOk: async () => {
        await deleteSupplierProduct({ id: product.id });
        Toast('success', I18N.supplyChain.removalSuccessful);
        setUrlParams({ refreshFlag: !refreshFlag });
        getFilterOptions(id);
      },
    });
  };

  const columns: ColumnsType<SupplierProduct> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 74,
      ellipsis: true,
      fixed: 'left',
      render: (_, record, index) => pageSize * (pageNum - 1) + index + 1,
    },
    {
      title: I18N.carbonFootprint.productName,
      dataIndex: 'name',
      width: 256,
      ellipsis: true,
      fixed: 'left',
      filterSearch: true,
      filteredValue: !isNil(name) ? (name as string).split(',') : undefined,
      filters: filterOptions.map(option => ({
        value: option.id,
        text: option.name,
      })),
    },
    {
      title: I18N.carbonFootprint3.specificationAndModel,
      dataIndex: 'specification',
      width: 256,
      ellipsis: true,
      // filterSearch: true,
      // filteredValue: !isNil(specification)
      //   ? (specification as string).split(',')
      //   : undefined,
      // filters: filterOptions.map(option => ({
      //   value: option.id,
      //   text: option.specification || '-',
      // })),
    },
    {
      title: I18N.carbonFootprint3.accountingUnit,
      dataIndex: 'computationUnit',
      width: 256,
      ellipsis: true,
    },
    {
      title: I18N.supplyChain.singlePriceElement,
      dataIndex: 'unitPrice',
      width: 256,
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
              onClick={() => onSupplierProductEdit(record.id)}
            >
              {I18N.carbonFootprint.edit}
            </Button>,
            'supplier:edit:goods',
          )}
          {checkPermissions(
            <Button
              className={commonStyles.operateBtn}
              type='link'
              danger
              onClick={() => onSupplierProductDelete(record)}
            >
              {I18N.supplyChain.remove}
            </Button>,
            'supplier:deleted:goods',
          )}
        </>
      ),
    },
  ];

  const onSupplierProductModalClose = () => {
    setSupplierProductModalVisible(false);
    setCurrSupplierProduct(null);
  };

  const onSupplierProductModalConfirm = async (formValues: SupplierProduct) => {
    const onUpdateSuccess = (restPage?: number) => {
      onSupplierProductModalClose();
      getFilterOptions(id);
      setUrlParams({
        pageNum: restPage ?? pageNum,
        refreshFlag: !refreshFlag,
      });
    };

    if (currSupplierProduct) {
      await editSupplierProduct(formValues);
      Toast('success', I18N.carbonFootprint.saveSuccessful);
      onUpdateSuccess();
    } else {
      await addSupplierProduct({ ...formValues, supplierId: id });
      Toast('success', I18N.carbonFootprint.newSuccessfullyAdded2);
      onUpdateSuccess(1);
    }
  };

  const onSelectProductModalClose = () => {
    setSelectProductModalVisible(false);
  };

  const onSelectProduct = async (purchaseGoodsIds: number[]) => {
    await selectSupplierProduct({ supplierId: id, purchaseGoodsIds });
    Toast('success', I18N.supplyChain.selectionSuccessful);
    setUrlParams({ pageNum: 1, refreshFlag: !refreshFlag });
    onSelectProductModalClose();
    getFilterOptions(id);
  };

  useImperativeHandle(
    ref,
    () => ({
      addProduct: () => {
        setCurrSupplierProduct(null);
        setSupplierProductModalVisible(true);
      },
      selectProduct: () => {
        setSelectProductModalVisible(true);
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
            I18N.template(I18N.supplyChain.totalTota7, { val1: total }),
        }}
        searchParams={urlParams}
        scroll={{ x: 1200 }}
        fetchApi={() =>
          getSupplierProductList({
            supplierId: id,
            name,
            specification,
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
      <SupplierProductModal
        visible={supplierProductModalVisible}
        supplierProduct={currSupplierProduct}
        onCancel={onSupplierProductModalClose}
        onOk={onSupplierProductModalConfirm}
      />
      <SelectProductModal
        visible={selectProductModalVisible}
        supplierId={id}
        onCancel={onSelectProductModalClose}
        onOk={onSelectProduct}
      />
    </>
  );
};

export default forwardRef(SupplierProductTable);
