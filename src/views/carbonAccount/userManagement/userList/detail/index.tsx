/**
 * 查看用户
 * @returns
 */
import I18N from '@src/lang/I18N';
import { FormActions } from '@src/components/FormActions';
import { useOrganizations } from '@src/views/carbonAccount/utils';
import { Row, Col, Table, PaginationProps } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { findUserDeatilData, findUserTableItem } from './model';
import { CarbonAccountUserListFindUserTable } from './type';
import '../../../index.less';
import { getOrgNameByOrgId } from './util';
import {
  ApicarbonAccountUserListItemGet,
  ApicarbonAccountUserScoreListGet,
} from '../service';
import { ApiGetUserListItem, UserListItemDetailLoaction } from '../type';

const CarbonAccountFindUser = () => {
  const location = useLocation<UserListItemDetailLoaction>();
  const history = useHistory<any>();
  /** 表格数据 */
  const [tableData, setTableData] = useState<
    CarbonAccountUserListFindUserTable[]
  >([]);
  /** 总页数 */
  const [tableTotal, setTableTotal] = useState<number>(0);
  /** 加载状态 */
  const [loading, setLoading] = useState<boolean>(false);
  /** 分页情况 */
  const [pageParams, setPageParams] = useState({ page: 1, size: 10 });
  /** 用户详情 */
  const [useInfo, setUseInfo] = useState<ApiGetUserListItem>();

  const orgInfo = useOrganizations();

  useEffect(() => {
    // 通过后端接口 orgId 获取 orgName
    if (useInfo?.orgId) {
      const orgName = getOrgNameByOrgId(orgInfo, useInfo?.orgId);
      setUseInfo(pre => ({
        ...pre!,
        orgName,
      }));
    }
  }, [orgInfo, useInfo?.orgId]);

  const init = async (page?: number, size?: number) => {
    setLoading(true);
    try {
      const res = await ApicarbonAccountUserListItemGet(location.state.id);
      if (res.data.data) {
        const backTableData = await ApicarbonAccountUserScoreListGet({
          userId: res.data.data.id,
          page: page || pageParams.page,
          size: size || pageParams.size,
        });
        if (backTableData.data.code === 200) {
          setTableData(backTableData.data.data.rows);
          setTableTotal(backTableData.data.data.total);
        }
      }
      setUseInfo(res.data.data);
    } finally {
      setLoading(false);
    }
  };
  /** 表格改变 */
  const onTableChange = (pageParams: PaginationProps) => {
    if (pageParams.current && pageParams.pageSize) {
      init(pageParams.current, pageParams.pageSize);
      setPageParams({
        page: pageParams.current,
        size: pageParams.pageSize as number,
      });
    }
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div style={{ marginBottom: 60 }} className='carbonAccount'>
      <div className='findUser'>
        <div className='findTitle mb20'>{I18N.carbonAccount.userInformation}</div>
        <div className='mb20'>
          <Row>
            {findUserDeatilData(useInfo).map((item, _index) => (
              <>
                <Col span={6}>
                  <div
                    className={`findTable findTableLabel ${
                      _index > 1 && 'findTableNotopBorder'
                    }`}
                  >
                    {item.label}
                  </div>
                </Col>
                <Col span={6}>
                  <div
                    className={`findTable ${
                      _index > 1 && 'findTableNotopBorder'
                    } ${_index % 2 === 0 && 'findTableNorightBorder'}`}
                  >
                    {item.value}
                  </div>
                </Col>
              </>
            ))}
          </Row>
        </div>
        <div className='findTitle mb20'>{I18N.carbonAccount.carbonCoinChangeRecord}</div>
        <Table<CarbonAccountUserListFindUserTable>
          rowKey='id'
          loading={loading}
          scroll={{ y: 'calc(100vh - 500px)' }}
          columns={findUserTableItem()}
          onChange={onTableChange}
          dataSource={tableData}
          pagination={{
            current: pageParams.page,
            pageSize: pageParams.size,
            total: tableTotal,
          }}
        />
      </div>
      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => history.go(-1),
          },
        ]}
      />
    </div>
  );
};

export default CarbonAccountFindUser;
