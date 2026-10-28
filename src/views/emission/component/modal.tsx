/**
 * visible 控制弹窗显隐
 * selectKeys 表格中已经选中的弹窗
 * onCancel 弹窗取消的方法
 * onConfime 弹窗确认时的方法
 */
import I18N from '@src/lang/I18N';
import useSyncCallback from '@utils/useSyncCallback';
import SearchForm, { SearchFormItem } from '@views/components/SearchForm';
import { Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RcFile } from 'antd/lib/upload/interface';
import { FC, useEffect, useMemo, useState } from 'react';

import style from './modal.module.scss';
import {
  apiListALLByDictTypeBatch,
  apiQsueryListBylableh,
  apiSourceList2,
} from '../Show/service';
import { useIndexColumn } from '../utils';

type SearchParams = {
  businessName?: string;
  businessLabel?: string;
  status?: string;
  is_forbid?: boolean;
  dict_data_name?: string;
  dict_data_value?: string;
  dictValue?: string;
  dictLabel?: string;
  name?: string;
  factorType?: string;
  auditStatus?: string;
  institution?: string;
  source?: string;
};

type TableRows = {
  id: string;
  sourceType?: string | number | undefined;
  sourceName?: string | undefined;
  dictValue?: string | undefined;
  dictLabel?: string | undefined;
  sourceFileList?: {
    uid: string;
    name: string;
    status?: 'done' | 'error' | 'success' | 'uploading' | 'removed';
    url?: string;
    originFileObj?: RcFile;
  }[];
};
interface EmissionModelProps {
  visible: boolean;
  selectKeys?: React.Key[];
  onCancel: () => void;
  onConfime: (value: React.Key[]) => void;
  currentLabel?: string; // business表示行业标签 labelFactor 因子标签
  onConfimeRow?: (value: TableRows[]) => void;
}

const EmissionModel: FC<EmissionModelProps> = ({
  visible,
  selectKeys,
  onCancel,
  onConfime,
  currentLabel,
  onConfimeRow,
}) => {
  const [pageNum, setPageNum] = useState<number>(1);
  const pageSize = 10;
  const [pageCount, setPageCount] = useState<number>(10);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [currentRow, changeCurrentRow] = useState<TableRows[]>([]);
  const [selectedResourceRowKeys, setSelectedResourceRowKeys] = useState<
    React.Key[]
  >([]);

  const [menList, getMenuList] = useState([]);
  const [BranchList, getBranchList] = useState<{
    factorLabel?: {
      // 因子标签
      dictLabel: string;
      dictSort?: string;
      dictType?: string;
      sourceName: string;
      id: string;
      sourceType?: string;
    }[];
    business?: {
      // 行业标签
      dictLabel: string;
      dictSort?: string;
      dictType?: string;
      sourceName: string;
      id: string;
      sourceType?: string;
    }[];
  }>({});

  // 分类列表
  const apiListALLByDictTypeBatchFn = async () => {
    await apiListALLByDictTypeBatch({
      dictTypes: currentLabel || 'factorLabel',
    }).then(({ data }) => {
      getBranchList({ ...data.data });
    });
  };
  // 枚举值
  const apiQsueryListBylablehFn = async () => {
    if (currentLabel === 'source') {
      await apiSourceList2({
        ...searchParams,
        pageNum,
        pageSize: 1000000,
      }).then(({ data }) => {
        getMenuList([...data.rows]);
        setPageCount(data.total);
      });
      return;
    }
    await apiQsueryListBylableh({
      dictType: currentLabel || 'factorLabel',
      ...searchParams,
      pageNum,
      pageSize: 10000000,
    }).then(({ data }) => {
      getMenuList([...data.rows]);
      setPageCount(data.total);
    });
  };
  const syncCallbackFn = useSyncCallback(apiQsueryListBylablehFn);
  useEffect(() => {
    apiListALLByDictTypeBatchFn();
    syncCallbackFn();
    if (selectKeys) {
      setSelectedResourceRowKeys([...selectKeys]);
    }
    return () => {
      getMenuList([]);
      setSelectedResourceRowKeys([]);
      setPageNum(1);
    };
  }, [selectKeys, currentLabel, visible]);
  type Column = {
    id: string;
    sourceType?: string | number;
    sourceName?: string;
    dictValue?: string;
    dictLabel?: string;
  };
  const order = useIndexColumn<Column>((pageNum - 1) * pageSize);
  const columns: ColumnsType<Column> = [
    ...order,
    {
      title:
        currentLabel === 'business'
          ? I18N.emission.industry
          : I18N.emission.labelName,
      dataIndex: 'dictLabel',
      key: 'dictLabel',
    },
    {
      title:
        currentLabel === 'business'
          ? I18N.emission.industryCategories
          : I18N.emission.labelClassification,
      dataIndex: 'sourceName',
      key: 'sourceName',
    },
  ];
  const newColums: ColumnsType<Column> = [
    ...order,
    {
      title: I18N.emission.allPublishingInstitutions,
      dataIndex: 'institution',
      key: 'institution',
    },
    {
      title: I18N.emission.publishingStructureBrief,
      dataIndex: 'institutionShort',
      key: 'institutionShort',
    },
    {
      title: I18N.emission.sourceFileName,
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: I18N.components.sourceCategory,
      dataIndex: 'sourceLevellable',
      key: 'sourceLevellable',
    },
    {
      title: I18N.carbonFootprint.yearOfPublication,
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: I18N.carbonFootprint.publishingCountryGroups,
      dataIndex: 'countriesLable',
      key: 'countriesLable',
    },
    {
      title: I18N.emission.publishingRegion,
      dataIndex: 'areaLable',
      key: 'areaLable',
    },
  ];
  const formList = useMemo<SearchFormItem[]>(() => {
    if (currentLabel === 'business') {
      return [
        {
          name: 'dictValue',
          placeholder: I18N.emission.industryCategories,
          label: I18N.emission.industryCategories,
          type: 'Select',
          searchOptionData: BranchList.business,
        },
      ];
    }
    if (currentLabel === 'factorLabel') {
      return [
        {
          name: 'dictLabel',
          placeholder: I18N.emission.labelName,
          label: I18N.emission.labelName,
          type: 'Input',
        },
        {
          name: 'dictValue',
          placeholder: I18N.emission.labelClassification,
          label: I18N.emission.labelClassification,
          type: 'Select',
          searchOptionData: BranchList.factorLabel,
        },
      ];
    }
    if (currentLabel === 'source') {
      return [
        {
          name: 'institution',
          placeholder: I18N.carbonFootprint.publishingInstitution,
          label: I18N.carbonFootprint.publishingInstitution,
          type: 'Input',
        },
        {
          name: 'source',
          placeholder: I18N.emission.sourceFileName,
          label: I18N.emission.sourceFileName,
          type: 'Select',
          searchOptionData: BranchList.factorLabel,
        },
      ];
    }
    return [];
  }, [BranchList]);
  const onSearch = (params: SearchParams) => {
    setSearchParams(params);
    setPageNum(1);
    syncCallbackFn();
  };
  const culColumns = () => {
    if (currentLabel === 'source') {
      return newColums;
    }
    return columns;
  };
  const filterMultipleFn = () => {
    if (currentLabel === 'source') {
      return true;
    }
    return false;
  };
  return (
    <Modal
      className={style.modal}
      title={
        currentLabel === 'business'
          ? I18N.emission.selectIndustry
          : I18N.emission.selectLabel
      }
      open={visible}
      onOk={() => {
        if (currentLabel === 'source' && onConfimeRow) {
          onConfimeRow(currentRow);
          return;
        }
        onConfime([...selectedResourceRowKeys]);
      }}
      onCancel={() => onCancel()}
      width={1000}
    >
      <SearchForm
        className={style.searcher}
        formList={formList}
        onSearch={onSearch}
        onClick={() => {}}
      />
      {filterMultipleFn()
        ? visible &&
          menList.length > 0 && (
            <Table
              columns={culColumns()}
              dataSource={menList}
              pagination={{
                pageSize,
                total: pageCount,
                current: pageNum,
                onChange: pageNum => {
                  setPageNum(pageNum);
                },
              }}
              rowKey={item => `${item.id}`}
              rowSelection={{
                selectedRowKeys: selectedResourceRowKeys,
                onChange: (selectedRowKeys: React.Key[], selectedRows) => {
                  setSelectedResourceRowKeys([...selectedRowKeys]);
                  changeCurrentRow([...selectedRows]);
                },
                type: 'radio',
              }}
            />
          )
        : visible &&
          menList.length > 0 && (
            <Table
              columns={culColumns()}
              dataSource={menList}
              pagination={{
                pageSize,
                total: pageCount,
                current: pageNum,
                showSizeChanger: false,
                onChange: pageNum => {
                  setPageNum(pageNum);
                },
              }}
              rowKey={item => `${item.dictValue ? item.dictValue : 0}`}
              rowSelection={{
                selectedRowKeys: selectedResourceRowKeys,
                onChange: (selectedRowKeys: React.Key[]) => {
                  setSelectedResourceRowKeys([...selectedRowKeys]);
                },
                type: 'checkbox',
              }}
            />
          )}
    </Modal>
  );
};

export default EmissionModel;
