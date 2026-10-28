/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-25 16:12:09
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-25 18:57:37
 */
import { ColumnConfig } from '@ant-design/charts';

export type ColumnChartProps = {
  height?: number;
  className?: string;
  chartData?: Record<string, any>[];
} & Partial<ColumnConfig>;
