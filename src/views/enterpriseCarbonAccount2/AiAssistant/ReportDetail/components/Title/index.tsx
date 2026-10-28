import I18N from '@src/lang/I18N';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import { RouteMaps } from '@src/router/route-paths';
import { useMount } from 'ahooks';
import { isNull } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import icon from './icon.svg';
import styles from './index.module.less';
import ScoresTag from '../../../components/RankTag';
import { ReportData, getDictList } from '../../service';

interface TitleProps {
  // text: string;
  reportData?: ReportData;
}

const Tag = (props: { text?: string | null }) =>
  !isNull(props.text) && !!props.text?.length ? (
    <div className={styles.tag}>{props.text}</div>
  ) : null;

export const Title: React.FC<TitleProps> = props => {
  const { reportData } = props;
  const history = useHistory();
  const [industry, setIndustry] = useState<string | undefined>('');
  const [dict, setDict] = useState<Dicts[]>([]);

  useMount(async () => {
    const { data } = await getDictList({ dictTypes: 'cdp_industry' });
    setDict(data.data.cdp_industry);
  });

  useEffect(() => {
    setIndustry(
      dict.find(item => item.dictValue === reportData?.industry)?.dictLabel,
    );
  }, [dict, reportData]);
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.back}
        onClick={() =>
          history.push(RouteMaps.enterpriseCarbonAccountingAiReport)
        }
      >
        <img src={icon} alt='' />
      </div>
      <div
        className={styles.title}
        onClick={() =>
          history.push(RouteMaps.enterpriseCarbonAccountingAiReport)
        }
      >
        {I18N.enterpriseCarbonAccount2.analysisResults}</div>
      <div className={styles.line} />
      <div className={styles.companyName}>{reportData?.companyName}</div>
      {reportData?.scores && <ScoresTag scores={reportData?.scores} />}
      <Tag text={industry} />
      <Tag text={reportData?.year} />
    </div>
  );
};
