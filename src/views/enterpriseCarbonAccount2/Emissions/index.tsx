/*
 * @@description: 排放源库
 * @Author: lxc qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-18 14:23:02
 */

import I18N from '@src/lang/I18N';
import Permission from '@src/components/Permission';
import { ListDictTypeAndDataByType } from '@src/views/emission/Show/type';
import { Button, Cascader, Input, Modal, Table } from 'antd';
import { DataNode } from 'antd/lib/tree';
import { debounce, omit } from 'lodash-es';
import { FC, Key, useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { apiListALLByDictTypeData } from '../../emission/Show/service';
import {
  apiModelSourceLists,
  apiModelSourceCategoryList,
  apiModelSourceDeleted,
  distributeLibEmission,
  batchDeleteLibEmission,
} from '../service';
import '../style.less';
import { SourceCategoryListType } from '../utils/type';
import ClassifyTree from '../carbonDischarge/components/ClassifyTree';
import styles from './index.module.less';
import { IconAlibabaNew } from '@/components/iconfont';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import useUrlState from '@ahooksjs/use-url-state';
import { GHGSecondSelect } from '../listInfo/util';
import { RouteMaps, virtualLinkTransform } from '@/router/route-paths';
import { PageInfoType, PageInfoTypeName } from '@/router/type';
import { Toast } from '@/utils';
import SelectComputationOrgModal from './SelectComputationOrgModal';

const EnterpriseCarbonAccountingList: FC = () => {
  // 当前标题
  const currentName = I18N.carbonFootprint3.emissionSourceRepository;

  const [cascaderOptions, getCascaderOptions] = useState<
    ListDictTypeAndDataByType[]
  >([]);

  const [expandKey, setExpandKey] = useState<Key[]>([]);

  const [dicTree, setDicTree] = useState<(DataNode & SourceCategoryListType)[]>(
    [],
  );
  const [categortTotal, setCategortTotal] = useState<number>(0);

  const history = useHistory();

  const [searchParams, setSearchParams] = useUrlState<{
    pageNum: number;
    pageSize: number;
    name?: string;
    facility?: string;
    activityUnit?: string;
    selectedKey?: string;
    ghgClassify?: string;
    ghgCategory?: string;
  }>({ pageNum: 1, pageSize: 10, selectedKey: '0' });

  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [tableTotal, setTableTotal] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [distributeEmissionIds, setDistributeEmissionIds] = useState<number[]>(
    [],
  );

  const onSearchNameInputChange = useCallback(
    debounce((name: string) => {
      setSearchParams({
        ...searchParams,
        name: name || undefined,
        pageNum: 1,
      });
    }, 500),
    [searchParams],
  );

  const getTableData = async params => {
    try {
      setLoading(true);
      const { data } = await apiModelSourceLists({
        ...params,
        activityUnit: params.activityUnit?.split(',')?.[1],
      });
      setTableData(data.rows);
      setTableTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const getGHGClassify = (searchParams, expandRoot = true) => {
    const omitSearchParams = searchParams
      ? omit(searchParams, ['ghgCategory', 'ghgClassify'])
      : {};
    apiModelSourceCategoryList(omitSearchParams).then(({ data }) => {
      const {
        data: { list, total },
      } = data;
      setCategortTotal(total);
      setDicTree(list);
      if (expandRoot) {
        setExpandKey(list.map(item => item.id) || []);
      }
    });
  };

  useEffect(() => {
    apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(({ data }) => {
      getCascaderOptions(
        (data?.data || []) as unknown as ListDictTypeAndDataByType[],
      );
    });
  }, []);

  useEffect(() => {
    getGHGClassify({
      name: searchParams.name,
      activityUnit: searchParams.activityUnit?.split(',')?.[1],
    });
  }, [searchParams.name, searchParams.activityUnit]);

  useEffect(() => {
    getTableData(omit(searchParams, ['selectedKey']));
  }, [searchParams]);
  return (
    <div className={styles.emissionLib}>
      <SelectComputationOrgModal
        open={distributeEmissionIds.length > 0}
        onCancel={() => {
          setDistributeEmissionIds([]);
        }}
        onConfirm={async (checkedOrgs, selectedYear) => {
          await distributeLibEmission({
            dictSourceIdList: distributeEmissionIds,
            computationIdList: checkedOrgs.map(org => org.computationId),
            period: selectedYear[1]?.value,
          });
          Toast(
            'success',
            I18N.enterpriseCarbonAccount2.theEmissionSourceHasBeenIdentified,
          );
          setDistributeEmissionIds([]);
        }}
      />
      <div className={styles.emissionLibHeader}>
        <div className={styles.title}>{currentName}</div>
        <div className={styles.btnContainer}>
          <Permission flag='enterprise:dictSource:import'>
            <Button
              type='default'
              icon={<IconAlibabaNew type='icon-icon-daoru' />}
              onClick={() => {
                history.push(
                  RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicImport,
                );
              }}
            >
              {I18N.carbonFootprint.batchImport}
            </Button>
          </Permission>
          <Permission flag='enterprise:dictSource:add'>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => {
                history.push(
                  virtualLinkTransform(
                    RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
                    [PageInfoTypeName, ':id'],
                    [PageInfoType.add, ''],
                  ),
                );
              }}
            >
              {I18N.carbonFootprint.newEmissionSourcesAdded}
            </Button>
          </Permission>
        </div>
      </div>
      <div className={styles.emissionLibContent}>
        <div className={styles.ghgTreeContent}>
          <ClassifyTree
            total={categortTotal}
            defaultExpandAll
            expandedKeys={expandKey}
            selectedKeys={[Number(searchParams.selectedKey)]}
            onExpand={(keys: Key[]) => {
              setExpandKey([...keys]);
            }}
            treeData={dicTree}
            blockNode
            onAllClick={() => {
              setSearchParams({
                ...searchParams,
                pageNum: 1,
                selectedKey: '0',
                ghgCategory: undefined,
                ghgClassify: undefined,
              });
            }}
            onSelect={(_, { node }) => {
              setSearchParams({
                ...searchParams,
                pageNum: 1,
                selectedKey: node.id,
                [node.level === 1 ? 'ghgCategory' : 'ghgClassify']:
                  node.businessId,
                [node.level === 1 ? 'ghgClassify' : 'ghgCategory']: undefined,
              });
            }}
          />
        </div>
        <div className={styles.emissionListContent}>
          <div className={styles.tableSearchRow}>
            <div>
              <span className={styles.selectedText}>
                {I18N.components.selected2}
              </span>
              <span className={styles.selectedCount}>
                {selectedRows.length}
              </span>
              <span className={styles.selectedText}>
                {I18N.enterpriseCarbonAccount2.emissionSources}
              </span>
            </div>
            <div className={styles.searchContent}>
              <Input
                style={{ width: 220 }}
                suffix={<SearchOutlined style={{ color: '#999EA4' }} />}
                defaultValue={searchParams.name}
                placeholder={I18N.enterpriseCarbonAccount2.nameOfEmissionSource}
                onChange={e => onSearchNameInputChange(e.target.value)}
              />
              <Cascader
                style={{ width: 150 }}
                placeholder={
                  I18N.enterpriseCarbonAccount2.pleaseSelectAnActivity
                }
                value={searchParams.activityUnit?.split(',')}
                options={cascaderOptions}
                fieldNames={{
                  label: 'dictLabel',
                  value: 'dictValue',
                  children: 'enumList',
                }}
                onChange={value => {
                  setSearchParams({
                    ...searchParams,
                    pageNum: 1,
                    activityUnit: value?.join(','),
                  });
                }}
              />
              <Permission flag='enterprise:computation:edit'>
                <Button
                  disabled={selectedRows.length === 0}
                  onClick={() => {
                    setDistributeEmissionIds(
                      selectedRows.map(item => item.dictSourceId),
                    );
                  }}
                >
                  {I18N.enterpriseCarbonAccount2.batchSelectionOfGroups}
                </Button>
              </Permission>
              <Permission flag='enterprise:dictSource:deleted'>
                <Button
                  disabled={selectedRows.length === 0}
                  onClick={() => {
                    Modal.confirm({
                      icon: null,
                      title: I18N.components.batchDeletion,
                      content: (
                        <>
                          <span>{I18N.components.selected}</span>
                          <span className={styles.selectedCount}>
                            {selectedRows.length}
                          </span>
                          <span>
                            {I18N.enterpriseCarbonAccount2.theEmissionSourceIs}
                          </span>
                        </>
                      ),
                      onOk: async () => {
                        await batchDeleteLibEmission({
                          idList: selectedRows.map(item => item.dictSourceId),
                        });
                        Toast('success', I18N.carbonFootprint.deleteSuccessful);
                        getTableData(omit(searchParams, ['selectedKey']));
                        getGHGClassify(
                          {
                            name: searchParams.name,
                            activityUnit:
                              searchParams.activityUnit?.split(',')?.[1],
                          },
                          false,
                        );
                        setSelectedRows([]);
                      },
                    });
                  }}
                >
                  {I18N.components.batchDeletion}
                </Button>
              </Permission>
            </div>
          </div>
          <Table
            rowKey='dictSourceId'
            dataSource={tableData}
            loading={loading}
            scroll={{ x: 'max-content' }}
            columns={[
              {
                title: I18N.carbonFootprint3.emissionSourceName,
                dataIndex: 'name',
                ellipsis: true,
                width: 110,
                fixed: 'left',
                render: (text: number) => text || '-',
              },
              {
                title: I18N.components.emissionFacilityActivity,
                dataIndex: 'facility',
                ellipsis: true,
                width: 130,
                render: (text: number) => text || '-',
              },
              {
                title: I18N.carbonFootprint.classification,
                dataIndex: 'ghgClassify',
                ellipsis: true,
                width: 202,
                render: classify => (
                  <div className={styles.ghgClassify}>
                    {GHGSecondSelect.find(({ id }) => id === classify)
                      ?.category || '-'}
                  </div>
                ),
              },
              {
                title: I18N.components.activityDataSheet3,
                dataIndex: 'activityUnitDesc',
                ellipsis: true,
                width: 88,
                render: text => text || '-',
              },
              {
                title: I18N.carbonFootprint.updatedBy,
                dataIndex: 'updateBy',
                ellipsis: true,
                width: 116,
                render: (_, { updateBy, updateTime }) => (
                  <>
                    <div className={styles.updateBy}>{updateBy || '-'}</div>
                    <div className={styles.updateTime}>{updateTime || '-'}</div>
                  </>
                ),
              },
              {
                title: I18N.carbonFootprint.operation,
                dataIndex: 'operate',
                fixed: 'right',
                width: 228,
                render: (_, record) => (
                  <div className={styles.operateColumn}>
                    <Permission flag='enterprise:dictSource:info'>
                      <Button
                        type='link'
                        onClick={() => {
                          history.push(
                            virtualLinkTransform(
                              RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
                              [PageInfoTypeName, ':id'],
                              [PageInfoType.show, record.dictSourceId],
                            ),
                          );
                        }}
                      >
                        {I18N.carbonFootprint.check}
                      </Button>
                    </Permission>
                    <Permission flag='enterprise:dictSource:copy'>
                      <Button
                        type='link'
                        onClick={async () => {
                          history.push(
                            virtualLinkTransform(
                              RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
                              [PageInfoTypeName, ':id'],
                              [PageInfoType.copy, record.dictSourceId],
                            ),
                          );
                        }}
                      >
                        {I18N.carbonFootprint.copy}
                      </Button>
                    </Permission>
                    <Permission flag='enterprise:computation:edit'>
                      <Button
                        type='link'
                        onClick={() =>
                          setDistributeEmissionIds([record.dictSourceId])
                        }
                      >
                        {I18N.enterpriseCarbonAccount2.selectOrganization}
                      </Button>
                    </Permission>
                    <Permission flag='enterprise:dictSource:deleted'>
                      <Button
                        type='link'
                        danger
                        onClick={() => {
                          Modal.confirm({
                            icon: null,
                            title: I18N.base.confirm,
                            content:
                              I18N.enterpriseCarbonAccount2
                                .confirmToDeleteThis3,
                            onOk: async () => {
                              await apiModelSourceDeleted(record.dictSourceId);
                              Toast(
                                'success',
                                I18N.carbonFootprint.deleteSuccessful,
                              );
                              getTableData(omit(searchParams, ['selectedKey']));
                              getGHGClassify(
                                {
                                  name: searchParams.name,
                                  activityUnit:
                                    searchParams.activityUnit?.split(',')?.[1],
                                },
                                false,
                              );
                              setSelectedRows(row =>
                                row.filter(
                                  item =>
                                    item.dictSourceId !== record.dictSourceId,
                                ),
                              );
                            },
                          });
                        }}
                      >
                        {I18N.carbonFootprint.delete}
                      </Button>
                    </Permission>
                  </div>
                ),
              },
            ]}
            rowSelection={{
              columnWidth: 56,
              selectedRowKeys: selectedRows.map(item => item.dictSourceId),
              onChange: (_, selectedRows) => {
                setSelectedRows(selectedRows);
              },
              preserveSelectedRowKeys: true,
            }}
            pagination={{
              pageSize: searchParams.pageSize,
              current: searchParams.pageNum,
              total: tableTotal,
              onChange: (page, pageSize) => {
                setSearchParams({
                  ...searchParams,
                  pageNum: page,
                  pageSize,
                });
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnterpriseCarbonAccountingList;
