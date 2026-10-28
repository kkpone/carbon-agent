/**
 * @file 表头
 */

import I18N from '@src/lang/I18N';
import { Input } from '@src/components/Input';
import { RankDto } from '@src/sdks/java/carbonAccount';
import { ColumnsType } from 'antd/es/table';
import style from './index.module.less';

/** 排行榜 column */
export const ranksColumns = ({
  changeSort,
}: {
  changeSort: (val, record) => void;
}): ColumnsType<RankDto> => [
  {
    dataIndex: 'rank',
    title: I18N.carbonAccount.rankingType,
  },
  {
    dataIndex: 'sort',
    title: I18N.carbonAccount.sortTheNumberMore,
    render(val, record) {
      return (
        <Input
          type='number'
          className={style.input}
          max={99}
          min={0}
          aria-label={`${record?.id}`}
          value={val}
          onChange={ev => {
            let value = +ev.target.value;
            if (!value || value <= 0) {
              value = 0;
            }
            if (value >= 99) value = 99;
            changeSort(value, record);
          }}
        />
      );
    },
  },
];
