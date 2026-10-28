/*
 * @@description:场景管理的详情页面
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-16 19:02:44
 */
import {
  FormGrid,
  FormItem,
  Input,
  Select,
  Cascader,
  Checkbox,
  NumberPicker,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { FormActions } from '@src/components/FormActions';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import { FormilyUploadCrop } from '@src/components/FormilyUtil/FormilyUploadCrop';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { PageInfoType } from '@src/router/type';
import {
  infoUsingGET2DefaultApi,
  SceneDto,
  editUsingPOST4DefaultApi,
} from '@src/sdks/java/carbonAccount';
import { GET0fe5b07a73783dda2262767e3946d276 } from '@src/sdks_v2/carbonAccountV2ApiDocs';
import { uuid } from '@src/utils';
import FormilyImgUpload from '@src/views/carbonFootprint3/component/FormilyImgUpload';
import { apiMnumListALLByDictTypeBatch } from '@src/views/emission/Show/service';
import { useMount } from 'ahooks';
import { Card } from 'antd';
import classNames from 'classnames';
import { compact, pick } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import '../../index.less';

import { CheckInput } from './components/CheckInput';
import { CustomTypeRadio } from './components/radio';
import style from './index.module.less';
import { baseSchema, activeSchema } from './schema';
import {
  ApicarbonSceneManagementEnums,
  ApicarbonSceneManagementListPost,
} from '../srvice';
import { SceneManagementDetailLoaction } from '../type';
import { senceType } from '../utils';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormGrid,
    Input,
    Select,
    Cascader,
    Checkbox,
    FormilyImgUpload,
    FormilyUploadCrop,
    CustomTypeRadio,
    CheckInput,
    NumberPicker,
  },
});

const CarbonAccountSceneManagementDetail = () => {
  const history = useHistory();
  const { search } = useLocation<SceneManagementDetailLoaction>();
  const query = new URLSearchParams(search);
  const id = query.get('id');
  const type = query.get('type');
  /** 是否查看 */
  const [isFind] = useState(type === PageInfoType.show);

  const [initialValues, setInitialValues] = useState<any>({
    customType: 0,
    sceneUnit: '002',
    sceneName: '',
    orderNum: '',
    sceneClassify: undefined,
    sceneIcon: undefined,
    red: 0,
    remark: I18N.carbonAccount.everyCompletedActivity,
    picTripConfig: ['0'],
  });

  /** 场景管理的列表-详情 */
  const [listInfo] = useState<SceneDto>();

  const regenerateQRCodeRef = useRef<boolean>();
  /** 初始化获取活动单位字典值 */
  const activeDictType = async () => {
    const res = await apiMnumListALLByDictTypeBatch({
      dictTypes: `Carbon_account,Carbon_account_period`,
    });
    const backPeriod = await ApicarbonSceneManagementEnums({
      enumName: 'periodType',
    });
    if (res.data.code === 200) {
      formProduct.setFieldState('sceneUnit', state => {
        state.dataSource = res.data.data.Carbon_account.map(mp => ({
          label: mp.dictLabel,
          value: mp.dictValue,
        }));
      });
    }
    if (backPeriod.data.code === 200) {
      formProduct.setFieldState('periodType', state => {
        state.dataSource = backPeriod.data.data.map(mp => ({
          label: mp.name,
          value: mp.code,
        }));
      });
    }
  };
  /** 列表详情页 */
  const scenManagementListInfo = async () => {
    if (isNaN(Number(id))) return;
    const res = (await infoUsingGET2DefaultApi(Number(id))) as any;
    setInitialValues({
      ...pick(
        {
          ...res.data.data,
          sceneIcon: [
            {
              uid: '-1',
              name: 'tes.jpg',
              url: res.data.data?.sceneIcon,
            },
          ],
          examplePicList: (res.data.data.examplePicList || []).map(item => ({
            uid: uuid(),
            url: item.url,
            name: item.name,
          })),
          limit: {
            timesMaxValue:
              res.data.data.timesMaxValue >= 0
                ? res.data.data.timesMaxValue
                : undefined,
            scoreMaxValue:
              res.data.data.scoreMaxValue >= 0
                ? res.data.data.scoreMaxValue
                : undefined,
            limitType: res.data.data.limitType || 0,
          },
        },
        [
          'customType',
          'sceneIcon',
          'orderNum',
          'sceneClassify',
          'examplePicList',
          'unitScore',
          'limitType',
          'periodType',
          'remark',
          'limit',
          'sceneName',
          'sceneId',
          'customScanUrl',
          'sceneCode',
          'sceneUnit',
          'picTripConfig',
        ],
      ),
      red: 0,
    });
  };
  const formProduct = useMemo(
    () =>
      createForm({
        readPretty: type === PageInfoType.show,
        initialValues,
      }),
    [initialValues],
  );

  const init = async () => {
    await scenManagementListInfo(); // 获取详情
  };

  useMount(() => {
    if (type !== PageInfoType.add) {
      init();
    }
  });
  useEffect(() => {
    activeDictType();
    GET0fe5b07a73783dda2262767e3946d276({
      enumName: 'sceneClassify',
    }).then(({ data }) => {
      formProduct.setFieldState('sceneClassify', state => {
        state.dataSource = compact(
          data?.data?.map(d => {
            if (!d.code) return null;
            return {
              ...d,
              label: String(d.name || d.code),
              value: d.code,
            };
          }),
        );
      });
    });
  }, [formProduct]);

  const submit = async () => {
    const data = (await formProduct.submit()) as any;
    const submitData = {
      ...data,
      sceneIcon: data.sceneIcon?.[0]?.url,
      scoreMaxValue: data.limit.scoreMaxValue || 0,
      timesMaxValue: data.limit.timesMaxValue || 0,
      limitType: data.limit.limitType || 0,
      regenerateQRCode: regenerateQRCodeRef.current,
    };
    if (type === PageInfoType.edit) {
      await editUsingPOST4DefaultApi({ ...submitData, id });
    } else {
      await ApicarbonSceneManagementListPost(submitData);
    }

    history.push(RouteMaps.CarbonAccountSceneManagement);
  };
  const headerText = {
    [PageInfoType.add]: I18N.carbonAccount.newScenarios,
    [PageInfoType.edit]: I18N.carbonAccount.editScene,
    [PageInfoType.show]: I18N.carbonAccount.viewingScenes,
  };
  return (
    <div className={classNames('carbonAccount', style.carbonAccountDetail)}>
      <div className={style.border}>
        <span className={style.block}>
          {I18N.carbonAccount.scenarioManagement}
        </span>{' '}
        / {type && headerText[type]}
      </div>
      <div className={style.titleWrapper}>
        <span>{I18N.carbonAccount.sceneAttributes}</span>
        {typeof listInfo?.sceneType === 'number'
          ? senceType[listInfo?.sceneType] || I18N.carbonFootprint.custom
          : I18N.carbonFootprint.custom}
      </div>
      <div className={style.sceneMain}>
        <Card>
          <div className='formTitle mb20'>
            {I18N.carbonFootprint3.basicInformation}
          </div>

          <FormilyCommon form={formProduct}>
            <div>
              <Card>
                <SchemaField
                  schema={baseSchema({
                    isEdit: PageInfoType.add !== type,
                    onRegenerate: () => {
                      regenerateQRCodeRef.current = true;
                      formProduct
                        .query('customType')
                        .take()
                        ?.setComponentProps({ downloadDisabled: true });
                    },
                  })}
                />
              </Card>
              <Card>
                <SchemaField
                  schema={activeSchema()}
                  // scope={{
                  //   useFieldUnitDictSource,
                  //   useFieldSetValueByLabel,
                  // }}
                />
              </Card>
            </div>
          </FormilyCommon>
        </Card>
      </div>
      <FormActions
        place='center'
        buttons={compact([
          !isFind && {
            title: I18N.components.submit,
            type: 'primary',
            onClick: async () => submit(),
          },
          {
            title: I18N.carbonFootprint.return,
            onClick: async () =>
              history.push(RouteMaps.CarbonAccountSceneManagement),
          },
        ])}
      />
    </div>
  );
};

export default CarbonAccountSceneManagementDetail;
