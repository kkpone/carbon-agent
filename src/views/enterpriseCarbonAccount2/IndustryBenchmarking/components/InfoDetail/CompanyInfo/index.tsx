import I18N from '@src/lang/I18N';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FC } from 'react';

import styles from './index.module.less';
import { BenchMarkDetailComparison } from '../../../service';

interface ICompanyInfoProps {
  companyInfo?: BenchMarkDetailComparison;
}

// 1. SBT类型：取action
// 2. 状态：取statue
// 3. 目标类型：取type
// 4. 涉及范围：取scope
// 5. 目标雄心：取Target Classification
// 6. 减排比例：取Target Value
// 7. 基准年：取Base Year
// 8. 目标年：取Target Year
// 9. 目标周期：取Target
// 10. 发布时间：取Date Published
// 11. 目标描述：取Target Wording

const columns: ColumnsType<BenchMarkDetailComparison['reduction'][0]> = [
  {
    title: I18N.enterpriseCarbonAccount2.sbtType,
    dataIndex: 'action',
    fixed: 'left',
    width: 220,
  },
  {
    title: I18N.carbonFootprint.state,
    dataIndex: 'sbtiStatus',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.targetType,
    dataIndex: 'targetType',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.scopeOfInvolvement,
    dataIndex: 'scope',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.ambitiousGoals,
    dataIndex: 'targetAmbition',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.emissionReductionRatio,
    dataIndex: 'baseYearReduction',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.baseYear,
    dataIndex: 'baseYear',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.targetYear2,
    dataIndex: 'yearTarget',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.targetCycle,
    dataIndex: 'target',
    width: 180,
  },
  {
    title: I18N.system.releaseTime2,
    dataIndex: 'datePublished',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.objectiveDescription2,
    dataIndex: 'targetWording',
    width: 380,
    render: text => (
      <div className={styles.ex}>
        <Tooltip title={text} placement='topLeft'>
          {text}
        </Tooltip>
      </div>
    ),
  },
];

const notSBTIColumns: ColumnsType<BenchMarkDetailComparison['reduction'][0]> = [
  {
    title: I18N.enterpriseCarbonAccount2.targetType,
    dataIndex: 'targetType',
    width: 180,
    // fixed: 'left',
  },
  {
    title: I18N.enterpriseCarbonAccount2.scopeOfInvolvement,
    dataIndex: 'Scope',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.ambitiousGoals,
    dataIndex: 'targetAmbition',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.emissionReductionRatio,
    dataIndex: 'baseYearReduction',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.baseYear,
    dataIndex: 'baseYear',
    width: 180,
  },
  {
    title: I18N.enterpriseCarbonAccount2.targetYear2,
    dataIndex: 'YearTarget',
    width: 180,
  },
];

// 1. 行动类别
// 2. 行动类型
// 3. 预计年减排量
// 4. 涉及范围
// 5. 年度节省成本
// 6. 所需投入
// 7. 投资回报周期
// 8. 预计时效
// 9. 备注

const reductionContentColumns = [
  {
    title: I18N.enterpriseCarbonAccount2.actionCategories,
    width: 220,
    fixed: 'left',
    dataIndex: 'initiativeCategory',
  },
  {
    title: I18N.enterpriseCarbonAccount2.actionType,
    width: 300,
    dataIndex: 'initiativeType',
  },
  {
    title: I18N.enterpriseCarbonAccount2.expectedAnnualEmissionReduction,
    width: 180,
    dataIndex: 'savingsCO2e',
  },
  {
    title: I18N.enterpriseCarbonAccount2.scopeOfInvolvement,
    width: 320,
    dataIndex: 'emissionsOccur',
  },
  {
    title: I18N.enterpriseCarbonAccount2.annualSavings,
    width: 220,
    dataIndex: 'savingsMoney',
  },
  {
    title: I18N.enterpriseCarbonAccount2.requiredInputs,
    width: 180,
    dataIndex: 'investmentRequired',
  },
  {
    title: I18N.enterpriseCarbonAccount2.investmentReturnWeek,
    width: 220,
    dataIndex: 'paybackPeriod',
  },
  {
    title: I18N.enterpriseCarbonAccount2.estimatedTimeFrame,
    width: 260,
    dataIndex: 'initiativeLifetime',
  },
  {
    title: I18N.carbonFootprint.remarks,
    dataIndex: 'comment',
    width: 380,
    render: text => (
      <div className={styles.ex}>
        <Tooltip title={text} placement='topLeft'>
          {text}
        </Tooltip>
      </div>
    ),
  },
];

export const CompanyInfo: FC<ICompanyInfoProps> = props => {
  const { companyInfo } = props;
  if (!companyInfo) return null;
  const isSBTI = companyInfo?.reductionSource === '2';
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{companyInfo?.benchMarkName}</div>
      {isSBTI && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <div className={styles.name}>
              {I18N.enterpriseCarbonAccount2.carbonReductionTargets}
            </div>
            <div className={styles.tag}>SBT</div>
            <div className={styles.info}>
              <div className={styles.label}>
                {I18N.enterpriseCarbonAccount2.shortTermGoals}
              </div>
              <div className={styles.value}>{companyInfo?.shortTarget}</div>
            </div>
            <div className={styles.info}>
              <div className={styles.label}>
                {I18N.enterpriseCarbonAccount2.alignTargets}
              </div>
              <div className={styles.value}>{companyInfo?.alignTarget}</div>
            </div>
            <div className={styles.info}>
              <div className={styles.label}>
                {I18N.enterpriseCarbonAccount2.netZeroCarbonTarget}
              </div>
              <div className={styles.value}>{companyInfo?.zeroTarget}</div>
            </div>
            <div className={styles.info}>
              <div className={styles.label}>
                {I18N.enterpriseCarbonAccount2.objectiveDescription}
              </div>
              <div className={styles.value}>
                <Tooltip placement='topLeft' title={companyInfo?.targetWording}>
                  {companyInfo?.targetWording}
                </Tooltip>
              </div>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={companyInfo?.reduction}
            // bordered
            pagination={false}
            scroll={{
              x: 1200,
            }}
          />
        </div>
      )}
      {!isSBTI && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <div className={styles.name}>
              {I18N.enterpriseCarbonAccount2.carbonReductionTargets}
            </div>
          </div>
          <Table
            style={{ width: '100%' }}
            columns={notSBTIColumns}
            dataSource={companyInfo?.reduction}
            // bordered
            pagination={false}
            scroll={{
              x: 1200,
            }}
          />
        </div>
      )}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <div className={styles.name}>
            {I18N.enterpriseCarbonAccount2.emissionReductionProjects}
          </div>
          <div className={styles.info}>
            <div className={styles.label}>
              {I18N.enterpriseCarbonAccount2.numberOfExecutedProjects}
            </div>
            <div className={styles.value}>
              {companyInfo?.reductionPropose?.length}
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.label}>
              {I18N.enterpriseCarbonAccount2.estimatedAnnualTotal}
            </div>
            <div className={styles.value}>
              {companyInfo?.reductionPropose?.reduce(
                (pre, item) => pre + Number(item.savingsCO2e),
                0,
              )}{' '}
              tCO₂e
            </div>
          </div>
        </div>
        <Table
          columns={reductionContentColumns}
          dataSource={companyInfo?.reductionPropose}
          // bordered
          pagination={false}
          scroll={{
            x: 1200,
          }}
        />
      </div>
    </div>
  );
};
