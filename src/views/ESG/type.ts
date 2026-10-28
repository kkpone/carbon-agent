import { UploadFile } from 'antd';

export type IndicatorParam = {
  id: string;
  name: string;
  type: string;
  paramType: number;
  unitType: number;
  unit: string[][];
  unitDecimalPlace: number;
  unitMax: number;
  unitMin: number;
  fieldMax: number;
  fieldMin: number;
  dataValue: number | string;
  preDataValue: number | string;
  modelIndicatorDataId: string;
  options: { value: string; label: string }[];
};

export type Indicator = {
  id: string;
  name: string;
  code: string;
  level: number;
  frameTopicId: number;
  modelTopicId: number;
  indicatorType: number;
  fillWay: number;
  selected: boolean;
  disabled: boolean;
  status: number;
  example: { name: string; url: string }[];
  indicatorValue: string | number;
  preIndicatorValue: string | number;
  showName: string;
  unitType: number;
  unit: string[][];
  fileList: UploadFile<{ data: string }>[];
  standard: string;
  standardStr: string;
  statisticsType: number;
  description: string;
  dataType: null;
  applyStatus: null;
  orgList: { id: number; orgName: string }[];
  fillRequire: string;
  disclose: number;
  remark: string;
  // 指标公式字符串
  indicatorString: string;
  indicatorFormula: { value: string; label: string; type: number }[];
  paramGroup: {
    id: string;
    name: string;
    paramList: IndicatorParam[];
  }[];
  orgTaskList: {
    orgId: number;
    orgName: number;
    status: number;
    updateName: string;
    updateTime: string;
    fileList: UploadFile<{ data: string }>[];
    remark: string;
    paramGroup: {
      id: string;
      name: string;
      paramList: IndicatorParam[];
    }[];
  }[];
  tableHeadList: Record<string, any>[];
  tableValue: Record<string, any>[];
  children: Indicator[];
  [P: string]: any;
};

export type Topic = {
  id: number | string;
  name: string;
  moduleType: number;
  orderNum: number;
  inSignificance: number;
  outSignificance: number;
  level: number;
  indicatorList: Indicator[];
  children: Indicator[];
};

export type TopicGroup = {
  id: number | string;
  code: number;
  name: string;
  topicList: Topic[];
  children: Topic[];
};

export type IndicatorSystem = {
  id: number;
  period: string;
  name: string;
  state: number;
  referenceType: number;
  topicList: { id: number; disabled: boolean }[];
  referenceIds?: string;
};

export type ESGTask = {
  orgId: number;
  orgName: string;
  period: string;
  status: number;
  finishCount: number;
  totalCount: number;
  updateName: string;
  updateTime: string;
};
