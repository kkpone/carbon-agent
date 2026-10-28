import I18N from '@src/lang/I18N';
import { Collapse, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

import styles from './index.module.less';
import { ReportData } from '../../service';
import { Energy } from '../Energy';
import { ExpandIcon } from '../ExpandIcon';
import { ReportYear } from '../ReportYear';

const { Panel } = Collapse;

const CoHeader = (props: { title: string; section_id: string }) => (
  <a
    href={`#formatted_responses_section_${props.section_id}`}
    className={styles.panelTitle}
    onClick={e => e.stopPropagation()}
  >
    {props.title}
  </a>
);

type ReductionDataType = ReportData['reduction'][0];
type CommitteeDataType = ReportData['committee'][0];
type ReductionProposeDataType = ReportData['reductionPropose'][0];

const reductionColumns: ColumnsType<ReductionDataType> = [
  // {
  //   title: '序号',
  //   dataIndex: 'referenceNumber',
  // },
  {
    title: I18N.enterpriseCarbonAccount2.targetType,
    dataIndex: 'targetType',
  },
  {
    title: I18N.enterpriseCarbonAccount2.targetYear,
    dataIndex: 'YearTarget',
  },
  {
    title: I18N.enterpriseCarbonAccount2.targetIncludesScope,
    dataIndex: 'Scope',
  },
  {
    title: I18N.enterpriseCarbonAccount2.targetBenchmarkYear,
    dataIndex: 'baseYearReduction',
  },
  {
    title: I18N.enterpriseCarbonAccount2.isItScientificCarbon,
    dataIndex: 'science-based',
  },
];

const committeeColumns: ColumnsType<CommitteeDataType> = [
  {
    title: I18N.enterpriseCarbonAccount2.relatedPositionsOr,
    dataIndex: 'committee',
  },
  {
    title: I18N.enterpriseCarbonAccount2.responsibility,
    dataIndex: 'responsibility',
    render: (t: string) => {
      const textWithLineBreaks = t?.split('\n')?.map(line => (
        <>
          {line}
          <br />
        </>
      ));
      return <div>{textWithLineBreaks}</div>;
    },
  },
  {
    title: I18N.enterpriseCarbonAccount2.scopeOfResponsibilities,
    dataIndex: 'coverage',
  },
  {
    title: I18N.enterpriseCarbonAccount2.reportingSystem,
    dataIndex: 'reportingLine',
  },
  {
    title: I18N.enterpriseCarbonAccount2.frequency,
    dataIndex: 'reportFrequency',
  },
];

const ReductionProposeColumns: ColumnsType<ReductionProposeDataType> = [
  {
    title: I18N.enterpriseCarbonAccount2.actionCategories,
    dataIndex: 'initiativeCategory',
  },
  {
    title: I18N.enterpriseCarbonAccount2.actionType,
    dataIndex: 'initiativeType',
  },
  {
    title: I18N.enterpriseCarbonAccount2.reduceEmissions,
    dataIndex: 'savingsCO2e',
  },
  {
    title: I18N.enterpriseCarbonAccount2.scopeOfInvolvement,
    dataIndex: 'emissionsOccur',
    render: (t: string[]) => {
      if (typeof t === 'string') {
        t = [t];
      }
      const textWithLineBreaks = t?.map(line => (
        <>
          {line}
          <br />
        </>
      ));
      return <div>{textWithLineBreaks}</div>;
    },
  },
  {
    title: I18N.enterpriseCarbonAccount2.reduceExpenses2,
    dataIndex: 'savingsMoney',
  },
];

interface CollapseRenderProps {
  // Add any props you need here
  reportData?: ReportData;
}

export const CollapseRender: React.FC<CollapseRenderProps> = props => {
  const { reportData } = props;
  return (
    // Add your JSX code here
    <Collapse
      defaultActiveKey={['1', '2', '3', '4', '5', '6']}
      // onChange={onChange}
      expandIconPosition='end'
      ghost
      expandIcon={props => ExpandIcon(props)}
    >
      <Panel
        header={<CoHeader title={I18N.enterpriseCarbonAccount2.reportedAnnualEmissions} section_id='31738' />}
        key='1'
      >
        <ReportYear reportData={reportData} />
      </Panel>
      <Panel header={<CoHeader title={I18N.enterpriseCarbonAccount2.emissionReductionTargets} section_id='31683' />} key='2'>
        <Table
          columns={reductionColumns}
          dataSource={reportData?.reduction}
          size='small'
          pagination={false}
        />
      </Panel>
      <Panel header={<CoHeader title={I18N.enterpriseCarbonAccount2.emissionReductionActions} section_id='31690' />} key='3'>
        <Table
          columns={ReductionProposeColumns}
          dataSource={reportData?.reductionPropose}
          size='small'
          pagination={false}
        />
        <div>{I18N.enterpriseCarbonAccount2.reduceExpenses}</div>
      </Panel>
      <Panel header={<CoHeader title={I18N.enterpriseCarbonAccount2.energyConsumptionSituation} section_id='32125' />} key='4'>
        <Energy reportData={reportData} />
      </Panel>
      <Panel header={<CoHeader title={I18N.enterpriseCarbonAccount2.governanceStructure} section_id='31633' />} key='5'>
        <Table
          columns={committeeColumns}
          dataSource={reportData?.committee}
          size='small'
          pagination={false}
        />
      </Panel>
      <Panel header={<CoHeader title={I18N.enterpriseCarbonAccount2.businessStrategy} section_id='31675' />} key='6'>
        <div className={styles.strategy}>{reportData?.transitionPlan}</div>
      </Panel>
    </Collapse>
  );
};
