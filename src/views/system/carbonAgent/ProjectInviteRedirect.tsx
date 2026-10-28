import { Redirect, useLocation, useParams } from 'react-router-dom';

import {
  CARBON_AGENT_PROJECT_INVITE_QUERY_KEY,
  RouteMaps,
} from '@/router/route-paths';

const ProjectInviteRedirect = () => {
  const { inviteCode = '' } = useParams<{ inviteCode?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const normalizedInviteCode = inviteCode.trim();

  if (normalizedInviteCode) {
    searchParams.set(
      CARBON_AGENT_PROJECT_INVITE_QUERY_KEY,
      normalizedInviteCode,
    );
  } else {
    searchParams.delete(CARBON_AGENT_PROJECT_INVITE_QUERY_KEY);
  }

  const nextSearch = searchParams.toString();

  return (
    <Redirect
      to={{
        hash: location.hash,
        pathname: RouteMaps.carbonAgent,
        search: nextSearch ? `?${nextSearch}` : '',
      }}
    />
  );
};

export default ProjectInviteRedirect;
