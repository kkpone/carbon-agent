import I18N from '@src/lang/I18N';
import nodata from '@views/carbonDataManagemen/img/nodata.png';
import './style.less';

export default function Nodata() {
  return (
    <div className='carbonData_nodata'>
      <img src={nodata} alt='' />
      <p>{I18N.carbonFootprint3.thereIsCurrentlyNoContentAvailable}</p>
    </div>
  );
}
