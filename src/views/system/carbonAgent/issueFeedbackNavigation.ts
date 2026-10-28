export type IssueFeedbackNavigationContext = {
  sessionId: string;
  sessionTitle: string;
  sourcePath: string;
};

const FEEDBACK_SESSION_QUERY_KEY = 'feedbackSessionId';
const FEEDBACK_SESSION_TITLE_QUERY_KEY = 'feedbackSessionTitle';
const FEEDBACK_SOURCE_PATH_QUERY_KEY = 'feedbackSourcePath';

const getTrimmedSearchParam = (searchParams: URLSearchParams, key: string) =>
  searchParams.get(key)?.trim() || '';

export const clearIssueFeedbackNavigationParams = (
  searchParams: URLSearchParams,
) => {
  searchParams.delete(FEEDBACK_SESSION_QUERY_KEY);
  searchParams.delete(FEEDBACK_SESSION_TITLE_QUERY_KEY);
  searchParams.delete(FEEDBACK_SOURCE_PATH_QUERY_KEY);
};

export const getIssueFeedbackNavigationContext = (
  search: string,
): IssueFeedbackNavigationContext => {
  const searchParams = new URLSearchParams(search);

  return {
    sessionId: getTrimmedSearchParam(searchParams, FEEDBACK_SESSION_QUERY_KEY),
    sessionTitle: getTrimmedSearchParam(
      searchParams,
      FEEDBACK_SESSION_TITLE_QUERY_KEY,
    ),
    sourcePath: getTrimmedSearchParam(
      searchParams,
      FEEDBACK_SOURCE_PATH_QUERY_KEY,
    ),
  };
};

export const getIssueFeedbackPageUrl = ({
  currentHref,
  sessionId,
  sessionTitle,
}: {
  currentHref: string;
  sessionId?: string;
  sessionTitle?: string;
}) => {
  const feedbackUrl = new URL(currentHref);
  const sourcePath = `${feedbackUrl.pathname}${feedbackUrl.search}`;
  const normalizedSessionId = sessionId?.trim() || '';
  const normalizedSessionTitle = sessionTitle?.trim() || '';

  feedbackUrl.searchParams.delete('sessionId');
  clearIssueFeedbackNavigationParams(feedbackUrl.searchParams);
  feedbackUrl.searchParams.set('section', 'issueFeedback');

  if (normalizedSessionId) {
    feedbackUrl.searchParams.set(
      FEEDBACK_SESSION_QUERY_KEY,
      normalizedSessionId,
    );
  }

  if (normalizedSessionTitle) {
    feedbackUrl.searchParams.set(
      FEEDBACK_SESSION_TITLE_QUERY_KEY,
      normalizedSessionTitle,
    );
  }

  if (sourcePath) {
    feedbackUrl.searchParams.set(FEEDBACK_SOURCE_PATH_QUERY_KEY, sourcePath);
  }

  return feedbackUrl.toString();
};
