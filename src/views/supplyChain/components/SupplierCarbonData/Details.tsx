import I18N from '@src/lang/I18N';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import { createForm } from '@formily/core';
import { downloadFile } from '@src/components/DownLoadFile';
import { Radio } from 'antd';
import { FC, useMemo, useState } from 'react';
import { ValueOf } from 'type-fest';

import styles from './index.module.less';
import {
  CARBON_DATA_DATA_TYPE,
  CARBON_DATA_DATA_TYPE_LABEL,
  CARBON_DATA_REQ_TYPE_LABEL,
} from '../../constant';
import { CarbonData } from '../../type';
import ProcessCarbonData from '../ProcessCarbonData';
import ResultCarbonData from '../ResultCarbonData';

type DetailsProps = {
  carbonData: CarbonData;
};

const { PROCESS, RESULT } = CARBON_DATA_DATA_TYPE;

const Details: FC<DetailsProps> = ({ carbonData }) => {
  const [currDataType, setCurrDataType] =
    useState<ValueOf<typeof CARBON_DATA_DATA_TYPE>>(RESULT);

  const form = useMemo(() => createForm({ readPretty: true }), []);

  const { reqType, dataType } = carbonData;

  const reqTypeLabel = CARBON_DATA_REQ_TYPE_LABEL[reqType];

  const dataTypeRadioOptions =
    dataType === CARBON_DATA_DATA_TYPE.RESULT
      ? [
          {
            value: RESULT,
            label: `${reqTypeLabel}${CARBON_DATA_DATA_TYPE_LABEL[RESULT]}`,
          },
        ]
      : [
          {
            value: RESULT,
            label: `${reqTypeLabel}${CARBON_DATA_DATA_TYPE_LABEL[RESULT]}`,
          },
          {
            value: PROCESS,
            label: `${reqTypeLabel}${CARBON_DATA_DATA_TYPE_LABEL[PROCESS]}`,
          },
        ];

  const downloadReport = (reportFile: string) => {
    downloadFile(reportFile, reportFile);
  };

  return (
    <div>
      <Radio.Group
        value={currDataType}
        onChange={e => setCurrDataType(e.target.value)}
        optionType='button'
        options={dataTypeRadioOptions}
      />
      <div
        className={styles.secondaryTitle}
      >{`${reqTypeLabel}${CARBON_DATA_DATA_TYPE_LABEL[currDataType]}`}</div>
      {currDataType === RESULT && (
        <ResultCarbonData form={form} carbonData={carbonData} />
      )}
      {currDataType === PROCESS && (
        <ProcessCarbonData carbonData={carbonData} readOnly />
      )}
      <div className={styles.caption}>
        {I18N.template(I18N.supplyChain.carbo2, {
          val1: CARBON_DATA_REQ_TYPE_LABEL[carbonData.reqType],
        })}
      </div>
      {carbonData.report.length === 0 ? (
        <div className={styles.noReport}>
          {I18N.supplyChain2.unsubmittedReport}
        </div>
      ) : (
        carbonData.report.map(reportFile => (
          <div className={styles.reportFileItem} key={reportFile}>
            <div className={styles.reportFileName} title={reportFile}>
              {reportFile}
            </div>
            <div>
              <VerticalAlignBottomOutlined
                className={styles.reportBtn}
                onClick={() => downloadReport(reportFile)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Details;
