export interface Certificate {
  name: string;
  lockPic: string;
  unlockPic: string;
  stylePic: string;
  showType: number;
  periodBegin: string;
  periodEnd: string;
  conditionList: Condition[];
}

interface Condition {
  sceneId: number;
  conditionValue: string;
}
