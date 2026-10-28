/**
 * AI 数据填写  排放源名称  自定义组件
 */
import { connect, mapProps, useField, useForm } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Input } from 'antd';
import { useEffect, useState } from 'react';

type FormAiDataNameProps = {
  value: {
    value: string;
    validReauire: boolean;
  };
};

const FormAiDataName = ({ value }: FormAiDataNameProps) => {
  const field = useField();
  const form = useForm();

  const [val, setVal] = useState(() => value.value);

  const getSetPath = () => field.query('.set').take()?.path;

  const setSetEditStataus = () => {
    const tempListSet: { id: string; editStatus: boolean } = field
      .query('.set')
      .get('value');
    // 如果编辑状态已经为true 就不需要后面的处理了
    if (tempListSet?.editStatus) return;

    const path = getSetPath();
    if (path) {
      form.setValuesIn(path, {
        ...tempListSet,
        editStatus: true,
      });
    }
  };

  useEffect(() => {
    setVal(value?.value);
  }, [value?.value]);

  return (
    <Input
      style={value.validReauire && !val ? { borderColor: 'red' } : {}}
      placeholder={I18N.carbonFootprint3.pleaseEnterEmissions}
      value={val}
      maxLength={100}
      onChange={e => {
        const path = getSetPath();
        if (path) {
          form.setValuesIn(path, {
            ...form.getValuesIn(path),
            editStatus: false,
          });
        }
        setVal(e.target.value);
      }}
      onBlur={e => {
        setSetEditStataus();
        form.setValuesIn(field.path, {
          value: e.target.value,
          validReauire: !e.target.value,
        });
      }}
    />
  );
};

export default connect(
  FormAiDataName,
  mapProps({ value: true }, props => ({
    ...props,
  })),
);
