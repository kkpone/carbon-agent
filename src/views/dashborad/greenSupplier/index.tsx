import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Tabs } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useRef, useState } from 'react';

import {
  REDUCTIONCATEGORYTYPE,
  REDUCTIONCATEGORYTYPE_DESC,
  REDUCTIONCATEGORYTYPE_LABLE,
} from './const';
import style from './index.module.less';
import { apiGetGreenSupplierList } from './service';
import {
  GreenSupplierInfo,
  GreenSupplierListParams,
  PageReturn,
  Response,
} from './type';

const GreenSupplier = () => {
  const childRef = useRef<TableRef>();

  const [activeKey, setActiveKey] = useState<REDUCTIONCATEGORYTYPE>(
    REDUCTIONCATEGORYTYPE.MATERIAL,
  );

  const items = Object.keys(REDUCTIONCATEGORYTYPE_LABLE)?.map(k => ({
    label: REDUCTIONCATEGORYTYPE_LABLE[k],
    key: k,
    des: REDUCTIONCATEGORYTYPE_DESC[k],
  }));

  const desc = items[items?.findIndex(item => item.key === activeKey)]?.des;

  useEffect(() => {
    childRef?.current?.reset({
      page: 1,
    });
  }, [activeKey]);

  const columns: ColumnsType<GreenSupplierInfo> = [
    {
      title: I18N.dashborad.enterpriseName,
      dataIndex: 'enterpriseName',
      width: 226,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.classificationOfEmissionReduction,
      dataIndex: 'classify',
      width: 226,
      ellipsis: true,
    },
    {
      title: I18N.carbonFootprint3.emissionReductionCommodityCategory,
      width: 226,
      dataIndex: 'goodsClassify',
      ellipsis: true,
    },
    {
      title: I18N.dashborad.descriptionOfEmissionReductionAttributes,
      width: 512,
      dataIndex: 'attributeDesc',
      ellipsis: true,
    },
  ];

  return (
    <div className={style.greenSupplier}>
      <Tabs
        activeKey={activeKey}
        onChange={v => {
          setActiveKey(v as REDUCTIONCATEGORYTYPE);
        }}
      >
        {items?.map(item => (
          <Tabs.TabPane tab={item.label} key={item.key} />
        ))}
      </Tabs>
      <div className={style.tip}>
        <IconAlibaba type='icon-icon_info1' className={style.icon} />
        {desc || '-'}
      </div>

      <CommonTable<
        GreenSupplierInfo,
        Response<PageReturn<GreenSupplierInfo>>,
        GreenSupplierListParams
      >
        cRef={childRef}
        columns={columns}
        fetchApi={params =>
          apiGetGreenSupplierList({
            ...params,
            category: Number(activeKey),
            onShow: 'true',
            pageNum: params.page,
            pageSize: params.size,
          })
        }
        returnFetchApi={data => ({
          data: data.data.data?.list || [],
          count: data.data.data?.total || 0,
        })}
      />
    </div>
  );
};

export default GreenSupplier;
