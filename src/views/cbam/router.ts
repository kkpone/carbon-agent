import type { History } from 'history';

export type NavigateTarget = string | { pathname: string; search?: string };
export type NavigateFunction = (to: NavigateTarget) => void;

/** Adapts React Router v6 navigate call-sites to the target application's v5 history API. */
export const toNavigate =
  (history: History): NavigateFunction =>
  target => {
    if (typeof target === 'string') history.push(target);
    else {
      const search = target.search
        ? target.search.startsWith('?')
          ? target.search
          : `?${target.search}`
        : '';

      history.push(`${target.pathname}${search}`);
    }
  };
