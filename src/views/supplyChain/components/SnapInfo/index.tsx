import I18N from '@src/lang/I18N';
import { Button, Col, Row } from 'antd';
import axios, { CancelToken } from 'axios';
import { FC, useEffect, useRef, useState } from 'react';

import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import { enterpriseGetReport, footprintGetReport } from '../../service';
import { EnterpriseSnap, FootprintSnap } from '../../type';

const SnapInfo: FC<{
  snap: FootprintSnap | EnterpriseSnap | null;
  isOrgCollection: boolean;
  companyId?: number;
  /** 禁用在线预览（模型共享提交前） */
  previewDisabled?: boolean;
  /** 禁用报告下载（模型共享提交前） */
  downloadDisabled?: boolean;
  /** 无快照时也展示卡片占位（模型共享任务） */
  showPlaceholder?: boolean;
}> = ({
  snap: snapFromProps,
  isOrgCollection,
  companyId,
  previewDisabled = false,
  downloadDisabled = false,
  showPlaceholder = false,
}) => {
  const [snap, setSnap] = useState<FootprintSnap | EnterpriseSnap | null>(null);

  const countRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const loopSnap = (opt: {
    snap: EnterpriseSnap | FootprintSnap;
    isOrgCollection: boolean;
    token: CancelToken;
    companyId?: number;
  }) => {
    const snapGenerateFinish = opt.isOrgCollection
      ? (opt.snap as EnterpriseSnap).reportFileList.every(
          file => !!file.filePath,
        )
      : !!(opt.snap as FootprintSnap).fileUrl;

    if (!snapGenerateFinish && countRef.current < 10) {
      timerRef.current = setTimeout(async () => {
        countRef.current += 1;

        const { snapCode } = opt.snap;
        let newSnap: EnterpriseSnap | FootprintSnap;

        if (opt.isOrgCollection) {
          const { data } = await enterpriseGetReport(
            { snapCode, companyId: opt.companyId },
            opt.token,
          );
          newSnap = data.data;
        } else {
          const { data } = await footprintGetReport({ snapCode }, opt.token);
          newSnap = data.data;
        }

        if (newSnap) {
          setSnap(newSnap);
          loopSnap({
            ...opt,
            snap: newSnap,
          });
        }
      }, 3000);
    }
  };

  const downloadAttachment = (filePath: string) => {
    window.open(filePath);
  };

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();

    setSnap(snapFromProps);

    if (snapFromProps) {
      loopSnap({
        snap: snapFromProps,
        isOrgCollection,
        companyId,
        token: cancelTokenSource.token,
      });
    }

    return () => {
      clearInterval(timerRef.current);
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapFromProps, isOrgCollection, companyId]);

  if (!snap && !showPlaceholder) {
    return null;
  }

  const renderDisabledFootprintCards = () => (
    <div className={styles.share}>
      <Row gutter={24}>
        <Col span={8}>
          <div className={styles.shareItem}>
            <div className={styles.shareItemBlock}>
              <IconAlibaba type='icon-icon-chanpinmoxing' />
              <span>{I18N.carbonFootprint.accountingModel}</span>
            </div>
            <Button type='link' disabled>
              {I18N.supplyChain.onlinePreview}
            </Button>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.shareItem}>
            <div className={styles.shareItemBlock}>
              <IconAlibabaNew type='icon-icon-hesuanbaogao' />
              <span>{I18N.eca.accountingReport}</span>
            </div>
            <Button type='link' disabled>
              {I18N.carbonFootprint.download}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );

  if (!snap) {
    return renderDisabledFootprintCards();
  }

  return (
    <div className={styles.share}>
      {(() => {
        if (isOrgCollection) {
          const enterpriseSnap = snap as EnterpriseSnap;

          let zhReportFilePath = '';
          let enReportFilePath = '';
          let zhListFilePath = '';
          let enListFilePath = '';

          enterpriseSnap.reportFileList.forEach(file => {
            if (file.versionType === 2) {
              // 报告文件
              if (file.languageType === 1) {
                zhReportFilePath = file.filePath;
              } else {
                enReportFilePath = file.filePath;
              }
            } else if (file.versionType === 3) {
              // 清册文件
              if (file.languageType === 1) {
                zhListFilePath = file.filePath;
              } else {
                enListFilePath = file.filePath;
              }
            }
          });
          return (
            <div className={styles.share}>
              <Row gutter={24}>
                <Col span={8}>
                  <div className={styles.shareItem}>
                    <div className={styles.shareItemBlock}>
                      <IconAlibaba type='icon-icon-chanpinmoxing' />
                      <span>{I18N.carbonFootprint.accountingModel}</span>
                    </div>
                    <Button
                      type='link'
                      disabled={previewDisabled}
                      onClick={() => {
                        if (previewDisabled) return;
                        window.open(
                          `/enterpriseCarbonAccounting/share?companyId=${enterpriseSnap.companyId}&reportId=${enterpriseSnap.reportId}&orgId=${enterpriseSnap.orgId}&year=${enterpriseSnap.period}`,
                          '_blank',
                        );
                      }}
                    >
                      {I18N.supplyChain.onlinePreview}
                    </Button>
                  </div>
                </Col>
                <Col span={8}>
                  <div className={styles.shareItem}>
                    <div className={styles.shareItemBlock}>
                      <IconAlibaba type='icon-icon-faqitianbao' />
                      <span>{I18N.eca.accountingReport}</span>
                    </div>
                    <div className={styles.shareItemBlock}>
                      <Button
                        type='link'
                        loading={!downloadDisabled && !zhReportFilePath}
                        disabled={downloadDisabled}
                        onClick={() => {
                          if (downloadDisabled || !zhReportFilePath) return;
                          downloadAttachment(zhReportFilePath);
                        }}
                      >
                        {I18N.supplyChain.downloadInChinese}
                      </Button>
                      <Button
                        type='link'
                        loading={!downloadDisabled && !enReportFilePath}
                        disabled={downloadDisabled}
                        onClick={() => {
                          if (downloadDisabled || !enReportFilePath) return;
                          downloadAttachment(enReportFilePath);
                        }}
                      >
                        {I18N.supplyChain.englishDownload}
                      </Button>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className={styles.shareItem}>
                    <div className={styles.shareItemBlock}>
                      <IconAlibaba type='icon-icon-qingcewenjian' />
                      <span>{I18N.enterpriseCarbonAccount2.inventoryFile}</span>
                    </div>
                    <div className={styles.shareItemBlock}>
                      <Button
                        type='link'
                        loading={!downloadDisabled && !zhListFilePath}
                        disabled={downloadDisabled}
                        onClick={() => {
                          if (downloadDisabled || !zhListFilePath) return;
                          downloadAttachment(zhListFilePath);
                        }}
                      >
                        {I18N.supplyChain.downloadInChinese}
                      </Button>
                      <Button
                        type='link'
                        loading={!downloadDisabled && !enListFilePath}
                        disabled={downloadDisabled}
                        onClick={() => {
                          if (downloadDisabled || !enListFilePath) return;
                          downloadAttachment(enListFilePath);
                        }}
                      >
                        {I18N.supplyChain.englishDownload}
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          );
        }
        const footprintSnap = snap as FootprintSnap;
        return (
          <div className={styles.share}>
            <Row gutter={24}>
              <Col span={8}>
                <div className={styles.shareItem}>
                  <div className={styles.shareItemBlock}>
                    <IconAlibaba type='icon-icon-chanpinmoxing' />
                    <span>{I18N.carbonFootprint.accountingModel}</span>
                  </div>
                  <Button
                    type='link'
                    disabled={previewDisabled}
                    onClick={() => {
                      if (previewDisabled) return;
                      window.open(
                        `/carbonFootprint3/footprintAccount/share?accountId=${footprintSnap.account.id}&listOrGraph=0&status=1&stepValue=1&snapFlag=4`,
                        '_blank',
                        'noopener noreferrer',
                      );
                    }}
                  >
                    {I18N.supplyChain.onlinePreview}
                  </Button>
                </div>
              </Col>
              <Col span={8}>
                <div className={styles.shareItem}>
                  <div className={styles.shareItemBlock}>
                    <IconAlibabaNew type='icon-icon-hesuanbaogao' />
                    <span>{I18N.eca.accountingReport}</span>
                  </div>
                  <Button
                    type='link'
                    loading={!downloadDisabled && !footprintSnap.fileUrl}
                    disabled={downloadDisabled}
                    onClick={() => {
                      if (downloadDisabled || !footprintSnap.fileUrl) return;
                      window.open(footprintSnap.fileUrl);
                    }}
                  >
                    {I18N.carbonFootprint.download}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        );
      })()}
    </div>
  );
};

export default SnapInfo;
