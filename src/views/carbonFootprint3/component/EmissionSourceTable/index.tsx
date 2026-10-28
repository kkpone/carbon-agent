/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-02 09:58:08
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-23 16:40:37
 */

import { listALLByDictTypeBatch } from '@src/api/api';
import { FormActions } from '@src/components/FormActions';
import {
  formPropsInit,
  formItemInitInput,
  formItemInitType,
} from '@src/components/FormUtil/util';
import SearchFormUtil from '@src/components/SearchForm';
import { utilGetUrlParams } from '@src/components/SearchForm/util';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import styleCarbonFootprint3 from '@src/views/carbonFootprint3/index.module.less';
import { Dicts } from '@src/views/emission/Show/type';
import { Form, TableColumnsType, Button, Modal } from 'antd';
import classNames from 'classnames';
import { VFC, useState, useEffect, useRef } from 'react';

import { serviceToForm } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportUtil';

import { EMISSION_SOURCE_TYPE, EMISSION_SOURCE_TYPE_LABEL } from './constant';
import styles from './index.module.less';
import { getEmissionSourceList } from './service';
import { EmissionSource } from './type';
import CarbonFootprint3EmissionSoureLibraryAdd from '../../discharge/emissionSoureLibrary/add';
import { getEmissionSoureLibraryTableDataDetail } from '../../discharge/emissionSoureLibrary/service';
import TextOverflowTable from '../TextOverflowTable';

type EmissionSourceTableProps = {
  onConfirm: (emissionSource: EmissionSource) => Promise<any>;
  onCancel: () => Promise<any>;
  libType?: number;
};

const commonFormItemProps = {
  style: { width: 240 },
};

const EmissionSourceTable: VFC<EmissionSourceTableProps> = ({
  onCancel,
  onConfirm,
  libType,
}) => {
  const [searchParams, setSearchParams] = useState<
    Partial<Pick<EmissionSource, 'name' | 'type'>> & { libType?: number }
  >(() => {
    const searchParamsString = utilGetUrlParams('search') || '{}';
    try {
      return { ...JSON.parse(searchParamsString), libType };
    } catch {
      return {
        libType,
      };
    }
  });

  const [selectedEmissionSource, setSelectedEmissionSource] = useState<
    EmissionSource[]
  >([]);

  /** 基本详情的弹框 */
  const [showBasicModal, setShowBasicModal] = useState<boolean>(false);

  /** 单位的字典值 */
  const [cascaderOptions, setCascaderOptions] = useState<Dicts[]>([]);

  /** 排放源信息 */
  const [emissionSourceInfo, setEmissionSourceInfo] = useState<string>('');

  const [searchForm] =
    Form.useForm<Partial<Pick<EmissionSource, 'name' | 'type'>>>();

  const searchFormProps = {
    ...formPropsInit(),
    layout: 'inline' as const,
    form: searchForm,
  };

  const tableRef = useRef<TableRef<EmissionSource>>();

  /**
   * @description: 点击查看
   * @param {EmissionSource} item 查看的数据
   */
  const showEmissionSourceModal = async (item: EmissionSource) => {
    const back = await getEmissionSoureLibraryTableDataDetail({
      id: `${item.id}`,
    });

    const { data } = back.data;
    const { factorObj, typeExtra } = data;

    // 获取数量单位的code
    const child = cascaderOptions.find(op => op.dictValue === data.unitCode);
    const parent = cascaderOptions.find(
      op => op.dictValue === child?.sourceType,
    );
    const unitData =
      parent && child ? [parent.dictValue, child.dictValue] : undefined;

    const formValues = {
      ...data,
      needTransport: data.accountEmissionTransportList?.length > 0 ? 2 : 1,
      accountEmissionTransportList: serviceToForm(
        data.accountEmissionTransportList,
      ),
      unitData,
      typeExtraWay: 1,
      factorObj: { ...factorObj, rate: data.rate },
      specificationWay2Numerator: '',
      amount2: '',
    };

    // 处理运输情况
    if (typeExtra) {
      // 产品重量
      if (typeExtra.way === 1) {
        formValues.specificationWay2Numerator = typeExtra.unitName;
        formValues.amount2 = `${typeExtra.amount || ''}`;
      }

      // 载重比
      if (typeExtra.way === 2) {
        // 载重比单位信息是禁止选择的，所以不需要赋值，都是默认值
        // formValues.specificationWay3Numerator = typeExtra.unitName;
        // formValues.specificationWay3Denominator = typeExtra.distUnitName || '';
      }

      // 按能耗
      if (typeExtra.way === 3) {
        // 单位信息在外层有unitCode，所以上面的unitData 已经处理掉了,不需要单独处理了
      }

      // 同步类型
      formValues.typeExtraWay = typeExtra.way;
    }

    setEmissionSourceInfo(JSON.stringify(formValues));
    setShowBasicModal(true);
  };

  const tableColumns: TableColumnsType<EmissionSource> = [
    {
      title: I18N.carbonFootprint.number,
      fixed: 'left',
      width: 70,
      dataIndex: '__index__',
      render: (_, processLibProduct, index) => index + 1,
    },
    {
      title: I18N.carbonFootprint3.emissionSourceName,
      width: 200,
      dataIndex: 'name',
      render: (val: string) => {
        if (val) {
          return <TextOverflowTable value={val} maxLength={20} />;
        }
        return '-';
      },
    },
    {
      title: I18N.carbonFootprint3.category,
      width: 70,
      dataIndex: 'type',
      render: (_, emissionSource) =>
        EMISSION_SOURCE_TYPE_LABEL[emissionSource.type] || '-',
    },
    {
      title: I18N.carbonFootprint3.consumptionQuantity,
      width: 150,
      dataIndex: 'unitName',
      render: (_, emissionSource) =>
        (emissionSource.typeExtra
          ? emissionSource.typeExtra.unitName
          : emissionSource.unitName) || '-',
    },
    {
      title: I18N.carbonFootprint.emissionFactors,
      width: 208,
      dataIndex: 'factorUnit',
      render: (_, emissionSource) => (
        <div className={styles.ellipsisText}>
          {emissionSource.matchObject
            ? `${emissionSource.matchObject.factor || ''}${
                emissionSource.matchObject.unit || ''
              }`
            : '-'}
        </div>
      ),
    },
    {
      title: I18N.carbonFootprint.emissionFactors2,
      width: 300,
      dataIndex: 'factorInstitution',
      render: (val, emissionSource) => {
        if (emissionSource.matchObject?.institution) {
          return (
            <TextOverflowTable
              value={emissionSource.matchObject?.institution}
              maxLength={30}
            />
          );
        }
        return '-';
      },
    },
    {
      title: I18N.carbonFootprint.yearOfPublication,
      width: 150,
      dataIndex: 'factorYear',
      render: (_, emissionSource) => emissionSource.matchObject?.year || '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      fixed: 'right',
      dataIndex: '__operate__',
      render: (_, emissionSource) => (
        <Button
          onClick={async () => {
            await showEmissionSourceModal(emissionSource);
          }}
          className={styles.operateBtn}
          type='link'
        >
          {I18N.carbonFootprint.check}
        </Button>
      ),
    },
  ];

  /**
   * @description: 初始化
   */
  const init = async () => {
    const dic = await listALLByDictTypeBatch<{ factorUnitM: Dicts[] }>({
      dictTypes: 'factorUnitM',
    });
    setCascaderOptions(dic.data.data.factorUnitM);
  };
  useEffect(() => {
    init();
  }, []);

  return (
    <div
      className={classNames(styleCarbonFootprint3.carbonFootprint3, 'm-b-60')}
    >
      <div className='m-t-16'>
        <SearchFormUtil
          antdFormProps={searchFormProps}
          searchSub={() => {
            setSearchParams(searchForm.getFieldsValue());
          }}
          resetBack={() => setSearchParams({})}
          formItems={[
            {
              ...formItemInitInput('', 'name', false),
              props: {
                ...commonFormItemProps,
                placeholder: I18N.carbonFootprint3.emissionSourceName,
              },
            },
            {
              ...formItemInitType('select', '', 'type', false),
              props: {
                ...commonFormItemProps,
                placeholder: I18N.carbonFootprint3.category,
                options: Object.values(EMISSION_SOURCE_TYPE).map(
                  emissionSourceType => ({
                    value: emissionSourceType,
                    label: EMISSION_SOURCE_TYPE_LABEL[emissionSourceType],
                  }),
                ),
              },
            },
          ]}
        />
      </div>
      <CommonTable<
        EmissionSource,
        { data: { total: number; rows: EmissionSource[] } }
      >
        columns={tableColumns}
        rowSelection={{
          type: 'radio',
          columnWidth: 80,
          fixed: 'left',
          selectedRowKeys: selectedEmissionSource.map(
            emissionSource => emissionSource.id,
          ),
          onChange: (_, selectedRows) =>
            setSelectedEmissionSource(selectedRows),
        }}
        searchParams={searchParams}
        bordered={false}
        cRef={tableRef}
        scroll={{ x: 1200 }}
        pageSize={10}
        rowKey='id'
        fetchApi={params => {
          setSelectedEmissionSource([]);
          return getEmissionSourceList({
            ...params,
            pageSize: params.size,
            pageNum: params.page,
          });
        }}
        returnFetchApi={back => ({
          data: back?.data?.data?.rows || [],
          count: back?.data?.data?.total || 0,
        })}
      />
      <Modal
        width={1000}
        title={I18N.carbonFootprint3.emissionSourceDetails}
        maskClosable={false}
        getContainer={false}
        open={showBasicModal}
        okButtonProps={{
          style: {
            display: 'none',
          },
        }}
        bodyStyle={{
          padding: 0,
        }}
        cancelText={I18N.carbonFootprint3.close}
        onCancel={() => setShowBasicModal(false)}
      >
        <CarbonFootprint3EmissionSoureLibraryAdd
          formVal={emissionSourceInfo}
          findDetail
        />
      </Modal>
      <FormActions
        place='center'
        buttons={[
          {
            type: 'primary',
            title: I18N.carbonFootprint.confirm2,
            disabled: selectedEmissionSource.length === 0,
            onClick: async () => {
              if (selectedEmissionSource.length > 0) {
                await onConfirm(selectedEmissionSource[0]);
              }
            },
          },
          {
            title: I18N.carbonFootprint.return,
            onClick: onCancel,
          },
        ]}
      />
    </div>
  );
};

export default EmissionSourceTable;
