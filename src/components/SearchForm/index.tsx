/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-28 10:45:13
 * @Date: 2023-02-21 09:50:20
 * @@description:
 */
/**
 * 表格上搜索的组件
 * @returns
 */
// import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Form } from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import { useEffect, useMemo } from 'react';

import styles from './index.module.less';
import { FromUtilSearchProps } from './type';
import { utilGetUrlParams } from './util';
import { getFormItem } from '../FormUtil/FormItemUtilItem';
import IconFont from '../iconfont';

const SearchFormUtil = (props: FromUtilSearchProps) => {
  const {
    antdFormProps,
    searchSub,
    resetBack,
    formItems,
    useSearch = true,
    showReset = true,
    searchButtonProps,
    resetButtonProps,
  } = props;
  /** 记录表单数据中是否含有日期组件 */
  const dateFormItem = useMemo(
    () => formItems.filter(f => ['date', 'dateRange'].includes(f.type)),
    [formItems],
  );
  /**
   * 获取路径上面的查询数据
   */
  const getUrlParams = () => {
    const urlSearch = utilGetUrlParams('search');
    if (urlSearch) {
      const paramsJSON: { [x: string]: string | number } =
        JSON.parse(urlSearch);
      dateFormItem.forEach(f => {
        if (f.type === 'date' && paramsJSON[f.name]) {
          const momentTime = moment(paramsJSON[f.name]);
          // @ts-ignore
          paramsJSON[f.name] = momentTime.isValid() ? momentTime : undefined;
        }
        if (f.type === 'dateRange' && paramsJSON[f.name]) {
          const momentTime = (paramsJSON[f.name] as unknown as string[]).map(
            t => moment(t),
          );

          // @ts-ignore
          paramsJSON[f.name] = momentTime.some(t => !t.isValid())
            ? undefined
            : momentTime;
        }
      });

      return paramsJSON;
    }
    return undefined;
  };

  /** 初始化 --- 获取路径上面的查询信息 */
  const initSearchParams = () => {
    const data = getUrlParams();
    if (!data) return;
    antdFormProps.form?.setFieldsValue(data);
  };
  /** 点击查询功能 */
  const doSearch = () => {
    if (useSearch) {
      const originUrlSearchParams = new URLSearchParams(location.search);
      originUrlSearchParams.delete('search');
      originUrlSearchParams.delete('pageData');
      const originUrlSearchParamsString = originUrlSearchParams.toString();
      /** 拿去连接上的分页参数 */
      const urlPage = new URLSearchParams(location.search).get('pageData');
      let urlParamsData = `?pageData=${urlPage}`;
      /** 拿去链接上的查询参数 */
      // const urlSearch = new URLSearchParams(location.search).get('search');
      /** 判断搜索输入框和表格是否都没有查询条件，优先级关系：先以searchParams的查询条件为最高 次之的是页面上的参数 */
      /** 只有不是重置的状态下才能进行链接拼接 */
      const values = antdFormProps.form?.getFieldsValue();
      urlParamsData = `${urlParamsData}&search=${JSON.stringify(values)}${
        originUrlSearchParamsString ? `&${originUrlSearchParamsString}` : ''
      }`;
      window.history.replaceState(null, '', urlParamsData);
    }

    searchSub();
  };

  /** 重置当前搜索条件 */
  const doReset = () => {
    const originUrlSearchParams = new URLSearchParams(location.search);
    originUrlSearchParams.delete('search');
    originUrlSearchParams.delete('pageData');
    const originUrlSearchParamsString = originUrlSearchParams.toString();
    /** 拿去连接上的分页参数 */
    const urlPage = new URLSearchParams(location.search).get('pageData');
    const urlParamsData = `?pageData=${urlPage}${
      originUrlSearchParamsString ? `&${originUrlSearchParamsString}` : ''
    }`;
    window.history.replaceState(null, '', urlParamsData);
    resetBack && resetBack();
  };
  /**
   * 初始化
   */
  const init = () => {
    initSearchParams();
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <div className={classnames(props.wrapperClassName)}>
      <Form
        {...antdFormProps}
        className={classnames(antdFormProps.className, styles.searchForm)}
      >
        {props.formItems.map(item => (
          <Form.Item
            aria-label={item.name}
            className={item?.className}
            label={item.label}
            key={item.name}
            name={item.name}
            rules={[
              {
                required: false,
              },
            ]}
          >
            {!item.noShow ? getFormItem({ item }) : undefined}
          </Form.Item>
        ))}
        <div className={styles.buttonContent}>
          <Button
            {...searchButtonProps}
            className={classnames(searchButtonProps?.className)}
            htmlType='submit'
            onClick={doSearch}
          >
            {/* <SearchOutlined /> */}
            <IconFont type='icon-icon-zhaxun-1' className='search-box' />
            {I18N.carbonNeutral.query}
          </Button>
          {showReset ? (
            <Form.Item>
              <Button
                onClick={doReset}
                htmlType='reset'
                type='default'
                {...resetButtonProps}
              >
                <IconFont type='icon-icon-tongzhi-1' className='search-box' />
                {I18N.carbonFootprint3.reset}
              </Button>
            </Form.Item>
          ) : (
            ''
          )}
        </div>
      </Form>
    </div>
  );
};

export default SearchFormUtil;
