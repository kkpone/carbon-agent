import I18N from '@src/lang/I18N';
import React, { useEffect, useState } from 'react';

import OperateDataTable from './DataTable';
import Indicator from './Indicator';
import styles from './index.module.less';
import { getOperateIndicatorList } from './service';
import { OperateIndicator } from './type';

const Pom: React.FC = () => {
  const [indicatorList, setIndicatorList] = useState<OperateIndicator[]>([]);

  // const [selectedIndicator, setSelectedIndicator] =
  //   useState<OperateIndicator | null>(null);

  const [indicatorId, setIndicatorId] = useState<number>();

  const queryIndicatorList = async (opt?: { useFirst?: boolean }) => {
    const { data } = await getOperateIndicatorList();
    setIndicatorList(data.data);

    if (opt?.useFirst && data.data[0]) {
      setIndicatorId(data.data[0]?.id);
    }
  };

  const selectedIndicator = indicatorList.find(({ id }) => id === indicatorId);

  useEffect(() => {
    queryIndicatorList({ useFirst: true });
  }, []);

  return (
    <div className={styles.pomContent}>
      <div className={styles.title}>
        {I18N.enterpriseCarbonAccount2.operationalData}
      </div>
      <Indicator
        indicatorList={indicatorList}
        selectedIndicator={selectedIndicator}
        onClick={({ id }) => setIndicatorId(id)}
        queryIndicatorList={queryIndicatorList}
      />
      <OperateDataTable
        indicator={selectedIndicator}
        queryIndicatorList={queryIndicatorList}
      />
    </div>
  );
};

export default Pom;
