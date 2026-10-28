import { connect } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Select } from 'antd';
import { debounce, omit } from 'lodash-es';
import { FC, useMemo, useState } from 'react';

import { TENCENT_MAP_KEY } from '@/config';
import { jsonp } from '@/utils';

import styles from './index.module.less';

export type AddressType = {
  address: string;
  city: string;
  district: string;
  location: { lat: number; lng: number };
  province: string;
  name: string;
};

export const Address: FC<{
  value?: string | AddressType;
  objectValue?: boolean;
  fieldIndex?: number;
  onChange?: (value: string | AddressType, addr?: AddressType) => void;
  [P: string]: any;
}> = ({ value, objectValue, fieldIndex, placeholder, onChange, ...rest }) => {
  const [options, setOptions] = useState<AddressType[]>([]);

  const [loading, setLoading] = useState(false);

  const onSearch = useMemo(
    () =>
      debounce((keyword: string) => {
        setLoading(true);
        jsonp<{ data: (AddressType & { title: string })[] }>(
          'https://apis.map.qq.com/ws/place/v1/suggestion',
          {
            key: TENCENT_MAP_KEY,
            keyword,
            output: 'jsonp',
            region_fix: '0',
          },
        )
          .then(({ data }) => {
            setOptions(
              (data || []).map(addr => ({
                ...omit(addr, 'title'),
                name: addr.title,
              })),
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }, 300),
    [],
  );

  const optionRender = (addr: AddressType) => (
    <>
      <div className={styles.address}>{addr.address}</div>
      <div className={styles.addressName}>{addr.name}</div>
    </>
  );
  return (
    <Select
      {...rest}
      value={!objectValue ? value : (value as AddressType)?.address}
      loading={loading}
      placeholder={placeholder || I18N.components.pleaseSelectDetails}
      showSearch
      options={options}
      fieldNames={{ value: 'address', label: 'address' }}
      filterOption={false}
      notFoundContent={null}
      onSearch={onSearch}
      optionRender={opt => optionRender(opt.data)}
      onChange={(address, addr) => {
        onChange?.(
          !objectValue ? address : (addr as AddressType),
          addr as AddressType,
        );
      }}
    />
  );
};

const AddressSelect = connect(Address);

export default AddressSelect;
