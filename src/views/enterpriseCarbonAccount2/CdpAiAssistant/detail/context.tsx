import React, { createContext, useContext, useMemo } from 'react';

interface CdpAiAssistantContextType {
  rescore: (questionCode: string) => Promise<void>;
  ruleData?: string[];
  drawOpen?: boolean;
}

const CdpAiAssistantContext = createContext<
  CdpAiAssistantContextType | undefined
>(undefined);

export const CdpAiAssistantProvider: React.FC<{
  children: React.ReactNode;
  rescore: (questionCode: string) => Promise<void>;
  ruleData?: string[];
  drawOpen?: boolean;
}> = ({ children, rescore, ruleData, drawOpen }) => {
  const value = useMemo(
    () => ({ rescore, ruleData, drawOpen }),
    [rescore, ruleData?.length, drawOpen],
  );

  return (
    <CdpAiAssistantContext.Provider value={value}>
      {children}
    </CdpAiAssistantContext.Provider>
  );
};

export const useCdpAiAssistant = () => {
  const context = useContext(CdpAiAssistantContext);
  if (context === undefined) {
    throw new Error(
      'useCdpAiAssistant must be used within a CdpAiAssistantProvider',
    );
  }
  return context;
};
