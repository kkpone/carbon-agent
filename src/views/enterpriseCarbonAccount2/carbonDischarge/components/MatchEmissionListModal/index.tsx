import I18N from '@src/lang/I18N';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { ECOINVENT_TEXT } from '@src/views/carbonFootprint3/constant';
import { GHGSecondSelect } from '@src/views/enterpriseCarbonAccount2/listInfo/util';
import { Button, Modal, TableProps } from 'antd';
import { isNil } from 'lodash-es';
import { VFC, useEffect, useMemo, useState } from 'react';
import { AsyncReturnType } from 'type-fest';

import styles from './index.module.less';
import { getMatchEmissionList } from './service';
import { DictSource } from '../AddEmission/types';

type MatchEmissionListModalProps = {
  visible: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: (emission: DictSource) => void;
  getMatchEmission: typeof getMatchEmissionList;
  rowKey?: string;
};

const MatchEmissionListModal: VFC<MatchEmissionListModalProps> = ({
  name,
  visible,
  onCancel,
  onConfirm,
  getMatchEmission,
  rowKey = 'dictSourceId',
}) => {
  const [selectedEmission, setSelectedEmission] = useState<DictSource | null>(
    null,
  );

  const searchParams = useMemo(() => ({ name }), [name]);

  const tableColumns: TableProps<DictSource>['columns'] = [
    {
      title: I18N.carbonFootprint3.emissionSourceName,
      dataIndex: 'name',
      width: 192,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: I18N.components.emissionFacilityActivity,
      dataIndex: 'facility',
      width: 172,
      ellipsis: true,
    },
    {
      title: I18N.enterpriseCarbonAccount2.ghgClassification2,
      dataIndex: 'ghgClassify',
      width: 172,
      ellipsis: true,
      render: ghgClassify =>
        GHGSecondSelect.find(({ id }) => id === ghgClassify)?.category ||
        ghgClassify,
    },
    {
      title: I18N.carbonFootprint.unit,
      dataIndex: 'activityUnitDesc',
      width: 172,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint.factorValue,
      dataIndex: 'factorValue',
      width: 172,
      ellipsis: true,
      render: (factorValue, record) =>
        shouldHideEcoinventValue(record) ? ECOINVENT_TEXT : factorValue,
    },
    {
      title: I18N.carbonFootprint.updateTime,
      dataIndex: 'updateTime',
      width: 192,
      ellipsis: true,
    },
  ];

  useEffect(() => {
    if (!visible) {
      setSelectedEmission(null);
    }
  }, [visible]);

  return (
    <Modal
      className={styles.matchEmissionModal}
      title={
        <div className={styles.modalTitle}>
          {I18N.enterpriseCarbonAccount2.viewEmissionSources}
          <span className={styles.titleCaption}>
            {I18N.enterpriseCarbonAccount2.youCanDirectly}
          </span>
        </div>
      }
      width={1024}
      open={visible}
      destroyOnClose
      footer={null}
      onCancel={onCancel}
    >
      <div className={styles.content}>
        <CommonTable
          columns={tableColumns}
          searchParams={searchParams}
          pageSize={10}
          rowKey={rowKey}
          scroll={{ x: 976, y: 432 }}
          rowSelection={{
            selectedRowKeys: selectedEmission ? [selectedEmission[rowKey]] : [],
            type: 'radio',
            fixed: 'left',
            columnWidth: 70,
            onChange: (_, emission) => setSelectedEmission(emission[0]),
          }}
          pagination={{ position: ['bottomLeft'] }}
          fetchApi={params =>
            getMatchEmission({
              ...params,
              pageNum: params.page,
              pageSize: params.size,
            })
          }
          returnFetchApi={(
            back: AsyncReturnType<typeof getMatchEmissionList>,
          ) => ({
            data: back.data.rows,
            count: back.data.total,
          })}
        />
        <div className={styles.btnContent}>
          <Button className={styles.cancelBtn} onClick={onCancel}>
            {I18N.carbonFootprint.cancel}
          </Button>
          <Button
            disabled={isNil(selectedEmission)}
            type='primary'
            onClick={() => {
              if (selectedEmission) {
                onConfirm(selectedEmission);
              }
            }}
          >
            {I18N.carbonFootprint3.confirmSelection}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MatchEmissionListModal;
