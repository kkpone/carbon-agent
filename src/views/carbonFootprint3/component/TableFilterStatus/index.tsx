/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-24 16:54:08
 * @Date: 2023-04-19 17:49:45
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { Button, Checkbox } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useState } from 'react';

import style from './index.module.less';
import { TableFilterStatusProps } from './type';

/**
 * 测试文件名称
 * @returns
 */
const TableFilterStatus = ({
  listArr,
  onConfirmClick,
}: TableFilterStatusProps) => {
  const [confirmVal, setConfirmVal] = useState<CheckboxValueType[]>([]);

  const onChange = (val: CheckboxValueType[]) => {
    setConfirmVal(val);
  };

  const confirm = () => {
    onConfirmClick(confirmVal as number[]);
  };
  return (
    <div className={style.tableFilterStatusMain}>
      <div className={style.listMain}>
        <Checkbox.Group
          value={confirmVal}
          style={{ width: '100%' }}
          onChange={checkedValue => {
            onChange(checkedValue);
          }}
        >
          {listArr.map(list => (
            <div className={style.list}>
              <Checkbox value={list.value}>{list.label}</Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      </div>
      <div className={style.footerMain}>
        <Button
          onClick={() => {
            onConfirmClick([]);
            setConfirmVal([]);
          }}
          className={style.footerMainBtn}
        >
          {I18N.carbonFootprint3.reset}
        </Button>
        <Button
          onClick={() => confirm()}
          className={`${style.footerMainBtn} m-l-10`}
          type='primary'
        >
          {I18N.carbonFootprint.confirm2}
        </Button>
      </div>
    </div>
  );
};

export default TableFilterStatus;
