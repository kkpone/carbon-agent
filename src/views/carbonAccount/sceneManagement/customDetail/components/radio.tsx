import { DownloadOutlined } from '@ant-design/icons';
import { useForm } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Popconfirm, Tooltip } from 'antd';
import classNames from 'classnames';

import camera from './icon_camera.png';
import scan from './icon_scan_code.png';
import styles from './radio.module.less';

export const CustomTypeRadio = props => {
  const { value, onChange, options, disabled, onRegenerate, downloadDisabled } =
    props;
  const form = useForm();
  const url = form.getValuesIn('customScanUrl') || '';
  return (
    <>
      <div className={styles.box}>
        {options.map(item => (
          <div
            className={classNames(styles.btn, {
              [styles.active]: value === item.value,
            })}
            key={item.value}
            onClick={() => {
              if (disabled) return;
              onChange(item.value);
            }}
          >
            <img src={item.value === 0 ? camera : scan} alt='' />
            <span>{item.label}</span>
          </div>
        ))}
        {value === 1 && (
          <Tooltip
            placement='right'
            title={url.length === 0 ? I18N.carbonAccount.createSceneAs : ''}
          >
            <Button
              disabled={url.length === 0 || downloadDisabled}
              type='link'
              href={url}
              target='_blank'
              icon={<DownloadOutlined />}
            >
              {I18N.carbonFootprint3.downloadQrCode}
            </Button>
          </Tooltip>
        )}
        {!disabled && value === 1 && url?.length > 0 && (
          <Popconfirm
            title='确定重新生成二维码吗？'
            description='确定并提交保存后旧二维码将无法使用'
            onConfirm={onRegenerate}
          >
            <Button type='link'>重新生成二维码</Button>
          </Popconfirm>
        )}
      </div>
      <div className={styles.tips}>
        {value === 1 ? I18N.carbonAccount.createSceneAs : ''}
      </div>
    </>
  );
};
