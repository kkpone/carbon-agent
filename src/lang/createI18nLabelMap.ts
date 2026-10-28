/**
 * 创建“惰性求值”的 i18n 标签映射，解决闭包导致的语言切换后文案不更新问题。
 * 每次属性访问时从 I18N 读取当前语言下的值，而非模块加载时固定。
 *
 * @example
 * const LABELS = createI18nLabelMap({
 *   [SomeEnum.A]: () => I18N.xxx.labelA,
 *   [SomeEnum.B]: () => I18N.xxx.labelB,
 * });
 * // 使用方式不变：LABELS[key]，语言切换后自动生效
 */
export function createI18nLabelMap<K extends string | number, V>(
  factory: Record<K, () => V>,
): Record<K, V> {
  return new Proxy({} as Record<K, V>, {
    get(_, key: string | symbol) {
      const fn = factory[key as K];
      return typeof fn === 'function' ? fn() : undefined;
    },
    has(_, key) {
      return key in factory;
    },
    ownKeys() {
      return Reflect.ownKeys(factory);
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  });
}
