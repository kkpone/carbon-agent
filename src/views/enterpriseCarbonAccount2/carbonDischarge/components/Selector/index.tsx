/*
 * @@description: 仅适用于 碳核算 记录方式 、部门  // todo 接口、数据处理外置
 * 目前仅考虑单选下的适配
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 21:27:49
 */
import I18N from '@src/lang/I18N';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import IconFont from '@components/iconfont';
import { connect, mapProps, mapReadPretty, observer } from '@formily/react';
import { isArr, isValid } from '@formily/shared';
import { Select, Option } from '@src/components/Select';
import { GET9f98ab73509d2186fc4d4ad1876a7223 } from '@src/sdks_v2/enterpriseV2ApiDocs';
import { Toast } from '@src/utils/Toast';
import {
  apiAddLabel,
  apiRemoveLabel,
} from '@src/views/enterpriseCarbonAccount2/service';
import { Divider, Input, Spin } from 'antd';
import { SelectProps } from 'antd/lib/select';
import classNames from 'classnames';
import {
  ChangeEvent,
  memo,
  useState,
  type FC,
  type PropsWithChildren,
  useEffect,
} from 'react';

import styles from './index.module.less';
import { Options, Props, SelectType, ValueTypes, DataType } from './types';

const Selector = memo(
  <T = Options[] | string[], ValueType = ValueTypes>({
    placeholder,
    onChange,
    type,
    value,
    className,
    filterOption,
    ...props
  }: Props<ValueType, T>) => {
    /** 活动数据记录方式 0   活动数据保存部门 1  排放因子来源 2 */
    const code = type;
    const [depAndActivityData, setDepAndActivityData] = useState<DataType>({
      0: [],
      1: [],
      2: [],
    });
    const options = depAndActivityData[type]?.map((d, index) => ({
      label: d.labelname,
      value: index,
      id: d.sourceLabelId,
      user: d.flag,
    }));

    // eslint-disable-next-line consistent-return
    const onAddItem = async (label: string) => {
      // 不允许添加相同数据
      if (depAndActivityData?.[type]?.find(l => l.labelname === label))
        return Toast('warn', I18N.enterpriseCarbonAccount2.pleaseDoNotAddAgain);

      await apiAddLabel({
        type: code,
        labelname: label,
      });

      getDepAndActivity(code);
    };

    const onDelItem = async (sourceLabelId: string | number) => {
      await apiRemoveLabel({
        sourceLabelId,
      });

      getDepAndActivity(code);
    };
    /** 活动数据记录方式 0   活动数据保存部门 1  排放因子来源 2 */
    const getDepAndActivity = (type: SelectType) => {
      GET9f98ab73509d2186fc4d4ad1876a7223({ type }).then(({ data }) => {
        if (data?.length) {
          setDepAndActivityData(s => ({ ...s, [code]: data }));
        }
      });
    };
    const [inputItem, setInputItem] = useState('');
    const [loading, setLoading] = useState(false);
    const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
      setInputItem(event.target.value);
    };

    const onValueChange = (val?: ValueTypes) => {
      onChange?.(val);
    };
    useEffect(() => {
      getDepAndActivity(code);
    }, []);
    return (
      <Select<ValueType, T>
        className={classNames(styles.selectWrapper, className)}
        // @ts-ignore
        value={value}
        showSearch={!!filterOption}
        filterOption={filterOption}
        placeholder={
          placeholder || I18N.enterpriseCarbonAccount2.dropdownSelectionAlso
        }
        listItemHeight={10}
        listHeight={160}
        {...props}
        // open
        // eslint-disable-next-line react/no-unstable-nested-components
        dropdownRender={menus => (
          <div>
            <Spin spinning={loading}>
              {menus}
              {!!onAddItem && (
                <>
                  <Divider style={{ margin: '4px 0' }} />
                  <div className={styles.addItemWrapper}>
                    <Input
                      value={inputItem}
                      maxLength={1000}
                      style={{ flex: 'auto', height: 34 }}
                      onChange={onNameChange}
                    />
                    <span
                      className={styles.addButton}
                      onClick={() => {
                        if (inputItem.trim()) {
                          setLoading(true);
                          onAddItem(inputItem)
                            ?.then(() => {
                              setInputItem('');
                            })
                            .finally(() => setLoading(false));
                        }
                      }}
                    >
                      <PlusOutlined /> {I18N.carbonFootprint.add}
                    </span>
                  </div>
                </>
              )}
            </Spin>
          </div>
        )}
        // @ts-ignore
        onChange={val => onValueChange(val)}
      >
        {(options as unknown as Options[])?.map(item => {
          const { label, value: val, user, disabled, id } = item;
          return (
            <Option
              value={label}
              key={val}
              disabled={disabled}
              className={styles.select}
            >
              {label}
              {!!user && onDelItem && (
                <IconFont
                  className={styles.closeIcon}
                  onClick={ev => {
                    ev.stopPropagation();
                    if (value === +val || value === label) {
                      onValueChange(undefined);
                    }
                    if (onDelItem) {
                      setLoading(true);
                      onDelItem(+id).finally(() => {
                        setLoading(false);
                      });
                    }
                  }}
                  type='icon-icon-guanbi'
                />
              )}
            </Option>
          );
        })}
      </Select>
    );
  },
);
const SelectPreview: FC<
  PropsWithChildren<SelectProps<any> & { isShare: boolean }>
> = observer(props => {
  const prefixCls = 'antd';
  // @ts-ignore
  const { type } = props;
  /** 活动数据记录方式 0   活动数据保存部门 1  排放因子来源 2 */
  const code = type;
  const [depAndActivityData, setDepAndActivityData] = useState<DataType>({
    0: [],
    1: [],
    2: [],
  });
  const dataSource = depAndActivityData[type]?.map(d => ({
    label: d.labelname,
    value: String(d.sourceLabelId),
    user: d.flag,
  }));
  useEffect(() => {
    if (props.isShare) {
      return;
    }
    /** 活动数据记录方式 0   活动数据保存部门 1  排放因子来源 2 */
    GET9f98ab73509d2186fc4d4ad1876a7223({ type }).then(({ data }) => {
      if (data?.length) {
        setDepAndActivityData(s => ({ ...s, [code]: data }));
      }
    });
  }, [code]);
  const placeholder = I18N.carbonFootprint.pleaseSelect;
  const getSelected = () => {
    const { value } = props;
    if (props.mode === 'multiple' || props.mode === 'tags') {
      if (props.labelInValue) {
        return isArr(value) ? value : [];
      }
      return isArr(value) ? value.map(val => ({ label: val, value: val })) : [];
    }
    if (props.labelInValue) {
      return isValid(value) ? [value] : [];
    }
    return isValid(value) ? [{ label: value, value }] : [];
  };

  const getLabel = (target: any) => {
    const labelKey = props.fieldNames?.label || 'label';
    return (
      dataSource?.find(item => {
        const valueKey = props.fieldNames?.value || 'value';
        // eslint-disable-next-line
        return item[valueKey] == target?.value;
      })?.[labelKey] ||
      target.label ||
      placeholder
    );
  };

  const getLabels = () => {
    const selected = getSelected();
    if (!selected.length) return placeholder;
    if (selected.length === 1) return getLabel(selected[0]);
    return selected.map(item => getLabel(item));
  };
  return (
    <div
      className={classNames(prefixCls, styles.readPretty, props.className)}
      style={props.style}
    >
      {getLabels()}
    </div>
  );
});
export const SelectFormily = connect(
  Selector,
  mapProps({}, (props, field) => ({
    ...props,
    suffixIcon:
      // @ts-ignore
      field?.loading || field?.validating ? (
        <LoadingOutlined />
      ) : (
        props.suffixIcon
      ),
  })),
  mapReadPretty(SelectPreview),
);
