const normalizeHex = (hex: string) => hex.replace('#', '');

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b]
    .map(value => Math.round(value).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();

export const getPaletteColor = (
  palette: string[],
  index: number,
  total: number,
) => {
  if (palette.length === 0) return '#0CBF9F';
  if (palette.length === 1 || total <= 1) return palette[0];
  if (total <= palette.length)
    return palette[index] || palette[palette.length - 1];

  const position = (index / (total - 1)) * (palette.length - 1);
  const startIndex = Math.floor(position);
  const endIndex = Math.min(startIndex + 1, palette.length - 1);
  const ratio = position - startIndex;

  const start = hexToRgb(palette[startIndex]);
  const end = hexToRgb(palette[endIndex]);

  return rgbToHex({
    r: start.r + (end.r - start.r) * ratio,
    g: start.g + (end.g - start.g) * ratio,
    b: start.b + (end.b - start.b) * ratio,
  });
};
