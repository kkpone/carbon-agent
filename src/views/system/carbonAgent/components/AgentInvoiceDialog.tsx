import I18N from '@src/lang/I18N';
import { Tooltip, message as antdMessage } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';

import style from '../index.module.less';
import {
  createAgentInvoice,
  fetchAgentInvoiceDefault,
  fetchAgentInvoiceOrdersList,
  searchAgentInvoiceCompanies,
  type AgentInvoiceCompany,
  type AgentInvoiceDefault,
  type AgentInvoiceOrder,
  type AgentInvoicePayload,
} from '../service';

type AgentInvoiceDialogProps = {
  onClose: () => void;
  onSubmitted?: () => void;
  open: boolean;
};

type InvoiceStep = 'form' | 'orders' | 'success';
type InvoiceHeadingType = 0 | 1;
type InvoiceKind = 0 | 1;
type PaginationItem = { key: string; type: 'ellipsis' } | number;
type InvoiceFormState = {
  bank: string;
  bankAccount: string;
  content: string;
  email: string;
  invoiceTitile: string;
  phone: string;
  registeredAddress: string;
  registeredPhone: string;
  taxCode: string;
};

const INVOICE_ORDER_PAGE_SIZE = 10;
const INVOICE_FORM_CACHE_KEY = 'WriteInvoice';
const INVOICE_COMPANY_SEARCH_DELAY = 650;
const INVOICE_COMPANY_SEARCH_MIN_LENGTH = 2;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_INVOICE_FORM: InvoiceFormState = {
  bank: '',
  bankAccount: '',
  content: I18N.system.informationAndTechnology,
  email: '',
  invoiceTitile: '',
  phone: '',
  registeredAddress: '',
  registeredPhone: '',
  taxCode: '',
};

type NormalizedInvoiceDefault = {
  companyQueryResultId?: number;
  form: InvoiceFormState;
  invoiceKind: InvoiceKind;
  selectedCompanyName: string;
  type: InvoiceHeadingType;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const getOptionalNumber = (value: unknown) => {
  const parsed = toNumber(value, Number.NaN);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const toDisplayText = (value: unknown, fallback = '--') => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallback;
};

const isPageSuccess = (code?: number) => code === 1 || code === 200;

const getInvoiceOrderId = (order: AgentInvoiceOrder) =>
  toDisplayText(order.orderId, '') ||
  toDisplayText(order.payParams?.orderId, '') ||
  toDisplayText(order.orderNo, '') ||
  toDisplayText(order.id, '');

const getOrderRowKey = (
  order: AgentInvoiceOrder,
  index: number,
  pageNum: number,
) => getInvoiceOrderId(order) || String(`${pageNum}-${index}`);

const getOrderDisplayId = (order: AgentInvoiceOrder) =>
  toDisplayText(order.orderNo, '') || getInvoiceOrderId(order) || '--';

const getOrderContent = (order: AgentInvoiceOrder) =>
  toDisplayText(order.orderContent, '') ||
  toDisplayText(order.orderName, '') ||
  toDisplayText(order.orderInfo, '') ||
  toDisplayText(order.planName, '') ||
  toDisplayText(order.planCode, '') ||
  '--';

const getOrderAmount = (order: AgentInvoiceOrder) =>
  getOptionalNumber(order.realMoney) ??
  getOptionalNumber(order.recieveMoney) ??
  getOptionalNumber(order.totalMoney) ??
  getOptionalNumber(order.amount) ??
  getOptionalNumber(order.payParams?.payMoney) ??
  getOptionalNumber(order.payParams?.amount) ??
  0;

const getOrderTime = (order: AgentInvoiceOrder) =>
  toDisplayText(order.payTime, '') || toDisplayText(order.createTime, '');

const formatMoney = (amount: number, currency = 'CNY') => {
  const formattedAmount = amount.toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return currency.toUpperCase() === 'CNY'
    ? `¥${formattedAmount}`
    : `${currency.toUpperCase()} ${formattedAmount}`;
};

const renderOrderCellText = (value: string) => (
  <Tooltip mouseEnterDelay={0.2} title={value}>
    <span className={style.invoiceOrderCellText}>{value}</span>
  </Tooltip>
);

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sortedItems = [...items]
    .filter(item => item >= 1 && item <= totalPages)
    .sort((prev, next) => prev - next);

  return sortedItems.reduce<PaginationItem[]>((result, item, index) => {
    const previousItem = sortedItems[index - 1];

    if (previousItem && item - previousItem > 1) {
      result.push({
        key: `ellipsis-${previousItem}-${item}`,
        type: 'ellipsis',
      });
    }

    result.push(item);

    return result;
  }, []);
};

const normalizeInvoiceDefault = (
  data: AgentInvoiceDefault,
  email = '',
): NormalizedInvoiceDefault => ({
  companyQueryResultId: data.companyQueryResultId,
  form: {
    ...DEFAULT_INVOICE_FORM,
    bank: toDisplayText(data.bank, ''),
    bankAccount: toDisplayText(data.bankAccount, ''),
    content:
      toDisplayText(data.content, '') || I18N.system.informationAndTechnology,
    email,
    invoiceTitile: toDisplayText(data.invoiceTitle, ''),
    phone: toDisplayText(data.phone, ''),
    registeredAddress: toDisplayText(data.registeredAddress, ''),
    registeredPhone: toDisplayText(data.registeredPhone, ''),
    taxCode: toDisplayText(data.taxCode, ''),
  },
  invoiceKind: data.invoiceType === 1 ? 1 : 0,
  selectedCompanyName: toDisplayText(data.invoiceTitle, ''),
  type: data.type === 1 ? 1 : 0,
});

const readCachedInvoiceForm = () => {
  const cachedValue = localStorage.getItem(INVOICE_FORM_CACHE_KEY);

  if (!cachedValue) {
    return {
      companyQueryResultId: undefined,
      form: DEFAULT_INVOICE_FORM,
      invoiceKind: 0 as InvoiceKind,
      selectedCompanyName: '',
      type: 0 as InvoiceHeadingType,
    };
  }

  try {
    const cachedData = JSON.parse(cachedValue) as Partial<
      AgentInvoicePayload & InvoiceFormState
    >;

    return {
      companyQueryResultId: cachedData.companyQueryResultId,
      form: {
        ...DEFAULT_INVOICE_FORM,
        bank: toDisplayText(cachedData.bank, ''),
        bankAccount: toDisplayText(cachedData.bankAccount, ''),
        content:
          toDisplayText(cachedData.content, '') ||
          I18N.system.informationAndTechnology,
        email: toDisplayText(cachedData.email, ''),
        invoiceTitile: toDisplayText(cachedData.invoiceTitile, ''),
        phone: toDisplayText(cachedData.phone, ''),
        registeredAddress: toDisplayText(cachedData.registeredAddress, ''),
        registeredPhone: toDisplayText(cachedData.registeredPhone, ''),
        taxCode: toDisplayText(cachedData.taxCode, ''),
      },
      invoiceKind: cachedData.invoiceType === 1 ? 1 : (0 as InvoiceKind),
      selectedCompanyName: toDisplayText(cachedData.invoiceTitile, ''),
      type: cachedData.type === 1 ? 1 : (0 as InvoiceHeadingType),
    };
  } catch {
    return {
      companyQueryResultId: undefined,
      form: DEFAULT_INVOICE_FORM,
      invoiceKind: 0 as InvoiceKind,
      selectedCompanyName: '',
      type: 0 as InvoiceHeadingType,
    };
  }
};

const AgentInvoiceDialog = ({
  onClose,
  onSubmitted,
  open,
}: AgentInvoiceDialogProps) => {
  const [step, setStep] = useState<InvoiceStep>('orders');
  const [invoiceOrders, setInvoiceOrders] = useState<AgentInvoiceOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<AgentInvoiceOrder[]>([]);
  const [invoiceType, setInvoiceType] = useState<InvoiceHeadingType>(0);
  const [invoiceKind, setInvoiceKind] = useState<InvoiceKind>(0);
  const [formState, setFormState] =
    useState<InvoiceFormState>(DEFAULT_INVOICE_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof InvoiceFormState, string>>
  >({});
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companyQueryResultId, setCompanyQueryResultId] = useState<number>();
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [companySuggestions, setCompanySuggestions] = useState<
    AgentInvoiceCompany[]
  >([]);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [companySearchError, setCompanySearchError] = useState('');
  const defaultInvoiceRequestRef = useRef<AbortController>();

  const totalPages = Math.max(1, Math.ceil(total / INVOICE_ORDER_PAGE_SIZE));
  const orders = useMemo(() => {
    const startIndex = (pageNum - 1) * INVOICE_ORDER_PAGE_SIZE;

    return invoiceOrders.slice(
      startIndex,
      startIndex + INVOICE_ORDER_PAGE_SIZE,
    );
  }, [invoiceOrders, pageNum]);
  const paginationItems = useMemo(
    () => getPaginationItems(pageNum, totalPages),
    [pageNum, totalPages],
  );
  const selectedKeys = useMemo(
    () =>
      new Set(
        selectedOrders.map((order, index) => getOrderRowKey(order, index, 1)),
      ),
    [selectedOrders],
  );
  const allVisibleSelected =
    orders.length > 0 &&
    orders.every((order, index) =>
      selectedKeys.has(getOrderRowKey(order, index, pageNum)),
    );
  const selectedTotal = selectedOrders.reduce(
    (result, order) => result + getOrderAmount(order),
    0,
  );
  const companySearchKeyword =
    invoiceType === 0 ? formState.invoiceTitile.trim() : '';

  useEffect(() => {
    if (!open) {
      defaultInvoiceRequestRef.current?.abort();
      return;
    }

    const cached = readCachedInvoiceForm();
    const controller = new AbortController();

    defaultInvoiceRequestRef.current?.abort();
    defaultInvoiceRequestRef.current = controller;
    setStep('orders');
    setInvoiceOrders([]);
    setTotal(0);
    setPageNum(1);
    setError('');
    setSelectedOrders([]);
    setInvoiceType(cached.type);
    setInvoiceKind(cached.invoiceKind);
    setFormState(cached.form);
    setCompanyQueryResultId(cached.companyQueryResultId);
    setSelectedCompanyName(cached.selectedCompanyName);
    setCompanySuggestions([]);
    setCompanyDropdownOpen(false);
    setCompanySearchLoading(false);
    setCompanySearchError('');
    setFormErrors({});
    setConfirmChecked(false);
    setSubmitting(false);
    setRetryKey(prevKey => prevKey + 1);

    fetchAgentInvoiceDefault(cached.type, controller.signal)
      .then(response => {
        const responseData = response.data;

        if (
          controller.signal.aborted ||
          !isPageSuccess(responseData.code) ||
          !responseData.data?.available
        ) {
          return;
        }

        const normalizedDefault = normalizeInvoiceDefault(
          responseData.data,
          cached.form.email,
        );

        setInvoiceType(normalizedDefault.type);
        setInvoiceKind(normalizedDefault.invoiceKind);
        setFormState(normalizedDefault.form);
        setCompanyQueryResultId(normalizedDefault.companyQueryResultId);
        setSelectedCompanyName(normalizedDefault.selectedCompanyName);
      })
      .catch(() => {
        // 服务端没有可用默认值时继续使用本地缓存，不阻断开票流程。
      });

    return () => {
      controller.abort();
    };
  }, [open]);

  useEffect(() => {
    if (!open || step !== 'orders') {
      return undefined;
    }

    const controller = new AbortController();

    setLoading(true);
    setError('');

    fetchAgentInvoiceOrdersList(
      {
        page: 1,
        size: 1000,
      },
      controller.signal,
    )
      .then(response => {
        const responseData = response.data;

        if (!isPageSuccess(responseData.code)) {
          throw new Error(
            responseData.msg || I18N.carbonAgent.invoiceableOrderLoadFailed,
          );
        }

        const pageData = responseData.data;
        const rows = pageData?.rows || pageData?.data || pageData?.list;
        const nextRows = Array.isArray(rows) ? rows : [];
        const nextTotal = nextRows.length;

        setInvoiceOrders(nextRows);
        setTotal(nextTotal);
        setPageNum(prevPage =>
          Math.min(
            prevPage,
            Math.max(1, Math.ceil(nextTotal / INVOICE_ORDER_PAGE_SIZE)),
          ),
        );
      })
      .catch(requestError => {
        if (controller.signal.aborted) {
          return;
        }

        setInvoiceOrders([]);
        setTotal(0);
        setError(
          requestError instanceof Error
            ? requestError.message
            : I18N.carbonAgent.invoiceableOrderLoadFailed,
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [open, retryKey, step]);

  useEffect(() => {
    if (
      !open ||
      step !== 'form' ||
      invoiceType !== 0 ||
      companySearchKeyword.length < INVOICE_COMPANY_SEARCH_MIN_LENGTH ||
      companySearchKeyword === selectedCompanyName
    ) {
      setCompanySuggestions([]);
      setCompanyDropdownOpen(false);
      setCompanySearchLoading(false);
      setCompanySearchError('');
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setCompanySearchLoading(true);
      setCompanySearchError('');
      setCompanyDropdownOpen(true);

      searchAgentInvoiceCompanies(companySearchKeyword, controller.signal)
        .then(response => {
          const responseData = response.data;

          if (!isPageSuccess(responseData.code)) {
            throw new Error(
              responseData.msg || I18N.carbonAgent.companySearchFailed,
            );
          }

          const items = responseData.data?.items;

          setCompanySuggestions(
            Array.isArray(items)
              ? items.filter(item => item.companyName && item.resultId)
              : [],
          );
        })
        .catch(requestError => {
          if (controller.signal.aborted) {
            return;
          }

          setCompanySuggestions([]);
          setCompanySearchError(
            requestError instanceof Error
              ? requestError.message
              : I18N.carbonAgent.companySearchFailed,
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setCompanySearchLoading(false);
          }
        });
    }, INVOICE_COMPANY_SEARCH_DELAY);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [companySearchKeyword, invoiceType, open, selectedCompanyName, step]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === pageNum) {
      return;
    }

    setPageNum(nextPage);
  };

  const handleSelectOrder = (order: AgentInvoiceOrder, checked: boolean) => {
    const orderKey = getOrderRowKey(order, 0, 1);

    setSelectedOrders(prevOrders => {
      if (checked) {
        return prevOrders.some(
          (item, index) => getOrderRowKey(item, index, 1) === orderKey,
        )
          ? prevOrders
          : [...prevOrders, order];
      }

      return prevOrders.filter(
        (item, index) => getOrderRowKey(item, index, 1) !== orderKey,
      );
    });
  };

  const handleSelectVisibleOrders = (checked: boolean) => {
    setSelectedOrders(prevOrders => {
      const visibleKeys = new Set(
        orders.map((order, index) => getOrderRowKey(order, index, pageNum)),
      );

      if (!checked) {
        return prevOrders.filter(
          (order, index) => !visibleKeys.has(getOrderRowKey(order, index, 1)),
        );
      }

      const nextOrders = [...prevOrders];
      const nextKeys = new Set(
        nextOrders.map((order, index) => getOrderRowKey(order, index, 1)),
      );

      orders.forEach((order, index) => {
        const key = getOrderRowKey(order, index, pageNum);

        if (!nextKeys.has(key)) {
          nextOrders.push(order);
          nextKeys.add(key);
        }
      });

      return nextOrders;
    });
  };

  const updateFormValue = (name: keyof InvoiceFormState, value: string) => {
    defaultInvoiceRequestRef.current?.abort();
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));

    if (name === 'invoiceTitile') {
      setCompanyQueryResultId(undefined);
      setSelectedCompanyName('');
    }

    setFormErrors(prevErrors => {
      if (!prevErrors[name]) {
        return prevErrors;
      }

      const nextErrors = { ...prevErrors };

      delete nextErrors[name];

      return nextErrors;
    });
  };

  const handleInvoiceHeadingTypeChange = (nextType: InvoiceHeadingType) => {
    if (nextType === invoiceType) {
      return;
    }

    defaultInvoiceRequestRef.current?.abort();
    const controller = new AbortController();

    defaultInvoiceRequestRef.current = controller;
    setInvoiceType(nextType);
    setCompanyQueryResultId(undefined);
    setSelectedCompanyName('');
    setCompanySuggestions([]);
    setCompanyDropdownOpen(false);
    setCompanySearchError('');

    fetchAgentInvoiceDefault(nextType, controller.signal)
      .then(response => {
        const responseData = response.data;

        if (
          controller.signal.aborted ||
          !isPageSuccess(responseData.code) ||
          !responseData.data?.available
        ) {
          return;
        }

        const normalizedDefault = normalizeInvoiceDefault(
          responseData.data,
          formState.email,
        );

        setInvoiceType(normalizedDefault.type);
        setInvoiceKind(normalizedDefault.invoiceKind);
        setFormState(normalizedDefault.form);
        setCompanyQueryResultId(normalizedDefault.companyQueryResultId);
        setSelectedCompanyName(normalizedDefault.selectedCompanyName);
        setFormErrors({});
      })
      .catch(() => {
        // 对应抬头类型没有历史数据时保留用户当前填写内容。
      });
  };

  const handleSelectCompany = (company: AgentInvoiceCompany) => {
    defaultInvoiceRequestRef.current?.abort();
    setFormState(prevState => ({
      ...prevState,
      invoiceTitile: company.companyName,
      taxCode: company.creditCode || prevState.taxCode,
    }));
    setCompanyQueryResultId(company.resultId);
    setSelectedCompanyName(company.companyName.trim());
    setCompanySuggestions([]);
    setCompanyDropdownOpen(false);
    setCompanySearchError('');
    setFormErrors(prevErrors => {
      const nextErrors = { ...prevErrors };

      delete nextErrors.invoiceTitile;

      if (company.creditCode) {
        delete nextErrors.taxCode;
      }

      return nextErrors;
    });
  };

  const validateInvoiceForm = () => {
    const nextErrors: Partial<Record<keyof InvoiceFormState, string>> = {};

    if (!formState.invoiceTitile.trim()) {
      nextErrors.invoiceTitile = I18N.carbonAgent.enterInvoiceTitle;
    }

    if (invoiceType === 0 && !formState.taxCode.trim()) {
      nextErrors.taxCode = I18N.carbonAgent.enterTaxCode;
    }

    if (!formState.phone.trim()) {
      nextErrors.phone = I18N.carbonAgent.enterContactPhone;
    }

    if (!formState.email.trim()) {
      nextErrors.email = I18N.carbonAgent.enterRecipientEmail;
    } else if (!EMAIL_PATTERN.test(formState.email.trim())) {
      nextErrors.email = I18N.carbonAgent.invalidRecipientEmail;
    }

    setFormErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const buildInvoicePayload = (): AgentInvoicePayload => ({
    bank: formState.bank.trim(),
    bankAccount: formState.bankAccount.trim(),
    companyQueryResultId,
    content: formState.content.trim() || I18N.system.informationAndTechnology,
    email: formState.email.trim(),
    invoiceTitile: formState.invoiceTitile.trim(),
    invoiceType: invoiceKind,
    orderList: selectedOrders.map(order => ({
      orderId: getInvoiceOrderId(order),
    })),
    phone: formState.phone.trim(),
    registeredAddress: formState.registeredAddress.trim(),
    registeredPhone: formState.registeredPhone.trim(),
    taxCode: invoiceType === 0 ? formState.taxCode.trim() : '',
    type: invoiceType,
  });

  const handleNextFromOrders = () => {
    if (!selectedOrders.length) {
      antdMessage.warning(I18N.carbonAgent.selectOrderToInvoice);
      return;
    }

    setStep('form');
  };

  const handleSubmitInvoice = async () => {
    if (!validateInvoiceForm()) {
      return;
    }

    if (!confirmChecked) {
      antdMessage.warning(I18N.system.pleaseCheckOkFirst);
      return;
    }

    if (selectedOrders.some(order => !getInvoiceOrderId(order))) {
      antdMessage.error(I18N.carbonAgent.missingInvoiceOrderId);
      return;
    }

    const payload = buildInvoicePayload();

    try {
      setSubmitting(true);
      const response = await createAgentInvoice(payload);

      if (!isPageSuccess(response.data.code)) {
        throw new Error(
          response.data.msg || I18N.carbonAgent.applyInvoiceFailed,
        );
      }

      localStorage.setItem(
        INVOICE_FORM_CACHE_KEY,
        JSON.stringify({
          ...payload,
          email: formState.email.trim(),
        }),
      );
      onSubmitted?.();
      setStep('success');
    } catch (requestError) {
      antdMessage.error(
        requestError instanceof Error
          ? requestError.message
          : I18N.carbonAgent.applyInvoiceFailed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (submitting) {
      return;
    }

    defaultInvoiceRequestRef.current?.abort();
    onClose();
  };

  const renderPagination = (label: string) => (
    <div className={style.invoicePagination} aria-label={label}>
      <button
        className={style.orderPageButton}
        type='button'
        aria-label={I18N.carbonAgent.prevPage}
        disabled={pageNum <= 1}
        onClick={() => handlePageChange(pageNum - 1)}
      >
        ‹
      </button>
      {paginationItems.map(item => {
        if (typeof item !== 'number') {
          return (
            <span className={style.orderPageEllipsis} key={item.key}>
              ...
            </span>
          );
        }

        return (
          <button
            className={classNames(style.orderPageButton, {
              [style.orderPageButtonActive]: item === pageNum,
            })}
            key={item}
            type='button'
            aria-current={item === pageNum ? 'page' : undefined}
            onClick={() => handlePageChange(item)}
          >
            {item}
          </button>
        );
      })}
      <button
        className={style.orderPageButton}
        type='button'
        aria-label={I18N.carbonAgent.nextPage}
        disabled={pageNum >= totalPages}
        onClick={() => handlePageChange(pageNum + 1)}
      >
        ›
      </button>
    </div>
  );

  const renderOrderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5}>
            <div className={style.orderTableState}>
              {I18N.carbonAgent.invoiceableOrderLoading}
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={5}>
            <div className={style.orderTableState}>
              <span>{error}</span>
              <button
                type='button'
                onClick={() => setRetryKey(prevKey => prevKey + 1)}
              >
                {I18N.carbonAgent.retry}
              </button>
            </div>
          </td>
        </tr>
      );
    }

    if (!orders.length) {
      return (
        <tr>
          <td colSpan={5}>
            <div className={style.orderTableState}>
              {I18N.carbonAgent.noInvoiceableOrder}
            </div>
          </td>
        </tr>
      );
    }

    return orders.map((order, index) => {
      const orderKey = getOrderRowKey(order, index, pageNum);
      const orderDisplayId = getOrderDisplayId(order);
      const orderTime = getOrderTime(order) || '--';
      const orderContent = getOrderContent(order);
      const orderAmount = formatMoney(getOrderAmount(order), order.currency);

      return (
        <tr key={orderKey}>
          <td className={style.orderSelectionCell}>
            <input
              className={style.orderCheckbox}
              type='checkbox'
              aria-label={I18N.template(I18N.carbonAgent.selectOrderN, {
                val1: getOrderDisplayId(order),
              })}
              checked={selectedKeys.has(orderKey)}
              onChange={event => handleSelectOrder(order, event.target.checked)}
            />
          </td>
          <td>{renderOrderCellText(orderDisplayId)}</td>
          <td>{renderOrderCellText(orderTime)}</td>
          <td>{renderOrderCellText(orderContent)}</td>
          <td>{renderOrderCellText(orderAmount)}</td>
        </tr>
      );
    });
  };

  const renderOrderCards = () => {
    if (loading) {
      return (
        <div className={style.mobileRecordState} role='status'>
          {I18N.carbonAgent.invoiceableOrderLoading}
        </div>
      );
    }

    if (error) {
      return (
        <div className={style.mobileRecordState}>
          <span>{error}</span>
          <button
            type='button'
            onClick={() => setRetryKey(prevKey => prevKey + 1)}
          >
            {I18N.carbonAgent.retry}
          </button>
        </div>
      );
    }

    if (!orders.length) {
      return (
        <div className={style.mobileRecordState}>
          {I18N.carbonAgent.noInvoiceableOrder}
        </div>
      );
    }

    return orders.map((order, index) => {
      const orderKey = getOrderRowKey(order, index, pageNum);
      const checkboxId = `carbon-agent-invoice-order-card-${pageNum}-${index}`;
      const selected = selectedKeys.has(orderKey);

      return (
        <article
          className={classNames(style.invoiceOrderCard, {
            [style.invoiceOrderCardSelected]: selected,
          })}
          key={orderKey}
        >
          <header className={style.invoiceOrderCardHeader}>
            <label className={style.invoiceOrderCardTitle} htmlFor={checkboxId}>
              <input
                id={checkboxId}
                className={style.orderCheckbox}
                type='checkbox'
                aria-label={I18N.template(I18N.carbonAgent.selectOrderN, {
                  val1: getOrderDisplayId(order),
                })}
                checked={selected}
                onChange={event =>
                  handleSelectOrder(order, event.target.checked)
                }
              />
              <span>
                {I18N.carbonAgent.orderIdColon}
                {getOrderDisplayId(order)}
              </span>
            </label>
            <span
              className={classNames(
                style.orderStatusTag,
                style.orderStatusTagSuccess,
              )}
            >
              {I18N.carbonAgent.orderCompleted}
            </span>
          </header>
          <dl className={style.invoiceOrderCardMeta}>
            <div>
              <dt>{I18N.carbonAgent.transactionTime}</dt>
              <dd>{getOrderTime(order) || '--'}</dd>
            </div>
            <div>
              <dt>{I18N.carbonAgent.orderContentLabel}</dt>
              <dd>{getOrderContent(order)}</dd>
            </div>
            <div>
              <dt>{I18N.carbonAgent.amount}</dt>
              <dd>{formatMoney(getOrderAmount(order), order.currency)}</dd>
            </div>
          </dl>
        </article>
      );
    });
  };

  const renderOrderStep = () => (
    <>
      <div className={style.invoiceOrderTableWrap}>
        <table
          className={classNames(style.orderTable, style.invoiceOrderTable)}
        >
          <thead>
            <tr>
              <th className={style.orderSelectionCell}>
                <input
                  className={style.orderCheckbox}
                  type='checkbox'
                  aria-label={I18N.carbonAgent.selectCurrentPageOrders}
                  checked={allVisibleSelected}
                  disabled={!orders.length || loading}
                  onChange={event =>
                    handleSelectVisibleOrders(event.target.checked)
                  }
                />
              </th>
              <th>{I18N.carbonAgent.orderId}</th>
              <th>{I18N.carbonAgent.transactionTime}</th>
              <th>{I18N.carbonAgent.orderContentLabel}</th>
              <th>{I18N.carbonAgent.amount}</th>
            </tr>
          </thead>
          <tbody>{renderOrderTableRows()}</tbody>
        </table>
      </div>
      <div className={style.invoiceOrderCardList}>{renderOrderCards()}</div>
      <div className={style.invoiceOrderMetaRow}>
        <div className={style.invoiceSelectedCount}>
          <span>{I18N.carbonAgent.selectedPrefix}</span>
          <b>{selectedOrders.length}</b>
          <span>{I18N.carbonAgent.itemsCountSuffix}</span>
        </div>
        {renderPagination(I18N.carbonAgent.invoiceableOrderPagination)}
      </div>
    </>
  );

  const renderField = ({
    disabled = false,
    key,
    label,
    required = false,
    wide = false,
  }: {
    disabled?: boolean;
    key: keyof InvoiceFormState;
    label: string;
    required?: boolean;
    wide?: boolean;
  }) => {
    const fieldId = `carbon-agent-invoice-${key}`;

    return (
      <div
        className={classNames(style.invoiceField, {
          [style.invoiceFieldError]: Boolean(formErrors[key]),
          [style.invoiceFieldWide]: wide,
        })}
        key={key}
      >
        <label htmlFor={fieldId}>
          {required ? <b>*</b> : null}
          {label}
        </label>
        <input
          id={fieldId}
          value={formState[key]}
          disabled={disabled}
          placeholder={I18N.carbonAgent.pleaseEnter}
          onChange={event => updateFormValue(key, event.target.value)}
        />
        {formErrors[key] ? (
          <em className={style.invoiceFieldHint}>{formErrors[key]}</em>
        ) : null}
      </div>
    );
  };

  const renderInvoiceTitleField = (disabled = false) => {
    const fieldId = 'carbon-agent-invoice-invoiceTitile';
    const listboxId = 'carbon-agent-invoice-company-options';
    const showSuggestions =
      invoiceType === 0 &&
      !disabled &&
      companyDropdownOpen &&
      companySearchKeyword.length >= INVOICE_COMPANY_SEARCH_MIN_LENGTH;

    return (
      <div
        className={classNames(style.invoiceField, {
          [style.invoiceFieldError]: Boolean(formErrors.invoiceTitile),
        })}
      >
        <label htmlFor={fieldId}>
          <b>*</b>
          {I18N.system.invoiceHeader}
        </label>
        <div className={style.invoiceCompanyCombobox}>
          <input
            id={fieldId}
            type='text'
            role={invoiceType === 0 ? 'combobox' : undefined}
            aria-autocomplete={invoiceType === 0 ? 'list' : undefined}
            aria-controls={invoiceType === 0 ? listboxId : undefined}
            aria-expanded={invoiceType === 0 ? showSuggestions : undefined}
            autoComplete='off'
            value={formState.invoiceTitile}
            disabled={disabled}
            placeholder={I18N.carbonAgent.pleaseEnter}
            onBlur={() => setCompanyDropdownOpen(false)}
            onChange={event =>
              updateFormValue('invoiceTitile', event.target.value)
            }
            onFocus={() => {
              if (
                companySearchKeyword.length >= INVOICE_COMPANY_SEARCH_MIN_LENGTH
              ) {
                setCompanyDropdownOpen(true);
              }
            }}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                setCompanyDropdownOpen(false);
              }
            }}
          />
          {showSuggestions ? (
            <div
              id={listboxId}
              className={style.invoiceCompanyOptions}
              role='listbox'
            >
              {companySearchLoading ? (
                <div className={style.invoiceCompanyOptionState} role='status'>
                  {I18N.carbonAgent.companySearchLoading}
                </div>
              ) : null}
              {!companySearchLoading && companySearchError ? (
                <div className={style.invoiceCompanyOptionState} role='alert'>
                  {companySearchError}
                </div>
              ) : null}
              {!companySearchLoading &&
              !companySearchError &&
              !companySuggestions.length ? (
                <div className={style.invoiceCompanyOptionState} role='status'>
                  {I18N.carbonAgent.noCompanyMatches}
                </div>
              ) : null}
              {!companySearchLoading && !companySearchError
                ? companySuggestions.map(company => {
                    const secondaryText =
                      company.creditCode ||
                      company.registeredRegion ||
                      company.regStatus;

                    return (
                      <button
                        className={style.invoiceCompanyOption}
                        key={company.resultId}
                        type='button'
                        role='option'
                        aria-selected={false}
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => handleSelectCompany(company)}
                      >
                        <strong>{company.companyName}</strong>
                        {secondaryText ? <span>{secondaryText}</span> : null}
                      </button>
                    );
                  })
                : null}
            </div>
          ) : null}
        </div>
        {formErrors.invoiceTitile ? (
          <em className={style.invoiceFieldHint}>{formErrors.invoiceTitile}</em>
        ) : null}
      </div>
    );
  };

  const renderInvoiceTypeControl = (disabled = false) => (
    <div className={style.invoiceRadioGroup}>
      <label
        className={style.invoiceRadio}
        htmlFor='carbon-agent-invoice-type-enterprise'
      >
        <input
          id='carbon-agent-invoice-type-enterprise'
          type='radio'
          disabled={disabled}
          checked={invoiceType === 0}
          onChange={() => handleInvoiceHeadingTypeChange(0)}
        />
        <span>{I18N.system.enterprise}</span>
      </label>
      <label
        className={style.invoiceRadio}
        htmlFor='carbon-agent-invoice-type-personal'
      >
        <input
          id='carbon-agent-invoice-type-personal'
          type='radio'
          disabled={disabled}
          checked={invoiceType === 1}
          onChange={() => handleInvoiceHeadingTypeChange(1)}
        />
        <span>{I18N.system.personal}</span>
      </label>
    </div>
  );

  const renderFormStep = (disabled = false) => (
    <div className={style.invoiceForm}>
      <div className={style.invoiceFormTop}>
        <section className={style.invoiceFormSection}>
          <h4>{I18N.system.invoiceType}</h4>
          <div className={style.invoiceReadonlyText}>
            {invoiceKind === 1
              ? I18N.system.valueAddedTaxExclusive
              : I18N.system.valueAddedTaxElectronic}
          </div>
        </section>
        <section className={style.invoiceFormSection}>
          <h4>{I18N.system.headingType}</h4>
          {renderInvoiceTypeControl(disabled)}
        </section>
      </div>
      <div className={style.invoiceFormGrid}>
        {renderInvoiceTitleField(disabled)}
        {invoiceType === 0
          ? renderField({
              disabled,
              key: 'taxCode',
              label: I18N.system.taxId,
              required: true,
            })
          : null}
        {renderField({
          disabled: true,
          key: 'content',
          label: I18N.system.invoiceContent,
          wide: true,
        })}
        {renderField({
          disabled,
          key: 'registeredAddress',
          label: I18N.system.companyRegisteredAddress,
        })}
        {renderField({
          disabled,
          key: 'registeredPhone',
          label: I18N.system.registrationPhoneNumber,
        })}
        {renderField({
          disabled,
          key: 'bankAccount',
          label: I18N.system.bankAccountNumber,
        })}
        {renderField({
          disabled,
          key: 'bank',
          label: I18N.system.openingBank,
        })}
        {renderField({
          disabled,
          key: 'phone',
          label: I18N.carbonFootprint.contactPhoneNumber,
          required: true,
        })}
        {renderField({
          disabled,
          key: 'email',
          label: I18N.carbonAgent.recipientEmail,
          required: true,
        })}
      </div>
    </div>
  );
  const getDialogTitle = () => {
    if (step === 'success') {
      return I18N.system.inInvoicing;
    }

    if (step === 'orders') {
      return I18N.system.selectInvoicingBooking;
    }

    return I18N.system.applyForInvoicing;
  };
  const title = getDialogTitle();

  if (!open) {
    return null;
  }

  return (
    <div className={style.invoiceDialogLayer}>
      <button
        className={style.invoiceDialogScrim}
        type='button'
        aria-label={I18N.carbonAgent.closeInvoiceDialog}
        onClick={handleDialogClose}
      />
      <section
        className={classNames(style.invoiceDialog, {
          [style.invoiceOrderDialog]: step === 'orders',
          [style.invoiceFormDialog]: step === 'form',
          [style.invoiceSuccessDialog]: step === 'success',
        })}
        role='dialog'
        aria-modal='true'
        aria-labelledby='carbon-agent-invoice-title'
      >
        <header className={style.invoiceDialogHeader}>
          <div>
            <h3 id='carbon-agent-invoice-title'>{title}</h3>
          </div>
          <button
            className={style.paymentClose}
            type='button'
            aria-label={I18N.carbonAgent.closeInvoiceDialog}
            onClick={handleDialogClose}
          />
        </header>

        <div className={style.invoiceDialogBody}>
          {step === 'orders' ? renderOrderStep() : null}
          {step === 'form' ? renderFormStep() : null}
          {step === 'success' ? (
            <div className={style.invoiceSuccessBody}>
              <div className={style.invoiceSuccessIcon}>✓</div>
              <strong>{I18N.system.submittedSuccessfully}</strong>
              <span>{I18N.system.invoicesWillBeIssuedOn}</span>
            </div>
          ) : null}
        </div>

        {step === 'success' ? (
          <footer
            className={classNames(
              style.invoiceDialogFooter,
              style.invoiceSuccessFooter,
            )}
          >
            <span />
            <button
              className={style.invoicePrimaryButton}
              type='button'
              onClick={handleDialogClose}
            >
              {I18N.carbonFootprint.confirm}
            </button>
          </footer>
        ) : (
          <footer
            className={classNames(style.invoiceDialogFooter, {
              [style.invoiceOrderFooter]: step === 'orders',
              [style.invoiceFormFooter]: step === 'form',
            })}
          >
            {step === 'form' ? (
              <div className={style.invoiceFooterMeta}>
                <span>{I18N.system.invoiceAmount}</span>
                <strong>{formatMoney(selectedTotal)}</strong>
              </div>
            ) : (
              <span />
            )}
            <div className={style.invoiceFooterActions}>
              {step === 'orders' ? (
                <button
                  className={style.invoiceSecondaryButton}
                  type='button'
                  onClick={handleDialogClose}
                >
                  {I18N.carbonAgent.cancel}
                </button>
              ) : null}
              {step === 'orders' ? (
                <button
                  className={style.invoicePrimaryButton}
                  type='button'
                  onClick={handleNextFromOrders}
                >
                  {I18N.carbonAgent.confirm}
                </button>
              ) : null}
              {step === 'form' ? (
                <label
                  className={style.invoiceConfirmCheck}
                  htmlFor='carbon-agent-invoice-confirm-check'
                >
                  <input
                    id='carbon-agent-invoice-confirm-check'
                    type='checkbox'
                    checked={confirmChecked}
                    disabled={submitting}
                    onChange={event => setConfirmChecked(event.target.checked)}
                  />
                  <span>{I18N.system.iHaveInvoicingInformation}</span>
                </label>
              ) : null}
              {step === 'form' ? (
                <button
                  className={style.invoicePrimaryButton}
                  type='button'
                  disabled={submitting}
                  onClick={handleSubmitInvoice}
                >
                  {submitting
                    ? I18N.carbonAgent.submitting
                    : I18N.system.confirmIssuanceAndIssuance}
                </button>
              ) : null}
            </div>
          </footer>
        )}
      </section>
    </div>
  );
};

export default AgentInvoiceDialog;
