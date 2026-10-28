import I18N from '@src/lang/I18N';
import { Table, Modal } from 'antd';
import { PaginationProps } from 'antd/es/pagination';
import { TableProps } from 'antd/lib/table';
import { useCallback, useEffect, useState } from 'react';

// import { EmissionFactor } from '@/views/greenMeeting/service';
import { PageResponseData } from '../../typings';
import { removeRepeat } from '../../utils';
import SearchForm from '../../views/components/SearchForm';

interface CheckTableType<T> extends TableProps<T> {
  columsData: any[];
  formList: any[];
  dataSource: T[];
  outList: any[];
  page: PageResponseData;
  visible: boolean;
  onHandleOk: (list: any) => void;
  closeModel: (show: boolean) => void;
  tableOnChange: (page: PaginationProps) => void;
  onSearch: (params: any) => void;
}

function CheckTable<T extends { [key: string]: any }>(
  props: CheckTableType<T>,
) {
  const {
    columsData,
    dataSource,
    page,
    formList,
    visible,
    outList,
    onHandleOk,
    closeModel,
    tableOnChange,
    onSearch,
  } = props;

  const [pagination, setPagination] = useState<PaginationProps | null>(
    page === null
      ? null
      : {
          current: page.page,
          pageSize: page.size,
          showSizeChanger: true,
        },
  );
  //   const [factorList, setFactorList] = useState<EmissionFactor[]>([]);
  const [tmpFactortMap, setTmpFactortMap] = useState(new Map());
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onChange = useCallback((pageParams: PaginationProps) => {
    setPagination({ ...pageParams });
    tableOnChange(pageParams);
  }, []);

  useEffect(() => {
    const curKeys = outList.map(item => item.factorId);
    if (curKeys) {
      setSelectedRowKeys(Array.from(curKeys || []));
    } else {
      const factorIds = outList.map(item => item.factorId);

      tmpFactortMap.set(
        `key${page.page}`,
        factorIds.map(item => String(item)),
      );
      //   // 当前选中的
      const currentSelectId = tmpFactortMap.get(`key${page.page}`);
      setSelectedRowKeys(Array.from(currentSelectId || []));
    }
  }, [outList]);
  useEffect(() => {
    if (page !== null) {
      setPagination({
        current: page.page,
        pageSize: page.size,
        showSizeChanger: true,
      });
    }
  }, [page]);
  return (
    <Modal
      title={I18N.components.selectionFactor}
      open={visible}
      onOk={() => {
        const tmpArr: any[] = [];
        tmpFactortMap.forEach((item: any, key) => {
          if (!Number.isNaN(Number(key))) {
            tmpArr.push(...item);
          }
        });

        const list: any = removeRepeat(
          // @ts-ignore
          [...tmpArr, ...outList],
          'factorId',
        );

        onHandleOk(list);
        // setFactorList([...list]);
        closeModel(false);
      }}
      onCancel={() => {
        // setModalVisible(false);
        tmpFactortMap.clear();
        setTmpFactortMap(tmpFactortMap);
        closeModel(false);
      }}
      width={1200}
    >
      <SearchForm formList={formList} onSearch={params => onSearch(params)} />
      <Table
        columns={columsData}
        dataSource={dataSource}
        rowKey={item => `${item.id}`}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onSelect: (row, isSelect) => {
            if (!isSelect) {
              const facIndex = outList.findIndex(
                (item: any) => String(item.factorId) === String(row.factorId),
              );
              facIndex >= 0 && outList.splice(facIndex, 1);
            }
          },
          onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
            const factorIds = outList.map(item => item.factorId);

            let setItem = [];
            // if (factorIds.length) {
            setItem = selectedRows.map((item: any) => {
              if (factorIds.includes(item.id)) {
                const index = factorIds.findIndex(
                  id => String(id) === String(item.id),
                );
                return outList[index];
              }
              return item;
            });

            tmpFactortMap.set(page.page, setItem);
            tmpFactortMap.set(`key${page.page}`, selectedRowKeys);

            setTmpFactortMap(tmpFactortMap);
            setSelectedRowKeys(selectedRowKeys);
          },
        }}
        onChange={onChange}
        pagination={
          page === null
            ? false
            : {
                ...pagination,
                total: page === null ? 0 : page.dataTotal,
              }
        }
      />
    </Modal>
  );
}
export default CheckTable;
