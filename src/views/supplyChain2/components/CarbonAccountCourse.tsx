/*
 * @@description: 企业碳核过程
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-20 11:22:25
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-29 14:34:11
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
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { useIndexColumn } from '@src/views/emission/utils';
import {
  apiCategoryList,
  apiComputationInfo,
  apiSourceList,
} from '@src/views/enterpriseCarbonAccount2/service';
import { EnterpriseCategorys } from '@src/views/enterpriseCarbonAccount2/utils/type';
import { Button, Modal, Tree } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { carbonAccoutCloumn } from './cloumn';
import { carbonAccountBaseInfoSchema } from './schema';
import { apiDataComputation } from '../carbonDataManage/SupplierCarbonData/service';
import { apiComputationCategoryList, apiDataSourceList } from '../service';
import { DataBackType } from '../type';

const listToTree = (list: string | any[]) => {
  const map: any = {};
  let node;
  const tree: any = [];
  let i;
  // eslint-disable-next-line no-plusplus
  for (i = 0; i < list.length; i++) {
    // eslint-disable-next-line
    list[i].children = [];
    // eslint-disable-next-line
    list[i].key = i;
    map[list[i].sourceCategoryId] = list[i];
    list[i].selectable = list[i].requestFlag;
  }
  for (i = 0; i < list.length; i += 1) {
    // eslint-disable-next-line
    list[i].key = 1000 + i;
    node = list[i];
    if (node.parentId !== 0) {
      map[node.parentId].children.push({
        ...node,
        key: node.sourceCategoryId,
        title: node.name,
      });
    } else {
      tree.push({
        ...node,
        key: node.sourceCategoryId,
        title: node.name,
      });
    }
  }
  return tree;
};
interface PropTypes {
  titType?: 'radio' | 'tab';
  dataInfo?: DataBackType;
  jumpDetailUrl?: string;
  queryType?: number; // 1 请求供应链接口 2 请求企业碳核算接口
  isChaniApi?: boolean;
}
const CarbonAccountCourse = (props: PropTypes) => {
  const form = useMemo(() => createForm({ readPretty: true }), []);
  const { titType, dataInfo, jumpDetailUrl, queryType = 1, isChaniApi } = props;
  const id = new URLSearchParams(window.location.search).get('id') || '';
  const computationId =
    new URLSearchParams(window.location.search).get('computationId') || '';
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Select,
      Checkbox,
    },
  });
  const history = useHistory();

  const [expandKey, setExpandKey] = useState<any[]>([]);
  const [infoVisible, setInfoVisible] = useState<boolean>(false);
  const [defaultSelectedKeys, setDefaultSelectedKeys] = useState<number[]>();
  const [categoryTreeList, setCategoryTreeList] = useState<any>([]);
  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
  });
  /** 当前选中的树的节点 */
  const [categoryId, setCategoryId] = useState<number>();
  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);

  const returnFetchApi = back => ({
    data: back.data.rows,
    count: back.data.total,
  });
  const carbonAccoutCloumns = carbonAccoutCloumn();
  carbonAccoutCloumns.push({
    title: I18N.carbonFootprint.operation,
    dataIndex: 'versionCode',
    ellipsis: true,
    fixed: 'right',
    width: 96,
    render: (text: string, record) => (
      // if (
      //   path ===
      //   RouteMapsSupplyChain2.supplyChainSupplierDetailCarbonAccountDetail
      // ) {
      //   href = `${RouteMapsSupplyChain2.supplyChainSupplierDetailCarbonAccountEmissionDetail}?id=${record.id}`;
      // } else if (
      //   path === RouteMapsSupplyChain2.supplySupplierCarbonDataDetail
      // ) {
      //   href = `${RouteMapsSupplyChain2.supplySupplierCarbonDataCarbonAccountDetailEmissionDetail}?id=${record.id}`;
      // } else if (path === RouteMapsSupplyChain2.supplySupplierCarbonDataAudit) {
      //   href = `${RouteMapsSupplyChain2.supplySupplierCarbonDataCarbonAccountAuditEmissionDetail}?id=${record.id}`;
      // }
      <TableActions
        menus={[
          {
            key: '1',
            label: I18N.carbonFootprint.check,
            onClick: async () => {
              sessionStorage.removeItem('computationObj');
              history.push(
                `${jumpDetailUrl}?id=${record.id}&categoryId=${record.categoryId}&classifyType=0&isChaniApi=${isChaniApi}` ||
                  '/',
              );
            },
          },
        ]}
      />
    ),
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  queryType === 2 &&
    carbonAccoutCloumns.splice(5, 0, {
      title: I18N.carbonFootprint.state,
      dataIndex: 'status',
      width: 96,
      render: (text: string) => (
        <div>
          {text === '0'
            ? I18N.enterpriseCarbonAccount2.draft
            : I18N.enterpriseCarbonAccount2.formal}
        </div>
      ),
    });
  // 设置分类列表数据
  const setData = data => {
    const findChild = (arr: EnterpriseCategorys[]) => {
      let fontItem;
      for (let i = 0; i < arr.length; i += 1) {
        const item: EnterpriseCategorys = arr[i];
        if (item.children.length) {
          return findChild(item.children);
        }
        // eslint-disable-next-line prefer-destructuring
        fontItem = arr[0];
      }
      return fontItem;
    };

    if (data.data.length) {
      const sessionCategoryId = sessionStorage.getItem('categoryId');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const resCategoryId = findChild(listToTree(data.data)).sourceCategoryId;
      if (sessionCategoryId) {
        setCategoryId(Number(sessionCategoryId));
        setDefaultSelectedKeys([Number(sessionCategoryId)]);
      } else {
        setDefaultSelectedKeys([resCategoryId]);
        setCategoryId(resCategoryId);
      }
      setExpandKey(data.data?.map(item => item.sourceCategoryId));
    } else {
      setCategoryId(0);
    }
    setCategoryTreeList(listToTree(data.data));
  };
  // 获取分类列表
  const getClassify = async () => {
    if (queryType === 1) {
      const { data } = await apiComputationCategoryList({ id });
      setData(data);
    } else {
      const { data } = await apiCategoryList(computationId);
      setData(data);
    }
  };
  // 获取核算信息
  const getAccountDetail = () => {
    if (queryType === 1) {
      apiDataComputation(id).then(({ data }) => {
        const { quantization } = data.data;
        form.setValues({
          ...data.data,
          quantizationArr: quantization?.split(','),
        });
      });
    } else {
      apiComputationInfo(computationId).then(({ data }) => {
        const { quantization } = data.data;
        form.setValues({
          ...data.data,
          quantizationArr: quantization?.split(','),
        });
      });
    }
  };
  useEffect(() => {
    getClassify();
    getAccountDetail();
  }, []);
  const renderBaseInfo = () => (
    <Modal
      centered
      open={infoVisible}
      width={678}
      okButtonProps={{ style: { display: 'none' } }}
      cancelText={I18N.carbonFootprint3.close}
      title={I18N.carbonFootprint.basicInformation}
      wrapClassName='info-modal'
      onCancel={() => {
        setInfoVisible(false);
      }}
    >
      <FormilyCommon form={form}>
        <SchemaField schema={carbonAccountBaseInfoSchema()} />
      </FormilyCommon>
    </Modal>
  );
  return (
    <div
      className='carbonaccountcourse-container'
      style={{ height: titType === 'radio' ? ' calc(100vh - 285px)' : '100%;' }}
    >
      <div className='top-info'>
        <div className='flex-a-c flex-j-b'>
          <div className='flex-a-c tit-box'>
            {queryType === 1 ? (
              <>
                <div className='flex-a-c'>
                  <span className='info-tit'>
                    {I18N.supplyChain2.supplierName}
                  </span>
                  <span className='info-value'>
                    {dataInfo?.supplierData.companyName}
                  </span>
                </div>
                <div className='flex-a-c'>
                  <span className='info-tit'>
                    {I18N.supplyChain2.accountingYear2}
                  </span>
                  <span className='info-value'>
                    {dataInfo?.supplierData.computationYear}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className='flex-a-c'>
                  <span className='info-tit'>
                    {I18N.enterpriseCarbonAccount2.accountingName}
                  </span>
                  <span className='info-value'>{form.getValuesIn('name')}</span>
                </div>
                <div className='flex-a-c'>
                  <span className='info-tit'>
                    {I18N.carbonFootprint.accountingCycle2}
                  </span>
                  <span className='info-value'>
                    {form.getValuesIn('period')}
                  </span>
                </div>
              </>
            )}

            <Button
              type='link'
              onClick={async () => {
                setInfoVisible(true);
              }}
            >
              {I18N.supplyChain2.basicInformationDetailed}
            </Button>
          </div>
        </div>
      </div>
      <div className='main-box flex-j-b'>
        <div className='left'>
          {defaultSelectedKeys && (
            <Tree
              className='draggable-tree'
              expandedKeys={expandKey}
              defaultSelectedKeys={defaultSelectedKeys}
              showIcon
              blockNode
              defaultExpandAll
              onExpand={keys => {
                setExpandKey([...keys]);
              }}
              treeData={categoryTreeList}
              onSelect={e => {
                setCategoryId(Number(e[0]));
                sessionStorage.setItem('categoryId', String(e[0]));
              }}
            />
          )}
        </div>
        <div className='right'>
          {categoryId ? (
            <CommonTable
              pagination={{
                showTotal: total =>
                  I18N.template(I18N.supplyChain2.totalTota10, { val1: total }),
              }}
              key={categoryId}
              columns={[...indexColumn, ...carbonAccoutCloumns]}
              scroll={{ y: '67vh' }}
              fetchApi={async params => {
                setPage({ current: params.page, pageSize: params.size });
                if (queryType === 1) {
                  return apiDataSourceList({
                    categoryId,
                    pageNum: params.page,
                    pageSize: params.size,
                  });
                }
                return apiSourceList({
                  categoryId,
                  pageNum: params.page,
                  pageSize: params.size,
                });
              }}
              returnFetchApi={returnFetchApi}
            />
          ) : (
            ''
          )}
        </div>
      </div>
      {renderBaseInfo()}
    </div>
  );
};
export default CarbonAccountCourse;
