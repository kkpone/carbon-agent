type InferBasicType<T extends string, F> = T extends 'string'
  ? string
  : T extends 'number'
  ? number
  : T extends 'boolean'
  ? boolean
  : T extends 'null'
  ? null
  : T extends 'object'
  ? FlatProperties<F>
  : T extends 'array'
  ? any[]
  : never;

type FlatProperties<T> = {
  readonly [K in keyof T as T[K] extends { type: 'void'; properties?: any }
    ? never
    : T[K] extends { type: 'object'; properties?: any }
    ? K
    : K]: T[K] extends { type: 'array'; properties?: any; items: any }
    ? GenerateFormValueType<T[K]['items']>[]
    : T[K] extends { type: string; properties?: any }
    ? InferBasicType<T[K]['type'], T[K]['properties']>
    : never;
} & (T extends { [K in keyof T]: infer U }
  ? U extends { type: 'void'; properties: any }
    ? FlatProperties<U['properties']>
    : {}
  : {});

type AllKeys<T> = T extends any ? keyof T : never;

type Merge<T> = {
  [K in AllKeys<T>]: T extends { [P in K]?: infer V } ? V : never;
};

export type GenerateFormValueType<T> = T extends () => infer R
  ? GenerateFormValueType<R>
  : T extends { type: 'object'; properties?: any }
  ? Merge<FlatProperties<T['properties']>>
  : T extends { type: 'void'; properties?: any }
  ? Merge<FlatProperties<T['properties']>>
  : T;
