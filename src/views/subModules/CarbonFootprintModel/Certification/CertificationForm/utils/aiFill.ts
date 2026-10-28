export type AIFillConfig = any;
export const getAIFillConfirmTaskLabel = (..._args: any[]) => "";
export const getAIFillTip = (..._args: any[]) => "";
export const useAIFillFlow = (..._args: any[]): any => ({
  aiFilling: false,
  confirmVisible: false,
  confirmItems: [],
  startAIFill: () => {},
  handleConfirm: () => {},
  handleCancel: () => {},
});
