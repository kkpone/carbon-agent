import useUrlState from '@ahooksjs/use-url-state';
import Permission from '@src/components/Permission';
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { GET70dff4850797c3b1428875e5086bd354 } from '@src/sdks_v2/enterpriseV2ApiDocs';
import { Toast } from '@src/utils/Toast';
import {
  Pagination,
  PaginationProps,
  Button,
  Spin,
  Modal,
  Empty,
  Tabs,
  Input,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import copy from './copy.svg';
import del from './del.svg';
import styles from './index.module.less';
import { apiAccountModelList, apiAccountModeCopy } from '../../service';
import type { ModelItem } from '../../service';

const List = () => {
  const heightCardNumber = Math.floor((window.innerHeight - 300) / 158);
  const [params, setParams] = useUrlState({
    pageNum: 1,
    pageSize: heightCardNumber * 5,
    name: undefined,
  });
  const [total, setTotal] = useState(0);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ModelItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiAccountModelList({ ...params });
      setList(data.data.rows);
      setTotal(data.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  const onChange: PaginationProps['onChange'] = page => {
    setParams(pre => ({ ...pre, pageNum: page }));
  };
  return (
    <div>
      <div className={styles.wrapperHeader}>
        <div className={styles.title}>
          {I18N.carbonFootprint.accountingModel}
        </div>
        <Permission flag='enterprise:model:add'>
          <Button
            onClick={() =>
              history.push(RouteMaps.enterpriseCarbonAccountingModelDetail)
            }
            type='primary'
          >
            {I18N.carbonFootprint.newAddition}
          </Button>
        </Permission>
      </div>
      <Tabs
        defaultActiveKey='1'
        tabBarExtraContent={
          <Input.Search
            placeholder={I18N.enterpriseCarbonAccount2.pleaseInputTheModel}
            allowClear
            onSearch={name => setParams(pre => ({ ...pre, name }))}
          />
        }
      >
        <Tabs.TabPane tab={I18N.enterpriseCarbonAccount2.my} key='1'>
          <Spin spinning={loading}>
            <div className={styles.list}>
              {list.map(item => (
                <div
                  className={styles.card}
                  key={item.modelId}
                  onClick={() => {
                    history.push({
                      pathname: RouteMaps.enterpriseCarbonAccountingModelDetail,
                      search: `?modelId=${item.modelId}&pageType=edit&step=1`,
                    });
                  }}
                >
                  <div className={styles.header}>
                    <div className={styles.name} title={item.name}>
                      {item.name}
                    </div>
                  </div>
                  <div className={styles.content}>
                    <div className={styles.text}>{item.description}</div>
                    <div className={styles.useCount}>
                      {I18N.enterpriseCarbonAccount2.usageFrequency}
                      {item.useCount}
                    </div>
                  </div>
                  <div className={styles.menu}>
                    {checkPermissions(
                      <Tooltip overlay={I18N.carbonFootprint.delete}>
                        <div
                          className={styles.icon}
                          onClick={e => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: I18N.carbonFootprint.prompt,
                              icon: null,
                              content:
                                I18N.enterpriseCarbonAccount2
                                  .doYouWantToDeleteIt,
                              onOk: async () => {
                                await GET70dff4850797c3b1428875e5086bd354({
                                  modelId: item.modelId,
                                });
                                Toast(
                                  'success',
                                  I18N.carbonFootprint.deleteSuccessful,
                                );
                                fetchData();
                              },
                            });
                          }}
                        >
                          <img src={del} alt='' />
                        </div>
                      </Tooltip>,
                      'enterprise:model:deleted',
                    )}
                    {checkPermissions(
                      <Tooltip overlay={I18N.carbonFootprint.copy}>
                        <div
                          className={styles.icon}
                          onClick={e => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: I18N.carbonFootprint.prompt,
                              icon: null,
                              content: I18N.enterpriseCarbonAccount2.copyOrNot,
                              onOk: async () => {
                                await apiAccountModeCopy(item);
                                Toast(
                                  'success',
                                  I18N.carbonFootprint3.copySuccessful,
                                );
                                fetchData();
                              },
                            });
                          }}
                        >
                          <img src={copy} alt='' />
                        </div>
                      </Tooltip>,
                      'enterprise:model:copy',
                    )}
                    {checkPermissions(
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          history.push({
                            pathname:
                              RouteMaps.enterpriseCarbonAccountingModelDetail,
                            search: `?modelId=${item.modelId}&pageType=edit&step=1`,
                          });
                        }}
                      >
                        {I18N.carbonFootprint3.details}
                      </Button>,
                      'enterprise:model:edit',
                    ) ??
                      checkPermissions(
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            history.push({
                              pathname:
                                RouteMaps.enterpriseCarbonAccountingModelDetail,
                              search: `?modelId=${item.modelId}&pageType=show&step=1`,
                            });
                          }}
                        >
                          {I18N.carbonFootprint3.details}
                        </Button>,
                        'enterprise:model:info',
                      )}
                  </div>
                </div>
              ))}
            </div>
            {list.length === 0 && <Empty />}
          </Spin>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Pagination
              current={Number(params.pageNum)}
              pageSize={Number(params.pageSize)}
              onChange={onChange}
              total={total}
            />
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default List;
