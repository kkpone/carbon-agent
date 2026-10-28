import { useHistory, useLocation } from 'react-router-dom';

import { ComparePage } from './ComparePage';
import { DetailPage } from './DetailPage';
import { FollowPage } from './FollowPage';
import { enterpriseSearch } from './data';
import { useEnterpriseData } from './state';
import style from './index.module.less';

const EnterpriseDataPage = () => {
  const history = useHistory();
  const location = useLocation();
  const state = useEnterpriseData();
  const search = new URLSearchParams(location.search);
  const section = search.get('section');
  const companyId = search.get('companyId') || '';
  const resultId = search.get('resultId') || '';
  const navigate = (nextSection: string, params = {}, replace = false) => {
    const target = {
      pathname: location.pathname,
      search: enterpriseSearch(location.search, nextSection, params),
    };
    if (replace) history.replace(target);
    else history.push(target);
  };
  if (!state.enabled) return null;
  return (
    <div className={`${style.page} ${style.followShell}`} key={state.scope}>
      {section === 'enterpriseDetail' ? (
        <DetailPage
          key={companyId}
          companyId={companyId}
          onBack={() => navigate('enterpriseFollows')}
        />
      ) : section === 'enterpriseCompare' ? (
        <ComparePage
          resultId={resultId}
          onBack={() => navigate('enterpriseFollows')}
          onSelect={() => navigate('enterpriseCompare')}
          onResult={id => navigate('enterpriseCompare', { resultId: id }, true)}
        />
      ) : (
        <FollowPage onCompare={() => navigate('enterpriseCompare')} />
      )}
    </div>
  );
};

export default EnterpriseDataPage;
