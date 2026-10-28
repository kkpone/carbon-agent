import {
  countResult,
  toolboxHotWater,
  toolboxHotWaterpage,
  toolboxWasteWater,
} from '@src/api/api';
import IconFont from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RootState } from '@src/store';
import VerifyUtils from '@src/utils/verifty';
import { Button, Col, Form, Row, Table } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import style from './index.module.scss';
import {
  FormlistElement,
  informaton,
  listElm,
  TableList,
  TextList,
  TextName,
} from './information';

const ConsultingServe = () => {
  const history = useHistory();
  const [page, setpage] = useState({
    page: 1,
    pagesize: 10,
    total: 0,
  });
  const [total, settotal] = useState(0);
  const watingimg =
    'https://oss-saas.carbonstop.net/consulting-service/caculate/wating.svg';
  // const [ScreenWidth] = useState('67%');
  const [tabledata, setTableDate] = useState([]);
  const [form] = Form.useForm();
  const [result, setresult] = useState('');
  const tablist: string[] = [
    I18N.consulting.carbonEmissionCalculation,
    I18N.consulting.calculationRecords,
  ];
  const [chanageFor, setChanFor] = useState<TextName['Name']>({});
  const [formName] = useState('formlist');
  const [tabCheck, setTabCheck] = useState<string>(
    I18N.consulting.carbonEmissionCalculation,
  );
  const pathname = useCallback((): string => {
    switch (history.location.pathname) {
      case '/carbonemissioncalculator/industrial':
        return I18N.consulting.industrialWastewaterCarbon;
      case '/carbonemissioncalculator/heat':
        return I18N.consulting.outsourcedThermalCarbon;
      case '/carbonemissioncalculator/business':
        return I18N.consulting.aircraftTravelCarbon2;
      default:
        return I18N.consulting.industrialWastewaterCarbon;
    }
  }, [history.location.pathname]);
  const resname = useCallback((): string => {
    switch (history.location.pathname) {
      case '/carbonemissioncalculator/industrial':
        return I18N.consulting.anaerobicTreatmentOfWastewater;
      case '/carbonemissioncalculator/heat':
        return I18N.consulting.hotWaterCarbonFootprint;
      case '/carbonemissioncalculator/business':
        return I18N.consulting.aircraftTravelCarbon2;
      default:
        return I18N.consulting.industrialWastewaterCarbon;
    }
  }, [history.location.pathname]);

  const list = useMemo(() => {
    if (pathname() !== I18N.consulting.outsourcedThermalCarbon) {
      return informaton().filter(
        (item: TextList) => item.title === pathname(),
      )[0][formName];
    }
    return informaton().filter((item: TextList) => item.title === pathname())[0]
      .tabform[1].list;
  }, [chanageFor, formName]);
  const chanage = (e, name) => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      [name]: e,
    });
    setChanFor({
      [name]: e,
    });
  };
  const water = (e, userid, companyId) => {
    const subform = e;
    if (subform.sludgeType !== I18N.carbonFootprint3.other) {
      subform.sludge = e.sludgeType;
      subform.sludgeType = 0;
    } else {
      subform.sludgeType = 1;
    }
    if (subform.amType !== I18N.carbonFootprint3.other) {
      subform.methaneAmend = e.amType;
      subform.amType = 0;
    } else {
      subform.amType = 1;
    }
    if (subform.huType !== I18N.carbonFootprint3.other) {
      subform.methaneHumidifying = e.huType;
      subform.huType = 0;
    } else {
      subform.huType = 1;
    }

    countResult({
      userId: userid,
      companyId,
      ...subform,
    }).then(res => {
      VerifyUtils.Toast('success', I18N.consulting.calculationSuccessful);
      setresult(res.data.data);
    });
  };
  const heat = (e, userid, companyId) => {
    toolboxHotWater({
      userId: userid,
      companyId,
      ...e,
    }).then(res => {
      VerifyUtils.Toast('success', I18N.consulting.calculationSuccessful);
      setresult(res.data.data);
    });
  };
  const userInfo = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  )?.userInfo;
  const submit = e => {
    if (userInfo) {
      const userid = userInfo.userId;
      const companyId = localStorage.getItem('COMPANY_ID');
      switch (pathname()) {
        case I18N.consulting.industrialWastewaterCarbon:
          return water(e, userid, companyId);
        case I18N.consulting.outsourcedThermalCarbon:
          return heat(e, userid, companyId);
        default:
          return '';
      }
    }
    return '';
  };
  const getDate = useCallback(
    (page, size) => {
      if (userInfo && localStorage.getItem('COMPANY_ID')) {
        const userid = userInfo.userId;
        const companyId = localStorage.getItem('COMPANY_ID');
        const url =
          pathname() === I18N.consulting.industrialWastewaterCarbon
            ? toolboxWasteWater
            : toolboxHotWaterpage;
        url({
          userId: `${userid}`,
          companyId,
          page: page || 1,
          size: size || 10,
        }).then(res => {
          setTableDate(res.data.data.rows);
          settotal(res.data.data.total);
        });
      }
    },
    [page],
  );
  useEffect(() => {
    if (
      tabCheck === I18N.consulting.calculationRecords &&
      pathname() !== I18N.consulting.aircraftTravelCarbon2
    ) {
      getDate(page.page, page.pagesize);
    }
  }, [tabCheck]);

  return pathname() === I18N.consulting.aircraftTravelCarbon2 ? (
    <div className={style.wating}>
      <div>
        <img src={watingimg} alt='' />
        <div className={style.flextip}>
          {I18N.consulting.aircraftTravelCarbon}
        </div>
        <div className={style.flextip}>
          <span className={style.tipiconspan}>
            <IconFont type='icon-icon-dianhua' className={style.tipicon} />
            010-50973498
          </span>{' '}
          <span className={style.tipiconspan}>
            <IconFont type='icon-icon-youxiang' className={style.tipicon} />
            mail@carbonstop.com
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div style={{ background: 'white' }}>
      <ul className={style.tablist}>
        {tablist.map((item: string) => (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <li
            className={tabCheck === item ? style.active : ''}
            onClick={() => setTabCheck(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      <div className={style.content}>
        {/* {ScreenWidth} */}
        {tabCheck === I18N.consulting.calculationRecords ? (
          <Table
            columns={TableList(1)[`0_${pathname()}`]}
            scroll={{ x: 1500 }}
            dataSource={tabledata}
            className={style.tableliststyle}
            pagination={{
              pageSize: page.pagesize,
              current: page.page,
              showSizeChanger: true,
              total,
              onChange: (e, size) => {
                if (e === page.page) {
                  getDate(1, size);
                  setpage({
                    ...page,
                    page: 1,
                    pagesize: size,
                  });
                } else {
                  getDate(e, size);
                  setpage({
                    ...page,
                    page: e,
                    pagesize: size,
                  });
                }
              },
            }}
          />
        ) : (
          <Form
            layout='vertical'
            form={form}
            className={style.formlists}
            onValuesChange={(e, val) => {
              setChanFor(val);
            }}
            onFinish={e => {
              submit(e);
            }}
          >
            <div
              className={style.title}
              style={{
                display:
                  pathname() === I18N.consulting.outsourcedThermalCarbon
                    ? 'block'
                    : 'none',
              }}
            >
              {I18N.consulting.hotWater}
            </div>
            <Row>
              {list.map((tem: FormlistElement) => (
                <Col
                  span={24}
                  className={
                    // eslint-disable-next-line no-nested-ternary
                    form.getFieldsValue()[tem.name] ===
                    I18N.carbonFootprint3.other
                      ? style.normalwidth
                      : tem.label === ' '
                      ? style.gonoe
                      : style.inherit
                  }
                  style={{
                    display:
                      !tem.othname ||
                      form.getFieldsValue()[tem.othname] ===
                        I18N.carbonFootprint3.other
                        ? 'block'
                        : 'none',
                    marginRight: '10px',
                  }}
                >
                  <Form.Item
                    labelAlign='left'
                    label={tem.label}
                    name={tem.name}
                    rules={[
                      () => ({
                        validator(rule, value) {
                          const reg = /\s/;
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                          if (
                            !tem.othname ||
                            form.getFieldsValue()[tem.othname] ===
                              I18N.carbonFootprint3.other
                          ) {
                            if (Number.isNaN(value) && tem.reg) {
                              return Promise.reject(
                                new Error(I18N.consulting.pleaseEnterANumber),
                              );
                            }
                            if (tem.othname) {
                              if (
                                form.getFieldsValue()[tem.othname] ===
                                I18N.carbonFootprint3.other
                              ) {
                                if (value === '' || value === undefined) {
                                  return Promise.reject(
                                    new Error(I18N.system.cannotBeEmpty),
                                  );
                                }
                                if (reg.test(value)) {
                                  return Promise.reject(
                                    new Error(
                                      I18N.consulting.notAllowedToInclude,
                                    ),
                                  );
                                }
                                if (
                                  tem.type === 'input' ||
                                  tem.type === 'inputnounit'
                                ) {
                                  if (value < 0)
                                    return Promise.reject(
                                      new Error(
                                        I18N.consulting.pleaseInputCorrectly,
                                      ),
                                    );
                                  if (tem.reg) {
                                    if (!tem.reg.test(value))
                                      return Promise.reject(
                                        new Error(tem.placeholder),
                                      );
                                  }
                                  // return Promise.resolve();
                                }
                              } else {
                                return Promise.resolve();
                              }
                            } else {
                              if (value === '' || value === undefined) {
                                return Promise.reject(
                                  new Error(I18N.system.cannotBeEmpty),
                                );
                              }
                              if (reg.test(value)) {
                                return Promise.reject(
                                  new Error(
                                    I18N.consulting.notAllowedToInclude,
                                  ),
                                );
                              }
                              if (
                                tem.type === 'input' ||
                                tem.type === 'inputnounit'
                              ) {
                                if (value < 0)
                                  return Promise.reject(
                                    new Error(
                                      I18N.consulting.pleaseInputCorrectly,
                                    ),
                                  );
                                if (tem.reg) {
                                  if (!tem.reg.test(value))
                                    return Promise.reject(
                                      new Error(tem.placeholder),
                                    );
                                }
                                // return Promise.resolve();
                              }
                            }

                            return Promise.resolve();
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    {listElm(tem, chanage)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <Form.Item className={style.sublist}>
              <Button
                htmlType='reset'
                onClick={() => {
                  form.resetFields();
                  setChanFor({});
                  setresult('');
                }}
              >
                {I18N.carbonFootprint3.reset}
              </Button>
              <div className={style.subcon}>
                <div className={style.tip}>
                  {resname()}:
                  <span>
                    {result}&nbsp;&nbsp;tCO<sub>2</sub>e
                  </span>
                </div>
                <Button
                  type='primary'
                  htmlType='submit'
                  className={style.subbtn}
                >
                  {I18N.consulting.calculateNow}
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ConsultingServe;
