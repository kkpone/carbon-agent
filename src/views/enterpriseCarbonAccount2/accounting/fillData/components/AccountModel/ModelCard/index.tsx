import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { FC } from 'react';

import plusCircleFilledImg from '@/assets/svg/plus_circle_filled.svg';
import { IconAlibaba } from '@/components/iconfont';

import styles from './index.module.less';
import { MODEL_TYPE } from '../constant';
import { ListModel } from '../type';

type ModelCardProps = {
  model: ListModel;
  onPreview: (model: ListModel) => void;
  onApply: (model: ListModel) => void;
};

const ModelCard: FC<ModelCardProps> = ({ model, onPreview, onApply }) => {
  const {
    modelType,
    name,
    year,
    desc,
    scopeOneCount,
    scopeTwoCount,
    scopeThreeCount,
  } = model;

  return modelType === MODEL_TYPE.EMPTY ? (
    <div className={styles.emptyModel} onClick={() => onApply(model)}>
      <img alt='' src={plusCircleFilledImg} />
      <div className={styles.emptyModelDesc}>
        {I18N.enterpriseCarbonAccount2.useBlankMold}
      </div>
    </div>
  ) : (
    <div className={styles.model}>
      {modelType === MODEL_TYPE.ACCOUNT && (
        <div className={styles.tag}>
          {I18N.enterpriseCarbonAccount2.historicalAccounting}
        </div>
      )}
      <div className={styles.modelHeader}>
        <div className={styles.modelNameContent}>
          <IconAlibaba className={styles.modelIcon} type='icon-icon_model1' />
          <div className={styles.modelName} title={name}>
            {name}
          </div>
        </div>
        <div className={styles['caption-s']}>{year}</div>
      </div>
      <div className={styles.modelDesc} title={desc}>
        {desc}
      </div>
      <div className={styles.modelEmission}>
        <div className={styles.modelEmissionItem}>
          <div className={styles['caption-s']}>
            {I18N.enterpriseCarbonAccount2.scopeOne}
          </div>
          <div className={styles.emission}>{scopeOneCount}</div>
        </div>
        <div className={styles.modelEmissionSplit} />
        <div className={styles.modelEmissionItem}>
          <div className={styles['caption-s']}>
            {I18N.enterpriseCarbonAccount2.scope2}
          </div>
          <div className={styles.emission}>{scopeTwoCount}</div>
        </div>
        <div className={styles.modelEmissionSplit} />
        <div className={styles.modelEmissionItem}>
          <div className={styles['caption-s']}>
            {I18N.enterpriseCarbonAccount2.fanWeisan}
          </div>
          <div className={styles.emission}>{scopeThreeCount}</div>
        </div>
      </div>
      <div className={styles.modelOperate}>
        <Button onClick={() => onPreview(model)}>
          {I18N.carbonFootprint3.preview}
        </Button>
        <Button className={styles.useBtn} onClick={() => onApply(model)}>
          {I18N.carbonFootprint3.apply}
        </Button>
      </div>
    </div>
  );
};

export default ModelCard;
