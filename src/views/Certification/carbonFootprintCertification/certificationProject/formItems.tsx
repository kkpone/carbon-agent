import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formItemInitType } from '@src/components/FormUtil/util';

import { CERTIFYPROJECTSTATUS_LABEL, CERTIFYPROJECTTYPE_LABEL } from './const';

export const searchTableFormItem = (): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    {
      ...formItemInitType('input', '', 'projectName', true),
      props: {
        placeholder: I18N.carbonNeutral.entryName,
      },
    },
    {
      ...formItemInitType('input', '', 'projectNo', true),
      props: {
        placeholder: I18N.Certification.projectId,
      },
    },
    {
      ...formItemInitType('select', '', 'authType', true),
      props: {
        placeholder: I18N.Certification.certificationProject,
        options: Object.keys(CERTIFYPROJECTTYPE_LABEL).map(v => ({
          label: CERTIFYPROJECTTYPE_LABEL[v],
          value: v,
        })),
      },
    },
    {
      ...formItemInitType('input', '', 'reportName', true),
      props: {
        placeholder: I18N.carbonFootprint.reportName,
      },
    },

    {
      ...formItemInitType('select', '', 'status', true),
      props: {
        placeholder: I18N.carbonFootprint.state,
        options: Object.keys(CERTIFYPROJECTSTATUS_LABEL).map(v => ({
          label: CERTIFYPROJECTSTATUS_LABEL[v],
          value: v,
        })),
      },
    },
  ];
  return data.map(item => {
    const back = item;
    back.props = {
      style: { width: '200px' },
      ...back.props,
    };
    return back;
  });
};
