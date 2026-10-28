import { ProColumns } from '@ant-design/pro-components';
import I18N from '@src/lang/I18N';
import { compact, isNil } from 'lodash-es';

import { AssessmentDataQualityResp } from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/type';
import { DATA_TYPE } from '@/views/carbonFootPrintLCAnew/components/ProcessDescribeDrawer/constant';

import { DATA_QUALITY_CLASS, RATE_TYPE, STANDARDS_TYPE } from './constant';
import style from './index.module.less';

const { TIME, TECH, AREA, DATA } = RATE_TYPE;
const { TOTAL } = DATA_QUALITY_CLASS;

const isTotalClass = (dataQualityClass: number) => dataQualityClass === TOTAL;

export const columns = ({
  isDetail,
  stardardType,
  onRate,
}: {
  isDetail: boolean;
  stardardType: number;
  onRate: (type?: number, data?: AssessmentDataQualityResp) => void;
}): ProColumns<AssessmentDataQualityResp>[] =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.process,
      dataIndex: 'sourceName',
      width: 220,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.dataQualityAssessment2,
      dataIndex: 'dqr',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.averageRevenuePerUser,
      dataIndex: 'contribution',
      ellipsis: true,
      render: (_, record) => {
        const { contribution } = record || {};
        return !isNil(contribution) ? `${contribution}%` : '-';
      },
    },
    {
      title: I18N.carbonFootPrintLCA.dataType,
      dataIndex: 'processDataType_name',
      ellipsis: true,
    },
    {
      title: I18N.carbonFootPrintLCA.timeRepresentativeness3,
      dataIndex: 'tir',
      align: 'center',
      ellipsis: true,
      render: (_, record) => {
        const { dataQualityClass, tir } = record;
        return !isTotalClass(dataQualityClass) && !isDetail ? (
          <div className={style.card} onClick={() => onRate(TIME, record)}>
            {tir || I18N.carbonFootPrintLCA.rating}
          </div>
        ) : (
          tir
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.geographicalRepresentativeness2,
      dataIndex: 'ger',
      align: 'center',
      ellipsis: true,
      render: (_, record) => {
        const { ger, dataQualityClass } = record;
        return !isTotalClass(dataQualityClass) && !isDetail ? (
          <div className={style.card} onClick={() => onRate(AREA, record)}>
            {ger || I18N.carbonFootPrintLCA.rating}
          </div>
        ) : (
          ger
        );
      },
    },
    {
      title: I18N.carbonFootPrintLCA.technicalRepresentativeness2,
      dataIndex: 'ter',
      align: 'center',
      ellipsis: true,
      render: (_, record) => {
        const { ter, dataQualityClass } = record;
        return !isTotalClass(dataQualityClass) && !isDetail ? (
          <div className={style.card} onClick={() => onRate(TECH, record)}>
            {ter || I18N.carbonFootPrintLCA.rating}
          </div>
        ) : (
          ter
        );
      },
    },
    stardardType === STANDARDS_TYPE.EU_PEF && {
      title: I18N.carbonFootPrintLCA.dataAccuracy,
      dataIndex: 'pre',
      align: 'center',
      ellipsis: true,
      render: (_, record) => {
        const { pre, dataQualityClass, processDataType } = record || {};
        /** 数据类型为背景数据展示“-” */
        if (processDataType === DATA_TYPE.BACKGROUND_DATA) {
          return '-';
        }
        return !isTotalClass(dataQualityClass) && !isDetail ? (
          <div className={style.card} onClick={() => onRate(DATA, record)}>
            {pre || I18N.carbonFootPrintLCA.rating}
          </div>
        ) : (
          pre
        );
      },
    },
  ]);
