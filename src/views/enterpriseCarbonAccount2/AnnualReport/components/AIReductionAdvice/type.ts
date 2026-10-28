export type CarbonReport = {
  organizationEmissionInfo: string; // e.g. "某公司，2024年 总排放量 66tCO₂e"

  analysisPoints: string[]; // 分析要点的自然语言列表

  reductionSuggestions: {
    suggestionTitle: string; // 建议标题，例如 “优化交通与通勤模式”
    suggestionContent: string[]; // 建议内容，具体的减排措施描述
  }[];

  reductionMeasures: {
    measureid: string; // 措施ID，字符串类型
    measurename: string; // 措施名称，例如 “屋顶光伏”
  }[];
};
