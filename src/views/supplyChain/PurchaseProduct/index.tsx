import useUrlState from '@ahooksjs/use-url-state';
import { Form } from '@formily/core';
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { RouteMapsSupplyChain2 } from '@src/router/route-paths/supplyChain2';
import { Toast } from '@src/utils/Toast';
import { Button, Tabs } from 'antd';
import { isNil, omit } from 'lodash-es';
import { FC, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { IconAlibabaNew } from '@/components/iconfont';

import ProductDetails from './components/ProductDetails';
import ProductSupplierTable from './components/ProductSupplierTable';
import styles from './index.module.less';
import { addPurchaseProduct, editPurchaseProduct } from './service';
import { PurchaseProduct as PurchaseProductDetails } from '../type';

const TAB_KEYS = {
  PRODUCT_DETAILS: 'PRODUCT_DETAILS',
  SUPPLIER_TABLE: 'SUPPLIER_TABLE',
};

const { PRODUCT_DETAILS, SUPPLIER_TABLE } = TAB_KEYS;

const TAB_KEYS_LABEL = {
  [PRODUCT_DETAILS]: I18N.supplyChain2.purchaseProductLetter,
  [SUPPLIER_TABLE]: I18N.supplyChain2.supplierList,
};

const PurchaseProduct: FC = () => {
  const history = useHistory();

  const [submitBtnLoading, setSubmitBtnLoading] = useState(false);

  const [urlParams, setUrlParams] = useUrlState({ tabKey: PRODUCT_DETAILS });

  const { id } = useParams<{ id: string | undefined }>();

  const productFormRef = useRef<Form>(null);

  const supplierUpdaterRef = useRef<{
    addSupplier: () => void;
    selectSupplier: () => void;
  }>(null);

  const purchaseProductId = isNil(id) ? undefined : Number(id);

  const tabKey = (
    [PRODUCT_DETAILS, SUPPLIER_TABLE].includes(urlParams.tabKey)
      ? urlParams.tabKey
      : PRODUCT_DETAILS
  ) as string;

  const isAdd = isNil(purchaseProductId);

  const submit = async () => {
    const form = productFormRef.current;
    if (!isNil(form)) {
      const formValues = await form.submit<
        Omit<PurchaseProductDetails, 'computationUnit'> & {
          computationUnit: string[];
        }
      >();

      const productValues = {
        ...omit(formValues, 'computationUnit'),
        computationUnit: formValues.computationUnit.join(','),
      };

      setSubmitBtnLoading(true);

      if (isAdd) {
        try {
          const resp = await addPurchaseProduct(productValues);
          Toast('success', I18N.carbonFootprint.newSuccessfullyAdded2);
          history.replace({
            pathname:
              RouteMapsSupplyChain2.supplyChainPurchaseProductDetails.replace(
                ':id',
                `${resp.data.data.purchaseGoodsId}`,
              ),
            search: `tabKey=${SUPPLIER_TABLE}`,
          });
        } finally {
          setSubmitBtnLoading(false);
        }
      } else {
        try {
          await editPurchaseProduct(productValues);
          Toast('success', I18N.carbonFootprint.saveSuccessful);
        } finally {
          setSubmitBtnLoading(false);
        }
      }
    }
  };

  return (
    <div className={styles.purchaseProduct}>
      <div className={styles.title}>
        {isAdd
          ? I18N.supplyChain2.newlyAddedProcurementProducts
          : I18N.supplyChain2.productDetailsForProcurement}
      </div>
      <div className={styles.productTab}>
        <Tabs
          className={styles.tab}
          activeKey={tabKey}
          items={[
            { key: PRODUCT_DETAILS, label: TAB_KEYS_LABEL[PRODUCT_DETAILS] },
            {
              key: SUPPLIER_TABLE,
              label: TAB_KEYS_LABEL[SUPPLIER_TABLE],
              disabled: isAdd,
            },
          ]}
          onChange={key => {
            setUrlParams({ tabKey: key });
          }}
        />
        {tabKey === SUPPLIER_TABLE && (
          <div>
            {/* {checkPermissions(
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => supplierUpdaterRef.current?.addSupplier()}
              >
                {I18N.router.invitingSuppliers}
              </Button>,
              'supplier:goods:addSupplier',
            )} */}
            {checkPermissions(
              // <Button
              //   className={styles.selectSupplierBtn}
              //   onClick={() => supplierUpdaterRef.current?.selectSupplier()}
              // >
              //   {I18N.supplyChain.selectSupplier}
              // </Button>,
              <div
                className={styles.opeBtn}
                onClick={() => supplierUpdaterRef.current?.selectSupplier()}
              >
                <IconAlibabaNew type='icon-icon-xuanzegongyingshang' />
                <span>{I18N.supplyChain.selectSupplier}</span>
              </div>,
              'supplier:goods:chooseSupplier',
            )}
          </div>
        )}
      </div>
      {tabKey === PRODUCT_DETAILS && (
        <ProductDetails
          id={purchaseProductId}
          ref={productFormRef}
          readPretty={
            !checkPermissions(
              true,
              isAdd ? 'supplier:goods:add' : 'supplier:goods:edit',
            )
          }
        />
      )}
      {tabKey === SUPPLIER_TABLE && !isAdd && (
        <ProductSupplierTable id={purchaseProductId} ref={supplierUpdaterRef} />
      )}
      <div className={styles.footer}>
        <Button
          onClick={() => {
            history.push({
              pathname: RouteMapsSupplyChain2.supplyChainProduct,
            });
          }}
        >
          {I18N.carbonFootprint.return}
        </Button>
        {tabKey === PRODUCT_DETAILS &&
          checkPermissions(
            <Button type='primary' loading={submitBtnLoading} onClick={submit}>
              {I18N.carbonFootprint.preserve}
            </Button>,
            isAdd ? 'supplier:goods:add' : 'supplier:goods:edit',
          )}
      </div>
    </div>
  );
};

export default PurchaseProduct;
