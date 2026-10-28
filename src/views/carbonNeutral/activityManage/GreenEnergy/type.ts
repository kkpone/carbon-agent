export type Province = {
  code: number;
  name: string;
  pcode: string;
  children: Province[];
};

export type ProvinceLevel = {
  areaCode: number;
  level: number;
};

export type GreenEnergyPolicy = {
  id: number;
  content: string;
  area1: string;
  area2: string;
  publishBy: string;
  publishTime: string;
  url: string;
  htmlContent: string;
};
