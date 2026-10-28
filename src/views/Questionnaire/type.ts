import { AddressType } from '@/components/formily/components/AdressSelect';

export type Questionnaire = {
  id: number;
  name: string;
  type: number;
  year: string;
  status: number;
  busType: number;
  workdayType?: number;
  workDayWay?: number;
  expireTime: string;
  employeeInfos: number[];
  companyAddress: AddressType[];
  emissionTotal: string;
  submitEmission: string;
  submitCount: number;
  employeeCount: number;
};
