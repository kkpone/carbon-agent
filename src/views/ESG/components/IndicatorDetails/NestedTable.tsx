/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import I18N from '@src/lang/I18N';
import {
  Input,
  InputNumber,
  Radio,
  Table,
  TableColumnsType,
  InputProps,
  InputNumberProps,
} from 'antd';
import classNames from 'classnames';
import { FC, memo, useEffect, useRef, useState } from 'react';

import ExpandIcon from '@/components/ExpandIcon';
import { IconAlibabaNew } from '@/components/iconfont';

import styles from './nestedTable.module.less';
import {
  BOOLEAN_OPTIONS,
  BOOLEAN_OPTIONS_LABEL,
  INDICATOR_FILL_WAY,
  INDICATOR_TYPE,
} from '../../constant';
import { Indicator } from '../../type';
import { isTopLevelIndicator } from '../../utils';
import AttachmentModal from '../AttachmentModal';
import AttachmentPopover from '../AttachmentPopover';
import FormulaTooltip from '../FormulaTooltip';
import { editIndicator } from '../IndicatorTreeModal/service';
import LastYearValueCompare from '../LastYearValueCompare';

const SCROLL_X = 800;
const FIXED_LEFT_WIDTH = 246;
const SCROLL_COLUMNS_COUNT = 4;
const ROW_TYPE = {
  ROW_HEAD: 'ROW_HEAD',
  ROW_DATA: 'ROW_DATA',
};

const EditableCell = memo(
  (
    props: {
      fieldType: number;
      unitName?: string;
      onBlur: (value: number | string | null | undefined) => void;
    } & Omit<InputProps, 'onBlur'> &
      Omit<InputNumberProps, 'onBlur'>,
  ) => {
    const { value, fieldType, unitName, onBlur, ...rest } = props;

    const [internalValue, setInternalValue] = useState<
      number | string | null | undefined
    >(value);

    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    return (
      <div className={styles.dataInputContent}>
        {fieldType === INDICATOR_TYPE.NUMERIC ? (
          <InputNumber
            {...rest}
            value={internalValue}
            onChange={setInternalValue}
            onBlur={() => onBlur?.(internalValue)}
          />
        ) : (
          <Input
            {...rest}
            value={internalValue ?? undefined}
            onChange={e => setInternalValue(e.target.value)}
            onBlur={() => onBlur?.(internalValue)}
          />
        )}
        {unitName && <span>{unitName}</span>}
      </div>
    );
  },
);

const NestedTable: FC<{
  dataSource: Indicator[];
  isFill: boolean;
  indicatorId: string;
  updateTask: () => void;
  updateDetails: () => void;
}> = ({ dataSource, isFill, indicatorId, updateTask, updateDetails }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const expandFlag = useRef(false);

  const transformDataSource = (list?: Indicator[]) =>
    list?.map(indicator => {
      const { indicatorType, tableHeadList, children } = indicator;
      if (
        indicatorType === INDICATOR_TYPE.TABLE &&
        (tableHeadList || []).length > 0
      ) {
        return {
          ...indicator,
          children: [
            {
              id: `Table-${indicator.id}`,
              rowType: ROW_TYPE.ROW_HEAD,
              columns: tableHeadList,
            },
            ...tableHeadList[0].optionSetList.map(item => ({
              ...item,
              id: item.optionCode,
              columns: tableHeadList,
              rowType: ROW_TYPE.ROW_DATA,
              parentIndicator: indicator,
            })),
          ],
        };
      }

      return {
        ...indicator,
        children: transformDataSource(children),
      };
    });

  const onIndicatorEdit = async (indicator: Indicator) => {
    await editIndicator({ ...indicator, children: null });
    updateTask();
    updateDetails();
  };

  const onCell = (indicator: Indicator, merge: boolean) => {
    if (
      indicator.rowType === ROW_TYPE.ROW_HEAD ||
      indicator.rowType === ROW_TYPE.ROW_DATA
    ) {
      return { colSpan: merge ? SCROLL_COLUMNS_COUNT : 0 };
    }
    return { colSpan: 1 };
  };

  const columns: TableColumnsType<Indicator> = [
    {
      title: I18N.carbonDataManagemen.index,
      width: FIXED_LEFT_WIDTH,
      dataIndex: 'name',
      ellipsis: true,
      fixed: 'left',
      render: (_, indicator) => {
        const { indicatorType, children, id, name, rowType, tableHeadList } =
          indicator;
        const expanded = expandedRowKeys.includes(id);
        const expandedAble =
          (children || []).length > 0 ||
          (indicatorType === INDICATOR_TYPE.TABLE &&
            (tableHeadList || []).length > 0);

        if (rowType === ROW_TYPE.ROW_HEAD) {
          return (
            <div className={styles.tableNameColumn}>
              <div className={styles.emptyExpandIcon} />
              <div
                className={styles.groupName}
                title={indicator.columns?.[0]?.columnName}
              >
                {indicator.columns?.[0]?.columnName}
              </div>
            </div>
          );
        }

        if (rowType === ROW_TYPE.ROW_DATA) {
          return (
            <div className={styles.tableNameColumn}>
              <div className={styles.emptyExpandIcon} />
              <div
                className={styles.indicatorName}
                title={indicator.optionName}
              >
                {indicator.optionName}
              </div>
            </div>
          );
        }

        return (
          <div className={styles.tableNameColumn}>
            {expandedAble ? (
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
              className={classNames(styles.indicatorName, {
                [styles.groupName]: isTopLevelIndicator(indicator),
              })}
              title={name}
            >
              {name}
            </div>
            <FormulaTooltip indicator={indicator} />
          </div>
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.numericalValue,
      width: 166,
      dataIndex: 'indicatorValue',
      onCell: indicator => onCell(indicator, true),
      render: (_, indicator) => {
        const { indicatorType, indicatorValue } = indicator;
        if (
          indicatorType === INDICATOR_TYPE.TABLE ||
          indicatorType === INDICATOR_TYPE.ABSTRACT
        ) {
          return null;
        }

        if (indicator.rowType === ROW_TYPE.ROW_HEAD) {
          const restColumns = indicator.columns.slice(1);
          return (
            <div className={styles.customRow}>
              {restColumns.map(col => (
                <div className={styles.customCol} key={col.columnCode}>
                  <div className={styles.groupName}>{col.columnName}</div>
                </div>
              ))}
            </div>
          );
        }

        if (indicator.rowType === ROW_TYPE.ROW_DATA) {
          const { optionCode } = indicator;
          const restColumns = indicator.columns?.slice(1);
          const originIndicator = indicator.parentIndicator;

          const onChange = (columnCode, val) => {
            const tableValue = originIndicator.tableValue || {};
            const rowValue = tableValue[optionCode] || {};
            const newTableValue = {
              ...tableValue,
              [optionCode]: {
                ...rowValue,
                [columnCode]: val,
              },
            };
            Object.assign(originIndicator, {
              tableValue: newTableValue,
              indicatorValue: JSON.stringify(newTableValue),
            });
          };

          return (
            <div className={styles.customRow}>
              {restColumns.map(col => {
                const { columnType, columnCode, isAc } = col;
                const value =
                  originIndicator.tableValue?.[optionCode]?.[columnCode];

                return (
                  <div className={styles.customCol} key={columnCode}>
                    {(() => {
                      if (columnType === 'NUMERIC') {
                        return (
                          <EditableCell
                            className={styles.dataInput}
                            fieldType={INDICATOR_TYPE.NUMERIC}
                            value={value}
                            placeholder={
                              isAc
                                ? I18N.enterpriseCarbonAccount2
                                    .automaticCalculation
                                : I18N.base.pleaseEnter
                            }
                            disabled={!isFill || isAc}
                            controls={false}
                            onBlur={val => {
                              onChange(columnCode, val);
                              onIndicatorEdit(originIndicator);
                            }}
                          />
                        );
                      }

                      if (columnType === 'RADIO') {
                        return (
                          <Radio.Group
                            value={value}
                            disabled={!isFill}
                            options={Object.values(BOOLEAN_OPTIONS).map(
                              booleanValue => ({
                                value: booleanValue,
                                label: BOOLEAN_OPTIONS_LABEL[booleanValue],
                              }),
                            )}
                            onChange={e => {
                              onChange(columnCode, e.target.value);
                              onIndicatorEdit(originIndicator);
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                );
              })}
            </div>
          );
        }

        if (indicatorType === INDICATOR_TYPE.BOOLEAN) {
          return (
            <Radio.Group
              value={indicatorValue}
              disabled={!isFill}
              options={Object.values(BOOLEAN_OPTIONS).map(value => ({
                value,
                label: BOOLEAN_OPTIONS_LABEL[value],
              }))}
              onChange={e => {
                Object.assign(indicator, { indicatorValue: e.target.value });
                onIndicatorEdit(indicator);
              }}
            />
          );
        }

        if (
          indicatorType === INDICATOR_TYPE.NUMERIC ||
          indicatorType === INDICATOR_TYPE.TEXT
        ) {
          const isAc = indicator.fillWay === INDICATOR_FILL_WAY.AC;
          return (
            <EditableCell
              className={styles.dataInput}
              fieldType={indicatorType}
              value={indicatorValue}
              placeholder={
                isAc
                  ? I18N.enterpriseCarbonAccount2.automaticCalculation
                  : I18N.base.pleaseEnter
              }
              disabled={!isFill || isAc}
              unitName={indicator.unitName}
              controls={false}
              onBlur={val => {
                Object.assign(indicator, { indicatorValue: val });
                onIndicatorEdit(indicator);
              }}
            />
          );
        }

        if (
          indicatorType === INDICATOR_TYPE.ENERGY_COMPONENT ||
          indicatorType === INDICATOR_TYPE.EMISSION_COMPONENT
        ) {
          return <div style={{ paddingLeft: 11 }}>{indicatorValue}</div>;
        }

        return null;
      },
    },
    {
      title: I18N.esg.lastYearsSamePeriodValue,
      width: 148,
      dataIndex: 'preIndicatorValue',
      onCell: indicator => onCell(indicator, false),
      render: (_, indicator) => {
        const { indicatorType, preIndicatorValue, indicatorValue, unitName } =
          indicator;
        if (indicatorType === INDICATOR_TYPE.ABSTRACT) {
          return null;
        }

        if (indicatorType === INDICATOR_TYPE.BOOLEAN) {
          return BOOLEAN_OPTIONS_LABEL[preIndicatorValue];
        }

        if (
          indicatorType === INDICATOR_TYPE.NUMERIC ||
          indicatorType === INDICATOR_TYPE.ENERGY_COMPONENT ||
          indicatorType === INDICATOR_TYPE.EMISSION_COMPONENT
        ) {
          return (
            <LastYearValueCompare
              current={indicatorValue}
              prev={preIndicatorValue}
              unitName={unitName}
            />
          );
        }

        return preIndicatorValue;
      },
    },
    {
      title: I18N.components.attachment,
      width: 120,
      dataIndex: 'fileList',
      onCell: indicator => onCell(indicator, false),
      render: (_, indicator) => {
        const fileList = indicator.fileList || [];
        const addAttachment = (files: Indicator['fileList']) => {
          Object.assign(indicator, {
            fileList: [
              ...fileList,
              ...files.map(file => ({
                name: file.name,
                url: file.response?.data,
              })),
            ],
          });
          onIndicatorEdit(indicator);
        };

        const deleteAttachment = (file: Indicator['fileList'][number]) => {
          Object.assign(indicator, {
            fileList: fileList.filter(f => f.url !== file.url),
          });
          onIndicatorEdit(indicator);
        };

        if (isFill) {
          return (
            <AttachmentModal onConfirm={addAttachment}>
              <span>
                {fileList.length === 0 ? (
                  <IconAlibabaNew
                    className={styles.attachmentIcon}
                    type='icon-icon-tianjia-new'
                  />
                ) : (
                  <AttachmentPopover
                    fileList={fileList}
                    onDelete={deleteAttachment}
                  >
                    <IconAlibabaNew
                      className={styles.attachmentIcon}
                      type='icon-link'
                    />
                  </AttachmentPopover>
                )}
              </span>
            </AttachmentModal>
          );
        }

        return null;
      },
    },
    {
      title: I18N.carbonFootprint.remarks,
      width: 120,
      dataIndex: 'remark',
      onCell: indicator => onCell(indicator, false),
      render: (_, indicator) => {
        const { remark } = indicator;

        return (
          <EditableCell
            className={styles.dataInput}
            fieldType={INDICATOR_TYPE.TEXT}
            value={remark}
            disabled={!isFill}
            placeholder={I18N.eca.pleaseEnterANote}
            onBlur={val => {
              Object.assign(indicator, { remark: val });
              onIndicatorEdit(indicator);
            }}
          />
        );
      },
    },
  ];

  useEffect(() => {
    expandFlag.current = true;
  }, [indicatorId]);

  useEffect(() => {
    if (expandFlag.current) {
      setExpandedRowKeys(dataSource.map(item => item.id));
      expandFlag.current = false;
    }
  }, [dataSource]);

  return (
    <Table
      className={classNames(styles.nestedTable)}
      rowKey='id'
      columns={columns}
      dataSource={transformDataSource(dataSource)}
      pagination={false}
      scroll={{ x: SCROLL_X }}
      expandable={{
        expandedRowKeys,
        indentSize: 8,
      }}
    />
  );
};

export default memo(NestedTable);
