export type NumberInputDigitLimits = {
  maxDecimals?: number;
  maxIntegerDigits?: number;
};

const hasLimit = (value?: number) => value !== undefined && value !== null;
const DECIMAL_INPUT_PATTERN = /^-?\d+(?:\.\d*)?$/;

const normalizeNumberInput = (val: string | number) =>
  String(val).replace(/,/g, '');

export const isNumberInputWithinDigitLimits = (
  val: string | number | undefined | null,
  { maxDecimals, maxIntegerDigits }: NumberInputDigitLimits,
) => {
  if (val === undefined || val === null || val === '') return true;

  const str = normalizeNumberInput(val);
  if (!DECIMAL_INPUT_PATTERN.test(str)) return false;

  const unsignedValue = str.startsWith('-') ? str.slice(1) : str;
  const [integerPart, decimalPart = ''] = unsignedValue.split('.');

  return (
    (!hasLimit(maxIntegerDigits) || integerPart.length <= maxIntegerDigits) &&
    (!hasLimit(maxDecimals) || decimalPart.length <= maxDecimals)
  );
};

export const limitNumberInputDigits = (
  val: string | number | undefined | null,
  { maxDecimals, maxIntegerDigits }: NumberInputDigitLimits,
) => {
  if (val === undefined || val === null || val === '') return '';

  const str = normalizeNumberInput(val);
  const sign = str.startsWith('-') ? '-' : '';
  const unsignedValue = sign ? str.slice(1) : str;
  const pointIndex = unsignedValue.indexOf('.');
  const hasDecimalPoint = pointIndex !== -1;
  let integerPart = hasDecimalPoint
    ? unsignedValue.slice(0, pointIndex)
    : unsignedValue;
  let decimalPart = hasDecimalPoint ? unsignedValue.slice(pointIndex + 1) : '';

  if (hasLimit(maxIntegerDigits) && integerPart.length > maxIntegerDigits) {
    integerPart = integerPart.slice(0, maxIntegerDigits);
  }

  if (hasLimit(maxDecimals) && decimalPart.length > maxDecimals) {
    decimalPart = decimalPart.slice(0, maxDecimals);
  }

  return `${sign}${integerPart}${hasDecimalPoint ? `.${decimalPart}` : ''}`;
};
