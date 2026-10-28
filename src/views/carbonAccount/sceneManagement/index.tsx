/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-16 19:05:52
 */
/**
 * 场景管理
 * @returns
 */
import { PlusOutlined } from '@ant-design/icons';
import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { PageInfoType } from '@src/router/type';
import { SceneDto } from '@src/sdks/java/carbonAccount';
import { GET0fe5b07a73783dda2262767e3946d276 } from '@src/sdks_v2/carbonAccountV2ApiDocs';
import { Options } from '@src/typings/utils';
import { Toast } from '@src/utils/Toast';
import { Form, FormProps, Modal, Button } from 'antd';
import { AxiosResponse } from 'axios';
import { compact } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './index.module.less';
import {
  carbonAccountSceneManageSearchForm,
  carbonAccountSceneManageTableCol,
} from './model';
import {
  ApicarbonSceneManagementListGet,
  ApicarbonSceneManagementListPostUpdateStatus,
  deleteScene,
} from './srvice';
import {
  ApiGetSceneManage,
  CarbonAccountSceneManageTableGetParams,
  SceneManagementDetailLoaction,
} from './type';
import '../index.less';

const CarbonAccountSceneManagement = () => {
  const childRef = useRef<TableRef>();
  const history = useHistory<SceneManagementDetailLoaction>();
  /** table的loading */
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  /** 对应的列表详情 */
  const [listInfo, setListInfo] = useState<SceneDto>();
  const [searchForm] = Form.useForm();
  /** 停用或者启用 */
  const [stopOrOpenModel, setStopOrOpenModel] = useState<boolean>(false);
  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] = useState<
    Pick<CarbonAccountSceneManageTableGetParams, 'sceneName'> & {
      page: number;
      size: number;
    }
  >({ page: 1, size: 10 });
  /* 场景分类 */
  const [sceneClassify, setSceneClassify] = useState<Options>([]);
  /** 查看用户 */
  const findUser = (item: SceneDto) => {
    if (item.sceneType === 2) {
      history.push(
        `${RouteMaps.CarbonAccountSceneManagementCustomAdd}?type=${PageInfoType.show}&id=${item.id}`,
      );
    } else {
      history.push(
        `${RouteMaps.CarbonAccountSceneManagementAdd}?type=${PageInfoType.show}&id=${item.id}`,
      );
    }
  };
  /** 表头 */
  const columns = [
    ...carbonAccountSceneManageTableCol(
      searchParamsData.page,
      searchParamsData.size,
    ),
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'set',
      render: (val: string, item: SceneDto) => (
        <TableActions
          menus={compact([
            checkPermissions(
              {
                label: I18N.carbonFootprint.check,
                key: I18N.carbonFootprint.check,
                onClick: () => {
                  findUser(item);
                },
              },
              'carbonAccount:scene:info',
            ),
            checkPermissions(
              {
                label: I18N.carbonFootprint.edit,
                key: I18N.carbonFootprint.edit,
                onClick: () => {
                  history.push(
                    `${
                      item.sceneType === 2
                        ? RouteMaps.CarbonAccountSceneManagementCustomAdd
                        : RouteMaps.CarbonAccountSceneManagementAdd
                    }?type=${PageInfoType.edit}&id=${item.id}`,
                  );
                },
              },
              'carbonAccount:scene:edit',
            ),
            checkPermissions(
              // @ts-ignore
              item.sceneStatus === 1 && {
                label: I18N.carbonFootprint.enable,
                key: I18N.carbonFootprint.enable,
                onClick: async () => {
                  if (!item.id) return;
                  setTableLoading(true);

                  const res =
                    await ApicarbonSceneManagementListPostUpdateStatus({
                      id: item.id,
                      sceneStatus: 0,
                    });
                  if (res.data.code === 200) {
                    Toast('success', I18N.supplyChain2.successfullyEnabled);
                    childRef.current?.reset();
                  } else {
                    Toast('error', res.data.msg);
                  }

                  setTableLoading(false);
                },
              },
              'carbonAccount:scene:updateStatus',
            ),
            checkPermissions(
              // @ts-ignore
              item.sceneStatus !== 1 && {
                label: I18N.carbonFootprint.deactivate,
                key: I18N.carbonFootprint.deactivate,
                onClick: () => {
                  setListInfo(item);
                  setStopOrOpenModel(true);
                },
              },
              'carbonAccount:scene:updateStatus',
            ),
            checkPermissions(
              // @ts-ignore
              item.limitTrip === 1 && {
                label: I18N.carbonAccount.travelRestrictions,
                key: I18N.carbonAccount.travelRestrictions,
                onClick: () => {
                  history.push(
                    virtualLinkTransform(
                      RouteMaps.CarbonAccountSceneManagementLocationLimitRecords,
                      [':id'],
                      [item.id],
                    ),
                  );
                },
              },
              'carbonAccount:scene:tripList',
            ),
            checkPermissions(
              // @ts-ignore
              item.sceneType === 2 && {
                label: I18N.carbonFootprint.delete,
                key: I18N.carbonFootprint.delete,
                onClick: () => {
                  Modal.confirm({
                    title: I18N.carbonAccount.deleteScene,
                    content: I18N.carbonAccount.sceneDeletionNotAllowed,
                    onOk: async () => {
                      if (!item.id) return;

                      setTableLoading(true);

                      const res = await deleteScene({ id: item.id });
                      if (res.data.code === 200) {
                        Toast('success', I18N.carbonFootprint.deleteSuccessful);
                        childRef.current?.reset();
                      } else {
                        Toast('error', res.data.msg);
                      }

                      setTableLoading(false);
                    },
                  });
                },
              },
              'carbonAccount:scene:deleted',
            ),
            // 自定义的场景
            // @ts-ignore
          ])}
        />
      ),
    },
  ];
  const returnFetchApi = (back: AxiosResponse<ApiGetSceneManage, any>) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };
  /** 搜索回调 */
  const searchSub = () => {
    const res = searchForm.getFieldsValue();
    setSearchParamsData({ ...res, page: 1, size: searchParamsData.size });
  };
  const resetBack = () => {
    setSearchParamsData({ page: 1, size: searchParamsData.size });
  };
  useEffect(() => {
    GET0fe5b07a73783dda2262767e3946d276({
      enumName: 'sceneClassify',
    }).then(({ data }) => {
      setSceneClassify(
        compact(
          data?.data?.map(d => {
            if (!d.code) return null;
            return {
              ...d,
              label: String(d.name || d.code),
              value: String(d.code),
            };
          }),
        ),
      );
    });
  }, []);
  return (
    <div className=' border-bottom-global-actions autoHeight'>
      <div className={styles.header}>
        <div>{I18N.carbonAccount.scenarioManagement}</div>
        <div>
          {checkPermissions(
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => {
                history.push(
                  `${RouteMaps.CarbonAccountSceneManagementCustomAdd}?type=${PageInfoType.add}`,
                );
              }}
            >
              {I18N.carbonAccount.newScenarios}
            </Button>,
            'carbonAccount:scene:add',
          )}
        </div>
      </div>
      <div className='main'>
        <div>
          <SearchFormUtil
            antdFormProps={searchFormProps}
            searchSub={searchSub}
            resetBack={resetBack}
            formItems={carbonAccountSceneManageSearchForm({ sceneClassify })}
          />
        </div>
        {/* <div className='setButton'>
          <Button
            onClick={() => {
              history.push(RouteMaps.CarbonAccountSceneManagementAdd, {
                status: 'add',
              });
            }}
            type='primary'
          >
            新增
          </Button>
        </div> */}
        <div style={{ marginTop: 20 }}>
          <CommonTable<SceneDto, any>
            bordered={false}
            loading={tableLoading}
            searchParams={searchParamsData}
            cRef={childRef}
            pageSize={10}
            fetchApi={() => ApicarbonSceneManagementListGet(searchParamsData)}
            returnFetchApi={returnFetchApi}
            columns={columns}
            rowKey='id'
            pagePosition
            pagination={{
              current: searchParamsData.page,
              pageSize: searchParamsData.size,
              position: ['bottomRight'],
              showTotal: totalCount =>
                I18N.template(I18N.supplyChain.totalTota12, {
                  val1: totalCount,
                }),
            }}
            onChange={({ current, pageSize }) => {
              setSearchParamsData({
                ...searchParamsData,
                page: current ?? 1,
                size: pageSize ?? 10,
              });
            }}
          />
        </div>
        <div>
          <Modal
            title={I18N.carbonFootprint.prompt}
            maskClosable={false}
            className='userListModelClass'
            open={stopOrOpenModel}
            okButtonProps={{
              loading: tableLoading,
            }}
            onOk={async () => {
              if (!listInfo?.id) return;
              setTableLoading(true);

              const res = await ApicarbonSceneManagementListPostUpdateStatus({
                id: listInfo.id,
                sceneStatus: 1,
              });
              if (res.data.code === 200) {
                Toast('success', I18N.carbonAccount.deactivatedSuccessfully);
                setStopOrOpenModel(false);
                childRef.current?.reset();
              } else {
                Toast('error', res.data.msg);
              }

              setTableLoading(false);
            }}
            onCancel={() => setStopOrOpenModel(false)}
          >
            <div>{I18N.carbonAccount.afterDeactivationThisVenue}</div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default CarbonAccountSceneManagement;
