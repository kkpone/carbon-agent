export type ProcessVisualizationFooterDrawerProps = {
  loading?: boolean;
  onSubClick: () => Promise<any>;
  onCancelClick: () => void;
  okText?: string;
  isOnlyDetail?: boolean;
};
