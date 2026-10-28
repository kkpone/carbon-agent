import { Field } from '@formily/core';
import { request } from '@src/api/request';

const useFieldFlattenUnitDictSource =
  (dictTypes: string, options?: { key?: string }) => async (field: Field) => {
    try {
      field.setState({ loading: true });
      const { data } = await request<{
        data: { [P: string]: { dictValue: string; dictLabel: string }[] };
      }>({
        url: `/management/system/enum/listALLByDictTypeBatch`,
        method: 'GET',
        params: { dictTypes },
        debounced: true,
      });
      const unitDataSource = data?.data[options?.key ?? dictTypes] || [];
      field.setDataSource(
        unitDataSource.map(item => ({
          ...item,
          value: item.dictValue,
          label: item.dictLabel,
        })),
      );
      field.setState({ loading: false });
    } catch (e) {
      field.setState({ loading: false });
      throw e;
    }
  };

export default useFieldFlattenUnitDictSource;
