/**
 * @file 打卡限制
 * @author qifeng
 */
import I18N from '@src/lang/I18N';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { useEffect, useState } from 'react';
import { FormActions } from '@src/components/FormActions';
import { useForm } from 'antd/es/form/Form';
import { Page } from '@src/components/Page';
import { RouteMaps } from '@src/router/route-paths';
import { Form, Input, Radio, TimePicker, TreeSelect } from 'antd';
import { Select } from '@src/components/Select';
import classNames from 'classnames';
import { Options } from '@src/typings/utils';
import {
  addTripUsingPOSTDefaultApi,
  editTripUsingPOSTDefaultApi,
  SceneTripDto,
  tripInfoUsingGETDefaultApi,
} from '@src/sdks/java/carbonAccount';
import { useHistory, useParams } from 'react-router-dom';
import { Toast } from '@src/utils/Toast';
import { PageShowType } from '@src/utils/types';
import moment, { Moment } from 'moment';
import { defaultsDeep } from 'lodash-es';
import { limitRecordRange } from '../utils/columns';
import { useOrganizations } from '../../utils';
import style from './limitMap.module.less';
import GMap, { carbonstopPoint } from '../../component/GMap';
import { limitOptions } from '../utils';

const runderRadioGroup = (
  options: Options,
  onChange: (v: number) => any,
  value: number,
) => (
  <Radio.Group
    onChange={ev => {
      onChange(+ev.target.value);
    }}
    value={value}
  >
    {options.map(o => (
      <Radio value={o.value}>{o.label}</Radio>
    ))}
  </Radio.Group>
);

function LimitMap() {
  /** 组织架构 */
  const organizations = useOrganizations();
  const params = useParams<{ id: string; dataId?: string }>();
  const { dataId } = params;
  const history = useHistory();
  let pageType = PageShowType.add;
  const timeFormat = 'HH:mm';
  if (dataId) {
    const isShow = history.location.pathname.includes('/show/');

    pageType = isShow ? PageShowType.show : PageShowType.edit;
  }
  const sceneId = +params.id;
  const [form] = useForm<SceneTripDto>();
  const [startMapPoint, setStartMapPoint] = useState({ ...carbonstopPoint });
  const [endMapPoint, setEndMapPoint] = useState({ ...carbonstopPoint });
  const col = 24;

  const [formRadioChecked, setFormRadioChecked] = useState({
    limitOrg: {
      value: 0,
      options: [
        {
          label: I18N.carbonFootprint3.whole,
          value: 0,
        },
        {
          label: I18N.dashborad.grouping,
          value: 1,
        },
      ],
    },
    limitEffectPeriod: {
      value: 0,
      options: limitOptions,
    },
    limitPunch: {
      value: 0,
      options: limitOptions,
    },
    limitSpeed: {
      value: 0,
      options: limitOptions,
    },
    limitPunchStart: {
      value: 0,
      options: limitOptions,
    },
    limitPunchEnd: {
      value: 0,
      options: limitOptions,
    },
  });
  const isSubRequire = (type: keyof typeof formRadioChecked) =>
    +formRadioChecked[type].value === 1;
  const setValue = (v: number, type: keyof typeof formRadioChecked) => {
    setFormRadioChecked(s => {
      s[type].value = v;
      return { ...s };
    });
  };
  const isShow = (type: keyof typeof formRadioChecked) =>
    formRadioChecked[type].value === 1;
  const getValue = (type: keyof typeof formRadioChecked) =>
    formRadioChecked[type].value;

  const formItems = [
    {
      name: 'limitOrg',
      label: I18N.carbonAccount.effectiveGrouping,
      // eslint-disable-next-line react/no-unstable-nested-components
      render: (slot: JSX.Element, isShowSub: boolean) => () =>
        (
          <div>
            {slot}
            {isShowSub && (
              <div
                className={classNames(
                  style.subForm,
                  style.inline,
                  style.selectWidth,
                )}
              >
                <Form.Item
                  name='orgIds'
                  rules={[
                    {
                      required: isSubRequire('limitOrg'),
                      message: I18N.carbonAccount.pleaseSelectEffective3,
                    },
                  ]}
                >
                  <TreeSelect
                    {...{
                      className: classNames(
                        style.treeSelect,
                        style.selectWidth,
                      ),
                      treeData: organizations,
                      treeCheckable: true,
                      placeholder: I18N.carbonFootprint.pleaseSelect,
                      fieldNames: {
                        label: 'orgName',
                        value: 'id',
                      },
                    }}
                  />
                </Form.Item>
              </div>
            )}
          </div>
        ),
    },
    {
      name: 'limitEffectPeriod',
      label: I18N.carbonAccount.effectivePeriod,
      // eslint-disable-next-line react/no-unstable-nested-components
      render: (slot: JSX.Element, isShowSub: boolean) => () =>
        (
          <div>
            {slot}
            {isShowSub && (
              <div
                className={classNames(
                  style.subForm,
                  style.inline,
                  style.selectWidth,
                )}
              >
                <Form.Item
                  name='effectPeriod'
                  rules={[
                    {
                      required: isSubRequire('limitEffectPeriod'),
                      message: I18N.carbonAccount.pleaseSelectEffective2,
                    },
                  ]}
                >
                  <Select
                    aria-label='showTimes'
                    {...{
                      className: style.selectWidth,
                      placeholder: I18N.carbonFootprint.pleaseSelect,
                      options: limitRecordRange(),
                    }}
                  />
                </Form.Item>
              </div>
            )}
          </div>
        ),
    },
    {
      name: 'limitPunch',
      label: I18N.carbonAccount.checkInTime,
      // eslint-disable-next-line react/no-unstable-nested-components
      render: (slot: JSX.Element, isShowSub: boolean) => () =>
        (
          <div>
            {slot}
            {isShowSub && (
              <div
                className={classNames(
                  style.subForm,
                  style.inline,
                  style.selectWidth,
                )}
              >
                <Form.Item
                  name='punchStartTime'
                  rules={[
                    {
                      validator(rule, value) {
                        if (!isSubRequire('limitPunch'))
                          return Promise.resolve('');
                        if (!value) {
                          return Promise.reject(new Error(I18N.carbonAccount.pleaseSelectStart));
                        }
                        const endTime = form.getFieldValue(
                          'punchEndTime',
                        ) as Moment;

                        if (endTime && endTime.diff(value) < 0)
                          return Promise.reject(
                            new Error(I18N.carbonAccount.startDateNotAvailable),
                          );
                        return Promise.resolve('');
                      },
                    },
                  ]}
                >
                  <TimePicker format={timeFormat} placeholder={I18N.carbonAccount.startDate} />
                </Form.Item>
                <div className={style.devideLine}> - </div>
                <Form.Item
                  name='punchEndTime'
                  rules={[
                    {
                      validator(rule, value) {
                        if (!isSubRequire('limitPunch'))
                          return Promise.resolve('');
                        if (!value) {
                          return Promise.reject(new Error(I18N.carbonAccount.pleaseSelectEnd));
                        }
                        const startTime = form.getFieldValue(
                          'punchStartTime',
                        ) as Moment;
                        if (startTime && startTime.diff(value) > 0)
                          return Promise.reject(
                            new Error(I18N.carbonAccount.endTimeNotAvailable),
                          );
                        return Promise.resolve('');
                      },
                    },
                  ]}
                >
                  <TimePicker format={timeFormat} placeholder={I18N.carbonAccount.endDate} />
                </Form.Item>
              </div>
            )}
          </div>
        ),
    },
    {
      name: 'limitSpeed',
      label: I18N.carbonAccount.speedLimitK,

      // eslint-disable-next-line react/no-unstable-nested-components
      render: (slot: JSX.Element, isShowSub: boolean) => () =>
        (
          <div>
            {slot}
            {isShowSub && (
              <div
                className={classNames(
                  style.selectWidth,
                  style.numberRange,
                  style.subForm,
                )}
              >
                <Form.Item
                  name='speedDown'
                  rules={[
                    {
                      validator(rule, value) {
                        const maxVal = form.getFieldValue('speedUp');
                        if (!isSubRequire('limitSpeed'))
                          return Promise.resolve();
                        if (!value)
                          return Promise.reject(new Error(I18N.carbonAccount.pleaseEnterTheSpeed2));
                        const v = +value;
                        if (v < 0)
                          return Promise.reject(new Error(I18N.carbonAccount.theSpeedCannotBeSmall));
                        if (v > 999)
                          return Promise.reject(new Error(I18N.carbonAccount.theSpeedCannotBeHigh));
                        if (maxVal && maxVal < 999 && maxVal >= 0 && v > maxVal)
                          return Promise.reject(
                            new Error(I18N.carbonAccount.valueCannotBeLarge),
                          );

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    type='number'
                    placeholder={I18N.carbonAccount.lowerLimitOfSpeed}
                    min={0}
                    max={999}
                  />
                </Form.Item>
                <div className={style.devideLine}> - </div>
                <Form.Item
                  name='speedUp'
                  rules={[
                    {
                      validator(rule, value) {
                        const minVal = form.getFieldValue('speedDown');

                        if (!isSubRequire('limitSpeed'))
                          return Promise.resolve();
                        if (!value)
                          return Promise.reject(new Error(I18N.carbonAccount.pleaseEnterTheSpeed));
                        const v = +value;
                        if (v < 0)
                          return Promise.reject(new Error(I18N.carbonAccount.theSpeedCannotBeSmall));
                        if (v > 999)
                          return Promise.reject(new Error(I18N.carbonAccount.theSpeedCannotBeHigh));
                        if (minVal && minVal < 999 && minVal >= 0 && v < minVal)
                          return Promise.reject(
                            new Error(I18N.carbonAccount.theValueCannotBeSmall),
                          );
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    type='number'
                    placeholder={I18N.carbonAccount.speedLimit}
                    min={0}
                    max={999}
                  />
                </Form.Item>
              </div>
            )}
          </div>
        ),
    },
    {
      name: 'limitPunchStart',
      label: I18N.carbonAccount.checkInStartingPoint,
      // eslint-disable-next-line react/no-unstable-nested-components
      render: (slot: JSX.Element, isShowSub: boolean) => () =>
        (
          <div>
            {slot}
            {isShowSub && (
              <div className={classNames(style.subForm, style.selectWidth)}>
                <Form.Item
                  name='punchStartAddress'
                  rules={[
                    {
                      required: isSubRequire('limitPunchStart'),
                      message: I18N.carbonAccount.pleaseSelectClockIn2,
                    },
                  ]}
                >
                  <GMap
                    className={style.map}
                    points={startMapPoint.points}
                    pointName={startMapPoint.pointName}
                    circleRadius={startMapPoint.circleRadius}
                    onPointChange={async params => {
                      form.setFieldsValue({
                        punchStartAddress: params.pointName,
                      });
                      setStartMapPoint(params);
                    }}
                  />
                </Form.Item>
              </div>
            )}
          </div>
        ),
    },
    {
      name: 'limitPunchEnd',
      label: I18N.carbonAccount.checkInEndpoint,
      // eslint-disable-next-line react/no-unstable-nested-components
      render: (slot: JSX.Element, isShowSub: boolean) => () =>
        (
          <div>
            {slot}
            {isShowSub && (
              <div className={classNames(style.subForm, style.selectWidth)}>
                <Form.Item
                  name='punchEndAddress'
                  rules={[
                    {
                      required: isSubRequire('limitPunchEnd'),
                      message: I18N.carbonAccount.pleaseSelectClockIn,
                    },
                  ]}
                >
                  <GMap
                    className={style.map}
                    points={endMapPoint.points}
                    pointName={endMapPoint.pointName}
                    circleRadius={endMapPoint.circleRadius}
                    onPointChange={async params => {
                      form.setFieldsValue({
                        punchEndAddress: params.pointName,
                      });
                      setEndMapPoint(params);
                    }}
                  />
                </Form.Item>
              </div>
            )}
          </div>
        ),
    },
  ];

  useEffect(() => {
    if (dataId) {
      tripInfoUsingGETDefaultApi(+dataId).then(({ data }) => {
        const result = data?.data;
        // 设置限制值
        setFormRadioChecked(
          defaultsDeep(
            {
              limitOrg: {
                value: result?.limitOrg,
              },
              limitEffectPeriod: {
                value: result?.limitEffectPeriod,
              },
              limitPunch: {
                value: result?.limitPunch,
              },
              limitSpeed: {
                value: result?.limitSpeed,
              },
              limitPunchStart: {
                value: result?.limitPunchStart,
              },
              limitPunchEnd: {
                value: result?.limitPunchEnd,
              },
            },
            formRadioChecked,
          ),
        );
        // 设置地图
        if (
          result?.limitPunchStart &&
          result.punchStartLon &&
          result.punchStartLat
        ) {
          setStartMapPoint({
            points: [+result.punchStartLon, +result.punchStartLat],
            pointName: result.punchStartAddress,
            circleRadius: Number(result.punchStartRadius) || 100,
          });
        }
        if (result?.limitPunchEnd && result.punchEndLon && result.punchEndLat) {
          setEndMapPoint({
            points: [+result.punchEndLon, +result.punchEndLat],
            pointName: result.punchEndAddress,
            circleRadius: Number(result.punchEndRadius) || 100,
          });
        }
        const startTime = result?.punchStartTime
          ? `2020-11-03 ${result.punchStartTime}`
          : undefined;
        const endTime = result?.punchEndTime
          ? `2020-11-03 ${result.punchEndTime}`
          : undefined;

        const checkedOrgs = result?.orgIds?.split(',').map(v => +v);
        // 设置表单
        form.setFieldsValue({
          ...result,
          // @ts-ignore
          orgIds: checkedOrgs,
          // @ts-ignore
          punchStartTime: moment(startTime).isValid()
            ? moment(startTime)
            : undefined,
          // @ts-ignore
          punchEndTime: moment(endTime).isValid() ? moment(endTime) : undefined,
        });
      });
    }
  }, [dataId]);
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
          onClick: () => history.go(-1),
          title: I18N.carbonAccount.editScene,
          key: I18N.carbonAccount.editScene,
        },
        {
          title: I18N.template(I18N.carbonAccount.pageT2, { val1: 
            pageType === PageShowType.add
              ? '添加'
              : pageType === PageShowType.show
              ? '查看'
              : '编辑'
           }),
          key: I18N.carbonAccount.editClockInLimit,
        },
      ]}
    >
      <div className={style.wrapper}>
        <FormItemUtil
          antdFormProps={{
            disabled: pageType === PageShowType.show,
            initialValues: {
              limitOrg: 0,
              limitEffectPeriod: 0,
              limitPunch: 0,
              limitSpeed: 0,
              limitPunchStart: 0,
              limitPunchEnd: 0,
            },
            className: style.awardsChannelForm,
            form,
            onFieldsChange() {
              // form.validateFields();
            },
            layout: 'vertical',
          }}
          formItems={formItems.map(v => ({
            ...v,
            rules: false,
            col,
            type: 'render',
            render: v.render(
              runderRadioGroup(
                formRadioChecked[v.name].options,
                n => {
                  setValue(n, v.name as keyof typeof formRadioChecked);
                },
                getValue(v.name as keyof typeof formRadioChecked),
              ),
              isShow(v.name as keyof typeof formRadioChecked),
            ),
          }))}
        />

        <FormActions
          place='center'
          buttons={[
            {
              title: I18N.carbonFootprint.preserve,
              type: 'primary',
              onClick: async () =>
                form
                  .validateFields()
                  .then(values => {
                    // todo 隐藏时清空数据
                    let result = {
                      ...values,
                      sceneId,
                      // 限制值会被附加表格数据覆盖，需要重写
                      limitOrg: formRadioChecked.limitOrg.value,
                      limitEffectPeriod:
                        formRadioChecked.limitEffectPeriod.value,
                      limitPunch: formRadioChecked.limitPunch.value,
                      limitPunchEnd: formRadioChecked.limitPunchEnd.value,
                      limitPunchStart: formRadioChecked.limitPunchStart.value,
                      limitSpeed: formRadioChecked.limitSpeed.value,
                    };

                    // 组织信息字段修改
                    if (result.orgIds?.length) {
                      result = {
                        ...result,
                        // @ts-ignore
                        orgIds: result.orgIds.join(','),
                      };
                    }
                    // 补充地图起点信息
                    if (result.punchStartAddress) {
                      result = {
                        ...result,
                        punchStartLon: `${startMapPoint.points[0]}`,
                        punchStartLat: `${startMapPoint.points[1]}`,
                        punchStartRadius: `${startMapPoint.circleRadius}`,
                      };
                    }
                    // 补充地图终点信息
                    if (result.punchEndAddress) {
                      result = {
                        ...result,
                        punchEndLon: `${endMapPoint.points[0]}`,
                        punchEndLat: `${endMapPoint.points[1]}`,
                        punchEndRadius: `${endMapPoint.circleRadius}`,
                      };
                    }
                    // 打卡时间字段修改
                    if (
                      Number(result.limitPunch) !== 0 &&
                      result.punchStartTime
                    ) {
                      result = {
                        ...result,
                        punchStartTime: moment(result.punchStartTime)?.format(
                          timeFormat,
                        ),
                        punchEndTime: moment(result.punchEndTime)?.format(
                          timeFormat,
                        ),
                      };
                    }
                    if (dataId)
                      return editTripUsingPOSTDefaultApi({
                        ...result,
                        id: +dataId,
                      }).then(({ data }) => {
                        if (data.code === 200) {
                          Toast('info', I18N.carbonFootprint.modifiedSuccessfully);
                          history.go(-1);
                        }
                      });
                    return addTripUsingPOSTDefaultApi({
                      ...result,
                    }).then(({ data }) => {
                      if (data.code === 200) {
                        Toast('info', I18N.carbonFootprint3.createdSuccessfully);
                        history.go(-1);
                      }
                    });
                  })
                  .catch(err => {
                    // eslint-disable-next-line
                    console.log('form err', err);
                  }),
            },
            {
              title: I18N.carbonFootprint.cancel,
              onClick: async () => {
                history.go(-1);
              },
            },
          ]}
        />
      </div>
    </Page>
  );
}

export default LimitMap;
