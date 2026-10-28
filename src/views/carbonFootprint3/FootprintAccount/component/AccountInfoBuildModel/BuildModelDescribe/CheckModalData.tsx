import { EcoinventGeographyContext } from '@/components/SearchFactor/ModalFactor/ecoinventContext';
import { CheckCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import AIIcon from '@src/assets/images/carbonFootprint3.6.4/AIIcon.png';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { regexpDecimalsNum } from '@src/utils/regs';
import { getFullNum } from '@src/views/carbonFootprint/utils';
import { Emission } from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/type';
import EmissionSourceDrawer from '@src/views/carbonFootprint3/component/EmissionSourceDrawer';
import { CheckModelProps } from '@src/views/carbonFootprint3/component/EmissionSourceDrawer/type';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import {
  EMISSION_TYPE_OPTIONS,
  QUICK_ACCOUNT_LIFE_CYCLE,
} from '@src/views/carbonFootprint3/constant';
import { QuickAccountLifeCycleStage } from '@src/views/carbonFootprint3/type';
import { RegFActorObjRate } from '@src/views/carbonFootprint3/util';
import {
  Button,
  InputNumber,
  Radio,
  RadioChangeEvent,
  Table,
  TableColumnsType,
} from 'antd';
import {
  Ref,
  VFC,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  AGENT_MEASUREMENT_PRECISION,
  DEFAULT_MEASUREMENT_PRECISION,
  MeasurementPrecisionContext,
  ModelCheckEmissionFieldsContext,
} from '@/components/CarbonFootprintAccount/BuildModelMainData/measurementPrecisionContext';
import { ShowFactorTypeContext } from '@/components/FormilyUtil/FormilyFactor/context';
import { useSubscriptionServiceModal } from '@/components/SubscriptionServiceModal';
import { ProductSource } from '@/views/system/login/component/Login';

import style from './index.module.less';
import { postCheckcalcMassBalance } from './service';
import { CheckModelData, MassItem, ModelCheckItem } from './type';

type Props = {
  accountId: number;
  modelCheckData?: CheckModelData;
  /** 子组件ref */
  cRef: Ref<{
    initActive: () => void;
  }>;
  onCancel: () => void;
  updateModelCheckData: (data?: CheckModelData) => void;
  /** 点击专家检查/指导时的回调，用于先关闭当前弹窗再打开订阅弹窗 */
  onExpertCheck?: () => void;
  /** companyType 非轻量版（≠ ECompanyType.lite）：模型评价区域不展示专家检查卡片 */
  hideExpertEvaluationCta?: boolean;
};

const options = [
  { label: I18N.carbonFootprint3.modelCheck, value: 1 },
  { label: I18N.carbonFootprint3.qualityBalanceInspection2, value: 2 },
];

const cssCommon = {
  padding: '3px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  marginRight: 8,
};

/**
 * 模型检查的表格
 */
const columsBalance: (
  onBlurBalance: (item: MassItem, count: string) => void,
) => TableColumnsType<MassItem> = onBlurBalance => [
  {
    title: I18N.carbonFootprint3.emissionSourceProducts,
    width: 250,
    dataIndex: 'name',
    render: (val, item) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {item.type === 0 ? (
          <div
            style={{
              ...cssCommon,
              color: '#0CBF9F',
              border: '1px solid #AAF2DB',
              background: '#E6FFF6',
            }}
          >
            {I18N.carbonFootprint3.product}
          </div>
        ) : (
          <div
            style={{
              ...cssCommon,
              color: '#FBA93E',
              border: '1px solid #FFE8BA',
              background: '#FFFBF0',
            }}
          >
            {I18N.carbonFootprint.emissionSources}
          </div>
        )}

        <TextWidthOverflow width={170} value={val} />
      </div>
    ),
  },
  {
    title: I18N.carbonFootprint3.consumptionQuantityCore,
    dataIndex: 'amount',
    width: 200,
    render: (_, item) =>
      !item.amount && !item.unitName ? (
        '-'
      ) : (
        <TextWidthOverflow
          width={170}
          value={`${item.amount || '-'}${item.unitName || '-'}`}
        />
      ),
  },
  {
    title: I18N.carbonFootprint3.qualityUnitK,
    dataIndex: 'perWeight',
    width: 200,
    render: (_, item) => {
      if (item.massType === 1) return '-';
      return (
        <InputNumber
          style={{ width: '100%' }}
          defaultValue={item.perWeight}
          min='0.0000000000001'
          placeholder={I18N.carbonFootprint.pleaseEnter}
          onBlur={val => {
            if (!val.target.value) return;
            const bigNum = getFullNum(val.target.value);

            if (!regexpDecimalsNum(13).test(bigNum)) {
              Toast('warn', I18N.carbonFootprint3.maximumDecimalPlaces5);
              return;
            }

            const testValue = RegFActorObjRate(bigNum);
            if (testValue) {
              Toast('warn', testValue);
              onBlurBalance(item, '0.0000000000001');
              return;
            }
            onBlurBalance(item, bigNum);
          }}
        />
      );
    },
  },
  {
    title: I18N.carbonFootprint3.massKg,
    dataIndex: 'weight',
    width: 200,
  },
];

/**
 * 模型检查的表格
 */
const columsModel: (
  emissionChange: (data: Emission[], code: number) => void,
) => TableColumnsType<ModelCheckItem> = emissionChange => [
  {
    title: I18N.carbonFootprint3.optimizationSuggestions,
    width: 350,
    dataIndex: 'name',
    render: val => <TextWidthOverflow width={320} value={val} />,
  },
  {
    title: I18N.carbonFootprint3.listOfEmissionSources,
    dataIndex: 'data',
    width: 600,
    render: (_, item) => {
      if (item.code === 1) {
        const mapData = item.data.map(itemMap => itemMap.name);
        return <TextWidthOverflow value={mapData.join(',')} width={570} />;
      }
      return <TextWidthOverflow width={570} value={_ === 'true' ? '-' : ''} />;
    },
  },
  {
    title: I18N.carbonFootprint.operation,
    width: 100,
    dataIndex: 'set',
    render: (_, item) => (
      <span
        style={{ color: '#0cbf9f', cursor: 'pointer' }}
        onClick={() => emissionChange(item.data, item.code)}
      >
        {item.code === 1
          ? I18N.carbonFootprint3.jump
          : I18N.carbonFootprint.add}
      </span>
    ),
  },
];

export const CheckModalData: VFC<Props> = ({
  accountId,
  cRef,
  modelCheckData,
  onCancel,
  updateModelCheckData,
  onExpertCheck,
  hideExpertEvaluationCta,
}) => {
  const enableAgentEmissionFields = useContext(ModelCheckEmissionFieldsContext);
  const { openSubscriptionModal } = useSubscriptionServiceModal();
  const emissionRef = useRef<Emission[]>();
  /** 编辑弹框需要的参数 */
  const [emissionProps, setEmissionProps] = useState<
    CheckModelProps & { data: Emission }
  >();

  /** 新增需要设置的阶段 */
  const [addStage, setAddStage] = useState<QuickAccountLifeCycleStage>();

  /** 新增需要初始的一些参数 */
  const [initValues, setInitValues] = useState<Record<string, any>>();

  /** 激活的模型检查和质量平衡检查 */
  const [activeKey, setActiveKey] = useState(1);

  /** 排放源抽屉 */
  const [emissionVisible, setEmissionVisible] = useState(false);

  /** 当前要跳转排放源列表 */
  const [, setEmissionLists] = useState<Emission[]>([]);

  /**
   * 切换上一页，下一页
   * @param current 当前页码
   */
  const changeEmissionPage = (current: number) => {
    if (!emissionRef.current) return;
    setEmissionProps({
      data: emissionRef.current[current],
      current,
      total: emissionRef.current.length,
      onChangeCheck: changeEmissionPage,
    });
  };

  /**
   * 切换标签页
   * @param key 标签
   */
  const changeTabs = (e: RadioChangeEvent) => {
    setActiveKey(e.target.value);
  };

  /**
   * 修改质量平衡检查的质量单位
   * @param item 修改的一项
   * @param count 输入的值
   */
  const onBlurBalance = async (item: MassItem, count: string) => {
    if (!modelCheckData) return;
    item.perWeight = count;
    modelCheckData.updatedRowId = item.rowId;
    if (modelCheckData) {
      const { data } = await postCheckcalcMassBalance(modelCheckData);
      updateModelCheckData(data.data);
    }
  };

  /**
   * 点击操作获取到当前操作的排放源信息
   * @param emissionData 排放源数据
   */
  const getEmissionDataDrawer = (emissionData: Emission[], code: number) => {
    if (code === 1) {
      setEmissionProps({
        data: emissionData[0],
        current: 0,
        total: emissionData.length,
        onChangeCheck: changeEmissionPage,
      });
      setEmissionLists(emissionData);
      emissionRef.current = emissionData;
    } else {
      setEmissionProps(undefined);
      setEmissionLists([]);
      emissionRef.current = undefined;
      // 运输默认原材料阶段
      if (code === 0) {
        setAddStage(QUICK_ACCOUNT_LIFE_CYCLE.MATERIAL);
        // 包装材料
        setInitValues({
          type: EMISSION_TYPE_OPTIONS.TRANS,
        });
      }
      // 包装材料默认是原材料阶段
      if (code === 3) {
        setAddStage(QUICK_ACCOUNT_LIFE_CYCLE.MATERIAL);
        // 包装材料
        setInitValues({
          type: EMISSION_TYPE_OPTIONS.PACKAGING,
        });
      }
      // 电能、水耗 默认是 生产制造阶段
      if (code === 2) {
        setAddStage(QUICK_ACCOUNT_LIFE_CYCLE.PRODUCT);
        // 电能
        setInitValues({
          type: EMISSION_TYPE_OPTIONS.ENERGY,
        });
      }
      if (code === 4) {
        setAddStage(QUICK_ACCOUNT_LIFE_CYCLE.PRODUCT);
        // 水耗
        setInitValues({
          type: EMISSION_TYPE_OPTIONS.WATER_ENERGY,
        });
      }
    }

    setEmissionVisible(true);
  };

  /** 取消排放源抽屉 */
  const closeEmissionDrawer = async () => {
    setEmissionVisible(false);
  };

  /**
   * 主动触发子组件表格更新
   */
  useImperativeHandle(cRef, () => ({
    /** 重新加载数据 */
    initActive: async () => {
      setActiveKey(1);
    },
  }));

  return (
    <div className={style.checkModalMain}>
      <div className={style.titleMain}>
        <Radio.Group
          options={options}
          onChange={changeTabs}
          value={activeKey}
          optionType='button'
          buttonStyle='solid'
        />
      </div>

      {activeKey === 1 && modelCheckData?.modelCheckItems?.length ? (
        <Table<ModelCheckItem>
          rowKey='id'
          bordered
          // scroll={{ x: 1200 }}
          columns={columsModel(getEmissionDataDrawer)}
          dataSource={modelCheckData?.modelCheckItems || []}
          pagination={false}
        />
      ) : undefined}
      {activeKey === 1 && modelCheckData?.modelCheckItems?.length === 0 ? (
        <div className={style.checkSuccessMain}>
          <div>
            <CheckCircleFilled className={style.checkSuccessImg} />
          </div>
          <div className='m-t-8'>
            {I18N.carbonFootprint3.modelCheckCompleted}
          </div>
        </div>
      ) : undefined}
      {activeKey === 2 && (
        <div className={style.balanceMain}>
          <div className={style.balanceTitle}>
            <InfoCircleFilled className={style.balanceIcon} />
            {I18N.carbonFootprint3.qualityBalanceInspection}
            <br />
            {I18N.carbonFootprint3.onlyProductsAnd}
            <br />
            {I18N.carbonFootprint3.forOverallGrowth}
          </div>
          <div className={style.describeBalance}>
            <span>{I18N.carbonFootprint3.errorValue}</span>
            {modelCheckData?.rate === null ? (
              <span className={style.describeValue}>-</span>
            ) : (
              <span>
                {modelCheckData?.rate !== 0 ? (
                  <span className={style.describeValue}>
                    {modelCheckData?.rate}%
                  </span>
                ) : undefined}

                {modelCheckData?.rate && modelCheckData?.rate > 0 ? (
                  <span>{I18N.carbonFootprint3.emissionSourceQuality2}</span>
                ) : undefined}
                {modelCheckData?.rate && modelCheckData?.rate < 0 ? (
                  <span>{I18N.carbonFootprint3.emissionSourceQuality}</span>
                ) : undefined}
                {modelCheckData?.rate === 0 ? (
                  <span>{I18N.carbonFootprint3.massBalance}</span>
                ) : undefined}
              </span>
            )}
          </div>
          <Table<MassItem>
            rowKey='rowId'
            bordered
            scroll={{ y: 300 }}
            columns={columsBalance(onBlurBalance)}
            dataSource={modelCheckData?.massList || []}
            pagination={false}
          />
        </div>
      )}

      {modelCheckData?.evaluateList &&
        modelCheckData.evaluateList.length > 0 && (
          <div className={style.aiEvaluateSection}>
            <div className={style.aiEvaluateTitle}>
              <span>{I18N.carbonFootprint3.modelEvaluation}</span>
              <img
                src={AIIcon}
                className={style.aiEvaluateTitleIcon}
                alt='AI'
              />
            </div>
            <ul className={style.aiEvaluateList}>
              {modelCheckData.evaluateList.map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={index}>{item}</li>
              ))}
            </ul>
            {!hideExpertEvaluationCta && (
              <div
                className={style.expertCard}
                onClick={() => {
                  onExpertCheck?.();
                  openSubscriptionModal({
                    productSource: ProductSource.product,
                    preselectProfessionalSupportKeyword:
                      I18N.accountInfoAiChat.expertServiceKeyword,
                  });
                }}
              >
                <div className={style.expertCardLeft}>
                  <div className={style.expertCardIcon}>
                    <CheckCircleFilled />
                  </div>
                  <div className={style.expertCardText}>
                    <span className={style.expertCardTitle}>
                      {I18N.carbonFootprint3.expertCheckGuide}
                    </span>
                    <span className={style.expertCardDesc}>
                      {I18N.carbonFootprint3.expertCheckGuideDesc}
                    </span>
                  </div>
                </div>
                <div className={style.expertCardArrow}>
                  <span>{I18N.components.consultNow}</span>
                  <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                    <path
                      d='M6 3l5 5-5 5'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

      <div className={style.footer}>
        <Button
          onClick={() => {
            setActiveKey(1);
            onCancel();
          }}
        >
          {I18N.carbonFootprint3.close}
        </Button>
      </div>
      <MeasurementPrecisionContext.Provider
        value={
          enableAgentEmissionFields
            ? AGENT_MEASUREMENT_PRECISION
            : DEFAULT_MEASUREMENT_PRECISION
        }
      >
        <ShowFactorTypeContext.Provider value={enableAgentEmissionFields}>
          <EcoinventGeographyContext.Provider value={enableAgentEmissionFields}>
            <EmissionSourceDrawer
              initValues={initValues}
              checkModelData={emissionProps}
              visible={emissionVisible}
              accountId={accountId}
              emissionSourceId={emissionProps?.data.id}
              stage={
                emissionProps
                  ? (emissionProps?.data.stage as QuickAccountLifeCycleStage)
                  : (addStage as QuickAccountLifeCycleStage)
              }
              onClose={closeEmissionDrawer}
              onSuccess={() => {
                if (emissionProps) {
                  if (emissionProps.current === emissionProps.total - 1) {
                    setEmissionVisible(false);
                  } else {
                    changeEmissionPage(emissionProps.current + 1);
                  }
                } else {
                  setEmissionVisible(false);
                }

                updateModelCheckData();
              }}
            />
          </EcoinventGeographyContext.Provider>
        </ShowFactorTypeContext.Provider>
      </MeasurementPrecisionContext.Provider>
    </div>
  );
};
