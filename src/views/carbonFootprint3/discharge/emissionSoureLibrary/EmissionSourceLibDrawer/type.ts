export type EmissionSourceLibDrawerProps = {
  initMenuCode?: number;
  visible: boolean;
  status: 'add' | 'edit' | 'detail' | 'copy';
  emissionId?: number;
  onSub?: () => void;
  onClose: () => void;
};
