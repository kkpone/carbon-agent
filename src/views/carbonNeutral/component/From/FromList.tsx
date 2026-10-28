/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:30:38
 */
import I18N from '@src/lang/I18N';
import { FC, useState, useContext, useEffect, ReactNode } from 'react';
import {
  Input,
  InputNumber,
  DatePicker,
  Radio,
  Select,
  Checkbox,
  Table,
  Button,
  InputNumberProps,
  InputProps,
  RadioProps,
  Cascader,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SelectProps, SelectValue } from 'antd/lib/select';
import { ColumnsType } from 'antd/lib/table';
import { TableContact } from '@views/EnterpriseCarbonAccount/Construction/activityManage/addActivity';
import { Toast } from '@src/utils/Toast';
import { creatColumns } from './columns';
import { CommonInterface } from '../../type';

export interface ComstomInputType {
  disabled?: boolean;
  placeholder?: string;
  addonAfter?: string | ReactNode;
  suffix?: string | ReactNode;
}

export const ComstomInput: FC<InputProps & { item: ComstomInputType }> = ({
  item,
  ...props
}) => (
  <Input
    disabled={item.disabled}
    placeholder={item.placeholder}
    addonAfter={item.addonAfter ? item.addonAfter : ''}
    suffix={item.suffix ? item.suffix : ''}
    type={item.suffix ? 'number' : ''}
    {...props}
  />
);
export const ComstomSuffixInput: FC<
  InputNumberProps & { item: ComstomInputNumberType }
> = ({ item, ...props }) => (
  <InputNumber
    stringMode
    disabled={item?.disabled}
    placeholder={item?.placeholder}
    maxLength={item?.maxLength}
    style={{ width: '100%', borderRight: 'none' }}
    min={item?.min}
    max={item?.max}
    // precision={item.precision}
    step={item?.step}
    addonAfter={item?.suffix ? item?.suffix : ''}
    controls={false}
    {...props}
    {...item}
    className='comstom-suffix-input'
  />
);
export interface ComstomInputNumberType {
  disabled?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: string;
  addonAfter?: string | ReactNode;
  placeholder?: string;
  suffix?: React.ReactNode;
}
export const ComstomInputNumber: FC<
  InputNumberProps & { item: ComstomInputNumberType }
> = ({ item, ...props }) => (
  <InputNumber
    stringMode
    controls={false}
    disabled={item?.disabled}
    placeholder={item?.placeholder}
    maxLength={item?.maxLength}
    style={{ width: '100%' }}
    min={item?.min}
    max={item?.max}
    // precision={item.precision}
    step={item?.step}
    addonAfter={item?.addonAfter ? item?.addonAfter : ''}
    {...props}
  />
);
export interface ComstomDatePickerType {
  disabled: boolean;
}
export const ComstomDatePicker: FC<{ item: ComstomDatePickerType }> = ({
  item,
  ...props
}) => (
  <DatePicker style={{ width: '100%' }} disabled={item.disabled} {...props} />
);
interface ComstomRadioType {
  disabled: boolean;
  options: { dictValue: string; dictLabel: string; disabled?: boolean }[];
}
export const ComstomRadio: FC<{ item: ComstomRadioType } & RadioProps> = ({
  item,
  ...props
}) => (
  <Radio.Group disabled={item.disabled} {...props}>
    {item.options?.map(it => (
      <Radio key={it.dictValue} value={it.dictValue}>
        {it.dictLabel}
      </Radio>
    ))}
  </Radio.Group>
);
interface ComstomCheckBoxType {
  disabled: boolean;
  options: { dictValue: string; dictLabel: string; disabled?: boolean }[];
}
export const ComstomCheckBox: FC<{ item: ComstomCheckBoxType }> = ({
  item,
  ...props
}) => (
  <Checkbox.Group disabled={item.disabled} {...props}>
    {item.options?.map(it => (
      <Checkbox disabled={it.disabled} key={it.dictValue} value={it.dictValue}>
        {it.dictLabel}
      </Checkbox>
    ))}
  </Checkbox.Group>
);

type SelectProp = SelectProps<SelectValue>;
export interface ComstomSelectType {
  options: {
    dictValue: string;
    dictLabel: string;
    disabled?: boolean;
    relatedValue?: string;
  }[];
}
export const ComstomSelect: FC<
  Partial<SelectProp> & { item: Partial<ComstomSelectType & CommonInterface> }
> = ({ item, ...props }) => {
  const { options, ...p } = item;
  return (
    // @ts-ignore
    <Select {...props} {...p}>
      {options
        ? options?.map(tem => (
            <Select.Option key={tem.dictValue} value={String(tem.dictValue)}>
              {tem.dictLabel}
            </Select.Option>
          ))
        : []}
    </Select>
  );
};
export const ComstomCascader: FC<
  Partial<SelectProp> & { item: Partial<ComstomSelectType & CommonInterface> }
> = ({ item, ...props }) => {
  const { options, ...p } = item;
  return (
    // @ts-ignore
    <Cascader
      fieldNames={{
        value: 'dictValue',
        label: 'dictLabel',
        children: 'enumList',
      }}
      {...props}
      {...p}
      {...item}
    />
  );
};

//
export const ComstomAddTable: FC<{ item }> = ({ item, ...props }) => {
  // @ts-ignore   // fixme 待补充类型
  const { tableData, changeTableData, form, changeDataValue, dataValue } =
    useContext(TableContact);
  const [currentTableData, changeCurrentTableData] = useState<
    | {
        id: string | null;
        roomType: string | null /** 房间类型 */;
        roomArea: string | null /** 房间面积 */;
        heatingDay: string | null /** 采暖天数 */;
      }[]
    | {
        id: string | null;
        power: string | null /** 功率 */;
        quantity: string | null /** 数量 */;
        runTime: string | null /** 运行时间 */;
      }[]
    | {
        id: string | null;
        coolType: string | null /** 制冷剂类型 */;
        addPotentiality: string | null /** 增温潜势 */;
        loadingLevel: string | null /** 填充量 */;
        lifetime: string | null /** 寿命 */;
      }[]
  >([]);
  useEffect(() => {
    changeCurrentTableData([...tableData[item.name]]);
  }, [tableData]);
  const [pageType] = useState('');
  const addColumn = (): ColumnsType<any> =>
    creatColumns(item, tableData, changeTableData, pageType);
  const renderTableFn = () => (
    <>
      {/* {JSON.stringify(currentTableData)} */}
      <Table
        style={{ width: '100%', border: '0' }}
        scroll={{ x: 900 }}
        bordered
        className='SearchTable'
        dataSource={currentTableData}
        columns={addColumn()}
        pagination={false}
        key={item.name}
        {...props}
        rowKey={it => it.id || `${item.name}}`}
      />
    </>
  );
  return (
    <>
      {renderTableFn()}
      {pageType === 'detail' ? (
        ''
      ) : (
        <div
          className='add-linkman'
          style={{ marginBottom: '30px' }}
          // eslint-disable-next-line consistent-return
          onClick={() => {
            if (tableData[item.name].length >= 50)
              return Toast(
                'error',
                I18N.carbonNeutral.maximumNumberOfDataEntries,
              );

            const arr = tableData[item.name];
            const obj = {};
            Object.keys(arr[0]).forEach(item => {
              obj[item] = null;
            });
            arr.push(obj);
            changeTableData({
              ...tableData,
              [item.name]: arr,
            });
            changeDataValue({
              ...dataValue,
              ...tableData,
            });
            form.setFieldsValue({
              ...form.getFieldsValue(true),
              ...tableData,
            });
          }}
        >
          <Button type='link' icon={<PlusOutlined />}>
            {I18N.carbonNeutral.newDataAdded}
          </Button>
        </div>
      )}
    </>
  );
};
