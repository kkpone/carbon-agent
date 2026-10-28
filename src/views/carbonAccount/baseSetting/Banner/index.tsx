/**
 * @file 横幅设置
 * @author qifeng
 */
import { checkPermissions } from '@src/components/Permission/utils';
import { Table } from '@src/components/Table';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import {
  BannerDto,
  BannerDtoBannerTypeEnum,
  pageUsingGETBannerApi,
  RPageResultBannerDto,
} from '@src/sdks/java/carbonAccount';
import { Toast } from '@src/utils/Toast';
import { Button, Image } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiBannerDelete } from '../service';
import '../../index.less';

const BannerImgSet = () => {
  const history = useHistory();
  const [total, setTotal] = useState(0);
  const ref = useRef<TableRef>();
  const columns: ColumnsType<BannerDto> = [
    {
      title: I18N.carbonAccount.banne3,
      dataIndex: 'bannerUrl',
      width: 260,
      render(text, record) {
        return `${record?.bannerType}` === BannerDtoBannerTypeEnum[1] ? (
          <Image alt='' src={text} width={60} height={34} />
        ) : (
          <video src={text} style={{ width: 45, height: 34 }}>
            <track default kind='captions' srcLang='en' src={text} />
          </video>
        );
      },
    },
    {
      title: I18N.carbonFootprint.type,
      width: 260,
      dataIndex: 'bannerType',
      render(text) {
        return (
          <span>
            {text === 1
              ? I18N.carbonAccount.imageAndText
              : I18N.carbonAccount.video}
          </span>
        );
      },
    },
    {
      title: I18N.carbonFootprint3.sort,
      width: 260,
      dataIndex: 'orderNum',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'opre',
      render(_, record) {
        return (
          <>
            {checkPermissions(
              <Button
                type='link'
                style={{ paddingLeft: 0 }}
                onClick={() => {
                  history.push(
                    `${RouteMaps.CarbonAccountBaseSettingCheckBanner}?id=${record.id}`,
                  );
                }}
              >
                {I18N.carbonFootprint.check}
              </Button>,
              'carbonAccount:banner:detail',
            )}
            {checkPermissions(
              <Button
                type='link'
                onClick={() => {
                  history.push(
                    `${RouteMaps.CarbonAccountBaseSettingEditBanner}?id=${record.id}`,
                  );
                }}
              >
                {I18N.carbonFootprint.edit}
              </Button>,
              'carbonAccount:banner:edit',
            )}
            {checkPermissions(
              <Button
                type='link'
                danger
                onClick={() => {
                  ApiBannerDelete({ id: record.id })
                    .then(res => {
                      if (res.data.code === 200)
                        Toast('success', I18N.carbonFootprint.deleteSuccessful);
                    })
                    .finally(() => {
                      ref.current?.reset();
                    });
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>,
              'carbonAccount:banner:delete',
            )}
          </>
        );
      },
    },
  ];

  return (
    <div className='base-box banner-set-box  border-bottom-global-actions autoHeight'>
      <div className='add'>
        <h2 className='tit-word m-b-20'>{I18N.carbonAccount.banne2}</h2>

        {checkPermissions(
          <Button
            type='primary'
            onClick={() => {
              if (total >= 5) {
                Toast('warn', I18N.carbonAccount.canBeAddedAtMost);
                return;
              }
              history.push(RouteMaps.CarbonAccountBaseSettingAddBanner);
            }}
          >
            {I18N.carbonFootprint.newAddition}
          </Button>,
          'carbonAccount:banner:add',
        )}
      </div>
      <Table<BannerDto, RPageResultBannerDto>
        columns={columns}
        bordered={false}
        cRef={ref}
        returnFetchApi={({ data }) => {
          setTotal(data?.data?.total || 0);
          return {
            data: data?.data?.rows || [],
            count: data?.data?.total || 0,
          };
        }}
        fetchApi={params => pageUsingGETBannerApi(params.page, params.size)}
        pagePosition
      />
    </div>
  );
};

export default BannerImgSet;
