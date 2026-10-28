/**
 * @file 等级设置
 * @author qifeng
 */

import I18N from '@src/lang/I18N';
import { Button } from '@src/components/Button';
import { Page } from '@src/components/Page';
import { checkPermissions } from '@src/components/Permission/utils';
import { Table } from '@src/components/Table';
import { TableRef } from '@src/components/TableUtil/types/common';
import {
  levelInfoUsingGETUserControllerApi,
  LevelInfoResp,
  LevelDto,
  editLevelInfoUsingPOSTUserControllerApi,
} from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import { Card, Form, Switch } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import { gradeLevelColumn, upgradeLevelColumn } from './utils';

function Grade() {
  const [gradeEdit, setGradeEdit] = useState(false);

  const switchProps = {
    checkedChildren: I18N.carbonAccount.open2,
    unCheckedChildren: I18N.carbonFootprint3.close,
  };
  const gradeLevelTablel = useRef<TableRef>();
  const gradeCoinRef = useRef<TableRef>();
  const tableUpdate = () => {
    setTimeout(() => {
      gradeCoinRef.current?.reset();
      gradeLevelTablel.current?.reset();
    }, 200);
  };
  const [tableData, setTableData] = useState<LevelInfoResp | undefined>();

  const getGradeInfo = async () =>
    levelInfoUsingGETUserControllerApi().then(({ data }) => {
      setTableData(data?.data);

      tableUpdate();
    });

  const getTableData = async () => Promise.resolve(tableData?.levelList);
  const [form] = useForm();
  useEffect(() => {
    getGradeInfo();
  }, []);
  const tableProps = {
    // @ts-ignore
    returnFetchApi: data => ({
      data,
      // @ts-ignore
      count: data?.length || 0,
    }),
    // @ts-ignore
    fetchApi: () => getTableData(),
    pagination: false,
    bordered: false,
  };
  return (
    <Page wrapperClassName={styles.themesDetail}>
      <div className={styles.main}>
        <Card className={styles.top}>
          <h3 className={styles.title}>{I18N.carbonAccount.topicInformation}</h3>
          {/* @ts-ignore */}
          <Table
            cRef={gradeLevelTablel}
            columns={[...gradeLevelColumn()]}
            {...tableProps}
          />
        </Card>
        <Card className={styles.bottom}>
          <h3 className={styles.title}>
            {I18N.carbonAccount.upgradeSettings}{checkPermissions(
              <Button
                type='primary'
                onClick={async () => {
                  if (!gradeEdit) {
                    setGradeEdit(!gradeEdit);
                    tableData?.levelList?.forEach(v => {
                      form.setFieldsValue({ [`v${v.level}`]: v.rewardScore });
                    });
                  }
                  if (gradeEdit) {
                    form
                      .validateFields()
                      .then(() =>
                        editLevelInfoUsingPOSTUserControllerApi({
                          ...tableData,
                        })
                          .then(({ data }) => {
                            if (data?.code === 200) {
                              Toast('info', I18N.carbonAccount.dataUpdatedTo);
                              setGradeEdit(!gradeEdit);
                            }
                          })
                          .finally(() => getGradeInfo()),
                      )
                      .catch(err => {
                        // eslint-disable-next-line
                        console.log(err);
                      });
                  }
                  return Promise.resolve('');
                }}
              >
                {gradeEdit ? I18N.carbonFootprint.preserve : I18N.carbonFootprint.edit}
              </Button>,
              'carbonAccount:user:editLevelInfo',
            )}
          </h3>
          <div className={styles.upgradeSwiches}>
            <div className={styles.mgt_20}>
              {I18N.carbonAccount.upgradePopUp}{gradeEdit ? (
                <Switch
                  {...switchProps}
                  checked={!!tableData?.upgradeNotice}
                  onChange={ev => {
                    // @ts-ignore   number 值，没有必要再引入枚举
                    setTableData(s => ({ ...s, upgradeNotice: +ev }));
                  }}
                />
              ) : (
                <span>{tableData?.upgradeNotice ? I18N.carbonAccount.open : I18N.carbonAccount.shut}</span>
              )}
            </div>
            <div className={styles.mgt_20}>
              {I18N.carbonAccount.upgradeCarbonCoinAward}{gradeEdit ? (
                <Switch
                  {...switchProps}
                  checked={!!tableData?.upgradeCoin}
                  onChange={ev => {
                    // @ts-ignore  number 值，没有必要再引入枚举
                    setTableData(s => ({ ...s, upgradeCoin: +ev }));
                  }}
                />
              ) : (
                <span>{tableData?.upgradeCoin ? I18N.carbonAccount.open : I18N.carbonAccount.shut}</span>
              )}
            </div>
          </div>
          {!!tableData?.upgradeCoin && (
            <Form form={form}>
              {/*  @ts-ignore*/}
              <Table<LevelDto, LevelDto[]>
                cRef={gradeCoinRef}
                columns={[
                  ...upgradeLevelColumn({
                    isEdit: gradeEdit,
                    onValueChange(v, record) {
                      record.rewardScore = +v || 0;
                      setTableData(s => ({ ...s }));
                    },
                  }),
                ]}
                {...tableProps}
              />
            </Form>
          )}
        </Card>
      </div>
    </Page>
  );
}

export default Grade;
