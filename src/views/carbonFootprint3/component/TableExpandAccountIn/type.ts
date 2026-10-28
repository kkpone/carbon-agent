import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';

export interface TableExpandAccountInProps<
  DataItem extends { matchTypeId: number },
> {
  record: DataItem;
  isProcess?: boolean;
  apiExtraParams?: ApiExtraParams;
}
