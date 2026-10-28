import type { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Modal, InputNumber, Select, Tooltip, Typography } from 'antd';
import { compact, includes } from 'lodash-es';
import { useState } from 'react';

import { TableActions } from '@/components/Table/TableActions';
import { PageTypeInfo } from '@/router/utils/enums';
import { Toast, modelFooterBtnStyle } from '@/utils';

import {
  PROCESS_CATEGORY,
  RESEARCH_OBJECT_TYPE_NAME,
  RESEARCH_OBJECT_TYPE,
  RESEARCH_OBJECT_OPTION,
} from './constant';
import style from './index.module.less';
import { InputOutput, IoDto } from './type';
import {
  postAllocFactorEdit,
  postResearchObjectEdit,
} from '../../CarbonFootprintModel/service';
import { OptionsType } from '../../CarbonFootprintModel/type';
import { SELECT_BUTTON_TYPE } from '../ProcessManageDrawer/constant';

const { Text } = Typography;

/** 链接类型 */
const {
  PROCESS_DATA,
  MODEL_REFERENCE,
  DATABASE_DATA,
  SUPPLIER_DATA,
  FACTOR_DATA,
} = SELECT_BUTTON_TYPE;

/** 主要研究对象 */
const { MAIN_RESEARCH_OBJECT } = RESEARCH_OBJECT_TYPE;

/** 过程管理类型 产品、输入、输出 */
const { PRODUCTION, INPUT, OUTPUT } = PROCESS_CATEGORY;

const { add, edit, show } = PageTypeInfo;

export interface ColumnsProps {
  /** 是否展示基准流 */
  showBaseLine?: boolean;
  /** 是否展示操作按钮 */
  showActionBtn: boolean;
  /** 当前过程的研究对象的输入输出类型 */
  productIOType?: number;
  /** 操作按钮的方法 */
  onActionBtnClick?: (
    type: string,
    id?: number,
    otherInfo?: {
      isMultipleRef?: boolean;
      isChild?: boolean;
      unit?: string;
      isAddConnect?: boolean;
      [key: string]: any;
    },
  ) => void;
  /** 点击上下游过程数据的方法 */
  onProcessDataClick?: (key: string) => void;
  /** 点击删除按钮的方法 */
  onProcessManageDeleteClick?: (
    id: number,
    successCallBack: () => void,
  ) => void;
  /** 刷新全部表格的方法 */
  refreshFlagFn?: () => void;
}

const roundNum = (num: number, decimal: number) =>
  Math.round(num * 10 ** decimal) / 10 ** decimal;

/** 分配系数单元格 */
const Coefficient = ({
  record,
  disabled,
  updateTableFn,
}: {
  /** 更改此行数据 */
  record: InputOutput;
  /** 是否允许编辑 */
  disabled: boolean;
  /** 更新table数据 */
  updateTableFn?: () => void;
}) => {
  /**  输入输出编码 分配系数 */
  const { ioCode, allocFactor, ioId } = record || {};

  /** 实时输入的值 */
  const [valueInput, setValueInput] = useState(allocFactor);

  /** 处理输入值 */
  const handleInputChange = async (currentValue: string) => {
    const max = 100;
    const min = 0.01;
    const precision = 2;
    const value = currentValue;

    const y = value.indexOf('.') + 1;
    const count = value.length - y;

    const inputValue = Number(value);

    if (isNaN(inputValue)) {
      return;
    }

    let allocationCoefficientValue = 0;
    /** 如果输入的值为小数且小数位数超过了范围 输入数大于最大值 则取最大值 否则保留限制的小数位 */
    if (y > 0 && count > precision) {
      allocationCoefficientValue =
        inputValue > max ? max : roundNum(inputValue, precision);
    } else if (inputValue < min) {
      /** 如果输入值 小于 限制的最小值 则取最小值 */
      allocationCoefficientValue = min;
    } else if (inputValue > max) {
      /** 如果输入值 大于 限制的最大值， 则取最大值 */
      allocationCoefficientValue = max;
    } else {
      allocationCoefficientValue = inputValue;
    }

    if (ioCode) {
      try {
        await postAllocFactorEdit({
          ioCode,
          allocFactor: allocationCoefficientValue,
        });
      } finally {
        updateTableFn?.();
      }
    }
  };

  return disabled ? (
    <span>{allocFactor}</span>
  ) : (
    <InputNumber
      key={ioId}
      disabled={disabled}
      controls={false}
      value={valueInput}
      min={0.01}
      max={100}
      precision={2}
      onInput={val => {
        setValueInput(val || allocFactor);
      }}
      onBlur={event => {
        const currentValue = event.target.value;
        handleInputChange(currentValue);
      }}
      onKeyPress={e => {
        // 检查是否按下了回车键
        if (e.key === 'Enter') {
          e.preventDefault(); // 阻止默认行为，避免触发onBlur
          handleInputChange(valueInput);
        }
      }}
    />
  );
};

/** 输入输出-研究对象单元格 */
const ResearchObject = ({
  record,
  option = [],
  disabled = false,
  updateTableFn,
}: {
  /** 更改此行数据 */
  record: IoDto;
  /** 枚举值 */
  option: OptionsType[];
  /** 是否禁用 */
  disabled: boolean;
  /** 更新table数据 */
  updateTableFn?: () => void;
}) => {
  const { researchObject, ioCode, researchObject_name } = record;

  /** 主要研究对象不允许更改 */
  const isMainResearchObject = researchObject === MAIN_RESEARCH_OBJECT;

  const handleChange = async (value: number) => {
    if (ioCode) {
      try {
        await postResearchObjectEdit({ ioCode, researchObject: value });
      } finally {
        updateTableFn?.();
      }
    }
  };

  return isMainResearchObject ? (
    <div>{researchObject_name}</div>
  ) : (
    <Select
      disabled={disabled}
      value={researchObject}
      style={{ width: 90 }}
      onChange={handleChange}
      options={option}
    />
  );
};

/** 上下游数据单元格 */
const UpDownData = ({
  disabled,
  linkName,
  linkType,
  onProcessDataClick,
  openDrawer,
}: {
  disabled: boolean;
  linkName?: string;
  linkType?: number;
  onProcessDataClick?: () => void;
  openDrawer?: () => void;
}) => {
  if (!linkType) {
    return (
      <span
        className={style.unmatchedBtn}
        onClick={() => {
          if (!disabled) {
            // 打开编辑抽屉
            openDrawer?.();
          }
        }}
      >
        {I18N.carbonFootPrintLCA.unmatched}
      </span>
    );
  }
  if (linkName) {
    return (
      <Tooltip title={linkName} placement='topLeft'>
        <span
          className={style.processBtn}
          onClick={() => {
            // 跳转对应页面
            onProcessDataClick?.();
          }}
        >
          {linkName}
        </span>
      </Tooltip>
    );
  }

  return '-';
};

/** 上下游关联数据单元格 */
const UpDownAssociatedData = ({
  disabled,
  linkIoName,
  linkType,
  onProcessDataClick,
  openDrawer,
}: {
  disabled: boolean;
  linkIoName?: string;
  linkType?: number;
  onProcessDataClick?: () => void;
  openDrawer?: () => void;
}) => {
  if (!linkType) {
    return (
      <span
        className={style.unmatchedBtn}
        onClick={() => {
          if (!disabled) {
            // 打开编辑抽屉
            openDrawer?.();
          }
        }}
      >
        {I18N.carbonFootPrintLCA.unmatched}
      </span>
    );
  }
  if (includes([PROCESS_DATA, MODEL_REFERENCE], linkType)) {
    return linkIoName ? (
      <Tooltip title={linkIoName} placement='topLeft'>
        <span
          className={style.processBtn}
          onClick={() => {
            // 跳转对应页面
            onProcessDataClick?.();
          }}
        >
          {linkIoName}
        </span>
      </Tooltip>
    ) : (
      '-'
    );
  }

  return I18N.carbonFootPrintLCA.nothing;
};

/** 产品 */
export const productionColumns = ({
  showBaseLine,
  showActionBtn,
}: ColumnsProps): ProColumns<IoDto>[] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 60,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootPrintLCA.researchSubjectName,
      dataIndex: 'ioName',
      width: 340,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.researchObject2,
      dataIndex: 'researchObject',
      width: 170,
      ellipsis: true,
      render: (_, row) => {
        const { researchObject } = row;
        return RESEARCH_OBJECT_TYPE_NAME[
          Number(researchObject) as keyof typeof RESEARCH_OBJECT_TYPE_NAME
        ];
      },
    },
    {
      title: I18N.carbonFootPrintLCA.quantity,
      dataIndex: 'num',
      width: 180,
      render: (_v, record) => {
        const { dataValue, unitName, baselineValue } = record;
        const showBaseValue =
          (baselineValue || baselineValue === 0) && unitName;
        if (showBaseLine) {
          return showBaseValue ? (
            <Tooltip title={baselineValue + unitName}>
              <Text ellipsis>{baselineValue + unitName}</Text>
            </Tooltip>
          ) : (
            '-'
          );
        }

        const showValue = (dataValue || dataValue === 0) && unitName;
        return showValue ? (
          <Tooltip title={dataValue + unitName}>
            <Text ellipsis>{dataValue + unitName}</Text>
          </Tooltip>
        ) : (
          '-'
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.inputOutput,
      dataIndex: 'ioType_name',
      width: 100,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.partitionCoefficient,
      dataIndex: 'allocFactor',
      width: 150,
      fixed: 'right',
      render: (_, record, index, action) => (
        <Coefficient
          record={record}
          disabled={!showActionBtn || index === 0}
          updateTableFn={() => {
            action?.reload();
          }}
        />
      ),
    },
  ]);

/** 输入 */
export const inputColumns = ({
  showBaseLine,
  showActionBtn,
  productIOType,
  onActionBtnClick,
  onProcessDataClick,
  onProcessManageDeleteClick,
  refreshFlagFn,
}: ColumnsProps): ProColumns<InputOutput>[] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 60,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootPrintLCA.enterName,
      dataIndex: 'ioName',
      width: 240,
      fixed: 'left',
      ellipsis: true,
    },
    !showBaseLine && {
      title: I18N.carbonFootPrintLCA.quantity,
      dataIndex: 'dataValue',
      width: 120,
      ellipsis: true,
      render: (val, record) => {
        if (record.forbidEdit) return '-';
        return val ?? '-';
      },
    },
    showBaseLine && {
      title: I18N.carbonFootPrintLCA.quantity,
      dataIndex: 'baselineValue',
      width: 120,
      ellipsis: true,
    },
    {
      title: I18N.Factors.unit,
      dataIndex: 'unitName',
      width: 100,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.type,
      dataIndex: 'dataType_name',
      width: 120,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.researchObject2,
      dataIndex: 'researchObject',
      width: 100,
      render: (_, record) => {
        const { forbidEdit } = record;
        return (
          <ResearchObject
            disabled={productIOType === OUTPUT || !showActionBtn || forbidEdit}
            record={record}
            option={RESEARCH_OBJECT_OPTION}
            updateTableFn={() => {
              refreshFlagFn?.();
            }}
          />
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.upstreamData,
      dataIndex: 'linkName',
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        const { linkName, linkCode, linkType, ioId } = record || {};
        return (
          <UpDownData
            disabled={showBaseLine || !showActionBtn}
            linkName={linkName}
            linkType={linkType}
            onProcessDataClick={() => {
              if (linkCode) onProcessDataClick?.(linkCode);
            }}
            openDrawer={() => {
              onActionBtnClick?.(edit, ioId);
            }}
          />
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.upstreamRelatedTransmission,
      dataIndex: 'linkIoName',
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        const { linkIoName, linkCode, linkType, ioId } = record || {};
        return (
          <UpDownAssociatedData
            disabled={showBaseLine || !showActionBtn}
            linkIoName={linkIoName}
            linkType={linkType}
            onProcessDataClick={() => {
              if (linkCode) onProcessDataClick?.(linkCode);
            }}
            openDrawer={() => {
              onActionBtnClick?.(edit, ioId);
            }}
          />
        );
      },
    },
    {
      title: I18N.Factors.operation,
      dataIndex: 'action',
      width: showActionBtn ? 160 : 80,
      fixed: 'right',
      render(_, row) {
        const { ioId, ioName, researchObject, forbidEdit } = row || {};
        /** 主要研究对象不可编辑、删除 */
        const isMainResearchObject = researchObject === MAIN_RESEARCH_OBJECT;
        return (
          <TableActions
            menus={compact([
              showActionBtn && {
                label: I18N.Factors.edit,
                key: I18N.Factors.edit,
                disabled: forbidEdit,
                onClick: () => {
                  onActionBtnClick?.(edit, ioId);
                },
              },
              !isMainResearchObject &&
                showActionBtn && {
                  label: I18N.Factors.delete,
                  key: I18N.Factors.delete,
                  disabled: forbidEdit,
                  onClick: async () => {
                    Modal.confirm({
                      title: I18N.Factors.prompt,
                      icon: '',
                      content: (
                        <div>
                          {I18N.carbonFootPrintLCA.deleteInput}
                          {ioName}？
                          <span className='warnRed'>
                            {I18N.carbonFootPrintLCA.afterDeletionAll}
                          </span>
                        </div>
                      ),
                      ...modelFooterBtnStyle,
                      okText: I18N.base.confirm,
                      cancelText: I18N.Factors.cancel,
                      onOk: async () => {
                        if (ioId) {
                          onProcessManageDeleteClick?.(ioId, () => {
                            Toast('success', I18N.Factors.deleteSuccessful);
                          });
                        }
                      },
                    });
                  },
                },
              {
                label: I18N.Factors.check,
                key: I18N.Factors.check,
                disabled: forbidEdit,
                onClick: () => {
                  onActionBtnClick?.(show, ioId);
                },
              },
            ])}
          />
        );
      },
    },
  ]);

/** 输出 */
export const outputColumns = ({
  showBaseLine,
  showActionBtn,
  productIOType,
  onActionBtnClick,
  onProcessDataClick,
  onProcessManageDeleteClick,
  refreshFlagFn,
}: ColumnsProps): ProColumns<InputOutput>[] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.number,
      dataIndex: 'allIndex',
      width: 60,
      fixed: 'left',
    },
    {
      title: I18N.carbonFootPrintLCA.outputName,
      dataIndex: 'ioName',
      width: 240,
      fixed: 'left',
      ellipsis: true,
    },
    !showBaseLine && {
      title: I18N.carbonFootPrintLCA.quantity,
      dataIndex: 'dataValue',
      width: 120,
      ellipsis: true,
      render: (val, record) => {
        if (record.forbidEdit) return '-';
        return val ?? '-';
      },
    },
    showBaseLine && {
      title: I18N.carbonFootPrintLCA.quantity,
      dataIndex: 'baselineValue',
      width: 120,
      ellipsis: true,
    },
    {
      title: I18N.Factors.unit,
      dataIndex: 'unitName',
      width: 100,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.type,
      dataIndex: 'dataType_name',
      width: 120,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.researchObject2,
      dataIndex: 'researchObject',
      width: 100,
      render: (_, record) => {
        const { isChild, forbidEdit } = record;
        /** 多重引用的子输出写死'-' */
        if (isChild) return '-';
        return (
          <ResearchObject
            disabled={productIOType === INPUT || !showActionBtn || forbidEdit}
            record={record}
            option={RESEARCH_OBJECT_OPTION}
            updateTableFn={() => {
              refreshFlagFn?.();
            }}
          />
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.downstreamData,
      dataIndex: 'linkName',
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        const {
          linkName,
          linkCode,
          linkType,
          ioId,
          isMultipleRef,
          isChild,
          unit,
          multiMainIoCode,
        } = record || {};
        if (isMultipleRef) {
          return linkName;
        }
        return (
          <UpDownData
            disabled={showBaseLine || !showActionBtn}
            linkName={linkName}
            linkType={linkType}
            onProcessDataClick={() => {
              if (linkCode) onProcessDataClick?.(linkCode);
            }}
            openDrawer={() => {
              onActionBtnClick?.(edit, ioId, {
                isMultipleRef,
                isChild,
                unit,
                multiMainIoCode: isChild ? multiMainIoCode : undefined,
              });
            }}
          />
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.downstreamRelatedTransmission,
      dataIndex: 'linkIoName',
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        const {
          linkIoName,
          linkCode,
          linkType,
          ioId,
          isMultipleRef,
          isChild,
          unit,
          multiMainIoCode,
        } = record || {};
        if (isMultipleRef) {
          return linkIoName;
        }
        return (
          <UpDownAssociatedData
            disabled={showBaseLine || !showActionBtn}
            linkIoName={linkIoName}
            linkType={linkType}
            onProcessDataClick={() => {
              if (linkCode) onProcessDataClick?.(linkCode);
            }}
            openDrawer={() => {
              onActionBtnClick?.(edit, ioId, {
                isMultipleRef,
                isChild,
                unit,
                multiMainIoCode: isChild ? multiMainIoCode : undefined,
              });
            }}
          />
        );
      },
    },
    {
      title: I18N.Factors.operation,
      dataIndex: 'action',
      width: showActionBtn ? 240 : 80,
      fixed: 'right',
      render(_, row) {
        const {
          isMultipleRef,
          isChild,
          unit,
          ioId,
          multiMainIoCode,
          ioName,
          researchObject,
          forbidEdit,
          linkType,
        } = row || {};
        /** 主要研究对象不可编辑、删除 */
        const isMainResearchObject = researchObject === MAIN_RESEARCH_OBJECT;
        /** 非子输出&非数据集数据 => 有新增其他关联按钮 */
        const hasAddOtherAssociatedBtn =
          !isChild &&
          ![DATABASE_DATA, SUPPLIER_DATA, FACTOR_DATA].includes(linkType);

        return (
          <TableActions
            menus={compact([
              showActionBtn && {
                label: I18N.Factors.edit,
                key: I18N.Factors.edit,
                disabled: forbidEdit,
                onClick: () => {
                  onActionBtnClick?.(edit, ioId, {
                    isMultipleRef,
                    isChild,
                    unit,
                    multiMainIoCode: isChild ? multiMainIoCode : undefined,
                  });
                },
              },
              !isMainResearchObject &&
                showActionBtn &&
                !isMultipleRef && {
                  label: I18N.Factors.delete,
                  key: I18N.Factors.delete,
                  disabled: forbidEdit,
                  onClick: async () => {
                    Modal.confirm({
                      title: I18N.Factors.prompt,
                      icon: '',
                      content: (
                        <div>
                          {I18N.carbonFootPrintLCA.deleteOutput}
                          {ioName}？
                          <span className='warnRed'>
                            {I18N.carbonFootPrintLCA.afterDeletionAll}
                          </span>
                        </div>
                      ),
                      ...modelFooterBtnStyle,
                      okText: I18N.base.confirm,
                      cancelText: I18N.Factors.cancel,
                      onOk: async () => {
                        if (ioId) {
                          onProcessManageDeleteClick?.(ioId, () => {
                            Toast('success', I18N.Factors.deleteSuccessful);
                          });
                        }
                      },
                    });
                  },
                },
              {
                label: I18N.Factors.check,
                key: I18N.Factors.check,
                disabled: forbidEdit,
                onClick: () => {
                  onActionBtnClick?.(show, ioId, {
                    isMultipleRef,
                    isChild,
                    unit,
                    multiMainIoCode: isChild ? multiMainIoCode : undefined,
                  });
                },
              },
              showActionBtn &&
                hasAddOtherAssociatedBtn && {
                  label: I18N.carbonFootPrintLCA.addOtherLevels,
                  key: I18N.carbonFootPrintLCA.addOtherLevels,
                  disabled: forbidEdit,
                  onClick: () => {
                    onActionBtnClick?.(add, ioId, {
                      isMultipleRef,
                      isChild,
                      unit,
                      isAddConnect: true,
                      multiMainIoCode,
                    });
                  },
                },
            ])}
          />
        );
      },
    },
  ]);

/** 获取过程数据 */
export const onGetProcessManageColumns = () => [
  /** 产品：完整的过程数据下展示 */
  {
    categoryType: PRODUCTION,
    columns: productionColumns,
  },
  /** 输入：一直展示 */
  {
    categoryType: INPUT,
    columns: inputColumns,
  },
  /** 输出：完整的过程数据下展示  */
  {
    categoryType: OUTPUT,
    columns: outputColumns,
  },
];
