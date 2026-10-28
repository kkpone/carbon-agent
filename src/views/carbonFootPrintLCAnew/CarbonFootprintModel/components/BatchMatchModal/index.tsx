/**
 * @description 背景数据批量匹配弹窗
 */
import { ProTable } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { Modal, Button } from 'antd';
import { includes } from 'lodash-es';
import { useEffect, useState } from 'react';
import { Search, withTable } from 'table-render';

import { useLifeCycleList } from '@/views/carbonFootPrintLCAnew/hook';

import { columns } from './columns';
import { MATCH_STATUS } from './constant';
import style from './index.module.less';
import { searchSchema } from './schemas';
import { getIOFactorList, postIOFactorListMatch } from './service';
import { IoFactorMatchResp, IOFactorRequest, IOFactorResp } from './type';

const { UNMATCHED, MATCH_SUCCESS, MATCH_ERROR } = MATCH_STATUS;

interface BatchMatchModalProps {
  /** 模型id */
  modelId: number;
  /** 弹窗显隐 */
  open: boolean;
  /** 生命周期id列表 */
  lifeCycleListIds?: string;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
}

const BatchMatchModal = ({
  modelId,
  open,
  handleCancel,
  lifeCycleListIds,
}: BatchMatchModalProps) => {
  /** 生命周期枚举 */
  const lifeCycleList = useLifeCycleList(
    lifeCycleListIds,
    lifeCycleListIds,
  )?.map(lifeCycle => ({
    label: lifeCycle.stageName,
    value: lifeCycle.id,
  }));
  /** 匹配按钮文案 */
  const [matchText, setMatchText] = useState(
    I18N.carbonFootPrintLCA.startMatching,
  );

  /** 匹配按钮loading */
  const [matchLoading, setMatchLoading] = useState<boolean>(false);

  /** 列表数据 */
  const [dataSource, setDataSource] = useState<IOFactorResp[]>([]);

  /** 选中的数据Key */
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /** 是否禁用 */
  const disabled = selectedRowKeys.length === 0;

  /** 选中表格 */
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  /** 初始化 */
  const onInit = () => {
    /** 取消弹窗表格选中 */
    setSelectedRowKeys([]);
    /** 匹配按钮文案 */
    setMatchText(I18N.carbonFootPrintLCA.startMatching);
  };

  /** 获取列表 */
  const getList = (
    searchInfo?: IOFactorRequest,
    matchInfo?: IoFactorMatchResp[],
  ) => {
    getIOFactorList({
      ...searchInfo,
      modelId,
    }).then(({ data }) => {
      if (matchInfo?.length) {
        const matchIds = matchInfo?.map(item => item.id);
        const matchList = dataSource?.map(item => {
          if (includes(matchIds, item.id)) {
            const matchInfoItem = matchInfo?.find(
              matchItem => matchItem.id === item.id,
            );
            return {
              ...item,
              factorName: matchInfoItem?.factorName,
              matchStatus: matchInfoItem?.factorName
                ? MATCH_SUCCESS
                : MATCH_ERROR,
              matchStatus_name: matchInfoItem?.factorName
                ? I18N.carbonFootPrintLCA.matchSuccessful
                : I18N.carbonFootPrintLCA.matchingFailed,
              tagName: matchInfoItem?.tagName,
            };
          }
          return item;
        });
        setDataSource(matchList);
      } else {
        const result =
          data?.data?.map(item => ({
            ...item,
            matchStatus: UNMATCHED,
            matchStatus_name: I18N.carbonFootPrintLCA.unmatched,
          })) || [];

        setDataSource(result);
      }
    });
  };

  useEffect(() => {
    if (open) {
      getList();
    }
  }, [open]);

  return (
    <Modal
      wrapClassName={style.wrapper}
      centered
      title={I18N.carbonFootPrintLCA.backgroundDataBatch}
      open={open}
      width='70%'
      maskClosable={false}
      destroyOnClose
      onCancel={() => {
        /** 关闭弹窗取消弹窗表格选中 */
        setSelectedRowKeys([]);
        handleCancel();
      }}
      footer={[
        <Button
          onClick={() => {
            /** 关闭弹窗取消弹窗表格选中 */
            setSelectedRowKeys([]);
            handleCancel();
          }}
        >
          {I18N.Factors.cancel}
        </Button>,
      ]}
    >
      <div className={style.tableModalWrapper}>
        <div>
          {/* 暂时隐藏 */}
          {/* <div className={style.searchHeaderWrapper}>
            <div>
              {I18N.carbonFootPrintLCA.doYouWantToActivateIntelligence}
              <Switch />
            </div>
            <div>
              {I18N.carbonFootPrintLCA.selectMatchingCriteria}
              <Select
                style={{ width: 180 }}
                placeholder={I18N.Factors.pleaseSelect}
              />
            </div>
          </div> */}
          <Search
            searchText={I18N.utils.search}
            resetText={I18N.utils.reset}
            schema={searchSchema({ lifeCycleList })}
            searchBtnRender={(submit, clearSearch) => [
              <Button
                type='primary'
                onClick={async () => {
                  onInit();
                  const { data } = await submit();
                  getList(data);
                }}
              >
                {I18N.prodManagement.query}
              </Button>,
              <Button
                onClick={() => {
                  onInit();
                  clearSearch();
                  getList();
                }}
              >
                {I18N.prodManagement.reset}
              </Button>,
            ]}
          />
        </div>
        <div className={style.btnWrapper}>
          <Button
            type='primary'
            disabled={disabled}
            loading={matchLoading}
            onClick={async () => {
              setMatchLoading(true);
              setMatchText(I18N.carbonFootPrintLCA.matchingInProgress);
              try {
                const { data } = await postIOFactorListMatch({
                  idList: selectedRowKeys as number[],
                  modelId,
                });
                getList(undefined, data?.data);
              } finally {
                setMatchLoading(false);
                setMatchText(I18N.carbonFootPrintLCA.reMatch);
              }
            }}
          >
            {matchText}
          </Button>
        </div>
        <ProTable<IOFactorResp>
          columns={columns()}
          key='bom'
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            columnWidth: 48,
            ...rowSelection,
          }}
          scroll={{ y: 420 }}
          search={false}
          rowKey='id'
          toolBarRender={false}
          dataSource={dataSource}
        />
      </div>
    </Modal>
  );
};
export default withTable(BatchMatchModal);
