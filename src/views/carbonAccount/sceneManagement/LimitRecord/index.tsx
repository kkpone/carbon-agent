/**
 * @file 场景管理 - 行程限制
 * @author 齐枫
 */

import I18N from '@src/lang/I18N';
import { Button } from '@src/components/Button';
import { FormActions } from '@src/components/FormActions';
import { Page } from '@src/components/Page';
import { Table } from '@src/components/Table';
import { TableRef } from '@src/components/TableUtil/types/common';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import {
  RSceneTripResp,
  SceneTripDto,
  tripListUsingGETDefaultApi,
} from '@src/sdks/java/carbonAccount';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useFlattedOrganizations, useOrganizations } from '../../utils';
import { mapColumns } from '../utils/columns';
import style from './index.module.less';

function LimitRecord() {
  const orgsTree = useOrganizations();
  const orgs = useFlattedOrganizations(orgsTree);
  const history = useHistory();
  const params = useParams<{ id: string }>();
  const tableRef = useRef<TableRef>();
  // 是否达到添加行程上线 0 否 1 是
  const [limitAdd, setLimitAdd] = useState(true);
  const sceneId = params.id;
  return (
    <Page
      wrapperClassName={classNames(style.page, 'border-bottom-global-actions')}
      breadCrumbs={[
        {
          href: RouteMaps.CarbonAccountSceneManagement,
          title: I18N.carbonAccount.scenarioManagement,
          key: I18N.carbonAccount.scenarioManagement,
        },
        {
          title: I18N.carbonAccount.travelRestrictions,
          key: I18N.carbonAccount.travelRestrictions,
        },
      ]}
    >
      <div className={style.main}>
        <div className={style.title}>
          <h3>{I18N.carbonAccount.travelRestrictions}</h3>
          {!limitAdd && (
            <div className={style.addMapButton}>
              <Button
                type='primary'
                onClick={async () => {
                  history.push(
                    virtualLinkTransform(
                      RouteMaps.CarbonAccountSceneManagementLocationLimit,
                      [':id', ':dataId?'],
                      [sceneId],
                    ),
                  );
                }}
              >
                {I18N.carbonFootprint.newAddition}</Button>
            </div>
          )}
        </div>
        <Table<SceneTripDto, RSceneTripResp>
          cRef={tableRef}
          columns={mapColumns({
            orgs,
            tableRef,
            onEdit: id => {
              history.push(
                virtualLinkTransform(
                  RouteMaps.CarbonAccountSceneManagementLocationLimit,
                  [':id', ':dataId?'],
                  [sceneId, id],
                ),
              );
            },
            onShow: id => {
              history.push(
                virtualLinkTransform(
                  RouteMaps.CarbonAccountSceneManagementLocationLimitShow,
                  [':id', ':dataId?'],
                  [sceneId, id],
                ),
              );
            },
          })}
          fetchApi={params =>
            tripListUsingGETDefaultApi(params.page, +sceneId, params.size)
          }
          returnFetchApi={r => {
            const result = r.data?.data;
            const data = result?.sceneTripList || [];
            setLimitAdd(!!result?.tripLimit);
            return {
              data,
              count: data.length,
            };
          }}
          pagination={false}
          bordered={false}
        />
      </div>

      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.go(-1);
            },
          },
        ]}
      />
    </Page>
  );
}

export default LimitRecord;
