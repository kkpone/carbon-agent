/* eslint-disable react/no-unstable-nested-components */
import {
  PlusCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import emptyImg from '@assets/svg/enterprise_empty.svg';
import I18N from '@src/lang/I18N';
import {
  Button,
  Input,
  Modal,
  Popover,
  Select,
  Spin,
  Switch,
  Table,
  TableColumnsType,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import { debounce, isNil } from 'lodash-es';
import {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';

import ExpandIcon from '@/components/ExpandIcon';
import { IconFont } from '@/components/LcaIconFont';
import Permission from '@/components/Permission';
import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import { useUserOrgType, ORG_TYPE } from '@/hooks/useOrgType';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils';

import styles from './index.module.less';
import {
  addIndicator,
  addIndicatorSystem,
  batchUpdateIndicator,
  deleteIndicator,
  editIndicatorSystem,
  getFilterStandardList,
  getIndicatorList,
  getIndicatorSystemList,
  getOrgEntityList,
  initiateTask,
} from './service';
import AcIndicatorTag from '../components/AcIndicatorTag';
import FillRequirementsModal from '../components/FillRequirementsModal';
import IndicatorSystemModal from '../components/IndicatorSystemModal';
import IndicatorTreeModal from '../components/IndicatorTreeModal';
import OrgSelectPopover from '../components/OrgSelectPopover';
import {
  INDICATOR_DISCLOSURE,
  INDICATOR_DISCLOSURE_LABEL,
  INDICATOR_SYSTEM_STATE,
  INDICATOR_TYPE,
  INDICATOR_TYPE_LABEL,
} from '../constant';
import { Indicator, IndicatorSystem } from '../type';
import {
  isGroupIndicator,
  isModelIndicator,
  isTopLevelIndicator,
} from '../utils';

const ESGManagement: FC = () => {
  const [indicatorSystemList, setIndicatorSystemList] = useState<
    IndicatorSystem[]
  >([]);

  const [indicatorSystem, setIndicatorSystem] = useState<IndicatorSystem>();

  const [indicatorList, setIndicatorList] = useState<Indicator[]>([]);

  const [searchParams, setSearchParams] = useState<{
    name?: string;
    indicatorType?: string;
    standardIds?: string;
    orgIds?: string;
    disclose?: string;
  }>();

  const tableContentRef = useRef<HTMLDivElement>(null);
  const [checkedIndicator, setCheckedIndicator] = useState<Indicator[]>([]);

  const [standardList, setStandardList] = useState<
    { id: number; name: string }[]
  >([]);

  const [orgEntityList, setOrgEntityList] = useState<
    { orgName: string; id: number }[]
  >([]);

  const checkedIndicatorIds = checkedIndicator
    .filter(indicator => !isGroupIndicator(indicator))
    .map(indicator => indicator.id);

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const [tableScrollHeight, setTableScrollHeight] = useState<number>();

  const [initiateBtnLoading, setInitiateBtnLoading] = useState(false);

  const userOrgType = useUserOrgType();

  const isEnterprise = userOrgType === ORG_TYPE.ENTERPRISE;

  const hasData = !isNil(indicatorSystem);

  const history = useHistory();

  const getIndicatorSystem = async () => {
    const { data } = await getIndicatorSystemList();
    setIndicatorSystemList(data.data);
    return data.data;
  };

  const getIndicators = async ({
    frameId,
    params,
    clearCheckedIndicator = true,
    expandGroup,
  }: {
    frameId: number;
    params?: {
      name?: string;
      indicatorType?: string;
      standardIds?: string;
      orgIds?: string;
      disclose?: string;
    };
    clearCheckedIndicator?: boolean;
    expandGroup?: boolean;
  }) => {
    try {
      setLoading(true);
      const { data } = await getIndicatorList({ frameId, ...params });
      const newIndicatorList = data.data;

      setIndicatorList(newIndicatorList);

      if (clearCheckedIndicator) {
        setCheckedIndicator([]);
      }

      if (expandGroup) {
        setExpandedRowKeys(
          newIndicatorList.reduce(
            (prev: string[], group) => [
              ...prev,
              ...[group.id, ...group.children.map(topic => topic.id)],
            ],
            [],
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onIndicatorSystemAdd = async (data: IndicatorSystem) => {
    const resp = await addIndicatorSystem(data);
    Toast('success', I18N.carbonFootprint.successfullyAdded);
    const list = await getIndicatorSystem();
    setIndicatorSystem(list.find(system => system.id === resp.data.data));
  };

  const onIndicatorSystemEdit = async (data: IndicatorSystem) => {
    await editIndicatorSystem(data);
    Toast('success', I18N.carbonFootprint.editSuccessful);
    getIndicatorSystem();
    if (indicatorSystem) {
      getIndicators({ frameId: indicatorSystem.id, params: searchParams });
    }
  };

  const onIndicatorDelete = async (ids: string[], text: string) => {
    Modal.confirm({
      title: I18N.base.confirm,
      icon: null,
      content: (
        <>
          <span className={styles.confirmTip}>
            {I18N.carbonFootPrintLCA.confirmDeletion}
          </span>
          <span className={styles.confirmEmphasis}>{text}</span>
          <span className={styles.confirmTip}>？</span>
        </>
      ),
      onOk: async () => {
        await deleteIndicator({ ids });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        if (indicatorSystem) {
          getIndicators({ frameId: indicatorSystem.id, params: searchParams });
        }
      },
    });
  };

  const onIndicatorBatchUpdate = async (data: {
    ids: string[];
    orgIds?: string;
    fillRequire?: string;
    disclose?: number;
  }) => {
    await batchUpdateIndicator(data);
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    if (indicatorSystem) {
      getIndicators({
        frameId: indicatorSystem.id,
        params: searchParams,
        clearCheckedIndicator: false,
      });
    }
  };

  const onTaskInitiate = async () => {
    if (indicatorSystem) {
      const submitted =
        indicatorSystem.state === INDICATOR_SYSTEM_STATE.SUBMITTED;

      Modal.confirm({
        title: submitted
          ? I18N.esg.updateFillingInResponsibilities
          : I18N.esg.initiateTheFillingProcess2,
        content: submitted
          ? I18N.esg.doYouWantToUpdateTheFilling
          : I18N.esg.shouldIInitiateTheFillingProcess,
        onOk: async () => {
          try {
            setInitiateBtnLoading(true);
            await initiateTask({ id: indicatorSystem.id });
            Toast('success', I18N.carbonFootprint.operationSuccessful);
            const list = await getIndicatorSystem();
            setIndicatorSystem(
              list.find(system => system.id === indicatorSystem.id),
            );
          } finally {
            setInitiateBtnLoading(false);
          }
        },
      });
    }
  };

  const onNameSearch = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
        });
      }, 300),
    [searchParams],
  );

  const columns: TableColumnsType<Indicator> = [
    {
      title: <div className={styles.groupName}>{I18N.esg.allIndicators}</div>,
      dataIndex: 'name',
      width: 324,
      ellipsis: true,
      fixed: 'left',
      render: (_, record) => {
        const { level, name, id, children } = record;
        const expanded = expandedRowKeys.includes(id);
        return (
          <div className={styles.tableNameColumn}>
            {!isModelIndicator(record) && (
              <div className={styles.tableLineContent}>
                {new Array(level - 1).fill('').map(() => (
                  <div className={styles.tableLine} />
                ))}
              </div>
            )}
            {(children || []).length > 0 ? (
              <ExpandIcon
                expanded={expanded}
                onClick={() =>
                  setExpandedRowKeys(
                    !expanded
                      ? [...expandedRowKeys, id]
                      : expandedRowKeys.filter(key => key !== id),
                  )
                }
              />
            ) : (
              <div className={styles.emptyExpandIcon} />
            )}
            <div
              className={classNames(styles.groupName, {
                [styles.indicatorName]: !isGroupIndicator(record),
              })}
              title={name}
            >
              {name}
            </div>
            <AcIndicatorTag indicator={record} />
          </div>
        );
      },
    },
    {
      title: I18N.carbonFootprint.type,
      dataIndex: 'indicatorType',
      width: 126,
      filterMultiple: false,
      filters: Object.values(INDICATOR_TYPE)
        .filter(
          type =>
            ![
              INDICATOR_TYPE.TABLE,
              INDICATOR_TYPE.ENERGY_COMPONENT,
              INDICATOR_TYPE.EMISSION_COMPONENT,
            ].includes(type),
        )
        .map(value => ({
          value,
          text: INDICATOR_TYPE_LABEL[value],
        })),
      render: (indicatorType: number, indicator) =>
        isGroupIndicator(indicator) ? null : (
          <div className={classNames(styles.nature)}>
            {INDICATOR_TYPE_LABEL[indicatorType]}
          </div>
        ),
    },
    {
      title: I18N.esg.referenceStandards,
      dataIndex: 'standardIds',
      width: 176,
      ellipsis: true,
      filterDropdownProps: {
        overlayClassName: styles.standardFilterOverlay,
      },
      filters: standardList.map(standard => ({
        value: standard.id,
        text: <span title={standard.name}>{standard.name}</span>,
      })),
      render: (_, record) => {
        const { standardStr } = record;
        if (isGroupIndicator(record)) {
          return null;
        }

        if (!standardStr) {
          return '-';
        }
        const [standard, ...restStandard] = standardStr.split(',');
        return (
          <div className={styles.column}>
            <div className={styles.tag} title={standard}>
              {standard}
            </div>
            {restStandard.length > 0 && (
              <Tooltip title={restStandard.join('，')}>
                <div className={styles.tag}>+{restStandard.length}</div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: I18N.esg.relatedOrganizations,
      dataIndex: 'orgIds',
      width: 186,
      ellipsis: true,
      filters: orgEntityList.map(org => ({ value: org.id, text: org.orgName })),
      render: (_, indicator) => {
        if (!isTopLevelIndicator(indicator)) {
          return null;
        }

        const orgList = indicator.orgList || [];
        const [firstOrg, ...restOrgList] = orgList;

        return (
          <div className={styles.column}>
            {firstOrg && (
              <div className={styles.tag} title={firstOrg.orgName}>
                {firstOrg.orgName}
              </div>
            )}
            {restOrgList.length > 0 && (
              <Tooltip title={restOrgList.map(org => org.orgName).join('，')}>
                <div className={styles.tag}>+{restOrgList.length}</div>
              </Tooltip>
            )}
            <Permission flag='esg:frame:edit'>
              <OrgSelectPopover
                orgs={orgList}
                onConfirm={async orgs => {
                  await onIndicatorBatchUpdate({
                    ids: [indicator.id],
                    orgIds: orgs.map(org => org.id).join(','),
                  });
                }}
              >
                <PlusCircleOutlined className={styles.operateIcon} />
              </OrgSelectPopover>
            </Permission>
          </div>
        );
      },
    },
    {
      title: I18N.esg.disclose,
      dataIndex: 'disclose',
      width: 102,
      ellipsis: true,
      filterMultiple: false,
      filters: Object.values(INDICATOR_DISCLOSURE).map(value => ({
        value,
        text: INDICATOR_DISCLOSURE_LABEL[value],
      })),
      render: (_, indicator) =>
        isGroupIndicator(indicator) ? null : (
          <Permission flag='esg:frame:edit'>
            <Switch
              size='small'
              checked={indicator.disclose === INDICATOR_DISCLOSURE.ON}
              onChange={checked => {
                onIndicatorBatchUpdate({
                  ids: [indicator.id],
                  disclose: Number(checked),
                });
              }}
            />
          </Permission>
        ),
    },
    {
      title: I18N.esg.interpretationExplanationCase,
      dataIndex: 'description',
      width: 148,
      ellipsis: true,
      render: (text, indicator) =>
        isGroupIndicator(indicator) ? null : text || '-',
    },
    {
      title: I18N.esg.fillInRequirements,
      dataIndex: 'fillRequire',
      width: 148,
      ellipsis: true,
      render: (text, indicator) => {
        if (isGroupIndicator(indicator)) {
          return null;
        }
        const { id, fillRequire } = indicator;
        return (
          <div className={styles.fillRequireColumn}>
            <div className={styles.fillRequireText} title={fillRequire}>
              {fillRequire}
            </div>
            <Permission flag='esg:frame:edit'>
              <FillRequirementsModal
                fillRequire={fillRequire}
                onConfirm={async val => {
                  await onIndicatorBatchUpdate({
                    ids: [id],
                    fillRequire: val,
                  });
                }}
              >
                <IconAlibabaNew
                  className={styles.operateIcon}
                  type='icon-a-icon_edit'
                />
              </FillRequirementsModal>
            </Permission>
          </div>
        );
      },
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'operate',
      width: 128,
      ellipsis: true,
      fixed: 'right',
      render: (_, indicator) => {
        if (isGroupIndicator(indicator)) {
          return null;
        }
        return (
          <div className={styles.operateColumn}>
            {isTopLevelIndicator(indicator) && (
              <Button
                type='link'
                onClick={() => {
                  history.push(
                    RouteMaps.ESGIndicatorInfo.replace(
                      ':frameId',
                      indicatorSystem!.id.toString(),
                    ).replace(':indicatorId', indicator.id.toString()),
                  );
                }}
              >
                {I18N.carbonFootprint3.details}
              </Button>
            )}
            <Permission flag='esg:frameIndicator:delete'>
              <Tooltip
                title={
                  indicator.disabled ? I18N.esg.strictlyFollowTheStandard : ''
                }
              >
                <Button
                  type='link'
                  disabled={indicator.disabled}
                  onClick={() =>
                    onIndicatorDelete([indicator.id], indicator.name)
                  }
                >
                  {I18N.carbonFootprint.delete}
                </Button>
              </Tooltip>
            </Permission>
          </div>
        );
      },
    },
  ];

  const onIndicatorAdd = async (indicators: Indicator[]) => {
    if (indicatorSystem) {
      await addIndicator({
        ids: indicators.map(indicator => indicator.id),
        frameId: indicatorSystem?.id,
      });

      Toast('success', I18N.carbonFootprint.operationSuccessful);
      getIndicators({
        frameId: indicatorSystem.id,
        params: searchParams,
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    getIndicatorSystem()
      .then(data => {
        const urlSearchParams = new URLSearchParams(location.search);
        const urlFrameId = Number(urlSearchParams.get('frameId'));
        setIndicatorSystem(
          data.find(item => item.id === urlFrameId) || data[0],
        );
      })
      .finally(() => {
        setLoading(false);
      });
    getOrgEntityList().then(({ data }) => {
      setOrgEntityList(data.data);
    });
  }, []);

  useEffect(() => {
    if (indicatorSystem) {
      getFilterStandardList({ frameId: indicatorSystem.id }).then(
        ({ data }) => {
          setStandardList(data.data);
        },
      );
    }
  }, [indicatorSystem]);

  useEffect(() => {
    if (indicatorSystem) {
      getIndicators({
        frameId: indicatorSystem.id,
        params: searchParams,
        expandGroup: true,
      });
    }
  }, [indicatorSystem, searchParams]);

  useLayoutEffect(() => {
    if (tableContentRef.current) {
      setTableScrollHeight(tableContentRef.current.clientHeight - 50);
    }
  }, [indicatorSystem]);

  return (
    <div className={styles.ESGManagement}>
      <Spin wrapperClassName={styles.spin} spinning={loading}>
        <div className={styles.header}>
          {hasData ? (
            <>
              <div className={styles.indicatorSystemContent}>
                <Select
                  className={styles.indicatorSelect}
                  value={indicatorSystem?.id}
                  options={indicatorSystemList.map(item => ({
                    ...item,
                    value: item.id,
                    label: `${item.period} - ${item.name}`,
                  }))}
                  onChange={(_, selectedSystem) => {
                    setIndicatorSystem(selectedSystem as IndicatorSystem);
                  }}
                />
                {isEnterprise && (
                  <>
                    <Permission flag='esg:frame:edit'>
                      <IndicatorSystemModal
                        id={indicatorSystem.id}
                        indicatorSystemList={indicatorSystemList}
                        onConfirm={onIndicatorSystemEdit}
                      >
                        <IconAlibaba
                          className={styles.indicatorOperateBtn}
                          type='icon-a-icon_edit'
                        />
                      </IndicatorSystemModal>
                    </Permission>
                    <Permission flag='esg:frame:add'>
                      <IndicatorSystemModal
                        indicatorSystemList={indicatorSystemList}
                        onConfirm={onIndicatorSystemAdd}
                      >
                        <PlusOutlined className={styles.indicatorOperateBtn} />
                      </IndicatorSystemModal>
                    </Permission>
                  </>
                )}
              </div>
              {isEnterprise && (
                <Permission flag='esg:frame:submit'>
                  <Button
                    type='primary'
                    loading={initiateBtnLoading}
                    onClick={onTaskInitiate}
                  >
                    {indicatorSystem.state === INDICATOR_SYSTEM_STATE.UN_SUBMIT
                      ? I18N.esg.initiateTheFillingProcess
                      : I18N.esg.updateFillingInResponsibilities}
                  </Button>
                </Permission>
              )}
            </>
          ) : (
            <div className={styles.title}>{I18N.esg.esgIndicators}</div>
          )}
        </div>
        {hasData ? (
          <div className={styles.content}>
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderLeft}>
                <div>
                  <span className={styles.selectDesc}>
                    {I18N.esg.selectedIndicators2}
                  </span>
                  <span className={styles.selectCount}>
                    {checkedIndicatorIds.length}
                  </span>
                </div>
                <Popover
                  className={styles.batchPopover}
                  placement='bottom'
                  arrow={false}
                  trigger={['click']}
                  destroyTooltipOnHide
                  content={
                    <div className={styles.batchOperateContent}>
                      <Permission flag='esg:frame:edit'>
                        <>
                          <OrgSelectPopover
                            placement='right'
                            align={{
                              offset: [20, 118],
                            }}
                            onConfirm={async orgs => {
                              await onIndicatorBatchUpdate({
                                ids: checkedIndicatorIds,
                                orgIds: orgs.map(org => org.id).join(','),
                              });
                            }}
                          >
                            <div className={styles.batchOperateItem}>
                              {I18N.esg.editOrganizationalModel}
                            </div>
                          </OrgSelectPopover>
                          <FillRequirementsModal
                            fillRequire=''
                            onConfirm={async fillRequire => {
                              await onIndicatorBatchUpdate({
                                ids: checkedIndicatorIds,
                                fillRequire,
                              });
                            }}
                          >
                            <div className={styles.batchOperateItem}>
                              {I18N.esg.reportFillingIsRequired}
                            </div>
                          </FillRequirementsModal>
                          <div className={styles.batchOperateItem}>
                            {I18N.esg.whetherToDisclose}
                            <Switch
                              size='small'
                              checked={checkedIndicator.every(
                                indicator =>
                                  indicator.disclose ===
                                  INDICATOR_DISCLOSURE.ON,
                              )}
                              onChange={async checked => {
                                const disclose = Number(checked);

                                await onIndicatorBatchUpdate({
                                  ids: checkedIndicatorIds,
                                  disclose,
                                });
                                setCheckedIndicator(
                                  checkedIndicator.map(indicator => ({
                                    ...indicator,
                                    disclose,
                                  })),
                                );
                              }}
                            />
                          </div>
                        </>
                      </Permission>
                      <Permission flag='esg:frameIndicator:delete'>
                        <div
                          className={styles.batchOperateItem}
                          onClick={() =>
                            onIndicatorDelete(
                              checkedIndicator
                                .filter(indicator => !indicator.disabled)
                                .map(indicator => indicator.id),
                              I18N.esg.selectedIndicators,
                            )
                          }
                        >
                          {I18N.carbonFootprint.delete}
                        </div>
                      </Permission>
                    </div>
                  }
                >
                  <Button disabled={checkedIndicatorIds.length === 0}>
                    <span className={styles.batchOperateBtnText}>
                      {I18N.esg.bulkOperation}
                    </span>
                    <IconFont
                      className={styles.batchOperateIcon}
                      icon='icon-icon_arrow_rioght'
                    />
                  </Button>
                </Popover>
                <Input
                  className={styles.nameInput}
                  defaultValue={searchParams?.name}
                  prefix={<SearchOutlined className={styles.searchIcon} />}
                  placeholder={I18N.esg.searchIndicatorName}
                  onChange={e => onNameSearch(e.target.value)}
                />
              </div>
              <IndicatorTreeModal
                frameId={indicatorSystem.id}
                onConfirm={onIndicatorAdd}
              >
                <Button icon={<PlusOutlined />}>
                  {I18N.enterpriseCarbonAccount2.addIndicators}
                </Button>
              </IndicatorTreeModal>
            </div>
            <div className={styles.tableContent} ref={tableContentRef}>
              <Table
                className={styles.indicatorTable}
                columns={columns}
                scroll={{ x: 1400, y: tableScrollHeight }}
                rowKey='id'
                pagination={false}
                dataSource={indicatorList}
                expandable={{
                  expandedRowKeys,
                  indentSize: 0,
                  expandIcon: () => null,
                }}
                rowSelection={{
                  selectedRowKeys: checkedIndicator.map(
                    indicator => indicator.id,
                  ),
                  checkStrictly: false,
                  onChange: (_, checked) => {
                    setCheckedIndicator(checked);
                  },
                }}
                onChange={(_, filter, sort, extra) => {
                  if (extra.action === 'filter') {
                    setSearchParams({
                      ...searchParams,
                      indicatorType: filter.indicatorType?.join(','),
                      disclose: filter.disclose?.join(','),
                      orgIds: filter.orgIds?.join(','),
                      standardIds: filter.standardIds?.join(','),
                    });
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <img className={styles.emptyImg} alt='' src={emptyImg} />
            <div className={styles.emptyText}>
              {I18N.esg.noDataAvailablePlease}
            </div>
            <Permission flag='esg:frame:add'>
              <IndicatorSystemModal
                indicatorSystemList={indicatorSystemList}
                onConfirm={onIndicatorSystemAdd}
              >
                <Button type='primary' icon={<PlusOutlined />}>
                  <span>{I18N.esg.addNewIndicatorBody}</span>
                </Button>
              </IndicatorSystemModal>
            </Permission>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default ESGManagement;
