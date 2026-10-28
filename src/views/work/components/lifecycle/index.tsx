import { Tooltip } from 'antd';
import classNames from 'classnames';
import { FC, useContext } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { LocaleType } from '@/lang/I18N';

import styles from './index.module.less';
import type { TProductData } from '../../service';

interface ILifecycleProps {
  data?: TProductData['chartStage'];
}

const colorArray = ['#0CBF9F', '#048677', '#026961', '#004541', '#002A23'];

export const LifecycleChart: FC<ILifecycleProps> = props => {
  const { data } = props;

  const { locale } = useContext(LocaleContext);
  return (
    <div
      className={classNames(styles.scrollWrapper, {
        [styles.enWrapper]: locale === LocaleType.enUS,
      })}
    >
      <div className={styles.wrapper}>
        {data?.map((item, index) => (
          <Tooltip
            color='#fff'
            key={item.name}
            title={
              <div
                style={{
                  color: '#000',
                }}
              >
                {item.name}: {item.rate}% {item.total}
              </div>
            }
          >
            <div
              className={classNames(styles.item, {
                [styles.enItem]: locale === LocaleType.enUS,
              })}
            >
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemColorWrapper}>
                <div
                  className={styles.itemColor}
                  style={{
                    width: `${item.rate}%`,
                    backgroundColor: colorArray[index % 12],
                  }}
                />
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
