import { observer, useForm } from '@formily/react';
import { Button, Spin } from 'antd';
import { useContext, useEffect, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { serviceLangMap } from '@/lang/I18N';

import EmissionGwp from '../../index';
import { getGreenhouseGasOptions } from '../../service';
import type { EmissionGwpValue, GreenhouseGasGroup } from '../../types';
import styles from './index.module.less';

const GwpField = observer(
  ({ readOnly, disabled }: { readOnly: boolean; disabled: boolean }) => {
    const form = useForm<EmissionGwpValue>();
    const { locale } = useContext(LocaleContext);
    const [options, setOptions] = useState<GreenhouseGasGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
      if (readOnly) {
        setLoading(false);
        setFailed(false);
        return;
      }
      const controller = new AbortController();
      setLoading(true);
      setFailed(false);
      setOptions([]);
      getGreenhouseGasOptions(serviceLangMap[locale], controller.signal)
        .catch(() => {
          if (!controller.signal.aborted) setFailed(true);
          return [];
        })
        .then(data => {
          if (controller.signal.aborted) return;
          setOptions(data);
          // Only initialize an untouched record; saved values and user input win.
          if (
            form.values.greenhouseGas === undefined &&
            form.values.gwpValue === undefined
          ) {
            const co2 = data
              .flatMap(group => group.children)
              .find(option => option.value === 'CO2');
            form.setValues({
              greenhouseGas: co2?.value ?? 'CO2',
              gwpValue: co2?.gwpValue ?? '1',
            });
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
      return () => controller.abort();
    }, [form, locale, readOnly, retry]);

    return (
      <Spin spinning={loading}>
        <EmissionGwp
          value={{
            greenhouseGas: form.values.greenhouseGas ?? 'CO2',
            gwpValue: form.values.gwpValue ?? '1',
          }}
          onChange={value => {
            form.setValues(value);
            form.modified = true;
          }}
          readOnly={readOnly}
          disabled={disabled || loading}
          options={options}
        />
        {failed && (
          <Button type='link' onClick={() => setRetry(value => value + 1)}>
            加载失败，重试
          </Button>
        )}
        {form.errors
          .filter(
            error =>
              error.path === 'gwpValue' || error.path === 'greenhouseGas',
          )
          .map(error => (
            <div className={styles.error} role='alert' key={error.path}>
              {error.messages?.join('，')}
            </div>
          ))}
      </Spin>
    );
  },
);

export default GwpField;
