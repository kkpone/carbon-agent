import { MenuProps } from 'antd';
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';

import { getToken } from '@/utils/cookie';

interface AICarbonFloatingContextType {
  isVisible: boolean;
  position: { x: number; y: number };
  isDragging: boolean;
  isExpanded: boolean;
  showFloating: () => void;
  hideFloating: () => void;
  setPosition: (position: { x: number; y: number }) => void;
  setIsDragging: (dragging: boolean) => void;
  toggleExpanded: () => void;
  setExpanded: (
    expanded: boolean,
    newChat?: boolean,
    extraString?: string,
  ) => void;
  needNewChat: boolean;
  setNeedNewChat: (newChat: boolean) => void;
  extra: string;
  setExtra: (extra: string) => void;
  chatSource: EChatSource;
  setChatSource: (chatSource: EChatSource) => void;
  accountId?: number;
  isOrgAiAssistant?: boolean;
  setIsOrgAiAssistant: (isOrgAiAssistant: boolean) => void;
  setAccountId: (accountId?: number) => void;
  topicId?: number;
  setTopicId: (topicId?: number) => void;
  ReferencesText: string;
  setReferencesText: (ReferencesText: string) => void;
  fromId?: string | number;
  setFromId: (fromId?: AICarbonFloatingContextType['fromId']) => void;
  extraFunc?: {
    onHistoryFailed?: (data: Record<string, any>) => void | Promise<void>;
  };
  setExtraFunc: (extraFunc?: AICarbonFloatingContextType['extraFunc']) => void;
  inputMenuItems?: (NonNullable<MenuProps['items']>[number] & {
    templateDictType?: string;
    templateDictValue?: string;
    onExecute?: (data: Record<string, any>) => void | Promise<void>;
  })[];
  setInputMenuItems: (
    inputMenuItems?: AICarbonFloatingContextType['inputMenuItems'],
  ) => void;
  activeMenuKey?: string;
  setActiveMenuKey: (activeMenuKey?: string) => void;
}

const AICarbonFloatingContext = createContext<
  AICarbonFloatingContextType | undefined
>(undefined);

interface AICarbonFloatingProviderProps {
  children: ReactNode;
}

export enum EChatSource {
  /** 正常问答 */
  NORMAL = '1',
  /** 企业碳问小碳来源 */
  ENTERPRISE_CARBON = '2',
  /** 产品碳问小碳来源 */
  PRODUCT_CARBON = '3',
}

export const AICarbonFloatingProvider: React.FC<
  AICarbonFloatingProviderProps
> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPositionState] = useState({
    x: window.innerWidth - 20,
    y: window.innerHeight - 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  /** 是否是展开的状态 */
  const [isExpanded, setIsExpanded] = useState(false);
  /** 是否需要新起一个对话 */
  const [needNewChat, setNeedNewChat] = useState(false);
  /** 小碳来源 */
  const [chatSource, setChatSource] = useState<EChatSource>(EChatSource.NORMAL);
  /** 企业碳问小碳来源 产品碳问小碳来源 需要传入accountId */
  const [accountId, setAccountId] = useState<number>();
  /** 是否是企业碳问小碳来源 */
  const [isOrgAiAssistant, setIsOrgAiAssistant] = useState(false);
  /** 需要打开弹窗后直接放到对话框的内容 */
  const [extra, setExtra] = useState('');
  const showFloating = useCallback(() => setIsVisible(true), []);
  const hideFloating = useCallback(() => setIsVisible(false), []);
  const [topicId, setTopicId] = useState<number>();

  useEffect(() => {
    if (!getToken()) {
      setIsVisible(false);
    }
  }, []);

  const [ReferencesText, setReferencesText] = useState('');

  const [extraFunc, setExtraFunc] =
    useState<AICarbonFloatingContextType['extraFunc']>();

  const [inputMenuItems, setInputMenuItems] =
    useState<AICarbonFloatingContextType['inputMenuItems']>();

  const [activeMenuKey, setActiveMenuKey] = useState<string>();

  const [fromId, setFromId] = useState<number | string>();

  const setPosition = useCallback(
    (pos: { x: number; y: number }) => setPositionState(pos),
    [],
  );
  const toggleExpanded = useCallback(
    () => setIsExpanded(expanded => !expanded),
    [],
  );
  const setExpanded = useCallback((expanded: boolean, newChat?: boolean) => {
    setIsExpanded(expanded);
    setNeedNewChat(newChat || false);
  }, []);

  const value = useMemo(
    () => ({
      isVisible,
      position,
      isDragging,
      isExpanded,
      showFloating,
      hideFloating,
      setPosition,
      setIsDragging,
      toggleExpanded,
      setExpanded,
      needNewChat,
      setNeedNewChat,
      extra,
      setExtra,
      chatSource,
      setChatSource,
      accountId,
      setAccountId,
      topicId,
      setTopicId,
      isOrgAiAssistant,
      setIsOrgAiAssistant,
      ReferencesText,
      setReferencesText,
      fromId,
      setFromId,
      extraFunc,
      setExtraFunc,
      inputMenuItems,
      setInputMenuItems,
      activeMenuKey,
      setActiveMenuKey,
    }),
    [
      isVisible,
      position,
      isDragging,
      isExpanded,
      showFloating,
      hideFloating,
      setPosition,
      setIsDragging,
      toggleExpanded,
      setExpanded,
      needNewChat,
      setNeedNewChat,
      extra,
      setExtra,
      chatSource,
      setChatSource,
      accountId,
      setAccountId,
      topicId,
      setTopicId,
      isOrgAiAssistant,
      setIsOrgAiAssistant,
      ReferencesText,
      setReferencesText,
      fromId,
      setFromId,
      extraFunc,
      setExtraFunc,
      inputMenuItems,
      setInputMenuItems,
      activeMenuKey,
      setActiveMenuKey,
    ],
  );

  return (
    <AICarbonFloatingContext.Provider value={value}>
      {children}
    </AICarbonFloatingContext.Provider>
  );
};

export const useAICarbonFloating = (): AICarbonFloatingContextType => {
  const context = useContext(AICarbonFloatingContext);
  if (context === undefined) {
    throw new Error(
      'useAICarbonFloating must be used within an AICarbonFloatingProvider',
    );
  }
  return context;
};
