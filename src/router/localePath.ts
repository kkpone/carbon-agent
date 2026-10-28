import config from '../config';

export type LocaleRouteCode = 'en' | 'zh' | 'zt';

export type LocaleRoutePrefix = '' | '/en' | '/zh' | '/zt';

type LocalePathOptions = {
  basename?: string;
  hash?: string;
  pathname?: string;
  search?: string;
};

export type LocalePathInfo = {
  localeCode: LocaleRouteCode;
  localePrefix: LocaleRoutePrefix;
  pathnameWithoutLocale: string;
};

const LOCALE_PREFIX_TO_CODE: Record<
  'en' | 'en-US' | 'zh' | 'zh-CN' | 'zh-TW' | 'zt',
  LocaleRouteCode
> = {
  en: 'en',
  'en-US': 'en',
  zh: 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zt',
  zt: 'zt',
};

function getWindowPathname() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return window.location.pathname;
}

function getWindowSearch() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.search;
}

function getWindowHash() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.hash;
}

function normalizePathname(pathname?: string) {
  if (!pathname) {
    return '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function normalizeBasename(basename?: string) {
  const normalized = normalizePathname(basename || '').replace(/\/+$/, '');

  return normalized === '/' ? '' : normalized;
}

function hasBasename(pathname: string, basename: string) {
  if (!basename) {
    return true;
  }

  const normalizedPathname = normalizePathname(pathname).toLowerCase();
  const normalizedBasename = normalizeBasename(basename).toLowerCase();

  return (
    normalizedPathname === normalizedBasename ||
    normalizedPathname.startsWith(`${normalizedBasename}/`)
  );
}

function stripBasename(pathname: string, basename?: string) {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedBasename = normalizeBasename(basename);

  if (!hasBasename(normalizedPathname, normalizedBasename)) {
    return normalizedPathname;
  }

  return normalizedPathname.slice(normalizedBasename.length) || '/';
}

function joinUrlPath(...paths: string[]) {
  const joined = paths
    .filter(Boolean)
    .map(path => path.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');

  return joined ? `/${joined}` : '/';
}

function joinBasename(...paths: string[]) {
  const path = joinUrlPath(...paths);

  return path === '/' ? '' : path;
}

function normalizeSearch(search?: string) {
  if (!search) {
    return '';
  }

  return search.startsWith('?') ? search : `?${search}`;
}

function normalizeHash(hash?: string) {
  if (!hash) {
    return '';
  }

  return hash.startsWith('#') ? hash : `#${hash}`;
}

export function getLocalePathInfo(
  pathname = getWindowPathname(),
  basename = config.BASENAME,
): LocalePathInfo {
  const pathnameAfterBasename = stripBasename(pathname, basename);
  const pathSegments = pathnameAfterBasename.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  const localeCode =
    LOCALE_PREFIX_TO_CODE[
      firstSegment as 'en' | 'en-US' | 'zh' | 'zh-CN' | 'zh-TW' | 'zt'
    ];
  const hasLocalePrefix = !!localeCode;
  const pathnameWithoutLocale = hasLocalePrefix
    ? joinUrlPath(...pathSegments.slice(1))
    : pathnameAfterBasename;

  return {
    localeCode: localeCode || 'zh',
    localePrefix: hasLocalePrefix
      ? (`/${firstSegment}` as LocaleRoutePrefix)
      : '',
    pathnameWithoutLocale:
      normalizePathname(pathnameWithoutLocale).replace(/\/+$/, '') || '/',
  };
}

export function getLocaleCodeFromPathname(
  pathname = getWindowPathname(),
  basename = config.BASENAME,
) {
  return getLocalePathInfo(pathname, basename).localeCode;
}

export function getLocaleRouterBasename(
  pathname = getWindowPathname(),
  basename = config.BASENAME,
) {
  const { localePrefix } = getLocalePathInfo(pathname, basename);

  return joinBasename(normalizeBasename(basename), localePrefix);
}

export function stripLocalePrefixFromPathname(
  pathname = getWindowPathname(),
  basename = config.BASENAME,
) {
  return getLocalePathInfo(pathname, basename).pathnameWithoutLocale;
}

export function buildLocaleSwitchPath(
  targetLocaleCode: LocaleRouteCode,
  options: LocalePathOptions = {},
) {
  const {
    basename = config.BASENAME,
    hash = getWindowHash(),
    pathname = getWindowPathname(),
    search = getWindowSearch(),
  } = options;
  const { localePrefix, pathnameWithoutLocale } = getLocalePathInfo(
    pathname,
    basename,
  );
  let targetPrefix: LocaleRoutePrefix = localePrefix;

  if (targetLocaleCode === 'en') {
    targetPrefix = '/en';
  } else if (targetLocaleCode === 'zt') {
    targetPrefix = '/zt';
  } else if (localePrefix === '') {
    targetPrefix = '';
  } else {
    targetPrefix = '/zh';
  }

  const nextPathname = joinUrlPath(
    normalizeBasename(basename),
    targetPrefix,
    pathnameWithoutLocale,
  );

  return `${nextPathname}${normalizeSearch(search)}${normalizeHash(hash)}`;
}

/**
 * Build a browser URL for window.location, window.open or native links.
 * Router history and Link targets must omit this prefix: Router adds its basename.
 */
export function withCurrentLocalePrefix(
  pathname: string,
  options: Pick<LocalePathOptions, 'basename' | 'pathname'> = {},
) {
  const {
    basename = config.BASENAME,
    pathname: currentPathname = getWindowPathname(),
  } = options;
  const { localePrefix } = getLocalePathInfo(currentPathname, basename);

  return joinUrlPath(normalizeBasename(basename), localePrefix, pathname);
}
