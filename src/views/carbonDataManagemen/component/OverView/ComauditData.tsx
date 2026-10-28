import I18N from '@src/lang/I18N';
import { useState, useEffect } from 'react';
import { ApianalysisAudit } from '../../service';

const ComAuditData = () => {
  const [audit, getAudit] = useState<number>(0);
  /**
   * 本月通过审核
   */
  const ApianalysisAuditFn = async () => {
    await ApianalysisAudit().then(({ data }) => {
      getAudit(data.data);
    });
  };
  useEffect(() => {
    ApianalysisAuditFn();
  }, []);
  return (
    <>
      <p className='title1'>
        {I18N.carbonDataManagemen.approvedThisMonth}<span>{I18N.carbonDataManagemen.share}</span>
      </p>
      <p className='number'>{audit}</p>
    </>
  );
};
export default ComAuditData;
