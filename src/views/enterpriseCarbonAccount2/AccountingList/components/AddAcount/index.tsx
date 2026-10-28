import { PlusOutlined } from '@ant-design/icons';
import { FormActions } from '@src/components/FormActions';
import { SKU_STATUS } from '@src/components/SkuCountLabel/constant';
import { SkuCount } from '@src/components/SkuCountLabel/type';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import {
  COMPUTATION_PERIOD,
  COMPUTATION_PERIOD_LABEL,
} from '@src/views/enterpriseCarbonAccount2/constant';
import { GWPinfo } from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import { pick } from 'lodash-es';
import moment from 'moment';
import { ReactElement, useEffect, useState } from 'react';

import { ACCOUNT_WAY } from '@/views/enterpriseCarbonAccount2/AccountingSetting/constant';

import styles from './index.module.less';
import { getAccountSetting } from '../../service';
import { AccountSetting, Employ, SimpleOrg } from '../../type';
import EmailInput from '../EmailInput';
import EmploySelectModal from '../EmploySelectModal';
import OrgSelectModal from '../OrgSelectModal';

interface AddDrawerContentProps<T extends number | undefined = undefined> {
  computationId?: T;
  cYear: string;
  skuCount: SkuCount;
  accountWay: number;
  onInnerOrgListChange: (count: number, orgList: SimpleOrg[]) => void;
  onClose: () => void;
  onConfirm: (data: AccountSetting) => Promise<void> | void;
}

export const AddDrawerContent: <T extends number | undefined>(
  props: AddDrawerContentProps<T>,
) => ReactElement = props => {
  const {
    cYear: cYearFormProps,
    skuCount,
    accountWay,
    onInnerOrgListChange,
    onClose,
    onConfirm,
  } = props;

  const [accountSetting, setAccountSetting] = useState<AccountSetting>({
    cYear: cYearFormProps,
    timeType: COMPUTATION_PERIOD.YEAR,
    gwp: '2',
    orgList: [],
  });

  const [loading, setLoading] = useState(false);

  const [orgModalVisible, setOrgModalVisible] = useState(false);

  const [innerOrgList, setInnerOrgList] = useState<SimpleOrg[]>([]);

  const [employModalVisible, setEmployModalVisible] = useState(false);

  const [currOrg, setCurrOrg] = useState<SimpleOrg | null>(null);

  const { cYear, timeType, gwp, orgList } = accountSetting;

  const copyAccountSetting = () => {
    Modal.confirm({
      width: 480,
      className: styles.confirmModal,
      title: (
        <div className={styles.confirmModalTitle}>
          {I18N.enterpriseCarbonAccount2.copyThePreviousYear2}
        </div>
      ),
      content: (
        <div className={styles.confirmModalContent}>
          <span>{I18N.enterpriseCarbonAccount2.copyThePreviousYear}</span>
          <span className={styles.confirmModalWarnText}>
            {I18N.enterpriseCarbonAccount2.organizationalScopeAnd}
          </span>
          <span>
            {I18N.enterpriseCarbonAccount2.accountingManagementConfirmation}
          </span>
        </div>
      ),
      maskClosable: true,
      okButtonProps: {
        className: styles.confirmModalBtn,
      },
      onOk: async () => {
        const { data } = await getAccountSetting({
          cYear: accountSetting.upYear || '',
        });

        if (data.data) {
          setAccountSetting({
            ...accountSetting,
            ...pick(data.data, ['gwp', 'timeType']),
            copy: true,
          });
          setInnerOrgList(data.data.orgList || []);
        }
      },
    });
  };

  const onTimeTypeChange = (timeTypeVal: number) => {
    if (accountSetting.copy || accountSetting.orgList.length === 0) {
      setAccountSetting({
        ...accountSetting,
        timeType: timeTypeVal,
      });
    } else {
      Modal.confirm({
        width: 480,
        className: styles.confirmModal,
        title: (
          <div className={styles.confirmModalTitle}>
            {I18N.enterpriseCarbonAccount2.modifyAccountingSettings}
          </div>
        ),
        content: (
          <div className={styles.confirmModalContent}>
            {I18N.enterpriseCarbonAccount2.afterSwitching}
          </div>
        ),
        maskClosable: true,
        okButtonProps: {
          className: styles.confirmModalBtn,
        },
        onOk: () => {
          setAccountSetting({
            ...accountSetting,
            timeType: timeTypeVal,
          });
        },
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    getAccountSetting({ cYear: cYearFormProps })
      .then(({ data }) => {
        if (data.data) {
          setAccountSetting({ ...data.data, copy: false });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cYearFormProps]);

  useEffect(() => {
    onInnerOrgListChange(innerOrgList.length, innerOrgList);
  }, [innerOrgList, onInnerOrgListChange]);

  const columns: TableColumnsType<SimpleOrg> = [
    {
      title: I18N.enterpriseCarbonAccount2.accountingOrganization,
      dataIndex: 'orgName',
      ellipsis: true,
      width: 202,
      render: text => (
        <div className={styles.orgName}>
          <IconAlibaba
            className={styles.orgIcon}
            type='icon-icon_hesuanzhuti'
          />
          <span className={styles.orgNameText} title={text}>
            {text}
          </span>
        </div>
      ),
    },
    {
      title: I18N.enterpriseCarbonAccount2.ccEmail,
      dataIndex: 'emailList',
      width: 396,
      render: (_, record) => (
        <div className={styles.emailInputContent}>
          <EmailInput
            className={styles.emailInput}
            value={record.emailList || []}
            onChange={emailList => {
              Object.assign(record, { emailList });
              setAccountSetting({ ...accountSetting });
              setInnerOrgList([...innerOrgList]);
            }}
          />
          <div
            className={styles.selectEmployBtn}
            onClick={() => {
              setCurrOrg(record);
              setEmployModalVisible(true);
            }}
          >
            <PlusOutlined />
            <span>{I18N.Certification.choice}</span>
          </div>
        </div>
      ),
    },
  ];

  const onEmployModalClose = () => {
    setEmployModalVisible(false);
    setCurrOrg(null);
  };

  const onEmployModalConfirm = (employList: Employ[]) => {
    if (currOrg) {
      const inputEmailList = (currOrg.emailList || []).filter(
        ({ userId }) => !userId,
      );
      currOrg.emailList = [
        ...employList,
        ...inputEmailList.filter(({ employEmail }) =>
          employList.every(employ => employ.employEmail !== employEmail),
        ),
      ];

      setAccountSetting({ ...accountSetting });
      setInnerOrgList([...innerOrgList]);
    }
    onEmployModalClose();
  };

  return (
    <Spin spinning={loading}>
      <OrgSelectModal
        visible={orgModalVisible}
        cYear={cYear}
        selectedOrgList={innerOrgList}
        onCancel={() => setOrgModalVisible(false)}
        onConfirm={checkedOrgList => {
          setInnerOrgList(checkedOrgList);
          setOrgModalVisible(false);
        }}
      />
      <EmploySelectModal
        visible={employModalVisible}
        selectedEmployList={(currOrg?.emailList || []).filter(
          ({ userId }) => !!userId,
        )}
        onCancel={onEmployModalClose}
        onConfirm={onEmployModalConfirm}
      />
      <div className={styles.formContent}>
        <Form layout='vertical'>
          <Form.Item
            label={
              <div className={styles.label}>
                {I18N.carbonFootprint3.accountingYear}
              </div>
            }
            required
          >
            {accountWay === ACCOUNT_WAY.CALENDAR_YEAR ? (
              <DatePicker
                className={styles.yearPicker}
                value={moment(`${cYear}`)}
                disabled
                picker='year'
              />
            ) : (
              <Input className={styles.yearPicker} value={cYear} disabled />
            )}

            {accountSetting.canCopy && (
              <div className={styles.historyBtn} onClick={copyAccountSetting}>
                <IconAlibaba
                  className={styles.copyIcon}
                  type='icon-icon_copy'
                />
                <span>{I18N.enterpriseCarbonAccount2.usageHistory}</span>
              </div>
            )}
          </Form.Item>
          <Form.Item
            label={
              <div className={styles.label}>
                {I18N.carbonFootprint.accountingCycle}
              </div>
            }
            required
          >
            <Radio.Group
              value={timeType}
              onChange={e => onTimeTypeChange(e.target.value)}
            >
              {Object.values(COMPUTATION_PERIOD).map(period => (
                <Radio value={period} key={period}>
                  {COMPUTATION_PERIOD_LABEL[period]}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={
              <div className={styles.label}>
                {I18N.enterpriseCarbonAccount2.gwpInformation}
              </div>
            }
            required
          >
            <Select
              value={gwp}
              options={GWPinfo}
              onChange={gwpVal =>
                setAccountSetting({ ...accountSetting, gwp: gwpVal })
              }
            />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 24 }}
            label={
              <div className={styles.label}>
                <span>{I18N.enterpriseCarbonAccount2.organizationalScope}</span>
                <Button type='primary' onClick={() => setOrgModalVisible(true)}>
                  {I18N.enterpriseCarbonAccount2.selectOrganization}
                </Button>
              </div>
            }
            required
          >
            <Table
              rowKey='orgId'
              // scroll={{ x: 688 }}
              columns={columns}
              dataSource={[...orgList, ...innerOrgList]}
              bordered={false}
              pagination={false}
            />
          </Form.Item>
        </Form>
      </div>
      <FormActions
        place='center'
        width={688}
        buttons={[
          {
            type: 'primary',
            title: I18N.carbonFootprint.confirm,
            disabled:
              skuCount.status !== SKU_STATUS.UN_LIMIT &&
              skuCount.useCount + innerOrgList.length > skuCount.total,
            onClick: async () => {
              await onConfirm({
                ...accountSetting,
                orgList: [...accountSetting.orgList, ...innerOrgList],
              });
              onClose();
            },
          },
          {
            title: I18N.carbonFootprint.cancel,
            onClick: onClose,
          },
        ]}
      />
    </Spin>
  );
};
