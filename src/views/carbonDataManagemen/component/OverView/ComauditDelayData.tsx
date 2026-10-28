import I18N from '@src/lang/I18N';
import { useState, useEffect } from 'react';
import { ApianalysisDelay } from '../../service';

export default function ComAuditDeayData() {
  const [audit, getAudit] = useState<number>(0);
  /**
   * 本月通过审核
   */
  const ApianalysisAuditFn = async () => {
    await ApianalysisDelay().then(({ data }) => {
      getAudit(data.data);
    });
  };
  useEffect(() => {
    ApianalysisAuditFn();
  }, []);
  return (
    <>
      <p className='title1'>
        {I18N.carbonDataManagemen.toBeReviewedThisMonth}<span>{I18N.carbonDataManagemen.share}</span>
      </p>
      <p className='number'>{audit}</p>
    </>
  );
}
