import I18N from '@src/lang/I18N';
import { checkEmail } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { GetComponentProps } from '@src/utils/utilTypes';
import { Select, Tag } from 'antd';
import { FC, ReactNode, useRef, useState } from 'react';

import { SimpleOrg } from '../../type';

type EmailInputProps = Omit<
  GetComponentProps<typeof Select>,
  'value' | 'onChange'
> & {
  value: SimpleOrg['emailList'];
  onChange: (value: SimpleOrg['emailList']) => void;
};

const EmailInput: FC<EmailInputProps> = ({ value, onChange, ...props }) => {
  const searchValRef = useRef('');

  const [focused, setFocused] = useState(false);

  const onEmailMatch = (email: string) => {
    searchValRef.current = '';
    if (!email || value.some(({ employEmail }) => employEmail === email)) {
      return;
    }
    if (!checkEmail(email)) {
      Toast('error', I18N.enterpriseCarbonAccount2.emailFormatIsIncorrect);
      return;
    }
    onChange([...value, { employEmail: email }]);
  };

  const valueCount = value.length;
  const displayValue =
    !focused && valueCount > 2
      ? [...value.slice(0, 2), { employEmail: `+${valueCount - 2}` }]
      : value;

  const tagRender = ({
    value: tagValue,
    label,
    onClose,
  }: {
    value: string;
    label: ReactNode | undefined;
    onClose: () => void;
  }) => (
    <Tag closable={checkEmail(tagValue)} onClose={onClose}>
      {label}
    </Tag>
  );

  return (
    <Select
      {...props}
      open={false}
      mode='tags'
      placeholder={I18N.dashborad.pleaseEnterYourEmailAddress}
      value={displayValue.map(({ employEmail }) => employEmail)}
      options={value.map(({ employEmail, employName }) => ({
        value: employEmail,
        label: employName || employEmail,
      }))}
      showSearch
      onSearch={searchText => {
        setTimeout(() => {
          searchValRef.current = searchText;
        });
      }}
      onDeselect={email => {
        onChange(value.filter(({ employEmail }) => employEmail !== email));
      }}
      onBlur={() => {
        onEmailMatch(searchValRef.current);
        setFocused(false);
      }}
      onInputKeyDown={({ key }) => {
        if (key === 'Enter') {
          onEmailMatch(searchValRef.current);
        }
      }}
      onFocus={() => setFocused(true)}
      tagRender={tagRender}
    />
  );
};

export default EmailInput;
