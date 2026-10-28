/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import useUrlState from '@ahooksjs/use-url-state';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import {
  Button,
  Cascader,
  DatePicker,
  Dropdown,
  Input,
  Modal,
  Popconfirm,
  Table,
  Tabs,
} from 'antd';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Permission from '@/components/Permission';
import { IconAlibabaNew } from '@/components/iconfont';
import { useCountries, useUnit } from '@/hooks/useScope';
import { RouteMaps } from '@/router/route-paths';
import store from '@/store';
import { Toast } from '@/utils';

import styles from './index.module.less';
import {
  addGroup,
  deCollectFactor,
  deleteFactor,
  deleteGroup,
  editFactorGroup,
  editGroup,
  getFactorList,
  getGroupList,
} from './service';
import FactorGroupModal from '../components/FactorGroupModal';
import FactorImportModal from '../components/FactorImportModal';

const allGroupKey = 'all';

const factorUseType = {
  all: 'all',
  orgCreate: '1',
  collection: '2',
  create: '3',
};

const factorUseTypeLabel = {
  [factorUseType.all]: I18N.carbonFootprint3.whole,
  [factorUseType.collection]: I18N.emission.organizeCollection,
  [factorUseType.create]: I18N.emission.iCreatedIt,
};

const EmissionFactorList: FC = () => {
  const [searchParams, setSearchParams] = useUrlState<{
    pageNum: number;
    pageSize: number;
    group: string;
    factorUse: string;
    name?: string;
    description?: string;
    institution?: string;
    cValueSort?: string;
    countries?: string;
    year?: string;
    unit?: string;
    source?: string;
  }>(
    {
      pageNum: 1,
      pageSize: 10,
      group: allGroupKey,
      factorUse: factorUseType.all,
    },
    {
      stringifyOptions: {
        arrayFormat: 'comma',
        skipEmptyString: true,
        skipNull: true,
      },
    },
  );

  const history = useHistory();

  const [factorList, setFactorList] = useState<Record<string, any>[]>([]);
  const [total, setTotal] = useState(0);

  const [groupList, setGroupList] = useState<
    { id: string; groupName: string }[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [currGroup, setCurrGroup] = useState<{
    id: string;
    groupName: string;
  }>();

  const [groupName, setGroupName] = useState('');

  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const [deleteGroupModalOpen, setDeleteGroupModalOpen] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [addEditLoading, setAddEditLoading] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);

  const unitDicts = useUnit({ appendDefault: true });
  const countryList = useCountries({ appendDefault: true });

  const companyId = store.getState().companyUserInfo?.userInfo?.companyId || 0;

  const queryGroupList = async () => {
    const { data } = await getGroupList();
    setGroupList(data.data);
  };

  const queryFactorList = async (params, opt?: { merge?: boolean }) => {
    const merge = opt?.merge ?? true;

    const newSearchParams = merge ? { ...searchParams, ...params } : params;

    setSearchParams(newSearchParams);

    try {
      setLoading(true);
      const { data } = await getFactorList({
        ...newSearchParams,
        group:
          newSearchParams.group === allGroupKey
            ? undefined
            : newSearchParams.group,
        factorUse:
          newSearchParams.factorUse === factorUseType.all ||
          newSearchParams.group !== allGroupKey
            ? undefined
            : newSearchParams.factorUse,
        companyId,
        cValueSort:
          newSearchParams.cValueSort === 'ascend'
            ? true
            : newSearchParams.cValueSort === 'descend'
            ? false
            : undefined,
        countries: newSearchParams.countries?.split(',')?.pop(),
      });
      setFactorList(data.rows);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const onGroupModalClose = () => {
    setGroupName('');
    setGroupModalOpen(false);
    setCurrGroup(undefined);
  };

  const onGroupAddEdit = async () => {
    if (!groupName.trim()) {
      Toast('error', I18N.emission.pleaseEnterGrouping);
      return;
    }
    try {
      setAddEditLoading(true);
      if (currGroup) {
        await editGroup({ id: currGroup.id, groupName });
      } else {
        await addGroup({ groupName });
      }
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      onGroupModalClose();
      queryGroupList();
    } finally {
      setAddEditLoading(false);
    }
  };

  const onDeleteModalClose = () => {
    setDeleteGroupModalOpen(false);
    setCurrGroup(undefined);
  };

  const onGroupDelete = async () => {
    const id = currGroup?.id;

    if (!id) {
      onDeleteModalClose();
    }
    try {
      setDeleteLoading(true);
      await deleteGroup({ id });
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      onDeleteModalClose();
      queryGroupList();

      if (searchParams.group === `${id}`) {
        queryFactorList({ group: allGroupKey, pageNum: 1 });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    queryGroupList();
    queryFactorList(searchParams, { merge: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.emissionFactorList}>
      <div className={styles.title}>
        {I18N.emission.organizationalEmissionFactors}
      </div>
      <div className={styles.searchContent}>
        <div className={styles.searchRow}>
          <div className={styles.searchItem}>
            <Input
              value={searchParams.name}
              placeholder={I18N.carbonFootprint.factorName}
              onChange={e =>
                setSearchParams({
                  ...searchParams,
                  name: e.target.value,
                })
              }
            />
          </div>
          <div className={styles.searchItem}>
            <Input
              value={searchParams.description}
              placeholder={I18N.components.applicableScenarios}
              onChange={e =>
                setSearchParams({
                  ...searchParams,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className={styles.searchBtnContent}>
            <Button
              type='primary'
              icon={<IconAlibabaNew type='icon-icon-sousuo-saas' />}
              onClick={() => {
                queryFactorList({ pageNum: 1 });
              }}
            >
              {I18N.components.search}
            </Button>
            <Button
              icon={<IconAlibabaNew type='icon-icon-zhongzhi-saas' />}
              onClick={() => {
                queryFactorList(
                  {
                    pageNum: 1,
                    pageSize: 10,
                    group: allGroupKey,
                    factorUse: factorUseType.all,
                    name: undefined,
                    description: undefined,
                    institution: undefined,
                    countries: undefined,
                    year: undefined,
                    unit: undefined,
                    source: undefined,
                  },
                  { merge: false },
                );
              }}
            >
              {I18N.carbonFootprint3.reset}
            </Button>
          </div>
        </div>
        <div className={styles.searchRow}>
          <div className={styles.searchItem}>
            <DatePicker
              value={searchParams.year ? moment(searchParams.year) : undefined}
              placeholder={I18N.system.releaseTime2}
              picker='year'
              onChange={val =>
                setSearchParams({ ...searchParams, year: val?.format('YYYY') })
              }
            />
          </div>
          <div className={styles.searchItem}>
            <Cascader
              placeholder={I18N.carbonFootprint.unit}
              value={searchParams.unit?.split(',')}
              options={unitDicts}
              allowClear
              onChange={unit => {
                setSearchParams({ ...searchParams, unit });
              }}
            />
          </div>
          <div className={styles.searchItem}>
            <Input
              value={searchParams.institution}
              placeholder={I18N.carbonFootprint.publishingInstitution}
              onChange={e =>
                setSearchParams({
                  ...searchParams,
                  institution: e.target.value,
                })
              }
            />
          </div>
          <div className={styles.searchItem}>
            <Cascader
              value={searchParams.countries?.split(',')}
              placeholder={I18N.emission.publishingRegion}
              allowClear
              options={countryList}
              fieldNames={{
                value: 'dictValue',
                label: 'dictLabel',
              }}
              onChange={countries => {
                setSearchParams({
                  ...searchParams,
                  countries,
                });
              }}
              displayRender={opt => opt?.[1]}
            />
          </div>
          <div className={styles.searchItem}>
            <Input
              value={searchParams.source}
              placeholder={I18N.emission.sourceFiles}
              onChange={e =>
                setSearchParams({
                  ...searchParams,
                  source: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
      <Tabs
        className={styles.tabs}
        activeKey={searchParams.group}
        tabPosition='top'
        tabBarExtraContent={{
          right: (
            <div className={styles.btnContent}>
              <Permission flag='system:company:addSaas'>
                <div
                  className={styles.customBtn}
                  onClick={() =>
                    history.push({
                      pathname: RouteMaps.emissionOrganizationAdd,
                    })
                  }
                >
                  <IconAlibabaNew type='icon-icon-tianjia-new' />
                  <span>{I18N.carbonFootprint.newAddition}</span>
                </div>
                <div
                  className={styles.customBtn}
                  onClick={() => setImportModalOpen(true)}
                >
                  <IconAlibabaNew type='icon-icon-daochu' />
                  <span>{I18N.carbonFootprint.import}</span>
                </div>
              </Permission>
            </div>
          ),
        }}
        items={[
          {
            key: allGroupKey,
            label: (
              <Dropdown
                menu={{
                  items: Object.values(factorUseType)
                    .filter(type => type !== factorUseType.orgCreate)
                    .map(type => ({
                      key: type,
                      label: factorUseTypeLabel[type],
                      onClick: ({ key }) => {
                        if (
                          key !== searchParams.factorUse ||
                          searchParams.group !== allGroupKey
                        ) {
                          queryFactorList({
                            factorUse: key,
                            group: allGroupKey,
                            pageNum: 1,
                          });
                        }
                      },
                    })),
                  onClick: ({ domEvent }) => domEvent.stopPropagation(),
                }}
              >
                <div>{factorUseTypeLabel[searchParams.factorUse]}</div>
              </Dropdown>
            ),
          },
          ...groupList.map(group => ({
            key: `${group.id}`,
            label: (
              <Dropdown
                trigger={['contextMenu']}
                placement='bottomCenter'
                menu={{
                  items: [
                    {
                      key: 'edit',
                      label: I18N.carbonFootprint.edit,
                      onClick: () => {
                        setCurrGroup(group);
                        setGroupName(group.groupName);
                        setGroupModalOpen(true);
                      },
                    },
                    {
                      key: 'delete',
                      label: I18N.carbonFootprint.delete,
                      onClick: () => {
                        setCurrGroup(group);
                        setDeleteGroupModalOpen(true);
                      },
                    },
                  ],
                  onClick: ({ domEvent }) => domEvent.stopPropagation(),
                }}
              >
                <div
                  className={styles.groupNameContent}
                  title={group.groupName}
                  onContextMenu={e => {
                    e.nativeEvent.preventDefault();
                  }}
                >
                  <div className={styles.groupName}>{group.groupName}</div>
                </div>
              </Dropdown>
            ),
          })),
          {
            key: 'add',
            label: (
              <div
                className={styles.addGroupBtn}
                onClick={e => {
                  e.stopPropagation();
                  setGroupModalOpen(true);
                }}
              >
                <IconAlibabaNew type='icon-icon-xinzeng-saas' />
              </div>
            ),
          },
        ]}
        onChange={group => {
          queryFactorList({ group, pageNum: 1 });
        }}
      />

      <Table
        rowKey='id'
        scroll={{ x: 1200 }}
        loading={loading}
        pagination={{
          current: searchParams.pageNum,
          pageSize: searchParams.pageSize,
          total,
        }}
        dataSource={factorList}
        columns={[
          {
            dataIndex: '__No__',
            title: I18N.carbonFootprint.number,
            width: 68,
            fixed: 'left',
            render: (_, record, index) =>
              searchParams.pageSize * (searchParams.pageNum - 1) + index + 1,
          },
          {
            dataIndex: 'name',
            title: I18N.carbonFootprint.factorName,
            width: 146,
            fixed: 'left',
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'cValue',
            title: I18N.carbonFootprint.factorValue,
            width: 166,
            ellipsis: true,
            sorter: true,
            showSorterTooltip: false,
            sortOrder: searchParams.cValueSort,
            render: (text, record) =>
              shouldHideEcoinventValue(record)
                ? I18N.carbonFootprint3.notDisplayedTemporarily1
                : text || '-',
          },
          {
            dataIndex: 'unit',
            title: I18N.carbonFootprint.unit,
            width: 126,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'specification',
            title: I18N.carbonFootprint3.specificationAndModel,
            width: 118,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'institution',
            title: I18N.carbonFootprint.publishingInstitution,
            width: 118,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'year',
            title: I18N.carbonFootprint.yearOfPublication,
            width: 118,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'countries',
            title: I18N.emission.publishingRegion,
            width: 118,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'description',
            title: I18N.components.factorSupplement,
            width: 136,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'source',
            title: I18N.emission.sourceFiles,
            width: 118,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'createBy',
            title: I18N.enterpriseCarbonAccount2.creator,
            width: 118,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: 'updateTime',
            title: I18N.carbonFootprint.updateTime,
            width: 178,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            dataIndex: '__operate__',
            title: I18N.carbonFootprint.operation,
            width: 268,
            fixed: 'right',
            render: (_, record) => (
              <div className={styles.operateColumn}>
                <Permission flag='system:company:querySaas'>
                  <Button
                    type='link'
                    onClick={() =>
                      history.push({
                        pathname: RouteMaps.emissionOrganizationDetail,
                        search: `?emissionId=${record.id}`,
                      })
                    }
                  >
                    {I18N.carbonFootprint.check}
                  </Button>
                </Permission>
                <Permission flag='system:company:editSaas'>
                  {record.canOperate && (
                    <Button
                      type='link'
                      onClick={() =>
                        history.push({
                          pathname: RouteMaps.emissionOrganizationEdit,
                          search: `?emissionId=${record.id}`,
                        })
                      }
                    >
                      {I18N.carbonFootprint.edit}
                    </Button>
                  )}
                </Permission>
                <Permission flag='system:company:remove'>
                  {record.canOperate && (
                    <Popconfirm
                      title={I18N.base.confirm}
                      description={I18N.emission.doYouWantToDeleteThis}
                      onConfirm={async () => {
                        await deleteFactor({ id: record.id });
                        Toast(
                          'success',
                          I18N.carbonFootprint.operationSuccessful,
                        );
                        queryFactorList(searchParams);
                      }}
                    >
                      <Button type='link' danger>
                        {I18N.carbonFootprint.delete}
                      </Button>
                    </Popconfirm>
                  )}
                </Permission>
                <Permission flag='system:collect:addCollect'>
                  {`${record.factorUse}` !== factorUseType.orgCreate && (
                    <Popconfirm
                      title={I18N.base.confirm}
                      description={I18N.emission.doYouWantToCancelTheCollection}
                      onConfirm={async () => {
                        await deCollectFactor({
                          factorId: record.id,
                          companyId,
                        });
                        Toast(
                          'success',
                          I18N.carbonFootprint.operationSuccessful,
                        );
                        queryFactorList(searchParams);
                      }}
                    >
                      <Button type='link'>
                        {I18N.carbonFootprint.cancelFavorite}
                      </Button>
                    </Popconfirm>
                  )}
                </Permission>
                <FactorGroupModal
                  factorId={record.id}
                  factorUse={record.factorUse}
                  onConfirm={async groupIds => {
                    await editFactorGroup({
                      id: record.id,
                      factorUse: record.factorUse,
                      groupIds: groupIds.join(','),
                    });
                    Toast('success', I18N.carbonFootprint.operationSuccessful);
                    queryFactorList(searchParams);
                  }}
                >
                  <Button type='link'>{I18N.carbonAccount.editGrouping}</Button>
                </FactorGroupModal>
              </div>
            ),
          },
        ]}
        onChange={(pager, filter, sorter, { action }) => {
          if (action === 'paginate') {
            queryFactorList({
              pageNum: pager.current,
              pageSize: pager.pageSize,
            });
          } else if (action === 'sort') {
            queryFactorList({
              pageNum: 1,
              cValueSort: (sorter as Record<string, any>).order,
            });
          }
        }}
      />
      <Modal
        title={
          currGroup
            ? I18N.carbonAccount.editGrouping
            : I18N.dashborad.addGrouping
        }
        open={groupModalOpen}
        width={460}
        okButtonProps={{ loading: addEditLoading }}
        onClose={onGroupModalClose}
        onCancel={onGroupModalClose}
        onOk={onGroupAddEdit}
      >
        <Input
          value={groupName}
          placeholder={I18N.carbonDataManagemen.groupName}
          onChange={e => setGroupName(e.target.value)}
        />
      </Modal>
      <Modal
        title={I18N.emission.confirmToDeleteThis}
        open={deleteGroupModalOpen}
        width={460}
        okButtonProps={{ loading: deleteLoading }}
        onClose={onDeleteModalClose}
        onCancel={onDeleteModalClose}
        onOk={onGroupDelete}
      >
        <div>{I18N.emission.thisOperationOnlyDeletes}</div>
      </Modal>
      <FactorImportModal
        open={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          queryFactorList({ ...searchParams, pageNum: 1 });
        }}
      />
    </div>
  );
};

export default EmissionFactorList;
