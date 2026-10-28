export function canDisplayProductCarbonCertificate(
  readonly: boolean,
  shareId: string | undefined,
  viewportWidth: number,
) {
  return !readonly && !shareId && viewportWidth >= 768;
}
