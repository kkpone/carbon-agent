import { apiCity } from '@src/api/api';
import { Citys } from '@src/api/types';
import { useQuery } from '@tanstack/react-query';

type TransCityData = Citys & {
  label: string;
  value: string;
  children: TransCityData[];
};

function TransformCityData(cityData: Citys[]): TransCityData[] {
  return cityData.map(item => ({
    ...item,
    label: item.name,
    value: item.code,
    children: item.children ? TransformCityData(item.children) : [],
  }));
}

export const useCityInfo = (level = 3) => {
  const { data } = useQuery({
    queryKey: ['cityInfo', level],
    queryFn: () => apiCity(level),
    cacheTime: 1000 * 60 * 60,
    staleTime: 1000 * 60 * 60,
    keepPreviousData: true,
  });
  return data ? TransformCityData(data) : [];
};
