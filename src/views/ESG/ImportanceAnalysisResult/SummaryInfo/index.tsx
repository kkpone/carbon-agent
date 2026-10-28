import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Input, Button, QRCode } from 'antd';
import EChartsReact from 'echarts-for-react';
import { FC, useRef, useState } from 'react';

import { RouteMaps } from '@/router/route-paths';
import { copyToClipboard, downloadFile, Toast } from '@/utils';

import styles from './index.module.less';
import { getSummaryInfo } from './service';

const COLORS = ['#0CBF9F', '#048677', '#026961', '#004541', '#04252B'];

const SummaryInfo: FC<{ id: string }> = ({ id }) => {
  const QRCodeContentRef = useRef<HTMLDivElement>(null);

  const [summaryInfo, setSummaryInfo] = useState<Record<string, any>>();

  const qrCodeUrl = `${
    location.origin
  }${RouteMaps.ESGImportanceAnalysisFill.replace(':id', `${id}`)}`;

  useMount(() => {
    getSummaryInfo({ id }).then(({ data }) => {
      setSummaryInfo(data.data);
    });
  });

  return (
    <div>
      <div className={styles.title}>
        {I18N.esg.questionnaireCollectionSituation}
      </div>
      <div className={styles.summaryContent}>
        <div className={styles.chartContent}>
          <div className={styles.totalCountContent}>
            <div>
              <span className={styles.totalCountLabel}>
                {I18N.esg.totalSubmittedQuestions}
              </span>
              <span className={styles.totalCountUnit}>
                {I18N.work.individual}
              </span>
            </div>
            <div className={styles.totalCount}>{summaryInfo?.total}</div>
          </div>
          <EChartsReact
            style={{ height: '100%', flex: 1 }}
            option={{
              tooltip: {
                trigger: 'item',
                appendToBody: true,
              },
              legend: {
                orient: 'vertical',
                top: 40,
                left: 220,
                type: 'scroll',
                inactiveBorderColor: '#fff',
                textStyle: {
                  overflow: 'breakAll',
                },
                formatter: (name: string) =>
                  `${name}：${
                    summaryInfo?.roleList?.find(item => item.name === name)
                      ?.count
                  }`,
              },
              series: [
                {
                  type: 'pie',
                  tooltip: {},
                  center: ['28%', '50%'],
                  radius: ['58%', '73%'],
                  itemStyle: {
                    borderRadius: 4,
                    borderColor: '#fff',
                    borderWidth: 2,
                  },
                  data: (summaryInfo?.roleList || []).map((item, index) => ({
                    name: item.name,
                    value: item.count,
                    itemStyle: {
                      color: COLORS[index - Math.floor(index / 5) * 5],
                    },
                  })),
                  label: {
                    show: true,
                    position: 'center',
                    formatter: I18N.esg.roleDistribution,
                  },
                },
              ],
            }}
          />
        </div>
        <div className={styles.qrCodeContent}>
          <div className={styles.qrCodeHeader}>
            <div className={styles.qrCodeTitle}>
              {I18N.esg.questionnaireUrl}
            </div>
            <div className={styles.qrCodeUrl}>
              <Input value={qrCodeUrl} readOnly />
              <Button
                type='primary'
                onClick={() =>
                  copyToClipboard(qrCodeUrl).then(() =>
                    Toast('success', I18N.carbonFootprint3.copySuccessful),
                  )
                }
              >
                {I18N.carbonFootprint.copy}
              </Button>
            </div>
          </div>
          <div className={styles.qrCode} ref={QRCodeContentRef}>
            <QRCode
              size={104}
              color='#000'
              bgColor='#fff'
              value={qrCodeUrl}
              bordered={false}
            />
            <div
              className={styles.downloadQrCodeBtn}
              onClick={() => {
                const canvas =
                  QRCodeContentRef.current?.querySelector<HTMLCanvasElement>(
                    'canvas',
                  );
                if (canvas) {
                  downloadFile(canvas.toDataURL(), 'qrcode.png');
                }
              }}
            >
              <VerticalAlignBottomOutlined />
              <div className={styles.downloadQrCodeText}>
                {I18N.carbonFootprint3.downloadQrCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryInfo;
