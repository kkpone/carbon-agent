/**
 * @description 过程管理表格（产品、输入、输出）
 */

import { ProTable } from '@ant-design/pro-components';
import type {
  ActionType,
  ProColumns,
  ProTableProps,
} from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { keyBy } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';

import { PageTypeInfo } from '@/router/utils/enums';

import { ColumnsProps } from './columns';
import { PROCESS_CATEGORY_LABEL } from './constant';
import style from './index.module.less';
import { InputOutput } from './type';

interface ParamsType {
  code?: string;
  linkType?: number;
}

interface ProcessManageTableProps {
  /** 是否展示基准流 */
  showBaseLine?: boolean;
  /** 过程管理表格类别: 1 输入; 2 输出; 3 产品 */
  categoryType: number;
  /** 列表表头数据 */
  columns: (props: ColumnsProps) => ProColumns<InputOutput>[];
  /** 是否展示操作按钮 */
  showActionBtn: boolean;
  /** 刷新标识 */
  refreshFlag: boolean;
  /** 表格属性 */
  proTableProps: ProTableProps<InputOutput, ParamsType>;
  /** 当前过程的研究对象的输入输出类型 */
  productIOType?: number;
  /** 过程管理点击操作按钮的方法 */
  onActionBtnClick: (
    type?: string,
    id?: number,
    otherInfo?: {
      isMultipleRef?: boolean;
      isChild?: boolean;
      unit?: string;
      isAddConnect?: boolean;
      [key: string]: any;
    },
  ) => void;
  /** 点击过程上下游数据的方法 */
  onProcessDataClick?: (key: string) => void;
  /** 点击删除按钮的方法 */
  onProcessManageDeleteClick?: (
    id: number,
    successCallBack: () => void,
  ) => void;
  /** 刷新表格的方法 */
  refreshFlagFn?: () => void;
}

const ProcessManageTable = ({
  showBaseLine,
  categoryType,
  columns,
  showActionBtn,
  refreshFlag,
  proTableProps,
  productIOType,
  onActionBtnClick,
  onProcessDataClick,
  onProcessManageDeleteClick,
  refreshFlagFn,
}: ProcessManageTableProps) => {
  /** 是否是产品（研究对象） */
  const isProduct = categoryType === 3;

  const tableRef = useRef<ActionType>();

  const columnsStateDefault = useMemo(() => keyBy(columns, 'dataIndex'), []);

  /** 过程管理表格的类别名称 */
  const categoryName = () =>
    PROCESS_CATEGORY_LABEL[categoryType as keyof typeof PROCESS_CATEGORY_LABEL];

  /** 表格刷新操作 */
  useEffect(() => {
    tableRef?.current?.reload();
  }, [refreshFlag]);

  return (
    <div className={style.productionWrapper}>
      <div className={style.headerWrapper}>
        <span>{categoryName()}</span>
        {showActionBtn && !isProduct && (
          <Button
            type='primary'
            onClick={() => {
              onActionBtnClick(PageTypeInfo.add);
            }}
          >
            {I18N.Factors.newAddition}
          </Button>
        )}
      </div>
      <ProTable
        {...proTableProps}
        actionRef={tableRef}
        columns={columns({
          showBaseLine,
          showActionBtn,
          productIOType,
          onActionBtnClick,
          onProcessDataClick,
          onProcessManageDeleteClick,
          refreshFlagFn,
        })}
        pagination={false}
        scroll={{ x: isProduct ? 1000 : 1200 }}
        search={false}
        columnsState={{
          persistenceKey: `${categoryType}`,
          persistenceType: 'localStorage',
          defaultValue: columnsStateDefault,
        }}
        toolBarRender={false}
      />
    </div>
  );
};
export default ProcessManageTable;
