/**
 * @description: 产品管理-生命周期数据-详情信息
 */
import { ProTable } from '@ant-design/pro-components';
import { Descriptions, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { FormActions } from '@/components/FormActions';
import { usePageInfo } from '@/hooks';
import I18N from '@/lang/I18N';
import { LCARouteMaps } from '@/router/utils/lcaEnums';
import { useNavigate } from '@/utils/polyfill';

import { processDetailTabelList } from './columns';
import { PROCESS_INFO_TYPE, PROCESS_INFO_TYPE_LABEL } from './constants';
import style from './index.module.less';
import { TAB_TYPE } from '../../constant';
import { getLifeCycleDataDetail } from '../service';
import { LifeCycleDataResponse } from '../type';

const { LIFECYCLE_DATA } = TAB_TYPE;
const { PROCESS_INFO, THREE_WASTE_OUTPUT } = PROCESS_INFO_TYPE;

export type LifeCycleDataGrouped = LifeCycleDataResponse & {
  [key: number]: LifeCycleDataResponse[];
};

export default function LifeCycleDataInfo() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const { processCode } = usePageInfo();

  /** 页面加载loading */
  const [loading, setLoading] = useState(false);

  const [lifeCycleDataInfo, setLifeCycleDataInfo] =
    useState<LifeCycleDataGrouped>();

  useEffect(() => {
    if (processCode) {
      setLoading(true);
      getLifeCycleDataDetail({ processCode }).then(({ data }) => {
        setLoading(false);
        const result = (data?.data || []).reduce(
          (prev: LifeCycleDataGrouped, curr) => {
            if (curr.impProcessType === PROCESS_INFO) {
              Object.assign(prev, curr);
            } else {
              const key =
                curr.impProcessType > THREE_WASTE_OUTPUT
                  ? THREE_WASTE_OUTPUT
                  : curr.impProcessType;
              if (!prev[key]) {
                prev[key] = [];
              }
              // 计算 allIndex，从 1 开始
              const allIndex = prev[key].length + 1;
              prev[key].push({ ...curr, allIndex });
            }
            return prev;
          },
          {} as LifeCycleDataGrouped,
        );

        setLifeCycleDataInfo(result);
      });
    }
  }, [processCode]);

  const {
    processName,
    timeRepresent,
    areaRepresent,
    techRepresent,
    processDesc,
  } = lifeCycleDataInfo || {};

  const productInfo = [
    {
      label: I18N.carbonFootPrintLCA.processName,
      value: processName,
    },
    {
      label: I18N.carbonFootPrintLCA.timeRepresentativeness,
      value: timeRepresent,
    },
    {
      label: I18N.Factors.geographicalRepresentativeness,
      value: areaRepresent,
    },
    {
      label: I18N.Factors.technicalRepresentativeness,
      value: techRepresent,
    },
    {
      label: I18N.carbonFootPrintLCA.processDescription,
      value: processDesc,
    },
  ];

  return (
    <div className={style.lifeCycleDataInfoWrapper}>
      {loading ? (
        <div className={style.loadingWrapper}>
          <Spin spinning={loading} />
        </div>
      ) : (
        <div className={style.lifeCycleDataInfoContent}>
          {/* 过程信息 */}
          <div className={style.lifeCycleDataInfoItem}>
            <div className={style.title}>
              {PROCESS_INFO_TYPE_LABEL[PROCESS_INFO]}
            </div>
            <Descriptions bordered column={2}>
              {productInfo.map(({ label, value }) => (
                <Descriptions.Item label={label}>
                  {value || '-'}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </div>
          {/* 表格信息 - 产品、材料输入、运输输入、能源和水输入、三废输出 */}
          {processDetailTabelList.map(item => {
            const { key, columns, scroll } = item || {};
            return (
              <div key={key} className={style.lifeCycleDataInfoItem}>
                <div className={style.title}>
                  {PROCESS_INFO_TYPE_LABEL[key]}
                </div>
                <ProTable
                  columns={columns}
                  key={key}
                  pagination={false}
                  search={false}
                  bordered
                  rowKey='id'
                  toolBarRender={false}
                  scroll={scroll ? { x: 1800 } : undefined}
                  params={{
                    productId,
                  }}
                  dataSource={lifeCycleDataInfo?.[key]}
                />
              </div>
            );
          })}
        </div>
      )}

      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.Factors.return,
            onClick: async () => {
              navigate({
                pathname: LCARouteMaps.lcaProductionManage.replace(
                  ':productId',
                  `${productId}`,
                ),
                search: `?currentStep=${LIFECYCLE_DATA}`,
              });
            },
          },
        ]}
      />
    </div>
  );
}
