/**
 * @description 过程描述
 */

import I18N from '@src/lang/I18N';
import { Descriptions, Button, Typography, Tooltip } from 'antd';
import { useState } from 'react';

import { PageTypeInfo } from '@/router/utils/enums';

import style from './index.module.less';
import { ProcessDeleteModal } from '../ProcessDeleteModal';

const { Text } = Typography;

const { edit, show } = PageTypeInfo;

interface ProcessDescribeProps {
  /** 是否展示操作按钮 */
  showActionBtn: boolean;
  /** 是否展示保存到库的按钮 */
  showSaveToLibraryBtn: boolean;
  /** 过程描述详情信息 */
  processDescDataSource?: {
    /** 过程名称 */
    processName?: string;
    /** 系统边界 */
    systemBoundary?: string;
  };
  /** 操作按钮的方法 */
  onActionBtnClick?: (type: string) => void;
  /** 点击保存到库的方法 */
  onSaveToLibraryFn?: () => void;
  /** 删除过程的方法 */
  onDeleteProcess?: (successCallBack: () => void) => void;
}

const ProcessDescribe = ({
  showActionBtn = true,
  showSaveToLibraryBtn = false,
  processDescDataSource,
  onActionBtnClick,
  onSaveToLibraryFn,
  onDeleteProcess,
}: ProcessDescribeProps) => {
  const { processName } = processDescDataSource || {};

  /** 确认按钮loading */
  const [delBtnLoading, setDelBtnLoading] = useState(false);

  /** 删除弹窗 */
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className={style.processDescribeWrapper}>
      <div className={style.headerWrapper}>
        {I18N.carbonFootPrintLCA.processDescription}
        {showActionBtn && (
          <div className={style.actionBtnWrapper}>
            <Button
              type='primary'
              onClick={() => {
                onActionBtnClick?.(edit);
              }}
            >
              {I18N.carbonFootPrintLCA.editingProcess}
            </Button>
            <Button
              type='primary'
              onClick={() => {
                setDeleteOpen(true);
              }}
            >
              {I18N.carbonFootPrintLCA.deleteProcess2}
            </Button>
            {showSaveToLibraryBtn && (
              <Button
                onClick={() => {
                  onSaveToLibraryFn?.();
                }}
              >
                {I18N.carbonFootPrintLCA.saveToLibrary2}
              </Button>
            )}
          </div>
        )}
      </div>
      <ProcessDeleteModal
        confirmLoading={delBtnLoading}
        processName={processName}
        open={deleteOpen}
        onCancel={() => {
          setDeleteOpen(false);
        }}
        onOk={() => {
          setDelBtnLoading(true);
          onDeleteProcess?.(() => {
            setDelBtnLoading(false);
            setDeleteOpen(false);
          });
        }}
      />
      <Descriptions bordered>
        <Descriptions.Item label={I18N.carbonFootPrintLCA.processName}>
          <Tooltip placement='topLeft' title={processName}>
            <Text
              className={style.name}
              ellipsis
              onClick={() => {
                onActionBtnClick?.(show);
              }}
            >
              {processName || '-'}
            </Text>
          </Tooltip>
        </Descriptions.Item>
        {/* <Descriptions.Item label={I18N.Factors.systemBoundary}>
          <Tooltip placement='topLeft' title={systemBoundary}>
            <Text className={style.systemBoundary} ellipsis>
              {systemBoundary || '-'}
            </Text>
          </Tooltip>
        </Descriptions.Item> */}
      </Descriptions>
    </div>
  );
};
export default ProcessDescribe;
