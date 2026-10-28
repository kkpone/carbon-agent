export type TableFilterStatusProps = {
  listArr: { label: React.ReactNode; value: number | string }[];
  onConfirmClick: (selectNum: number[]) => void;
};
