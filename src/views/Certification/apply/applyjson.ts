export interface OptionType {
  id: number;
  name: string;
  price: number;
}
export interface ItemType {
  title: string;
  optionList: OptionType[];
  currentId: null | number;
}
