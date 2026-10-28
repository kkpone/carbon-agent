import I18N from '@src/lang/I18N';
import { connect, mapProps, ReactFC } from '@formily/react';
import { Input, Select } from 'antd';

interface IInputGroupComponentsProps {
  value: [string, string];
  onChange: (value: [string, string]) => void;
  options: { label: string; value: string }[];
}

const InputGroupComponents: ReactFC<IInputGroupComponentsProps> = props => {
  const { value, onChange, options = [] } = props;

  return (
    <Input.Group compact style={{ width: '100%' }}>
      <Input
        className='site-input-right'
        style={{
          width: 150,
          textAlign: 'left',
        }}
        value={value[0]}
        onChange={e => onChange([e.target.value, value[1]])}
        placeholder={I18N.enterpriseCarbonAccount2.reportYearTotalBusiness}
      />
      <Select
        value={value[1]}
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').includes(input.toUpperCase())
        }
        style={{
          width: '100px',
        }}
        options={options}
        onChange={selectValue => onChange([value[0], selectValue])}
      />
    </Input.Group>
  );
};

export const InputGroup = connect(
  InputGroupComponents,
  mapProps({
    dataSource: 'options',
  }),
);
