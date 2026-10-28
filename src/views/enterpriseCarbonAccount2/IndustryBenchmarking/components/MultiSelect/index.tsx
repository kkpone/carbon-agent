import I18N from '@src/lang/I18N';
import { SearchInput } from '@src/components/SearchInput';
import { uuid } from '@src/utils';
import { Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import { FC, useState } from 'react';

import delSvg from './del.svg';
import styles from './index.module.less';
import { getIndustryDataCompanyList } from '../../service';

interface IMultiSelectProps {
  value: DefaultOptionType[];
  onChange: (value: DefaultOptionType[]) => void;
}

const fetch = async (name: string, callback: Function) => {
  // currentName = name;
  const result = await getIndustryDataCompanyList({ industyrName: name });
  const transData = result.data.data.map(item => ({
    value: item.industryId,
    text: (
      <div className={styles.itemWrapper}>
        <div className={styles.itemTitle}>{item.industyrName}</div>
        <div className={styles.tips}>
          {I18N.enterpriseCarbonAccount2.clickToAdd}
        </div>
      </div>
    ),
    label: item.industyrName,
    year: item.year,
  }));
  callback(transData);
};

export const MultiSelect: FC<IMultiSelectProps> = props => {
  const { value, onChange } = props;
  const [inputValue, setInputValue] = useState<string>('');
  return (
    <div className={styles.wrapper}>
      {value.map(item => (
        <div key={item.uuid} className={styles.item}>
          <Tooltip
            overlay={`${item.label}  ${item.year ? `-${item.year}` : ''}`}
          >
            <div className={styles.content}>
              {item.label} {item.year && `- ${item.year}`}
            </div>
          </Tooltip>
          <span
            className={styles.delete}
            onClick={() => {
              onChange(value.filter(i => i.uuid !== item.uuid));
            }}
          >
            <img src={delSvg} alt='' />
          </span>
        </div>
      ))}
      <SearchInput
        style={{ width: '232px' }}
        placeholder={I18N.enterpriseCarbonAccount2.pleaseEnterCompany}
        fetch={fetch}
        value={inputValue}
        onChange={(e: string) => setInputValue(e)}
        handleSelect={(e?: DefaultOptionType) => {
          if (e) {
            setInputValue('');
            onChange([
              ...value,
              { label: e.label, value: e.value, uuid: uuid(), year: e.year },
            ]);
          }
        }}
      />
    </div>
  );
};
