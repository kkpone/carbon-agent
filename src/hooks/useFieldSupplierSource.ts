import { Field } from '@formily/core';
import { request } from '@src/api/request';

const useFieldSupplierSource = (options: { [K: string]: unknown }) => {
  const searchValRef = { val: '', composition: false };

  const resetSearchValRef = () => {
    searchValRef.val = '';
    searchValRef.composition = false;
  };
  return (field: Field) => {
    field.setState({ loading: true });
    field.setComponentProps({
      showSearch: true,
      onSearch: (searchVal: string) => {
        setTimeout(() => {
          if (!searchValRef.composition) {
            searchValRef.val = searchVal;
          }
        });
      },
      filterOption: (inputVal: string, option: { label: string }) =>
        option.label.includes(inputVal),
      onBlur: () => {
        // if (searchValRef.val) {
        //   const newOption = {
        //     value: searchValRef.val,
        //     label: searchValRef.val,
        //     isAdd: true,
        //   };
        //   if (
        //     (field.dataSource || []).every(
        //       ({ value }) => value !== newOption.value,
        //     )
        //   ) {
        //     field.setDataSource([
        //       ...(field.dataSource || []),
        //       { value: searchValRef.val, label: searchValRef.val, isAdd: true },
        //     ]);
        //   }
        //   field.onInput(searchValRef.val);
        // }
        resetSearchValRef();
      },
      onChange: resetSearchValRef,
      onCompositionStart: () => {
        searchValRef.composition = true;
      },
      onCompositionEnd: () => {
        searchValRef.composition = false;
      },
    });

    request<{
      rows: { supplierId: number; companyName: string; email: string }[];
    }>({
      url: `/chain/supplier/list`,
      method: 'GET',
      debounced: true,
      params: { ...options },
    })
      .then(resp => {
        const dataSource = (resp.data.rows || []).map(
          ({ supplierId, companyName, email }) => ({
            value: supplierId,
            label: companyName,
            email,
          }),
        );
        field.setDataSource(dataSource);
      })
      .finally(() => {
        field.setState({ loading: false });
      });
  };
};

export default useFieldSupplierSource;
