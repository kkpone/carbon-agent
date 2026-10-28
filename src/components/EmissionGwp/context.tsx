import { createContext, PropsWithChildren } from 'react';

export const GwpScopeContext = createContext(false);

interface GwpRecordScopeProps {
  recordKey: string;
  readOnly?: boolean;
}

export const GwpRecordContext = createContext<GwpRecordScopeProps>({
  recordKey: 'new',
});

export function GwpRecordScope({
  children,
  ...value
}: PropsWithChildren<GwpRecordScopeProps>) {
  return (
    <GwpRecordContext.Provider value={value}>
      {children}
    </GwpRecordContext.Provider>
  );
}
