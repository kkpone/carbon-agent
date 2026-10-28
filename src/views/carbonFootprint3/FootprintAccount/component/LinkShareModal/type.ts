import { LocaleType } from '@src/lang/I18N';

/** 链接分享弹框表单内容 */
export type LinkShareContent = {
  id?: number;
  accountId?: number;
  url: string;
  type: number;
  password: string;
  expireValue: number;
  locale: LocaleType;
  editType: number;
  editPermit?: number;
};

export type LinkShareModalProps = {
  open: boolean;
  content: LinkShareContent;
  errorSharePassword: boolean;
  copying?: boolean;
  /** 是否锁定“是否支持编辑及数据同步”，锁定时只能选择“否” */
  editTypeReadonly?: boolean;
  onClose: () => void;
  onContentChange: (content: LinkShareContent) => void;
  onPasswordErrorChange: (error: boolean) => void;
  onOpenShareRecord: () => void;
  onCopy: () => void;
};
