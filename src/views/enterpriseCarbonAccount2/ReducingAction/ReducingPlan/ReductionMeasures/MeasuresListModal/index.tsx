import useUrlState from '@ahooksjs/use-url-state';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import {
  Button,
  Input,
  Modal,
  Popconfirm,
  Popover,
  Segmented,
  Select,
  Spin,
} from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';

import Empty from '@/components/Empty';
import { IconAlibaba } from '@/components/iconfont';
import { useScope } from '@/hooks/useScope';
import { Toast } from '@/utils/Toast';

import styles from './index.module.less';
import CustomMeasuresDrawer from '../CustomMeasuresDrawer';
import MeasuresFillModal from '../MeasuresFillDrawer';
import MeasuresModal from '../MeasuresModal';
import {
  FEASIBILITY_LABEL,
  MEASURES_CHANNEL_TYPE,
  MEASURES_SETTING_TYPE,
  MEASURES_TYPE,
  MEASURES_TYPE_LABEL,
} from '../constant';
import {
  addMeasures,
  applyMeasures,
  deleteMeasures,
  getMeasuresList,
} from '../service';
import { MeasuresType, AccountSetting } from '../type';
import { findCascadeValue } from '../utils';

const scopeCategory = [
  { label: I18N.enterpriseCarbonAccount2.scopeOne, value: 'scopeOne' },
  { label: I18N.enterpriseCarbonAccount2.scope2, value: 'scopeTwo' },
  { label: I18N.enterpriseCarbonAccount2.fanWeisan, value: 'scopeThree' },
];

const sortType = [
  { label: I18N.enterpriseCarbonAccount2.defaultSorting, value: 'default' },
  { label: I18N.enterpriseCarbonAccount2.range, value: 'scopes' },
  { label: I18N.enterpriseCarbonAccount2.feasibility, value: 'feasibility' },
];

const orderType = [
  { label: I18N.enterpriseCarbonAccount2.positiveSequence, value: 'asc' },
  { label: I18N.enterpriseCarbonAccount2.reverseOrder, value: 'desc' },
];

type MeasuresListModalProps = {
  open: boolean;
  targetId: number;
  accountSetting: AccountSetting;
  onCancel: () => void;
  onSuccess: () => void;
};

const MeasuresListModal: FC<MeasuresListModalProps> = ({
  open,
  accountSetting,
  targetId,
  onCancel,
  onSuccess,
}) => {
  const [urlParams] = useUrlState<{ measureId?: string }>();

  const [loading, setLoading] = useState(false);

  const [measuresList, setMeasuresList] = useState<MeasuresType[]>([]);

  const [searchParams, setSearchParams] = useState<
    Partial<{
      category: string;
      name: string;
      type: number;
      sortKey: string;
      sortOrderBy: string;
    }>
  >({
    category: 'recommend',
    sortKey: 'default',
    sortOrderBy: 'asc',
  });

  const [customMeasuresDrawerOpen, setCustomMeasuresDrawerOpen] =
    useState(false);

  const [defaultMeasuresVal, setDefaultMeasuresVal] = useState<
    Record<string, any>
  >({});

  const [measuresModalOpen, setMeasuresModalOpen] = useState(false);

  const [fillMeasures, setFillMeasures] = useState<MeasuresType | null>(null);

  const scopeDict = useScope();

  const { category, type, sortKey, sortOrderBy } = searchParams;

  const getList = async params => {
    try {
      setLoading(true);
      const { data } = await getMeasuresList(params);
      setMeasuresList(data.data);
    } finally {
      setLoading(false);
    }
  };

  const onMeasuresAdd = async (measures: MeasuresType) => {
    await addMeasures({ ...measures, targetId });
    setCustomMeasuresDrawerOpen(false);
    setMeasuresModalOpen(false);
    Toast('success', I18N.carbonFootprint.successfullyAdded);
    onSuccess();
  };

  const onMeasuresDelete = async (measures: MeasuresType) => {
    await deleteMeasures({ id: measures.id });
    Toast('success', I18N.carbonFootprint.deleteSuccessful);
    getList(searchParams);
  };

  const onMeasuresApply = async data => {
    await applyMeasures({ ...data, targetId });
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    setFillMeasures(null);
    onSuccess();
  };

  const onNameChange = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
        });
      }, 300),
    [searchParams],
  );

  useEffect(() => {
    if (!open) {
      setSearchParams({
        category: 'recommend',
        sortKey: 'default',
        sortOrderBy: 'asc',
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      getList(searchParams);
    }
  }, [open, searchParams]);

  useMount(() => {
    if (urlParams.measureId) {
      setFillMeasures({ id: urlParams.measureId } as unknown as MeasuresType);
    }
  });

  return (
    <>
      <CustomMeasuresDrawer
        open={customMeasuresDrawerOpen}
        accountSetting={accountSetting}
        onCancel={() => setCustomMeasuresDrawerOpen(false)}
        onSetting={val => {
          setCustomMeasuresDrawerOpen(false);
          setDefaultMeasuresVal(val);
          setMeasuresModalOpen(true);
        }}
        onConfirm={data =>
          onMeasuresAdd({ ...data, measureType: MEASURES_SETTING_TYPE.SIMPLE })
        }
      />
      <MeasuresModal
        open={measuresModalOpen}
        defaultMeasuresVal={defaultMeasuresVal}
        accountSetting={accountSetting}
        onCancel={() => {
          setMeasuresModalOpen(false);
          setDefaultMeasuresVal({});
        }}
        onConfirm={data =>
          onMeasuresAdd({
            ...data,
            measureType: MEASURES_SETTING_TYPE.ADVANCED,
          })
        }
      />
      <MeasuresFillModal
        id={fillMeasures?.id}
        accountSetting={accountSetting}
        category={searchParams.category}
        onCancel={() => setFillMeasures(null)}
        onConfirm={onMeasuresApply}
      />

      <Modal
        className={styles.modal}
        width={1200}
        open={open}
        zIndex={1000}
        closeIcon={null}
        footer={null}
        destroyOnClose
        onClose={onCancel}
        onCancel={onCancel}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            {I18N.enterpriseCarbonAccount2.addMeasures}
          </div>
          <Input
            className={styles.nameInput}
            prefix={<SearchOutlined />}
            placeholder={I18N.enterpriseCarbonAccount2.measureName}
            onChange={e => onNameChange(e.target.value)}
          />
          <div className={styles.closeIcon} onClick={onCancel}>
            <CloseOutlined />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentLeft}>
            <div
              className={classNames(styles.category, {
                [styles.currCategory]: category === 'custom',
              })}
              onClick={() =>
                setSearchParams({ ...searchParams, category: 'custom' })
              }
            >
              <IconAlibaba type='icon-icon_library' />
              {I18N.carbonFootprint.custom}
            </div>
            <div className={styles.categorySplit} />
            <div
              className={classNames(styles.category, {
                [styles.currCategory]: category === 'recommend',
              })}
              onClick={() =>
                setSearchParams({ ...searchParams, category: 'recommend' })
              }
            >
              <IconAlibaba type='icon-icon_recommended' />
              {I18N.enterpriseCarbonAccount2.recommendedMeasures}
            </div>
            {scopeCategory.map(({ value, label }) => (
              <div
                className={classNames(styles.category, {
                  [styles.currCategory]: category === value,
                })}
                key={value}
                onClick={() =>
                  setSearchParams({ ...searchParams, category: value })
                }
              >
                <IconAlibaba type='icon-icon_scope' />
                {label}
              </div>
            ))}
          </div>
          <div className={styles.contentRight}>
            <div className={styles.searchContent}>
              <div className={styles.searchContentLeft}>
                <Select
                  className={styles.typeSelect}
                  value={type}
                  placeholder={
                    I18N.enterpriseCarbonAccount2.classificationOfMeasures
                  }
                  options={Object.values(MEASURES_TYPE).map(measuresType => ({
                    value: measuresType,
                    label: MEASURES_TYPE_LABEL[measuresType],
                  }))}
                  allowClear
                  onChange={typeVal =>
                    setSearchParams({ ...searchParams, type: typeVal })
                  }
                />
                <Segmented
                  value={sortKey}
                  options={sortType}
                  onChange={sortVal =>
                    setSearchParams({ ...searchParams, sortKey: sortVal })
                  }
                />
                <Segmented
                  value={sortOrderBy}
                  options={orderType}
                  onChange={orderVal =>
                    setSearchParams({ ...searchParams, sortOrderBy: orderVal })
                  }
                />
              </div>
              <Button onClick={() => setCustomMeasuresDrawerOpen(true)}>
                {I18N.enterpriseCarbonAccount2.customMeasures}
              </Button>
            </div>
            <Spin
              wrapperClassName={styles.spinning}
              className={styles.spinning}
              spinning={loading}
            >
              {measuresList.length > 0 ? (
                <div className={styles.measuresContent}>
                  {measuresList.map(measures => {
                    const {
                      id,
                      type: measuresType,
                      name,
                      measureDesc,
                      reduceResult,
                      feasibility,
                      channelType,
                    } = measures;

                    const [firstScope, ...restScope] = reduceResult.map(
                      ({ scope }) =>
                        findCascadeValue(scopeDict, scope, {
                          value: 'value',
                          label: 'name',
                          children: 'classifyList',
                        }),
                    );
                    return (
                      <div className={styles.measures} key={id}>
                        <div className={styles.measuresNameContent}>
                          <div className={styles.measuresName}>
                            <div className={styles.typeTag}>
                              {MEASURES_TYPE_LABEL[measuresType]}
                            </div>
                            <div>{name}</div>
                          </div>
                          <div
                            className={styles.measuresDesc}
                            title={measureDesc}
                          >
                            {measureDesc}
                          </div>
                        </div>
                        <div className={styles.measuresInfoContent}>
                          <div className={styles.measuresInfoLabel}>
                            {
                              I18N.enterpriseCarbonAccount2
                                .scopeOfEmissionReduction
                            }
                          </div>
                          <div className={styles.measuresScope}>
                            <div
                              className={styles.measuresInfo}
                              title={`${firstScope?.[0]?.name}-${firstScope?.[1]?.name}`}
                            >
                              {firstScope?.[0]?.name}-{firstScope?.[1]?.name}
                            </div>
                            {restScope.length > 0 && (
                              <Popover
                                content={restScope.map(item => (
                                  <div
                                    key={`${item[0]?.value}${item[1]?.value}`}
                                  >
                                    {item[0]?.name}-{item[1]?.name}
                                  </div>
                                ))}
                              >
                                <div className={styles.scopeBubble}>
                                  +{restScope.length}
                                </div>
                              </Popover>
                            )}
                          </div>
                        </div>
                        <div className={styles.measuresInfoContent}>
                          <div className={styles.measuresInfoLabel}>
                            {I18N.enterpriseCarbonAccount2.feasibility}
                          </div>
                          <div className={styles.measuresInfo}>
                            {FEASIBILITY_LABEL[feasibility]}
                          </div>
                        </div>
                        <div className={styles.operateContent}>
                          <Button
                            type='primary'
                            onClick={() => {
                              setFillMeasures(measures);
                            }}
                          >
                            {I18N.carbonFootprint.add}
                          </Button>
                          {channelType === MEASURES_CHANNEL_TYPE.CUSTOM && (
                            <Popconfirm
                              title={I18N.carbonFootprint.confirm}
                              description={
                                I18N.enterpriseCarbonAccount2
                                  .doYouWantToDeleteIt2
                              }
                              onConfirm={() => onMeasuresDelete(measures)}
                            >
                              <Button
                                icon={<IconAlibaba type='icon-icon_delete' />}
                              />
                            </Popconfirm>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty className={styles.emptyContent} />
              )}
            </Spin>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MeasuresListModal;
