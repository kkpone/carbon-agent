export interface EcoinventValueVisibility {
  factorPattern?: string | number | null;
  ecoinventValueVisible?: boolean | null;
}

/**
 * 缺少服务端授权字段时按未授权处理，避免旧接口或异常响应意外展示 Ecoinvent 因子值。
 */
export const shouldHideEcoinventValue = (
  factor?: EcoinventValueVisibility | null,
) =>
  String(factor?.factorPattern ?? '') === '2' &&
  factor?.ecoinventValueVisible !== true;
