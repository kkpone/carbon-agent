import { formatScientific } from '@src/utils';

const SCIENTIFIC_REG = /^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/;

const trimPlainNumber = (value: string) => {
  const trimmed = value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return trimmed || '0';
};

const scientificToPlain = (value: string) => {
  const match = value.match(SCIENTIFIC_REG);

  if (!match) {
    return value;
  }

  const [, sign, integerPart, decimalPart = '', exponentText] = match;
  const exponent = Number(exponentText);
  const digits = `${integerPart}${decimalPart}`;
  const decimalIndex = integerPart.length + exponent;

  let plain = '';
  if (decimalIndex <= 0) {
    plain = `0.${'0'.repeat(Math.abs(decimalIndex))}${digits}`;
  } else if (decimalIndex >= digits.length) {
    plain = `${digits}${'0'.repeat(decimalIndex - digits.length)}`;
  } else {
    plain = `${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
  }

  return `${sign === '-' ? '-' : ''}${trimPlainNumber(plain)}`;
};

export const formatPlainNumber = (
  value?: number | string | null,
  needHandleDecimal = true,
) => {
  const formatted = formatScientific(
    value === null || value === undefined ? undefined : Number(value),
    needHandleDecimal,
  );

  return scientificToPlain(formatted);
};
