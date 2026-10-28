/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-22 15:25:07
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-07 11:38:30
 */
import I18N from '@src/lang/I18N';
import { Modal, Table, TableColumnsType, Radio, Button } from 'antd';
import { isNil } from 'lodash-es';
import React, { useEffect, useState } from 'react';

import { STANDARD } from '../constant';
import styles from '../index.module.less';
import { getDataQuantityDetail } from '../service';
import { InfoData } from '../type';

type DetailsModalProps = {
  visible: boolean;
  year?: number;
  orgId?: number;
  onClose: () => void;
};

const DetailsModal: React.FC<DetailsModalProps> = ({
  visible,
  year,
  orgId,
  onClose,
}) => {
  const [type, setType] = useState<number>(STANDARD.GHG);

  const [dataList, setDataList] = useState<InfoData[]>([]);

  const [loading, setLoading] = useState(false);

  const genTableColumns = () => {
    const columns: TableColumnsType<InfoData> = [
      {
        title:
          type === STANDARD.GHG
            ? I18N.enterpriseCarbonAccount2.range
            : I18N.carbonFootprint3.category,
        dataIndex: 'category',
        onCell: ({ category, categoryRowStart, categoryCountMap }) => ({
          rowSpan: categoryRowStart ? categoryCountMap[category] : 0,
        }),
      },
      {
        title: I18N.carbonFootprint.emissionType,
        dataIndex: 'classify',
        onCell: ({ classify, classifyRowStart, classifyCountMap }) => ({
          rowSpan: classifyRowStart ? classifyCountMap[classify] : 0,
        }),
      },
      {
        title: I18N.carbonFootprint3.emissionSourceName,
        dataIndex: 'name',
      },
      {
        title: I18N.enterpriseCarbonAccount2.emissionUnits,
        dataIndex: 'emissionQuantity',
      },
      {
        title: I18N.carbonFootprint3.emissionProportion,
        dataIndex: 'emissionQuantityRatio',
        render: text => (isNaN(text) ? text : `${text}%`),
      },
    ];
    return columns;
  };

  useEffect(() => {
    if (visible && !isNil(year) && !isNil(orgId)) {
      setLoading(true);
      getDataQuantityDetail({
        type,
        period: year.toString(),
        orgId,
      })
        .then(resp => {
          const data: InfoData[] = [];

          const categoryCountMap: Record<string, number> = {};
          const classifyCountMap: Record<string, number> = {};

          resp.data.data.forEach(({ category, classify, nameCategoryData }) => {
            nameCategoryData.forEach(item => {
              const categoryRowStart = isNil(categoryCountMap[category]);
              const classifyRowStart = isNil(classifyCountMap[classify]);

              if (categoryRowStart) {
                categoryCountMap[category] = 1;
              } else {
                categoryCountMap[category] += 1;
              }

              if (classifyRowStart) {
                classifyCountMap[classify] = 1;
              } else {
                classifyCountMap[classify] += 1;
              }

              data.push({
                ...item,
                category,
                classify,
                categoryCountMap,
                classifyCountMap,
                categoryRowStart,
                classifyRowStart,
              });
            });
          });
          setDataList(data);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDataList([]);
    }
  }, [type, orgId, year, visible]);

  useEffect(() => {
    if (!visible) {
      setType(STANDARD.GHG);
    }
  }, [visible]);

  return (
    <Modal
      className={styles.detailsModal}
      width={1024}
      title={I18N.enterpriseCarbonAccount2.detailData}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <div className={styles.detailsModalContent}>
        <Radio.Group
          className={styles.detailsModalRadio}
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <Radio.Button value={STANDARD.GHG}>
            {I18N.enterpriseCarbonAccount2.ghgPr2}
          </Radio.Button>
          <Radio.Button value={STANDARD.ISO}>
            {I18N.enterpriseCarbonAccount2.isoStandard}
          </Radio.Button>
        </Radio.Group>
        <div className={styles.modalTableContent}>
          <Table
            className={styles.modalTable}
            columns={genTableColumns()}
            loading={loading}
            dataSource={dataList}
            pagination={false}
            bordered
          />
        </div>
        <div className={styles.modalFooter}>
          <Button onClick={onClose}>{I18N.carbonFootprint3.close}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default DetailsModal;
