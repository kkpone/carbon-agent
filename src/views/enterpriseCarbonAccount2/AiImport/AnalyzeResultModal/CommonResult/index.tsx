import AiSvg from '@src/assets/icon/esg/ai.svg';
import I18N from '@src/lang/I18N';
import { useMount, useUnmount } from 'ahooks';
import {
  Button,
  Cascader,
  Input,
  Modal,
  Segmented,
  Table,
  TableColumnsType,
  message,
  Tooltip,
  Popover,
} from 'antd';
import classNames from 'classnames';
import { debounce, isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import InputTableCell from '@/components/InputTableCell';
import NumberInputTableCell from '@/components/NumberInputTableCell';
import TableCascaderFilter from '@/components/TableCascaderFilter';
import { IconAlibabaNew } from '@/components/iconfont';
import { useGHGList, useUnit } from '@/hooks/useScope';
import { Toast } from '@/utils';

import styles from './index.module.less';
import {
  batchDeleteTempData,
  deleteTempData,
  editTempData,
  getAnalyzeList,
} from './service';
import { TempData } from './type';
import BindEmissionSelect from '../../BindEmissionSelect';
import { ANALYZE_ERROR_LABEL, IMPORT_STATUS } from '../../constant';
import { getImportStatus } from '../../service';
import { getComputationSourceList } from '../service';
import { ComputationSource } from '../type';

type CommonResultProps = {
  computationId: string;
  computationPeriod: string;
  importStatus: number;
  onClose: () => void;
  setAnalyzing: (val: boolean) => void;
};

const messageKey = 'importStatus';

const CommonResult: FC<CommonResultProps> = ({
  computationId,
  computationPeriod,
  importStatus: importStatusFromProps,
  onClose,
  setAnalyzing,
}) => {
  const [loading, setLoading] = useState(false);

  const [importStatus, setImportStatus] = useState(importStatusFromProps);

  const [searchParams, setSearchParams] = useState<{
    computationId: string;
    computationPeriod: string;
    pageNum: number;
    pageSize: number;
    error: number;
    name?: string;
    ghgClassifyList?: string;
  }>({
    pageNum: 1,
    pageSize: 10,
    computationId,
    computationPeriod,
    error: 0,
  });

  const [count, setCount] = useState({
    total: 0,
    sumTotal: 0,
    waitDealTotal: 0,
  });

  const [computationSource, setComputationSource] = useState<
    ComputationSource[]
  >([]);

  const [tempDataList, setTempDataList] = useState<TempData[]>([]);

  const [selectedList, setSelectedList] = useState<TempData[]>([]);

  const [messageApi, contextHolder] = message.useMessage();

  const timerRef = useRef<NodeJS.Timeout>();

  const unitDict = useUnit();

  const GHGList = useGHGList();

  const onNameInputChange = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
          pageNum: 1,
        });
      }, 300),
    [searchParams],
  );

  const queryTempList = async params => {
    try {
      setLoading(true);
      const { data } = await getAnalyzeList(params);
      setTempDataList(data.rows);
      setCount({
        total: data.total,
        sumTotal: data.sumTotal,
        waitDealTotal: data.waitDealTotal,
      });
    } finally {
      setLoading(false);
    }
  };

  const editData = async (tempData: TempData) => {
    await editTempData(tempData);
    queryTempList(searchParams);
  };

  const deleteData = (tempData: TempData) => {
    Modal.confirm({
      icon: null,
      title: I18N.base.confirm,
      content: I18N.enterpriseCarbonAccount2.doYouWantToDeleteIt,
      onOk: async () => {
        await deleteTempData(tempData.id);
        setSelectedList(selectedList.filter(item => item.id !== tempData.id));
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        queryTempList(searchParams);
      },
    });
  };

  const batchDeleteData = () => {
    Modal.confirm({
      icon: null,
      title: I18N.components.batchDeletion,
      content: (
        <div>
          {I18N.components.selected}
          {selectedList.length}
          {I18N.enterpriseCarbonAccount2.isThereAnyData}
        </div>
      ),
      onOk: async () => {
        await batchDeleteTempData({
          idList: selectedList.map(item => item.id),
        });
        setSelectedList([]);
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        queryTempList(searchParams);
      },
    });
  };

  const columns: TableColumnsType<TempData> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 64,
      fixed: 'left',
      render: (_, record, index) => (
        <div className={styles.flexRow}>
          <span>
            {(searchParams.pageNum - 1) * searchParams.pageSize + index + 1}
          </span>
          {(record.errorList || []).length > 0 && (
            <Popover
              rootClassName={styles.errorPopover}
              placement='bottomLeft'
              content={
                <div>
                  {record.errorList.map(err => (
                    <div className={styles.flexRow} key={err.type}>
                      <IconAlibabaNew
                        className={styles.errorIcon}
                        type='icon-icon-tishi'
                      />
                      <span className={styles.errorText}>
                        {ANALYZE_ERROR_LABEL[err.type]}
                      </span>
                    </div>
                  ))}
                </div>
              }
            >
              <div className={styles.errorTag}>Error</div>
            </Popover>
          )}
        </div>
      ),
    },
    {
      title: I18N.enterpriseCarbonAccount2.originalDataName,
      dataIndex: 'name',
      width: 134,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.activityData,
      dataIndex: 'activityData',
      width: 150,
      render: (_, record) => (
        <NumberInputTableCell
          placeholder={I18N.carbonFootprint3.activityData}
          min={0}
          controls={false}
          value={record.activityData}
          onBlur={activityData => {
            editData({ ...record, activityData: activityData as number });
          }}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.unit,
      dataIndex: 'activityUnit',
      width: 120,
      render: (_, record) => {
        const { unitCodeArr } = record;
        return (
          <Cascader
            value={unitCodeArr?.split(',')}
            displayRender={label => label?.[1]}
            options={unitDict}
            placeholder={I18N.carbonFootprint.pleaseSelectAUnit}
            allowClear={false}
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
              editData({
                ...record,
                activityUnit: unitOpt[1].value,
                activityUnitName: unitOpt[1].label,
                unitCodeArr: unit.join(','),
              });
            }}
          />
        );
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.parseFile,
      dataIndex: 'fileName',
      width: 182,
      ellipsis: true,
      render: (fileName: string) => {
        const attachmentNameArr = fileName ? fileName.split('.') : [];
        const attachmentType = `.${attachmentNameArr.pop()}`;
        const attachmentName = attachmentNameArr.join('.');
        return (
          <div className={classNames(styles.tagContainer)}>
            {fileName ? (
              <div className={classNames(styles.tagContent)}>
                <div className={styles.tag}>
                  <div className={styles.fileName} title={fileName}>
                    <span className={styles.tagName}>{attachmentName}</span>
                    <span>{attachmentType}</span>
                  </div>
                </div>
              </div>
            ) : (
              '-'
            )}
          </div>
        );
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.time,
      dataIndex: 'dateStr',
      width: 108,
      render: (_, record) => (
        <InputTableCell
          value={record.dateStr}
          maxLength={20}
          placeholder={I18N.enterpriseCarbonAccount2.time}
          onBlur={dateStr => {
            editData({ ...record, dateStr: dateStr as string });
          }}
        />
      ),
    },
    {
      title: (
        <div className={styles.flexRow}>
          <span>{I18N.enterpriseCarbonAccount2.bindingEmissionSources}</span>
          <Tooltip
            title={
              <div>
                <div>{I18N.enterpriseCarbonAccount2.newAddition}</div>
                <div className={styles.tipRow}>
                  <IconAlibabaNew
                    className={styles.bindIcon}
                    type='icon-guanlian'
                  />
                  {I18N.enterpriseCarbonAccount2.existingWithTheList}
                </div>
              </div>
            }
          >
            <IconAlibabaNew className={styles.tipIcon} type='icon-icon-tishi' />
          </Tooltip>
        </div>
      ),
      dataIndex: 'bindId',
      width: 334,
      className: styles.boldColumn,
      // filterSearch: (input, record) =>
      //   (record as unknown as { searchText: string }).searchText.includes(
      //     input,
      //   ),
      // filters: computationSource.map(source => ({
      //   value: source.id,
      //   searchText: source.name + source.facility,
      //   text: <BindEmission source={source} inline />,
      // })),
      render: (_, record) => (
        <BindEmissionSelect
          value={record.bindId}
          sourceList={computationSource}
          onChange={bindId => {
            editData({
              ...record,
              bindId,
            });
          }}
        />
      ),
    },
    {
      title: I18N.eca.ghgClassification,
      dataIndex: 'ghgClassify',
      width: 236,
      className: styles.boldColumn,
      filterDropdownProps: {
        destroyPopupOnHide: true,
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      filterDropdown: props => {
        const { selectedKeys, setSelectedKeys, confirm, close } = props;
        return (
          <TableCascaderFilter
            selectedKeys={selectedKeys}
            options={GHGList}
            setSelectedKeys={setSelectedKeys}
            close={close}
            confirm={confirm}
          />
        );
      },
      render: (_, record) => {
        const { ghgCategory, ghgClassify, bindId } = record;
        return (
          <Cascader
            value={ghgCategory ? [ghgCategory, ghgClassify] : undefined}
            options={GHGList}
            disabled={!isNil(bindId)}
            fieldNames={{ value: 'id', label: 'name' }}
            placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectGh}
            allowClear={false}
            onChange={ghg => {
              editData({ ...record, ghgCategory: ghg[0], ghgClassify: ghg[1] });
            }}
          />
        );
      },
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 88,
      fixed: 'right',
      render: (_, record) => (
        <Button
          className={styles.deleteBtn}
          type='link'
          onClick={() => deleteData(record)}
        >
          {I18N.carbonFootprint.delete}
        </Button>
      ),
    },
  ];

  useMount(() => {
    getComputationSourceList({ computationId, computationPeriod }).then(
      ({ data }) => {
        setComputationSource(data.data);
      },
    );
    if (importStatus === IMPORT_STATUS.PENDING) {
      const loopImportStatus = () => {
        getImportStatus({ computationId, computationPeriod }).then(
          ({ data }) => {
            if (data.data === IMPORT_STATUS.PENDING) {
              timerRef.current = setTimeout(loopImportStatus, 1000);
            } else if (data.data === IMPORT_STATUS.DONE) {
              setImportStatus(data.data);
              messageApi.open({
                key: messageKey,
                className: styles.successMessage,
                icon: false,
                content: (
                  <div className={styles.messageContent}>
                    <IconAlibabaNew type='icon-icon-tongguo' />
                    <div className={styles.messageText}>
                      {I18N.enterpriseCarbonAccount2.dataParsingInto}
                    </div>
                  </div>
                ),
                duration: 2,
              });
            } else {
              messageApi.destroy(messageKey);
              Toast('error', I18N.enterpriseCarbonAccount2.dataParsingLost);
              onClose();
            }
          },
        );
      };

      messageApi.open({
        key: messageKey,
        className: styles.pendingMessage,
        icon: false,
        content: (
          <div className={styles.messageContent}>
            <img alt='' src={AiSvg} />
            <div className={styles.messageText}>
              {I18N.enterpriseCarbonAccount2.aiAnalysisInProgress}
            </div>
          </div>
        ),
        duration: 0,
      });
      loopImportStatus();
    }
  });

  useUnmount(() => {
    clearInterval(timerRef.current);
  });

  useEffect(() => {
    if (importStatus === IMPORT_STATUS.DONE) {
      queryTempList(searchParams);
      setSelectedList([]);
    }
  }, [importStatus, searchParams]);

  useEffect(() => {
    setAnalyzing(importStatus !== IMPORT_STATUS.DONE);
  }, [importStatus, setAnalyzing]);

  return (
    <div>
      {contextHolder}
      <Segmented
        value={searchParams.error}
        options={[
          {
            value: 0,
            label: (
              <div
                className={classNames(styles.segmentedTab, {
                  [styles.activeSegmentedTab]: searchParams.error === 0,
                })}
              >
                <span>{I18N.carbonFootprint3.whole}</span>
                <span>{count.sumTotal}</span>
              </div>
            ),
          },
          {
            value: 1,
            label: (
              <div
                className={classNames(styles.segmentedTab, {
                  [styles.activeSegmentedTab]: searchParams.error === 1,
                })}
              >
                <span>{I18N.enterpriseCarbonAccount2.problemData}</span>
                <span>{count.waitDealTotal}</span>
              </div>
            ),
          },
        ]}
        onChange={error => {
          setSearchParams({
            ...searchParams,
            error,
            pageNum: 1,
          });
        }}
      />
      <div className={styles.operate}>
        <div className={styles.batchOperate}>
          <div className={styles.selectCountContent}>
            <div>{I18N.components.selected}</div>
            <div className={styles.selectCount}>
              {selectedList.length}
              {I18N.workbench.strip}
            </div>
            <div>{I18N.enterpriseCarbonAccount2.emissionSourceData}</div>
          </div>
          <Button
            disabled={selectedList.length === 0}
            onClick={batchDeleteData}
          >
            {I18N.components.batchDeletion}
          </Button>
        </div>
        <Input
          className={styles.searchNameInput}
          defaultValue={searchParams.name}
          prefix={
            <IconAlibabaNew
              className={styles.searchIcon}
              type='icon-icon-sousuo-saas'
            />
          }
          placeholder={I18N.enterpriseCarbonAccount2.searchForRawNumbers}
          onChange={e => onNameInputChange(e.target.value)}
        />
      </div>
      <Table
        className={styles.table}
        rowKey='id'
        columns={columns}
        loading={loading}
        dataSource={tempDataList}
        scroll={{ x: 1360, y: 504 }}
        pagination={{
          total: count.total,
          current: searchParams.pageNum,
          pageSize: searchParams.pageSize,
        }}
        rowSelection={{
          selectedRowKeys: selectedList.map(tempData => tempData.id),
          checkStrictly: false,
          onChange: (_, selected) => {
            setSelectedList(selected);
          },
        }}
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
              pageNum: 1,
              pageSize: pagination.pageSize || 10,
              ghgClassifyList: filter.ghgClassify?.join(','),
            });
          }
        }}
      />
    </div>
  );
};

export default CommonResult;
