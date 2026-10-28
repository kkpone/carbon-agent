/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * @@description: 企业碳核过程
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-20 11:22:25
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 20:15:56
 */
/**
 * @file 企业碳核过程 页面 1供应商列表-详情-企业碳核算-详情
 */
import I18N from '@src/lang/I18N';
import './style.less';
import {
  FormGrid,
  FormLayout,
  FormItem,
  Input,
  Select,
  Checkbox,
  Cascader,
  DatePicker,
  Radio,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { listALLByDictTypeBatch } from '@src/api/api';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import { RouteMapsType } from '@src/router/route-paths';
import { URL_QUICK_MODEL_KEY } from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import { BusinessAccountingModelEmissionData } from '@src/views/carbonFootprint3/BusinessAccountingModel/type';
import QuickBusinessAccountingBasicManagementAddSource from '@src/views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource';
import { useIndexColumn } from '@src/views/emission/utils';
import { Button, Modal } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { carbonFootprintQuickBusinessAccountingColumns } from './cloumn';
import { carbonFootPrintBaseInfoSchema } from './schema';
import {
  apiFootprintAccountEmissionList,
  apiFootprintAccountInfo,
  apiFootprintAccountMenus,
  getQuickBusinessAccountingEmissionInfo,
} from '../service';
import {
  FootprintAccountInfoBackData,
  FootprintAccountMenusBackData,
} from '../type';

interface PropTypes {
  titType?: 'radio' | 'tab';
  isChaniApi: boolean;
  jumpDetailUrl?: string | RouteMapsType;
  isComponent?: boolean;
}
const ProductFootprintQuick = (props: PropTypes) => {
  const { titType, isChaniApi, jumpDetailUrl } = props;
  const id = new URLSearchParams(window.location.search).get('id') || '';

  const form = useMemo(() => createForm({ readPretty: true }), []);
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Select,
      Checkbox,
      Cascader,
      DatePicker,
      Radio,
    },
  });

  /** 菜单列表 */
  const [menus, setMenus] = useState<FootprintAccountMenusBackData[]>();
  const history = useHistory();
  const [accountInfo, setAccountInfo] =
    useState<FootprintAccountInfoBackData>();

  const [menuItem, setMenuItem] = useState<FootprintAccountMenusBackData>({
    code: '0',
    name: '',
  });
  const [infoVisible, setInfoVisible] = useState<boolean>(false);
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);
  const [timeType, setTimeType] = useState<number>();
  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
  });

  const [emissionModalVisible, setEmissionModalVisible] = useState(false);

  const [formValString, setFormValString] = useState('');

  /** 当前选中的树的节点 */
  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);

  const returnFetchApi = back => {
    const data = !isChaniApi ? back.data.data.rows : back.data.rows;
    const count = !isChaniApi ? back.data.data.count : back.data.count;
    return {
      data,
      count,
    };
  };
  const getItemInfo = async (item: BusinessAccountingModelEmissionData) => {
    const back = await getQuickBusinessAccountingEmissionInfo(
      {
        id: `${item.id}`,
      },
      // {
      //   id: '1296',
      // },
      isChaniApi,
    );

    const { data } = back.data;
    const { factorObj, typeExtra } = data;

    // 获取数量单位的code
    const child = cascaderOptions.find(op => op.dictValue === data.unitCode);
    const parent = cascaderOptions.find(
      op => op.dictValue === child?.sourceType,
    );
    const unitData =
      parent && child ? [parent.dictValue, child.dictValue] : undefined;
    // delete data.files;

    const formValues = {
      ...data,
      unitData,
      typeExtraWay: 1,
      factorObj: { ...factorObj, rate: data.rate },
      specificationWay2Numerator: '',
      distance: '',
      selectName: '',
      carryingCapacity: '',
      amount2: '',
    };

    // 处理运输情况
    if (typeExtra) {
      // 产品重量
      if (typeExtra.way === 1) {
        formValues.amount2 = typeExtra.amount || '';
        formValues.specificationWay2Numerator = typeExtra.unitName;
        formValues.distance = typeExtra.distance || '';
        formValues.selectName = formValues.name;
      }

      // 载重比
      if (typeExtra.way === 2) {
        formValues.distance = typeExtra.distance || '';
        formValues.selectName = formValues.name;
        formValues.carryingCapacity = typeExtra.amount || '';
      }

      // 按能耗
      if (typeExtra.way === 3) {
        // 单位信息在外层有unitCode，所以上面的unitData 已经处理掉了,不需要单独处理了
      }

      // 同步类型
      formValues.typeExtraWay = typeExtra.way;
    }

    return formValues;
  };

  const fastAccountCloumns =
    carbonFootprintQuickBusinessAccountingColumns(true);
  fastAccountCloumns.push({
    title: I18N.carbonFootprint.operation,
    width: 200,
    dataIndex: 'matchObject',
    fixed: 'right',
    render: (val, record: BusinessAccountingModelEmissionData) => (
      <Button
        type='link'
        onClick={async () => {
          const formValues = await getItemInfo(record);
          localStorage.setItem('RateAutoStatus', 'false');
          const queryString = JSON.stringify(formValues).replaceAll(/&/g, 'ƒ');
          if (props.isComponent) {
            setFormValString(queryString);
            setEmissionModalVisible(true);
            return;
          }
          history.push(
            `${jumpDetailUrl}/${id}/${menuItem.code}?${
              URL_QUICK_MODEL_KEY.MENU_ACTIVE
            }=${JSON.stringify(menuItem)}&${URL_QUICK_MODEL_KEY.DETAIL_ID}=${
              record.businessId
            }&${URL_QUICK_MODEL_KEY.FORM_VALUES}=${queryString}&isChain=${
              isChaniApi ? 1 : 0
            }`,
          );
        }}
      >
        {I18N.carbonFootprint.check}
      </Button>
    ),
  });

  const getClassify = async () => {
    const { data } = await apiFootprintAccountMenus({ id }, isChaniApi);
    setMenus(data.data);
    const menuItem = localStorage.getItem('quickMenuItem');
    if (menuItem) {
      setMenuItem(JSON.parse(menuItem || '[]'));
    } else {
      setMenuItem(data.data[0]);
    }
  };
  const getAccountInfo = async () => {
    apiFootprintAccountInfo({ id }, isChaniApi).then(({ data }) => {
      setAccountInfo(data.data);
      setTimeType(data.data?.startTime ? 1 : 2);
      form.setValues({
        ...data.data,
        dateTime: `${
          data.data?.startTime
            ? `${data.data?.startTime || ''} - ${data.data?.endTime || ''}`
            : data.data?.year
        }`,
        footBorderType: data.data.scope + 1,
      });
    });

    const dic = await listALLByDictTypeBatch<{ factorUnitM: Dicts[] }>({
      dictTypes: 'factorUnitM',
    });
    setCascaderOptions(dic.data.data.factorUnitM);
  };
  useEffect(() => {
    getAccountInfo();
    getClassify();
  }, []);
  const renderBaseInfo = () => (
    <Modal
      centered
      open={infoVisible}
      width={705}
      okButtonProps={{ style: { display: 'none' } }}
      cancelText={I18N.carbonFootprint3.close}
      title={I18N.carbonFootprint.basicInformation}
      wrapClassName='info-modal'
      onCancel={() => {
        setInfoVisible(false);
      }}
    >
      <>
        {timeType ? (
          <FormilyCommon form={form}>
            <SchemaField schema={carbonFootPrintBaseInfoSchema(timeType)} />
          </FormilyCommon>
        ) : (
          ''
        )}

        <div className='uploadMain m-b-20'>
          <div className='uploadTitle'>
            {I18N.carbonFootprint.systemBoundaryEngineer}
          </div>
          <div className='m-t-10 img-box flex-a-c'>
            {!!accountInfo?.files?.length &&
              accountInfo?.files?.map(({ url }) => (
                <div className='pic'>
                  <img src={url} alt='' />{' '}
                </div>
              ))}
          </div>
        </div>
      </>
    </Modal>
  );
  return (
    <div
      className='carbonaccountcourse-container'
      style={{ height: titType === 'radio' ? ' calc(100vh - 285px)' : '100%;' }}
    >
      <Modal
        title={I18N.carbonFootprint3.emissionSourceDetails}
        open={emissionModalVisible}
        destroyOnClose
        width={1200}
        cancelText={I18N.carbonFootprint3.close}
        okButtonProps={{ style: { display: 'none' } }}
        transitionName=''
        maskTransitionName=''
        onCancel={() => {
          setFormValString('');
          setEmissionModalVisible(false);
        }}
      >
        <QuickBusinessAccountingBasicManagementAddSource
          isComponent={props.isComponent}
          formValuesString={formValString}
          stage={menuItem.code}
        />
      </Modal>
      <div className='top-info'>
        <div className='flex-a-c flex-j-b'>
          <div className='flex-a-c tit-box'>
            <div className='flex-a-c'>
              <span className='info-tit'>
                {I18N.carbonFootprint3.functionalUnits2}
              </span>
              <span className='info-value'>
                {accountInfo?.accountName || '-'}
              </span>
            </div>
            <div className='flex-a-c'>
              <span className='info-tit'>
                {I18N.carbonNeutral.businessAccounting}
                {accountInfo?.startTime
                  ? I18N.supplyChain2.cycle
                  : I18N.carbonFootprint.year}
                ：
              </span>
              {accountInfo?.startTime
                ? I18N.template(I18N.supplyChain2.accou, {
                    val1: accountInfo?.startTime || '-',
                    val2: accountInfo?.endTime || '-',
                  })
                : accountInfo?.year}
            </div>
            <Button
              type='link'
              onClick={() => {
                setInfoVisible(true);
              }}
            >
              {I18N.supplyChain2.basicInformationDetailed}
            </Button>
          </div>
        </div>
      </div>
      <div className='main-box flex-j-b'>
        <div className='left footprint-left'>
          <div className='footprint-left-list'>
            {menus?.map(d => (
              <div
                key={d.code}
                onClick={() => {
                  setMenuItem(d);
                  localStorage.setItem('quickMenuItem', JSON.stringify(d));
                }}
                className={`quickManagementMenu quickManagementMenu${
                  menuItem?.code === d.code
                }`}
              >
                {d.name}
              </div>
            ))}
          </div>
        </div>
        <div className='right footprint-right'>
          <CommonTable
            pagination={{
              showTotal: total =>
                I18N.template(I18N.supplyChain2.totalTota11, { val1: total }),
            }}
            key={menuItem?.code}
            columns={[...indexColumn, ...fastAccountCloumns]}
            scroll={{ y: '67vh' }}
            fetchApi={async params => {
              setPage({ current: params.page, pageSize: params.size });
              return apiFootprintAccountEmissionList(
                {
                  accountId: id,
                  stage: menuItem.code,
                  pageNum: params.page,
                  pageSize: params.size,
                },
                isChaniApi,
              );
            }}
            returnFetchApi={returnFetchApi}
          />
        </div>
      </div>
      {renderBaseInfo()}
    </div>
  );
};
export default ProductFootprintQuick;
