import { observer, useField } from '@formily/react';
import I18N from '@src/lang/I18N';
import classNames from 'classnames';

import styles from './referStandard.module.less';
import { getFrameList } from './service';

type Option = {
  id: number;
  name: string;
  lgList: { name: string; url: string }[];
};

const ReferStandard = observer<{
  options: Option[];
  value?: number[];
  onChange: (val?: number[]) => void;
}>(props => {
  const { options = [], onChange } = props;
  const value = props.value || [];
  const field = useField();

  field.onMount = () => {
    getFrameList().then(({ data }) => {
      field.setComponentProps({
        options: data.rows,
      });
    });
  };
  return (
    <div className={styles.referStandardContent}>
      {options.map(option => {
        const { id, name, lgList = [] } = option;
        const selected = value.includes(id);
        return (
          <div
            className={classNames(styles.standardItem, {
              [styles.selected]: selected,
            })}
            key={id}
            onClick={() => {
              onChange(selected ? value.filter(i => i !== id) : [...value, id]);
            }}
          >
            <div className={styles.name} title={name}>
              {name}
            </div>
            <div className={styles.logoContent}>
              {lgList.map(logo => (
                <img
                  className={styles.logoImg}
                  key={logo.url}
                  alt={logo.name}
                  src={logo.url}
                />
              ))}
            </div>
          </div>
        );
      })}
      <span className={styles.tip}>{I18N.esg.moreStandardRespect}</span>
    </div>
  );
});

export default ReferStandard;
