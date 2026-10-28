import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Modal, Pagination, Radio, Select, Spin, Table } from 'antd';
import classNames from 'classnames';
import { FC, ReactNode, useEffect, useState } from 'react';

import style from './index.module.less';
import { getSelectAccountList, getSelectAccountProductList } from './service';
import {
  SelectAccountListData,
  SelectAccountListParams,
  SelectAccountProductData,
} from './type';
import TextWidthOverflow from '../../component/TextOverflowTable/byWidth';

type Props = {
  visible: boolean;
  /** 当前核算 id，接口用于排除/标识引用来源 */
  accountId: number;
  onAccountUse: (accountInfo: SelectAccountListData) => void;
  onCancel: () => void;
};

const ACCOUNT_REFERENCE_REFER_FLAG = 2;

const REFERENCE_MODE = {
  MODEL: 1,
  RESULT: 2,
} as const;

const getDefaultSearchParams = (
  accountId: number,
): SelectAccountListParams => ({
  pageNum: 1,
  pageSize: 8,
  referFlag: ACCOUNT_REFERENCE_REFER_FLAG,
  id: accountId,
});

// const accountType = [
//   {
//     name: I18N.carbonFootprint3.whole,
//     value: undefined,
//   },
//   {
//     name: I18N.carbonFootprint3.quickAccounting,
//     value: QUICK as number,
//   },
//   {
//     name: I18N.carbonFootprint3.processAccounting,
//     value: PROCESS as number,
//   },
// ];

const SelectAccount: FC<Props> = ({
  visible,
  accountId,
  onAccountUse,
  onCancel,
}) => {
  /** 查询条件 */
  const [searchParams, serSearchParams] = useState<SelectAccountListParams>(
    () => getDefaultSearchParams(accountId),
  );

  const [loading, setLoading] = useState<boolean>(false);

  /** 右上角产品搜索下拉数据 */
  const [productOptions, setProductOptions] = useState<
    SelectAccountProductData[]
  >([]);
  const [productLoading, setProductLoading] = useState(false);

  /** 核算列表 */
  const [accountList, setAccountList] = useState<SelectAccountListData[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedAccount, setSelectedAccount] =
    useState<SelectAccountListData>();
  const [referWay, setReferWay] = useState<number>(REFERENCE_MODE.MODEL);

  /** 选择的核算类型 */
  // const [activeType, setActiveType] = useState<number>();

  /**
   * @description: 获取核算列表
   */
  const getAccountList = async (params: SelectAccountListParams) => {
    setLoading(true);
    const data = await getSelectAccountList(params);

    setAccountList(data.data.data.rows || []);
    setTotal(data.data.data.total || 0);
    setSelectedAccount(undefined);
    setLoading(false);
  };

  /**
   * @description: 选中产品后按产品筛选核算列表
   */
  const searchAccountByProduct = (productId?: number) => {
    const nextSearchParams = {
      ...searchParams,
      pageNum: 1,
      referFlag: ACCOUNT_REFERENCE_REFER_FLAG,
      id: accountId,
      productId,
    };
    serSearchParams(nextSearchParams);
    getAccountList(nextSearchParams);
  };

  /**
   * 产品名称下拉内容：复用报告选择产品的展示方式，保留规格型号辅助信息。
   */
  const listProductNode = (
    productInfo: SelectAccountProductData,
  ): ReactNode => (
    <div className={style.productOptionNode}>
      <TextWidthOverflow width={160} value={productInfo.productName} />
      {productInfo.specification ? (
        <div className={style.productOptionSpec}>
          {productInfo.specification}
        </div>
      ) : null}
    </div>
  );

  useEffect(() => {
    setSelectedAccount(undefined);
    if (visible) {
      setReferWay(REFERENCE_MODE.MODEL);
      const defaultSearchParams = getDefaultSearchParams(accountId);
      serSearchParams(defaultSearchParams);
      getAccountList(defaultSearchParams);
    }
  }, [visible, accountId]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setProductLoading(true);
    getSelectAccountProductList()
      .then(({ data }) => {
        setProductOptions(data.data.rows || []);
      })
      .finally(() => {
        setProductLoading(false);
      });
  }, [visible]);

  const referWayOptions = [
    {
      value: REFERENCE_MODE.MODEL,
      title: I18N.carbonFootprint3.referenceModel,
      desc: I18N.carbonFootprint3.referenceModelDesc,
    },
    {
      value: REFERENCE_MODE.RESULT,
      title: I18N.carbonFootprint3.referenceResult,
      desc: I18N.carbonFootprint3.referenceResultDesc,
    },
  ];

  const tableColumns = [
    {
      title: I18N.carbonFootprint.productName,
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      render: (productName: string, record: SelectAccountListData) =>
        productName || record.modelName || '-',
    },
    {
      title: I18N.carbonFootprint3.functionalUnits,
      dataIndex: 'accountName',
      key: 'accountName',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.unitEmissions,
      dataIndex: 'factor',
      key: 'factor',
      ellipsis: true,
      render: (factor?: string) => factor || '-',
    },
    {
      title: I18N.carbonFootprint3.accountingResultUnit,
      dataIndex: 'factorUnit',
      key: 'factorUnit',
      ellipsis: true,
      render: (factorUnit?: string) => factorUnit || '-',
    },
  ];

  const handleConfirm = () => {
    if (!selectedAccount) {
      return;
    }
    onAccountUse({
      ...selectedAccount,
      referWay,
    });
  };

  return (
    <Modal
      className={style.selectModelDiv}
      title={null}
      visible={visible}
      width={888}
      style={{ top: 50 }}
      onCancel={onCancel}
      destroyOnClose
      footer={null}
      closable={false}
    >
      <div className={style.selectAccountingModal}>
        <div className={style.modalContent}>
          <div className={style.modalHeader}>
            <div className={style.modalTitle}>
              {I18N.carbonFootprint3.selectAccounting}
            </div>
            <div className={style.headerActions}>
              <Select
                allowClear
                showSearch
                className={style.productSearchSelect}
                loading={productLoading}
                placeholder={I18N.components.search}
                suffixIcon={<SearchOutlined />}
                optionLabelProp='productName'
                filterOption={(input, option) =>
                  String(option?.productName || '').includes(input)
                }
                options={productOptions.map(product => ({
                  label: listProductNode(product),
                  value: product.id,
                  productName: product.productName,
                }))}
                onChange={searchAccountByProduct}
              />
              <CloseOutlined className={style.closeIcon} onClick={onCancel} />
            </div>
          </div>

          <div className={style.referenceModeGroup}>
            {referWayOptions.map(option => (
              <div
                key={option.value}
                className={classNames(style.referenceModeCard, {
                  [style.referenceModeCardActive]: referWay === option.value,
                })}
                onClick={() => setReferWay(option.value)}
              >
                <div className={style.referenceModeTitle}>{option.title}</div>
                <div className={style.referenceModeDesc}>{option.desc}</div>
                {referWay === option.value && (
                  <div className={style.referenceModeCheck}>✓</div>
                )}
              </div>
            ))}
          </div>

          <Spin spinning={loading}>
            <Table<SelectAccountListData>
              className={style.accountingTable}
              rowKey='id'
              columns={tableColumns}
              dataSource={accountList}
              pagination={false}
              rowSelection={{
                type: 'radio',
                columnWidth: 72,
                selectedRowKeys: selectedAccount ? [selectedAccount.id] : [],
                renderCell: checked => <Radio checked={checked} />,
                onSelect: record => setSelectedAccount(record),
              }}
              onRow={record => ({
                onClick: () => setSelectedAccount(record),
              })}
            />
          </Spin>
        </div>

        <div className={style.modalFooter}>
          <div className={style.paginationInfo}>
            <span>{I18N.carbonFootprint3.totalPrefix}</span>
            <span className={style.paginationTotal}>{total}</span>
            <span>{I18N.carbonFootprint3.totalSuffix}</span>
            <Pagination
              size='small'
              current={searchParams.pageNum}
              pageSize={searchParams.pageSize}
              total={total}
              showSizeChanger={false}
              onChange={pageNum => {
                const nextSearchParams = {
                  ...searchParams,
                  pageNum,
                };
                serSearchParams(nextSearchParams);
                getAccountList(nextSearchParams);
              }}
            />
          </div>
          <div className={style.footerActions}>
            <Button className={style.cancelBtn} onClick={onCancel}>
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button
              type='primary'
              className={style.confirmBtn}
              disabled={!selectedAccount}
              onClick={handleConfirm}
            >
              {I18N.carbonFootprint3.confirmSelectAccounting}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SelectAccount;
