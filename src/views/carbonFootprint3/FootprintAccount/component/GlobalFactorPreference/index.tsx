import { PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import {
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Radio,
  Switch,
  Table,
  Transfer,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { FC, useEffect, useMemo, useState } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';

import styles from './index.module.less';
import {
  addGlobalFactorPreferencePlan,
  deleteGlobalFactorPreferencePlan,
  editGlobalFactorPreferencePlan,
  getFactorDatabaseSourceOptions,
  getGlobalFactorPreferencePlanInfo,
  getGlobalFactorPreferencePlanPage,
  setDefaultGlobalFactorPreferencePlan,
  setGlobalFactorPreferencePublished,
} from './service';
import {
  FactorDatabaseSourceOption,
  FactorSourceId,
  GlobalFactorPreferenceFormValues,
  GlobalFactorPreferencePlan,
} from './type';

type GlobalFactorPreferenceProps = {
  open: boolean;
  onClose: () => void;
};

const getSourceNamesText = (sourceNames?: string) => sourceNames || '-';

const resolveSourceIdsByOptions = (
  sourceIds: FactorSourceId[] = [],
  sourceOptions: FactorDatabaseSourceOption[] = [],
) => {
  if (sourceOptions.length === 0) {
    return sourceIds.filter(
      sourceId =>
        sourceId !== undefined && sourceId !== null && sourceId !== '',
    );
  }

  const resolvedSourceIds = new Map<string, FactorSourceId>();

  sourceIds.forEach(sourceId => {
    const matchedOption = sourceOptions.find(
      option => String(option.id) === String(sourceId),
    );

    if (matchedOption) {
      resolvedSourceIds.set(String(matchedOption.id), matchedOption.id);
    }
  });

  return Array.from(resolvedSourceIds.values());
};

const GlobalFactorPreference: FC<GlobalFactorPreferenceProps> = ({
  open,
  onClose,
}) => {
  const [plans, setPlans] = useState<GlobalFactorPreferencePlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planPagination, setPlanPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });
  const [sourceOptions, setSourceOptions] = useState<
    FactorDatabaseSourceOption[]
  >([]);
  const [sourceOptionsLoading, setSourceOptionsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSubmitting, setDrawerSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GlobalFactorPreferencePlan>();
  const [detailPlan, setDetailPlan] = useState<GlobalFactorPreferencePlan>();
  const [drawerForm] = Form.useForm<GlobalFactorPreferenceFormValues>();

  const loadPlans = async (pageNum = 1, pageSize = 10) => {
    setPlansLoading(true);
    try {
      const { rows, total } = await getGlobalFactorPreferencePlanPage({
        pageNum,
        pageSize,
      });
      setPlans(rows);
      setPlanPagination({
        pageNum,
        pageSize,
        total,
      });
    } catch {
      setPlans([]);
      setPlanPagination({
        pageNum,
        pageSize,
        total: 0,
      });
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let cancelled = false;
    const initPlans = async () => {
      try {
        const { rows, total } = await getGlobalFactorPreferencePlanPage({
          pageNum: 1,
          pageSize: planPagination.pageSize,
        });
        if (!cancelled) {
          setPlans(rows);
          setPlanPagination({
            pageNum: 1,
            pageSize: planPagination.pageSize,
            total,
          });
        }
      } catch {
        if (!cancelled) {
          setPlans([]);
          setPlanPagination(prev => ({
            ...prev,
            pageNum: 1,
            total: 0,
          }));
        }
      } finally {
        if (!cancelled) {
          setPlansLoading(false);
        }
      }
    };

    setPlansLoading(true);
    initPlans();

    return () => {
      cancelled = true;
    };
    // 打开弹窗时重置到第一页；pageSize 保留用户上一次选择。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || sourceOptions.length > 0) {
      return undefined;
    }

    let cancelled = false;
    setSourceOptionsLoading(true);
    getFactorDatabaseSourceOptions()
      .then(options => {
        if (!cancelled) {
          setSourceOptions(options);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSourceOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSourceOptionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, sourceOptions.length]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    if (editingPlan) {
      drawerForm.setFieldsValue({
        name: editingPlan.name,
        sourceIds: resolveSourceIdsByOptions(
          editingPlan.sourceIds,
          sourceOptions,
        ),
        remark: editingPlan.remark,
      });
      return;
    }

    drawerForm.setFieldsValue({
      name: '',
      sourceIds: [],
      remark: '',
    });
  }, [drawerForm, drawerOpen, editingPlan, sourceOptions]);

  const transferDataSource = useMemo(
    () =>
      sourceOptions.map(option => ({
        key: option.id,
        title: option.name,
      })),
    [sourceOptions],
  );

  const refreshPlans = async () => {
    await loadPlans(planPagination.pageNum, planPagination.pageSize);
  };

  const openAddDrawer = () => {
    setEditingPlan(undefined);
    setDrawerOpen(true);
  };

  const openEditDrawer = async (plan: GlobalFactorPreferencePlan) => {
    if (plan.published) {
      return;
    }
    const nextPlan = await getGlobalFactorPreferencePlanInfo(plan.id);
    setEditingPlan(nextPlan);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingPlan(undefined);
    drawerForm.resetFields();
  };

  const submitDrawer = async () => {
    const values = await drawerForm.validateFields();
    const submitValues = {
      ...values,
      sourceIds: resolveSourceIdsByOptions(values.sourceIds, sourceOptions),
    };

    try {
      setDrawerSubmitting(true);
      if (editingPlan) {
        await editGlobalFactorPreferencePlan(editingPlan.id, submitValues);
        await refreshPlans();
      } else {
        await addGlobalFactorPreferencePlan(submitValues);
        await loadPlans(1, planPagination.pageSize);
      }
      closeDrawer();
    } finally {
      setDrawerSubmitting(false);
    }
  };

  const changeDefaultPlan = async (plan: GlobalFactorPreferencePlan) => {
    if (!plan.published) {
      return;
    }

    try {
      await setDefaultGlobalFactorPreferencePlan(plan.id);
    } finally {
      await refreshPlans();
    }
  };

  const changePublishStatus = async (planId: number) => {
    try {
      await setGlobalFactorPreferencePublished(planId);
    } finally {
      await refreshPlans();
    }
  };

  const deletePlan = (plan: GlobalFactorPreferencePlan) => {
    if (plan.published) {
      return;
    }

    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(
        I18N.carbonFootprint3.confirmDeleteFactorPreferencePlan,
        {
          val1: plan.name,
        },
      ),
      icon: null,
      onOk: async () => {
        await deleteGlobalFactorPreferencePlan(plan.id);
        await loadPlans(
          plans.length === 1 && planPagination.pageNum > 1
            ? planPagination.pageNum - 1
            : planPagination.pageNum,
          planPagination.pageSize,
        );
      },
    });
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    loadPlans(
      pagination.current || 1,
      pagination.pageSize || planPagination.pageSize,
    ).catch(() => undefined);
  };

  const columns: ColumnsType<GlobalFactorPreferencePlan> = [
    {
      title: '',
      dataIndex: 'isDefault',
      width: 48,
      render: (_, record) => (
        <Radio
          checked={record.isDefault}
          disabled={!record.published}
          onChange={() => {
            changeDefaultPlan(record).catch(() => undefined);
          }}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.name,
      dataIndex: 'name',
      width: 220,
      render: (_, record) => (
        <div className={styles.nameCell}>
          {record.isDefault && (
            <span className={styles.defaultTag}>
              {I18N.carbonFootprint3.factorPreferenceDefault}
            </span>
          )}
          <span className={styles.ellipsisText} title={record.name}>
            {record.name}
          </span>
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint3.factorPreferenceSource,
      dataIndex: 'sourceNames',
      width: 280,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.factorPreferencePublished,
      dataIndex: 'published',
      width: 120,
      render: (_, record) => (
        <Switch
          checked={record.published}
          disabled={record.isDefault}
          onChange={() => {
            changePublishStatus(record.id).catch(() => undefined);
          }}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'operation',
      width: 180,
      render: (_, record) => (
        <div className={styles.operationCell}>
          <Button type='link' onClick={() => setDetailPlan(record)}>
            {I18N.carbonFootprint3.details}
          </Button>
          <Button
            type='link'
            disabled={record.published}
            onClick={() => {
              openEditDrawer(record).catch(() => undefined);
            }}
          >
            {I18N.carbonFootprint.edit}
          </Button>
          <Button
            type='link'
            disabled={record.published}
            className={styles.dangerButton}
            onClick={() => deletePlan(record)}
          >
            {I18N.carbonFootprint.delete}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={I18N.carbonFootprint3.globalFactorPreference}
        width={960}
        open={open}
        centered
        footer={null}
        className={styles.globalFactorPreferenceModal}
        onCancel={onClose}
      >
        <div className={styles.modalHeader}>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={openAddDrawer}
          >
            {I18N.carbonFootprint3.addFactorPreferencePlan}
          </Button>
        </div>
        <Table<GlobalFactorPreferencePlan>
          rowKey='id'
          className={styles.preferenceTable}
          columns={columns}
          dataSource={plans}
          loading={plansLoading}
          pagination={{
            current: planPagination.pageNum,
            pageSize: planPagination.pageSize,
            total: planPagination.total,
            showSizeChanger: true,
            showTotal: total =>
              I18N.template(I18N.components.totalTota, { val1: total }),
          }}
          onChange={handleTableChange}
          tableLayout='fixed'
        />
      </Modal>
      <CustomDrawer
        title={
          editingPlan
            ? I18N.carbonFootprint3.editFactorPreferencePlan
            : I18N.carbonFootprint3.addFactorPreferencePlan
        }
        open={drawerOpen}
        width={560}
        destroyOnClose
        onClose={closeDrawer}
      >
        <div className={styles.drawerContent}>
          <Form
            form={drawerForm}
            layout='vertical'
            colon={false}
            className={styles.drawerForm}
          >
            <Form.Item
              name='name'
              label={I18N.carbonFootprint.name}
              rules={[
                {
                  required: true,
                  message:
                    I18N.carbonFootprint3.pleaseEnterFactorPreferencePlanName,
                },
              ]}
            >
              <Input
                maxLength={100}
                showCount
                placeholder={
                  I18N.carbonFootprint3.pleaseEnterFactorPreferencePlanName
                }
              />
            </Form.Item>
            <Form.Item
              name='sourceIds'
              label={I18N.carbonFootprint3.backgroundDatabaseSource}
              required
              valuePropName='targetKeys'
              getValueFromEvent={(targetKeys: FactorSourceId[]) => targetKeys}
              rules={[
                {
                  validator: (_, value?: FactorSourceId[]) =>
                    value && value.length > 0
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            I18N.carbonFootprint3.pleaseSelectBackgroundDatabaseSource,
                          ),
                        ),
                },
              ]}
            >
              <Transfer
                className={styles.transfer}
                dataSource={transferDataSource}
                disabled={sourceOptionsLoading}
                showSearch
                titles={[
                  I18N.carbonFootprint3.availableSources,
                  I18N.carbonFootprint3.selectedSources,
                ]}
                filterOption={(inputValue, item) =>
                  String(item.title || '').includes(inputValue)
                }
                render={item => (
                  <span
                    className={styles.transferItem}
                    title={String(item.title || '')}
                  >
                    {item.title}
                  </span>
                )}
              />
            </Form.Item>
            <Form.Item name='remark' label={I18N.carbonFootprint.remarks}>
              <Input.TextArea
                maxLength={1000}
                showCount
                rows={4}
                placeholder={I18N.carbonFootprint3.pleaseEnterRemark}
              />
            </Form.Item>
          </Form>
          <div className={styles.drawerFooter}>
            <Button onClick={closeDrawer}>{I18N.carbonFootprint.cancel}</Button>
            <Button
              type='primary'
              loading={drawerSubmitting}
              onClick={() => {
                submitDrawer().catch(() => undefined);
              }}
            >
              {I18N.carbonFootprint.preserve}
            </Button>
          </div>
        </div>
      </CustomDrawer>
      <Modal
        title={I18N.carbonFootprint3.factorPreferencePlanDetail}
        width={860}
        open={!!detailPlan}
        centered
        footer={null}
        className={styles.detailModal}
        onCancel={() => setDetailPlan(undefined)}
      >
        {detailPlan && (
          <div className={styles.detailContent}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label={I18N.carbonFootprint.name}>
                <span className={styles.detailText}>{detailPlan.name}</span>
              </Descriptions.Item>
              <Descriptions.Item
                label={I18N.carbonFootprint3.backgroundDatabaseSource}
              >
                <span className={styles.detailText}>
                  {getSourceNamesText(detailPlan.sourceNames)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label={I18N.carbonFootprint.remarks}>
                <span className={styles.detailText}>
                  {detailPlan.remark || '-'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </>
  );
};

export default GlobalFactorPreference;
