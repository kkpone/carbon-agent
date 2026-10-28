/**
 * @file 目标余量
 * **/
import I18N from '@src/lang/I18N';
import { ApisubmissionList } from '@views/carbonDataManagemen/service';
import { Modal, Table, Button } from 'antd';
import { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './style.less';

export interface DataType {
  targetId?: string;
  discharge?: string;
  achieveDischarge?: string;
  residue?: string;
  executeId?: string;
  allotDischarge?: string;
}
interface TargetAllowType {
  isVisable: boolean;
  targetAllowData?: DataType;
  changeIisVisable: (show: boolean) => void;
}
const columns = [
  {
    title: I18N.enterpriseCarbonAccount2.time,
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: I18N.carbonFootprint.name,
    dataIndex: 'subName',
    key: 'subName',
  },
  {
    title: I18N.carbonDataManagemen.reportedBy,
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: I18N.carbonDataManagemen.quantityT,
    dataIndex: 'discharge',
    key: 'discharge',
  },
  {
    title: I18N.carbonDataManagemen.progressRecords,
    dataIndex: 'achieveDischarge',
    key: 'achieveDischarge',
    render: (text, record) => `${text || '-'}/${record.allotDischarge || '-'}`,
  },
];

const TargetAllow: FC<TargetAllowType> = ({
  isVisable,
  targetAllowData,
  changeIisVisable,
}) => {
  const history = useHistory();
  const [dataSource, getDataSource] = useState([]);
  const ApisubmissionListFn = async () => {
    const obj: { targetId?: string; executeId?: string } = {};
    if (history.location.pathname.indexOf('goalSetting') >= 0) {
      obj.targetId = targetAllowData?.targetId || '1';
    } else {
      obj.executeId = targetAllowData?.executeId || '1';
    }

    await ApisubmissionList({
      ...obj,
      pageNum: '1',
      pageSize: '5000',
      subStatus: 1,
    }).then(({ data }) => {
      if (data.code === 200) {
        getDataSource(data.rows);
      }
    });
  };
  useEffect(() => {
    if (isVisable) {
      ApisubmissionListFn();
    }
  }, [targetAllowData, isVisable]);
  return (
    <Modal
      title={I18N.carbonDataManagemen.targetMargin}
      open={isVisable}
      onOk={() => {
        changeIisVisable(false);
      }}
      onCancel={() => {
        changeIisVisable(false);
      }}
      width={700}
      footer={[
        <Button key='back' onClick={() => changeIisVisable(false)}>
          {I18N.carbonFootprint.return}
        </Button>,
      ]}
    >
      <div className='targetAllowt_title'>
        <h3>
          <span>{I18N.carbonDataManagemen.targetTotalAmount}</span>
          <span>
            {targetAllowData?.allotDischarge || targetAllowData?.discharge || 0}
            t
          </span>
        </h3>
        <h3>
          <span>{I18N.carbonDataManagemen.discharged}</span>
          <span>{targetAllowData?.achieveDischarge || 0}t</span>
        </h3>
        <h3>
          <span>{I18N.carbonDataManagemen.remainingQuantity}</span>
          <span>
            {targetAllowData?.residue ||
              (
                Number(
                  targetAllowData?.allotDischarge ||
                    targetAllowData?.discharge ||
                    0,
                ) - Number(targetAllowData?.achieveDischarge)
              ).toFixed(4)}
            t
          </span>
        </h3>
      </div>
      <h4 className='targetAllowt_content_title'>
        {I18N.carbonDataManagemen.progressDetails}
      </h4>
      <Table dataSource={dataSource} columns={columns} />
    </Modal>
  );
};
export default TargetAllow;
