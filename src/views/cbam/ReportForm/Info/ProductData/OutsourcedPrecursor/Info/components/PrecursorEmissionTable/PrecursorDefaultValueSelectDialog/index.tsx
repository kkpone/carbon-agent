import { Button, Form, Input, Modal, Select, Space, Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import I18N from '@/lang/I18N';
import { getCNList } from '@/views/cbam/ReportForm/service';
import { useParameterProductCategoryList } from '@/views/cbam/hook';

import {
  calculateDefaultEmission,
  DefaultCnSelection,
  DefaultValueYear,
  getYearGrowthRate,
  parseDefaultValue,
  parseGrowthRate,
  SelectedDefaultValue,
} from '../defaultValueTypes';
import style from './index.module.less';

interface SearchValues {
  cnCode?: string;
  cnName?: string;
  productCategoryId?: number;
}

interface PrecursorDefaultValueSelectDialogProps {
  countryName?: string;
  countryValue?: string;
  fixedCnCode?: string;
  open: boolean;
  productCategoryId?: number;
  productCategoryName?: string;
  onCancel: () => void;
  onOk: (
    record: DefaultCnSelection,
    selectedValue: SelectedDefaultValue,
  ) => void;
}

const PAGE_SIZE = 10;
const DEFAULT_VALUE_UNIT = 'tCO2e/t';

const renderDefaultValueTitle = (title: ReactNode) => (
  <div>
    <div>{title}</div>
    <div className={style.defaultValueUnit}>{DEFAULT_VALUE_UNIT}</div>
  </div>
);

const PrecursorDefaultValueSelectDialog: FC<
  PrecursorDefaultValueSelectDialogProps
> = ({
  countryName,
  countryValue,
  fixedCnCode,
  open,
  productCategoryId,
  productCategoryName,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm<SearchValues>();
  const productCategoryList = useParameterProductCategoryList();
  const [dataSource, setDataSource] = useState<DefaultCnSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [searchValues, setSearchValues] = useState<SearchValues>({});
  const [selectedRecord, setSelectedRecord] = useState<DefaultCnSelection>();
  const [selectedYear, setSelectedYear] = useState<DefaultValueYear>();

  const productCategoryOptions = useMemo(() => {
    const categoryMap = new Map<number, string>();
    productCategoryList.forEach(item => {
      if (item.id !== undefined) {
        categoryMap.set(
          item.id,
          item.categoryName || item.defaultNameEn || `产品类别${item.id}`,
        );
      }
    });
    if (
      productCategoryId !== undefined &&
      !categoryMap.has(productCategoryId)
    ) {
      categoryMap.set(
        productCategoryId,
        productCategoryName || `产品类别${productCategoryId}`,
      );
    }
    return Array.from(categoryMap, ([value, label]) => ({ value, label }));
  }, [productCategoryId, productCategoryList, productCategoryName]);

  const clearSelection = () => {
    setSelectedRecord(undefined);
    setSelectedYear(undefined);
  };

  const loadData = useCallback(
    async (current: number, size: number, filters: SearchValues) => {
      if (!open) return;
      setLoading(true);
      try {
        const { data } = await getCNList({
          pageNum: current,
          pageSize: size,
          productCategoryId: filters.productCategoryId,
          countryValue,
          countryFallback: true,
          cnCode: fixedCnCode || filters.cnCode?.trim() || undefined,
          cnName: filters.cnName?.trim() || undefined,
        });
        const pageData = data?.data || {};
        setDataSource((pageData.records || []) as DefaultCnSelection[]);
        setTotal(pageData.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [countryValue, fixedCnCode, open],
  );

  useEffect(() => {
    if (!open) return;
    setPageNum(1);
    setPageSize(PAGE_SIZE);
    const initialFilters: SearchValues = {
      cnCode: fixedCnCode,
      productCategoryId,
    };
    setSearchValues(initialFilters);
    clearSelection();
    form.resetFields();
    form.setFieldsValue(initialFilters);
    loadData(1, PAGE_SIZE, initialFilters);
  }, [fixedCnCode, form, loadData, open, productCategoryId]);

  const yearOptions = useMemo(
    () => [
      { label: I18N.cbam.defaultValue2026, value: '2026' },
      { label: I18N.cbam.defaultValue2027, value: '2027' },
      {
        label: I18N.cbam.defaultValue2028Onwards,
        value: '2028_PLUS',
      },
    ],
    [],
  );

  const renderYearColumn = (value?: string, growthRate?: string) => (
    <div>
      <div>{value || '-'}</div>
      <div className={style.growthRate}>
        {I18N.cbam.growthRate}: {growthRate || '-'}
      </div>
    </div>
  );

  const columns: ColumnsType<DefaultCnSelection> = [
    {
      title: I18N.carbonFootPrintLCA.number,
      width: 70,
      fixed: 'left',
      render: (_value, _record, index) => (pageNum - 1) * pageSize + index + 1,
    },
    {
      title: I18N.cbam.yearSelection,
      width: 180,
      fixed: 'left',
      render: (_value, record) => (
        <Select
          allowClear
          value={selectedRecord?.id === record.id ? selectedYear : undefined}
          options={yearOptions.map(option => ({
            ...option,
            disabled:
              parseDefaultValue(record.directDefaultValue) === undefined ||
              parseDefaultValue(record.indirectDefaultValue) === undefined ||
              parseGrowthRate(
                getYearGrowthRate(record, option.value as DefaultValueYear),
              ) === undefined,
          }))}
          placeholder={I18N.cbam.pleaseSelectYear}
          onChange={(year?: DefaultValueYear) => {
            setSelectedRecord(year ? record : undefined);
            setSelectedYear(year);
          }}
        />
      ),
    },
    {
      title: I18N.cbam.productCnCode,
      dataIndex: 'defaultCode',
      width: 140,
    },
    {
      title: I18N.cbam.description,
      dataIndex: 'defaultName',
      width: 260,
      ellipsis: true,
    },
    {
      title: I18N.cbam.countryOrRegion,
      dataIndex: 'effectiveCountryName',
      width: 160,
      render: (value, record) => value || record.countryName || '-',
    },
    {
      title: I18N.cbam.productCategory,
      dataIndex: 'name',
      width: 160,
      render: (value, record) =>
        value ||
        productCategoryOptions.find(
          option => option.value === record.productCategoryId,
        )?.label ||
        '-',
    },
    {
      title: renderDefaultValueTitle(I18N.cbam.defaultDirectEmission),
      dataIndex: 'directDefaultValue',
      width: 150,
    },
    {
      title: renderDefaultValueTitle(I18N.cbam.defaultIndirectEmission),
      dataIndex: 'indirectDefaultValue',
      width: 150,
    },
    {
      title: renderDefaultValueTitle(I18N.cbam.defaultTotalEmission),
      dataIndex: 'totalDefaultValue',
      width: 150,
    },
    {
      title: renderDefaultValueTitle(I18N.cbam.defaultValue2026),
      dataIndex: 'defaultValue2026',
      width: 170,
      render: (value, record) =>
        renderYearColumn(value, record.defaultValue2026GrowthRate),
    },
    {
      title: renderDefaultValueTitle(I18N.cbam.defaultValue2027),
      dataIndex: 'defaultValue2027',
      width: 170,
      render: (value, record) =>
        renderYearColumn(value, record.defaultValue2027GrowthRate),
    },
    {
      title: renderDefaultValueTitle(I18N.cbam.defaultValue2028Onwards),
      dataIndex: 'defaultValue2028Onwards',
      width: 190,
      render: (value, record) =>
        renderYearColumn(value, record.defaultValue2028OnwardsGrowthRate),
    },
    {
      title: I18N.cbam.productionRoute,
      dataIndex: 'productionRoute',
      width: 260,
      ellipsis: true,
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const nextPageNum = pagination.current || 1;
    const nextPageSize = pagination.pageSize || PAGE_SIZE;
    setPageNum(nextPageNum);
    setPageSize(nextPageSize);
    clearSelection();
    loadData(nextPageNum, nextPageSize, searchValues);
  };

  return (
    <Modal
      centered
      destroyOnClose
      maskClosable={false}
      open={open}
      title={I18N.cbam.selectDefaultValue}
      width='90%'
      onCancel={onCancel}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          {I18N.Factors.cancel}
        </Button>,
        <Button
          key='confirm'
          disabled={!selectedRecord || !selectedYear}
          type='primary'
          onClick={() => {
            if (!selectedRecord || !selectedYear) return;
            const growthRate = getYearGrowthRate(selectedRecord, selectedYear);
            const directEmission = calculateDefaultEmission(
              selectedRecord.directDefaultValue,
              growthRate,
            );
            const indirectEmission = calculateDefaultEmission(
              selectedRecord.indirectDefaultValue,
              growthRate,
            );
            if (
              directEmission !== undefined &&
              indirectEmission !== undefined
            ) {
              onOk(selectedRecord, {
                directEmission,
                indirectEmission,
                year:
                  selectedYear === '2028_PLUS' ? 2028 : Number(selectedYear),
              });
            }
          }}
        >
          {I18N.carbonFootPrintLCA.confirm}
        </Button>,
      ]}
    >
      <Form<SearchValues>
        form={form}
        layout='inline'
        className={style.searchForm}
        onFinish={values => {
          const filters = {
            ...values,
            cnCode: values.cnCode?.trim(),
            cnName: values.cnName?.trim(),
          };
          setSearchValues(filters);
          setPageNum(1);
          clearSelection();
          loadData(1, pageSize, filters);
        }}
      >
        <Form.Item label={I18N.cbam.productCnCode} name='cnCode'>
          <Input
            allowClear={!fixedCnCode}
            disabled={!!fixedCnCode}
            placeholder={I18N.base.pleaseEnter}
          />
        </Form.Item>
        <Form.Item label={I18N.cbam.description} name='cnName'>
          <Input allowClear placeholder={I18N.base.pleaseEnter} />
        </Form.Item>
        <Form.Item label={I18N.cbam.countryOrRegion}>
          <Input disabled value={countryName || '-'} />
        </Form.Item>
        <Form.Item label={I18N.cbam.productCategory} name='productCategoryId'>
          <Select
            showSearch
            optionFilterProp='label'
            options={productCategoryOptions}
            placeholder={I18N.Factors.pleaseSelect}
            style={{ width: 180 }}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button htmlType='submit' type='primary'>
              {I18N.utils.search}
            </Button>
            <Button
              onClick={() => {
                const initialFilters: SearchValues = {
                  cnCode: fixedCnCode,
                  productCategoryId,
                };
                form.resetFields();
                form.setFieldsValue(initialFilters);
                setSearchValues(initialFilters);
                setPageNum(1);
                clearSelection();
                loadData(1, pageSize, initialFilters);
              }}
            >
              {I18N.utils.reset}
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Table<DefaultCnSelection>
        bordered
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey='id'
        rowClassName={record =>
          selectedRecord?.id === record.id ? style.selectedRow : ''
        }
        scroll={{ x: 2200, y: 460 }}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />
    </Modal>
  );
};

export default PrecursorDefaultValueSelectDialog;
