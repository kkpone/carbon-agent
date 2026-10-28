import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  TableColumnsType,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import {
  cloneElement,
  FC,
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import ExpandIcon from '@/components/ExpandIcon';

import styles from './index.module.less';
import { getStandardList, getSystemIndicatorTree } from './service';
import { INDICATOR_TYPE_LABEL } from '../../constant';
import { Indicator } from '../../type';
import {
  isGroupIndicator,
  isLeafIndicator,
  isModelIndicator,
} from '../../utils';
import AcIndicatorTag from '../AcIndicatorTag';

const IndicatorTree = forwardRef<
  Indicator[],
  {
    frameId: number;
    onConfirm: (indicators: Indicator[]) => Promise<void> | void;
    setOpen: (open: boolean) => void;
  }
>(({ frameId, onConfirm, setOpen }, ref) => {
  const [searchParams, setSearchParams] = useState<{
    name?: string;
    standardIds?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [indicatorList, setIndicatorList] = useState<Indicator[]>([]);

  const [selectedIndicators, setSelectedIndicators] = useState<Indicator[]>([]);

  const [standardList, setStandardList] = useState<
    { id: number; name: string }[]
  >([]);

  const selectedIndicatorsSetFlag = useRef(true);

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const onNameSearch = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
        });
      }, 300),
    [searchParams],
  );

  const columns: TableColumnsType<Indicator> = [
    {
      title: <div className={styles.groupName}>{I18N.esg.allIndicators}</div>,
      dataIndex: 'name',
      width: 324,
      ellipsis: true,
      fixed: 'left',
      render: (_, indicator) => {
        const { level, name, id, children } = indicator;
        const expanded = expandedRowKeys.includes(id);
        return (
          <div className={styles.tableNameColumn}>
            {!isModelIndicator(indicator) && (
              <div className={styles.tableLineContent}>
                {new Array(level - 1).fill('').map(() => (
                  <div className={styles.tableLine} />
                ))}
              </div>
            )}
            {(children || []).length > 0 ? (
              <ExpandIcon
                expanded={expanded}
                onClick={() =>
                  setExpandedRowKeys(
                    !expanded
                      ? [...expandedRowKeys, id]
                      : expandedRowKeys.filter(key => key !== id),
                  )
                }
              />
            ) : (
              <div className={styles.emptyExpandIcon} />
            )}
            <div
              className={classNames(styles.groupName, {
                [styles.indicatorName]: !isGroupIndicator(indicator),
              })}
              title={name}
            >
              {name}
            </div>
            <AcIndicatorTag indicator={indicator} />
          </div>
        );
      },
    },
    {
      title: I18N.carbonFootprint.type,
      dataIndex: 'indicatorType',
      width: 106,
      render: (text, indicator) =>
        isGroupIndicator(indicator) ? null : (
          <div className={classNames(styles.nature)}>
            {INDICATOR_TYPE_LABEL[indicator.indicatorType]}
          </div>
        ),
    },
    {
      title: I18N.esg.referenceStandards,
      dataIndex: 'standardIds',
      width: 176,
      render: (_, indicator) => {
        const { standardStr } = indicator;
        if (isGroupIndicator(indicator)) {
          return null;
        }

        if (!standardStr) {
          return '-';
        }
        const [standard, ...restStandard] = standardStr.split(',');
        return (
          <div className={styles.column}>
            <div className={styles.tag} title={standard}>
              {standard}
            </div>
            {restStandard.length > 0 && (
              <Tooltip title={restStandard.join('，')}>
                <div className={styles.tag}>+{restStandard.length}</div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: I18N.esg.interpretationExplanationCase,
      dataIndex: 'description',
      width: 148,
      ellipsis: true,
      render: (text, indicator) =>
        isGroupIndicator(indicator) ? null : (
          <div className={styles.ellipsis} title={text}>
            {text || '-'}
          </div>
        ),
    },
  ];

  useImperativeHandle(ref, () => selectedIndicators, [selectedIndicators]);

  // 只添加新选择的叶子节点
  const addedIndicators = selectedIndicators.filter(
    indicator => isLeafIndicator(indicator) && !indicator.selected,
  );

  const submit = async () => {
    try {
      setSubmitLoading(true);
      await onConfirm(addedIndicators);
      setOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getSystemIndicatorTree({ frameId, ...searchParams })
      .then(({ data }) => {
        const selected: Indicator[] = [];
        const expandedKeys: string[] = [];

        const visitIndicator = (indicators?: Indicator[]) => {
          indicators?.forEach(indicator => {
            if (indicator.selected && isLeafIndicator(indicator)) {
              selected.push(indicator);
            }
            if (isGroupIndicator(indicator)) {
              expandedKeys.push(indicator.id);
            }
            visitIndicator(indicator.children);
          });
        };

        visitIndicator(data.data);

        setIndicatorList(data.data);
        setExpandedRowKeys(expandedKeys);
        if (selectedIndicatorsSetFlag.current) {
          selectedIndicatorsSetFlag.current = false;
          setSelectedIndicators(selected);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, frameId]);

  useEffect(() => {
    getStandardList().then(({ data }) => {
      setStandardList(data.data);
    });
  }, []);

  return (
    <>
      <div className={styles.content}>
        <div className={styles.searchHeader}>
          <Input
            className={styles.searchField}
            prefix={<SearchOutlined className={styles.searchIcon} />}
            placeholder={I18N.enterpriseCarbonAccount2.indicatorName}
            onChange={e => onNameSearch(e.target.value)}
          />
          <Select
            className={styles.searchField}
            mode='multiple'
            allowClear
            placeholder={I18N.esg.referenceStandards}
            options={standardList}
            fieldNames={{ value: 'id', label: 'name' }}
            onChange={(val: number[]) =>
              setSearchParams({ ...searchParams, standardIds: val.join(',') })
            }
          />
        </div>
        <Table
          className={styles.indicatorTable}
          rowKey='id'
          columns={columns}
          virtual
          dataSource={indicatorList}
          pagination={false}
          loading={loading}
          scroll={{ x: 754, y: 476 }}
          expandable={{
            expandedRowKeys,
            indentSize: 0,
            expandIcon: () => null,
          }}
          rowSelection={{
            columnWidth: 30,
            hideSelectAll: true,
            selectedRowKeys: selectedIndicators.map(indicator => indicator.id),
            checkStrictly: false,
            getCheckboxProps: indicator => ({
              // 已选择的叶子节点不能删除
              disabled: indicator.selected && isLeafIndicator(indicator),
            }),
            onSelect: (changeRow, selected, selectedRows) => {
              if (selected) {
                const prevSelectedIds = selectedIndicators.map(
                  indicator => indicator.id,
                );

                setSelectedIndicators([
                  ...selectedIndicators,
                  ...selectedRows.filter(
                    row =>
                      isLeafIndicator(row) && !prevSelectedIds.includes(row.id),
                  ),
                ]);
              } else {
                const changeIndicatorIds: string[] = [];
                const visitIndicator = (indicator: Indicator) => {
                  changeIndicatorIds.push(indicator.id);
                  indicator.children?.forEach(visitIndicator);
                };
                visitIndicator(changeRow);

                setSelectedIndicators(
                  selectedIndicators.filter(
                    indicator => !changeIndicatorIds.includes(indicator.id),
                  ),
                );
              }
            },
          }}
        />
      </div>
      <div className={styles.footer}>
        <Button onClick={() => setOpen(false)}>
          {I18N.carbonFootprint.cancel}
        </Button>
        <Button
          type='primary'
          disabled={addedIndicators.length === 0}
          loading={submitLoading}
          onClick={submit}
        >
          {I18N.carbonFootprint.add}
        </Button>
      </div>
    </>
  );
});

const IndicatorTreeModal: FC<{
  frameId: number;
  children: ReactElement;
  onConfirm: (indicators: Indicator[]) => Promise<void> | void;
}> = ({ frameId, children, onConfirm }) => {
  const [open, setOpen] = useState(false);

  const selectedIndicatorRef = useRef<Indicator[]>(null);

  return (
    <>
      <Modal
        className={styles.indicatorTreeModal}
        title={I18N.esg.addIndicators}
        width={1200}
        open={open}
        destroyOnClose
        footer={null}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <IndicatorTree
          frameId={frameId}
          ref={selectedIndicatorRef}
          setOpen={setOpen}
          onConfirm={onConfirm}
        />
      </Modal>
      {cloneElement(children, { onClick: () => setOpen(!open) })}
    </>
  );
};

export default IndicatorTreeModal;
