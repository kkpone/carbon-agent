import {
  FormItem,
  FormGrid,
  Input,
  Cascader,
  DatePicker,
  NumberPicker,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import emptyImg from '@src/assets/svg/empty.svg';
import { BuildModelList } from '@src/components/CarbonFootprintAccount/BuildModelMainData/BuildModelList';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import useFieldUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { regexpDecimalsNum } from '@src/utils/regs';
import { getAccountInfoData } from '@src/views/supplyChain/service';
import { Button, Modal } from 'antd';
import { isNil } from 'lodash-es';
import moment, { Moment } from 'moment';
import {
  ForwardRefRenderFunction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import styles from './index.module.less';
import { editSnapshootAccount } from './service';
import { CARBON_DATA_FILL_TYPE, CARBON_DATA_STATUS } from '../../constant';
import { AccountInfo, CarbonData } from '../../type';

const { MATCH, FILL, MODEL_SHARE } = CARBON_DATA_FILL_TYPE;

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Cascader,
    DatePicker,
    NumberPicker,
  },
});

const AccountBasicInfoModal = (props: {
  visible: boolean;
  carbonData: CarbonData;
  accountInfo: AccountInfo;
  onCancel: () => void;
  onConfirm: (data: {
    amount: number;
    accountName: string;
    endTime: string;
    unitCode: string;
    unitName: string;
  }) => Promise<void>;
}) => {
  const [loading, setLoading] = useState(false);

  const { visible, carbonData, accountInfo, onCancel, onConfirm } = props;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const form = useMemo(() => createForm(), [visible]);

  const onOk = async () => {
    const { amount, accountName, endTime, unitCode } = await form.submit<{
      amount: number;
      accountName: string;
      endTime: string;
      unitCode: string[];
    }>();
    const unit = unitCode[1];

    try {
      setLoading(true);
      await onConfirm({
        amount,
        accountName,
        endTime: moment(endTime).format('YYYY-MM-DD'),
        unitCode: unit,
        unitName: unit,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { name, computeUnit, computeUnitDesc } = carbonData;
    const { amount, endTime, accountName } = accountInfo;
    const unitDesc = computeUnitDesc.split('/').pop();
    form.setValues({
      name,
      unitCode: computeUnit.split(','),
      amount: !amount || `${amount}` === '0' ? '1' : amount,
      accountName: accountName || `1${unitDesc}${name}`,
      endTime: endTime ? moment(endTime).format('YYYY') : null,
    });
  }, [form, carbonData, accountInfo]);

  return (
    <Modal
      title={I18N.carbonFootprint.accountingProductInformation}
      open={visible}
      okButtonProps={{ loading }}
      onCancel={onCancel}
      onOk={onOk}
    >
      <FormilyCommon form={form}>
        <SchemaField
          schema={{
            type: 'void',
            properties: {
              grid: {
                type: 'void',
                'x-component': 'FormGrid',
                'x-component-props': {
                  maxColumns: 2,
                  columnGap: 16,
                },
                properties: {
                  name: {
                    type: 'string',
                    title: I18N.carbonFootprint.accountingProducts,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      gridSpan: 2,
                    },
                    'x-component': 'Input',
                    'x-component-props': {
                      disabled: true,
                    },
                  },
                  amount: {
                    type: 'string',
                    title: I18N.carbonFootprint.accountingQuantity,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-component': 'NumberPicker',
                    'x-component-props': {
                      controls: false,
                    },
                    'x-validator': (val: string) => {
                      if (isNil(val) || val === '') {
                        return '';
                      }

                      if (Number(val) <= 0) {
                        return I18N.supplyChain.pleaseEnterAValueGreaterThan;
                      }

                      if (!regexpDecimalsNum(6).test(`${val}`)) {
                        return I18N.supplyChain.afterDecimalPoint;
                      }
                      return '';
                    },
                  },
                  unitCode: {
                    type: 'string',
                    title: ' ',
                    'x-decorator': 'FormItem',
                    'x-component': 'Cascader',
                    'x-component-props': {
                      disabled: true,
                    },
                    'x-reactions': [
                      '{{useFieldUnitDictSource("factorUnitM")}}',
                    ],
                  },
                  accountName: {
                    type: 'string',
                    title: I18N.carbonFootprint3.functionalUnits,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      gridSpan: 2,
                    },
                    'x-component': 'Input',
                  },
                  endTime: {
                    type: 'string',
                    title: I18N.carbonFootprint3.accountingYear2,
                    required: true,
                    'x-decorator': 'FormItem',
                    'x-decorator-props': {
                      gridSpan: 2,
                    },
                    'x-component': 'DatePicker',
                    'x-component-props': {
                      picker: 'year',
                      disabledDate: (value: Moment) =>
                        !(
                          value.isSameOrAfter('1990') &&
                          value.isSameOrBefore(String(moment().year() + 1))
                        ),
                    },
                  },
                },
              },
            },
          }}
          scope={{ useFieldUnitDictSource }}
        />
      </FormilyCommon>
    </Modal>
  );
};

type ProcessCarbonDataProps = {
  readOnly: boolean;
  carbonData: CarbonData;
};

const ProcessCarbonData: ForwardRefRenderFunction<
  { accountInfo: AccountInfo | null },
  ProcessCarbonDataProps
> = ({ carbonData, readOnly }, ref) => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);

  const [accountModalVisible, setAccountModalVisible] = useState(false);

  const { snapFillId, snapshootAccountId, fillType, status, isSelectAccount } =
    carbonData;

  const snapFlag =
    status > CARBON_DATA_STATUS.FILLING && !isSelectAccount ? 1 : 0;

  const isMatch = fillType === MATCH || fillType === MODEL_SHARE;

  useImperativeHandle(ref, () => ({ accountInfo }), [accountInfo]);

  const getAccountInfo = async (
    ...args: Parameters<typeof getAccountInfoData>
  ) => {
    const { data } = await getAccountInfoData(...args);
    setAccountInfo(data.data);
  };

  const onSnapshootAccountEdit = async (data: Partial<AccountInfo>) => {
    if (accountInfo) {
      await editSnapshootAccount({ ...accountInfo, ...data });
      Toast('success', I18N.carbonFootprint.editSuccessful);
      setAccountModalVisible(false);
      getAccountInfo({
        id: snapFillId,
        fillType: FILL,
        snapFlag: 1,
      });
    }
  };

  useEffect(() => {
    setAccountInfo(null);

    if (fillType === MATCH && !isNil(snapshootAccountId)) {
      getAccountInfo({
        id: snapshootAccountId,
        fillType: MATCH,
        snapFlag,
      });
    }

    if (fillType === FILL) {
      getAccountInfo({
        id: snapFillId,
        fillType: FILL,
        snapFlag: 1,
      });
    }
  }, [snapFlag, snapshootAccountId, fillType, snapFillId]);

  return (
    <>
      <div className={styles.accountHeader}>
        <div className={styles.accountHeaderLeft}>
          <div className={styles.headerInfoItem}>
            <span className={styles.caption}>
              {I18N.supplyChain2.productName}
            </span>
            <span>{carbonData.name}</span>
          </div>
          <div className={styles.headerInfoItem}>
            <span className={styles.caption}>
              {I18N.carbonFootprint3.accountingQuantity}
            </span>
            <span>{accountInfo?.amount || '-'}</span>
          </div>
          <div className={styles.headerInfoItem}>
            <span className={styles.caption}>
              {I18N.carbonFootprint3.functionalUnits2}
            </span>
            <span>{accountInfo?.accountName || '-'}</span>
          </div>
          <div className={styles.headerInfoItem}>
            <span className={styles.caption}>
              {I18N.supplyChain2.accountingYear2}
            </span>
            <span>
              {accountInfo?.endTime
                ? moment(accountInfo.endTime).format('YYYY')
                : '-'}
            </span>
          </div>
        </div>
        {!isMatch && !readOnly && (
          <Button onClick={() => setAccountModalVisible(true)}>
            {I18N.carbonFootprint.edit}
          </Button>
        )}
      </div>

      {isMatch && isNil(accountInfo) && (
        <div className={styles.empty}>
          <img src={emptyImg} alt='' />
          <span className={styles.caption}>
            {readOnly
              ? I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable
              : I18N.supplyChain2.pleaseSelectAccounting2}
          </span>
        </div>
      )}

      {accountInfo && (
        <div className={styles.accountContent}>
          <BuildModelList
            noSaveStoreBtn
            isInSupplyChain
            noSelectEmissionBtn
            quickDrawerMatchWayBtns={
              isMatch
                ? undefined
                : [{ value: 2, label: I18N.carbonFootprint3.newFactor }]
            }
            quickDrawerMatchWayBtnValue={2}
            accountInfo={accountInfo}
            isDetail={isMatch ? true : readOnly}
            apiExtraParams={{ snapFlag: isMatch ? snapFlag : 1 }}
            updateAccountInfo={() => {
              if (!isMatch) {
                getAccountInfo({
                  id: snapFillId,
                  fillType: FILL,
                  snapFlag: 1,
                });
              }
            }}
            onlyCreateFactor
          />
        </div>
      )}

      {!!accountInfo && (
        <AccountBasicInfoModal
          visible={accountModalVisible}
          carbonData={carbonData}
          accountInfo={accountInfo}
          onCancel={() => setAccountModalVisible(false)}
          onConfirm={onSnapshootAccountEdit}
        />
      )}
    </>
  );
};

export default forwardRef(ProcessCarbonData);
