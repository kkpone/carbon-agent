import AiIconImg from '@assets/svg/ai_green.svg';
import AiSvg from '@src/assets/icon/esg/ai.svg';
import upArrowSvg from '@src/assets/icon/esg/upArrow.svg';
import I18N from '@src/lang/I18N';
import {
  Button,
  Cascader,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Tooltip,
} from 'antd';
import { UploadFile } from 'antd/lib';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import FileUploadModal from '@/components/FileUploadModal';
import { FullscreenModal } from '@/components/FullscreenModal';
import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { useUnit, Dicts } from '@/hooks/useScope';
import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { getUnitWholePath, Toast } from '@/utils';
import { GetComponentProps } from '@/utils/utilTypes';
import {
  QUICK_ACCOUNT_LIFE_CYCLE,
  QUICK_ACCOUNT_LIFE_CYCLE_LABEL,
} from '@/views/carbonFootprint3/constant';
import { STEP_OPTION_VALUE } from '@/views/carbonFootprint3/util/constant';

import styles from './index.module.less';
import { buildModelByAI, createAccountByAI, genAITopicRecord } from './service';
import {
  postAccountingBasicSaveAndView,
  postAccountingCopyModelViewBasic,
} from '../../AccountDetail/AccountInfo/service';
import { AccountingAddBasicApiData } from '../../AccountDetail/AccountInfo/type';
import SelectModel from '../../SelectModel';
import { BuildModelDescribeSet } from '../../component/AccountInfoBuildModel/constant';
import { getPublishedGlobalFactorPreferencePlans } from '../../component/GlobalFactorPreference/service';
import { GlobalFactorPreferencePlan } from '../../component/GlobalFactorPreference/type';
import AccountInfoModal from '../../component/AccountInfoModal';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FootprintAccountInfoUrlStatus,
  FootprintAccountLifeCycle,
  FootprintAccountStatusType,
} from '../../constant';
import { getAccountProductInfo } from '../../service';
import { AccountProductData } from '../../type';

const { RangePicker } = DatePicker;
const { HALF, FULL, CUSTOM } = FootprintAccountLifeCycle;
const ALL_FACTOR_PREFERENCE_VALUE = 'ALL';
type FactorPreferenceValue = string;

const getSourceNamesText = (sourceNames?: string) => sourceNames || '-';

const AddAccount: FC<{ productId: string; onClose: () => void }> = ({
  productId,
  onClose,
}) => {
  const [unit, setUnit] = useState<Dicts[]>([]);

  const [amount, setAmount] = useState<number | null>(1);

  const [period, setPeriod] = useState(() => {
    const year = moment().year();

    return [
      moment(`${year}-01-01`),
      moment(`${year}-12-31`),
    ] as unknown as GetComponentProps<typeof RangePicker>['value'];
  });

  const [deepThink, setDeepThink] = useState(0);

  const [scope, setScope] = useState<{ value: number; label: string }[][]>([
    [{ value: HALF, label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[HALF] }],
  ]);

  const [productInfo, setProductInfo] = useState<AccountProductData>();

  const [description, setDescription] = useState('');

  const [fileModalOpen, setFileModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [accountModalProps, setAccountModalProps] = useState<{
    open: boolean;
    accountType?: number;
    modelId?: number;
  }>({ open: false });

  const [selectModelModalOpen, setSelectModelModalOpen] = useState(false);

  const [factorPreferencePlans, setFactorPreferencePlans] = useState<
    GlobalFactorPreferencePlan[]
  >([]);
  const [factorPreferenceValue, setFactorPreferenceValue] =
    useState<FactorPreferenceValue>(ALL_FACTOR_PREFERENCE_VALUE);

  const history = useHistory();

  const [files, setFiles] = useState<
    UploadFile<{ data: { name: string; url: string } }>[]
  >([]);

  const unitDict = useUnit();

  const onScopeChange = (val: { value: number; label: string }[][]) => {
    const lastSelectedNode = val[val.length - 1];

    if (scope.length === 0 || !lastSelectedNode) {
      setScope(val);
      return;
    }

    if (lastSelectedNode.length === 1) {
      setScope([lastSelectedNode]);
      return;
    }

    if (lastSelectedNode.length === 2) {
      setScope(val.filter(item => item.length === 2));
    }
  };

  const onAccountAdd = async (val: Record<string, any>) => {
    const addApi = isNil(val.modelId)
      ? postAccountingBasicSaveAndView
      : postAccountingCopyModelViewBasic;

    const { data } = await addApi(val as unknown as AccountingAddBasicApiData);

    Toast('success', I18N.carbonFootprint3.accountingCreation);

    history.push({
      pathname:
        RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail,
      search: `?productId=${productId}&accountId=${data.data}&status=${FootprintAccountInfoUrlStatus.EDIT}&stepValue=${STEP_OPTION_VALUE.MODEL}&listOrGraph=${BuildModelDescribeSet.VISUAL}`,
    });
  };

  const createAccount = async () => {
    try {
      setLoading(true);
      const [startPeriod, endPeriod] = period || [];
      if (
        unit.length === 0 ||
        scope.length === 0 ||
        isNil(amount) ||
        isNil(productInfo) ||
        isNil(startPeriod) ||
        isNil(endPeriod)
      ) {
        Toast('error', I18N.carbonFootprint3.pleaseImproveTheAccounting);
        return;
      }

      let scopeValue = '';
      if (scope.length > 1) {
        scopeValue = scope.map(item => item[1].value).join(',');
      } else if (scope[0][0].value === CUSTOM) {
        scopeValue = Object.values(QUICK_ACCOUNT_LIFE_CYCLE).join(',');
      }
      const unitName = unit[1].label;
      const { productName } = productInfo;
      const startTime = startPeriod.format('YYYY-MM-DD');
      const endTime = endPeriod.format('YYYY-MM-DD');
      const factorPrefId =
        factorPreferenceValue === ALL_FACTOR_PREFERENCE_VALUE ||
        isNil(factorPreferenceValue) ||
        factorPreferenceValue === ''
          ? 0
          : Number(factorPreferenceValue);

      const createResp = await createAccountByAI({
        productId: productInfo.id,
        productName,
        amount,
        unitType: unit[0].value,
        unitCode: unit[1].value,
        unitName,
        scope: scope[0][0].value,
        scopeValue,
        startTime,
        endTime,
        deepThink,
        factorPrefId,
      });

      const { accountId } = createResp.data.data;
      const { topicId } = createResp.data.data;

      const buildData = {
        accountId,
        topicId,
        deepThink,
        fileUrl: files.map(file => ({
          name: file.response?.data?.name || '',
          url: file.response?.data?.url || '',
        })),
        content: description,
      };
      await genAITopicRecord(buildData);
      buildModelByAI(buildData);

      await new Promise(rsl => {
        setTimeout(rsl, 1000);
      });
      Toast('success', I18N.carbonFootprint3.accountingCreation);

      history.push({
        pathname:
          RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail,
        search: `?openChat=true&productId=${productId}&accountId=${accountId}&topicId=${topicId}&status=${FootprintAccountInfoUrlStatus.EDIT}&stepValue=${STEP_OPTION_VALUE.MODEL}&listOrGraph=${BuildModelDescribeSet.VISUAL}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const deepThinkDisabled = files.length > 0;

  useEffect(() => {
    getAccountProductInfo({ id: productId }).then(({ data }) => {
      setProductInfo(data.data);
    });
  }, [productId]);

  useEffect(() => {
    if (productInfo && unitDict.length > 0) {
      const productUnit = getUnitWholePath(
        productInfo.accountUnitCode,
        unitDict,
      ) as unknown as Dicts[];
      setUnit(productUnit);
    }
  }, [productInfo, unitDict]);

  useEffect(() => {
    let cancelled = false;
    getPublishedGlobalFactorPreferencePlans().then(plans => {
      if (cancelled) {
        return;
      }

      setFactorPreferencePlans(plans);
      const defaultPlanId = plans.find(plan => plan.isDefault)?.id;
      setFactorPreferenceValue(
        isNil(defaultPlanId)
          ? ALL_FACTOR_PREFERENCE_VALUE
          : String(defaultPlanId),
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <FullscreenModal>
      <AccountInfoModal
        {...accountModalProps}
        productId={productId}
        onClose={() => setAccountModalProps({ open: false })}
        onConfirm={onAccountAdd}
      />
      <FileUploadModal
        title={I18N.esg.uploadData}
        open={fileModalOpen}
        files={files}
        maxCount={5}
        maxSize={20}
        templateDictType='footprint3_export_template'
        templateDictValue='accountEmission'
        onClose={() => setFileModalOpen(false)}
        onConfirm={uploadFiles => {
          setFiles(uploadFiles);
          setFileModalOpen(false);
          if (uploadFiles.length > 0) {
            setDeepThink(0);
          }
        }}
      />
      <SelectModel
        visible={selectModelModalOpen}
        onCancel={() => setSelectModelModalOpen(false)}
        onModelUse={model => {
          setSelectModelModalOpen(false);
          setAccountModalProps({
            open: true,
            modelId: model.id,
          });
        }}
      />
      <div className={styles.addAccount}>
        <IconAlibabaNew
          className={styles.closeIcon}
          type='icon-icon-guanbi'
          onClick={onClose}
        />
        <div className={styles.content}>
          <div className={styles.titleContent}>
            <span className={styles.title}>{I18N.carbonFootprint3.apply}</span>
            <img alt='' src={AiIconImg} />
            <span className={styles.title}>
              {I18N.carbonFootprint3.quicklyCreateProducts}
            </span>
          </div>
          <Skeleton
            className={styles.skeleton}
            active
            loading={!productInfo || unit.length === 0}
          >
            <div className={classNames(styles.infoContent)}>
              <div className={styles.basicInfo}>
                <img className={styles.aiSvg} alt='' src={AiSvg} />
                <span>{I18N.carbonNeutral.generate}</span>
                <div className={styles.infoWrapper}>
                  <InputNumber
                    className={styles.amountInput}
                    value={amount}
                    min={0}
                    max={10000000000}
                    variant='borderless'
                    placeholder={I18N.carbonFootprint.quantity}
                    controls={false}
                    onChange={setAmount}
                  />
                </div>
                <div className={styles.infoWrapper}>
                  <Cascader
                    variant='borderless'
                    placeholder={I18N.carbonFootprint.unit}
                    options={unitDict}
                    onChange={(_, opt) => setUnit(opt)}
                  >
                    <div className={styles.dropdownContent}>
                      {unit[1] ? (
                        <span>{unit[1].dictLabel}</span>
                      ) : (
                        <span className={styles.placeholder}>
                          {I18N.carbonFootprint.unit}
                        </span>
                      )}
                      <IconAlibabaNew
                        className={styles.dropdownIcon}
                        type='icon-chevron-down'
                      />
                    </div>
                  </Cascader>
                </div>
                <div className={styles.infoWrapper}>
                  {productInfo ? (
                    <span>{productInfo.productName}</span>
                  ) : (
                    <span className={styles.placeholder}>
                      {I18N.carbonFootprint.productName}
                    </span>
                  )}
                </div>
                <span>{I18N.carbonFootprint3.in}</span>
                <div className={styles.infoWrapper}>
                  <RangePicker
                    value={period}
                    allowClear={false}
                    variant='borderless'
                    onChange={setPeriod}
                  />
                </div>
                <span>{I18N.carbonFootprint3.duringTheAccountingPeriod}</span>
                <div className={styles.infoWrapper}>
                  <Cascader
                    value={scope.map(item => item.map(i => i.value))}
                    maxTagCount='responsive'
                    multiple
                    variant='borderless'
                    options={[
                      {
                        value: HALF,
                        label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[HALF],
                      },
                      {
                        value: FULL,
                        label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[FULL],
                      },
                      {
                        value: CUSTOM,
                        label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[CUSTOM],
                        children: Object.values(QUICK_ACCOUNT_LIFE_CYCLE).map(
                          value => ({
                            value,
                            label: QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[value],
                          }),
                        ),
                      },
                    ]}
                    onChange={(_, opt) => {
                      onScopeChange(
                        opt as unknown as { value: number; label: string }[][],
                      );
                    }}
                  >
                    <div className={styles.dropdownContent}>
                      {scope[0] ? (
                        <span>{scope[0][0].label}</span>
                      ) : (
                        <span className={styles.placeholder}>
                          {I18N.carbonFootprint3.lifeCycle}
                        </span>
                      )}
                      <IconAlibabaNew
                        className={styles.dropdownIcon}
                        type='icon-chevron-down'
                      />
                    </div>
                  </Cascader>
                </div>
                <span>{I18N.carbonFootprint3.productCarbonFootprint2}</span>
                <div
                  className={classNames(
                    styles.infoWrapper,
                    styles.factorPreferenceWrapper,
                  )}
                >
                  <Select
                    className={styles.factorPreferenceSelect}
                    allowClear
                    value={factorPreferenceValue}
                    variant='borderless'
                    optionLabelProp='label'
                    popupClassName={styles.factorPreferencePopup}
                    popupMatchSelectWidth={240}
                    suffixIcon={
                      <IconAlibabaNew
                        className={styles.dropdownIcon}
                        type='icon-chevron-down'
                      />
                    }
                    onChange={value => {
                      setFactorPreferenceValue(value || '');
                    }}
                  >
                    <Select.Option
                      value={ALL_FACTOR_PREFERENCE_VALUE}
                      label={I18N.carbonFootprint3.whole}
                    >
                      <div
                        className={classNames(styles.factorPreferenceOption, {
                          [styles.factorPreferenceOptionSelected]:
                            factorPreferenceValue ===
                            ALL_FACTOR_PREFERENCE_VALUE,
                        })}
                      >
                        <div
                          className={styles.factorPreferenceOptionName}
                          title={I18N.carbonFootprint3.whole}
                        >
                          {I18N.carbonFootprint3.whole}
                        </div>
                        <div
                          className={styles.factorPreferenceOptionSource}
                          title={
                            I18N.carbonFootprint3.allBackgroundDatabaseSources
                          }
                        >
                          {I18N.carbonFootprint3.allBackgroundDatabaseSources}
                        </div>
                      </div>
                    </Select.Option>
                    {factorPreferencePlans.map(plan => {
                      const planId = String(plan.id);
                      const sourceNames = getSourceNamesText(plan.sourceNames);
                      return (
                        <Select.Option
                          key={planId}
                          value={planId}
                          label={plan.name}
                        >
                          <div
                            className={classNames(
                              styles.factorPreferenceOption,
                              {
                                [styles.factorPreferenceOptionSelected]:
                                  factorPreferenceValue === planId,
                              },
                            )}
                          >
                            <div
                              className={styles.factorPreferenceOptionName}
                              title={plan.name}
                            >
                              {plan.name}
                            </div>
                            <div
                              className={styles.factorPreferenceOptionSource}
                              title={sourceNames}
                            >
                              {sourceNames}
                            </div>
                          </div>
                        </Select.Option>
                      );
                    })}
                  </Select>
                </div>
                <span>{I18N.carbonFootprint3.referenceModelingData}</span>
                <div
                  className={styles.infoWrapper}
                  onClick={() => setFileModalOpen(true)}
                >
                  {files.length > 0 ? (
                    <div className={styles.fileContent}>
                      {files.map(file => (
                        <div className={styles.file} key={file.uid}>
                          <span title={file.name} className={styles.fileName}>
                            {file.name}
                          </span>
                          <IconAlibabaNew
                            className={styles.fileCloseIcon}
                            type='icon-icon-guanbi'
                            onClick={e => {
                              e.stopPropagation();
                              setFiles(files.filter(f => f.uid !== file.uid));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Tooltip
                      title={I18N.carbonFootprint3.canAddData}
                      placement='bottom'
                    >
                      <span className={styles.placeholder}>
                        <IconAlibabaNew
                          className={styles.uploadIcon}
                          type='icon-shangchuan'
                        />
                        {I18N.esg.uploadData}
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
              <Input.TextArea
                className={styles.descInput}
                value={description}
                autoFocus
                placeholder={I18N.carbonFootprint3.enterOtherDescriptions}
                variant='borderless'
                maxLength={1000}
                onChange={e => setDescription(e.target.value)}
              />
              <div className={styles.infoFooter}>
                <div
                  className={classNames(styles.deepThinkBtn, {
                    [styles.activeDeepThinkBtn]: !!deepThink,
                    [styles.disabledDeepThinkBtn]: deepThinkDisabled,
                  })}
                  onClick={() => {
                    if (!deepThinkDisabled) {
                      setDeepThink(Number(!deepThink));
                    }
                  }}
                >
                  <IconAlibabaNew type='icon-icon-shendusikao' />
                  <span>{I18N.carbonFootprint3.deepThinking}</span>
                </div>
                <Button
                  className={styles.confirmBtn}
                  type='primary'
                  icon={<img alt='' src={upArrowSvg} />}
                  loading={loading}
                  onClick={createAccount}
                />
              </div>
            </div>
          </Skeleton>

          <div className={styles.customAddContent}>
            <div
              className={styles.customAdd}
              onClick={() => {
                setAccountModalProps({
                  open: true,
                  accountType: FootprintAccountStatusType.QUICK,
                });
              }}
            >
              <IconAlibaba
                className={styles.customAddIcon}
                type='icon-icon_kuaisu'
              />
              <span>{I18N.carbonFootprint3.newQuickCore}</span>
            </div>
            <div
              className={styles.customAdd}
              onClick={() => {
                setAccountModalProps({
                  open: true,
                  accountType: FootprintAccountStatusType.PROCESS,
                });
              }}
            >
              <IconAlibaba
                className={styles.customAddIcon}
                type='icon-icon_qiehuanzhikeshihua'
              />
              <span>{I18N.carbonFootprint3.newProcessCore}</span>
            </div>
            <div
              className={styles.customAdd}
              onClick={() => setSelectModelModalOpen(true)}
            >
              <IconAlibabaNew
                className={styles.customAddIcon}
                type='icon-moban'
              />
              <span>{I18N.carbonFootprint3.selectTemplate}</span>
            </div>
          </div>
        </div>
      </div>
    </FullscreenModal>
  );
};

export default AddAccount;
