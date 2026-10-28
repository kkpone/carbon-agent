export interface CaculationBaseData {
  id: number;
  is_use: boolean;
  weights: number;
  createtime: string;
  modification: string;
  dict_label: string;
  dict_key: string;
  dict_value: DictValue[];
  solution: any;
}

interface DictValue {
  key?: number;
  type: string;
  options?: Option[];
  function?: string;
  tab_title?: string;
  type_name?: string;
  children?: DictValueChild[];
  disabled?: boolean;
  contact_type?: string;
  children2?: Children2[];
  mode_type?: string;
  label?: string;
  value?: string;
}

interface DictValueChild {
  label: string;
  value: string;
  children?: ChildChild[];
}

interface ChildChild {
  label: string;
  value: string;
}

interface Children2 {
  type: Type;
  label: string;
  value: string;
}

enum Type {
  其他 = '其他',
  燃气 = '燃气',
  燃油 = '燃油',
  燃煤 = '燃煤',
}

interface Option {
  name: string;
  label: string;
  rules: Rule[];
  suffix: string;
  formType: FormType;
}

enum FormType {
  Number = 'number',
}

interface Rule {
  message: string;
  required: string;
}

export type ReportInfo = {
  product_name: string;
  year: string;
  id: string | number;
};

export interface CompanyUnits {
  id: number;
  unit_name: string;
  is_merge: boolean;
  fuel_type: string[];
  fuel: string[];
  fuel_json: CompanyUnitsFuelJSON[];
  unit_type: string;
  detail_unit_type: string;
  merge_unit_name: null | string;
  installed_capacity_json:
    | InstalledCapacityJSONElement[]
    | InstalledCapacityJSONElement;
  installed_capacity: string;
}

interface CompanyUnitsFuelJSON {
  type: string;
  label?: string;
  value: string[];
}

interface InstalledCapacityJSONElement {
  id: number;
  MW: string;
  name: string;
}
