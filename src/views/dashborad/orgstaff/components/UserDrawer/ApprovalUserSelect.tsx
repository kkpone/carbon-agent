import I18N from '@src/lang/I18N';
import { connect, mapProps } from '@formily/react';
import { Select, Tooltip } from 'antd';
import React, { FC, useMemo } from 'react';

interface SubApprovalItem {
  id: number;
  userId: number;
  companyId: number;
}

interface EmployeeOption {
  label: string;
  value: number;
  disabled?: boolean;
  title?: string;
  id: number;
  companyId: number;
}

interface ApprovalUserSelectProps {
  value?: SubApprovalItem[];
  onChange?: (value: SubApprovalItem[]) => void;
  dataSource?: EmployeeOption[];
  onLoadEmployees?: (orgId: number) => void;
  [key: string]: any;
}

const ApprovalUserSelectComponent: FC<ApprovalUserSelectProps> = props => {
  const { value = [], onChange, dataSource = [], ...rest } = props;

  // 将 subApprovalList 转换为 userId 数组用于 Select 显示
  const selectedUserIds = useMemo(
    () => value?.map(item => item.userId) || [],
    [value],
  );

  // 当 Select 值变化时，过滤掉被禁用的选项，然后将 userId 数组转换为 subApprovalList
  const handleChange = (selectedIds: number[]) => {
    // 过滤掉被禁用的选项
    const validSelectedIds = selectedIds.filter(userId => {
      const option = dataSource.find(item => item.value === userId);
      return option && !option.disabled;
    });

    const newSubApprovalList: SubApprovalItem[] = validSelectedIds.map(
      userId => {
        const employee = dataSource.find(item => item.value === userId);
        return {
          id: employee?.id || 0,
          userId,
          companyId: employee?.companyId || 0,
        };
      },
    );
    onChange?.(newSubApprovalList);
  };

  // 处理选项，为禁用项添加特殊样式和提示（不使用 disabled 属性）
  const processedOptions = useMemo(
    () =>
      dataSource.map(option => {
        if (option.disabled) {
          return {
            label: (
              <Tooltip
                title={I18N.dashborad.theEmployeeAlreadyHas}
                placement='bottom'
                overlayStyle={{ maxWidth: 300 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'rgba(0, 0, 0, 0.25)',
                    cursor: 'not-allowed',
                  }}
                >
                  <span>{option.label}</span>
                </div>
              </Tooltip>
            ),
            value: option.value,
            // 不设置 disabled，让 Tooltip 可以正常工作
            __isDisabled: true, // 用自定义属性标记是否禁用
          };
        }
        return {
          label: option.label,
          value: option.value,
          __isDisabled: false,
        };
      }),
    [dataSource],
  );

  return (
    <Select
      mode='multiple'
      value={selectedUserIds}
      onChange={handleChange}
      options={processedOptions}
      {...rest}
    />
  );
};

export const ApprovalUserSelect = connect(
  ApprovalUserSelectComponent,
  mapProps((props, field) => ({
    ...props,
    dataSource: (field as any)?.dataSource || [],
  })),
);
