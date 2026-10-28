import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { apiCity } from '@src/api/api';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import {
  getAccountShareSupplierIds,
  getModelShareSupplierList,
  postModelShareAdd,
} from '@src/views/carbonFootprint3/FootprintAccount/service';
import { ModelShareSupplier } from '@src/views/carbonFootprint3/FootprintAccount/type';
import {
  AccountShareFlag,
  AccountShareType,
  getModelShareTypeOptions,
} from '@src/views/carbonFootprint3/share';
import { Button, Input, Modal, Radio, Select, Table, Tooltip } from 'antd';
import type { ColumnsType, TableRowSelection } from 'antd/lib/table/interface';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import type { Key } from 'react';

import styles from './index.module.less';
import { ModelShareModalProps, ModelShareSearchParams } from './type';

/** 一次拉取全量供应商，前端过滤 */
const SUPPLIER_LIST_PAGE_SIZE = 9999;
const SUPPLIER_ENABLED_STATUS = 1;
/** 邀请完成，与 chain/supplier/list inviteStatus 一致 */
const SUPPLIER_INVITE_STATUS_COMPLETE = 3;
const TABLE_ROW_HEIGHT = 48;
/** 超过 10 行才出现纵向滚动条 */
const TABLE_SCROLL_MAX_ROWS = 10;

const getSupplierRowId = (record: ModelShareSupplier) =>
  record.supplierId ?? record.id;

const normalizeRowKeys = (keys: Key[]) =>
  keys.map(key => Number(key)).filter(key => !Number.isNaN(key));

const getSupplierRowDisabled = (record: ModelShareSupplier) =>
  Boolean(record.disabled || record.shareDisabled);

const isPreSelectedReadonly = (record: ModelShareSupplier) =>
  Boolean(record.selected || record.shareSelected || record.checked);

const getSupplierDisabledReason = (record: ModelShareSupplier) =>
  record.disableReason ||
  record.shareDisableReason ||
  record.disabledReason ||
  '';

const getSupplierName = (record: ModelShareSupplier) =>
  record.companyName || record.supplierCompanyName || record.supplierName || '';

const getSupplierCode = (record: ModelShareSupplier) =>
  record.companyNumber || record.supplierCompanyNum || '';

const getSupplierRegion = (record: ModelShareSupplier) =>
  record.areaDesc || record.region || '';

const getSupplierContact = (record: ModelShareSupplier) =>
  record.contacts || record.contactName || record.contact || '-';

const normalizeSupplierResp = (resp: any) => {
  const payload = resp?.data?.data || resp?.data || {};
  return {
    rows: (payload.rows || []) as ModelShareSupplier[],
    total: Number(payload.total || 0),
  };
};

const normalizeSupplierIds = (resp: unknown): number[] => {
  const payload = (resp as { data?: { data?: unknown } })?.data?.data ?? [];
  if (!Array.isArray(payload)) return [];
  return payload.map(id => Number(id)).filter(id => !Number.isNaN(id));
};

/** 名称、编码前端模糊匹配 */
const matchSupplierKeyword = (record: ModelShareSupplier, keyword?: string) => {
  const query = keyword?.trim().toLowerCase();
  if (!query) return true;
  return (
    getSupplierName(record).toLowerCase().includes(query) ||
    getSupplierCode(record).toLowerCase().includes(query)
  );
};

/** 地区字段前端模糊匹配 */
const matchSupplierRegion = (
  record: ModelShareSupplier,
  regionKeyword?: string,
) => {
  const query = regionKeyword?.trim().toLowerCase();
  if (!query) return true;
  return getSupplierRegion(record).toLowerCase().includes(query);
};

const mergeSelectedRowKeys = ({
  rows,
  boundSupplierReadonly,
  boundSupplierIds,
  prev,
}: {
  rows: ModelShareSupplier[];
  boundSupplierReadonly: boolean;
  boundSupplierIds: number[];
  prev: Key[];
}) => {
  const preSelectedKeys = rows
    .filter(isPreSelectedReadonly)
    .map(getSupplierRowId);
  const boundKeys = boundSupplierReadonly ? boundSupplierIds : [];
  const userSelected = boundSupplierReadonly
    ? []
    : prev.filter(key =>
        rows.some(
          item =>
            getSupplierRowId(item) === key &&
            !isPreSelectedReadonly(item) &&
            !getSupplierRowDisabled(item),
        ),
      );
  return [...new Set([...preSelectedKeys, ...boundKeys, ...userSelected])];
};

const ModelShareModal = ({
  open,
  account,
  onClose,
  onSuccess,
  onOpenLinkShare,
}: ModelShareModalProps) => {
  const [shareType, setShareType] = useState<number>(
    AccountShareType.ModelOnly,
  );
  const [searchParams, setSearchParams] = useState<ModelShareSearchParams>({});
  /** 输入框草稿值，点击搜索或回车后再写入 searchParams.keyword 触发前端过滤 */
  const [keywordInput, setKeywordInput] = useState('');
  const [allSupplierList, setAllSupplierList] = useState<ModelShareSupplier[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  /** shareFlag=1 且绑定供应商：接口返回的已绑定供应商 id */
  const [boundSupplierIds, setBoundSupplierIds] = useState<number[]>([]);
  /** 已绑定供应商反显后只读，不可切换 */
  const [boundSupplierReadonly, setBoundSupplierReadonly] = useState(false);
  const [regionOptions, setRegionOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const isSingleSelect = shareType === AccountShareType.BindSupplier;
  const isSharedSourceAccount =
    Number(account?.shareFlag) === AccountShareFlag.SharedSource;

  const regionFilterKeyword = useMemo(() => {
    if (!searchParams.regionCode) return undefined;
    return regionOptions.find(item => item.value === searchParams.regionCode)
      ?.label;
  }, [regionOptions, searchParams.regionCode]);

  const filteredSupplierList = useMemo(
    () =>
      allSupplierList.filter(
        record =>
          matchSupplierKeyword(record, searchParams.keyword) &&
          matchSupplierRegion(record, regionFilterKeyword),
      ),
    [allSupplierList, regionFilterKeyword, searchParams.keyword],
  );

  const fetchBoundSupplierIds = async () => {
    if (!account?.id || !isSharedSourceAccount) {
      setBoundSupplierIds([]);
      setBoundSupplierReadonly(false);
      return;
    }

    try {
      const resp = await getAccountShareSupplierIds({ accountId: account.id });
      const ids = normalizeSupplierIds(resp);
      setBoundSupplierIds(ids);
      setBoundSupplierReadonly(ids.length > 0);
      if (ids.length > 0) {
        setSelectedRowKeys(ids);
      }
    } catch {
      setBoundSupplierIds([]);
      setBoundSupplierReadonly(false);
    }
  };

  const tableScroll = useMemo(
    () =>
      filteredSupplierList.length > TABLE_SCROLL_MAX_ROWS
        ? { y: TABLE_ROW_HEIGHT * TABLE_SCROLL_MAX_ROWS }
        : undefined,
    [filteredSupplierList.length],
  );

  const fetchSupplierList = async () => {
    if (!account?.id) return;

    setLoading(true);
    try {
      const resp = await getModelShareSupplierList({
        pageNum: 1,
        pageSize: SUPPLIER_LIST_PAGE_SIZE,
        accountId: account.id,
        status: SUPPLIER_ENABLED_STATUS,
        inviteStatus: SUPPLIER_INVITE_STATUS_COMPLETE,
      });
      const nextData = normalizeSupplierResp(resp);
      setAllSupplierList(nextData.rows);
      setSelectedRowKeys(prev =>
        mergeSelectedRowKeys({
          rows: nextData.rows,
          boundSupplierReadonly,
          boundSupplierIds,
          prev,
        }),
      );
    } catch {
      setAllSupplierList([]);
      setSelectedRowKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setShareType(AccountShareType.ModelOnly);
    setSearchParams({});
    setKeywordInput('');
    setSelectedRowKeys([]);
    setBoundSupplierIds([]);
    setBoundSupplierReadonly(false);
    setAllSupplierList([]);
  }, [open, account?.id]);

  useEffect(() => {
    if (!open) return;
    apiCity(1).then(tree => {
      setRegionOptions(
        (tree || []).map(item => ({
          label: item.name,
          value: item.code,
        })),
      );
    });
  }, [open]);

  useEffect(() => {
    if (!open || !account?.id) return;
    if (shareType !== AccountShareType.BindSupplier) {
      setBoundSupplierIds([]);
      setBoundSupplierReadonly(false);
      return;
    }
    fetchBoundSupplierIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, account?.id, account?.shareFlag, shareType]);

  useEffect(() => {
    if (!open || !account?.id) return;
    fetchSupplierList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, account?.id]);

  useEffect(() => {
    if (!allSupplierList.length) return;
    setSelectedRowKeys(prev =>
      mergeSelectedRowKeys({
        rows: allSupplierList,
        boundSupplierReadonly,
        boundSupplierIds,
        prev,
      }),
    );
  }, [allSupplierList, boundSupplierIds, boundSupplierReadonly]);

  const handleSearch = () => {
    setSearchParams(prev => ({
      ...prev,
      keyword: keywordInput.trim() || undefined,
    }));
  };

  const columns: ColumnsType<ModelShareSupplier> = useMemo(
    () => [
      {
        title: I18N.carbonFootprint3.supplierName,
        dataIndex: 'companyName',
        width: 280,
        ellipsis: true,
        render: (_, record) => getSupplierName(record) || '-',
      },
      {
        title: I18N.carbonFootprint3.modelShareSupplierCode,
        dataIndex: 'companyNumber',
        width: 220,
        ellipsis: true,
        render: (_, record) => getSupplierCode(record) || '-',
      },
      {
        title: I18N.carbonFootprint3.modelShareRegion,
        dataIndex: 'areaDesc',
        width: 140,
        ellipsis: true,
        render: (_, record) => getSupplierRegion(record) || '-',
      },
      {
        title: I18N.carbonFootprint3.modelShareContact,
        dataIndex: 'contacts',
        width: 100,
        ellipsis: true,
        render: (_, record) => getSupplierContact(record),
      },
    ],
    [],
  );

  const rowSelection = useMemo<TableRowSelection<ModelShareSupplier>>(
    () => ({
      type: 'checkbox',
      selectedRowKeys,
      columnWidth: 56,
      hideSelectAll: isSingleSelect,
      preserveSelectedRowKeys: boundSupplierReadonly,
      getCheckboxProps: record => ({
        disabled:
          boundSupplierReadonly ||
          getSupplierRowDisabled(record) ||
          isPreSelectedReadonly(record),
      }),
      onChange: nextKeys => {
        if (boundSupplierReadonly) return;

        const readonlyKeys = allSupplierList
          .filter(isPreSelectedReadonly)
          .map(getSupplierRowId);
        const userKeys = normalizeRowKeys(nextKeys).filter(
          key => !readonlyKeys.includes(key),
        );

        if (isSingleSelect) {
          const latestKey = userKeys[userKeys.length - 1];
          setSelectedRowKeys(
            latestKey !== undefined
              ? [...readonlyKeys, latestKey]
              : readonlyKeys,
          );
          return;
        }

        setSelectedRowKeys([...new Set([...readonlyKeys, ...userKeys])]);
      },
      renderCell: (checked, record, index, originNode) => {
        const reason = getSupplierDisabledReason(record);
        if (!getSupplierRowDisabled(record) || !reason) return originNode;

        return (
          <Tooltip title={reason}>
            <span className={styles.disabledReason}>{originNode}</span>
          </Tooltip>
        );
      },
    }),
    [allSupplierList, boundSupplierReadonly, isSingleSelect, selectedRowKeys],
  );

  const changeShareType = (nextShareType: number) => {
    setShareType(nextShareType);
    setSelectedRowKeys([]);
    setBoundSupplierIds([]);
    setBoundSupplierReadonly(false);
  };

  const getSubmitSupplierIds = () => {
    if (boundSupplierReadonly && boundSupplierIds.length > 0) {
      return boundSupplierIds;
    }
    return selectedRowKeys.map(Number).filter(id => {
      const record = allSupplierList.find(
        item => getSupplierRowId(item) === id,
      );
      return record && !isPreSelectedReadonly(record);
    });
  };

  const confirmShare = async () => {
    if (!account?.id) return;

    const supplierIds = getSubmitSupplierIds();
    if (supplierIds.length === 0) {
      Toast('warn', I18N.carbonFootprint3.pleaseSelectSupplier);
      return;
    }
    if (isSingleSelect && supplierIds.length !== 1) {
      Toast('warn', I18N.carbonFootprint3.bindSupplierOnlyOne);
      return;
    }

    setSubmitLoading(true);
    try {
      await postModelShareAdd({
        accountId: account.id,
        shareType,
        supplierIds,
      });
      Toast('success', I18N.carbonFootprint3.modelShareSuccess);
      onSuccess();
      onClose();
    } finally {
      setSubmitLoading(false);
    }
  };

  const openLinkShare = () => {
    if (!account) return;
    onClose();
    onOpenLinkShare(account);
  };

  return (
    <Modal
      className={styles.modelShareModal}
      open={open}
      width={920}
      footer={null}
      title={null}
      closable={false}
      destroyOnClose
      centered
      onCancel={onClose}
    >
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.title} title={account?.accountName}>
            {I18N.template(I18N.carbonFootprint3.modelShareWithAccount, {
              val1: account?.accountName || '-',
            })}
          </div>
          <CloseOutlined className={styles.closeBtn} onClick={onClose} />
        </div>

        <div className={styles.body}>
          <div className={styles.toolbar}>
            <Radio.Group
              className={styles.shareTypeGroup}
              value={shareType}
              onChange={event => changeShareType(event.target.value)}
            >
              {getModelShareTypeOptions().map(option => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>

            <div className={styles.filters}>
              <Input
                className={styles.keywordInput}
                allowClear
                maxLength={100}
                suffix={
                  <SearchOutlined
                    className={styles.searchIcon}
                    onClick={handleSearch}
                  />
                }
                placeholder={I18N.carbonFootprint3.supplierNameOrCode}
                value={keywordInput}
                onChange={event => {
                  setKeywordInput(event.target.value);
                }}
                onPressEnter={handleSearch}
              />
              <Select
                className={styles.regionSelect}
                allowClear
                showSearch
                optionFilterProp='label'
                placeholder={I18N.carbonFootprint3.modelShareRegion}
                options={regionOptions}
                value={searchParams.regionCode}
                onChange={regionCode => {
                  setSearchParams(prev => ({
                    ...prev,
                    regionCode: regionCode || undefined,
                  }));
                }}
              />
              <Button className={styles.linkCollectBtn} onClick={openLinkShare}>
                {I18N.carbonFootprint3.linkCollection}
              </Button>
            </div>
          </div>

          <div
            className={classNames(styles.tableWrap, {
              [styles.tableWrapScrollable]:
                filteredSupplierList.length > TABLE_SCROLL_MAX_ROWS,
            })}
          >
            <Table<ModelShareSupplier>
              rowKey={getSupplierRowId}
              columns={columns}
              dataSource={filteredSupplierList}
              loading={loading}
              pagination={false}
              tableLayout='fixed'
              locale={{ emptyText: I18N.carbonFootprint3.noData }}
              rowSelection={rowSelection}
              rowClassName={record =>
                classNames({
                  disabledRow: getSupplierRowDisabled(record),
                })
              }
              scroll={tableScroll}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span className={styles.total}>
              {I18N.carbonFootprint3.totalPrefix}{' '}
              <span className={styles.totalNum}>
                {filteredSupplierList.length}
              </span>{' '}
              {I18N.carbonFootprint3.totalSuffix}
            </span>
          </div>
          <div className={styles.footerRight}>
            <Button className={styles.cancelBtn} onClick={onClose}>
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button
              className={styles.confirmBtn}
              loading={submitLoading}
              disabled={boundSupplierReadonly}
              onClick={confirmShare}
            >
              {I18N.carbonFootprint3.confirmShare}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModelShareModal;
