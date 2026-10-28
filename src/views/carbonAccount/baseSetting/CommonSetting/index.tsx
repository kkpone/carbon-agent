/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-11-22 14:13:52
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-02 15:42:39
 */
/**
 * @file 碳账户 - 通用设置
 * @author qifeng
 */

import I18N from '@src/lang/I18N';
import { FormActions } from '@src/components/FormActions';
import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import { Table } from '@src/components/Table';
import { TableRef } from '@src/components/TableUtil/types/common';
import { CardTabsBase } from '@src/components/Tabs/CardTabsBase';
import {
  editRankListUsingPOSTDefaultApi,
  initUsingGETDefaultApi,
  RankDto,
  rankListUsingGETDefaultApi,
} from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import { Checkbox, Form, FormProps, Radio } from 'antd';
import classNames from 'classnames';
import { compact, difference, isNil } from 'lodash-es';
import { Key, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ButtonSetting from './ButtonSetiing';
import { ranksColumns } from './columns';
import style from './index.module.less';
import Grade from '../Grade';
import InviteCode from '../InvitationCode';
import { ApiAuditEdit } from '../service';

const CommonSetting = () => {
  const [activeKey, setActiveKey] = useState<string>('ranks');
  const [timeList, setTimeList] = useState<RankDto[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const history = useHistory();

  const tableRef = useRef<TableRef>();

  const changeSort = (val: string, record: any) => {
    const newTimeList = timeList.map(t => {
      if (t.id === record.id) {
        return {
          ...t,
          sort: +val,
        };
      }
      return { ...t };
    });
    // 前台不需要排序
    // const sortedList = sortBy(newTimeList, ['sort']);

    setTimeList(newTimeList);
  };
  const [auditForm] = Form.useForm();
  const auditFormProps: FormProps = {
    ...formPropsInit(),
    form: auditForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };

  useEffect(() => {
    tableRef.current?.reset();
  }, [timeList]);

  useEffect(() => {
    if (activeKey === 'ranks') {
      rankListUsingGETDefaultApi().then(({ data }) => {
        const resdata = (data?.data || []) as RankDto[];
        setTimeList(resdata);
        // "checkStatus": 0, //选中状态 0 未选中 1 选中 默认0
        setSelectedKeys(compact(resdata?.map(d => d.checkStatus && d.id)));
      });
    }
    if (activeKey === 'audit') {
      initUsingGETDefaultApi().then(res => {
        const resp = res.data.data as unknown as Record<string, any>;

        auditForm.setFieldsValue({
          audit: res.data.data?.audit,
          auditInformation: resp.auditInformation,
          nonEmployeeAuditInformation: resp.nonEmployeeAuditInformation,
          differentiateEmployee: isNil(resp.differentiateEmployee)
            ? 1
            : resp.differentiateEmployee,
        });
      });
    }
  }, [activeKey]);

  return (
    <div className='wrapper'>
      <CardTabsBase
        type='line'
        defaultActiveKey={activeKey}
        onChange={key => {
          setActiveKey(key);
        }}
        tabPane={compact([
          {
            key: 'ranks',
            tab: I18N.carbonAccount.rankingList,
          },
          checkPermissions(
            {
              key: 'inviteCode',
              tab: I18N.carbonAccount.invitationCode,
            },
            'carbonAccount:company:init',
          ),
          checkPermissions(
            {
              key: 'grade',
              tab: I18N.carbonAccount.levelSetting,
            },
            'carbonAccount:user:levelInfo',
          ),
          checkPermissions(
            {
              key: 'audit',
              tab: I18N.carbonAccount.auditConfiguration,
            },
            'carbonAccount:user:auditSwitch',
          ),
          {
            key: 'buttonSetting',
            tab: I18N.carbonAccount.buttonConfiguration,
          },
        ])}
      />
      {activeKey === 'grade' && <Grade />}
      {activeKey === 'inviteCode' && <InviteCode />}
      {activeKey === 'ranks' && (
        <div className={style.ranksWrapper}>
          <div className={style.ranksTip}>{I18N.carbonAccount.selectMiniProgram}</div>
          <Table
            cRef={tableRef}
            className={style.table}
            columns={ranksColumns({ changeSort })}
            rowKey='id'
            rowSelection={{
              columnWidth: 100,
              checkStrictly: false,
              columnTitle: (
                <Checkbox
                  checked={timeList?.every(t =>
                    selectedKeys.includes(t.id as Key),
                  )}
                  onChange={ev => {
                    const isChecked = ev.target.checked;
                    if (isChecked) {
                      setSelectedKeys(timeList.map(t => t.id) as Key[]);
                    } else {
                      setSelectedKeys([]);
                    }
                  }}
                >
                  {I18N.components.selectAll}</Checkbox>
              ),
              selectedRowKeys: selectedKeys,
              onSelect(record) {
                if (selectedKeys.includes(record.id as Key)) {
                  setSelectedKeys(difference(selectedKeys, [record.id as Key]));
                } else {
                  setSelectedKeys(s => [...s, record.id as Key]);
                }
              },
              type: 'checkbox',
              renderCell(checked, _, a, originNode) {
                return <div className={style.alignLeft}>{originNode}</div>;
              },
            }}
            // @ts-ignore
            returnFetchApi={() => ({
              data: timeList,
              total: 1,
            })}
            // @ts-ignore
            fetchApi={() => {}}
            pagination={false}
          />

          <FormActions
            place='center'
            buttons={[
              {
                title: I18N.carbonFootprint.confirm2,
                type: 'primary',
                onClick: async () => {
                  if (!selectedKeys.length) {
                    Toast('error', I18N.carbonAccount.selectAtLeastOne);
                    return Promise.resolve();
                  }
                  const sortNum: Record<number | 'isSameValue', boolean> = {
                    isSameValue: false,
                  };

                  timeList.forEach(item => {
                    if (item.sort && sortNum[item.sort])
                      sortNum.isSameValue = true;
                    sortNum[item.sort || 0] = true;
                  });
                  if (sortNum.isSameValue) {
                    Toast('error', I18N.carbonAccount.sortValuesNot);
                    return Promise.resolve();
                  }
                  return editRankListUsingPOSTDefaultApi(
                    timeList.map(t => {
                      if (selectedKeys.includes(t.id as Key)) {
                        return { ...t, checkStatus: 1 } as unknown as RankDto;
                      }
                      return {
                        ...t,
                        checkStatus: 0,
                      } as unknown as RankDto;
                    }),
                  ).then(({ data }) => {
                    if (data?.code === 200) Toast('success', I18N.carbonFootprint.modifiedSuccessfully);
                  });
                },
                permission: 'carbonAccount:user:auditSwitch',
              },
              {
                title: I18N.carbonFootprint.cancel,
                onClick: async () => {
                  history.go(-1);
                },
              },
            ]}
          />
        </div>
      )}
      {activeKey === 'audit' && (
        <div className={style.rauditWrapper}>
          <Form {...auditFormProps}>
            <div className={classNames(style.auditTit)}>
              {I18N.carbonAccount.whetherToDifferentiatePersonnel}</div>
            <Form.Item name='differentiateEmployee'>
              <Radio.Group
                options={[
                  { label: I18N.carbonNeutral.yes, value: 1 },
                  { label: I18N.carbonNeutral.no, value: 0 },
                ]}
                onChange={() => {
                  auditForm.setFieldsValue({
                    auditInformation: ['realName', 'mobile', 'jobNumber'],
                    nonEmployeeAuditInformation: ['realName', 'mobile'],
                  });
                }}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {() => (
                <div className={classNames(style.auditTit)}>
                  {I18N.carbonFootprint.pleaseSelect}{auditForm.getFieldValue('differentiateEmployee') === 1
                    ? I18N.carbonAccount.staff
                    : I18N.carbonAccount.user}
                  {I18N.carbonAccount.informationNeedsToBeFilledIn}</div>
              )}
            </Form.Item>

            <Form.Item name='auditInformation'>
              <Checkbox.Group
                options={[
                  { label: I18N.system.name, value: 'realName' },
                  { label: I18N.carbonFootprint3.contactInformation, value: 'mobile' },
                  { label: I18N.carbonAccount.employeeId, value: 'jobNumber' },
                ]}
              />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {() =>
                auditForm.getFieldValue('differentiateEmployee') === 1 ? (
                  <>
                    <div className={classNames(style.auditTit)}>
                      {I18N.carbonAccount.pleaseSelectNonEmployee}</div>
                    <Form.Item name='nonEmployeeAuditInformation'>
                      <Checkbox.Group
                        options={[
                          { label: I18N.system.name, value: 'realName' },
                          { label: I18N.carbonFootprint3.contactInformation, value: 'mobile' },
                        ]}
                      />
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>
          </Form>
          <FormActions
            place='center'
            buttons={[
              {
                title: I18N.carbonFootprint.confirm2,
                type: 'primary',
                onClick: async () => {
                  auditForm.validateFields().then(value => {
                    ApiAuditEdit({
                      ...value,
                      auditInformation: Array.isArray(value.auditInformation)
                        ? value.auditInformation.join(',')
                        : undefined,
                      nonEmployeeAuditInformation: Array.isArray(
                        value.nonEmployeeAuditInformation,
                      )
                        ? value.nonEmployeeAuditInformation.join(',')
                        : undefined,
                    }).then(res => {
                      if (res.data.code === 200) {
                        Toast('success', res.data.msg);
                      }
                    });
                  });
                },
              },
              {
                title: I18N.carbonFootprint.cancel,
                onClick: async () => {
                  history.go(-1);
                },
              },
            ]}
          />
        </div>
      )}
      {activeKey === 'buttonSetting' && <ButtonSetting />}
    </div>
  );
};

export default CommonSetting;
