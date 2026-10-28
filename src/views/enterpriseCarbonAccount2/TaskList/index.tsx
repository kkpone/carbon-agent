import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import doneImg from '@assets/svg/done.svg';
import I18N from '@src/lang/I18N';
import {
  Select,
  Input,
  Button,
  Radio,
  Spin,
  Checkbox,
  Cascader,
  Modal,
  Pagination,
  Popover,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import classNames from 'classnames';
import { pick } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';

import FileUploadDrawer from '@/components/FileUploadDrawer';
import { IconAlibabaNew } from '@/components/iconfont';
import { Toast } from '@/utils/Toast';

import AiImport from './AiImport';
import ImportTask from './ImportTask';
import TaskItem from './TaskItem';
import {
  TASK_REQ_STATUS,
  TASK_REQ_STATUS_LABEL,
  TASK_STATUS,
} from './constant';
import styles from './index.module.less';
import {
  batchDeleteAttachment,
  batchDownloadAttachment,
  deleteAttachment,
  getTaskList,
  getTaskOption,
  submitTask,
  updateActivityData,
  updateAttachment,
} from './service';
import { Task, TaskOption, TaskSearchParams } from './type';

const TaskList: FC<{ className?: string; ticket?: string }> = ({
  className,
  ticket,
}) => {
  const [taskOption, setTaskOption] = useState<TaskOption>({
    orgList: [],
    ghgCategoryList: [],
    yearList: [],
  });

  const [searchParams, setSearchParams] = useState<TaskSearchParams>({
    reqStatus: TASK_REQ_STATUS.PENDING,
    ticket,
    pageNum: 1,
    pageSize: 10,
    sortType: 1,
  });

  const [taskList, setTaskList] = useState<Task[]>([]);

  const [total, setTotal] = useState(0);

  const [checkedTaskIds, setCheckedTaskIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);

  const [taskCount, setTaskCount] = useState<{
    all: number;
    beFilled: number;
    flowing: number;
    completed: number;
    cancelled: number;
  }>();

  const [moreFilterVisible, setMoreFilterVisible] = useState(false);

  const batchUploadBtnRef = useRef<HTMLButtonElement>(null);

  const allTaskIds = taskList
    .filter(
      task =>
        task.status === TASK_STATUS.BE_FILLED ||
        task.edit ||
        task.status === TASK_STATUS.REJECTED,
    )
    .map(({ id }) => id);
  const queryTaskOption = async (params: { ticket?: string }) => {
    const { data } = await getTaskOption(params);
    setTaskOption(data.data);
  };

  const queryTaskList = async (
    params: TaskSearchParams,
    option?: { clearCheckedIds?: boolean },
  ) => {
    try {
      setLoading(true);
      const { data } = await getTaskList(params);
      setTaskList(
        data.rows.map(row => ({
          ...row,
          edit: taskList.find(task => task.id === row.id)?.edit,
        })),
      );
      setTaskCount({
        all: data.sumTotal,
        beFilled:
          params.reqStatus === TASK_REQ_STATUS.PENDING
            ? data.total
            : data.waitDealTotal,
        flowing:
          params.reqStatus === TASK_REQ_STATUS.APPROVING
            ? data.total
            : data.flowingCount,
        completed:
          params.reqStatus === TASK_REQ_STATUS.COMPLETED
            ? data.total
            : data.completeCount,
        cancelled:
          params.reqStatus === TASK_REQ_STATUS.CANCELED
            ? data.total
            : data.cancelCount,
      });

      setTotal(data.total);

      if (option?.clearCheckedIds) {
        setCheckedTaskIds([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSearchParamsChange = (
    params: Partial<TaskSearchParams>,
    options?: {
      merged?: boolean;
    },
  ) => {
    const merged = options?.merged ?? true;

    const newSearchParams = merged
      ? {
          ...searchParams,
          ...params,
        }
      : {
          ...params,
          pageNum: params.pageNum || 1,
          pageSize: params.pageSize || 10,
          sortType: params.sortType || 1,
        };

    setSearchParams(newSearchParams);

    // 切换 TASK_REQ_STATUS 时清空勾选，翻页等操作保留勾选
    const isReqStatusChanged =
      params.reqStatus !== undefined &&
      params.reqStatus !== searchParams.reqStatus;
    queryTaskList(newSearchParams, {
      clearCheckedIds: isReqStatusChanged,
    });
  };

  const submit = async (idList: number[]) => {
    setLoading(true);
    try {
      taskList.forEach(task => {
        if (idList.includes(task.id)) {
          Object.assign(task, {
            edit: undefined,
          });
        }
      });
      await submitTask({
        idList,
        ticket,
      });
      Toast('success', I18N.carbonFootprint.operationSuccessful);
      setCheckedTaskIds(prev => prev.filter(id => !idList.includes(id)));
      onSearchParamsChange({
        pageNum:
          idList.length === taskList.length
            ? Math.max(1, searchParams.pageNum - 1)
            : searchParams.pageNum,
      });
    } catch (error) {
      Toast('error', I18N.enterpriseCarbonAccount2.operationFailed);
    } finally {
      setLoading(false);
    }
  };

  const onImportModalClose = () => {
    setImportModalOpen(false);
    onSearchParamsChange({ pageNum: 1 });
  };

  const uploadAttachment = async (
    files: { name: string; url: string }[],
    idList: number[],
  ) => {
    await updateAttachment({
      idList,
      supportImg: files.map(file => ({
        name: file.name,
        url: file.url,
      })),
      ticket,
    });
    Toast('success', I18N.enterpriseCarbonAccount2.uploadSuccessful);
    queryTaskList(searchParams);
  };

  useEffect(() => {
    queryTaskOption({ ticket });
  }, [ticket]);

  useEffect(() => {
    queryTaskList(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classNames(styles.taskPage, className)}>
      <Modal
        title={I18N.carbonFootprint.batchImport}
        width={1200}
        open={importModalOpen}
        destroyOnClose
        onCancel={onImportModalClose}
        onClose={onImportModalClose}
        onOk={onImportModalClose}
      >
        <ImportTask ticket={ticket} />
      </Modal>
      <div className={styles.title}>{I18N.carbonFootprint3.fillingInData}</div>
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <Radio.Group
            value={searchParams.reqStatus}
            options={[
              {
                value: TASK_REQ_STATUS.PENDING,
                label: (
                  <>
                    <span>
                      {TASK_REQ_STATUS_LABEL()[TASK_REQ_STATUS.PENDING]}
                    </span>
                    <span className={styles.countVal}>
                      {taskCount?.beFilled}
                    </span>
                  </>
                ),
              },
              // {
              //   value: TASK_REQ_STATUS.ALL,
              //   label: (
              //     <>
              //       <span>{TASK_REQ_STATUS_LABEL[TASK_REQ_STATUS.ALL]}</span>
              //       <span className={styles.countVal}>{taskCount?.all}</span>
              //     </>
              //   ),
              // },
              {
                value: TASK_REQ_STATUS.APPROVING,
                label: (
                  <>
                    <span>
                      {TASK_REQ_STATUS_LABEL()[TASK_REQ_STATUS.APPROVING]}
                    </span>
                    <span className={styles.countVal}>
                      {taskCount?.flowing}
                    </span>
                  </>
                ),
              },
              {
                value: TASK_REQ_STATUS.COMPLETED,
                label: (
                  <>
                    <span>
                      {TASK_REQ_STATUS_LABEL()[TASK_REQ_STATUS.COMPLETED]}
                    </span>
                    <span className={styles.countVal}>
                      {taskCount?.completed}
                    </span>
                  </>
                ),
              },
              {
                value: TASK_REQ_STATUS.CANCELED,
                label: (
                  <>
                    <span>
                      {TASK_REQ_STATUS_LABEL()[TASK_REQ_STATUS.CANCELED]}
                    </span>
                    <span className={styles.countVal}>
                      {taskCount?.cancelled}
                    </span>
                  </>
                ),
              },
            ]}
            optionType='button'
            onChange={e => {
              onSearchParamsChange({ reqStatus: e.target.value, pageNum: 1 });
            }}
          />
        </div>
        <div className={styles.filterRight}>
          <Input
            className={styles.searchInput}
            value={searchParams.name}
            placeholder={I18N.carbonFootprint3.emissionSourceName}
            suffix={<SearchOutlined />}
            allowClear
            onChange={e => {
              setSearchParams({ ...searchParams, name: e.target.value });
            }}
            onBlur={() => {
              onSearchParamsChange({ pageNum: 1 });
            }}
            onPressEnter={() => {
              onSearchParamsChange({ pageNum: 1 });
            }}
          />
          <Popover
            content={
              <div className={styles.moreFilterContent}>
                <div className={styles.filterRowHorizontal}>
                  <Select
                    className={styles.filterSelect}
                    value={searchParams.year}
                    placeholder={I18N.carbonFootprint3.accountingYear}
                    options={taskOption.yearList.map(year => ({
                      value: year,
                      label: year,
                    }))}
                    allowClear
                    onChange={(year: string | undefined) => {
                      setSearchParams({ ...searchParams, year });
                      onSearchParamsChange({ year, pageNum: 1 });
                    }}
                  />
                </div>
                <div className={styles.filterRowHorizontal}>
                  <Select
                    className={styles.filterSelect}
                    value={searchParams.orgIdList}
                    placeholder={I18N.dashborad.accountingEntity}
                    mode='multiple'
                    showSearch={false}
                    options={taskOption.orgList.map(({ orgId, orgName }) => ({
                      value: `${orgId}`,
                      label: orgName,
                    }))}
                    allowClear
                    onChange={orgIdList => {
                      setSearchParams({
                        ...searchParams,
                        orgIdList,
                      });
                      onSearchParamsChange({ orgIdList, pageNum: 1 });
                    }}
                  />
                </div>
                <div className={styles.filterRowHorizontal}>
                  <Cascader
                    className={styles.filterSelect}
                    value={searchParams.ghgClassifyList}
                    placeholder={
                      I18N.enterpriseCarbonAccount2.ghgClassification2
                    }
                    multiple
                    fieldNames={{ label: 'name', children: 'classifyList' }}
                    options={taskOption.ghgCategoryList}
                    allowClear
                    onChange={ghgClassifyList => {
                      setSearchParams({ ...searchParams, ghgClassifyList });
                      onSearchParamsChange({ ghgClassifyList, pageNum: 1 });
                    }}
                  />
                </div>
                <div className={styles.filterRowHorizontal}>
                  <Select
                    className={styles.filterSelect}
                    value={searchParams.sortType}
                    options={[
                      {
                        value: 1,
                        label:
                          I18N.enterpriseCarbonAccount2
                            .accordingToTheAccountingCycle,
                      },
                      {
                        value: 2,
                        label:
                          I18N.enterpriseCarbonAccount2.reverseOrderBySubject,
                      },
                      {
                        value: 3,
                        label: I18N.enterpriseCarbonAccount2.byReleaseTime,
                      },
                    ]}
                    onChange={sortType => {
                      setSearchParams({ ...searchParams, sortType });
                      onSearchParamsChange({ sortType, pageNum: 1 });
                    }}
                  />
                </div>
              </div>
            }
            trigger='click'
            open={moreFilterVisible}
            onOpenChange={setMoreFilterVisible}
            placement='bottomRight'
            overlayClassName={styles.moreFilterPopover}
          >
            <Button>
              <span>{I18N.enterpriseCarbonAccount2.moreFilters}</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='none'
              >
                <path
                  d='M8.31222 14.728C8.12422 14.728 7.93622 14.672 7.77622 14.564L5.59622 13.088C5.29622 12.884 5.11622 12.548 5.11622 12.184V7.05599L1.66022 3.61599C1.32422 3.28399 1.22422 2.78399 1.40422 2.34799C1.58422 1.91199 2.00822 1.62799 2.48022 1.62799H11.9602C12.4322 1.62799 12.8562 1.91199 13.0362 2.34799C13.2162 2.78399 13.1162 3.28399 12.7762 3.61599L9.27222 7.07599V13.768C9.27222 14.124 9.07622 14.448 8.76422 14.616C8.62022 14.692 8.46822 14.728 8.31222 14.728ZM2.48422 2.58799C2.36422 2.58799 2.31622 2.66799 2.29622 2.71199C2.27622 2.75999 2.25622 2.84799 2.34022 2.93199L5.93622 6.51599C6.02822 6.60799 6.07622 6.72799 6.07622 6.85599V12.184C6.07622 12.228 6.09622 12.268 6.13222 12.292L8.30822 13.764V6.87599C8.30822 6.74799 8.36022 6.62399 8.45222 6.53599L12.1002 2.93599C12.1842 2.85199 12.1642 2.75999 12.1442 2.71599C12.1242 2.67199 12.0762 2.59199 11.9562 2.59199H2.48422V2.58799Z'
                  fill='#999EA4'
                />
                <path
                  d='M14.1919 8.49998H10.7559C10.4919 8.49998 10.2759 8.28398 10.2759 8.01998C10.2759 7.75598 10.4919 7.53998 10.7559 7.53998H14.1919C14.4559 7.53998 14.6719 7.75598 14.6719 8.01998C14.6719 8.28798 14.4559 8.49998 14.1919 8.49998ZM14.1919 11.14H10.7559C10.4919 11.14 10.2759 10.924 10.2759 10.66C10.2759 10.396 10.4919 10.18 10.7559 10.18H14.1919C14.4559 10.18 14.6719 10.396 14.6719 10.66C14.6719 10.924 14.4559 11.14 14.1919 11.14ZM14.1919 13.776H10.7559C10.4919 13.776 10.2759 13.56 10.2759 13.296C10.2759 13.032 10.4919 12.816 10.7559 12.816H14.1919C14.4559 12.816 14.6719 13.032 14.6719 13.296C14.6719 13.56 14.4559 13.776 14.1919 13.776Z'
                  fill='#999EA4'
                />
              </svg>
              {(() => {
                let filterCount = 0;
                if (searchParams.year) filterCount++;
                if (searchParams.orgIdList?.length) filterCount++;
                if (searchParams.ghgClassifyList?.length) filterCount++;
                return filterCount > 0 ? (
                  <span className={styles.filterBadge}>{filterCount}</span>
                ) : null;
              })()}
            </Button>
          </Popover>
          <Button
            onClick={() => {
              const newSearchParams = {
                ...pick(searchParams, [
                  'ticket',
                  'reqStatus',
                  'pageSize',
                  'sortType',
                ]),
                pageNum: 1,
              };
              onSearchParamsChange(newSearchParams, {
                merged: false,
              });
            }}
          >
            <RedoOutlined />
            <span>{I18N.carbonFootprint3.reset}</span>
          </Button>
        </div>
      </div>
      {searchParams.reqStatus === TASK_REQ_STATUS.PENDING &&
        taskList.length > 0 && (
          <div className={styles.batchOperationBar}>
            <div className={styles.batchLeft}>
              <Checkbox
                checked={
                  allTaskIds.length > 0 &&
                  allTaskIds.every(id => checkedTaskIds.includes(id))
                }
                indeterminate={
                  allTaskIds.some(id => checkedTaskIds.includes(id)) &&
                  !allTaskIds.every(id => checkedTaskIds.includes(id))
                }
                onChange={e => {
                  if (e.target.checked) {
                    setCheckedTaskIds([
                      ...new Set([...checkedTaskIds, ...allTaskIds]),
                    ]);
                  } else {
                    setCheckedTaskIds(
                      checkedTaskIds.filter(id => !allTaskIds.includes(id)),
                    );
                  }
                }}
              >
                {I18N.components.selectAll}
              </Checkbox>
              <div className={styles.selectedInfo}>
                <span>{I18N.components.selected2}</span>
                <span className={styles.selectedCount}>
                  {checkedTaskIds.length}
                </span>
                <span> {I18N.components.pieceOfData}</span>
              </div>
            </div>
            <div className={styles.batchRight}>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'upload',
                      label: I18N.components.uploadAttachments,
                      onClick: () => batchUploadBtnRef.current?.click(),
                      disabled: checkedTaskIds.length === 0,
                    },
                    {
                      key: 'clearAttachment',
                      label:
                        I18N.enterpriseCarbonAccount2.batchClearingAttached,
                      onClick: async () => {
                        if (checkedTaskIds.length === 0) return;

                        // 检查选中的任务是否有附件
                        const tasksWithAttachments = taskList.filter(
                          task =>
                            checkedTaskIds.includes(task.id) &&
                            task.imgList.length > 0,
                        );

                        if (tasksWithAttachments.length === 0) {
                          Toast(
                            'warning',
                            I18N.enterpriseCarbonAccount2
                              .theSelectedTaskIsNotAvailable,
                          );
                          return;
                        }

                        await deleteAttachment({
                          ticket,
                          idList: checkedTaskIds,
                        });
                        Toast('success', I18N.carbonFootprint.deleteSuccessful);
                        queryTaskList(searchParams);
                      },
                      disabled: checkedTaskIds.length === 0,
                    },
                  ] as MenuProps['items'],
                }}
                placement='bottomRight'
              >
                <Button className={styles.moreActionsBtn}>
                  {I18N.enterpriseCarbonAccount2.moreBatchOperations}
                  <IconAlibabaNew type='icon-icon-zhankai' />
                </Button>
              </Dropdown>
              <Button
                disabled={!taskCount?.beFilled}
                icon={<IconAlibabaNew type='icon-icon-daoru' />}
                onClick={() => setImportModalOpen(true)}
              >
                {I18N.enterpriseCarbonAccount2.templateImport}
              </Button>
              {!ticket && (
                <AiImport
                  ticket={ticket}
                  disabled={!taskCount?.beFilled}
                  onSuccess={() => {
                    onSearchParamsChange({ pageNum: 1 });
                  }}
                />
              )}
            </div>
          </div>
        )}
      <div
        className={styles.taskList}
        style={{ paddingBottom: checkedTaskIds.length > 0 ? 64 : 0 }}
      >
        <Spin spinning={loading}>
          {taskList.length === 0 ? (
            <div className={styles.doneContent}>
              <img src={doneImg} alt='' />
              <div className={styles.doneTip}>
                {I18N.enterpriseCarbonAccount2.congratulationsYouHaveFinished}
              </div>
            </div>
          ) : (
            <>
              {taskList.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  checked={checkedTaskIds.includes(task.id)}
                  onCheckChange={(id, checked) => {
                    setCheckedTaskIds(
                      checked
                        ? [...checkedTaskIds, id]
                        : checkedTaskIds.filter(taskId => taskId !== id),
                    );
                  }}
                  onSubmit={submit}
                  onModify={id => {
                    const task = taskList.find(t => t.id === id);
                    if (task) {
                      Object.assign(task, { edit: true });
                      setTaskList([...taskList]);
                    }
                  }}
                  uploadAttachment={uploadAttachment}
                  deleteAttachment={async files => {
                    await batchDeleteAttachment({
                      ticket,
                      supportImgIds: files.map(file => file.id),
                    });
                    Toast('success', I18N.carbonFootprint.deleteSuccessful);
                    queryTaskList(searchParams);
                  }}
                  batchDownloadAttachment={async supportImgIds => {
                    const { data } = await batchDownloadAttachment({
                      supportImgIds,
                      ticket,
                    });
                    window.open(data.data.url);
                  }}
                  updateActivityData={async (id, val, paramId) => {
                    setLoading(true);
                    try {
                      await updateActivityData({
                        id,
                        activityData: val,
                        ticket,
                        paramId,
                      });
                      queryTaskList(searchParams);
                    } catch (error) {
                      Toast(
                        'error',
                        I18N.enterpriseCarbonAccount2.operationFailed,
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={
                    loading ||
                    !(
                      task.status === TASK_STATUS.BE_FILLED ||
                      task.status === TASK_STATUS.REJECTED
                    )
                  }
                  ticket={ticket}
                  isApproval={false}
                />
              ))}
            </>
          )}
        </Spin>
      </div>
      <FileUploadDrawer
        batch={false}
        onSuccess={files => uploadAttachment(files, checkedTaskIds)}
      >
        <button
          ref={batchUploadBtnRef}
          style={{ display: 'none' }}
          type='button'
          aria-label='batch upload button'
        />
      </FileUploadDrawer>
      <div className={styles.bottomBar}>
        <Pagination
          current={searchParams.pageNum}
          pageSize={searchParams.pageSize}
          total={total}
          onChange={(pageNum, pageSize) => {
            onSearchParamsChange({ pageNum, pageSize });
          }}
        />
        {checkedTaskIds.length > 0 && (
          <div className={styles.batchActions}>
            <Button
              className={styles.batchApproveBtn}
              type='primary'
              onClick={() => submit(checkedTaskIds)}
            >
              {I18N.components.submit}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
