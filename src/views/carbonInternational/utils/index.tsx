/**
 * @file 国际版 util
 */

export enum EditionType {
  'ISO' = 1,
  'GHG' = 2,
}

export const getEditionType = (): [EditionType, string] => {
  const { pathname } = window.location;
  if (pathname.includes(EditionType[1])) {
    return [EditionType.ISO, EditionType[1]];
  }
  return [EditionType.GHG, EditionType[2]];
};
