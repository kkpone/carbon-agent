import type { Form } from '@formily/core';

export interface FactorInstitutionOption {
  id: string;
  institution: string;
  year: string;
}

export interface EcoinventGeographyOption {
  dictLabel: string;
  dictValue: string;
}

const institutionNamesByForm = new WeakMap<Form, Map<string, string>>();

export const syncEcoinventGeography = (
  form: Form,
  institutions: FactorInstitutionOption[] | null = [],
  enabled: boolean,
) => {
  // 接口可能按年份返回同名机构的不同 ID，保留当前弹窗已加载的名称映射。
  const institutionNames =
    institutionNamesByForm.get(form) || new Map<string, string>();
  institutions?.forEach(item => {
    institutionNames.set(String(item.id), item.institution);
  });
  institutionNamesByForm.set(form, institutionNames);

  const selectedId: string | undefined = form.getValuesIn('institution');
  const selectedInstitution = institutionNames.get(String(selectedId));
  const visible =
    enabled && selectedInstitution?.toLowerCase().includes('ecoinvent');

  // 先清空再隐藏，避免 Formily 缓存旧值并在重新显示时恢复。
  if (!visible && form.getValuesIn('ecoinventGeographies')?.length) {
    form.setValuesIn('ecoinventGeographies', []);
  }
  form.setFieldState('ecoinventGeographies', state => {
    state.display = visible ? 'visible' : 'none';
  });
  form.setFieldState('grid.filters', state => {
    state.componentProps = {
      ...state.componentProps,
      minColumns: visible ? 5 : 4,
      maxColumns: visible ? 5 : 4,
    };
  });
};
