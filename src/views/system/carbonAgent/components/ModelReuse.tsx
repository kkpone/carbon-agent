import { RedoOutlined, SearchOutlined } from '@ant-design/icons';
import aiModelImage from '@src/assets/images/carbonFootprint3.6.4/AIModel.png';
import aiModelImageEn from '@src/assets/images/carbonFootprint3.6.4/AIModelEn.png';
import checkModelIcon from '@src/assets/images/carbonFootprint3.6.6/checkModelIcon.png';

import style from '../index.module.less';
import I18N from '@src/lang/I18N';

type ReuseModel = {
  date: string;
  emission: string;
  image: string;
  lifecycle: string;
  prompt: string;
  title: string;
  unit: string;
};

type ModelReuseProps = {
  onSelectModel: (message: string) => void;
};

const reuseModels: ReuseModel[] = [
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: aiModelImage,
    lifecycle: '摇篮到大门',
    prompt: '复用书包产品碳足迹模型，帮我按摇篮到大门核算',
    title: '书包',
    unit: '一个书包',
  },
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: aiModelImageEn,
    lifecycle: '摇篮到大门',
    prompt: '复用笔记本电脑产品碳足迹模型，帮我按摇篮到大门核算',
    title: '笔记本电脑',
    unit: '一台电脑',
  },
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: checkModelIcon,
    lifecycle: '摇篮到大门',
    prompt: '复用马克杯产品碳足迹模型，帮我按摇篮到大门核算',
    title: '马克杯',
    unit: '一个马克杯',
  },
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: aiModelImage,
    lifecycle: '摇篮到大门',
    prompt: '复用智能手机产品碳足迹模型，帮我按摇篮到大门核算',
    title: '智能手机',
    unit: '一部手机',
  },
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: aiModelImageEn,
    lifecycle: '摇篮到大门',
    prompt: '复用 LED 护眼台灯产品碳足迹模型，帮我按摇篮到大门核算',
    title: 'LED 护眼台灯',
    unit: '一台台灯',
  },
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: checkModelIcon,
    lifecycle: '摇篮到大门',
    prompt: '复用笔记本电脑产品碳足迹模型，帮我核算并输出关键排放热点',
    title: '笔记本电脑',
    unit: '一台电脑',
  },
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: aiModelImageEn,
    lifecycle: '摇篮到大门',
    prompt: '复用笔记本电脑产品碳足迹模型，并帮我补齐核算边界',
    title: '笔记本电脑',
    unit: '一台电脑',
  },
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: checkModelIcon,
    lifecycle: '摇篮到大门',
    prompt: '复用笔记本电脑产品碳足迹模型，生成一版核算说明',
    title: '笔记本电脑',
    unit: '一台电脑',
  },
  {
    date: '2026-4-20 10:00:00',
    emission: '1.23 kgCO₂e',
    image: aiModelImage,
    lifecycle: '摇篮到大门',
    prompt: '复用智能手机产品碳足迹模型，帮我估算材料与制造阶段',
    title: '智能手机',
    unit: '一部手机',
  },
];

const ModelReuse = ({ onSelectModel }: ModelReuseProps) => (
  <section
    className={style.modelReuseSection}
    aria-labelledby='model-reuse-title'
  >
    <div className={style.modelReuseHeader}>
      <h2 className={style.modelReuseTitle} id='model-reuse-title'>
        {I18N.carbonAgent.modelReuse}
      </h2>
      <div className={style.modelReuseActions}>
        <button
          className={style.modelReuseAction}
          type='button'
          aria-label={I18N.carbonAgent.searchModel}
          title={I18N.carbonAgent.searchModel}
          onClick={() => onSelectModel(I18N.carbonAgent.searchModelMessage)}
        >
          <SearchOutlined />
        </button>
        <button
          className={style.modelReuseAction}
          type='button'
          aria-label={I18N.carbonAgent.refreshModel}
          title={I18N.carbonAgent.refreshModel}
          onClick={() => onSelectModel(I18N.carbonAgent.refreshModelMessage)}
        >
          <RedoOutlined />
        </button>
      </div>
    </div>
    <div className={style.modelReuseGrid}>
      {reuseModels.map(model => (
        <button
          className={style.modelCard}
          key={model.prompt}
          type='button'
          onClick={() => onSelectModel(model.prompt)}
        >
          <div className={style.modelCardHead}>
            <img className={style.modelThumb} src={model.image} alt='' />
            <div className={style.modelTitleBlock}>
              <h3>{model.title}</h3>
              <span>{model.date}</span>
            </div>
          </div>
          <div className={style.modelMetaGrid}>
            <div className={style.modelMetaItem}>
              <span>{I18N.carbonAgent.functionalUnit}</span>
              <strong>{model.unit}</strong>
            </div>
            <div className={style.modelMetaItem}>
              <span>{I18N.carbonAgent.accountingLifeCycle}</span>
              <strong>{model.lifecycle}</strong>
            </div>
            <div className={style.modelMetaItem}>
              <span>{I18N.carbonAgent.emissionAmount}</span>
              <strong>{model.emission}</strong>
            </div>
          </div>
        </button>
      ))}
    </div>
  </section>
);

export default ModelReuse;
