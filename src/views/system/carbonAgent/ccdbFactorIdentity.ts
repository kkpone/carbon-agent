/** Prefer the explicit string ID. A rounded JSON number is never a usable factor identity. */
export const readCcdbFactorId = (
  record: Record<string, unknown>,
): string | undefined => {
  const value = ['factorId', 'factor_id', 'id']
    .map(key => record[key])
    .find(
      candidate =>
        (typeof candidate === 'string' && /^[0-9]{1,19}$/.test(candidate)) ||
        (typeof candidate === 'number' &&
          Number.isSafeInteger(candidate) &&
          candidate >= 0),
    );
  return value === undefined ? undefined : String(value);
};
