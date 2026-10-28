import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';

const CertificationEnterpriseIndex = () => {
  const history = useHistory();
  return (
    <>
      <div>CertificationEnterpriseIndex</div>
      <Button
        type='primary'
        onClick={() => {
          history.push('/Certification/Enterprise/apply');
          // history.push('/Certification/Product/apply')
        }}
      >
        {I18N.Certification.customSpecifications}
      </Button>
    </>
  );
};
export default CertificationEnterpriseIndex;
