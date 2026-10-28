/* eslint-disable react/no-unstable-nested-components */
import I18N from '@src/lang/I18N';
import { PageInfoType } from '@src/router/type';
import Animation from '@views/carbonFootprint3/FootprintAccount/component/AccountInfoBuildModel/BuildModelDescribe/components/AiModal/animations.json';
import { useMount, useUnmount } from 'ahooks';
import {
  Button,
  Input,
  Modal,
  Progress,
  Table,
  TableColumnsType,
  Tabs,
  Cascader,
  Checkbox,
  InputNumber,
} from 'antd';
import { debounce, isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import Lottie from 'react-lottie-player';

import AiImg from '@/assets/svg/ai.svg';
import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibabaNew } from '@/components/iconfont';
import { useUnit } from '@/hooks/useScope';
import { Toast } from '@/utils';

import styles from './index.module.less';
import {
  cancelAiModel,
  deleteTempEmissionSource,
  editTempEmissionSource,
  getGHGList,
  getTempList,
  importTempData,
} from './service';
import { EmissionSource, SearchParams } from './type';
import { AddSource } from '../../accounting/fillData/components/addSource';
import { IMPORT_STATUS } from '../constant';
import { getImportStatus } from '../service';

const GHGFilter = (props: {
  value: string[];
  options: {
    id: string;
    name: string;
    children: { id: string; name: string }[];
  }[];
  onChange: (val: string[]) => void;
}) => {
  const { value = [], options, onChange } = props;

  const [activeOpt, setActiveOpt] = useState(() => options[0]);

  return (
    <div className={styles.ghgFilter}>
      <div className={styles.categoryFilterContent}>
        {options.map(category => {
          const { id, name, children } = category;
          const childrenIds = (children || []).map(child => child.id);
          const checked = childrenIds.every(childId => value.includes(childId));
          return (
            <div
              className={styles.ghgFilterItem}
              key={id}
              onMouseEnter={() => setActiveOpt(category)}
            >
              <Checkbox
                checked={checked}
                indeterminate={
                  !checked &&
                  childrenIds.some(childId => value.includes(childId))
                }
                onChange={e => {
                  onChange(
                    e.target.checked
                      ? [...new Set([...value, ...childrenIds])]
                      : value.filter(val => !childrenIds.includes(val)),
                  );
                }}
              >
                {name}
              </Checkbox>
            </div>
          );
        })}
      </div>
      <div className={styles.ghgFilterSplit} />
      <div className={styles.classifyFilterContent}>
        {(activeOpt?.children || []).map(classify => {
          const { id, name } = classify;
          return (
            <div className={styles.ghgFilterItem} key={id}>
              <Checkbox
                checked={value.includes(id)}
                onChange={e => {
                  onChange(
                    e.target.checked
                      ? [...new Set([...value, id])]
                      : value.filter(val => val !== id),
                  );
                }}
              >
                {name}
              </Checkbox>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AiImportContent = ({
  importStatus: importStatusFromProps,
  computationId,
  computationPeriod,
  onClose,
  onImportSuccess,
}: {
  importStatus: number;
  computationId: string;
  computationPeriod: string;
  onClose: () => void;
  onImportSuccess: () => void;
}) => {
  const [importStatus, setImportStatus] = useState(() => importStatusFromProps);

  const [emissionSourceList, setEmissionSourceList] = useState<
    EmissionSource[]
  >([]);

  const emissionSourceIdRef = useRef('');

  const drawerChildDive = useRef<HTMLDivElement>(null);

  const compositionRef = useRef(false);

  const [total, setTotal] = useState(0);

  const [tab, setTab] = useState('all');

  const [editId, setEditId] = useState<number | null>(null);

  const [GHGList, setGHGList] = useState<
    { id: string; name: string; children: { id: string; name: string }[] }[]
  >([]);

  const [searchParams, setSearchParams] = useState<SearchParams>(() => ({
    pageNum: 1,
    pageSize: 10,
    computationId,
    computationPeriod,
  }));

  const [progress, setProgress] = useState(0);

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const timer = useRef<NodeJS.Timeout>();

  const unitDict = useUnit();

  const hasEditPermission = !!checkPermissions(
    true,
    'enterprise:computation:edit',
  );

  const queryEmissionList = async (params: SearchParams) => {
    try {
      setLoading(true);
      const { data } = await getTempList(params);
      setTotal(data.total);
      setEmissionSourceList(data.rows);
    } finally {
      setLoading(false);
    }
  };

  const loopImportStatus = async (arg: {
    prevProgress: number;
    computationId: string;
    computationPeriod: string;
  }) => {
    const { data } = await getImportStatus({
      computationId: arg.computationId,
      computationPeriod: arg.computationPeriod,
    });
    const status = data.data;

    const newProgress = Number(
      Math.min(95, 0.5 + Math.random() + arg.prevProgress).toFixed(2),
    );
    setImportStatus(status);
    setProgress(newProgress);

    if (status === IMPORT_STATUS.NOT_EXIST_OR_FAIL) {
      Toast('error', I18N.enterpriseCarbonAccount2.analysisFailed);
      onClose();
    }

    if (status === IMPORT_STATUS.PENDING) {
      timer.current = setTimeout(
        () =>
          loopImportStatus({
            ...arg,
            prevProgress: newProgress,
          }),
        1000,
      );
    }
  };

  const updateTempData = useMemo(
    () => async (emissionSource: EmissionSource, params: SearchParams) => {
      try {
        setLoading(true);
        await editTempEmissionSource(emissionSource);
        Toast('success', I18N.carbonFootprint.editSuccessful);
        queryEmissionList(params);
      } catch {
        setLoading(false);
      }
    },
    [],
  );

  const debounceUpdateTempData = useMemo(
    () =>
      debounce((emissionSource: EmissionSource, params: SearchParams) => {
        updateTempData(emissionSource, params);
      }, 1000),
    [updateTempData],
  );

  const onTempEmissionSourceDelete = (id: number) => {
    Modal.confirm({
      title: I18N.base.confirm,
      content: I18N.enterpriseCarbonAccount2.doYouWantToDeleteIt2,
      onOk: async () => {
        await deleteTempEmissionSource(id);
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        queryEmissionList(searchParams);
      },
    });
  };

  const onCancel = () => {
    Modal.confirm({
      title: I18N.base.confirm,
      content: I18N.enterpriseCarbonAccount2.confirmToCancelThis,
      onOk: async () => {
        await cancelAiModel({ computationId, computationPeriod });
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        onClose();
      },
    });
  };

  const submit = async () => {
    try {
      setSubmitLoading(true);
      const { data } = await importTempData({
        computationId,
        computationPeriod,
      });
      if (data.data.errorCode) {
        Toast(
          'error',
          data.data.errorMsg || I18N.enterpriseCarbonAccount2.operationFailed,
        );
        queryEmissionList(searchParams);
      } else {
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        onClose();
        onImportSuccess();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: TableColumnsType<EmissionSource> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: 'No',
      width: 100,
      fixed: 'left',
      render: (_, { repeatFlag, errorFlag }, index) => (
        <div className={styles.noColumn}>
          <div className={styles.no}>
            {(searchParams.pageNum - 1) * searchParams.pageSize + index + 1}
          </div>
          {(!!repeatFlag || !!errorFlag) && (
            <div className={styles.errorTagContent}>
              {!!errorFlag && <div className={styles.errorTag}>Error</div>}
              {!!repeatFlag && <div className={styles.errorTag}>Repeat</div>}
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <div className={styles.columnTitle}>
          <span className={styles.requireSign}>*</span>
          <span>{I18N.eca.ghgClassification}</span>
        </div>
      ),
      dataIndex: 'ghg',
      ellipsis: true,
      width: 180,
      filterDropdownProps: {
        destroyPopupOnHide: true,
      },
      filterDropdown: props => {
        const { selectedKeys, setSelectedKeys, confirm } = props;
        return (
          <GHGFilter
            value={selectedKeys as string[]}
            options={GHGList}
            onChange={val => {
              setSelectedKeys(val);
              confirm({ closeDropdown: false });
            }}
          />
        );
      },
      render: (_, record) => {
        const {
          id,
          ghgClassify,
          ghgCategory,
          ghgCategoryName,
          ghgClassifyName,
        } = record;

        if (editId === id && hasEditPermission) {
          return (
            <Cascader
              className={styles.formComponent}
              value={ghgCategory ? [ghgCategory, ghgClassify] : undefined}
              options={GHGList}
              fieldNames={{ value: 'id', label: 'name' }}
              placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectGh}
              allowClear={false}
              status={ghgCategory ? '' : 'error'}
              onChange={(ghg, ghgOpt) => {
                Object.assign(record, {
                  ghgCategory: ghg[0],
                  ghgCategoryName: ghgOpt[0]?.name,
                  ghgClassify: ghg[1],
                  ghgClassifyName: ghgOpt[1]?.name,
                });
                updateTempData(record, searchParams);
              }}
            />
          );
        }

        return `${ghgCategoryName || '-'}/${ghgClassifyName || '-'}`;
      },
    },
    {
      title: (
        <div className={styles.columnTitle}>
          <span className={styles.requireSign}>*</span>
          <span>{I18N.carbonData.emissionSources}</span>
        </div>
      ),
      dataIndex: 'name',
      ellipsis: true,
      width: 180,
      render: (_, record) => {
        const { id } = record;

        if (editId === id && hasEditPermission) {
          return (
            <Input
              className={styles.formComponent}
              placeholder={I18N.carbonFootprint3.emissionSourceName}
              value={record.name}
              maxLength={100}
              status={record.name ? '' : 'error'}
              onCompositionStart={() => {
                compositionRef.current = true;
              }}
              onCompositionEnd={() => {
                compositionRef.current = false;
              }}
              onChange={e => {
                Object.assign(record, { name: e.target.value });
                setEmissionSourceList([...emissionSourceList]);

                setTimeout(() => {
                  if (!compositionRef.current) {
                    debounceUpdateTempData(record, searchParams);
                  }
                }, 50);
              }}
            />
          );
        }
        return (
          record.name || (
            <div className={styles.emptyTip}>
              {I18N.carbonFootprint3.pleaseEnterEmissions}
            </div>
          )
        );
      },
    },
    {
      title: (
        <div className={styles.columnTitle}>
          <span className={styles.requireSign}>*</span>
          <span>{I18N.enterpriseCarbonAccount2.facilityScene}</span>
        </div>
      ),
      dataIndex: 'facility',
      ellipsis: true,
      width: 180,
      render: (_, record) => {
        const { id } = record;

        if (editId === id && hasEditPermission) {
          return (
            <Input
              className={styles.formComponent}
              placeholder={I18N.enterpriseCarbonAccount2.facilityScene}
              value={record.facility}
              maxLength={100}
              status={record.facility ? '' : 'error'}
              onCompositionStart={() => {
                compositionRef.current = true;
              }}
              onCompositionEnd={() => {
                compositionRef.current = false;
              }}
              onChange={e => {
                Object.assign(record, { facility: e.target.value });
                setEmissionSourceList([...emissionSourceList]);

                setTimeout(() => {
                  if (!compositionRef.current) {
                    debounceUpdateTempData(record, searchParams);
                  }
                }, 50);
              }}
            />
          );
        }
        return record.facility || '-';
      },
    },
    {
      title: I18N.carbonFootprint3.activityData,
      dataIndex: 'activityData',
      ellipsis: true,
      width: 180,
      render: (_, record) => {
        const { id } = record;

        if (editId === id && hasEditPermission) {
          return (
            <InputNumber
              className={styles.formComponent}
              placeholder={I18N.carbonFootprint3.activityData}
              value={record.activityData}
              controls={false}
              min={0}
              stringMode
              onChange={val => {
                Object.assign(record, { activityData: val });
                setEmissionSourceList([...emissionSourceList]);
                debounceUpdateTempData(record, searchParams);
              }}
            />
          );
        }
        return !isNil(record.activityData) ? record.activityData : '-';
      },
    },
    {
      title: (
        <div className={styles.columnTitle}>
          <span className={styles.requireSign}>*</span>
          <span>{I18N.carbonFootprint.unit}</span>
        </div>
      ),
      dataIndex: 'activityUnit',
      ellipsis: true,
      width: 180,
      render: (_, record) => {
        const { id, activityUnitName, unitCodeArr } = record;

        if (editId === id && hasEditPermission) {
          return (
            <Cascader
              className={styles.formComponent}
              value={unitCodeArr?.split(',')}
              options={unitDict}
              placeholder={I18N.carbonFootprint.pleaseSelectAUnit}
              allowClear={false}
              status={unitCodeArr ? '' : 'error'}
              showSearch={{
                filter: (
                  inputValue: string,
                  path: { label: string; value: string }[],
                ) =>
                  !!(path[0]?.label || '')
                    .toLocaleLowerCase()
                    .includes(inputValue.toLocaleLowerCase()) ||
                  !!(path[1]?.label || '')
                    .toLocaleLowerCase()
                    .includes(inputValue.toLocaleLowerCase()),
              }}
              onChange={(unit, unitOpt) => {
                Object.assign(record, {
                  activityUnit: unitOpt[1].value,
                  activityUnitName: unitOpt[1].label,
                  unitCodeArr: unit.join(','),
                });
                updateTempData(record, searchParams);
              }}
            />
          );
        }

        return activityUnitName || '-';
      },
    },
    {
      title: I18N.carbonFootprint3.numberOfBackgroundFactors,
      dataIndex: 'factorValue',
      ellipsis: true,
      width: 220,
      render: (_, { factorValue, factorUnit, factorUnitM }) =>
        factorValue ? `${factorValue} ${factorUnit}/${factorUnitM}` : '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'ope',
      ellipsis: true,
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.operateColumn}>
          <Button
            type='link'
            onClick={() => {
              Object.assign(record, { edit: false });
              setEmissionSourceList([...emissionSourceList]);
              emissionSourceIdRef.current = `${record.id}`;
              drawerChildDive.current?.click();
            }}
          >
            {I18N.carbonFootprint3.details}
          </Button>
          {hasEditPermission && (
            <Button
              type='link'
              onClick={() => onTempEmissionSourceDelete(record.id)}
            >
              {I18N.carbonFootprint.delete}
            </Button>
          )}
        </div>
      ),
    },
  ];

  useMount(() => {
    getGHGList().then(({ data }) => {
      setGHGList(data.data);
    });

    if (importStatus === IMPORT_STATUS.PENDING) {
      loopImportStatus({
        prevProgress: progress,
        computationId,
        computationPeriod,
      });
    }
  });

  useUnmount(() => {
    clearInterval(timer.current);
  });

  useEffect(() => {
    if (importStatus === IMPORT_STATUS.DONE) {
      queryEmissionList(searchParams);
    }
  }, [importStatus, searchParams]);

  return (
    <div className={styles.content}>
      <AddSource
        id={emissionSourceIdRef.current}
        isTemp
        pageInfoType={PageInfoType.edit}
        computationId={computationId}
        computationPeriod={computationPeriod}
        readPretty={!hasEditPermission}
        addSuccess={() => {
          queryEmissionList(searchParams);
        }}
      >
        <div ref={drawerChildDive} />
      </AddSource>
      {importStatus !== IMPORT_STATUS.DONE && (
        <div className={styles.animationContent}>
          <div className={styles.closeIcon}>
            <IconAlibabaNew type='icon-icon-guanbi' onClick={onClose} />
          </div>
          <Lottie
            className={styles.lottie}
            animationData={Animation}
            loop
            play
          />
          <Progress
            className={styles.progress}
            percent={progress}
            status='active'
          />
          <div className={styles.pendingText}>
            {I18N.enterpriseCarbonAccount2.dataImportInProgress}
          </div>
        </div>
      )}
      {importStatus === IMPORT_STATUS.DONE && (
        <div className={styles.tableContainer}>
          <div className={styles.tableContent}>
            <div className={styles.importTitle}>
              <div className={styles.importTitleLeft}>
                <img alt='' src={AiImg} />
                {I18N.carbonFootprint.import}
              </div>
            </div>
            <Tabs
              className={styles.tableTab}
              activeKey={tab}
              items={[
                { key: 'all', label: I18N.carbonFootprint3.whole },
                {
                  key: 'err',
                  label: I18N.enterpriseCarbonAccount2.problemData,
                },
              ]}
              onChange={tabKey => {
                setTab(tabKey);
                setSearchParams({
                  ...searchParams,
                  pageNum: 1,
                  error: tabKey === 'err' ? 1 : undefined,
                });
              }}
            />
            <Table
              rowKey='id'
              columns={columns}
              dataSource={emissionSourceList}
              loading={loading}
              scroll={{ x: 1360 }}
              pagination={{
                total,
                current: searchParams.pageNum,
                pageSize: searchParams.pageSize,
              }}
              onRow={record => ({
                onMouseEnter: () => {
                  setEditId(record.id);
                  compositionRef.current = false;
                },
                onMouseLeave: () => {
                  setEditId(null);
                  compositionRef.current = false;
                },
              })}
              onChange={(pagination, filter, _, { action }) => {
                if (action === 'paginate') {
                  setSearchParams({
                    ...searchParams,
                    pageNum: pagination.current || 1,
                    pageSize: pagination.pageSize || 10,
                  });
                }

                if (action === 'filter') {
                  setSearchParams({
                    ...searchParams,
                    pageNum: pagination.current || 1,
                    ghgClassifyList: filter.ghg?.join(','),
                  });
                }
              }}
            />
          </div>
          <div className={styles.footer}>
            {hasEditPermission && (
              <Button onClick={onCancel}>
                {I18N.enterpriseCarbonAccount2.cancelImport}
              </Button>
            )}
            <Button onClick={onClose}>
              {I18N.carbonFootprint3.temporarilyStore}
            </Button>
            {hasEditPermission && (
              <Button type='primary' loading={submitLoading} onClick={submit}>
                {I18N.enterpriseCarbonAccount2.confirmToAdd}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type AiImportFullScreenModalProps = {
  open: boolean;
  importStatus: number;
  computationId: string;
  computationPeriod: string;
  onClose: () => void;
  onImportSuccess: () => void;
};

const AiImportFullScreenModal: FC<AiImportFullScreenModalProps> = props => {
  const {
    open,
    importStatus,
    computationId,
    computationPeriod,
    onClose,
    onImportSuccess,
  } = props;

  return (
    <Modal
      className={styles.fullscreenModal}
      width='100%'
      closeIcon={null}
      open={open}
      title={null}
      footer={null}
      destroyOnClose
    >
      <AiImportContent
        importStatus={importStatus}
        computationId={computationId}
        computationPeriod={computationPeriod}
        onClose={onClose}
        onImportSuccess={onImportSuccess}
      />
    </Modal>
  );
};

export default AiImportFullScreenModal;
