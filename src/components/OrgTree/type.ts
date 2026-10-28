import React from 'react';

export type Org = {
  id: number;
  name: string;
  orgType: number;
  pid: 0;
  children: Org[] | undefined;
  key: React.Key;
  parents: Org[];
  [p: string]: any;
};
