import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  Button,
  Segmented,
  Select,
  Table,
  TableColumnType,
  Input,
  Switch,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import { debounce, isNil } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useTableScrollHeight } from '@/hooks/useTableScrollHeight';
import { Toast } from '@/utils';

import FormulaDrawer from './FormulaDrawer';
import ParamDrawer from './ParamDrawer';
import {
  EMISSION_TYPE,
  EMISSION_TYPE_LABEL,
  ENABLE_STATUS,
  ENABLE_STATUS_LABEL,
  NEED_DEFAULT,
  PARAM_TYPE,
  PARAM_TYPE_LABEL,
  REF_TYPE_LABEL,
  SYSTEM_TYPE,
  SYSTEM_TYPE_LABEL,
  USER_SIDE_DISPLAY,
} from './constant';
import { buildFormulaHoverDetail } from './formulaHoverFormat';
import styles from './index.module.less';
import {
  addFormula,
  addParam,
  editFormula,
  editParam,
  getFormulaList,
  getParamList,
  toggleFormulaStatus,
  toggleParamStatus,
} from './service';

type SearchParams = {
  tab: 'formula' | 'params';
  pageNum: number;
  pageSize: number;
  [P: string]: any;
};

/** 与 calculationColumns 各列 width 之和一致（勿用 scroll.x=max-content，否则列宽被长文案撑破、单行省略失效） */
const FORMULA_TABLE_SCROLL_MIN_X = 68 + 240 + 180 + 120 + 120 + 120 + 180;

/** 与 paramsColumns 各列 width 之和一致 */
const PARAMS_TABLE_SCROLL_MIN_X =
  68 + 160 + 120 + 120 + 120 + 100 + 100 + 186 + 100 + 186;

const FormulaSetting = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    tab: 'formula',
    pageNum: 1,
    pageSize: 10,
  });

  const [tableData, setTableData] = useState<Record<string, any>[]>([]);

  const [total, setTotal] = useState(0);

  const [tableLoading, setTableLoading] = useState(false);

  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const tableScrollHeight = useTableScrollHeight({
    containerRef: tableWrapperRef,
    deps: [],
  });

  const tableScrollX = useMemo(
    () =>
      searchParams.tab === 'formula'
        ? FORMULA_TABLE_SCROLL_MIN_X
        : PARAMS_TABLE_SCROLL_MIN_X,
    [searchParams.tab],
  );

  const [formulaDrawerProps, setFormulaDrawerProps] = useState<{
    open: boolean;
    id?: number;
    isCopy?: boolean;
    readPretty?: boolean;
  }>({
    open: false,
  });

  const [paramDrawerProps, setParamDrawerProps] = useState<{
    open: boolean;
    id?: number;
    isCopy?: boolean;
    readPretty?: boolean;
  }>({
    open: false,
  });

  const getTableData = async (params: SearchParams) => {
    setTableLoading(true);
    try {
      const { tab, ...restParams } = params;
      const listApi = tab === 'formula' ? getFormulaList : getParamList;

      const { data } = await listApi(restParams);
      setTableData(data.rows);
      setTotal(data.total);
    } finally {
      setTableLoading(false);
    }
  };

  const onNameChange = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
          pageNum: 1,
        });
      }, 300),
    [searchParams],
  );

  const onParamConfirm = async (data: Record<string, any>) => {
    const isAdd = isNil(data.id);
    const postApi = isAdd ? addParam : editParam;

    const payload = { ...data };
    if (payload.hasValue !== NEED_DEFAULT.NEED) {
      payload.show = USER_SIDE_DISPLAY.SHOW;
    }

    await postApi(payload);
    setParamDrawerProps({ ...paramDrawerProps, open: false });
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    setSearchParams({
      ...searchParams,
      pageNum: isAdd ? 1 : searchParams.pageNum,
    });
  };

  const onFormulaConfirm = async (data: Record<string, any>) => {
    const isAdd = isNil(data.id);
    const postApi = isAdd ? addFormula : editFormula;

    await postApi(data);
    setFormulaDrawerProps({ ...formulaDrawerProps, open: false });
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    setSearchParams({
      ...searchParams,
      pageNum: isAdd ? 1 : searchParams.pageNum,
    });
  };

  const onParamStatusChange = async (id: number) => {
    await toggleParamStatus(id);
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    setSearchParams({
      ...searchParams,
    });
  };

  const onFormulaStatusChange = async (id: number) => {
    await toggleFormulaStatus(id);
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    setSearchParams({
      ...searchParams,
    });
  };

  const calculationColumns: TableColumnType<Record<string, any>>[] = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 68,
      fixed: 'left',
      render: (_, record, index) =>
        (searchParams.pageNum - 1) * searchParams.pageSize + index + 1,
    },
    {
      title: I18N.enterpriseCarbonAccount2.calculationMethodName,
      dataIndex: 'name',
      width: 240,
      ellipsis: { showTitle: false },
      fixed: 'left',
      render: (_: unknown, record: Record<string, any>) => {
        const detail = buildFormulaHoverDetail(
          record.formula,
          record.paramItem,
        );
        return (
          <Tooltip
            placement='topLeft'
            rootClassName={styles.calculationMethodTooltipOverlay}
            getPopupContainer={() => document.body}
            title={
              <div className={styles.calculationMethodTooltipContent}>
                <div className={styles.calculationMethodTooltipRow}>
                  <div className={styles.calculationMethodTooltipLabel}>
                    {
                      I18N.enterpriseCarbonAccount2
                        .calculationMethodTooltipNameLabel
                    }
                  </div>
                  <div className={styles.calculationMethodTooltipValue}>
                    {record.name}
                  </div>
                </div>
                <div className={styles.calculationMethodTooltipRow}>
                  <div className={styles.calculationMethodTooltipLabel}>
                    {
                      I18N.enterpriseCarbonAccount2
                        .calculationMethodTooltipFormulaLabel
                    }
                  </div>
                  <div className={styles.calculationMethodTooltipValue}>
                    {detail || '—'}
                  </div>
                </div>
              </div>
            }
          >
            <div className={styles.calculationMethodNameWrap}>
              <span className={styles.calculationMethodNameCell}>
                {record.name}
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: I18N.carbonFootprint.emissionType,
      dataIndex: 'emissionType',
      width: 180,
      ellipsis: true,
      render: (emissionType: number) => EMISSION_TYPE_LABEL[emissionType],
    },
    {
      title: I18N.carbonFootprint3.dataType,
      dataIndex: 'source',
      width: 120,
      ellipsis: true,
      render: (source: number) => SYSTEM_TYPE_LABEL[source],
    },
    {
      title: I18N.enterpriseCarbonAccount2.whetherToCite,
      dataIndex: 'used',
      width: 120,
      render: (isReference: number) => REF_TYPE_LABEL[isReference],
    },
    {
      title: I18N.supplyChain.isItEnabled,
      dataIndex: 'status',
      width: 120,
      render: (status: number, record) => (
        <Switch
          size='small'
          checked={!!status}
          onChange={() => onFormulaStatusChange(record.id)}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.operateColumn}>
          <Button
            type='link'
            onClick={() => {
              setFormulaDrawerProps({
                open: true,
                id: record.id,
                readPretty: record.source === SYSTEM_TYPE.SYSTEM,
              });
            }}
          >
            {record.source === SYSTEM_TYPE.SYSTEM
              ? I18N.carbonFootprint3.details
              : I18N.carbonFootprint.edit}
          </Button>
          <Button
            type='link'
            onClick={() => {
              setFormulaDrawerProps({
                open: true,
                id: record.id,
                isCopy: true,
              });
            }}
          >
            {I18N.carbonFootprint.copy}
          </Button>
        </div>
      ),
    },
  ];

  const paramsColumns: TableColumnType<Record<string, any>>[] = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 68,
      fixed: 'left',
      render: (_, record, index) =>
        (searchParams.pageNum - 1) * searchParams.pageSize + index + 1,
    },
    {
      title: I18N.emission.parameterName,
      dataIndex: 'name',
      width: 160,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: I18N.enterpriseCarbonAccount2.parameterType,
      dataIndex: 'paramType',
      width: 120,
      ellipsis: true,
      render: (paramType: number) => PARAM_TYPE_LABEL[paramType],
    },
    {
      title: I18N.carbonFootprint.emissionType,
      dataIndex: 'emissionType',
      width: 120,
      ellipsis: true,
      render: (emissionType: number) => EMISSION_TYPE_LABEL[emissionType],
    },
    {
      title: I18N.carbonFootprint3.dataType,
      dataIndex: 'source',
      width: 120,
      ellipsis: true,
      render: (source: number) => SYSTEM_TYPE_LABEL[source],
    },
    {
      title: I18N.enterpriseCarbonAccount2.defaultValue,
      dataIndex: 'defaultValue',
      width: 100,
      ellipsis: true,
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.unit,
      dataIndex: 'unitName',
      width: 100,
      ellipsis: true,
      render: (unitName, record) =>
        record.paramType === PARAM_TYPE.PERCENT ? '%' : unitName || '-',
    },
    {
      title: I18N.carbonFootprint.describe,
      dataIndex: 'description',
      width: 186,
      ellipsis: true,
      render: text => text || '-',
    },
    {
      title: I18N.supplyChain.isItEnabled,
      dataIndex: 'status',
      width: 100,
      render: (status: number, record) => (
        <Switch
          size='small'
          checked={!!status}
          onChange={() => {
            onParamStatusChange(record.id);
          }}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 186,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.operateColumn}>
          <Button
            type='link'
            onClick={() => {
              setParamDrawerProps({
                open: true,
                id: record.id,
                readPretty: record.source === SYSTEM_TYPE.SYSTEM,
              });
            }}
          >
            {record.source === SYSTEM_TYPE.SYSTEM
              ? I18N.carbonFootprint3.details
              : I18N.carbonFootprint.edit}
          </Button>
          <Button
            type='link'
            onClick={() => {
              setParamDrawerProps({ open: true, id: record.id, isCopy: true });
            }}
          >
            {I18N.carbonFootprint.copy}
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    getTableData(searchParams);
  }, [searchParams]);

  return (
    <div className={styles.formulaSetting}>
      <FormulaDrawer
        {...formulaDrawerProps}
        onClose={() =>
          setFormulaDrawerProps({ ...formulaDrawerProps, open: false })
        }
        onConfirm={onFormulaConfirm}
      />
      <ParamDrawer
        {...paramDrawerProps}
        onClose={() =>
          setParamDrawerProps({ ...paramDrawerProps, open: false })
        }
        onConfirm={onParamConfirm}
      />
      <div className={styles.title}>
        {I18N.enterpriseCarbonAccount2.calculationMethodConfiguration}
      </div>

      <div className={styles.searchRow}>
        <Segmented
          value={searchParams.tab}
          onChange={value =>
            setSearchParams({
              pageNum: 1,
              pageSize: searchParams.pageSize,
              tab: value as 'formula' | 'params',
            })
          }
          options={[
            {
              label: (
                <div
                  className={classNames({
                    [styles.activeTab]: searchParams.tab === 'formula',
                  })}
                >
                  {I18N.eca.computingMethod}
                </div>
              ),
              value: 'formula',
            },
            {
              label: (
                <div
                  className={classNames({
                    [styles.activeTab]: searchParams.tab === 'params',
                  })}
                >
                  {I18N.enterpriseCarbonAccount2.parameterConfiguration}
                </div>
              ),
              value: 'params',
            },
          ]}
        />
        <div className={styles.searchRowRight}>
          {searchParams.tab === 'formula' ? (
            <>
              <Input
                className={styles.searchInput}
                placeholder={
                  I18N.enterpriseCarbonAccount2.calculationMethodName
                }
                suffix={<SearchOutlined className={styles.searchIcon} />}
                onChange={e => onNameChange(e.target.value)}
              />
              <Select
                className={styles.select}
                value={searchParams.emissionType}
                allowClear
                placeholder={I18N.carbonFootprint.emissionType}
                options={Object.values(EMISSION_TYPE).map(type => ({
                  value: type,
                  label: EMISSION_TYPE_LABEL[type],
                }))}
                onChange={emissionType =>
                  setSearchParams({
                    ...searchParams,
                    emissionType,
                    pageNum: 1,
                  })
                }
              />
              <Button
                icon={<PlusCircleOutlined />}
                type='primary'
                onClick={() => {
                  setFormulaDrawerProps({ open: true });
                }}
              >
                {I18N.enterpriseCarbonAccount2.addCalculationMethod}
              </Button>
            </>
          ) : (
            <>
              <Input
                className={styles.searchInput}
                placeholder={I18N.emission.parameterName}
                suffix={<SearchOutlined className={styles.searchIcon} />}
                onChange={e => onNameChange(e.target.value)}
              />
              <Select
                className={styles.select}
                value={searchParams.paramType}
                allowClear
                placeholder={I18N.enterpriseCarbonAccount2.parameterType}
                options={Object.values(PARAM_TYPE).map(paramType => ({
                  value: paramType,
                  label: PARAM_TYPE_LABEL[paramType],
                }))}
                onChange={paramType =>
                  setSearchParams({
                    ...searchParams,
                    paramType,
                    pageNum: 1,
                  })
                }
              />
              <Select
                className={styles.select}
                value={searchParams.emissionType}
                allowClear
                placeholder={I18N.carbonFootprint.emissionType}
                options={Object.values(EMISSION_TYPE).map(type => ({
                  value: type,
                  label: EMISSION_TYPE_LABEL[type],
                }))}
                onChange={emissionType =>
                  setSearchParams({
                    ...searchParams,
                    emissionType,
                    pageNum: 1,
                  })
                }
              />
              <Select
                className={styles.statusSelect}
                allowClear
                value={searchParams.status}
                placeholder={I18N.carbonFootprint.state}
                options={Object.values(ENABLE_STATUS).map(enableStatus => ({
                  value: enableStatus,
                  label: ENABLE_STATUS_LABEL[enableStatus],
                }))}
                onChange={status =>
                  setSearchParams({
                    ...searchParams,
                    status,
                    pageNum: 1,
                  })
                }
              />
              <Button
                icon={<PlusCircleOutlined />}
                type='primary'
                onClick={() => {
                  setParamDrawerProps({ open: true });
                }}
              >
                {I18N.cbam.addParameterConfiguration}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <Table
          rowKey='id'
          columns={
            searchParams.tab === 'formula' ? calculationColumns : paramsColumns
          }
          dataSource={tableData}
          loading={tableLoading}
          scroll={{ x: tableScrollX, y: tableScrollHeight }}
          pagination={{
            current: searchParams.pageNum,
            pageSize: searchParams.pageSize,
            total,
            onChange: (page, pageSize) =>
              setSearchParams({
                ...searchParams,
                pageNum: page,
                pageSize,
              }),
          }}
        />
      </div>
    </div>
  );
};

export default FormulaSetting;
