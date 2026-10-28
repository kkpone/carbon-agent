import qrCodeImg from '@assets/images/consult_qrcode.png';
import I18N from '@src/lang/I18N';
import {
  Button,
  Row,
  Radio,
  Modal,
  Form,
  Pagination,
  Input,
  Select,
  Spin,
  Tabs,
  TabsProps,
} from 'antd';
import * as echarts from 'echarts';
import { toCanvas } from 'qrcode';
import React, { FC, useEffect, useRef, useState } from 'react';

import { PageWrapper } from '@/components/PageWrapper';
import { apiCarbonPriceChart } from '@/views/workbench/service';

import { CARBONREDUTIONTYPE_LABEL, CARBONREDUTIONTYPE_STYLE } from './const';
import style from './index.module.less';
import ComStep from '../component/ComStep';
import ReturnFrom from '../component/returnFrom';
import SearchTableList from '../component/tableList';
import '../carbon-greenMeeting.scss';

import '../style.less';
// 进度条
import {
  apiGetTotalMoney,
  apiGoodList,
  apiOderSubmit,
  apiOrdersPayQuery,
  GoogType,
  PayObjType,
  PayResultObjType,
} from '../service';
import failurePng from '../svg/failure.png';
import penddingPng from '../svg/pending.png';
import successPng from '../svg/success.png';

import IconFont from '@src/components/iconfont';
import Permission from '@src/components/Permission';
import { EmptyPage } from '@src/components/EmptyPage';
import EllipsisTooltip from '@src/components/OverTextTootip';
import GreenEnergy from './GreenEnergy';

export const TableContact: any = React.createContext({});
type StepDataType = GoogType & { buyAmount?: number; payMoney?: string };
const AddActivity: FC = () => {
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  const [searchForm] = Form.useForm();
  const [searchParamsData, setSearchParamsData] = useState<{
    type?: string;
    goodsName?: string;
  }>({});

  const [loading, setLoading] = useState<boolean>(false);

  const searchSub = () => {
    const val = searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };

  const resetBack = () => {
    setSearchParamsData({});
    searchForm.resetFields();
  };

  const [current, changeCurrent] = useState('0');

  /**
   * 控制用户协议弹窗
   */
  const [controlModel, changeControlModel] = useState(false);
  /**
   * 控制是否统一
   * **/
  const [isAgree, changeIsAgree] = useState(false);
  /**
   * 选择支付方式
   *
   */
  const [chooseItem, changeChooseItem] = useState('0');
  const [buyList, getBuyList] = useState<GoogType[]>([]);
  const [form] = Form.useForm();
  /**
   * 控制 购买信息确认弹窗
   */
  const [control, changeControl] = useState(false);
  /**
   * 控制按钮 loading
   */
  const [submitLoad, changeSumitLoad] = useState(false);
  const [page, changePage] = useState('1');
  const [total, changeTotal] = useState('0');
  const [size] = useState('10');
  // 自定数据
  const [stepOneData, getStepOneData] = useState<StepDataType[]>([]);
  // 存储二维码
  const [payData, getPayData] = useState<PayObjType>({
    payMoney: 0,
    orderId: '',
    code_url: '',
  });
  // 存储订单支付情况
  const [payResultData, getPayResultData] = useState<PayResultObjType>({
    trade_state: 'SUCCESS',
    orderId: 'TZH20220421757850',
    status: '1',

    desc: I18N.carbonNeutral.paymentSuccessful2,
  });
  // loading 动画
  const [isOrderLoading, changeIsOrderLoading] = useState(false);
  const apiGoodListFn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await apiGoodList({
        page,
        size,
        ...searchParamsData,
      }).then(({ data }) => {
        getBuyList([...data.data.rows] || []);
        changeTotal(data.data.total);
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    apiGoodListFn();
  }, [page, searchParamsData]);
  const returnBuyList = () =>
    buyList.map(item => (
      <div className='content_item' key={item.goodsId}>
        <div className='content_item_left'>
          <img src={item.imgPath} alt={I18N.carbonAccount.picture} />
        </div>
        <div className='content_item_right'>
          <div className='title'>
            <h4>{item.goodsName}</h4>
          </div>
          <EllipsisTooltip text={item.info} lines={3}>
            {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className='describe' title={item.info}>
              {item.info}
            </a>
          </EllipsisTooltip>

          <div className='content_footer'>
            <div className='tag' style={CARBONREDUTIONTYPE_STYLE[0]}>
              {item.type}
            </div>

            <div className='pricebyWrap'>
              <span className='buyNum'>
                {I18N.carbonNeutral.stock}
                {Number(item.realAmount) > 0 ? item.realAmount : 0}
                {I18N.carbonNeutral.ton}
              </span>
              <div className='priceContent'>
                <div className='price_unit'>￥</div>
                <span className='price_price'>{item.price}</span>
                <span className='price_unit'>{I18N.carbonNeutral.yuanTon}</span>
              </div>
              <Button
                className='queryBtn'
                onClick={() => setConsultModalOpen(true)}
              >
                {I18N.carbonNeutral.purchaseConsultation}
              </Button>
              <div className='buy'>
                <Permission flag='CarbonNeutralOverview:Buy'>
                  <Button
                    type='primary'
                    className='buyButton'
                    onClick={() => {
                      changeControl(true);
                      getStepOneData([{ ...item }]);
                    }}
                  >
                    {I18N.carbonFootprint3.buyNow}
                  </Button>
                </Permission>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  const canvasCom = code_url => {
    const canvas = document.getElementById('canvas');
    toCanvas(canvas, code_url, {
      // @ts-ignore
      width: '128',
      height: 128,
      colorDark: '#000000',
      colorLight: '#ffffff',
    })
      .then(() => {})
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err, 'err=');
      });
  };
  // eslint-disable-next-line consistent-return
  const returnContent = () => {
    if (current === '0') {
      return (
        <div className='service'>
          <div className='tip' style={{ margin: '24px 0' }}>
            <div className='searchForm'>
              <Form form={searchForm} layout='inline'>
                <Form.Item name='goodsName'>
                  <Input
                    placeholder={I18N.carbonNeutral.carbonReductionProjects}
                  />
                </Form.Item>
                <Form.Item name='type'>
                  <Select
                    placeholder={I18N.carbonNeutral.typesOfCarbonReduction}
                    options={CARBONREDUTIONTYPE_LABEL}
                  />
                </Form.Item>

                <Button type='primary' onClick={searchSub}>
                  <IconFont type='icon-icon-zhaxun-1' className='icon' />
                  {I18N.carbonNeutral.query}
                </Button>
                <Button type='default' className='resetBtn' onClick={resetBack}>
                  <IconFont type='icon-icon-tongzhi-1' className='icon' />
                  {I18N.carbonFootprint3.reset}
                </Button>
              </Form>
            </div>
          </div>
          <Spin spinning={loading}>
            {buyList?.length ? (
              <>
                <div className='service_content'>{returnBuyList()}</div>
                <Row justify='end'>
                  <Pagination
                    current={Number(page)}
                    total={Number(total)}
                    onChange={(page: number) => {
                      changePage(`${page}`);
                    }}
                  />
                </Row>
              </>
            ) : (
              <EmptyPage />
            )}
          </Spin>

          <Modal
            title={I18N.carbonNeutral.purchaseInformationIsAccurate}
            centered
            width={358}
            className='comstom-modal'
            open={control}
            onCancel={() => {
              changeControl(false);
              form.resetFields();
            }}
            footer={[
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                }}
              >
                <Button
                  key='submit'
                  onClick={() => {
                    changeSumitLoad(false);
                    changeControl(false);
                    form.resetFields();
                  }}
                >
                  {I18N.carbonFootprint.cancel}
                </Button>
                <Button
                  type='primary'
                  onClick={() => {
                    form
                      .validateFields()
                      .then(async (value: { buyAmount: string }) => {
                        await apiGetTotalMoney({
                          goodsId: stepOneData[0].goodsId,
                          buyAmount: value.buyAmount
                            ? Number(value.buyAmount)
                            : 0,
                        }).then(({ data }) => {
                          if (data.code === 200) {
                            getStepOneData([
                              {
                                ...stepOneData[0],
                                buyAmount: value.buyAmount
                                  ? Number(value.buyAmount)
                                  : 0,
                                payMoney: data.data,
                              },
                            ]);
                            changeSumitLoad(true);
                            changeCurrent('1');
                            form.resetFields();
                          }
                        });
                      });
                  }}
                  loading={submitLoad}
                >
                  {I18N.carbonFootprint.confirm2}
                </Button>
              </div>,
            ]}
          >
            <ReturnFrom
              form={form}
              layout='inline'
              listArr={[
                {
                  label: I18N.carbonNeutral.purchaseQuantity,
                  type: 'InputNumber',
                  name: 'buyAmount',
                  className: 'a1',
                  disabled: false,
                  placeholder: !false ? I18N.carbonFootprint.pleaseEnter : '',
                  min: 0.0001,
                  max: 100000000,
                  addonAfter: I18N.carbonNeutral.ton,
                  require: !false
                    ? [
                        {
                          required: true,
                          message:
                            I18N.carbonNeutral.purchaseQuantityNotAvailable,
                        },
                        // {
                        //   validator: (rule, value, callback) => {
                        //     const maxPrice = stepOneData[0].realAmount; //拿到最大值
                        //     if (value > maxPrice) {
                        //       callback(`不能大于${maxPrice}`);
                        //     } else {
                        //       callback();
                        //     }
                        //   },
                        // },
                        {
                          pattern: /^\d+(\.\d{0,4})?$/,
                          message:
                            I18N.carbonNeutral.inputPositiveDefiniteNumber,
                        },
                      ]
                    : [],
                },
              ]}
            />
          </Modal>
        </div>
      );
    }
    if (current === '1') {
      return (
        <div className='stepOne'>
          <SearchTableList
            dataSource={[...stepOneData]}
            showLoading={false}
            onchanage={() => {}}
            columns={
              [
                {
                  title: I18N.carbonNeutral.entryName,
                  dataIndex: 'goodsName',
                  width: 70,
                },
                {
                  title: I18N.carbonNeutral.unitPriceYuanTon,
                  dataIndex: 'price',
                  ellipsis: true,
                  width: 100,
                },
                {
                  title: I18N.carbonNeutral.purchaseQuantityInTons,
                  dataIndex: 'buyAmount',
                  width: 160,
                },
                {
                  title: I18N.carbonNeutral.subtotal,
                  dataIndex: 'payMoney',
                  width: 160,
                  render: text => <span>{`￥${text}`}</span>,
                  align: 'right',
                },
              ] || []
            }
          />
          <h6 style={{ marginTop: '40px' }}>
            {I18N.carbonNeutral.payableAmount}
          </h6>
          <Row>
            <span className='money'>
              ¥ {Number(stepOneData[0].payMoney || 0)}
            </span>
          </Row>
          <Row>
            <Button
              type='primary'
              disabled={isOrderLoading || !isAgree}
              onClick={async () => {
                changeIsOrderLoading(true);
                await apiOderSubmit({
                  goodsId: stepOneData[0].goodsId,
                  buyAmount: stepOneData[0].buyAmount
                    ? Number(stepOneData[0].buyAmount)
                    : 0,
                  channel: 'carbonNeutral',
                }).then(({ data }) => {
                  changeIsOrderLoading(false);
                  getPayData({ ...data.data });
                  changeCurrent('2');
                  /** 生成支付canvas */
                  canvasCom(data.data.code_url);
                });
              }}
              loading={isOrderLoading}
            >
              {I18N.carbonNeutral.payNow}
            </Button>
          </Row>
          <div className='agreement_carbonNeutral'>
            <Radio
              checked={isAgree}
              onClick={() => {
                changeIsAgree(!isAgree);
              }}
            >
              {I18N.carbonNeutral.iHaveReadAnd}
            </Radio>
            <Button
              type='link'
              className='agreement_carbonNeutral_text'
              onClick={() => {
                changeControlModel(true);
              }}
            >
              {I18N.carbonNeutral.userEntrustmentAgreement2}
            </Button>
          </div>
        </div>
      );
    }
    if (current === '2') {
      return (
        <div className='stepOne stepTwo'>
          <h6>{I18N.carbonNeutral.payableAmount}</h6>
          <Row>
            <span className='money'>¥ {payData.payMoney}</span>
          </Row>
          <Row>
            <Button
              className={`chooseItem ${chooseItem === '0' ? 'cur' : ''}`}
              icon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  className='design-iconfont'
                >
                  <path
                    d='M12.8449828,7.75491183 C13.0290759,7.75491183 13.2106297,7.76837976 13.3904153,7.78792331 C12.900585,5.53048309 10.4611584,3.85284121 7.67694513,3.85284121 C4.5639713,3.85284121 2.01384805,5.95261631 2.01384805,8.618703 C2.01384805,10.1573957 2.86244077,11.4211619 4.27995966,12.4013492 L3.71364807,14.0874932 L5.69313345,13.1048983 C6.4018929,13.2434336 6.96991619,13.3862953 7.67694513,13.3862953 C7.85456761,13.3862953 8.03044078,13.3776427 8.20546751,13.363761 C8.09471444,12.9894051 8.0304408,12.5968223 8.0304408,12.1898687 C8.0304596,9.74178952 10.1549886,7.75491183 12.8449828,7.75491183 Z M9.8006089,6.23534889 C10.2270684,6.23534889 10.5093495,6.51328491 10.5093495,6.9349855 C10.5093495,7.35493676 10.2270684,7.63635263 9.8006089,7.63635263 C9.37586111,7.63635263 8.95026686,7.35493676 8.95026686,6.9349855 C8.95026686,6.51328491 9.37587991,6.23534889 9.8006089,6.23534889 Z M5.83731184,7.63633381 C5.41256405,7.63633381 4.98435521,7.35491793 4.98435521,6.93496668 C4.98435521,6.51326609 5.41256405,6.23533007 5.83731184,6.23533007 C6.2615894,6.23533007 6.54432196,6.51326609 6.54432196,6.93496668 C6.54432196,7.35493676 6.2615894,7.63633381 5.83731184,7.63633381 Z M18.013848,12.1225479 C18.013848,9.88205542 15.7481691,8.05587126 13.2036888,8.05587126 C10.5093495,8.05587126 8.38743512,9.88205544 8.38743512,12.1225479 C8.38743512,14.3662944 10.5093496,16.1885661 13.2036888,16.1885661 C13.7673858,16.1885661 14.336312,16.0486952 14.9025859,15.9080155 L16.4560821,16.7496486 L16.0300176,15.3495101 C17.1670235,14.5052624 18.013848,13.3862953 18.013848,12.1225479 Z M11.6419727,11.4211619 C11.360143,11.4211619 11.0756799,11.1436585 11.0756799,10.8604933 C11.0756799,10.5812594 11.360143,10.3002762 11.6419727,10.3002762 C12.0701815,10.3002762 12.3507322,10.5812594 12.3507322,10.8604933 C12.3507322,11.1436585 12.0701815,11.4211619 11.6419727,11.4211619 Z M14.756677,11.4211619 C14.4770293,11.4211619 14.1942967,11.1436585 14.1942967,10.8604933 C14.1942967,10.5812594 14.4770293,10.3002762 14.756677,10.3002762 C15.1814248,10.3002762 15.4654365,10.5812594 15.4654365,10.8604933 C15.4654365,11.1436585 15.1814248,11.4211619 14.756677,11.4211619 Z'
                    fillRule='nonzero'
                  />
                </svg>
              }
              onClick={() => {
                changeChooseItem('0');
                canvasCom(payData.code_url);
              }}
            >
              {I18N.carbonNeutral.weChatPayment}
            </Button>
            <Button
              className={`chooseItem ${chooseItem === '1' ? 'cur' : ''}`}
              icon={
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  className='design-iconfont'
                >
                  <path
                    d='M15.8213527,3 C17.0215763,3 18,3.9784237 18,5.180436 L18,5.180436 L18,7.17305757 L12.4084964,7.17305757 C11.0311906,7.17305757 9.90430408,8.2999441 9.90430408,9.67724986 L9.90430408,9.67724986 L9.90430408,10.3176076 C9.90430408,11.6949134 11.0311906,12.8217999 12.4084964,12.8217999 L12.4084964,12.8217999 L18,12.8217999 L18,14.8144215 C18,16.0182225 17.0215763,16.9948575 15.819564,16.9948575 L15.819564,16.9948575 L4.180436,16.9948575 C2.97663499,16.9948575 2,16.0164338 2,14.8144215 L2,14.8144215 L2,5.180436 C2,3.97663499 2.9784237,3 4.180436,3 L4.180436,3 Z M18,8.06741196 L18,11.9274455 L12.4084964,11.9274455 C11.980995,11.9274455 11.5785355,11.7593069 11.2726663,11.4534377 C10.9667971,11.1475685 10.7986585,10.745109 10.7986585,10.3176076 L10.7986585,10.3176076 L10.7986585,9.67724986 C10.7986585,9.24974846 10.9667971,8.84728899 11.2726663,8.54141979 C11.5767468,8.23555059 11.980995,8.06741196 12.4084964,8.06741196 L12.4084964,8.06741196 L18,8.06741196 Z M13.0667412,9.28194522 C12.6714366,9.28194522 12.3512577,9.60212409 12.3512577,9.99742873 C12.3512577,10.3927334 12.6714366,10.7129122 13.0667412,10.7129122 C13.4620458,10.7129122 13.7822247,10.3927334 13.7822247,9.99742873 C13.7822247,9.60212409 13.4620458,9.28194522 13.0667412,9.28194522 Z'
                    fillRule='nonzero'
                  />
                </svg>
              }
              onClick={() => {
                changeChooseItem('1');
              }}
            >
              {I18N.carbonNeutral.offlineTransfer}
            </Button>
          </Row>

          <div
            className='pay_content'
            style={{ opacity: Number(chooseItem) === 0 ? 1 : 0 }}
          >
            <canvas id='canvas' />
            <p style={{ marginTop: '10px' }}>
              {I18N.carbonNeutral.pleaseUseWeChat}
            </p>
            <Button
              type='primary'
              className='compePay'
              onClick={async () => {
                changeIsOrderLoading(true);
                await apiOrdersPayQuery({
                  orderId: payData.orderId,
                }).then(({ data }) => {
                  changeIsOrderLoading(false);
                  changeCurrent('3');
                  getPayResultData(data.data);
                });
              }}
              loading={isOrderLoading}
            >
              {I18N.carbonNeutral.iHaveCompletedThePayment}
            </Button>
          </div>
          <div
            className='pay_content'
            style={{
              opacity: Number(chooseItem) === 0 ? 0 : 1,
              position: 'relative',
              top: '-240px',
            }}
          >
            <p>{I18N.carbonNeutral.youNeedToAddTheCorresponding}</p>
            <p>{I18N.carbonNeutral.payeeNameCarbon}</p>
            <p>{I18N.carbonNeutral.receivingBankRecruitment}</p>
            <p>{I18N.carbonNeutral.bankAccountNumber}</p>
          </div>
        </div>
      );
    }
    if (current === '3') {
      return (
        <div className='stepOne stepTwo stepFore'>
          {Number(payResultData.status) === 2 ? (
            <>
              <img alt='' src={failurePng} />
              <h5>{I18N.carbonNeutral.paymentFailed}</h5>
              <p>{I18N.carbonNeutral.unfinishedServices}</p>
            </>
          ) : Number(payResultData.status) === 1 ? (
            <>
              <img alt='' src={successPng} />
              <h5>{I18N.carbonNeutral.paymentSuccessful}</h5>
              <p>{I18N.carbonNeutral.completedService}</p>
            </>
          ) : (
            <>
              <img alt='' src={penddingPng} />
              <h5>{I18N.carbonNeutral.toBeCompleted}</h5>
              <p>{I18N.carbonNeutral.pleaseFinishAfterCompletion}</p>
            </>
          )}
        </div>
      );
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: I18N.carbonNeutral.carbonOffsettingProjects,
    },
    {
      key: '2',
      label: I18N.workbench.carbonPriceTrend,
    },
    {
      key: '3',
      label: I18N.carbonNeutral.greenEnergyLand,
    },
  ];

  const [activeKey, setActiveKey] = useState('1');
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();
  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const [timeSelect, setTimeSelect] = useState<number>(30);
  const handleResize = () => {
    echartsInstance.current?.resize();
  };

  const initChart = async () => {
    const { data }: any = await apiCarbonPriceChart({ page_size: timeSelect });
    const chartDataList = data.data;

    const seriesList = chartDataList.map(item => ({
      name: item.carbonPriceList[0]?.bazaar,
      data: item.carbonPriceList.map(item => item.average_price),
      type: 'line',
      showSymbol: false,
    }));
    const legendList = chartDataList.map(item => ({
      name: item.carbonPriceList[0]?.bazaar,
    }));

    const option = {
      // color: [
      //   '#698CFF',
      //   '#F06E6E',
      //   '#EE8F58',
      //   '#64DBC5',
      //   '#F6C06B',
      //   '#F06E6E',
      //   '#F06E6E',
      // ],
      legend: {
        data: legendList,
        itemWidth: 26.5,
        itemHeight: 14.5,
      },
      tooltip: {
        trigger: 'axis',
        formatter(params: any) {
          const text = I18N.workbench.carbonPriceTrends;
          const unit = I18N.carbonNeutral.yuanTon;

          let result = `
          <div style='color: #343a40ff;font-size: 12px;font-weight: 400;padding-bottom:5px'>${text}(${
            params?.[0]?.axisValue || '-'
          })</div>
          `;
          params.forEach(item => {
            result += `${item.marker}
            <span style='color: #6c757dff;font-size: 12px;font-weight: 400;'>${item.seriesName}</span>&nbsp;&nbsp;&nbsp;&nbsp;
            <span style='font-weight:500;color: #343a40ff;font-size: 12px;'>${item.data}</span>
            <span style='color: #999ea4ff;font-size: 12px;font-weight: 400;'>${unit}</span>
            <br/>`;
          });

          return result;
        },
      },
      xAxis: {
        type: 'category',
        name: '',
        data: chartDataList?.[0]?.carbonPriceList?.map(item => item.in_date),
        axisLine: {
          lineStyle: {
            color: '#999999',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: I18N.workbench.priceYuanTon2,
        nameTextStyle: {
          fontWeight: 400,
          fontSize: 12,
          color: '#999999',
          padding: [0, 0, 0, 20],
        },
        axisLine: {
          lineStyle: {
            color: '#999999',
          },
        },
      },
      grid: {
        right: 30,
        left: 50,
      },
      series: seriesList,
    };
    echartsInstance.current?.setOption(option);
    // sett
    setTimeout(() => {
      handleResize();
    }, 1000);
  };

  useEffect(() => {
    if (activeKey === '2') {
      initChart();
    }
  }, [chartRef, timeSelect, activeKey]);

  useEffect(() => {
    if (activeKey === '2') {
      echartsInstance.current = echarts.init(
        chartRef.current as HTMLDivElement,
      );
      // if (!getNav()) {
      //   sessionStorage.clear();
      //   localStorage.clear();
      //   window.location.href = RouteMaps.login;
      // }
      // initData();

      if (document) {
        // @ts-ignore
        document
          ?.querySelector('#ComEffect')
          .addEventListener('resize', handleResize);
      }
      window.addEventListener('resize', handleResize);
    } else {
      echartsInstance.current?.dispose();
    }
  }, [activeKey]);

  return (
    <PageWrapper title={I18N.router.carbonNeutrality}>
      <Modal
        title={I18N.carbonNeutral.purchaseConsultation}
        width={480}
        centered
        open={consultModalOpen}
        footer={null}
        onCancel={() => setConsultModalOpen(false)}
        onClose={() => setConsultModalOpen(false)}
      >
        <div className={style.consult}>
          <div className={style.consultText}>
            {I18N.carbonFootprint3.contactExclusiveCustomers}
          </div>
          <img className={style.qrCodeImg} alt='' src={qrCodeImg} />
        </div>
      </Modal>
      <Tabs activeKey={activeKey} items={items} onChange={onChange} />
      {activeKey === '1' && (
        <>
          <div className='computation'>
            <div style={{ background: '#fff' }}>
              {Number(current) > 0 && (
                <ComStep
                  style={{ paddingTop: '40px' }}
                  current={Number(current)}
                  steps={[
                    {
                      modelName: I18N.carbonNeutral.selectServices,
                      orderNum: '0',
                    },
                    {
                      modelName: I18N.carbonNeutral.confirmOrder,
                      orderNum: '1',
                    },

                    {
                      modelName: I18N.carbonNeutral.confirmPayment,
                      orderNum: '2',
                    },
                    {
                      modelName: I18N.carbonNeutral.completeTheOrder,
                      orderNum: '3',
                    },
                  ]}
                />
              )}

              {returnContent()}
            </div>
          </div>
          <Modal
            title={I18N.carbonNeutral.userEntrustmentAgreement}
            centered
            width={568}
            className='comstom-modal'
            open={controlModel}
            onCancel={() => {
              changeControlModel(false);
            }}
            footer={[
              <div>
                <Button
                  type='primary'
                  onClick={() => {
                    changeControlModel(false);
                  }}
                >
                  {I18N.carbonFootprint.confirm2}
                </Button>
              </div>,
            ]}
          >
            <p>{I18N.carbonNeutral.userCommissionedCarbon}</p>
            <p>{I18N.carbonNeutral.userSelectsMe}</p>
          </Modal>
        </>
      )}
      {activeKey === '2' && (
        <div>
          <div className={style.title}>
            <div>{/* {I18N.workbench.carbonPriceTrend} */}</div>
            <Select
              options={[
                { label: I18N.workbench.lastMonth4, value: 30 },
                { label: I18N.workbench.inThePastThreeMonths, value: 60 },
                { label: I18N.workbench.inThePastSixMonths, value: 180 },
                { label: I18N.workbench.inThePastYear, value: 365 },
              ]}
              value={timeSelect}
              onChange={val => {
                setTimeSelect(val);
              }}
            />
          </div>
          <div id='ComEffect'>
            <div ref={chartRef} className={style.chart} />
          </div>
          <div className={style.liability}>
            {I18N.workbench.declareTheAboveCarbon}
          </div>
        </div>
      )}
      {activeKey === '3' && <GreenEnergy />}
    </PageWrapper>
  );
};

export default AddActivity;
