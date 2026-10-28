import { CloseOutlined } from '@ant-design/icons';
import uploadIcon from '@assets/svg/upload.svg';
import I18N from '@src/lang/I18N';
import { useMount, useUnmount } from 'ahooks';
import { Button, Input, Spin, Tooltip, Upload } from 'antd';
import { UploadFile } from 'antd/lib';
import classNames from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import csvIcon from '@/assets/svg/carbonFootprint/csv.svg';
import excelIcon from '@/assets/svg/carbonFootprint/excel.svg';
import { AnimationFullscreenModal } from '@/components/AnimationFullscreenModal';
import { LoadingProgressModal } from '@/components/LoadingProgressModal';
import { sleep, Toast } from '@/utils';
import { EAiType } from '@/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';
import TextOverflowTable from '@/views/carbonFootprint3/component/TextOverflowTable';

import AiSvg from './ai.svg';
import { BuildModelDescribe } from './components/FormModal';
import delSvg from './del.svg';
import styles from './index.module.less';
import { AiProcessStatus } from '../../../constant';
import { getAiProcessStatus, postAddModel } from '../../service';

interface IAiModalProps {
  onClosed?: (success: boolean) => void;
  accountInfo: any;
  showPromptModal?: () => void;
  aiLoading?: boolean;
  aiBuildSuccess?: boolean;
  updateAccountInfo?: () => void;
}

export const AiModal: FC<IAiModalProps> = props => {
  const {
    onClosed,
    accountInfo,
    aiLoading,
    aiBuildSuccess,
    showPromptModal,
    updateAccountInfo,
  } = props;
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const { accountName } = accountInfo;

  useEffect(() => {
    if (aiLoading) {
      setLoading(true);
    }
  }, [aiLoading]);

  useEffect(() => {
    if (accountInfo.aiStatus === 1) {
      setAiFormModalOpen(true);
    }
  }, [accountInfo.aiStatus]);

  const [aiFormModalOpen, setAiFormModalOpen] = useState(false);

  const aiProcessTimerRef = useRef<NodeJS.Timeout>();

  const [prompt, setPrompt] = useState('');
  // const [aiType, setAiType] = useState<EAiType>(accountInfo.aiType);
  const aiType = useRef<EAiType>(accountInfo.aiType);

  const sending = useRef(false);

  const initAiProcess = async () => {
    clearInterval(aiProcessTimerRef.current);
    const { data } = await getAiProcessStatus({ accountId: accountInfo?.id });

    sending.current = true;
    if (data.data === AiProcessStatus.FAIL && accountInfo?.aiStatus === 1) {
      // setAiFormModalOpen(true);
    }

    if (data.data === AiProcessStatus.PENDING) {
      // await goModelingBack(false);
      setLoading(true);
      sending.current = true;
      aiProcessTimerRef.current = setInterval(() => {
        getAiProcessStatus({ accountId: accountInfo?.id }).then(res => {
          if (res.data.data === AiProcessStatus.SUCCESS) {
            clearInterval(aiProcessTimerRef.current);
            // goModelingBack(true);
            // if (accountInfo.ai)
            if (aiType.current === EAiType.PROMPT) {
              showPromptModal?.();
            } else {
              setAiFormModalOpen(true);
            }
            updateAccountInfo?.();
            sending.current = false;
          } else if (res.data.data === AiProcessStatus.FAIL) {
            setLoading(false);
            sending.current = false;
          } else if (res.data.data === AiProcessStatus.PENDING) {
            sending.current = true;
          }
        });
      }, 3000);
    }

    if (data.data === AiProcessStatus.SUCCESS) {
      // await goModelingBack(true);
      // debugger
      // setAiFormModalOpen(true);
      sending.current = false;
      if (aiType.current === EAiType.PROMPT) {
        showPromptModal?.();
      } else {
        setAiFormModalOpen(true);
      }
      updateAccountInfo?.();
    } else if (data.data === AiProcessStatus.FAIL) {
      setLoading(false);
      sending.current = false;
    }
  };

  useUnmount(() => {
    clearInterval(aiProcessTimerRef.current);
  });

  useMount(initAiProcess);

  useUnmount(() => {
    clearInterval(aiProcessTimerRef.current);
  });

  const submit = async () => {
    if (sending.current) {
      return;
    }
    setLoading(true);
    sending.current = true;
    try {
      postAddModel(
        {
          fileUrl: files.map(item => ({
            url: item.response?.data || '',
          })),
        },
        {
          accountId: accountInfo.id,
          modelType: 2,
        },
      );
      await sleep(3000);
      initAiProcess();
      // setAiType(EAiType.EXCEL);
      aiType.current = EAiType.EXCEL;
    } catch (error) {
      // setLoading(false);
    } finally {
      sending.current = false;
      // setLoading(false);
    }
  };

  const submitPrompt = async () => {
    if (sending.current) {
      return;
    }
    setLoading(true);
    sending.current = true;
    try {
      postAddModel(
        {
          content: prompt,
        },
        {
          accountId: accountInfo.id,
          modelType: 1,
        },
      );
      await sleep(1000);
      initAiProcess();
      // setAiType(EAiType.PROMPT);
      aiType.current = EAiType.PROMPT;
    } catch (error) {
      // setLoading(false);
    } finally {
      sending.current = false;
      // setLoading(false);
    }
  };

  return (
    <div className={styles.aiModal}>
      <div className={styles.aiModalContent}>
        <div className={styles.aiModalHeader}>
          <div className={styles.aiModalTitle}>
            {I18N.carbonFootprint3.apply}
            <img className={styles.aiModalTitleImg} src={AiSvg} alt='ai' />
            {I18N.carbonFootprint3.createYourProduct}
          </div>
        </div>
        <div className={styles.aiModalBody}>
          <div className={styles.aiModalBodyItem}>
            <div className={styles.aiModalBodyItemTitle}>
              {I18N.carbonFootprint3.enterYourThoughts}
            </div>
            <Input.TextArea
              value={prompt}
              style={{
                resize: 'none',
                flexShrink: 0,
              }}
              onChange={e => setPrompt(e.target.value)}
              className={styles.aiModalBodyItemInput}
              placeholder={I18N.template(I18N.carbonFootprint3.enterAcc, {
                val1: accountName,
              })}
            />
            <div className={styles.aiModalBodyItemDesc}>
              {I18N.carbonFootprint3.aiWillBeBasedOn2}
            </div>
            <div className={styles.aiModalBodyItemBtn}>
              <Button
                type='primary'
                style={{ width: '100%' }}
                // disabled={!prompt}
                onClick={submitPrompt}
              >
                {I18N.carbonFootprint3.startModeling}
              </Button>
            </div>
          </div>
          <div className={styles.aiModalBodyItem}>
            <div className={styles.aiModalBodyItemTitle}>
              {I18N.carbonFootprint3.orUploadAlready}
            </div>
            <div
              className={classNames({
                [styles.hasFiles]: files.length > 0,
              })}
            >
              <Upload.Dragger
                className={styles.upload}
                name='file'
                accept='.csv, .CSV, .xlsx, .XLSX, .xls, .XLS'
                action={`${
                  process.env.REACT_APP_API_URL || ''
                }/file/file/uploadImg`}
                fileList={files}
                disabled={files.length >= 1}
                showUploadList={false}
                beforeUpload={uploadFile => {
                  if (uploadFile.size > 20 * 1024 * 1024) {
                    Toast(
                      'error',
                      I18N.enterpriseCarbonAccount2.fileMaximumNot,
                    );
                    return false;
                  }
                  return true;
                }}
                onChange={info => {
                  setFiles(pre => [
                    ...pre.filter(item => item.uid !== info.file.uid),
                    info.file,
                  ]);
                }}
              >
                {files.length === 0 && (
                  <>
                    <img alt='' src={uploadIcon} />
                    <div className={styles.uploadText}>
                      <span>
                        {I18N.enterpriseCarbonAccount2.directlyTransferFiles}
                      </span>
                      <span className={styles.uploadClickText}>
                        {I18N.components.clickToUpload}
                      </span>
                    </div>
                    <div className={styles.uploadTip}>
                      {I18N.carbonFootprint3.supportCsv}
                    </div>
                  </>
                )}
                {files.length > 0 && (
                  <div className={styles.filesWrapper}>
                    {files.map(item => (
                      <Tooltip
                        title={
                          item.status === 'error'
                            ? I18N.carbonFootprint3.uploadFailedPlease
                            : ''
                        }
                      >
                        <div
                          key={item.uid}
                          className={classNames(styles.fileItem, {
                            [styles.fileItemError]: item.status === 'error',
                          })}
                          onClick={e => e.stopPropagation()}
                        >
                          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                          <img
                            src={delSvg}
                            alt=''
                            className={styles.del}
                            onClick={() =>
                              setFiles(pre =>
                                pre.filter(i => i.uid !== item.uid),
                              )
                            }
                          />
                          {item.name.endsWith('.csv') && (
                            <img
                              src={csvIcon}
                              alt=''
                              className={styles.csvIcon}
                            />
                          )}
                          {item.name.endsWith('.xlsx') && (
                            <img
                              src={excelIcon}
                              alt=''
                              className={styles.csvIcon}
                            />
                          )}
                          <Spin spinning={item.status === 'uploading'}>
                            <TextOverflowTable
                              value={item.name}
                              maxLength={10}
                              maxWidth={194}
                            />
                          </Spin>
                        </div>
                      </Tooltip>
                    ))}
                    {/* <div
                      className={classNames(styles.fileItem, styles.add, {
                        [styles.disabled]: files.length >= 1,
                      })}
                      onClick={e => {
                        if (files.length >= 1) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <PlusOutlined />
                      继续添加
                    </div> */}
                  </div>
                )}
              </Upload.Dragger>
            </div>
            <div className={styles.aiModalBodyItemDesc}>
              {I18N.carbonFootprint3.aiWillAnalyze}
            </div>
            <div className={styles.aiModalBodyItemBtn}>
              <Button
                type='primary'
                style={{ width: '100%' }}
                disabled={!files.some(item => item.status === 'done')}
                onClick={() => submit()}
                loading={files.some(item => item.status === 'uploading')}
              >
                {I18N.carbonFootprint3.startModeling}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.closeModal} onClick={() => onClosed?.()}>
        <CloseOutlined />
      </div>
      <LoadingProgressModal
        open={loading}
        onClose={() => setLoading(false)}
        text={I18N.carbonFootprint3.modelCreationInProgress}
      />
      <AnimationFullscreenModal open={aiFormModalOpen}>
        <BuildModelDescribe
          accountInfo={accountInfo}
          aiBuildSuccess={aiBuildSuccess}
          onClose={success => {
            setAiFormModalOpen(false);
            setLoading(false);
            if (accountInfo.aiStatus === 1) {
              onClosed?.(success);
            }
          }}
        />
      </AnimationFullscreenModal>
    </div>
  );
};
