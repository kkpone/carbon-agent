/**
 * @description 过程直接排放
 */

import { ActionType, ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Button, Collapse, Space, Spin } from 'antd';
import { useRef, useState } from 'react';

import { InfoTitle } from '@/components/InfoTitle';
import { PageEmpty } from '@/components/PageEmpty';
import { PageTypeInfo } from '@/router/utils/enums';

import { processColumns } from './columns';
import { EmissionSourceInfoDrawer } from './components/EmissionSourceInfoDrawer';
import { FlowInfoDrawer } from './components/FlowInfoDrawer';
import { PfcEmissionInfoDrawer } from './components/PfcEmissionInfoDrawer';
import { DrawerType } from './constant';
import style from './index.module.less';
import { getProcessEmissionListApi } from '../../../service';
import { ProcessEmissionResp, ProductProcessResp } from '../../../type';

const { Panel } = Collapse;

const { add } = PageTypeInfo;

interface ProcessDirectEmissionProps {
  /** cbam报表id */
  cbamId: number;
  /** 是否是详情 */
  isDetail: boolean;
  /** 表格数据 */
  dataSource: ProductProcessResp[];
  /** 表格loading */
  loading?: boolean;
  /** 刷新表格 */
  onRefresh?: () => void;
}

const ProcessDirectEmission = ({
  cbamId,
  isDetail,
  dataSource,
  loading,
  onRefresh,
}: ProcessDirectEmissionProps) => {
  const actionRef = useRef<ActionType>();

  /** 控制详情的抽屉 */
  const [open, setOpen] = useState<DrawerType>();

  /** 列表id */
  const [rowId, setRowId] = useState<number>();

  /** 列表操作按钮的类型 */
  const [actionBtnType, setActionBtnType] = useState<string>();

  /** 当前激活面板的 key (当前工序ID)*/
  const [currentActiveKey, setCurrentActiveKey] = useState<string>();

  /** 操作按钮 */
  const onActionBtnClick = (
    type: string,
    drawerType?: DrawerType,
    id?: number,
  ) => {
    /** 操作按钮的类型 */
    setActionBtnType(type);
    /** 列表id */
    setRowId(id);
    /* 打开详情抽屉 */
    setOpen(drawerType);
  };

  /** 刷新表格 */
  const reload = () => {
    /** 更新工序列表 => 更新是否添加排放数据提示 */
    onRefresh?.();
    /** 刷新表格 */
    actionRef.current?.reload();
  };

  /** 初始化抽屉 */
  const onInit = () => {
    setRowId(undefined);
    setActionBtnType(undefined);
    setOpen(undefined);
  };

  return (
    <div className={style.emissionWrapper}>
      <InfoTitle title={I18N.cbam.directProcessScheduling} />
      <Spin spinning={loading}>
        {dataSource?.length ? (
          <Collapse
            className={style.collapseWrapper}
            accordion
            bordered={false}
            onChange={activeKey => {
              setCurrentActiveKey(
                Array.isArray(activeKey) ? activeKey[0] : activeKey,
              );
            }}
          >
            {dataSource?.map(item => {
              const { id, processName, sourceNum: hasData } = item || {};

              /** 当前工序是否打开 */
              const isOpen = `${currentActiveKey}` === `${id}`;

              return (
                <Panel
                  header={
                    <div>
                      <span className={style.panelTitle}>
                        {processName || '-'}
                      </span>
                      {!hasData && (
                        <span className={style.emptyTip}>
                          {I18N.cbam.noEmissionsAdded}
                        </span>
                      )}
                    </div>
                  }
                  extra={
                    isOpen
                      ? !isDetail && (
                          <Space>
                            <Button
                              key={`${id}flow`}
                              type='primary'
                              onClick={e => {
                                e.stopPropagation();
                                onActionBtnClick(add, 'flow');
                              }}
                            >
                              {I18N.cbam.addNewSourcesAndFlows}
                            </Button>
                            <Button
                              key={`${id}pfc`}
                              type='primary'
                              onClick={e => {
                                e.stopPropagation();
                                onActionBtnClick(add, 'PFC');
                              }}
                            >
                              {I18N.cbam.addPfc}
                            </Button>
                            <Button
                              key={`${id}emission`}
                              type='primary'
                              onClick={e => {
                                e.stopPropagation();
                                onActionBtnClick(add, 'emission');
                              }}
                            >
                              {I18N.cbam.addNewEmissionSources}
                            </Button>
                          </Space>
                        )
                      : !isDetail && (
                          <div className={style.emptyTip}>
                            {I18N.cbam.configureEmissionNumbers}
                          </div>
                        )
                  }
                  key={`${id}`}
                  className={style.panelHeader}
                >
                  <ProTable<ProcessEmissionResp>
                    actionRef={actionRef}
                    key={`processProTable${cbamId}${id}`}
                    rowKey='id'
                    search={false}
                    pagination={false}
                    toolBarRender={false}
                    columns={processColumns({
                      isDetail,
                      onActionBtnClick,
                      reload,
                    })}
                    params={{
                      currentActiveKey,
                      productProcessId: id,
                      open,
                    }}
                    request={async params => {
                      const { productProcessId } = params;
                      if (cbamId && isOpen && productProcessId) {
                        return getProcessEmissionListApi({
                          cbamId,
                          productProcessId,
                        }).then(({ data }) => ({
                          data: data?.data || [],
                          success: true,
                          total: data?.data?.length || 0,
                        }));
                      }
                      return { data: [], success: true };
                    }}
                  />
                </Panel>
              );
            })}
          </Collapse>
        ) : (
          <PageEmpty />
        )}
      </Spin>

      {/* 源流详情抽屉 */}
      <FlowInfoDrawer
        key={`${cbamId}flow`}
        open={open === 'flow'}
        flowId={rowId}
        cbamId={cbamId}
        productProcessId={Number(currentActiveKey)}
        actionBtnType={actionBtnType}
        onOk={() => {
          onInit();
          reload();
        }}
        onClose={() => onInit()}
      />

      {/* PFC详情抽屉 */}
      <PfcEmissionInfoDrawer
        key={`${cbamId}pfc`}
        open={open === 'PFC'}
        pfcId={rowId}
        cbamId={cbamId}
        productProcessId={Number(currentActiveKey)}
        actionBtnType={actionBtnType}
        onOk={() => {
          onInit();
          reload();
        }}
        onClose={() => onInit()}
      />

      {/* 排放源详情抽屉 */}
      <EmissionSourceInfoDrawer
        key={`${cbamId}emission`}
        open={open === 'emission'}
        emissionId={rowId}
        cbamId={cbamId}
        productProcessId={Number(currentActiveKey)}
        actionBtnType={actionBtnType}
        onOk={() => {
          onInit();
          reload();
        }}
        onClose={() => onInit()}
      />
    </div>
  );
};

export default ProcessDirectEmission;
