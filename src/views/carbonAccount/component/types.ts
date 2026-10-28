export type GMapProps = {
  points: number[];
  pointName?: string;
  className?: string;
  circleRadius?: number;
  onPointChange?: (params: GMapChangeParams) => Promise<any>;
};

export type GMapChangeParams = Omit<GMapProps, 'onPointChange' | 'className'>;

type MapLocation = {
  lat: number;
  lng: number;
};
export interface MapSearchResult {
  info: string;
  count: number;
  tips: Tip[];
}

interface Tip {
  id: string;
  name: string;
  district: string;
  adcode: string;
  location: MapLocation;
  address: string;
  typecode: string;
  city: any[];
}

export type SearchOptions = Tip & { label: string; value: string };
