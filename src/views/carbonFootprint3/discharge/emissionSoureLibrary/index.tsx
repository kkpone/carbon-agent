/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-18 20:08:09
 * @Date: 2022-12-23 15:45:59
 * @@description: 排放源库
 */

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { listALLByDictTypeBatch } from '@src/api/api';
import { FromItemProps } from '@src/components/FormUtil/type';
import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import { TableActions } from '@src/components/Table/components/TableActions';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Dicts } from '@src/views/emission/Show/type';
import { Button, Form, FormProps, Menu, Modal } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import { compact } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

import { EmissionSourceLibDrawer } from './EmissionSourceLibDrawer';
import { EmissionSourceLibDrawerProps } from './EmissionSourceLibDrawer/type';
import style from './index.module.less';
import {
  carbonFootprintEmissionSoureLibrarySearchForm,
  carbonFootprintEmissionSoureLibraryTableCol,
} from './model';
import {
  getEmissionSoureLibraryMenus,
  getEmissionSoureLibraryTableData,
  getFileEmissionLibImportApi,
  postEmissionSoureLibraryDelete,
  postFileImportAccountEmissionLibApi,
} from './service';
import {
  EmissionLibImportParams,
  EmissionLibImportTableList,
  EmissionSoureLibraryTableData,
  EmissionSoureLibraryTableParams,
} from './type';
import ImportFileModal from '../../component/ImportFileModal';
import { getSysFileStatus } from '../../component/ImportFileModal/service';
import {
  FOOTPRINT3_IMPORT_MODAL_FILE_KEY,
  QUICK_ACCOUNT_EMISSION_ICONFONT_MAP,
} from '../../constant';
import { BackTableData } from '../../type';
import {
  checkEmissionSoureLibraryEditPermissions,
  checkEmissionSoureLibraryInfoPermissions,
} from '../../util/permissions';

const { confirm } = Modal;

const CarbonFootprint3EmissionSoureLibrary = () => {
  const childRef = useRef<TableRef>();
  const [searchForm] = Form.useForm();
  /** 搜索的form */
  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };

  /** 排放源库 - 菜单接口返回值 */
  const [emissionMenu, setEmissionMenu] = useState<ItemType[]>([]);
  /** 选中的菜单 */
  const [activeMenu, setActiveMenu] = useState<number>(0);

  /** 导入文件后返回的code - 用于判断是否异步导入完成 */
  const [importBackCode, setImportBackCode] = useState<number>();

  /** 导入弹框 */
  const [importVisible, setImportVisible] = useState(false);
  /** 下载模版 - 模版地址 */
  const [downLoadTemplateUrl, setDownLoadTemplateUrl] = useState<string>('');
  const [searchImportParams] = useState<EmissionLibImportParams>({
    pageNum: 1,
    pageSize: 10,
    type: 2,
  });

  /** 查询的条件 */
  const [searchParamsData, setSearchParamsData] =
    useState<EmissionSoureLibraryTableParams>();

  /** 侧滑抽屉是否显示 */
  const [showDrawerProps, setShowDrawerProps] = useState<
    Omit<EmissionSourceLibDrawerProps, 'onClose'>
  >({
    visible: false,
    status: 'add',
  });

  const [searchFormItem] = useState<FromItemProps<any>[]>(
    carbonFootprintEmissionSoureLibrarySearchForm(),
  );

  /**
   * 获取接口的菜单
   */
  const getMenus = async () => {
    const { data } = await getEmissionSoureLibraryMenus();
    const menuData: ItemType[] = data.data.map(menu => ({
      label: (
        <div className={style.menuItem}>
          <div className={style.menuImgAndName}>
            {menu.code && (
              <IconAlibaba
                type={QUICK_ACCOUNT_EMISSION_ICONFONT_MAP[menu.code].icon}
                size={20}
                style={{
                  color: QUICK_ACCOUNT_EMISSION_ICONFONT_MAP[menu.code].color,
                  marginRight: 4,
                }}
              />
            )}
            <span>{menu.name}</span>
          </div>

          <span className={style.menuItemCount}>{menu.count}</span>
        </div>
      ),
      // 因为全部没有code
      key: menu.code || 0,
    }));
    setEmissionMenu(menuData);
  };

  /**
   * 更新左侧菜单
   */
  const upadteMenus = async () => {
    await getMenus();
  };

  /**
   * @description: 新增产品
   */
  const goAdd = () => {
    setShowDrawerProps({
      status: 'add',
      emissionId: undefined,
      visible: true,
    });
  };

  /**
   * @description: 前往编辑
   * @param {EmissionSoureLibraryTableData} editItem 编辑的信息
   */
  const goEdit = async (editItem: EmissionSoureLibraryTableData) => {
    setShowDrawerProps({
      status: 'edit',
      visible: true,
      emissionId: editItem.id,
    });
  };

  /**
   * @description: 前往复制
   * @param {EmissionSoureLibraryTableData} editItem 复制信息
   */
  const goCopy = async (editItem: EmissionSoureLibraryTableData) => {
    setShowDrawerProps({
      status: 'copy',
      visible: true,
      emissionId: editItem.id,
    });
  };

  const getColumnsByData = (): ColumnsType<EmissionSoureLibraryTableData> => [
    ...carbonFootprintEmissionSoureLibraryTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      width: 220,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item: EmissionSoureLibraryTableData) => (
        <TableActions
          menus={compact([
            checkPermissions(
              {
                key: '1',
                label: I18N.carbonFootprint3.details,
                onClick: async () => {
                  if (checkEmissionSoureLibraryEditPermissions()) {
                    await goEdit(item);
                  } else if (checkEmissionSoureLibraryInfoPermissions()) {
                    await goDetail(item);
                  }
                },
              },
              'footprint3:libEmission:info',
            ),
            checkPermissions(
              {
                key: '3',
                label: I18N.carbonFootprint.copy,
                onClick: async () => {
                  goCopy(item);
                },
              },
              'footprint3:libEmission:info',
            ),
            checkPermissions(
              {
                key: '2',
                label: I18N.carbonFootprint.delete,
                onClick: () => deleteTable(item),
              },
              'footprint3:libEmission:delete',
            ),
          ])}
        />
      ),
    },
  ];

  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<
      AxiosResponse<BackTableData<EmissionSoureLibraryTableData>>
    >,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });

  /**
   * @description: 删除列表数据
   * @param {EmissionSoureLibraryTableData} deleteItem 被删除的行数据信息
   */
  const deleteTable = async (deleteItem: EmissionSoureLibraryTableData) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis13, {
        val1: deleteItem.name,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await postEmissionSoureLibraryDelete({
            id: deleteItem.id,
          });
          if (back.data.code === 200) {
            await upadteMenus();
            childRef.current?.reset();
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
          }
        } catch {
          /* empty */
        }
      },
    });
  };

  /**
   * @description: 前往详情页
   * @param {EmissionSoureLibraryTableData} detailItem 编辑的信息
   */
  const goDetail = async (detailItem: EmissionSoureLibraryTableData) => {
    setShowDrawerProps({
      status: 'detail',
      visible: true,
      emissionId: detailItem.id,
    });
  };

  /** 搜索提交 */
  const searchSub = () => {
    const val: EmissionSoureLibraryTableParams = searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };
  /** 搜索重置 */
  const resetBack = () => {
    setSearchParamsData({
      ...searchParamsData,
      name: undefined,
    });
  };

  /** 侧滑抽屉新增成功后 */
  const drawerSub = async () => {
    childRef.current?.reset();
    setShowDrawerProps({
      ...showDrawerProps,
      visible: false,
    });
    await upadteMenus();
  };

  /**
   * @description: 导入文件后的回调方法
   */
  const importFileRequestBack = async (url: string, fileName?: string) => {
    const { data } = await postFileImportAccountEmissionLibApi({
      fileUrl: url,
      fileName,
    });
    await upadteMenus();
    return { code: data.code, data: data.data };
  };

  /**
   * 取消导入
   */
  const onCancelImport = () => {
    setImportVisible(false);
  };

  /** 异步导入文件成功回调 */
  const syncFileStatusSuccess = () => {
    setImportBackCode(undefined);
    Toast('success', I18N.carbonFootprint3.importDataAs);
    childRef.current?.reset();
  };

  /**
   * 循环调用接口，判断是否导入异步文件完毕
   * @param id 查询的id
   */
  const getImportBackIdStatus = (id: number) => {
    const interval = setInterval(() => {
      getSysFileStatus({ id }).then(data => {
        if (data.data.data && data.data.data !== 0) {
          clearInterval(interval);
          syncFileStatusSuccess();
        }
      });
    }, 3000);
  };

  /**
   * 导入文件后的返回值
   * @param data 导入后的返回值,用于定时刷新
   */
  const onOkImportBack = (data?: number) => {
    if (data) {
      setImportBackCode(data);
      getSysFileStatus({ id: data })
        .then(fileStatus => {
          if (fileStatus.data.data && fileStatus.data.data !== 0) {
            syncFileStatusSuccess();
          } else {
            // 循环调用导入状态判断 - 每3s执行一次
            getImportBackIdStatus(data);
          }
        })
        .catch(() => {
          setImportBackCode(undefined);
        });
    }
  };

  /**
   * 切换激活的菜单
   * @param key 当前选中的菜单
   */
  const changeMenu = async (key: string) => {
    setActiveMenu(Number(key));
    childRef.current?.reset({
      page: 1,
    });
    setSearchParamsData({
      ...searchParamsData,
      type: key === '0' ? undefined : Number(key),
    });
    // activeMenu
  };

  const init = async () => {
    await getMenus();
    const dic = await listALLByDictTypeBatch<{
      factorUnitM: Dicts[];
      footprint3_export_template: Dicts[];
    }>({
      dictTypes: 'factorUnitM,footprint3_export_template',
    });

    const { footprint3_export_template } = dic.data.data;

    footprint3_export_template.forEach(templ => {
      if (
        templ.dictValue === FOOTPRINT3_IMPORT_MODAL_FILE_KEY.LIB_EMISSION &&
        templ.relatedValue
      ) {
        setDownLoadTemplateUrl(templ.relatedValue);
      }
    });
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={style.emissionSourceLib}>
      <div className={style.header}>
        <div className={style.title}>
          {I18N.carbonFootprint3.emissionSourceRepository}
        </div>
      </div>
      <div className={style.searchContent}>
        <SearchFormUtil
          antdFormProps={searchFormProps}
          searchSub={searchSub}
          resetBack={resetBack}
          formItems={searchFormItem}
        />
        <div className={style.btnContent}>
          {checkPermissions(
            <Button icon={<PlusOutlined />} onClick={goAdd} type='primary'>
              {I18N.carbonFootprint.newAddition}
            </Button>,
            'footprint3:libEmission:add',
          )}
          {checkPermissions(
            <Button
              disabled={!!importBackCode}
              onClick={() => {
                setImportVisible(true);
              }}
            >
              {importBackCode ? (
                <>
                  正在导入中
                  <LoadingOutlined className='m-l-6' />
                </>
              ) : (
                I18N.carbonFootprint.import
              )}
            </Button>,
            'footprint3:libEmission:upload',
          )}
        </div>
      </div>
      <div className={style.main}>
        <div className={style.menuMain}>
          <Menu
            activeKey={String(activeMenu)}
            items={emissionMenu}
            onSelect={item => {
              changeMenu(item.key);
            }}
          />
        </div>
        <div className={style.tableMain}>
          <CommonTable<
            EmissionSoureLibraryTableData,
            any,
            EmissionSoureLibraryTableParams
          >
            bordered={false}
            searchParams={searchParamsData}
            cRef={childRef}
            pageSize={10}
            scroll={{ x: 1200 }}
            fetchApi={params =>
              getEmissionSoureLibraryTableData({
                ...params,
                pageNum: params.page,
                pageSize: params.size,
              })
            }
            returnFetchApi={returnFetchApi}
            columns={getColumnsByData()}
            rowKey='id'
            pagePosition
          />
        </div>
      </div>

      {showDrawerProps.visible && (
        <EmissionSourceLibDrawer
          {...showDrawerProps}
          initMenuCode={activeMenu}
          onSub={drawerSub}
          onClose={() => {
            setShowDrawerProps({
              ...showDrawerProps,
              visible: false,
            });
          }}
        />
      )}

      {importVisible && (
        <ImportFileModal<EmissionLibImportTableList, EmissionLibImportParams>
          title={I18N.carbonFootprint.importEmissionSources}
          visible={importVisible}
          onCancelBack={onCancelImport}
          onOkImport={onOkImportBack}
          downLoadTemplateUrl={downLoadTemplateUrl}
          importFileRequestBack={importFileRequestBack}
          searchParamsData={searchImportParams}
          getFileListRequest={getFileEmissionLibImportApi}
        />
      )}
    </div>
  );
};

export default CarbonFootprint3EmissionSoureLibrary;
