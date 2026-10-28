import I18N from '@src/lang/I18N';

import { JsonObject } from './types';

export const requestErrorMessage = (error: unknown, fallback: string) => {
  const value = error as {
    message?: string;
    data?: { msg?: string };
    response?: { data?: { msg?: string } };
  };
  return (
    value?.data?.msg || value?.response?.data?.msg || value?.message || fallback
  );
};

export const stringifyJson = (value?: object) =>
  value ? JSON.stringify(value, null, 2) : '';

export const parseJson = (value?: string): JsonObject | undefined => {
  if (!value?.trim()) return undefined;
  const parsed: unknown = JSON.parse(value);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error(I18N.cbamOperationReport.enterJsonObject);
  }
  return parsed as JsonObject;
};
