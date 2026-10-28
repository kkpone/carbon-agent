import I18N from '@src/lang/I18N';
import { Input, Modal } from 'antd';
import { FC, useState } from 'react';
import styles from './index.module.less';
import icon from './icon.svg';

export interface IAppendixTextProps {
  submit?: (value: string) => void;
}

export const AppendixText: FC<IAppendixTextProps> = props => {
  const [open, setOpen] = useState(false);
  const { submit } = props;
  const [value, setValue] = useState<string>('');
  return (
    <div className={styles.textWrapper}>
      <Modal
        title={I18N.components.addText}
        open={open}
        width={600}
        onOk={() => {
          if (submit) {
            submit(value);
          }
          setOpen(false);
        }}
        destroyOnClose
        onCancel={() => setOpen(false)}
      >
        <Input.TextArea
          autoSize={{ minRows: 10, maxRows: 16 }}
          placeholder={I18N.components.pleaseEnterText}
          onChange={e => {
            setValue(e.target.value);
          }}
          style={{ width: '100%' }}
          showCount
          maxLength={2000}
        />
      </Modal>
      <div onClick={() => setOpen(true)} className={styles.btn}>
        <img src={icon} alt='' />
        <span>{I18N.components.addText}</span>
      </div>
    </div>
  );
};
