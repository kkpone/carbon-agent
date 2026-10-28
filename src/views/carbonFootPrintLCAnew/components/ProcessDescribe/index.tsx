/**
 * @description 过程描述
 */

import I18N from '@src/lang/I18N';
import { Descriptions, Button, Typography, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { PageTypeInfo } from '@/router/utils/enums';
import { Toast } from '@/utils';
import { downloadFile } from '@/views/components/utils';

import style from './index.module.less';
import {
  getProcessIlcdByModelId,
  getProductionDetailURLByModelId,
} from '../../ProductManagement/service';
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
    /** 过程ccdbUrl */
    ccdbUrl?: string;
    /** 过程id */
    processId?: number;
    /** 过程名称 */
    processName?: string;
    /** 系统边界 */
    systemBoundary?: string;
    /** 模型id */
    modelId?: number;
    /** 模型名称 */
    modelName?: string;
  };
  /** 操作按钮的方法 */
  onActionBtnClick?: (type: string) => void;
  /** 点击保存到库的方法 */
  onSaveToLibraryFn?: () => void;
  /** 删除过程的方法 */
  onDeleteProcess?: (successCallBack: () => void) => void;
  /** 是否是库 */
  isLib?: boolean;
}

const ProcessDescribe = ({
  showActionBtn = true,
  showSaveToLibraryBtn = false,
  processDescDataSource,
  onActionBtnClick,
  onSaveToLibraryFn,
  onDeleteProcess,
  isLib,
}: ProcessDescribeProps) => {
  const { processName } = processDescDataSource || {};

  // 初始值取一次
  const [ccdbUrl, setCcdbUrl] = useState<string | undefined>(
    () => processDescDataSource?.ccdbUrl,
  );

  useEffect(() => {
    if (processDescDataSource?.ccdbUrl && !ccdbUrl) {
      setCcdbUrl(processDescDataSource.ccdbUrl);
    }
  }, [processDescDataSource?.ccdbUrl]);

  /** 确认按钮loading */
  const [delBtnLoading, setDelBtnLoading] = useState(false);

  /** 删除弹窗 */
  const [deleteOpen, setDeleteOpen] = useState(false);

  const getProcessDescDetail = () => {
    if (processDescDataSource?.modelId) {
      getProductionDetailURLByModelId({
        modelId: processDescDataSource?.modelId,
      }).then(({ data }) => {
        setCcdbUrl(data?.data);
      });
    }
  };

  /** 定时器 */
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!timerRef.current) {
      timerRef.current = window.setInterval(() => {
        requestAnimationFrame(() => {
          getProcessDescDetail();
        });
      }, 2000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [processDescDataSource]);

  return (
    <div className={style.processDescribeWrapper}>
      <div className={style.headerWrapper}>
        {I18N.carbonFootPrintLCA.processDescription}
        {showActionBtn && (
          <div className={style.actionBtnWrapper}>
            {!isLib && (
              <Button
                type='primary'
                disabled={!ccdbUrl}
                onClick={() => {
                  downloadFile(
                    ccdbUrl || '',
                    `${processDescDataSource?.modelName || 'factor'}`,
                  );
                }}
              >
                {I18N.carbonFootPrintLCA.downloadFactor}
              </Button>
            )}
            {!isLib && (
              <Button
                type='primary'
                onClick={() => {
                  if (!processDescDataSource?.modelId) {
                    return;
                  }
                  setCcdbUrl(undefined);
                  Toast('warn', I18N.carbonFootPrintLCA.factorFileGenerating);
                  setTimeout(() => {
                    if (processDescDataSource?.modelId !== undefined) {
                      getProcessIlcdByModelId({
                        modelId: processDescDataSource?.modelId,
                      }).then(({ data }) => {
                        if (data.code === 200) {
                          getProcessDescDetail();
                        }
                      });
                    }
                  }, 0);
                }}
              >
                {I18N.carbonFootPrintLCA.exportProductIlcd}
              </Button>
            )}
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
