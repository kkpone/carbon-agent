import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Modal, Table, TableColumnsType, Input } from 'antd';
import { debounce } from 'lodash-es';
import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './index.module.less';
import { EMISSION_TYPE_LABEL, ENABLE_STATUS, PARAM_TYPE } from '../constant';
import { getParamList } from '../service';

type ParamSelectModalProps = {
  selectedParams: { id: number; name: string }[];
  open: boolean;
  onClose: () => void;
  onConfirm: (params: { id: number; name: string }[]) => void;
};

const ParamSelect = forwardRef<
  { selectedParams: { id: number; name: string }[] },
  Omit<ParamSelectModalProps, 'open' | 'onClose' | 'onConfirm'>
>(({ selectedParams: selectedParamsProp }, ref) => {
  const [selectedParams, setSelectedParams] = useState(selectedParamsProp);

  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    name?: string;
    status?: number;
  }>({ pageNum: 1, pageSize: 10, status: ENABLE_STATUS.ENABLE });

  const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({ selectedParams }), [selectedParams]);

  const onSearch = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({ ...searchParams, name, pageNum: 1 });
      }, 300),
    [searchParams],
  );

  const columns: TableColumnsType<Record<string, any>> = [
    {
      title: I18N.emission.parameterName,
      dataIndex: 'name',
      width: 120,
      ellipsis: true,
    },
    {
      title: I18N.enterpriseCarbonAccount2.parameterType,
      dataIndex: 'emissionType',
      width: 100,
      ellipsis: true,
      render: (emissionType: number) => EMISSION_TYPE_LABEL[emissionType],
    },
    {
      title: I18N.enterpriseCarbonAccount2.defaultValue,
      dataIndex: 'defaultValue',
      width: 100,
      ellipsis: true,
      render: text => text ?? '-',
    },
    {
      title: I18N.carbonFootprint.unit,
      dataIndex: 'unitName',
      width: 100,
      ellipsis: true,
      render: (_, record) => {
        const { paramType, unitName } = record;
        if (paramType === PARAM_TYPE.PERCENT) {
          return '%';
        }
        return unitName || '-';
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    getParamList(searchParams)
      .then(({ data }) => {
        setDataSource(data.rows);
        setTotal(data.total);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  return (
    <div className={styles.paramSelect}>
      <div className={styles.paramTableContent}>
        <Input
          className={styles.searchInput}
          prefix={<SearchOutlined className={styles.searchIcon} />}
          placeholder={I18N.components.search}
          onChange={e => onSearch(e.target.value)}
        />
        <Table
          rowKey='id'
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: searchParams.pageSize,
            current: searchParams.pageNum,
            total,
            showSizeChanger: false,
            showTotal: () =>
              I18N.template(I18N.enterpriseCarbonAccount2.totalTota11, {
                val1: total,
              }),
            onChange: (page, pageSize) => {
              setSearchParams({ ...searchParams, pageNum: page, pageSize });
            },
          }}
          rowSelection={{
            selectedRowKeys: selectedParams.map(item => item.id),
            preserveSelectedRowKeys: true,
            onChange: (ids, selectedRows) => {
              setSelectedParams(
                selectedRows.map((item, index) =>
                  item
                    ? { id: item.id, name: item.name }
                    : (selectedParams.find(
                        param => param.id === ids[index],
                      ) as unknown as { id: number; name: string }),
                ),
              );
            },
          }}
        />
      </div>
      <div className={styles.selectedParamsContent}>
        <div className={styles.countRow}>
          <span className={styles.countText}>{I18N.components.selected2}</span>
          <span className={styles.countValue}>{selectedParams.length}</span>
          <span className={styles.countText}>{I18N.workbench.strip}</span>
        </div>
        {selectedParams.map(param => (
          <div key={param.id} className={styles.paramItem}>
            <div className={styles.paramName} title={param.name}>
              {param.name}
            </div>
            <IconAlibabaNew
              className={styles.closeIcon}
              type='icon-icon-guanbi'
              onClick={() => {
                setSelectedParams(
                  selectedParams.filter(item => item.id !== param.id),
                );
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

const ParamSelectModal: FC<ParamSelectModalProps> = ({
  open,
  selectedParams = [],
  onClose,
  onConfirm,
}) => {
  const paramSelectRef = useRef<{
    selectedParams: { id: number; name: string }[];
  }>(null);

  return (
    <Modal
      title={I18N.enterpriseCarbonAccount2.addParameters}
      width={956}
      open={open}
      destroyOnClose
      onClose={onClose}
      onCancel={onClose}
      onOk={() => {
        onConfirm(paramSelectRef.current?.selectedParams || []);
      }}
    >
      <ParamSelect ref={paramSelectRef} selectedParams={selectedParams} />
    </Modal>
  );
};

export default ParamSelectModal;
