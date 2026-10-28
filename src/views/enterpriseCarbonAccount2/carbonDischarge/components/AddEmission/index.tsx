/*
 * @@description:排放源 新增 复制 编辑 详情  核算排放源  核算模型排放源
 * @Author: lixingchen qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-18 14:20:27
 */
import { InfoCircleOutlined } from '@ant-design/icons';
import tabSelectImg from '@assets/images/icon_radio_selected.svg';
import { Text } from '@components/formily/components/Text';
import {
  FormLayout,
  FormGrid,
  FormItem,
  Radio,
  Input,
  Cascader,
  Select,
  DatePicker,
} from '@formily/antd-v5';
import {
  createForm,
  onFieldInputValueChange,
  onFieldValueChange,
} from '@formily/core';
import { createSchemaField, Field } from '@formily/react';
// import { toJS } from '@formily/reactive';
import { listALLByDictTypeBatch } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFactorDetail from '@src/components/SearchFactor/FactorDetail';
import SearchModalFactor from '@src/components/SearchFactor/ModalFactor';
import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import { IconAlibaba } from '@src/components/iconfont';
import useFiledUnitDictSource from '@src/hooks/useFieldUnitDictSource';
import I18N from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import {
  PageInfoType,
  PageInfoTypeName,
  PathParamsType,
} from '@src/router/type';
import {
  GET387aba750e252c9ba5473ac60c2ba0a1,
  GET9f98ab73509d2186fc4d4ad1876a7223,
  GETf549e8a56cb0b16dec8f4cdc46020c72,
  POST2d0fcc1a8f2312cec3c6fde9f1eee06e,
  POSTc4118b28a7c5e4310506fccc7fb8acd0,
  POSTc457e5a2a7b767c9ce0e2ceac8c32f67,
} from '@src/sdks_v2/enterpriseV2ApiDocs';
import { Toast } from '@src/utils/Toast';
import { CO2E } from '@src/views/carbonInternational/organizationalManagement/utils';
import { Dicts } from '@src/views/emission/Show/type';
import {
  ISOSecondSelect,
  GHGSecondSelect,
} from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import { apiSourceDefaultValue } from '@src/views/enterpriseCarbonAccount2/service';
import { Modal, Tooltip } from 'antd';
import classNames from 'classnames';
import { compact, last } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';

import style from './index.module.less';
import { SelectFormily } from '../Selector';
import '../style.less';
import { DictSource, FdType, ManualFactorData } from './types';
import { convertApi2Factor, convertApi2ManaulFactor } from './utils';
import { AddFactorModal } from '../AddFactorModal';
import { defaultFactorData } from '../AddFactorModal/utils';
import FactorCard from '../FactorCard';
import TitleTip from '../TitleTip/index';

import {
  ColUmsType,
  apiListALLByDictTypeData,
  apiMnumListALLByDictTypeBatch,
} from '@src/views/emission/Show/service';

import { activityUnitCovers } from '../../emissionAccount/utils';

import { titleTip } from '@src/views/enterpriseCarbonAccount2/utils';

import { baseInfoSchema, activitySchema, supplierSchema } from './schema';
import { getMatchEmissionCount } from './service';
import MatchEmissionListModal from '../MatchEmissionListModal';
import { getMatchEmissionList } from '../MatchEmissionListModal/service';
import {
  ACTIVITY_TYPE,
  ACTIVITY_TYPE_LABEL,
} from '../AccountAddEmission/constant';
import { getFormulaList } from '../AccountAddEmission/service';

import FormilyMethodSelect from '@/components/FormilyMethodSelect';

const selectTab: { label: string; key: string; icon: string }[] = [
  {
    label: I18N.carbonFootprint3.factorInformation,
    key: 'fill',
    icon: 'icon-icon-wodepaifangyinziku',
  },
  {
    label: I18N.carbonFootprint3.initiateCollection,
    key: 'supplier',
    icon: 'icon-icon_supplier_line',
  },
];
interface PropsType {
  type?: 'model' | 'account';
}
const EmissionEditPage = (props: PropsType) => {
  const { type = 'account' } = props;
  const search = new URLSearchParams(location.search?.slice(1));
  const modelId = search.get('modelId');
  const { id, pageInfoTypeName } = useParams<{ id: string } & PathParamsType>();
  const sourceId = useRef<string>(id);
  /** 是不是添加排放源(排放源库)页面 */
  const isAddEmission = matchPath(location.pathname, {
    path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
    exact: true,
  });
  const history = useHistory();

  const [matchEmissionListModalVisible, setMatchEmissionListModalVisible] =
    useState(false);

  const freezeCalcUnitRatio = useRef(false);

  const [matchEmissionName, setMatchEmissionName] = useState('');

  const Form = useMemo(
    () =>
      createForm({
        readPretty: pageInfoTypeName === PageInfoType.show,
      }),
    [],
  );
  const [showModalFactor, setShowModalFactor] = useState(false);
  const [showFillFactor, setShowFillFactor] = useState(false);
  const [showFactorDetail, setShowFactorDetail] = useState(false);
  const [, setActivityUnitList] = useState<Dicts[]>([]);

  const [fillType, setFillType] = useState('fill');
  // 因子气体信息
  const [factorType, setFactorType] = useState<FdType>(FdType.autoMatch);

  const [prevFactorType, setPrevFactorType] = useState<FdType>();

  // 因子单位 分母
  const [factorUnitM, setFactorUnitM] = useState<Dicts[]>();
  /** 搜索的因子数据 */
  const [factorData, setFactorData] = useState<SerachCarbonFactorResult>();
  // 手动录入的因子
  const [manualFactorData, setManualFactorData] = useState<ManualFactorData>();

  // 因子单位 分子
  const [factorUnitZ, setFactorUnitZ] = useState<Dicts[]>();
  const [activityUnit, setActivityUnit] = useState('');
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Radio,
      Input,
      Cascader,
      Select,
      DatePicker,
      SelectFormily,
      Text,
    },
  });
  const isoEffectId = 'iso-effect';
  const ghgEffectId = 'ghg-effect';
  const getFactorSource =
    /** 活动数据记录方式 0   活动数据保存部门 1  排放因子来源 2 */
    () =>
      GET9f98ab73509d2186fc4d4ad1876a7223({ type: 2 }).then(({ data }) => {
        if (data?.length) {
          return data;
        }
        return undefined;
      });
  const removeEffect = (id: typeof isoEffectId | typeof ghgEffectId) => {
    Form.removeEffects(id);
  };
  const addIsoEffect = () => {
    Form.addEffects(isoEffectId, () => {
      onFieldValueChange('activityUnit', field => {
        if (field?.inputValue?.[1]) {
          let coverData;
          setActivityUnitList(v => {
            coverData = activityUnitCovers(field?.inputValue?.[1], v);
            return v;
          });
          setActivityUnit(coverData);
        }
      });
      onFieldInputValueChange('methodObj', field => {
        let unitString = '';
        setActivityUnitList(v => {
          unitString = activityUnitCovers(field.value?.unit?.[1], v);
          return v;
        });
        setActivityUnit(unitString);
      });
      onFieldInputValueChange('activityType', field => {
        setTimeout(() => {
          let unit = '';
          if (field.value === ACTIVITY_TYPE.EMISSION_FACTOR) {
            unit = Form.values.activityUnit?.[1];
          } else if (field.value === ACTIVITY_TYPE.FORMULA) {
            unit = Form.values.methodObj?.unit?.[1];
          }
          let unitString = '';
          setActivityUnitList(v => {
            unitString = activityUnitCovers(unit, v);
            return v;
          });
          setActivityUnit(unitString);
        });
      });
    });
  };
  const addGhgEffect = () => {
    Form.addEffects(ghgEffectId, () => {
      onFieldValueChange('.ghg', field => {
        const { value } = field;
        const targetGhg = GHGSecondSelect.find(c => c.id === value[1]);
        // 当前 iso 选项值
        const currentIsoVal = Form.values.iso;
        // 当前 iso 选项
        const currentIso = ISOSecondSelect.find(
          c => c.commId === currentIsoVal?.[1],
        );
        // commid 不相等时向下执行
        if (targetGhg && currentIso?.commId !== targetGhg.commId) {
          const targetIso = ISOSecondSelect.find(
            c => c.commId === targetGhg.commId,
          );
          if (targetIso) {
            removeEffect(isoEffectId);
            Form.setValues({ iso: [targetIso.pid, targetIso.id] });
            Form.clearErrors(['iso']);
            setTimeout(() => {
              addIsoEffect();
            });
          }
        }
      });
    });
  };
  // 单位换算比例
  const [unitConver, setUnitConver] = useState('');
  // 暂存的接口返回的因子数据，等待单位返回之后写入到因子state 中
  const [cachedFactor, setCachedFactor] = useState<DictSource>();
  // 转换因子数据 api 数据 => 正常因子数据
  useEffect(() => {
    if (cachedFactor && factorUnitZ?.length && factorUnitM?.length) {
      if (factorType === FdType.manual || factorType === FdType.importFactor) {
        getFactorSource().then(sources => {
          setManualFactorData(
            convertApi2ManaulFactor(
              cachedFactor,
              factorUnitM,
              factorUnitZ,
              sources,
            ),
          );
        });
      } else {
        setFactorData(
          convertApi2Factor(cachedFactor, factorUnitM, factorUnitZ),
        );
      }
    }
  }, [cachedFactor, factorUnitM, factorUnitZ]);
  // 转换因子数据 api 数据 => 正常因子数据
  const transUnit = (unitMListRes, unitMTreeRes, data) => {
    const unitMList = unitMListRes.data.data.factorUnitM;
    setActivityUnitList(unitMList);
    const unitMTree = unitMTreeRes.data.data;
    const sourceObj = unitMList.find(
      item => item.dictValue === data.activityUnit,
    );
    const sourceName = sourceObj?.sourceName;
    // const sourceLabel = sourceObj?.dictLabel;
    const dictValue = unitMTree.find(
      item => item.dictLabel === sourceName,
    )?.dictValue;
    // setActUnit(sourceLabel);

    return [dictValue, data.activityUnit];
  };

  // 选择匹配到的排放源，表单值回填走原先编辑，详情初始化的逻辑
  const onMatchEmissionSelect = (emission: DictSource) => {
    Promise.all([
      apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }),
      apiListALLByDictTypeData({ dictType: 'factorUnitM' }),
      GETf549e8a56cb0b16dec8f4cdc46020c72({
        dictSourceId: Number(emission.dictSourceId),
        modelId: modelId ? +modelId : undefined,
      }),
    ])
      .then(([unitMListRes, unitMTreeRes, data]) => {
        freezeCalcUnitRatio.current = true;
        const result = (data?.data?.data as DictSource) || {};
        const { sourceId: originSourceId, ...rest } = result;
        if (result) {
          Form.setValues({
            ...rest,
            activityUnit: transUnit(unitMListRes, unitMTreeRes, result),
            iso: [result.isoCategory, result.isoClassify],
            ghg: [result.ghgCategory, result.ghgClassify],
          });
          setUnitConver(result.unitConver);
          setFactorType(result.fdType);
          setPrevFactorType(result.fdType);
          setCachedFactor(result);
        }
        setActivityUnit(
          activityUnitCovers(
            result.activityUnit,
            unitMListRes.data.data.factorUnitM,
          ),
        );
      })
      .finally(() => {
        // 为了兼容原先逻辑，用setTimeout hack
        setTimeout(() => {
          freezeCalcUnitRatio.current = false;
        }, 50);
      });
  };
  /** * 编辑、复制、详情获取数据 */
  useEffect(() => {
    const dealApiData = (result: DictSource, unitMListRes, unitMTreeRes) => {
      if (result) {
        Form.setValues({
          ...result,
          activityUnit: transUnit(unitMListRes, unitMTreeRes, result),
          iso: [result.isoCategory, result.isoClassify],
          ghg: [result.ghgCategory, result.ghgClassify],
        });
        setUnitConver(result.unitConver);
        setFactorType(result.fdType);
        setPrevFactorType(result.fdType);
        setCachedFactor(result);
      }
    };

    if (
      [PageInfoType.edit, PageInfoType.show].some(p => p === pageInfoTypeName)
    ) {
      Promise.all([
        apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }),
        apiListALLByDictTypeData({ dictType: 'factorUnitM' }),
        GETf549e8a56cb0b16dec8f4cdc46020c72({
          dictSourceId: +id,
          modelId: modelId ? +modelId : undefined,
        }),
      ]).then(([unitMListRes, unitMTreeRes, data]) => {
        const result = data?.data?.data as DictSource;
        dealApiData(result, unitMListRes, unitMTreeRes);
        setActivityUnit(
          activityUnitCovers(
            result.activityUnit,
            unitMListRes.data.data.factorUnitM,
          ),
        );
      });
    } else if (PageInfoType.copy === pageInfoTypeName) {
      Promise.all([
        apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }),
        apiListALLByDictTypeData({ dictType: 'factorUnitM' }),
        GET387aba750e252c9ba5473ac60c2ba0a1({ dictSourceId: +id }),
      ]).then(([unitMListRes, unitMTreeRes, data]) => {
        const result = data?.data?.data as DictSource;
        dealApiData(result, unitMListRes, unitMTreeRes);
        setActivityUnit(
          activityUnitCovers(
            result.activityUnit,
            unitMListRes.data.data.factorUnitM,
          ),
        );
      });
    }
  }, [pageInfoTypeName, id]);

  useEffect(() => {
    addGhgEffect();
    addIsoEffect();
    if (!sourceId.current) {
      apiSourceDefaultValue().then((res: any) => {
        // @ts-ignore
        sourceId.current = res.data?.data?.sourceId || '';
        Form.setValues({
          sourceId: sourceId.current,
        });
      });
    }
    // 因子分子、分母单位
    listALLByDictTypeBatch({
      dictTypes: 'factorUnitM,cequivalentUnitZ',
    }).then(data => {
      const result = data.data?.data;
      setFactorUnitM(result?.factorUnitM || []);
      setFactorUnitZ(result?.cequivalentUnitZ || []);
    });
    if (pageInfoTypeName === PageInfoType.add) {
      apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }).then(res => {
        setActivityUnitList(res.data.data.factorUnitM);
      });
    }
  }, []);
  const matchFactor = value => {
    if (
      value &&
      factorType === FdType.autoMatch &&
      pageInfoTypeName === PageInfoType.add
    ) {
      POSTc457e5a2a7b767c9ce0e2ceac8c32f67({
        factor: { name: value },
      }).then(({ data }) => {
        const result = data?.data as SerachCarbonFactorResult;
        if (result) {
          setFactorData(result);
          setPrevFactorType(FdType.autoMatch);
        }
      });
    }
  };

  const matchEmission = async (name: string) => {
    const field = Form.query('name').take();
    if (pageInfoTypeName === PageInfoType.add && field) {
      let matchEmissionCount = 0;
      try {
        matchEmissionCount = (await getMatchEmissionCount({ name })).data.data;
        if (matchEmissionCount > 0) {
          setMatchEmissionName(name);
        }
      } finally {
        field.setTitle(
          <div className={style.nameFieldTitle}>
            {titleTip(
              I18N.carbonFootprint3.emissionSourceName,
              I18N.enterpriseCarbonAccount2.generatingGreenhouseGas,
            )}
            {matchEmissionCount > 0 && (
              <div className={style.emissionTip}>
                {I18N.enterpriseCarbonAccount2.phaseDetected}
                <span
                  className={style.emissionViewBtn}
                  onClick={() => setMatchEmissionListModalVisible(true)}
                >
                  {I18N.carbonFootprint.check}
                </span>
              </div>
            )}
          </div>,
        );
      }
    }
  };
  return (
    <div className='enterprise-carbon-account-v222'>
      <MatchEmissionListModal
        getMatchEmission={getMatchEmissionList}
        visible={matchEmissionListModalVisible}
        name={matchEmissionName}
        onCancel={() => setMatchEmissionListModalVisible(false)}
        onConfirm={emission => {
          onMatchEmissionSelect(emission);
          setMatchEmissionListModalVisible(false);
        }}
      />
      <TitleTip />
      <div className={style.formBox}>
        <span className='title-name'>
          {I18N.carbonFootprint.basicInformation}
        </span>
        <FormilyCommon form={Form}>
          <SchemaField schema={baseInfoSchema(matchFactor, matchEmission)} />
        </FormilyCommon>
      </div>
      <div className='form-box'>
        <span className='title-name'>
          {I18N.carbonFootprint3.activityData}
          <Tooltip
            placement='top'
            title={I18N.enterpriseCarbonAccount2.theActivityCaused}
          >
            <InfoCircleOutlined className='cur-p color-B5B8BB margin-l-4' />
          </Tooltip>
        </span>

        <FormilyCommon form={Form}>
          <>
            <Field
              title={I18N.enterpriseCarbonAccount2.emissionsCalculation}
              name='activityType'
              required
              decorator={[FormItem]}
              component={[
                Radio.Group,
                {
                  options: Object.values(ACTIVITY_TYPE).map(value => ({
                    value,
                    label: ACTIVITY_TYPE_LABEL[value],
                  })),
                },
              ]}
            />
            <Field
              title={I18N.eca.computingMethod}
              name='methodObj'
              required
              decorator={[FormItem]}
              component={[
                FormilyMethodSelect,
                {
                  placeholder: I18N.eca.pleaseSelectCalculation,
                  paramDisabled: true,
                  fieldNames: { label: 'name', value: 'id' },
                },
              ]}
              reactions={[
                field => {
                  getFormulaList().then(({ data }) => {
                    field.setComponentProps({
                      options: data.data,
                    });
                  });
                },
                field => {
                  const { activityType } = Form.values;
                  field.setState({
                    visible: activityType === ACTIVITY_TYPE.FORMULA,
                  });
                },
              ]}
            />
          </>
        </FormilyCommon>
        <FormilyCommon form={Form}>
          <SchemaField
            schema={activitySchema()}
            scope={{
              useFiledUnitDictSource,
            }}
          />
        </FormilyCommon>
      </div>
      <div className='form-box'>
        {/* // fixme what? */}
        {/*  eslint-disable-next-line no-nested-ternary */}
        {type === 'model' ? (
          <span className='title-name'>
            {I18N.carbonFootprint3.factorInformation}
            <Tooltip
              placement='top'
              title={I18N.enterpriseCarbonAccount2.factorBasedOnSorting}
            >
              <InfoCircleOutlined className='cur-p color-B5B8BB' />
            </Tooltip>
          </span>
        ) : // 排放源库添加数据
        isAddEmission ? (
          <div className={style.addEmissionTop}>
            <div className='title-name'>
              {I18N.carbonFootprint3.factorInformation}
            </div>
            <div className={classNames('font-s-12 color-999EA4', style.tips)}>
              {I18N.components.accordingToTheEmissionSource}
            </div>
          </div>
        ) : (
          // 因子信息 & 发起收数
          <>
            <div className='select-box flex-a-c'>
              {selectTab?.map(item => (
                <div
                  className={`item flex-a-c flex-j-c ${fillType === item.key}`}
                  onClick={() => {
                    setFillType(item.key);
                  }}
                >
                  <img
                    className={fillType === item.key ? 'act' : 'none'}
                    src={tabSelectImg}
                    alt=''
                  />
                  <IconAlibaba
                    type={item.icon}
                    className={
                      fillType === item.key ? 'color-0cbf9f' : 'color-B5B8BB'
                    }
                  />
                  <span className='label'>{item.label}</span>
                </div>
              ))}
            </div>
            {fillType === 'fill' && (
              <span className='font-s-12 color-999EA4'>
                {I18N.components.accordingToTheEmissionSource}
              </span>
            )}
          </>
        )}
        {/* 因子信息卡片 */}
        {fillType === 'fill' ? (
          <FactorCard
            factorUseType={factorType}
            activityUnit={activityUnit}
            factorData={
              factorType === FdType.manual || factorType === FdType.importFactor
                ? manualFactorData
                : factorData
            }
            freezeCalcUnit={freezeCalcUnitRatio.current}
            readonly={pageInfoTypeName === PageInfoType.show}
            onConversionRatioChange={val => {
              if (val.toString() === 'NaN') {
                setUnitConver('');
              } else {
                setUnitConver(val.toString());
              }
            }}
            conversionRatio={unitConver}
            showModel={type => {
              if (type === 'detail') {
                setShowFactorDetail(true);
              } else if (type === 'fill') {
                setShowFillFactor(true);
              } else if (type === 'reSelect') {
                setShowModalFactor(true);
              }
            }}
          />
        ) : (
          <FormilyCommon form={Form}>
            <SchemaField schema={supplierSchema()} />
          </FormilyCommon>
        )}

        {/* <FormilyCommon form={Form}>
          <SchemaField schema={activitySchema()} />
        </FormilyCommon> */}
        {/* 选择排放因子 */}
        <Modal
          destroyOnClose
          title={I18N.carbonFootprint3.chooseEmissionFactors}
          width={1200}
          // key={factorName}
          maskClosable={false}
          open={showModalFactor}
          centered
          footer={null}
          bodyStyle={{
            paddingTop: 16,
          }}
          onCancel={() => {
            setShowModalFactor(false);
            if (prevFactorType) {
              setFactorType(prevFactorType);
            }
          }}
        >
          <SearchModalFactor
            isEnterprise
            factorName={(() => {
              switch (prevFactorType) {
                case FdType.manual:
                  return manualFactorData?.name;
                case FdType.select:
                  return factorData?.name;
                default:
                  return (Form.values as { name: string | undefined }).name;
              }
            })()}
            // factorUnitM={toJS(Form.getValuesIn('activityUnit')?.slice())}
            subClick={factor => {
              setPrevFactorType(FdType.select);
              setFactorType(FdType.select);
              setFactorData(factor);
              setManualFactorData(undefined);
              // 显示
              setShowModalFactor(false);
            }}
            onCancel={async () => {
              setShowModalFactor(false);
              if (prevFactorType) {
                setFactorType(prevFactorType);
              }
            }}
          />
        </Modal>
        {/* 选择排放因子end */}
        {/* 排放因子详情 选择的因子和自动匹配的因子 */}
        <Modal
          destroyOnClose
          title={I18N.components.emissionFactorsDetailed}
          width={1200}
          maskClosable={false}
          centered
          getContainer={false}
          open={
            showFactorDetail &&
            factorType !== FdType.manual &&
            factorType !== FdType.importFactor
          }
          cancelText={I18N.carbonFootprint3.close}
          okButtonProps={{
            style: {
              display: 'none',
            },
          }}
          onCancel={() => setShowFactorDetail(false)}
        >
          {/* 手动选择的因子 */}
          {/* factorType === FdType.select &&  */}
          {factorData?.id && <SearchFactorDetail id={factorData.id} />}
        </Modal>
        {/* 排放因子详情end */}
        {/* 手动填写因子 & 因子详情 手动输入的因子 */}
        {(showFillFactor ||
          (showFactorDetail &&
            (factorType === FdType.manual ||
              factorType === FdType.importFactor) &&
            !!manualFactorData)) && (
          <AddFactorModal
            visible
            isShow={
              showFactorDetail &&
              (factorType === FdType.manual ||
                factorType === FdType.importFactor) &&
              !!manualFactorData
            }
            factorData={manualFactorData}
            onCancel={() => {
              setShowFillFactor(false);
              setShowFactorDetail(false);
              if (prevFactorType) {
                setFactorType(prevFactorType);
              }
            }}
            onOk={({ form, tableData }) => {
              form.submit(values => {
                const co2eRow = defaultFactorData().find(r =>
                  r.greenhouseGasesType.includes(CO2E),
                );
                if (!co2eRow)
                  throw new Error(
                    I18N.enterpriseCarbonAccount2.coeColumnNotAvailable,
                  );
                getFactorSource().then(sources => {
                  setFactorType(FdType.manual);
                  setFactorData(undefined);
                  setManualFactorData({
                    ...values,
                    factorUnitName: `${
                      factorUnitZ?.find(d => d.dictValue === values?.factorUnit)
                        ?.dictLabel || ''
                    }/${
                      factorUnitM?.find(
                        d => d.dictValue === values?.factorUnitM?.[1],
                      )?.dictLabel || ''
                    }`,
                    factorSourceName:
                      sources?.find(
                        s => String(s.sourceLabelId) === values.factorSource,
                      )?.labelname || '',
                    // 补充co2e 数据到表格数据中
                    gasList: tableData.concat({
                      ...co2eRow,
                      factorUnit: values.factorUnit,
                      factorUnitM: values.factorUnitM.join(','),
                      factorValue: values.factorValue,
                      dictSourceFactorGasId: (
                        last(values?.gasList || []) as any
                      )?.dictSourceFactorGasId,
                    }),
                  });
                });
                setShowFillFactor(false);
                setShowFactorDetail(false);
                setPrevFactorType(FdType.manual);
              });
            }}
          />
        )}
      </div>
      <FormActions
        place='center'
        buttons={compact([
          pageInfoTypeName !== PageInfoType.show
            ? {
                title: I18N.carbonFootprint.confirm2,
                type: 'primary',
                onClick: async () =>
                  Form.submit(values => {
                    if (!unitConver) {
                      return Toast(
                        'warn',
                        I18N.enterpriseCarbonAccount2.pleaseFillInTheUnit,
                      );
                    }
                    let result: DictSource = {
                      ...values,
                      fdType: factorType,
                      ghgCategory: values.ghg[0],
                      ghgClassify: values.ghg[1],
                      isoCategory: values.iso[0],
                      isoClassify: values.iso[1],
                      activityUnit: values.activityUnit?.[1],
                      unitConver,
                      modelId,
                    };
                    // 手动选择
                    if (
                      (factorType === FdType.manual ||
                        factorType === FdType.importFactor) &&
                      manualFactorData
                    ) {
                      // 更改手动填写的逻辑。供应商收数暂时维持原逻辑，不敢动
                      const originGasList =
                        factorType === FdType.manual
                          ? manualFactorData?.gasList
                          : values?.gasList || manualFactorData?.gasList;
                      const gasList = (originGasList as ColUmsType[])?.map(
                        g => {
                          if (g.type === 'g9') {
                            return {
                              ...g,
                              factorValue: manualFactorData?.factorValue,
                              factorUnit: manualFactorData.factorUnit,
                              factorUnitM:
                                manualFactorData?.factorUnitM?.join(','),
                            };
                          }
                          return {
                            ...g,
                          };
                        },
                      );
                      result = {
                        ...result,
                        factorName:
                          factorType === FdType.manual
                            ? manualFactorData.name
                            : manualFactorData.factorName ||
                              manualFactorData.name,
                        factorScore:
                          manualFactorData.factorScore ||
                          manualFactorData.factorType,
                        factorPublic: manualFactorData.factorPublic,
                        factorSource: manualFactorData.factorSource,
                        factorType: manualFactorData.factorType,
                        // @ts-ignore
                        factorUnitM: manualFactorData.factorUnitM?.join(','),
                        gasList,
                      };
                    } else if (factorData) {
                      // 因子中返回的单位
                      const unit = factorData?.unit?.split('/');
                      // 翻译单位
                      const factorUnit = factorUnitZ?.find(
                        u => u.dictLabel === unit?.[0],
                      )?.dictValue;
                      const factorUnitMDict = factorUnitM?.find(
                        u => u.dictLabel === unit?.[1],
                      );
                      const gasList = defaultFactorData().map(g => {
                        if (g.greenhouseGasesType.includes(CO2E)) {
                          return {
                            ...g,
                            factorValue: factorData?.cValue,
                            factorUnit,
                            factorUnitM: `${factorUnitMDict?.sourceType},${factorUnitMDict?.dictValue}`,
                          };
                        }
                        return {
                          ...g,
                        };
                      });

                      result = {
                        ...result,
                        // @ts-ignore
                        factorName: factorData?.name,
                        factorScore: factorData?.factorType,
                        factorSource:
                          factorData?.factorSource || factorData?.institution,
                        factorPublic: factorData?.year,
                        // @ts-ignore
                        factorId: factorData?.id,
                        // @ts-ignore
                        gasList,
                      };
                    }

                    if (pageInfoTypeName === PageInfoType.edit) {
                      return POST2d0fcc1a8f2312cec3c6fde9f1eee06e({
                        // @ts-ignore
                        dd: { ...result },
                      }).then(({ data }) => {
                        if (data.code === 200) {
                          Toast('success', I18N.carbonFootprint.editSuccessful);
                          history.goBack();
                        }
                      });
                    }
                    return POSTc4118b28a7c5e4310506fccc7fb8acd0({
                      // @ts-ignore
                      dd: result,
                    }).then(({ data }) => {
                      const ghgSecondClassify = GHGSecondSelect.find(
                        ({ id }) => id === result.ghgClassify,
                      );
                      if (ghgSecondClassify) {
                        sessionStorage.setItem(
                          'selectedClassify',
                          JSON.stringify({
                            key: ghgSecondClassify.commId,
                            id: ghgSecondClassify.commId,
                            businessId: ghgSecondClassify.id,
                          }),
                        );
                      }
                      if (data.code === 200) {
                        Toast(
                          'success',
                          I18N.carbonFootprint3.createdSuccessfully,
                        );
                        history.goBack();
                      } else if (data.code === 40023) {
                        Toast('warn', data.msg);
                        if (result.dictSourceId) {
                          history.push({
                            pathname:
                              RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicList,
                            search: `dictSourceId=${result.dictSourceId}`,
                          });
                        }
                      }
                    });
                  }),
              }
            : {
                title: I18N.carbonFootprint.edit,
                type: 'primary',
                style: {
                  display: checkPermissions({}, 'enterprise:dictSource:edit')
                    ? 'block'
                    : 'none',
                },
                onClick: async () => {
                  Form.setState({
                    readPretty: false,
                  });
                  history.replace(
                    virtualLinkTransform(
                      RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
                      [PageInfoTypeName, ':id?'],
                      [PageInfoType.edit, id],
                    ),
                  );
                },
              },
          {
            title:
              pageInfoTypeName === PageInfoType.show
                ? I18N.carbonFootprint.return
                : I18N.carbonFootprint.cancel,
            onClick: async () => {
              history.goBack();
            },
          },
        ])}
      />
    </div>
  );
};
export default EmissionEditPage;
