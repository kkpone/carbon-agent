function stringify(value: any): string {
  return JSON.stringify(value);
}

function parse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return null;
  }
}

interface ILocalStore {
  setValue(key: string, data: any): ILocalStore;
  getValue<T>(key: string, defaultValue?: T): T | null;
  removeValue(key: string): ILocalStore;
}

const LocalStore: ILocalStore = {
  setValue(key: string, data: any): ILocalStore {
    try {
      localStorage.setItem(key, stringify(data));
      // eslint-disable-next-line no-empty
    } catch {}

    return this;
  },
  getValue<T>(key: string, defaultValue?: T): T | null {
    const value = localStorage.getItem(key);

    if (!value) return defaultValue || null;
    const data = parse<T>(value);
    return data;
  },
  removeValue(key: string): ILocalStore {
    localStorage.removeItem(key);
    return this;
  },
};

export default LocalStore;

/**
 * 获取当前产品的产品id
 * @returns 产品id
 */
export const GetLocalStorageProductId = () => {
  const stringStorage = localStorage.getItem('PRODUCT_KEY');
  if (stringStorage) {
    const {
      productId,
    }: {
      currentNav: string;
      productId: string;
    } = JSON.parse(stringStorage);

    return productId;
  }

  return undefined;
};
