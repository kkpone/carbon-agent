/**
 * @file 主题设置
 * @author qifeng
 */
import I18N from '@src/lang/I18N';
import { Button } from '@src/components/Button';
import { Table } from '@src/components/Table';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { useHistory } from 'react-router-dom';
import {
  checkStatusUsingPOSTDefaultApi,
  pageUsingGET3DefaultApi,
  RPageResultThemeDto,
  ThemeDto,
} from '@src/sdks/java/carbonAccount';
import { TableActions } from '@src/components/Table/components/TableActions';
import { returnTableRows } from '@src/components/TableUtil/util';
import { useRef } from 'react';
import { Toast } from '@src/utils/Toast';
import { checkPermissions } from '@src/components/Permission/utils';
import { compact } from 'lodash-es';
import { TableRef } from '@src/components/TableUtil/types/common';
import styles from './index.module.less';
import { themeColumns } from '../utils';

function Theme() {
  const history = useHistory();
  const tableRef = useRef<TableRef>();
  const columns = [
    ...themeColumns(),
    {
      dataIndex: 'id',
      title: I18N.carbonFootprint.operation,
      render(id, row) {
        return (
          <TableActions
            menus={compact([
              checkPermissions(
                {
                  label: I18N.carbonFootprint3.details,
                  key: I18N.carbonFootprint3.details,
                  onClick: async () => {
                    history.push(
                      virtualLinkTransform(
                        RouteMaps.CarbonAccountBaseSettingThemeDetail,
                        [':id?'],
                        [id],
                      ),
                    );
                  },
                },
                'carbonAccount:theme:detail',
              ),
              // 默认主题不能编辑
              row.themeStatus !== 1 &&
                checkPermissions(
                  {
                    label: I18N.carbonFootprint.edit,
                    key: I18N.carbonFootprint.edit,
                    onClick: async () => {
                      history.push(
                        virtualLinkTransform(
                          RouteMaps.CarbonAccountBaseSettingThemeEdit,
                          [':id'],
                          [id],
                        ),
                      );
                    },
                  },
                  'carbonAccount:theme:edit',
                ),
              +row.checkStatus !== 1 &&
                checkPermissions(
                  {
                    //  // "checkStatus": 0, //是否选用 0 未选用 1 选用
                    label: I18N.carbonAccount.usingThemes, // 取消使用
                    key: I18N.carbonAccount.usingThemes,
                    onClick: async () =>
                      checkStatusUsingPOSTDefaultApi(row.id).then(
                        ({ data }) => {
                          if (data.code === 200) {
                            Toast('success', I18N.carbonAccount.changeTheThemeTo);
                            tableRef.current?.reset();
                          }
                        },
                      ),
                  },
                  // todo
                  'use:theme',
                ),
            ])}
          />
        );
      },
    },
  ];

  return (
    <div className={styles.themes}>
      <header>
        <h3>{I18N.carbonAccount.themeSettings}</h3>
        {checkPermissions(
          <Button
            className={styles.addBtn}
            onClick={async () => {
              history.push(
                virtualLinkTransform(
                  RouteMaps.CarbonAccountBaseSettingThemeDetail,
                  [':id?'],
                  [''],
                ),
              );
            }}
            type='primary'
          >
            {I18N.carbonFootprint.newAddition}</Button>,
          'carbonAccount:theme:add',
        )}
      </header>
      <Table<ThemeDto, RPageResultThemeDto>
        bordered={false}
        cRef={tableRef}
        pageSize={100}
        columns={columns}
        fetchApi={params => pageUsingGET3DefaultApi(params.page, params.size)}
        returnFetchApi={r => returnTableRows(r)}
        pagination={false}
      />
    </div>
  );
}

export default Theme;
