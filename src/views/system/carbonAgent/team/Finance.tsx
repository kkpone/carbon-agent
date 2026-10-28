import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Checkbox,
  Descriptions,
  Drawer,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
  Tabs,
  Result,
  Space,
  message,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

import { InvoiceCompanyInput } from './InvoiceCompanyInput';
import { TeamPayment } from './TeamPayment';
import { teamApi } from './api';
import { errorText } from './errors';
import {
  dateText,
  dateTimeText,
  downloadCsv,
  financePaymentText,
  financeOrderStatus,
  financeInvoiceText,
  financeValidityText,
  canContinueTeamPayment,
  money,
  safeFileUrl,
} from './helpers';
import { teamText } from './i18n';
import style from './team.module.less';
import type { FinanceOrder, Invoice } from './types';
import { PageTitle, QueryState, Status, labels } from './ui';
import { useWorkspace } from './workspace';

export const Finance = () => {
  const { key, refresh } = useWorkspace();
  const [tab, setTab] = useState('orders');
  const [keyword, setKeyword] = useState('');
  const [searchText, setSearchText] = useState('');
  const [invoiceableOnly, setInvoiceableOnly] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState<number>();
  const [pageNum, setPageNum] = useState(1);
  const [selected, setSelected] = useState<FinanceOrder[]>([]);
  const [invoiceStep, setInvoiceStep] = useState<'orders' | 'form' | 'success'>(
    'orders',
  );
  const [invoicePage, setInvoicePage] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [orderNo, setOrderNo] = useState<string>();
  const [paymentOrder, setPaymentOrder] = useState<FinanceOrder>();
  const [invoiceId, setInvoiceId] = useState<string>();
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const resetInvoiceForm = useRef(true);
  const [form] = Form.useForm<{
    invoiceTitle: string;
    taxCode: string;
    email: string;
  }>();
  useEffect(() => {
    // The form mounts only after selecting orders; reset after it is connected.
    if (invoiceOpen && invoiceStep === 'form' && resetInvoiceForm.current) {
      form.resetFields();
      resetInvoiceForm.current = false;
    }
  }, [invoiceOpen, invoiceStep, form]);
  const summary = useQuery([...key, 'summary'], teamApi.summary);
  const invoiceOrders = useQuery(
    [...key, 'invoiceable-orders', invoicePage],
    () =>
      teamApi.orders({
        invoiceableOnly: true,
        pageNum: invoicePage,
        pageSize: 10,
      }),
    { enabled: invoiceOpen && invoiceStep === 'orders' },
  );
  const selectedAmount =
    selected.reduce(
      (sum, row) => sum + Math.round(Number(row.amount) * 100),
      0,
    ) / 100;
  const orders = useQuery(
    [...key, 'orders', keyword, invoiceableOnly, pageNum],
    () => teamApi.orders({ keyword, invoiceableOnly, pageNum, pageSize: 20 }),
    { enabled: tab === 'orders' },
  );
  const invoices = useQuery(
    [...key, 'invoices', keyword, invoiceStatus, pageNum],
    () =>
      teamApi.invoices({
        keyword,
        status: invoiceStatus,
        pageNum,
        pageSize: 20,
      }),
    { enabled: tab === 'invoices' },
  );
  const detail = useQuery(
    [...key, 'order-detail', orderNo],
    () => teamApi.orderDetail(orderNo!),
    { enabled: !!orderNo },
  );
  const invoiceDetail = useQuery(
    [...key, 'invoice-detail', invoiceId],
    () => teamApi.invoiceDetail(invoiceId!),
    { enabled: !!invoiceId },
  );
  const reset = () => {
    setPageNum(1);
    setSelected([]);
  };
  const exportRows = async () => {
    try {
      const rows = await teamApi.ordersExport({ keyword, invoiceableOnly });
      downloadCsv(teamText('companyOrders'), rows, [
        { title: teamText('orderNumber'), value: row => row.orderNo },
        {
          title: teamText('orderedAt'),
          value: row => dateTimeText(row.createTime),
        },
        {
          title: teamText('orderType'),
          value: row => labels[row.action] || row.action,
        },
        {
          title: teamText('subscriptionProduct'),
          value: row => row.productName,
        },
        { title: teamText('quantity'), value: row => row.quantity },
        { title: teamText('orderAmount'), value: row => row.amount },
        { title: teamText('entitlementPeriod'), value: financeValidityText },
        {
          title: teamText('orderStatus'),
          value: row =>
            labels[financeOrderStatus(row)] || financeOrderStatus(row),
        },
        { title: teamText('invoiceStatus'), value: financeInvoiceText },
      ]);
    } catch (failure) {
      message.error(errorText(failure));
    }
  };
  const applyInvoice = async () => {
    if (busy || !confirmed || !selected.length || selected.length > 100) return;
    let values: { invoiceTitle: string; taxCode: string; email: string };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await teamApi.invoice({
        ...values,
        invoiceTitle: values.invoiceTitle.trim(),
        taxCode: values.taxCode.trim(),
        email: values.email.trim(),
        orderNos: selected.map(row => row.orderNo),
      });
      setInvoiceStep('success');
      refresh();
    } catch (failure) {
      setError(errorText(failure));
      setConfirmed(false);
      refresh();
    } finally {
      setBusy(false);
    }
  };
  const renderInvoice = (row?: Invoice) =>
    row && (
      <>
        <Descriptions
          column={1}
          items={[
            {
              key: 'id',
              label: teamText('applicationNumber'),
              children: row.id,
            },
            {
              key: 'title',
              label: teamText('invoiceTitle'),
              children: row.invoiceTitile,
            },
            {
              key: 'type',
              label: teamText('invoiceType'),
              children: teamText('electronicOrdinaryInvoice'),
            },
            { key: 'tax', label: teamText('taxId'), children: row.taxCode },
            {
              key: 'email',
              label: teamText('recipientEmail'),
              children: row.email,
            },
            {
              key: 'amount',
              label: teamText('amount'),
              children: money(row.money),
            },
            {
              key: 'created',
              label: teamText('appliedAt'),
              children: dateTimeText(row.createTime),
            },
            {
              key: 'issued',
              label: teamText('invoicedAt'),
              children: dateTimeText(row.issuedTime),
            },
            {
              key: 'status',
              label: teamText('status'),
              children:
                row.status === 1
                  ? teamText('invoiced')
                  : teamText('invoiceProcessing'),
            },
          ]}
        />
        {safeFileUrl(row.filePath) && (
          <a href={safeFileUrl(row.filePath)} target='_blank' rel='noreferrer'>
            {teamText('viewInvoiceFile')}
          </a>
        )}
      </>
    );
  return (
    <>
      <PageTitle
        title={teamText('orderManagement')}
        description={teamText('viewThisOrganizationSTeamSubscriptionsCompany')}
      />
      <QueryState query={summary}>
        <div className={style.banner}>
          <strong>{teamText('carbonAgentEnterpriseMonthly')}</strong>
          <span>
            {teamText('validUntil')}
            {dateText(summary.data?.validToExclusive, true)}
          </span>
          <Status value={summary.data?.subscriptionStatus} />
        </div>
      </QueryState>
      <Tabs
        activeKey={tab}
        onChange={value => {
          setTab(value);
          setKeyword('');
          setSearchText('');
          setInvoiceStatus(undefined);
          setInvoiceableOnly(false);
          reset();
        }}
        items={[
          { key: 'orders', label: teamText('orders') },
          { key: 'invoices', label: teamText('invoices') },
        ]}
      />
      <div className={style.toolbar}>
        <Input.Search
          allowClear
          placeholder={
            tab === 'orders'
              ? teamText('searchOrderNumberOrProduct')
              : teamText('searchInvoiceApplicationNumber')
          }
          value={searchText}
          onChange={event => setSearchText(event.target.value)}
          onSearch={value => {
            setKeyword(value);
            reset();
          }}
        />
        {tab === 'orders' ? (
          <>
            <Checkbox
              checked={invoiceableOnly}
              onChange={event => {
                setInvoiceableOnly(event.target.checked);
                reset();
              }}
            >
              {teamText('eligibleForInvoicingOnly')}
            </Checkbox>
            <div className={style.toolbarEnd}>
              <Button onClick={exportRows}>{teamText('exportOrders')}</Button>
              <Button
                type='primary'
                onClick={() => {
                  setInvoiceStep('orders');
                  setSelected([]);
                  setInvoicePage(1);
                  setConfirmed(false);
                  resetInvoiceForm.current = true;
                  setInvoiceOpen(true);
                  setError('');
                }}
              >
                {teamText('applyForInvoice')}
              </Button>
            </div>
          </>
        ) : (
          <Select
            allowClear
            placeholder={teamText('allInvoiceStatuses')}
            value={invoiceStatus}
            style={{ width: 140 }}
            onChange={value => {
              setInvoiceStatus(value);
              reset();
            }}
            options={[
              { value: 0, label: teamText('invoiceProcessing') },
              { value: 1, label: teamText('invoiced') },
            ]}
          />
        )}
      </div>
      {tab === 'orders' ? (
        <QueryState query={orders}>
          <Table<FinanceOrder>
            className={style.financeOrders}
            rowKey='orderNo'
            scroll={{ x: 1160 }}
            dataSource={orders.data?.rows}
            pagination={{
              showTotal: total => teamText('valueRecords', { value0: total }),
              current: pageNum,
              pageSize: 20,
              total: orders.data?.total,
              showSizeChanger: false,
              onChange: setPageNum,
            }}
            columns={[
              {
                title: teamText('orderNumber'),
                dataIndex: 'orderNo',
                width: 170,
              },
              {
                title: teamText('orderedAt'),
                dataIndex: 'createTime',
                width: 140,
                render: dateTimeText,
              },
              {
                title: teamText('orderType'),
                dataIndex: 'action',
                width: 76,
                render: value => labels[value] || value,
              },
              {
                title: teamText('subscriptionProduct'),
                dataIndex: 'productName',
                width: 160,
              },
              { title: teamText('quantity'), dataIndex: 'quantity', width: 60 },
              {
                title: teamText('orderAmount'),
                dataIndex: 'amount',
                render: money,
                width: 90,
              },
              {
                title: teamText('entitlementPeriod'),
                width: 174,
                render: (_, row) => (
                  <span style={{ whiteSpace: 'pre-line' }}>
                    {financeValidityText(row)
                      .split(teamText('to'))
                      .join(teamText('to2'))}
                  </span>
                ),
              },
              {
                title: teamText('orderStatus'),
                width: 90,
                render: (_, row) => <Status value={financeOrderStatus(row)} />,
              },
              {
                title: teamText('invoiceStatus'),
                width: 100,
                render: (_, row) => financeInvoiceText(row),
              },
              {
                title: teamText('details'),
                width: 100,
                fixed: 'right',
                render: (_, row) => (
                  <Space direction='vertical' size={0}>
                    <Button type='link' onClick={() => setOrderNo(row.orderNo)}>
                      {teamText('details')}
                    </Button>
                    {canContinueTeamPayment(row) && (
                      <Button type='link' onClick={() => setPaymentOrder(row)}>
                        {teamText('continuePayment')}
                      </Button>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </QueryState>
      ) : (
        <QueryState query={invoices}>
          <Table<Invoice>
            rowKey='id'
            dataSource={invoices.data?.rows}
            scroll={{ x: 1400 }}
            pagination={{
              showTotal: total => teamText('valueRecords', { value0: total }),
              current: pageNum,
              pageSize: 20,
              total: invoices.data?.total,
              onChange: setPageNum,
              showSizeChanger: false,
            }}
            columns={[
              { title: teamText('applicationNumber'), dataIndex: 'id' },
              {
                title: teamText('invoiceType'),
                render: () => teamText('electronicOrdinaryInvoice'),
              },
              { title: teamText('invoiceTitle'), dataIndex: 'invoiceTitile' },
              {
                title: teamText('taxpayerIdentificationNumber'),
                dataIndex: 'taxCode',
              },
              { title: teamText('recipientEmail'), dataIndex: 'email' },
              { title: teamText('amount'), dataIndex: 'money', render: money },
              {
                title: teamText('appliedAt'),
                dataIndex: 'createTime',
                render: dateTimeText,
              },
              {
                title: teamText('invoicedAt'),
                dataIndex: 'issuedTime',
                render: dateTimeText,
              },
              {
                title: teamText('status'),
                dataIndex: 'status',
                render: value =>
                  value === 1
                    ? teamText('invoiced')
                    : teamText('invoiceProcessing'),
              },
              {
                title: teamText('actions'),
                render: (_, row) => (
                  <Button type='link' onClick={() => setInvoiceId(row.id)}>
                    {teamText('details')}
                  </Button>
                ),
              },
            ]}
          />
        </QueryState>
      )}
      {paymentOrder && (
        <TeamPayment
          key={paymentOrder.orderNo}
          orderNo={paymentOrder.orderNo}
          periods={paymentOrder.periods}
          onClose={() => setPaymentOrder(undefined)}
        />
      )}
      <Drawer
        className={style.teamDrawer}
        title={teamText('orderDetails')}
        open={!!orderNo}
        onClose={() => setOrderNo(undefined)}
        width={560}
      >
        <QueryState query={detail}>
          {detail.data && (
            <>
              <Descriptions
                className={style.orderDetails}
                layout='vertical'
                column={2}
                colon={false}
                items={[
                  {
                    key: 'no',
                    label: teamText('orderNumber'),
                    children: detail.data.orderNo,
                  },
                  {
                    key: 'created',
                    label: teamText('orderedAt'),
                    children: dateTimeText(detail.data.createTime),
                  },
                  {
                    key: 'invoice',
                    label: teamText('invoiceStatus'),
                    children: financeInvoiceText(detail.data),
                  },
                  {
                    key: 'period',
                    label: teamText('entitlementPeriod'),
                    children: financeValidityText(detail.data),
                  },
                  {
                    key: 'point',
                    label: teamText('pointsOrderNumber'),
                    children: detail.data.pointOrderNo || '—',
                  },
                  {
                    key: 'type',
                    label: teamText('orderType'),
                    children: labels[detail.data.action] || detail.data.action,
                  },
                  {
                    key: 'product',
                    label: teamText('subscriptionProduct'),
                    children: detail.data.productName,
                  },
                  {
                    key: 'quantity',
                    label: teamText('quantity'),
                    children: detail.data.quantity,
                  },
                  {
                    key: 'amount',
                    label: teamText('orderAmount'),
                    children: money(detail.data.amount),
                  },
                  {
                    key: 'status',
                    label: teamText('paymentStatus'),
                    children: financePaymentText(detail.data.status),
                  },
                  {
                    key: 'entitlement',
                    label: teamText('entitlementStatus'),
                    children: <Status value={detail.data.entitlementStatus} />,
                  },
                  {
                    key: 'pay',
                    label: teamText('paidAt'),
                    children: dateTimeText(detail.data.payTime),
                  },
                  {
                    key: 'validity',
                    label: teamText('pointsValidity'),
                    children: detail.data.pointValidityDays
                      ? teamText('valueDays', {
                          value0: detail.data.pointValidityDays,
                        })
                      : detail.data.pointValidityType ||
                        teamText('bySubscriptionPeriod'),
                  },
                ]}
              />
              <Table
                size='small'
                pagination={false}
                rowKey='startDate'
                dataSource={detail.data.periods || []}
                columns={[
                  { title: teamText('start'), dataIndex: 'startDate' },
                  {
                    title: teamText('validUntil2'),
                    dataIndex: 'endDateExclusive',
                    render: value => dateText(value, true),
                  },
                  { title: teamText('seats'), dataIndex: 'seatQuantity' },
                  {
                    title: teamText('amount'),
                    dataIndex: 'amount',
                    render: money,
                  },
                ]}
              />
            </>
          )}
        </QueryState>
      </Drawer>
      <Drawer
        className={style.teamDrawer}
        title={teamText('invoiceDetails')}
        open={!!invoiceId}
        onClose={() => setInvoiceId(undefined)}
        width={480}
      >
        <QueryState query={invoiceDetail}>
          {renderInvoice(invoiceDetail.data)}
        </QueryState>
      </Drawer>
      <Modal
        centered
        width={
          invoiceStep === 'orders' ? 960 : invoiceStep === 'success' ? 520 : 680
        }
        className={`${style.teamModal} ${style.invoiceModal} ${
          invoiceStep === 'orders' ? style.invoiceOrderModal : ''
        }`}
        title={
          invoiceStep === 'orders'
            ? teamText('selectOrders')
            : invoiceStep === 'form'
            ? teamText('applyForInvoice')
            : teamText('applyForInvoice')
        }
        open={invoiceOpen}
        onCancel={() => {
          if (!busy) setInvoiceOpen(false);
        }}
        maskClosable={!busy}
        closable={!busy}
        footer={
          invoiceStep === 'success' ? (
            <Button type='primary' onClick={() => setInvoiceOpen(false)}>
              {teamText('ok')}
            </Button>
          ) : invoiceStep === 'orders' ? (
            <Space>
              <Button onClick={() => setInvoiceOpen(false)}>
                {teamText('cancel')}
              </Button>
              <Button
                type='primary'
                disabled={
                  !selected.length ||
                  invoiceOrders.isFetching ||
                  invoiceOrders.isError
                }
                onClick={() => {
                  setInvoiceStep('form');
                  setError('');
                  setConfirmed(false);
                }}
              >
                {teamText('confirm')}
              </Button>
            </Space>
          ) : (
            <div className={style.invoiceFooter}>
              <div className={style.invoiceAmount}>
                <span>{teamText('invoiceAmount')}</span>
                <strong>{money(selectedAmount)}</strong>
              </div>
              <div className={style.invoiceActions}>
                <Checkbox
                  checked={confirmed}
                  disabled={busy}
                  onChange={event => setConfirmed(event.target.checked)}
                >
                  {teamText('iHaveCheckedTheInvoiceInformation')}
                </Checkbox>
                <Space>
                  <Button
                    disabled={busy}
                    onClick={() => {
                      setInvoiceStep('orders');
                      setConfirmed(false);
                    }}
                  >
                    {teamText('back')}
                  </Button>
                  <Button
                    type='primary'
                    loading={busy}
                    disabled={!confirmed}
                    onClick={applyInvoice}
                  >
                    {teamText('confirmInvoice')}
                  </Button>
                </Space>
              </div>
            </div>
          )
        }
      >
        {invoiceStep === 'success' ? (
          <Result
            className={style.invoiceSuccess}
            status='success'
            title={teamText('submittedSuccessfully')}
            subTitle={teamText('yourInvoiceApplicationHasBeenSubmittedTrack')}
          />
        ) : invoiceStep === 'orders' ? (
          <QueryState query={invoiceOrders}>
            <Table<FinanceOrder>
              className={style.invoiceOrderTable}
              rowKey='orderNo'
              dataSource={invoiceOrders.data?.rows}
              scroll={{ x: 700 }}
              pagination={false}
              rowSelection={{
                preserveSelectedRowKeys: true,
                columnWidth: 44,
                selectedRowKeys: selected.map(row => row.orderNo),
                getCheckboxProps: row => ({ disabled: !row.canInvoice }),
                onChange: (ids, rows) => {
                  if (ids.length > 100) {
                    message.warning(teamText('selectNoMoreThan100OrdersAt'));
                    return;
                  }
                  const all = new Map(
                    [...selected, ...rows]
                      .filter(Boolean)
                      .map(row => [row.orderNo, row]),
                  );
                  setSelected(
                    ids.map(id => all.get(String(id))!).filter(Boolean),
                  );
                },
              }}
              columns={[
                {
                  title: teamText('orderId'),
                  dataIndex: 'orderNo',
                  width: 210,
                },
                {
                  title: teamText('transactionTime'),
                  dataIndex: 'createTime',
                  render: dateTimeText,
                  width: 210,
                },
                { title: teamText('orderContents'), dataIndex: 'productName' },
                {
                  title: teamText('amount'),
                  dataIndex: 'amount',
                  render: money,
                  width: 120,
                },
              ]}
            />
            <div className={style.invoiceOrderMeta}>
              <span>
                {teamText('selected')}
                <strong>{selected.length}</strong> {teamText('records')}
              </span>
              <Pagination
                current={invoicePage}
                pageSize={10}
                total={invoiceOrders.data?.total}
                onChange={setInvoicePage}
                showSizeChanger={false}
              />
            </div>
          </QueryState>
        ) : (
          <>
            {error && <Alert type='warning' showIcon message={error} />}
            <Table<FinanceOrder>
              className={style.invoiceSummary}
              size='small'
              rowKey='orderNo'
              dataSource={selected}
              pagination={false}
              scroll={{ y: 144 }}
              tableLayout='fixed'
              columns={[
                {
                  title: teamText('orderNumber'),
                  dataIndex: 'orderNo',
                  width: '35%',
                  ellipsis: true,
                },
                {
                  title: teamText('product'),
                  dataIndex: 'productName',
                  ellipsis: true,
                },
                {
                  title: teamText('quantity'),
                  dataIndex: 'quantity',
                  width: 54,
                },
                {
                  title: teamText('amount'),
                  dataIndex: 'amount',
                  render: money,
                  width: 90,
                  align: 'right',
                },
              ]}
            />
            <Form
              className={style.invoiceForm}
              layout='vertical'
              form={form}
              disabled={busy}
              onValuesChange={() => setConfirmed(false)}
            >
              <Form.Item label={teamText('invoiceType')}>
                <div className={style.invoiceReadonly}>
                  {teamText('electronicOrdinaryInvoice')}
                </div>
              </Form.Item>
              <Form.Item label={teamText('titleType')}>
                <div className={style.invoiceReadonly}>
                  {teamText('company')}
                </div>
              </Form.Item>
              <Form.Item
                label={teamText('invoiceTitle')}
                name='invoiceTitle'
                rules={[{ required: true, whitespace: true, max: 200 }]}
              >
                <InvoiceCompanyInput
                  active={invoiceOpen && invoiceStep === 'form'}
                  onCompanySelect={company => {
                    form.setFieldsValue({
                      invoiceTitle: company.companyName,
                      ...(company.creditCode
                        ? { taxCode: company.creditCode }
                        : {}),
                    });
                    setConfirmed(false);
                  }}
                />
              </Form.Item>
              <Form.Item
                label={teamText('taxpayerIdentificationNumber')}
                name='taxCode'
                rules={[
                  {
                    required: true,
                    pattern: /^[A-Za-z0-9]{15,20}$/,
                    message: teamText('enter1520LettersOrDigits'),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                className={style.invoiceWide}
                label={teamText('recipientEmail')}
                name='email'
                rules={[{ required: true, type: 'email' }]}
              >
                <Input
                  placeholder={teamText('forReceivingTheElectronicInvoice')}
                />
              </Form.Item>
              <div className={style.invoiceContent}>
                {teamText('invoiceContents')}
                <span>{teamText('carbonAgentServiceFee')}</span>
              </div>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};
