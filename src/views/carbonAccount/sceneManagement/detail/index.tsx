/*
 * @@description:场景管理的详情页面
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:44
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-16 19:02:44
 */

import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import I18N from '@src/lang/I18N';
import { PageInfoType } from '@src/router/type';
import {
  infoUsingGET2DefaultApi,
  SceneDto,
  SceneDtoSceneTypeEnum,
  editUsingPOST4DefaultApi,
} from '@src/sdks/java/carbonAccount';
import { GET0fe5b07a73783dda2262767e3946d276 } from '@src/sdks_v2/carbonAccountV2ApiDocs';
import { Options } from '@src/typings/utils';
import { antFormSrcoll2FirstErrorConfig } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { apiMnumListALLByDictTypeBatch } from '@src/views/emission/Show/service';
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  Form,
  FormProps,
  Input,
  Menu,
  Popconfirm,
  Popover,
} from 'antd';
import { useForm } from 'antd/es/form/Form';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { compact, defaultsDeep } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import {
  carbonAccountSceneManagementBasicsDetailItem,
  carbonAccountSceneManagementIntegralDetailItem,
} from './model';
import { LimitValue, SceneManagementDetailLoaction } from '../type';
import '../../index.less';
import {
  ApicarbonSceneManagementEnums,
  ApicarbonSceneManagementListPost,
} from '../srvice';
import {
  addMapScenes,
  SceneRules,
  sceneRules,
  sceneRulesValue,
  senceType,
} from '../utils';

import qrCodeIcon from '@src/assets/svg/qrcode_icon.svg';

import style from './index.module.less';

import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';

import { RouteMaps } from '@/router/route-paths';

const showPicTypeSceneCodeList = [
  'MRCJ0004',
  'MRCJ0012',
  'MRCJ0010',
  'MRCJ0011',
  'MRCJ0007',
  'MRCJ0008',
  'MRCJ0009',
  'MRCJ0005',
  'MRCJ0013',
  'MRCJ0006',
];

const CarbonAccountSceneManagementDetail = () => {
  const history = useHistory();

  const { search } = useLocation<SceneManagementDetailLoaction>();
  const query = new URLSearchParams(search);
  const id = query.get('id');
  const type = query.get('type');
  /** 是否查看 */
  const [isFind] = useState(type === PageInfoType.show);
  /** 是否是编辑状态 */
  const [isEdit] = useState(type === PageInfoType.edit);
  /* 场景分类 */
  const [sceneClassify, setSceneClassify] = useState<Options>([]);

  /** 选择类型 */
  const [selectTypeVal, setSelectTypeVal] = useState<SceneDtoSceneTypeEnum>();
  const defaultLimit: LimitValue = {
    value: 0,
    checked: false,
  };
  /** 1碳币限制、2次数限制 */
  const [limit, setLimit] = useState<Record<SceneRules, LimitValue>>({
    [SceneRules.score]: {
      ...defaultLimit,
    },
    [SceneRules.times]: { ...defaultLimit },
  });

  /** 场景管理-活动单位字典值 */
  const [activeSceneUnit, setActiveSceneUnit] = useState<
    { label: string; value: string }[]
  >([]);
  /** 场景管理-活动周期 */
  const [activeScenePeriodType, setActiveScenePeriodType] =
    useState<{ label: string; value: number }[]>();
  /** 默认场景列表数据 */
  const [defaultSceneTplDatas] = useState<SceneDto[]>();

  /** 场景管理的列表-详情 */
  const [listInfo, setListInfo] = useState<SceneDto>();
  const [SceneManagementDetailForm] = Form.useForm();
  /** 基础信息表单 */
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form: SceneManagementDetailForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  /** 碳币规则 */
  const integralFormProps: FormProps = {
    ...formPropsInit(),
    form: SceneManagementDetailForm,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const [regenerateQRCode, setRegenerateQRCode] = useState<boolean>();
  /** 初始化获取活动单位字典值 */
  const activeDictType = async () => {
    const res = await apiMnumListALLByDictTypeBatch({
      dictTypes: `Carbon_account,Carbon_account_period`,
    });
    const backPeriod = await ApicarbonSceneManagementEnums({
      enumName: 'periodType',
    });
    if (res.data.code === 200) {
      setActiveSceneUnit(
        res.data.data.Carbon_account.map(mp => ({
          label: mp.dictLabel,
          value: mp.dictValue,
        })),
      );
    }
    if (backPeriod.data.code === 200) {
      setActiveScenePeriodType(
        backPeriod.data.data.map(mp => ({
          label: mp.name,
          value: mp.code,
        })),
      );
    }
  };
  const [limitForm] = useForm();
  /** 提交表单 */
  const subSceneForm = () =>
    SceneManagementDetailForm.validateFields().then(async val =>
      limitForm.validateFields().then(async () => {
        const data: SceneDto = val;

        // @ts-ignore
        data.sceneIcon = data.sceneIcon?.[0]?.url;

        // @ts-ignore
        data.regenerateQRCode = regenerateQRCode;

        data.sceneType = selectTypeVal;
        if (limit.score.checked && limit.times.checked) {
          // @ts-ignore
          data.limitType = 3;
        }
        if (limit.score.checked) {
          // @ts-ignore
          data.limitType = data.limitType || sceneRulesValue.score;
        }
        data.scoreMaxValue = limit.score.value || 0;
        if (limit.times.checked) {
          // @ts-ignore
          data.limitType = data.limitType || sceneRulesValue.times;
        }
        data.timesMaxValue = limit.times.value || 0;
        // 添加单位字典的名称，C端用户要用到
        if (activeSceneUnit) {
          const findUnit = activeSceneUnit.find(
            back => back.value === data.sceneUnit,
          );
          findUnit && (data.sceneUnitName = findUnit.label);
        }
        // 如果不是自定义场景
        if (selectTypeVal !== SceneDtoSceneTypeEnum[2]) {
          const find = defaultSceneTplDatas?.find(
            back => back.sceneName === data.sceneName,
          );
          data.sceneTplId = find?.id;
        } else {
          data.sceneCode = `U-${data.sceneCode}`;
        }

        if (isEdit) {
          const res = await editUsingPOST4DefaultApi({
            ...data,
            id: listInfo?.id,
          });
          if (res.data.code === 200) {
            Toast('success', I18N.carbonAccount.editSceneAs);
            history.push(RouteMaps.CarbonAccountSceneManagement);
          } else {
            Toast('error', res.data.msg);
          }
        } else {
          // @ts-ignore
          const res = await ApicarbonSceneManagementListPost(data);
          if (res.data.code === 200) {
            Toast('success', I18N.carbonAccount.addSceneAs);
            history.push(RouteMaps.CarbonAccountSceneManagement);
          } else {
            Toast('error', res.data.msg);
          }
        }
      }),
    );
  /** 列表详情页 */
  const scenManagementListInfo = async () => {
    if (!id) return;
    const res = await infoUsingGET2DefaultApi(id as any);
    const resData = res.data?.data;
    setSelectTypeVal(resData?.sceneType);
    // 限制类型。0不限制 1限制分数 2 限制次数 3 限制分数和次数
    const limitType = resData?.limitType;
    setLimit(s => ({
      ...s,
      [SceneRules.score]: {
        // @ts-ignore
        checked: limitType === 1 || limitType === 3,
        value: resData?.scoreMaxValue || 0,
      },
      [SceneRules.times]: {
        // @ts-ignore
        checked: limitType >= 2,
        value: resData?.timesMaxValue || 0,
      },
    }));
    setListInfo({ ...resData });

    SceneManagementDetailForm.setFieldsValue({
      ...resData,
      sceneClassify: Number.isNaN(Number(resData?.sceneClassify))
        ? undefined
        : `${resData?.sceneClassify}`,
      sceneIcon: undefined,
    });
  };

  useEffect(() => {
    // @ts-ignore
    const { sceneIcon } = listInfo || {};

    if (sceneIcon) {
      SceneManagementDetailForm.setFieldsValue({
        sceneIcon: [{ uid: '-1', name: '', url: sceneIcon }],
      });
    }
  }, [listInfo, SceneManagementDetailForm]);

  useEffect(() => {
    if (
      listInfo &&
      activeSceneUnit.length &&
      addMapScenes.some(s => s.sceneCode === listInfo.sceneCode)
    ) {
      // "公里" 固定场景写死为公里
      const val = activeSceneUnit.find(a => a.value === '006');
      if (val)
        SceneManagementDetailForm.setFieldsValue({
          sceneUnit: val.value,
        });
    }
  }, [listInfo, activeSceneUnit]);

  const init = async () => {
    await activeDictType();
    await scenManagementListInfo(); // 获取详情
  };
  const checkLimitValue = () => {
    // 检查是否有选中项
    const checked = Object.keys(limit).filter(k => limit[k].checked);
    if (!checked.length) {
      return I18N.carbonAccount.pleaseSelectRestrictions;
    }
    // 检查是否有值
    const noValues = checked.reduce((tmp, nextKey) => {
      const { value } = limit[nextKey];
      const tip = I18N.template(I18N.carbonAccount.scene, {
        val1: sceneRules[nextKey],
      });
      if (value === '') return tmp ? `${tmp}、${tip}` : tip;
      return tmp;
    }, '');
    return noValues;
  };
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (isEdit) {
      // 初次进入不做验证
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      } else {
        limitForm.validateFields();
      }
    }
  }, [limit]);
  useEffect(() => {
    init();
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
    <div className={classNames('carbonAccount', style.carbonAccountDetail)}>
      <div className={style.sceneMain}>
        <Card>
          <div className='formTitle mb20'>
            {I18N.carbonFootprint3.basicInformation}
          </div>
          {(
            listInfo as unknown as {
              urlList: { name: string; type: number; url: string }[];
            }
          )?.urlList instanceof Array && (
            <>
              <div className={style.qrCodeTitle}>
                {I18N.carbonFootprint3.qrCode}
              </div>
              <div className={style.qrCodeContent}>
                <Dropdown
                  trigger={['click']}
                  disabled={regenerateQRCode}
                  overlay={
                    <Menu
                      className={style.qrCodeList}
                      onClick={e => {
                        e.domEvent.stopPropagation();
                      }}
                    >
                      {(
                        listInfo as unknown as {
                          urlList: {
                            name: string;
                            type: number;
                            url: string;
                          }[];
                        }
                      ).urlList.map(({ name, url, type: urlType }) => (
                        <Menu.Item className={style.qrCodeItem} key={url}>
                          <span>{name}</span>
                          <div>
                            <DownloadOutlined
                              className={style.qrCodeOpeBtn}
                              onClick={() => {
                                saveAs(url, name);
                              }}
                            />
                            {urlType !== 2 && (
                              <Popover
                                trigger={['click']}
                                placement='right'
                                content={
                                  <img
                                    className={style.qrCodeImg}
                                    alt=''
                                    src={url}
                                  />
                                }
                              >
                                <EyeOutlined className={style.qrCodeOpeBtn} />
                              </Popover>
                            )}
                          </div>
                        </Menu.Item>
                      ))}
                    </Menu>
                  }
                >
                  <Button className={style.qrCodeBtn}>
                    <img className={style.qrCodeIcon} alt='' src={qrCodeIcon} />
                    {I18N.carbonFootprint3.downloadQrCode}
                  </Button>
                </Dropdown>
                {isEdit && (
                  <Popconfirm
                    title='确定重新生成二维码吗？'
                    description='确定并提交保存后旧二维码将无法使用'
                    onConfirm={() => {
                      setRegenerateQRCode(true);
                    }}
                  >
                    <Button type='link'>重新生成二维码</Button>
                  </Popconfirm>
                )}
              </div>
            </>
          )}
          <div className='mb20'>
            <span>{I18N.carbonAccount.sceneAttributes}</span>
            {typeof listInfo?.sceneType === 'number'
              ? senceType[listInfo?.sceneType] || '-'
              : '-'}
          </div>

          <div className='mb20'>
            <FormItemUtil
              antdFormProps={basicsFormProps}
              formItems={carbonAccountSceneManagementBasicsDetailItem(
                false,
                isEdit,
                isFind,
                SceneManagementDetailForm,
                showPicTypeSceneCodeList.includes(listInfo?.sceneCode || ''),
                // @ts-ignore
                listInfo?.defaultIcon,
                sceneClassify,
              )}
            />
          </div>
        </Card>
        <Card>
          <div className='formTitle mb20'>
            {I18N.carbonAccount.activityRules}
          </div>
          <div className='mb20'>
            <FormItemUtil
              antdFormProps={{ ...integralFormProps, disabled: !isEdit }}
              formItems={carbonAccountSceneManagementIntegralDetailItem(
                addMapScenes.some(t => t.sceneCode === listInfo?.sceneCode),
                isFind,
                activeScenePeriodType,
                activeSceneUnit,
                listInfo?.sceneCode === 'MRCJ0021',
              )}
            />
          </div>
          <div className='mb20'>
            <div className='formCustomLabel mr10'>
              {I18N.carbonAccount.carbonCoinRestrictions}
            </div>
          </div>
          <div className={style.limitWrapper}>
            {Object.keys(sceneRules).map(s => (
              <div key={s} className={style.limitItem}>
                {/*  eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label aria-label={s} className={style.limitLabel}>
                  <Checkbox
                    disabled={!isEdit}
                    checked={limit[s].checked}
                    name={s}
                    onChange={ev => {
                      setLimit(
                        defaultsDeep(
                          { [s]: { checked: ev.target.checked } },
                          limit,
                        ),
                      );
                    }}
                  />
                  {sceneRules[s]}
                </label>

                <span>
                  {I18N.carbonAccount.maximumWithinTheCycle3}
                  {sceneRules[s].slice(0, 2)}
                  {I18N.carbonDataManagemen.upperLimit}
                </span>
                <Input
                  disabled={isFind}
                  max={9999}
                  // min={0}
                  placeholder={I18N.carbonFootprint.pleaseEnter}
                  style={{ width: 100, margin: '0 10px' }}
                  value={limit[s].value}
                  onChange={ev => {
                    const val = ev.target.value;
                    const value = val === '' ? val : +val <= 0 ? 0 : val;
                    setLimit(defaultsDeep({}, { [s]: { value } }, limit));
                  }}
                />
              </div>
            ))}
            <Form
              form={limitForm}
              className={style.limitForm}
              validateTrigger='change'
              scrollToFirstError={antFormSrcoll2FirstErrorConfig}
            >
              <Form.Item
                name='limit'
                rules={[
                  {
                    validator() {
                      const noValues = checkLimitValue();
                      if (noValues) return Promise.reject(new Error(noValues));
                      return Promise.resolve();
                    },
                  },
                ]}
              />
            </Form>
          </div>
        </Card>
      </div>
      <FormActions
        place='center'
        buttons={compact([
          !isFind && {
            title: I18N.components.submit,
            type: 'primary',
            onClick: async () => subSceneForm(),
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
