/**
 * @description 选择评价指标
 */
import { DownOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Dropdown, Menu, Button, Checkbox } from 'antd';
import { useState } from 'react';

import styles from './index.module.less';
import { AssessmentTargetOption } from '../type';

interface CheckboxDropdownProps {
  options: AssessmentTargetOption[];
  currentSelectedKeys: (string | undefined)[];
  onCheckAllChange: (e: {
    target: {
      checked: boolean;
    };
  }) => void;
  onSelectTarget: (newCheckedList: (string | undefined)[]) => void;
}

const CheckboxDropdown = ({
  options,
  currentSelectedKeys,
  onCheckAllChange,
  onSelectTarget,
}: CheckboxDropdownProps) => {
  /** 控制下拉显隐 */
  const [visible, setVisible] = useState(false);

  /** 改变下拉显隐的方法 */
  const handleVisibleChange = (flag: boolean) => {
    setVisible(flag);
  };

  const menu = (
    <Menu className={styles.menuWrapper}>
      <Menu.Item key='selectAll'>
        <Checkbox
          onChange={onCheckAllChange}
          checked={currentSelectedKeys.length === options.length}
        >
          {I18N.carbonFootPrintLCA.whole}
        </Checkbox>
      </Menu.Item>
      <Menu.Divider />
      {options?.map(option => (
        <Menu.Item key={option.value}>
          <Checkbox
            checked={currentSelectedKeys.includes(option?.value)}
            onChange={e => {
              const newCheckedList = e.target.checked
                ? [...currentSelectedKeys, option.value]
                : currentSelectedKeys.filter(item => item !== option.value);
              onSelectTarget?.(newCheckedList);
            }}
          >
            {option.label || '-'}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      open={visible}
      onOpenChange={handleVisibleChange}
    >
      <Button key='selectTargetBtn'>
        {I18N.carbonFootPrintLCA.selectionEvaluationIndex}
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default CheckboxDropdown;
