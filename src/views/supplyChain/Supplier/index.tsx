import useUrlState from '@ahooksjs/use-url-state';
import { Form } from '@formily/core';
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { RouteMapsSupplyChain2 } from '@src/router/route-paths/supplyChain2';
import { Toast } from '@src/utils/Toast';
import { Button, Tabs } from 'antd';
import classNames from 'classnames';
import { isNil, omit } from 'lodash-es';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { IconAlibabaNew } from '@/components/iconfont';

import ProductEmissionCompare from './components/ProductEmissionCompare';
import SupplierDetails from './components/SupplierDetails';
import SupplierEnterpriseCarbonOverview from './components/SupplierEnterpriseCarbonOverview';
import SupplierProductCarbonOverview from './components/SupplierProductCarbonOverview';
import SupplierProductTable from './components/SupplierProductTable';
import styles from './index.module.less';
import { addSupplier, getRecordList } from './service';
import RecordDrawer from '../components/RecordDrawer';
import { INVITE_STATUS } from '../constant';
import { getSupplierDetails, editSupplier } from '../service';
import { SupplierDetails as SupplierDetailsType } from '../type';

const TAB_KEYS = {
  SUPPLIER_DETAILS: 'SUPPLIER_DETAILS',
  PRODUCT_TABLE: 'PRODUCT_TABLE',
  PRODUCT_CARBON_FOOTPRINT: 'PRODUCT_CARBON_FOOTPRINT',
  ENTERPRISE_CARBON_DATA: 'ENTERPRISE_CARBON_DATA',
};

const {
  SUPPLIER_DETAILS,
  PRODUCT_TABLE,
  PRODUCT_CARBON_FOOTPRINT,
  ENTERPRISE_CARBON_DATA,
} = TAB_KEYS;

const TAB_KEYS_LABEL = {
  [SUPPLIER_DETAILS]: I18N.supplyChain2.supplierInformation,
  [PRODUCT_TABLE]: I18N.carbonFootprint3.purchasingProducts,
  [PRODUCT_CARBON_FOOTPRINT]: I18N.supplyChain2.productCarbonData,
  [ENTERPRISE_CARBON_DATA]: I18N.supplyChain2.enterpriseCarbonData,
};

const Supplier: FC = () => {
  const history = useHistory();

  const [submitBtnLoading, setSubmitBtnLoading] = useState(false);

  const [supplierDetails, setSupplierDetails] = useState<SupplierDetailsType>();

  const [recordList, setRecordList] = useState<Record<string, any>[]>([]);

  const [recordDrawerOpen, setRecordDrawerOpen] = useState(false);

  const [urlParams, setUrlParams] = useUrlState({ tabKey: SUPPLIER_DETAILS });

  const { id } = useParams<{ id: string | undefined }>();

  const supplierFormRef = useRef<Form>(null);

  const productUpdaterRef = useRef<{
    addProduct: () => void;
    selectProduct: () => void;
  }>(null);

  const supplierId = isNil(id) ? undefined : Number(id);

  const isAdd = isNil(supplierId);

  const tabKey = useMemo(() => {
    let currTabKey = (
      [
        SUPPLIER_DETAILS,
        PRODUCT_TABLE,
        PRODUCT_CARBON_FOOTPRINT,
        ENTERPRISE_CARBON_DATA,
      ].includes(urlParams.tabKey)
        ? urlParams.tabKey
        : SUPPLIER_DETAILS
    ) as string;

    if (
      [
        PRODUCT_TABLE,
        PRODUCT_CARBON_FOOTPRINT,
        ENTERPRISE_CARBON_DATA,
      ].includes(currTabKey) &&
      isAdd
    ) {
      currTabKey = SUPPLIER_DETAILS;
    }

    return currTabKey;
  }, [urlParams, isAdd]);

  const canInvite =
    isAdd ||
    (supplierDetails &&
      supplierDetails.inviteStatus !== INVITE_STATUS.COMPLETE);

  const submit = async (opt?: { inviteFlag?: boolean }) => {
    const form = supplierFormRef.current;
    if (!isNil(form)) {
      const formValues = await form.submit<SupplierDetailsType>();

      const supplierValues = {
        ...formValues,
        supplierIdName: omit(formValues.supplierIdName, 'isManualInput'),
        area: formValues.area ? JSON.stringify(formValues.area) : undefined,
      };

      setSubmitBtnLoading(true);

      if (isAdd) {
        try {
          await addSupplier({ ...supplierValues, inviteFlag: opt?.inviteFlag });
          Toast(
            'success',
            opt?.inviteFlag
              ? I18N.supplyChain.invitationSuccessful
              : I18N.carbonFootprint.saveSuccessful,
          );
          history.push({
            pathname: RouteMapsSupplyChain2.supplyChainManagement,
          });
        } finally {
          setSubmitBtnLoading(false);
        }
      } else {
        try {
          await editSupplier({
            ...supplierValues,
            inviteFlag: opt?.inviteFlag,
          });
          Toast(
            'success',
            opt?.inviteFlag
              ? I18N.supplyChain.invitationSuccessful
              : I18N.carbonFootprint.saveSuccessful,
          );
        } finally {
          setSubmitBtnLoading(false);
        }
      }
    }
  };

  const getSupplierData = (params: { supplierId: number }) => {
    getSupplierDetails(params).then(({ data }) => {
      setSupplierDetails({
        ...data.data,
        area:
          typeof data.data.area === 'string'
            ? JSON.parse(data.data.area)
            : undefined,
      });
    });
    getRecordList(params).then(({ data }) => {
      setRecordList(
        (data.data || []).map(record => {
          let type = 'initiate';
          if (record.inviteStatus === INVITE_STATUS.REJECT) {
            type = 'fail';
          } else if (record.inviteStatus === INVITE_STATUS.COMPLETE) {
            type = 'success';
          }
          return {
            type,
            name: record.updateName,
            time: record.updateTime,
            operateDesc: record.inviteDesc,
          };
        }),
      );
    });
  };

  useEffect(() => {
    if (!isNil(supplierId) && tabKey === SUPPLIER_DETAILS) {
      getSupplierData({ supplierId });
    }
  }, [supplierId, tabKey]);

  const isScrollableCarbonTab = [
    PRODUCT_CARBON_FOOTPRINT,
    ENTERPRISE_CARBON_DATA,
  ].includes(tabKey);

  return (
    <div
      className={classNames(styles.supplier, {
        [styles.scrollableTabMode]: isScrollableCarbonTab,
      })}
    >
      <RecordDrawer
        title={I18N.supplyChain.invitationRecord}
        open={recordDrawerOpen}
        recordList={recordList}
        onClose={() => setRecordDrawerOpen(false)}
      />
      <div className={styles.title}>
        {isAdd
          ? I18N.supplyChain2.addNewSuppliers
          : supplierDetails?.supplierIdName?.companyName}
      </div>
      <div className={styles.supplierTab}>
        <Tabs
          className={styles.tab}
          activeKey={tabKey}
          items={[
            { key: SUPPLIER_DETAILS, label: TAB_KEYS_LABEL[SUPPLIER_DETAILS] },
            {
              key: PRODUCT_TABLE,
              label: TAB_KEYS_LABEL[PRODUCT_TABLE],
              disabled: isAdd,
            },
            {
              key: PRODUCT_CARBON_FOOTPRINT,
              label: TAB_KEYS_LABEL[PRODUCT_CARBON_FOOTPRINT],
              disabled: isAdd,
            },
            {
              key: ENTERPRISE_CARBON_DATA,
              label: TAB_KEYS_LABEL[ENTERPRISE_CARBON_DATA],
              disabled: isAdd,
            },
          ]}
          onChange={key => {
            setUrlParams({ tabKey: key });
          }}
        />
        {tabKey === SUPPLIER_DETAILS && !isAdd && (
          <div
            className={styles.opeBtn}
            onClick={() => setRecordDrawerOpen(true)}
          >
            <IconAlibabaNew type='icon-icon-yaoqingjilu' />
            <span>{I18N.supplyChain.invitationRecord}</span>
          </div>
        )}
        {tabKey === PRODUCT_TABLE && (
          <div>
            {/* {checkPermissions(
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => productUpdaterRef.current?.addProduct()}
              >
                {I18N.carbonFootprint3.addProduct}
              </Button>,
              'supplier:add:goods',
            )} */}
            {checkPermissions(
              <div
                className={styles.opeBtn}
                onClick={() => productUpdaterRef.current?.selectProduct()}
              >
                <IconAlibabaNew type='icon-icon-xuanzechanpin' />
                <span>{I18N.carbonFootprint.selectProduct}</span>
              </div>,
              'supplier:choose:goods',
            )}
          </div>
        )}
      </div>
      {tabKey === SUPPLIER_DETAILS && (
        <SupplierDetails
          isAdd={isAdd}
          readPretty={
            !checkPermissions(true, isAdd ? 'supplier:add' : 'supplier:edit')
          }
          supplierDetails={supplierDetails}
          ref={supplierFormRef}
        />
      )}
      {tabKey === PRODUCT_TABLE && !isNil(supplierId) && (
        <SupplierProductTable id={supplierId} ref={productUpdaterRef} />
      )}
      {tabKey === PRODUCT_CARBON_FOOTPRINT && !isNil(supplierId) && (
        <div className={styles.scrollableTabContent}>
          <ProductEmissionCompare supplierId={supplierId} />
          <SupplierProductCarbonOverview supplierId={supplierId} />
        </div>
      )}
      {tabKey === ENTERPRISE_CARBON_DATA && !isNil(supplierId) && (
        <section
          className={classNames(
            styles.scrollableTabContent,
            styles.enterpriseCarbonTabContent,
          )}
        >
          <SupplierEnterpriseCarbonOverview supplierId={supplierId} />
        </section>
      )}
      <div className={styles.footer}>
        <Button
          onClick={() => {
            history.push({
              pathname: RouteMapsSupplyChain2.supplyChainManagement,
            });
          }}
        >
          {I18N.carbonFootprint.return}
        </Button>
        {tabKey === SUPPLIER_DETAILS && (
          <>
            {checkPermissions(
              <Button
                type={canInvite ? 'default' : 'primary'}
                loading={submitBtnLoading}
                onClick={() => submit()}
              >
                {I18N.carbonFootprint.preserve}
              </Button>,
              isAdd ? 'supplier:add' : 'supplier:edit',
            )}
            {canInvite && (
              <Button
                type='primary'
                loading={submitBtnLoading}
                onClick={() => submit({ inviteFlag: true })}
              >
                {isAdd ||
                supplierDetails?.inviteStatus === INVITE_STATUS.NOT_INVITE
                  ? I18N.supplyChain.invite
                  : I18N.supplyChain.reInvite}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Supplier;
