import I18N from '@src/lang/I18N';
import { NumberPicker } from '@formily/antd-v5';
import { Input, Table, TableColumnsType } from 'antd';
import { FC, memo, ReactElement, useEffect, useState } from 'react';

import { CustomDrawer } from '@/components/CustomDrawer';
import { Toast } from '@/utils';

import { editDetails, getDetails } from './service';
import styles from './travelDetails.module.less';

const EditableCell = memo(
  ({ value, onBlur }: { value: string; onBlur: (val: string) => void }) => {
    const [internalValue, setInternalValue] = useState(value);

    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    return (
      <Input
        className={styles.dataInput}
        value={internalValue}
        onChange={e => setInternalValue(e.target.value)}
        onBlur={() => onBlur(internalValue)}
      />
    );
  },
);

const TravelDetails: FC<{ record: Record<string, any> }> = ({ record }) => {
  const [list, setList] = useState<Record<string, any>[]>([]);

  const [pager, setPager] = useState({ pageNum: 1, pageSize: 10 });

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const { id } = record;

  const isTravel = record.type === 0;

  const editRecord = async data => {
    await editDetails(data);
    Toast('success', I18N.carbonFootprint.editSuccessful);
    setPager({ ...pager });
  };

  const columns: TableColumnsType<Record<string, any>> = isTravel
    ? [
        {
          title: I18N.enterpriseCarbonAccount2.origin,
          dataIndex: 'startLocation',
          width: 162,
          render: (_, data) => (
            <EditableCell
              value={data.startLocation}
              onBlur={startLocation => {
                Object.assign(data, { startLocation });
                editRecord(data);
              }}
            />
          ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.destination,
          dataIndex: 'endLocation',
          width: 162,
          render: (_, data) => (
            <EditableCell
              value={data.endLocation}
              onBlur={endLocation => {
                Object.assign(data, { endLocation });
                editRecord(data);
              }}
            />
          ),
        },
        {
          title: I18N.enterpriseCarbonAccount2.distanceInKilometers,
          dataIndex: 'activityData',
          width: 140,
          render: (_, data) => (
            <NumberPicker
              className={styles.dataInput}
              value={data.activityData}
              placeholder={I18N.enterpriseCarbonAccount2.distance}
              min={0}
              controls={false}
              onChange={val => {
                Object.assign(data, { activityData: val });
                setList([...list]);
              }}
              onBlur={() => {
                setTimeout(() => {
                  editRecord(data);
                });
              }}
            />
          ),
        },
      ]
    : [
        {
          title: I18N.enterpriseCarbonAccount2.accommodationDays,
          dataIndex: 'activityData',
          width: 100,
          render: (_, data) => (
            <NumberPicker
              className={styles.dataInput}
              value={data.activityData}
              placeholder={I18N.enterpriseCarbonAccount2.days}
              min={0}
              controls={false}
              onChange={val => {
                Object.assign(data, { activityData: val });
                setList([...list]);
              }}
              onBlur={() => {
                setTimeout(() => {
                  editRecord(data);
                });
              }}
            />
          ),
        },
      ];

  useEffect(() => {
    setLoading(true);
    getDetails({ id, ...pager })
      .then(({ data }) => {
        setList(data.rows);
        setTotal(data.total);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pager, id]);

  return (
    <Table
      rowKey='id'
      dataSource={list}
      columns={[
        {
          title: I18N.carbonFootprint.number,
          dataIndex: '__No__',
          width: 70,
          render: (text, _, index) =>
            pager.pageSize * (pager.pageNum - 1) + index + 1,
        },
        {
          title: I18N.carbonNeutral.orderNumber2,
          dataIndex: 'code',
          width: 100,
          ellipsis: true,
        },
        ...columns,
      ]}
      loading={loading}
      pagination={{ total, current: pager.pageNum, pageSize: pager.pageSize }}
      onChange={({ current, pageSize }) => {
        setPager({ pageNum: current || 1, pageSize: pageSize || 10 });
      }}
    />
  );
};

const TravelDetailsDrawer: FC<{
  children: ReactElement;
  record: Record<string, any>;
  onClose: () => void;
}> = ({ children, record, onClose }) => {
  const [open, setOpen] = useState(false);

  const isTravel = record.type === 0;

  return (
    <>
      <CustomDrawer
        title={I18N.template(I18N.enterpriseCarbonAccount2.recor2, {
          val1: record.name,
          val2: record.facility,
        })}
        open={open}
        width={isTravel ? 718 : 514}
        destroyOnClose
        onClose={() => {
          setOpen(false);
          onClose();
        }}
      >
        <TravelDetails record={record} />
      </CustomDrawer>
      <div onClick={() => setOpen(true)}>{children}</div>
    </>
  );
};

export default TravelDetailsDrawer;
