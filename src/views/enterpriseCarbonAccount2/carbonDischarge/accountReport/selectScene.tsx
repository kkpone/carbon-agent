/**
 * @file 选择场景
 * @author lixingchen
 * */
import I18N from '@src/lang/I18N';
import { useCallback, useEffect, useState } from 'react';
import { Table, Modal } from 'antd';
import { PaginationProps } from 'antd/es/pagination';
import { TableProps } from 'antd/lib/table';
import { removeRepeat } from '@src/utils';
import SearchForm from '@src/views/components/SearchForm';
import { PageResponseData } from '@src/typings';

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

function SelectScene<T extends { [key: string]: any }>(
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
    const lessenEmissionIds = outList.map(item => item.lessenEmissionId);
    const tmpArr: any = [];
    tmpFactortMap.forEach((item: any, key) => {
      if (Number.isNaN(Number(key))) {
        tmpArr.push(...item);
      }
    });

    const list: any = [...new Set([...tmpArr, ...lessenEmissionIds])];
    // if (list) {
    setSelectedRowKeys(list);
    // } else {
    // const lessenEmissionIds = outList.map(item => item.lessenEmissionId);

    tmpFactortMap.set(
      `key${page.page}`,
      list.map(item => Number(item)),
    );
    //   // 当前选中的
    // const currentSelectId = tmpFactortMap.get(`key${page.page}`);

    // setSelectedRowKeys(Array.from(currentSelectId || []));
    // }
  }, [visible, dataSource]);
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
      title={I18N.enterpriseCarbonAccount2.chooseAReductionVenue}
      className='select-scene'
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
          'lessenEmissionId',
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
        // scroll={{ y: '200px' }}
        dataSource={dataSource}
        rowKey={item => item.lessenEmissionId}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onSelect: (row, isSelect) => {
            if (!isSelect) {
              const facIndex = outList.findIndex(
                (item: any) =>
                  String(item.lessenEmissionId) ===
                  String(row.lessenEmissionId),
              );
              facIndex >= 0 && outList.splice(facIndex, 1);
            }
          },
          onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
            const lessenEmissionIds = outList.map(
              item => item.lessenEmissionId,
            );

            let setItem = [];
            // if (lessenEmissionIds.length) {
            setItem = selectedRows.map((item: any) => {
              if (lessenEmissionIds.includes(item.lessenEmissionId)) {
                const index = lessenEmissionIds.findIndex(
                  id => String(id) === String(item.lessenEmissionId),
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
export default SelectScene;
