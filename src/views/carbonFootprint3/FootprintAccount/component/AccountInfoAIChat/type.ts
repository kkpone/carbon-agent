import { UploadFile } from 'antd';

export interface AccountInfoAIChatProps {
  accountId: number;
  productId: number;
  onUpdateModel?: () => void;
  /** 核算详情 aiCheck：0 显示「提供详细信息」，1 隐藏 */
  aiCheck?: number;
  /** 触发核算详情刷新（如 getAccountingInfo） */
  onAfterProvideDetail?: () => void | Promise<void>;
}

export interface AccountInfoAIChatRef {
  sendQuestionGuide: (question: string) => void;
  addReferenceContent: (referenceText: string) => void;
}

/** 接口 /accountEmission/aiModelQuestion 单条问题 */
export interface AiModelQuestionItem {
  questionNum: number;
  questionTitle: string;
  questionDescription: string;
  /** 0 无输入框 1 展示输入框 */
  inputBox: number;
  inputBoxUnit: string;
  /** 0 不展示选项 1 单选 2 多选 */
  optionType: number;
  optionList: string[];
  button: number;
  /** topicChat json_question 小题状态：0 未作答 */
  status?: number;
  /** 已作答时的文案（选项值或输入内容） */
  answer?: string;
}

/** 接口 /accountEmission/aiModelUpdate questionList 单项 */
export interface AiModelQuestionAnswerPayload {
  questionNum: number;
  questionTitle: string;
  questionDescription: string;
  answer: string;
}

/** 表单卡片中的单个选项 */
export interface FormCardOption {
  label: string;
  value: string;
}

/** 表单卡片中的输入域 */
export interface FormCardInput {
  placeholder: string;
  unit?: string;
}

/**
 * AI 返回的数据采集卡片，支持:
 * - 纯选项 (options only)
 * - 纯输入框 + 确认 (inputField only)
 * - 选项 + 输入框 + 确认 (mixed)
 */
export interface FormCard {
  title: string;
  options?: FormCardOption[];
  inputField?: FormCardInput;
  /** optionType=1 单选；=2 多选（默认单选） */
  optionSelectMode?: 'single' | 'multi';
  /** 有输入框时确认按钮文案，默认「确认」 */
  confirmButtonLabel?: string;
  /** 是否已完成填写（完成后卡片变暗） */
  completed?: boolean;
  selectedValue?: string;
  inputValue?: string;
}

/** 消息的内容类型 */
export type ChatContentType =
  | 'text'
  | 'form-card'
  | 'action-buttons'
  | 'evaluation';

/** 操作按钮类型 */
export type ActionButtonType = 'continue' | 'update-model';

/** 上传文件附件 */
export interface ChatAppendix {
  name: string;
  url: string;
}

/** 对话消息 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  uuid: string;
  time: string;
  content: string;
  contentType?: ChatContentType;
  /** form-card 类型时的卡片数据 */
  formCard?: FormCard;
  /** action-buttons 类型时的按钮列表 */
  actionButtons?: ActionButtonType[];
  /** 用户消息附件 */
  appendix?: ChatAppendix[];
  /** 用户发送时携带的引用内容 */
  referContent?: string;
  /** 是否正在加载（流式输出中） */
  loading?: boolean;
  /** 消息 ID，用于历史记录 */
  historyId?: number;
  /** 关联建模问卷题目序号（服务端 questionNum） */
  questionMeta?: { questionNum: number };
  /** 与 `/ai/chat/topicChat`、小碳 Answer 对齐（技能结果多为 json） */
  dataType?: 'json' | 'markdown' | 'json_question';
  jsonList?: Record<string, any>[] | null;
  /** AI_HISTORY_STATUS：json 技能进度 */
  status?: number;
}

/** 文件上传项 */
export interface UploadListFile extends UploadFile {
  response?: {
    data?: {
      name?: string;
      url?: string;
    };
  };
}
