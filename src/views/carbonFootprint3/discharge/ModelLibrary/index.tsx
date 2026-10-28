import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Toast } from '@src/utils/Toast';
import { Button, Dropdown, Input, Modal, Select, Tabs, Tooltip } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';

import CardView from './components/CardView';
import IndustryCategoryModal from './components/IndustryCategoryModal';
import ListView from './components/ListView';
import ModelInfoModal from './components/ModelInfoModal';
import style from './index.module.less';
import { MODEL_SOURCE_OPTIONS, SYSTEM_BOUNDARY_OPTIONS } from './model';
import {
  addIndustryCategory,
  addModel,
  copyModel,
  deleteIndustryCategory,
  deleteModel,
  editIndustryCategory,
  editModel,
  getIndustryCategoryList,
} from './service';
import {
  IndustryCategory,
  IndustryCategoryForm,
  ModelItem,
  ModelListParams,
} from './type';
import { postAccountingCopyModelViewBasic } from '../../FootprintAccount/AccountDetail/AccountInfo/service';
import { AccountingAddBasicApiData } from '../../FootprintAccount/AccountDetail/AccountInfo/type';
import { BuildModelDescribeSet } from '../../FootprintAccount/component/AccountInfoBuildModel/constant';
import AccountInfoModal from '../../FootprintAccount/component/AccountInfoModal';
import { FootprintAccountInfoUrlStatus } from '../../FootprintAccount/constant';
import { STEP_OPTION_VALUE } from '../../util/constant';

const { confirm } = Modal;

type ViewMode = 'card' | 'list';

const ModelLibrary = () => {
  const history = useHistory();

  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [industryList, setIndustryList] = useState<IndustryCategory[]>([]);

  /** 搜索参数 */
  const [searchParams, setSearchParams] = useState<ModelListParams>({
    pageNum: 1,
    pageSize: 10,
    industry: 'all',
  });

  const { industry } = searchParams;
  /** 弹窗控制 */
  const [modelModalProps, setModelModalProps] = useState<{
    open: boolean;
    model?: ModelItem;
    isCopy?: boolean;
  }>({
    open: false,
  });

  const [accountInfoModalProps, setAccountInfoModalProps] = useState<{
    open: boolean;
    modelId?: number;
  }>({ open: false });

  const [categoryModalProps, setCategoryModalProps] = useState<{
    open: boolean;
    editCategory?: IndustryCategory;
  }>({ open: false });

  /** 加载行业类别 */
  const fetchCategoryList = useCallback(async () => {
    const res = await getIndustryCategoryList();
    setIndustryList(res.data.data || []);
  }, []);

  const onModelNameChange = useMemo(
    () =>
      debounce(
        (modelName: string) =>
          setSearchParams({ ...searchParams, modelName, pageNum: 1 }),
        300,
      ),
    [searchParams],
  );

  /** 进入模型编辑 */
  const handleEditModel = (item: ModelItem) => {
    history.push(
      `${RouteMapsCorbonFootprint3.carbonFootprint3ModelManagement}/${item.id}`,
    );
  };

  /** 新增/编辑/复制模型 */
  const handleModelInfoOk = async (values: Record<string, any>) => {
    if (!modelModalProps.model) {
      const { data } = await addModel(values);
      Toast('success', I18N.carbonFootprint3.addANewModel);
      setModelModalProps({ open: false });
      setSearchParams({ ...searchParams });
      if (data?.data != null) {
        history.push(
          `${RouteMapsCorbonFootprint3.carbonFootprint3ModelManagement}/${data.data}`,
        );
      }
      return;
    }
    if (modelModalProps.isCopy) {
      await copyModel({
        ...values,
        id: modelModalProps.model.id,
      });
      Toast('success', I18N.carbonFootprint3.copyTheModelInto);
    } else {
      await editModel({
        ...values,
        id: modelModalProps.model.id,
      });
      Toast('success', I18N.carbonFootprint3.editTheModelInto);
    }
    setModelModalProps({ open: false });
    setSearchParams({ ...searchParams });
  };

  /** 行业类别操作 */
  const handleCategoryOk = async (values: IndustryCategoryForm) => {
    try {
      const { editCategory } = categoryModalProps;
      if (editCategory) {
        await editIndustryCategory({ ...values, id: editCategory.id });
        Toast('success', I18N.carbonFootprint3.editingIndustryCategory2);
      } else {
        await addIndustryCategory(values);
        Toast('success', I18N.carbonFootprint3.newIndustryCategory2);
      }
      setCategoryModalProps({ open: false });
      fetchCategoryList();
    } catch {
      /* empty */
    }
  };

  const handleDeleteCategory = (category: IndustryCategory) => {
    confirm({
      title: I18N.carbonFootprint3.confirmDeletion,
      icon: null,
      content: (
        <div>
          <p>
            {I18N.carbonFootprint3.confirmDeletionOfClass}
            {category.name}？
          </p>
          <p style={{ color: 'rgba(0,0,0,0.45)' }}>
            {I18N.carbonFootprint3.afterDeletionThisCategory}
          </p>
        </div>
      ),
      okText: I18N.base.confirm,
      cancelText: I18N.carbonFootprint.cancel,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteIndustryCategory(category.id);
          Toast('success', I18N.carbonFootprint.deleteSuccessful);
          fetchCategoryList();
          if (category.code === industry) {
            setSearchParams({ ...searchParams, industry: 'all', pageNum: 1 });
          }
        } catch {
          /* empty */
        }
      },
    });
  };

  /** Tab 项 */
  const tabItems = [
    { key: 'all', label: I18N.carbonFootprint3.whole },
    ...industryList.map(cat => ({
      key: cat.code,
      label: !cat.type ? (
        <span className={style.tabItem}>{cat.name}</span>
      ) : (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: I18N.carbonFootprint.edit,
                icon: <EditOutlined />,
                onClick: e => {
                  e.domEvent.stopPropagation();
                  setCategoryModalProps({ open: true, editCategory: cat });
                },
              },
              {
                key: 'delete',
                label: I18N.carbonFootprint.delete,
                icon: <DeleteOutlined />,
                danger: true,
                onClick: e => {
                  e.domEvent.stopPropagation();
                  handleDeleteCategory(cat);
                },
              },
            ],
          }}
          trigger={['contextMenu']}
        >
          <span className={style.tabItem}>{cat.name}</span>
        </Dropdown>
      ),
    })),
  ];

  /** 模型操作回调（卡片和列表共用） */
  const modelActions = {
    onEdit: handleEditModel,
    onCopy: (m: ModelItem) => {
      setModelModalProps({ open: true, model: m, isCopy: true });
    },
    onDelete: async (m: ModelItem) => {
      await deleteModel({ id: m.id });
      Toast('success', I18N.carbonFootprint.deleteSuccessful);
      setSearchParams({ ...searchParams, pageNum: 1 });
    },
    onViewInfo: (m: ModelItem) => {
      setModelModalProps({ open: true, model: m });
    },
    onCreateAccounting: m => {
      setAccountInfoModalProps({
        open: true,
        modelId: m.id,
      });
    },
  };

  const onAccountAdd = async (val: Record<string, any>) => {
    const { data } = await postAccountingCopyModelViewBasic(
      val as unknown as AccountingAddBasicApiData,
    );

    Toast('success', I18N.carbonFootprint3.accountingCreation);

    history.push({
      pathname:
        RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail,
      search: `?productId=${val.productId}&accountId=${data.data}&status=${FootprintAccountInfoUrlStatus.EDIT}&stepValue=${STEP_OPTION_VALUE.MODEL}&listOrGraph=${BuildModelDescribeSet.VISUAL}`,
    });
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  return (
    <div className={style.container}>
      {/* Header */}
      <div className={style.header}>
        <span className={style.title}>
          {I18N.carbonFootprint3.accountingModelLibrary}
        </span>
        <span className={style.description}>
          {I18N.carbonFootprint3.carbonBarrierModel}
          <span className={style.highlight}>2W+</span>
          {I18N.carbonFootprint3.modelCoverage}
          <span className={style.highlight}>30+</span>
          {I18N.carbonFootprint3.industry}
        </span>
      </div>

      {/* 内容区 */}
      <div
        className={classNames(style.content, {
          [style.contentCardMode]: viewMode === 'card',
        })}
      >
        {/* 筛选区 */}
        <div className={style.filterBar}>
          <div className={style.filterRow}>
            <div className={style.filterLeft}>
              <Input
                placeholder={I18N.carbonFootprint.modelName}
                allowClear
                maxLength={200}
                style={{ width: 200 }}
                defaultValue={searchParams.modelName}
                onChange={e => {
                  onModelNameChange(e.target.value);
                }}
              />
              <Select
                placeholder={I18N.carbonFootprint3.modelSource}
                allowClear
                style={{ width: 160 }}
                value={searchParams.source}
                options={MODEL_SOURCE_OPTIONS}
                onChange={source => {
                  setSearchParams({ ...searchParams, source, pageNum: 1 });
                }}
              />
              <Select
                placeholder={I18N.carbonFootprint.systemBoundary}
                allowClear
                style={{ width: 160 }}
                value={searchParams.scope}
                options={SYSTEM_BOUNDARY_OPTIONS}
                onChange={scope => {
                  setSearchParams({ ...searchParams, scope, pageNum: 1 });
                }}
              />
            </div>
            <div className={style.filterRight}>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setModelModalProps({ open: true })}
              >
                {I18N.productDigitalPassport.addNewModel}
              </Button>
            </div>
          </div>
        </div>

        {/* Tab 区 */}
        <div className={style.tabBar}>
          <Tabs
            activeKey={industry}
            onChange={key =>
              setSearchParams({ ...searchParams, industry: key, pageNum: 1 })
            }
            items={tabItems}
            size='small'
            tabBarExtraContent={
              <div className={style.iconBtnContent}>
                <Tooltip
                  placement='bottom'
                  title={I18N.carbonFootprint3.addCategory}
                >
                  <div
                    className={style.iconBtn}
                    onClick={() => setCategoryModalProps({ open: true })}
                  >
                    <IconAlibabaNew type='icon-icon-tianjia-new' />
                  </div>
                </Tooltip>
                <Tooltip
                  placement='bottom'
                  title={I18N.carbonFootprint3.cardMode}
                >
                  <div
                    className={classNames(style.iconBtn, {
                      [style.activeIconBtn]: viewMode === 'card',
                    })}
                    onClick={() => {
                      setSearchParams({ ...searchParams, pageNum: 1 });
                      setViewMode('card');
                    }}
                  >
                    <IconAlibabaNew type='icon-icon-xuanzechanpin' />
                  </div>
                </Tooltip>
                <Tooltip
                  placement='bottom'
                  title={I18N.carbonFootprint3.listMode}
                >
                  <div
                    className={classNames(style.iconBtn, {
                      [style.activeIconBtn]: viewMode === 'list',
                    })}
                    onClick={() => {
                      setSearchParams({ ...searchParams, pageNum: 1 });
                      setViewMode('list');
                    }}
                  >
                    <IconAlibaba type='icon-icon_qiehuanzhiliebiao' />
                  </div>
                </Tooltip>
              </div>
            }
          />
        </div>

        {/* 内容区 - 卡片/列表 */}
        {viewMode === 'card' ? (
          <div className={style.cardViewSlot}>
            <CardView searchParams={searchParams} {...modelActions} />
          </div>
        ) : (
          <ListView
            searchParams={searchParams}
            {...modelActions}
            setSearchParams={setSearchParams}
          />
        )}
      </div>

      {/* 弹窗 */}
      <ModelInfoModal
        {...modelModalProps}
        onOk={handleModelInfoOk}
        onCancel={() => setModelModalProps({ open: false })}
      />

      <IndustryCategoryModal
        {...categoryModalProps}
        onOk={handleCategoryOk}
        onCancel={() => setCategoryModalProps({ open: false })}
      />

      <AccountInfoModal
        {...accountInfoModalProps}
        scopeDisabled
        onClose={() => setAccountInfoModalProps({ open: false })}
        onConfirm={onAccountAdd}
      />
    </div>
  );
};

export default ModelLibrary;
