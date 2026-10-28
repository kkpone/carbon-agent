import { Component, ComponentType } from 'react';

export type GetComponentProps<T> = T extends
  | ComponentType<infer P>
  | Component<infer P>
  ? JSX.LibraryManagedAttributes<T, P>
  : never;
