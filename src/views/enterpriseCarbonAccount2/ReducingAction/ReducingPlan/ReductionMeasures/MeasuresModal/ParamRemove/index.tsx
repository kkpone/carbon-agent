import { ArrayField } from '@formily/core';
import { FormConsumer, observer, useField, useForm } from '@formily/react';
import I18N from '@src/lang/I18N';

import { IconAlibaba } from '@/components/iconfont';
import { Toast } from '@/utils/Toast';

import { PARAM_CHART_SIGN } from '../../constant';
import { MeasuresType } from '../../type';

const ParamRemove = observer(() => {
  const { index, parent } = useField();
  const form = useForm();

  const paramArrayField = parent as ArrayField;

  const remove = () => {
    const {
      earnings = [],
      cost = [],
      reduceResult = [],
      paramItem = [],
    } = form.values as MeasuresType;

    const paramId = (paramItem || [])[index]?.id;

    const checkExist = (formula: { value: string; label: string }[] = []) =>
      formula.some(({ value }) => value.split(PARAM_CHART_SIGN)[0] === paramId);

    if (
      checkExist(earnings) ||
      checkExist(cost) ||
      reduceResult.some(item => checkExist(item.formula))
    ) {
      Toast('warning', I18N.enterpriseCarbonAccount2.thisParameterIsSetTo);
    } else {
      paramArrayField.remove(index);
    }
  };
  return (
    <FormConsumer>
      {formIns =>
        formIns.readPretty ||
        (
          (formIns.values as { paramItem: MeasuresType['paramItem'] })
            .paramItem || []
        ).length <= 1 ? (
          <div>-</div>
        ) : (
          <div onClick={remove}>
            <IconAlibaba type='icon-icon_delete' />
          </div>
        )
      }
    </FormConsumer>
  );
});

export default ParamRemove;
