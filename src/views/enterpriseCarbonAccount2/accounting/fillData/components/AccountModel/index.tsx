import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Input, Modal, Spin, Switch } from 'antd';
import classNames from 'classnames';
import { debounce, isNil, throttle } from 'lodash-es';
import { cloneElement, FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import arrowLeftImg from '@/assets/svg/arrow_left.svg';
import emptyImg from '@/assets/svg/empty.svg';
import Permission from '@/components/Permission';
import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibaba } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils/Toast';
import { COMPUTATION_STATUS } from '@/views/enterpriseCarbonAccount2/constant';

import ModelCard from './ModelCard';
import ModelDetails from './ModelDetails';
import { MODEL_CATEGORY } from './constant';
import styles from './index.module.less';
import {
  getApplySetting,
  getModelDetails,
  getModelList,
  postApplyModel,
} from './service';
import { ListModel, ModelDetails as ModelDetailsType } from './type';

type AccountModelListProps = {
  orgId: string;
  computationId: string;
  computationPeriod?: string;
  onClose: () => void;
  onSuccess: () => void;
};

const PAGE_SIZE = 9;
const AccountModelList: FC<AccountModelListProps> = ({
  orgId,
  computationId,
  computationPeriod,
  onSuccess,
  onClose,
}) => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    type: MODEL_CATEGORY.RECOMMEND,
    pageNum: 1,
    pageSize: PAGE_SIZE,
  });

  const [modelList, setModelList] = useState<ListModel[]>([]);

  const [currModel, setCurrModel] = useState<ListModel | null>(null);

  const [modelDetails, setModelDetails] = useState<ModelDetailsType | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  const [settingModalOpen, setSettingModalOpen] = useState(false);

  const [applySetting, setApplySetting] = useState<Record<
    string,
    boolean
  > | null>(null);

  const history = useHistory();
  const totalPage = useRef(1);
  const modelListRef = useRef<ListModel[]>([]);
  const scrollLoadRef = useRef(false);
  const modelListContainer = useRef<HTMLDivElement | null>(null);

  const applySettingKeys = Object.keys(applySetting || {});

  const onSearchParamsChange = (params: Partial<typeof searchParams>) => {
    setSearchParams({
      ...searchParams,
      ...params,
    });
  };

  const onInputChange = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          pageNum: 1,
          name,
        });
      }, 300),
    [searchParams],
  );

  const onModelListScroll = useMemo(
    () =>
      throttle(
        (e: {
          target: {
            scrollHeight: number;
            scrollTop: number;
            clientHeight: number;
          };
        }) => {
          const { scrollHeight, scrollTop, clientHeight } = e.target;
          const { pageNum } = searchParams;
          if (
            !scrollLoadRef.current &&
            scrollTop + clientHeight >= scrollHeight - 3 &&
            pageNum < totalPage.current
          ) {
            scrollLoadRef.current = true;
            setSearchParams({
              ...searchParams,
              pageNum: pageNum + 1,
            });
          }
        },
        100,
      ),
    [searchParams],
  );

  const onModelPreview = async (model: ListModel) => {
    try {
      setLoading(true);

      const { modelId, period, modelType } = model;
      const { data } = await getModelDetails({
        modelId,
        period,
        modelType,
      });
      setModelDetails(data.data);
      setCurrModel(model);
    } finally {
      setLoading(false);
    }
  };

  const applyModel = async (model: ListModel) => {
    try {
      setLoading(true);
      await postApplyModel({
        computationId,
        computationPeriod,
        modelId: model.modelId,
        modelType: model.modelType,
        modelPeriod: model.period,
        ...applySetting,
      });
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      setSettingModalOpen(false);
      onClose();
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const onModelApply = async (model: ListModel) => {
    const { data } = await getApplySetting({
      computationId,
      period: computationPeriod,
      modelType: model.modelType,
    });
    const { clearCurrentData, copyActivityData, copyAppointData } =
      data.data || {};

    let setting: Record<string, boolean> = {};

    if (clearCurrentData || copyActivityData || copyAppointData) {
      if (clearCurrentData) {
        setting = { ...setting, clearCurrentData: false };
      }
      if (copyActivityData) {
        setting = {
          ...setting,
          copyActivityData: false,
          copyAttachment: false,
        };
      }
      if (copyAppointData) {
        setting = { ...setting, copyAppointData: false };
      }

      setSettingModalOpen(true);
      setApplySetting(setting);
      setCurrModel(model);
    } else {
      applyModel(model);
    }
  };

  useEffect(() => {
    if (modelListContainer.current) {
      modelListContainer.current.scrollTop = 0;
    }
  }, [searchParams.name, searchParams.type]);

  useEffect(() => {
    setLoading(true);

    getModelList({ ...searchParams, orgId, computationId, computationPeriod })
      .then(({ data }) => {
        const { total, rows } = data;
        modelListRef.current = scrollLoadRef.current
          ? [...modelListRef.current, ...rows]
          : rows;
        setModelList(modelListRef.current);
        totalPage.current = Math.ceil(total / PAGE_SIZE);
      })
      .finally(() => {
        scrollLoadRef.current = false;
        setLoading(false);
      });
  }, [searchParams, orgId, computationId, computationPeriod]);

  return (
    <Spin spinning={loading} wrapperClassName={styles.spin}>
      <div className={styles.modalHeader}>
        {!modelDetails ? (
          <>
            <div className={styles['title-s-b']}>
              {I18N.components.usingModels}
            </div>
            <Input
              className={styles.searchInput}
              defaultValue={searchParams.name}
              placeholder={I18N.enterpriseCarbonAccount2.modelNameMaster}
              prefix={<SearchOutlined className={styles.searchIcon} />}
              onChange={e => onInputChange(e.target.value)}
            />
          </>
        ) : (
          <div className={styles.currModelInfo}>
            <div
              className={styles.arrowLeftImg}
              onClick={() => {
                setCurrModel(null);
                setModelDetails(null);
              }}
            >
              <img alt='' src={arrowLeftImg} />
            </div>
            <div className={styles.currModelName}>{currModel?.name}</div>
            <div className={styles.currModelDesc}>{currModel?.desc}</div>
          </div>
        )}
        <CloseOutlined onClick={onClose} />
      </div>
      <div className={styles.modalContent}>
        {!modelDetails ? (
          <div className={styles.modelContent}>
            <div className={styles.modelCategory}>
              <div
                className={classNames(styles.category, {
                  [styles.currentCategory]:
                    searchParams.type === MODEL_CATEGORY.RECOMMEND,
                })}
                onClick={() =>
                  onSearchParamsChange({
                    type: MODEL_CATEGORY.RECOMMEND,
                    pageNum: 1,
                  })
                }
              >
                <IconAlibaba type='icon-icon_recommended' />
                <div className={styles.categoryName}>
                  {I18N.enterpriseCarbonAccount2.recommendedModel}
                </div>
              </div>
              <div className={styles.categorySplit} />
              <div
                className={classNames(styles.category, {
                  [styles.currentCategory]:
                    searchParams.type === MODEL_CATEGORY.LIB,
                })}
                onClick={() =>
                  onSearchParamsChange({ type: MODEL_CATEGORY.LIB, pageNum: 1 })
                }
              >
                <IconAlibaba type='icon-icon_library' />
                <div className={styles.categoryName}>
                  {I18N.carbonFootprint3.modelBase}
                </div>
              </div>
              <div
                className={classNames(styles.category, {
                  [styles.currentCategory]:
                    searchParams.type === MODEL_CATEGORY.HISTORY_ACCOUNT,
                })}
                onClick={() =>
                  onSearchParamsChange({
                    type: MODEL_CATEGORY.HISTORY_ACCOUNT,
                    pageNum: 1,
                  })
                }
              >
                <IconAlibaba type='icon-icon_history' />
                <div className={styles.categoryName}>
                  {I18N.enterpriseCarbonAccount2.historicalAccounting}
                </div>
              </div>
            </div>
            {modelList.length > 0 ? (
              <div
                className={styles.modelListContent}
                ref={modelListContainer}
                // @ts-ignore
                onScroll={onModelListScroll}
              >
                <div className={styles.modelList}>
                  {modelList.map(model => (
                    <ModelCard
                      model={model}
                      onPreview={onModelPreview}
                      onApply={onModelApply}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.empty}>
                <div>
                  <img alt='' src={emptyImg} />
                  <div className={styles.emptyTip}>
                    {I18N.enterpriseCarbonAccount2.noModelsAvailableAtTheMoment}
                  </div>
                </div>
                <Permission flag='enterprise:model:add'>
                  <Button
                    onClick={() =>
                      history.push(
                        RouteMaps.enterpriseCarbonAccountingModelDetail,
                      )
                    }
                    type='primary'
                  >
                    {I18N.router.newModelAdded}
                  </Button>
                </Permission>
              </div>
            )}
          </div>
        ) : (
          <ModelDetails
            model={currModel}
            modelDetails={modelDetails}
            onCancel={() => {
              setModelDetails(null);
              setCurrModel(null);
            }}
            onApply={() => {
              if (currModel) {
                onModelApply(currModel);
              }
            }}
          />
        )}
      </div>
      <Modal
        title={I18N.components.usingModels}
        centered
        open={settingModalOpen}
        width={512}
        okButtonProps={{ loading }}
        onClose={() => {
          setSettingModalOpen(false);
          setApplySetting(null);
        }}
        onCancel={() => {
          setSettingModalOpen(false);
          setApplySetting(null);
        }}
        onOk={() => {
          if (currModel) {
            applyModel(currModel);
          }
        }}
      >
        <div className={styles.setting}>
          {applySettingKeys.includes('clearCurrentData') && (
            <div className={styles.settingItem}>
              <span className={styles.settingDesc}>
                {I18N.enterpriseCarbonAccount2.clearTheCurrentNumber}
              </span>
              <Switch
                value={applySetting?.clearCurrentData}
                onChange={val =>
                  setApplySetting({ ...applySetting, clearCurrentData: val })
                }
              />
            </div>
          )}
          {applySettingKeys.includes('copyActivityData') && (
            <div className={styles.settingItem}>
              <span className={styles.settingDesc}>
                {I18N.enterpriseCarbonAccount2.copyTemplate2}
              </span>
              <Switch
                value={applySetting?.copyActivityData}
                onChange={val =>
                  setApplySetting({ ...applySetting, copyActivityData: val })
                }
              />
            </div>
          )}
          {applySettingKeys.includes('copyAttachment') && (
            <div className={styles.settingItem}>
              <span className={styles.settingDesc}>
                {I18N.enterpriseCarbonAccount2.copyTemplate3}
              </span>
              <Switch
                value={applySetting?.copyAttachment}
                onChange={val =>
                  setApplySetting({ ...applySetting, copyAttachment: val })
                }
              />
            </div>
          )}
          {applySettingKeys.includes('copyAppointData') && (
            <div className={styles.settingItem}>
              <span className={styles.settingDesc}>
                {I18N.enterpriseCarbonAccount2.copyTemplate}
              </span>
              <Switch
                value={applySetting?.copyAppointData}
                onChange={val =>
                  setApplySetting({ ...applySetting, copyAppointData: val })
                }
              />
            </div>
          )}
        </div>
      </Modal>
    </Spin>
  );
};

const AccountModel: FC<
  Omit<AccountModelListProps, 'onClose'> & {
    children: React.ReactElement;
    isLightUser: boolean;
    lightFeatureSet: Record<string, number>;
    computationStatus?: number;
    openSubscription: () => void;
  }
> = ({
  orgId,
  children,
  isLightUser,
  lightFeatureSet,
  computationId,
  computationPeriod,
  computationStatus,
  onSuccess,
  openSubscription,
}) => {
  const [open, setOpen] = useState(false);

  const closeDrawer = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (
      !!checkPermissions(true, 'enterprise:computation:edit') &&
      !isNil(computationStatus) &&
      (!isLightUser || lightFeatureSet.model)
    ) {
      getApplySetting({
        computationId,
        period: computationPeriod,
      }).then(({ data }) => {
        setOpen(
          !data.data.clearCurrentData &&
            computationStatus !== COMPUTATION_STATUS.COMPLETE,
        );
      });
    }
  }, [
    isLightUser,
    lightFeatureSet,
    computationStatus,
    computationId,
    computationPeriod,
  ]);

  return (
    <>
      <Modal
        className={styles.modal}
        width={1232}
        centered
        open={open}
        closeIcon={null}
        footer={null}
        destroyOnClose
        onClose={closeDrawer}
        onCancel={closeDrawer}
      >
        <AccountModelList
          orgId={orgId}
          computationId={computationId}
          computationPeriod={computationPeriod}
          onClose={closeDrawer}
          onSuccess={onSuccess}
        />
      </Modal>
      {cloneElement(children, {
        onClick: () => {
          if (isLightUser && !lightFeatureSet.model) {
            openSubscription();
          } else {
            setOpen(true);
          }
        },
      })}
    </>
  );
};

export default AccountModel;
