import { FormItem, Input } from '@formily/antd-v5';
import { Field, FormConsumer } from '@formily/react';
import I18N from '@/lang/I18N';
import { QUICK_ACCOUNT_EMISSION } from '@/views/carbonFootprint3/constant';

import { EmissionDescriptionMatchControls } from '@/views/carbonFootprint3/components/EmissionDescriptionMatch';

import styles from './index.module.less';

/** 主排放源描述与重新匹配入口共用当前表单，匹配仍读取 remark。 */
// 当前口径：描述使用独立 emissionSourceDescription，旧 remark 不再展示或用于匹配。
const EmissionDescriptionSection = ({
  readPretty,
  onlyCreateFactor,
  loading,
  onMatch,
}: {
  readPretty?: boolean;
  onlyCreateFactor?: boolean;
  loading?: boolean;
  onMatch?: () => void;
}) => (
  <FormConsumer>
    {form => {
      const isTransport = form.values.type === QUICK_ACCOUNT_EMISSION.TRANS;
      return (
        <section className={styles.descriptionSection} hidden={isTransport}>
          <div className={styles.header}>
            <span className={styles.title}>
              {I18N.ilcd.emissionSourceDescription}
            </span>
            {onMatch && (
              <EmissionDescriptionMatchControls
                readPretty={readPretty}
                onlyCreateFactor={onlyCreateFactor}
                loading={loading}
                onMatch={onMatch}
                buttonOnly
              />
            )}
          </div>
          <p className={styles.hint}>
            {I18N.ilcd.emissionDescriptionMatchHint}
          </p>
          <Field
            name='emissionSourceDescription'
            display={isTransport ? 'hidden' : 'visible'}
            decorator={[FormItem]}
            component={[
              Input.TextArea,
              {
                'aria-label': I18N.ilcd.emissionSourceDescription,
                rows: 3,
                maxLength: 200,
                count: {
                  max: 200,
                  show: false,
                  exceedFormatter: (value: string) => value.slice(0, 200),
                },
                placeholder: I18N.ilcd.emissionSourceDescriptionPlaceholder,
              },
            ]}
          />
        </section>
      );
    }}
  </FormConsumer>
);

export default EmissionDescriptionSection;
