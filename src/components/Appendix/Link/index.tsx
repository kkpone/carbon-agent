import I18N from '@src/lang/I18N';
import { Button, Input, Modal } from 'antd';
import { FC, useState } from 'react';
import styles from './index.module.less';
import linkSvg from './link.svg';
import icon from './icon.svg';
import { Toast } from '@/utils';

export interface IAppendixLinkProps {
  submit?: (value: string) => void;
}

function isValidURL(str: string) {
  try {
    /* eslint-disable-next-line */
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

export const AppendixLink: FC<IAppendixLinkProps> = props => {
  const [open, setOpen] = useState(false);
  const { submit } = props;
  const [value, setValue] = useState<string>('');
  return (
    <div className={styles.linkWrapper}>
      <Modal
        title={I18N.components.addLink}
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
        footer={null}
      >
        <div className={styles.tip}>
          {I18N.components.willBeInputtedFromYou}
        </div>
        <div className={styles.input}>
          <Input
            placeholder={I18N.components.pleaseEnterTheLink}
            prefix={<img src={linkSvg} alt='' />}
            onChange={e => {
              setValue(e.target.value);
            }}
          />
          <Button
            type='primary'
            onClick={() => {
              if (value.length === 0) {
                return;
              }
              if (!isValidURL(value)) {
                Toast('warn', I18N.components.pleaseEnterCorrectly);
                return;
              }
              if (submit) {
                submit(value);
              }
              setOpen(false);
            }}
          >
            {I18N.carbonFootprint.confirm2}
          </Button>
        </div>
      </Modal>
      <div onClick={() => setOpen(true)} className={styles.btn}>
        <img src={icon} alt='' />
        <span>{I18N.components.addLink}</span>
      </div>
    </div>
  );
};
