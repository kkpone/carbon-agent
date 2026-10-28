export type CarbonLabelModalInfo = {
  version?: number;
  /** 减碳对象 */
  reduceObj?: {
    perEmission: number | null;
    unitCode: string;
    unitName: string;
    // 减碳说明
    reduceDesc: string;
    reducePic?: string;
  };
  /** 碳抵消对象 */
  offsetObj?: {
    perEmission: number | null;
    unitCode: string;
    unitName: string;
    scopeType: number;
    startTime?: string;
    endTime?: string;
    /** 批次范围 */
    offsetBatch?: string;
    /** 编号范围 */
    offsetCodes?: string;
    offsetPic?: string;
  };
};
