/* eslint-disable @typescript-eslint/no-use-before-define */
import { ReactNode } from 'react';

type TableMergeCellsRender = {
  // 所有的数据
  tableData: any[];
  // 当前行数据
  record: any;
  // 归属行 - table
  index: number;
  // 当前列的 key
  objname: string;
  // 前一列的 key
  previousName?: string;
  text?: ReactNode;
};
export function tableMergeCellsRender({
  tableData,
  record,
  index,
  objname,
  previousName,
  text,
}: TableMergeCellsRender) {
  const obj = {
    children: text,
    props: {
      rowSpan: 0,
      colSpan: 1,
    },
  };

  // 如果上面有相同的数据，如商品ID 222, 则rowSpan = 0
  if (
    (index > 0 &&
      record[objname] !== tableData[index - 1][objname] &&
      !previousName) ||
    (index > 0 &&
      previousName &&
      (record[objname] !== tableData[index - 1][objname] ||
        record[previousName] !== tableData[index - 1][previousName])) ||
    index === 0
  ) {
    // @ts-ignore
    obj.props.rowSpan = mergeCells({
      target: index,
      data: tableData,
      key: objname,
      previousName,
    });
  } else {
    obj.props.rowSpan = 0;
  }

  return obj;
}

type MergeCells = {
  target: number;
  data: any[];
  key: string;
  previousName?: string;
};
/**
 * 这个函数执行次数太多，需要以后优化
 */
function mergeCells({ target, data, key, previousName }: MergeCells) {
  if (!Array.isArray(data)) return 1;
  const previousData: string[] = [];
  let new_data = data;
  new_data = new_data.map(_ => {
    if (previousName) previousData.push(_[previousName]);
    return _[key];
  }); // 只取出筛选项
  let preValue = new_data[0];
  const res = [[preValue]]; // 放进二维数组里
  let index = 0; // 二维数组下标
  for (let i = 1; i < new_data.length; i += 1) {
    // 没有前一项
    if (new_data[i] === preValue && !previousName) {
      // 相同放进二维数组
      res[index].push(new_data[i]);
    }
    // 如果有前一项
    else if (
      previousName &&
      new_data[i] === preValue &&
      previousData[i] === previousData[i - 1]
    ) {
      // 相同放进二维数组
      res[index].push(new_data[i]);
    } else {
      // 不相同二维数组下标后移
      index += 1;
      res[index] = [new_data[i]];
      preValue = new_data[i];
    }
  }
  const arr: any = [];
  res.forEach(_ => {
    const len = _.length;
    for (let i = 0; i < len; i += 1) {
      arr.push(i === 0 ? len : 0);
    }
  });

  return arr[target];
}
// 具体例子详情指向MonthTable.tsx
