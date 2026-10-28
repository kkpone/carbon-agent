/**
 * @file 国际 编辑碳排放报告 第二步
 */
import I18N from '@src/lang/I18N';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { CardTabsBase } from '@src/components/Tabs/CardTabsBase';
import TableOne from '../tables/TableOne';
import TableTwo from '../tables/TableTwo';
import TableSix from '../tables/TableSix';
import TableSeven from '../tables/TableSeven';
import TableEight from '../tables/TableEight';
import TableFive from '../tables/TableFive';
import TableThree from '../tables/TableThree';
import TableFour from '../tables/TableFour';

export const ReportStepsTwo = () => {
  const history = useHistory();
  // 选中的tab
  const [checkedTab, setCheckedTab] = useState(0);

  const TabPaneData = [
    {
      tab: I18N.carbonInternational.dataSummaryTable,
      content: <TableOne checkedTab={checkedTab} history={history} />,
      key: 0,
    },
    {
      tab: I18N.enterpriseCarbonAccount2.organizationalOperationsSide,
      content: <TableEight />,
      key: 1,
    },
    {
      tab: I18N.enterpriseCarbonAccount2.emissionSourceIdentification,
      content: <TableTwo />,
      key: 2,
    },
    {
      tab: I18N.enterpriseCarbonAccount2.activityDataCollection,
      content: <TableThree />,
      key: 3,
    },
    {
      tab: I18N.enterpriseCarbonAccount2.emissionFactorSelection,
      content: <TableFour />,
      key: 4,
    },
    {
      tab: I18N.enterpriseCarbonAccount2.emissionCalculation,
      content: <TableFive />,
      key: 5,
    },
    {
      tab: I18N.enterpriseCarbonAccount2.greenhouseGasEmissions2,
      content: <TableSix />,
      key: 6,
    },
    {
      tab: I18N.carbonInternational.dataClassificationEvaluation,
      content: <TableSeven />,
      key: 7,
    },
  ];

  return (
    <div className='report_steps_two'>
      <CardTabsBase
        tabPane={TabPaneData?.map(t => ({
          tab: t.tab,
          key: `${t.key}`,
        }))}
        onChange={key => {
          setCheckedTab(+key);
        }}
      />
      {TabPaneData?.find(t => t.key === checkedTab)?.content}
    </div>
  );
};
