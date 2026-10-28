/* eslint-disable react-hooks/exhaustive-deps */
import I18N from '@src/lang/I18N';
import { Button, Modal, Select, Table, TableColumnsType } from 'antd';
import { FC, useEffect, useState } from 'react';

import { IconAlibaba } from '@/components/iconfont';

import styles from './index.module.less';
import { ReducingPlan } from '../../type';
import { getEmissionRows, getReducingPlanYears } from '../service';
import { EmissionRow } from '../type';

type EmissionTableProps = {
  reducingPlan: ReducingPlan;
};

const EmissionTable: FC<EmissionTableProps> = ({ reducingPlan }) => {
  const [loading, setLoading] = useState(false);

  const [emissionRows, setEmissionRows] = useState<EmissionRow[]>([]);

  const [detailEmission, setDetailsEmission] = useState<EmissionRow>();

  const [yearList, setYearList] = useState<string[]>([]);

  const [year, setYear] = useState<string>();

  const columns: TableColumnsType<EmissionRow> = [
    {
      title: I18N.enterpriseCarbonAccount2.scopeName,
      dataIndex: 'name',
      width: 192,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: I18N.enterpriseCarbonAccount2.completionOfEmissionReduction,
      dataIndex: 'complete',
      width: 232,
      render: complete => {
        const completePercent = Number(complete);

        return (
          <div className={styles.process}>
            <div className={styles.processBar}>
              <div
                className={styles.bar}
                style={{
                  width: `${Number.isNaN(completePercent) ? 0 : complete}%`,
                }}
              />
            </div>
            <span className={styles.tableEmissionRatio}>{complete}%</span>
            {completePercent >= 100 ? (
              <div className={styles.completeTag}>
                {I18N.components.completed}
              </div>
            ) : (
              <div className={styles.unCompleteTag}>
                {I18N.enterpriseCarbonAccount2.hangInTheAir}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: I18N.enterpriseCarbonAccount2.targetEmissionReduction,
      dataIndex: 'predictEmissions',
      width: 148,
      align: 'right',
    },
    {
      title: I18N.enterpriseCarbonAccount2.actualEmissionReduction2,
      dataIndex: 'realityRredictEmissions',
      width: 148,
      align: 'right',
    },
    {
      title: I18N.enterpriseCarbonAccount2.targetEmissions,
      dataIndex: 'targetEmissions',
      width: 148,
      align: 'right',
    },
    {
      title: I18N.enterpriseCarbonAccount2.actualEmissions,
      dataIndex: 'emissions',
      width: 148,
      align: 'right',
    },
    {
      title: I18N.enterpriseCarbonAccount2.baseYearEmissions,
      dataIndex: 'standardEmissions',
      width: 148,
      align: 'right',
    },
  ];

  useEffect(() => {
    setYear(undefined);
    getReducingPlanYears({ id: reducingPlan.id }).then(({ data }) => {
      setYearList((data.data || []).map(item => item.year));
      setYear((data.data || []).find(item => item.choose)?.year);
    });
  }, [reducingPlan]);

  useEffect(() => {
    if (year) {
      setLoading(true);
      getEmissionRows({ id: reducingPlan.id, year })
        .then(({ data }) => {
          setEmissionRows(data.data);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setEmissionRows([]);
    }
  }, [year]);

  return (
    <div className={styles.emissionTableContent}>
      <div className={styles.emissionTableContentHeader}>
        <div className={styles.title}>
          {I18N.enterpriseCarbonAccount2.dataDetails}
        </div>
        <Select
          className={styles.yearSelect}
          options={yearList.map(yearVal => ({
            label: yearVal,
            value: yearVal,
          }))}
          value={year}
          onChange={setYear}
        />
      </div>
      <Table
        className={styles.emissionTable}
        dataSource={emissionRows}
        loading={loading}
        scroll={{ x: 1200, y: 480 }}
        pagination={false}
        columns={[
          ...columns,
          {
            title: I18N.carbonFootprint3.details,
            fixed: 'right',
            dataIndex: '__OPERATE__',
            width: 80,
            align: 'right',
            render: (_, record) => (
              <Button
                icon={<IconAlibaba type='icon-icon_chakanxiangqing' />}
                onClick={() => setDetailsEmission(record)}
              />
            ),
          },
        ]}
      />
      <Modal
        open={!!detailEmission}
        title={detailEmission?.name}
        width={1200}
        footer={null}
        onCancel={() => setDetailsEmission(undefined)}
        onClose={() => setDetailsEmission(undefined)}
      >
        <Table
          className={styles.emissionTable}
          dataSource={detailEmission?.detailInfoList}
          scroll={{ x: 1200, y: 480 }}
          pagination={false}
          columns={columns}
        />
      </Modal>
    </div>
  );
};

export default EmissionTable;
