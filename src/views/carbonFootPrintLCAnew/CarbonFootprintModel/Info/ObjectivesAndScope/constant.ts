import I18N from '@src/lang/I18N';

import { OptionsType } from '../../type';
import { LIFE_CYCLE_TYPE } from '../constant';

/** 系统边界类型 */
export const SYSTEM_BOUNDARY_TYPE = {
  /** 半生命周期 */
  HALF_LIFE_CYCLE: 1,
  /** 全生命周期 */
  COMPLETE_LIFE_CYCLE: 2,
  /** 自定义生命周期 */
  CUSTOM_LIFE_CYCLE: 3,
} as const;

const { HALF_LIFE_CYCLE, COMPLETE_LIFE_CYCLE, CUSTOM_LIFE_CYCLE } =
  SYSTEM_BOUNDARY_TYPE;

/**
 * @description 获取系统边界option
 * @param lifeCycleList 生命周期阶段
 * @returns 系统边界option
 */
export const systemBoundaryOptionFn = ({
  halfLifeCycleList,
  completeLifeCycleList,
  customLifeCycleList,
}: {
  /** 半生命周期 */
  halfLifeCycleList: OptionsType[];
  /** 全生命周期 */
  completeLifeCycleList: OptionsType[];
  /** 自定义生命周期 */
  customLifeCycleList: OptionsType[];
}) => {
  /** 半生命周期 */
  const halfLiftCycle = halfLifeCycleList?.map(lifeCycle => ({
    ...lifeCycle,
    checked: true,
  }));

  /** 全生命周期 */
  const fullLifecycle = completeLifeCycleList?.map(lifeCycle => ({
    ...lifeCycle,
    checked: true,
  }));

  /** 自定义生命周期 */
  const customLifecycle = customLifeCycleList?.map(lifeCycle => {
    if (lifeCycle.value === LIFE_CYCLE_TYPE.PRODUCTION_STAGE) {
      return { ...lifeCycle, checked: true, disabled: true };
    }
    return { ...lifeCycle };
  });

  return [
    {
      label: I18N.carbonFootPrintLCA.halfLifeCycle,
      describe: I18N.carbonFootPrintLCA.cradleToGate,
      value: HALF_LIFE_CYCLE,
      selectedChildren: halfLiftCycle,
      children: undefined,
      btnDisabled: true,
    },
    {
      label: I18N.carbonFootPrintLCA.fullLifecycle,
      describe: I18N.carbonFootPrintLCA.cradleToTomb,
      value: COMPLETE_LIFE_CYCLE,
      selectedChildren: fullLifecycle,
      children: undefined,
      btnDisabled: true,
    },
    {
      label: I18N.carbonFootPrintLCA.customLife,
      value: CUSTOM_LIFE_CYCLE,
      selectedChildren: undefined,
      children: customLifecycle,
    },
  ];
};

/** 预制内容 */
export const PREFARICATED_CONTENT = {
  /** 研究目标 */
  researchTarget: `（1）产品整个生命周期内的产品碳足迹评估，识别产品碳足迹结果的主要贡献因素；
（2）响应客户请求，向客户提供产品碳足迹评价报告；
（3）符合监管要求，向监管机构提供产品碳足迹声明；
（4）为开展产品碳减排行动，提供内部参考数据。`,
  /** 系统边界描述（中文） */
  systemBoundaryDesc: `原材料获取及预加工阶段从自然界中提取资源开始，加工成产品所使用的组件，经过运输，到产品组件进入到产品的生产设施时结束。
生产制造阶段从产品组件进入生产现场开始，到成品离开生产设施结束。
产品分销阶段从离开工厂大门，经过运输、储存过程，到消费者手中为止。
产品使用阶段从最终用户使用产品开始，到产品离开使用地进入寿命终止阶段为止。
寿命终止处理阶段从产品被废弃开始，到作为废物返回自然或回收利用结束。
以下过程不包含在系统边界内：
生产设备、工厂基础设施等非消耗性资产的建设过程；
生产工厂的辅助投入，例如相关办公室的供暖和照明、员工的商务旅行和通勤；
产品设计、研究和宣传推广等活动。`,
  /** 截至规则 */
  cutoffRule: `可以忽略占系统组件总质量小于1%的原材料、能源和排放物等，舍弃后，应将缺失的质量添加到相关系统组件层级中具有最高占比碳足迹的输入材料上；总截止值不得超过最终产品总质量的3%。`,
};
