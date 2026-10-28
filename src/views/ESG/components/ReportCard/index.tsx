import I18N from '@src/lang/I18N';
import { FC } from 'react';
import styles from './index.module.less';
import { App, Dropdown, MenuProps } from 'antd';
import { delReport, ReportData } from '../../AiGenerateHome/service';
import { useHistory } from 'react-router-dom';
import { RouteMaps } from '@/router/route-paths';
import bgPng from './bg.png';
import classNames from 'classnames';
import { checkPermissions } from '@/components/Permission/utils';

function formatDateString(isoString: string) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');

  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hour}:${minute}`;
}

export interface IReportCardProps {
  report: ReportData;
  run: () => void;
}

export const ReportCard: FC<IReportCardProps> = props => {
  // console.log(report);
  const { report, run } = props;
  const { modal } = App.useApp();

  const history = useHistory();

  const items: (id: number, reportName: string) => MenuProps['items'] = (
    id: number,
    reportName: string,
  ) => [
    {
      key: '2',
      label: I18N.carbonFootprint.delete,
      onClick: async e => {
        e.domEvent.stopPropagation();
        modal.confirm({
          title: I18N.carbonFootprint.delete,
          content: I18N.template(I18N.esg.confirmToDeleteR, {
            val1: reportName,
          }),
          onOk: async () => {
            await delReport({
              id,
            });
            run();
          },
        });
      },
    },
  ];

  const jumpTo = (id: number, status: 0 | 1) => {
    if (status === 0) {
      history.push(`${RouteMaps.ESGAiGenerateOutline}?id=${id}`);
    } else if (status === 1) {
      history.push(`${RouteMaps.ESGAiGenerateDetail}?id=${id}`);
    }
  };
  return (
    <div
      className={styles.card}
      onClick={() => jumpTo(report.id, report.state)}
    >
      <div className={styles.operation}>
        <div
          className={classNames(styles.status, {
            [styles.report]: report.state === 1,
          })}
        >
          {report.state === 0 ? I18N.esg.outline : I18N.carbonNeutral.report}
        </div>
        {checkPermissions(
          <Dropdown menu={{ items: items(report.id, report.reportName) }}>
            {/* eslint-disable-next-line */}
            <a
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              ...
            </a>
          </Dropdown>,
          'esg:frameReport:delete',
        )}
      </div>
      <div className={styles.infoWrapper}>
        <div className={styles.year}>{report.period}</div>
        <div className={styles.reportName}>{report.reportName}</div>
        <div className={styles.picture}>
          <img src={report.lgUrl || bgPng} alt='' />
        </div>
        <div className={styles.updateInfo}>
          <div className={styles.updateBy}>{report.updateBy}</div>
          <div className={styles.updateTime}>
            {formatDateString(report.updateTime)}
          </div>
        </div>
      </div>
    </div>
  );
};
