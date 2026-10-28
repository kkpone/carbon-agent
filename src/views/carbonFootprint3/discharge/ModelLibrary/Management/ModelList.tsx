import { PlusOutlined } from '@ant-design/icons';
import defaultImg from '@src/assets/svg/accountProductImg.svg';
import { MenuList } from '@src/components/MenuList';
import { MenuData } from '@src/components/MenuList/type';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import EmissionSourceDrawer from '@src/views/carbonFootprint3/component/EmissionSourceDrawer';
import { ALL_EMISSION_LABEL } from '@src/views/carbonFootprint3/constant';
import { QuickAccountLifeCycleStage } from '@src/views/carbonFootprint3/type';
import { Button, Modal, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  Dispatch,
  forwardRef,
  FC,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  deleteModelEmission,
  getModelEmissionList,
  getModelEmissionMenu,
} from './service';
import style from './index.module.less';
import { ModelItem, ModelSourceEnum } from '../type';
import ModelInfoModal from '../components/ModelInfoModal';
import { editModel } from '../service';

interface ModelListProps {
  modelInfo: ModelItem;
  refreshModelInfo: () => void;
}

interface EmissionTableBlockProps {
  modelInfo: ModelItem;
  menuInfo: MenuData;
  menuReset: (opt?: { resetMenu?: boolean }) => void;
  onEdit: (item: Record<string, any>) => void;
  onCopy: (item: Record<string, any>) => void;
}

type EmissionTableBlockRef = {
  setPagination: Dispatch<
    SetStateAction<{ current: number; pageSize: number }>
  >;
};

const PAGE_SIZE = 10;

const EmissionTableBlock = forwardRef<
  EmissionTableBlockRef,
  EmissionTableBlockProps
>(({ modelInfo, menuInfo, menuReset, onEdit, onCopy }, ref) => {
  const isSystemModel = modelInfo.source === ModelSourceEnum.SYSTEM;
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
  });

  const [tableData, setTableData] = useState<{
    rows: Record<string, any>[];
    total: number;
  }>();
  const [loading, setLoading] = useState(false);

  async function requestEmissionTable(params: {
    modelId: number;
    stage: QuickAccountLifeCycleStage;
    type?: number | string;
    pageNum: number;
    pageSize: number;
  }) {
    setLoading(true);
    try {
      const res = await getModelEmissionList({
        modelId: params.modelId,
        stage: params.stage,
        type: params.type,
        pageNum: params.pageNum,
        pageSize: params.pageSize,
      });
      setTableData({
        rows: res.data.data.rows as Record<string, any>[],
        total: res.data.data.total as number,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    requestEmissionTable({
      modelId: modelInfo.id,
      stage: menuInfo.stage,
      type: menuInfo.type,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    });
  }, [modelInfo.id, menuInfo, pagination]);

  useImperativeHandle(ref, () => ({ setPagination }), []);

  const handleDelete = (item: Record<string, any>) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionArrangement, {
        val1: item.name,
      }),
      okButtonProps: { danger: true },
      icon: null,
      onOk: async () => {
        await deleteModelEmission({ id: item.id });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        const onlyOneOnPage = (tableData?.rows?.length ?? 0) === 1;
        menuReset({ resetMenu: onlyOneOnPage });
      },
    });
  };

  const emissionColumns: ColumnsType<Record<string, any>> = [
    {
      title: I18N.carbonFootprint.name,
      width: 230,
      fixed: 'left',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.type,
      width: 120,
      dataIndex: 'type',
      ellipsis: true,
      render: (val: number) => ALL_EMISSION_LABEL()[val],
    },
    {
      title: I18N.carbonFootprint.emissionFactors1,
      width: 200,
      ellipsis: true,
      render: (_val: unknown, item: Record<string, any>) =>
        `${item.factor || '-'}${item.factorUnit || '-'}`,
    },
    {
      title: I18N.carbonFootprint.operation,
      width: isSystemModel ? 100 : 220,
      fixed: 'right',
      dataIndex: 'set',
      render: (_: unknown, item: Record<string, any>) => (
        <div className={style.operateColumn}>
          <Button type='link' onClick={() => onEdit(item)}>
            {I18N.carbonFootprint3.details}
          </Button>
          {!isSystemModel && (
            <>
              <Button type='link' onClick={() => onCopy(item)}>
                {I18N.carbonFootprint.copy}
              </Button>
              <Button type='link' danger onClick={() => handleDelete(item)}>
                {I18N.carbonFootprint.delete}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table<Record<string, any>>
      bordered={false}
      loading={loading}
      columns={emissionColumns}
      dataSource={tableData?.rows ?? []}
      rowKey='id'
      scroll={{ x: 1200 }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: tableData?.total ?? 0,
        showSizeChanger: true,
        showTotal: t =>
          I18N.template(I18N.carbonFootprint3.totalOfTItems, { val1: t }),
        onChange: (page, pageSize) => {
          setPagination({
            current: page,
            pageSize: pageSize || PAGE_SIZE,
          });
        },
      }}
    />
  );
});

EmissionTableBlock.displayName = 'EmissionTableBlock';

const ModelList: FC<ModelListProps> = ({ modelInfo, refreshModelInfo }) => {
  const isSystemModel = modelInfo.source === ModelSourceEnum.SYSTEM;
  const [menuInfo, setMenuInfo] = useState<MenuData>();
  const [modelInfoModalOpen, setModelInfoModalOpen] = useState(false);

  const [emissionDrawerProps, setEmissionDrawerProps] = useState<{
    visible: boolean;
    emissionSourceId?: number;
    copyStatus?: boolean;
  }>({ visible: false });

  const emissionTableRef = useRef<EmissionTableBlockRef>(null);

  const [menuData, setMenuData] = useState<MenuData[]>();
  const [treeLoading, setTreeLoading] = useState(false);

  async function requestModelEmissionMenu(
    modelId: number,
    menuSelection: 'keep' | 'first' = 'keep',
  ) {
    setTreeLoading(true);
    try {
      const { data } = await getModelEmissionMenu({ id: modelId });
      const list = data.data as MenuData[];
      setMenuData(list);
      if (menuSelection === 'first') {
        setMenuInfo(list[0]);
      } else {
        setMenuInfo(prev => prev || list[0]);
      }
      return list;
    } finally {
      setTreeLoading(false);
    }
  }

  useEffect(() => {
    requestModelEmissionMenu(modelInfo.id, 'first');
  }, [modelInfo.id]);

  const onSelectMenu = (data?: MenuData) => {
    if (data) setMenuInfo(data);
  };

  const menuReset = (opt?: { resetMenu?: boolean }) => {
    let menuKeyWillChange = false;
    if (opt?.resetMenu) {
      const parentMenu = menuData?.find(
        m => m.stage === menuInfo?.stage && !m.type,
      );
      if (parentMenu && String(parentMenu.id) !== String(menuInfo?.id)) {
        setMenuInfo(parentMenu);
        menuKeyWillChange = true;
      }
    }
    requestModelEmissionMenu(modelInfo.id);
    if (!menuKeyWillChange) {
      emissionTableRef.current?.setPagination(p => ({ ...p }));
    }
  };

  const closeEmissionDrawer = () => {
    setEmissionDrawerProps({
      visible: false,
      copyStatus: false,
      emissionSourceId: undefined,
    });
  };

  const handleEdit = (item: Record<string, any>) => {
    setEmissionDrawerProps({
      visible: true,
      copyStatus: false,
      emissionSourceId: item.id,
    });
  };

  const handleCopy = (item: Record<string, any>) => {
    setEmissionDrawerProps({
      visible: true,
      copyStatus: true,
      emissionSourceId: item.id,
    });
  };

  return (
    <div className={style.buildModelList}>
      <div className={style.main}>
        <div className={style.mainMenu}>
          {menuData && (
            <MenuList
              menuValue={menuInfo ? [menuInfo.id] : []}
              productInfo={{
                productPic: defaultImg,
                accountName: modelInfo.modelName,
                emission: 0,
              }}
              accountInfo={modelInfo as any}
              treeMenus={menuData}
              treeLoading={treeLoading}
              onSelectMenu={onSelectMenu}
              editAccount={() => setModelInfoModalOpen(true)}
              hideAccountPeriodAndEmission
            />
          )}
        </div>
        <div className={style.mainTable}>
          {menuInfo && (
            <div className={style.tableMain}>
              {!isSystemModel && (
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={() =>
                    setEmissionDrawerProps({
                      visible: true,
                      copyStatus: false,
                      emissionSourceId: undefined,
                    })
                  }
                >
                  {I18N.carbonFootprint.newEmissionSourcesAdded}
                </Button>
              )}
              <div className={style.tableBlockTopSpacing}>
                <EmissionTableBlock
                  ref={emissionTableRef}
                  key={menuInfo.id}
                  modelInfo={modelInfo}
                  menuInfo={menuInfo}
                  menuReset={menuReset}
                  onEdit={handleEdit}
                  onCopy={handleCopy}
                />
              </div>
              <EmissionSourceDrawer
                copyStatus={!!emissionDrawerProps.copyStatus}
                visible={emissionDrawerProps.visible}
                showSupplier={false}
                accountId={modelInfo.id}
                useModelEmissionApi
                readPretty={isSystemModel}
                emissionSourceId={emissionDrawerProps.emissionSourceId}
                stage={menuInfo.stage as QuickAccountLifeCycleStage}
                initValues={{ type: menuInfo.type }}
                onClose={closeEmissionDrawer}
                onSuccess={() => {
                  closeEmissionDrawer();
                  menuReset();
                }}
              />
            </div>
          )}
        </div>
      </div>
      <ModelInfoModal
        open={modelInfoModalOpen}
        model={modelInfo}
        onOk={async values => {
          await editModel({ ...values, id: modelInfo.id });
          refreshModelInfo();
          setModelInfoModalOpen(false);
          const newMenus = await requestModelEmissionMenu(modelInfo.id);
          if (!newMenus.length) return;
          const nextMenu = newMenus[0];
          const sameMenuKey =
            menuInfo &&
            String(nextMenu.id) === String(menuInfo.id) &&
            nextMenu.stage === menuInfo.stage &&
            nextMenu.type === menuInfo.type;
          setMenuInfo(nextMenu);
          // 切换菜单项时由表格 useEffect 依赖拉数；立刻改分页仍用旧 menuInfo，会和服务端菜单不一致
          if (sameMenuKey) {
            emissionTableRef.current?.setPagination(p => ({ ...p }));
          }
        }}
        onCancel={() => {
          setModelInfoModalOpen(false);
        }}
      />
    </div>
  );
};

export default ModelList;
