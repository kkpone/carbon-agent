import I18N from '@src/lang/I18N';
import { ColumnsType } from 'antd/lib/table';
import { compact } from 'lodash-es';

import { DATA_TYPE } from '@/views/carbonFootPrintLCA/components/ProcessDescribeDrawer/constant';

import { generateDataSource, STANDARDS_TYPE } from '../constant';

const { REALISTIC_DATA, BACKGROUND_DATA } = DATA_TYPE;

const timeRepresentColumnWidth = {
  [REALISTIC_DATA]: '15%',
  [BACKGROUND_DATA]: '22%',
};
export const columns = (processDataType?: number): ColumnsType<any> =>
  compact([
    {
      title: I18N.carbonFootPrintLCA.qualityLevel,
      dataIndex: 'qualityLevel',
      width: '10%',
    },
    {
      title: I18N.carbonFootprint.qualityLevel,
      dataIndex: 'qualityGrade',
      width: '10%',
    },
    {
      title: I18N.carbonFootPrintLCA.timeRepresentativeness3,
      dataIndex: 'timeRepresent',
      width: processDataType
        ? timeRepresentColumnWidth[processDataType]
        : '30%',
      render: value => {
        const timeRepresentArr = value?.split('/n');
        if (timeRepresentArr.length > 1) {
          return (
            <div>
              <p>{timeRepresentArr?.[0]}</p>
              <p>{timeRepresentArr?.[1]}</p>
            </div>
          );
        }
        return value;
      },
    },
    {
      title: I18N.carbonFootPrintLCA.geographicalRepresentativeness2,
      dataIndex: 'areaRepresent',
    },
    {
      title: I18N.carbonFootPrintLCA.technicalRepresentativeness2,
      dataIndex: 'techRepresent',
    },
    processDataType === REALISTIC_DATA && {
      title: I18N.carbonFootPrintLCA.dataAccuracy,
      dataIndex: 'dataAccuracy',
    },
  ]);

export const getQualityEvaluationStandardsData = (stardardType: number) => {
  if (stardardType === STANDARDS_TYPE.EU_BATTERY_LAW) {
    return [
      {
        key: 1,
        title: '',
        columns: columns(),
        dataSource: generateDataSource(),
      },
    ];
  }
  return [
    {
      key: 1,
      title: I18N.carbonFootPrintLCA.realisticData,
      columns: columns(REALISTIC_DATA),
      dataSource: generateDataSource(REALISTIC_DATA),
    },
    {
      key: 2,
      title: I18N.carbonFootPrintLCA.backgroundData,
      columns: columns(BACKGROUND_DATA),
      dataSource: generateDataSource(BACKGROUND_DATA),
    },
  ];
};
