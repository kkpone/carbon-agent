import { getDictList } from '@src/views/carbonFootprint3/discharge/process/service';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useDataSource = (key: string) => {
  const { data: resultData } = useQuery(
    [key],
    async () =>
      getDictList<string>({
        dictTypes: key,
      }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const originList = useMemo(
    () =>
      resultData?.data.data[key].map(({ dictValue, dictLabel }) => ({
        value: dictValue,
        label: dictLabel,
      })) || [],
    [resultData, key],
  );

  return [originList];
};
