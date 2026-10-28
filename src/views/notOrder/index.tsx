/**
 * @file 没有订单页面
 */
import { PRODUCT_NAME } from '@src/components/LayoutNavBar';
import I18N from '@src/lang/I18N';
import { RootState } from '@src/store';
import { Toast } from '@src/utils/Toast';
import { Button, Form, Input, Tabs, Row, Col, Modal } from 'antd';
import { Rule } from 'antd/lib/form';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import style from './index.module.less';
import {
  creatPageInfo,
  PageInfoType,
  TabListType,
  submitObj,
} from './pageInfo';
import { noOrderPageData } from './utils/order';
import { checkSubmit } from '../../utils';
import { apiQueryByCompanyId } from '../dashborad/organization/services';
import { apiQueryByPageType } from '../dashborad/orgstaff/service';
import { apiAddClew } from '../system/login/service';

const ossPath = process.env.REACT_APP_API_URL_OSS;
const circleIcon1 = `${ossPath}/saas-product/circle-icon1.svg`;
const circleIcon2 = `${ossPath}/saas-product/circle-icon2.svg`;
const circleIcon3 = `${ossPath}/saas-product/circle-icon3.svg`;
const circleIcon4 = `${ossPath}/saas-product/circle-icon4.svg`;

const phoneIcon = `${ossPath}/saas-product/phone-icon.svg`;
const emailIcon = `${ossPath}/saas-product/email-icon.svg`;

interface Props {
  notShowFrom?: boolean;
}
const OntOrder: FC<Props> = ({ notShowFrom = false }) => {
  interface ItemType {
    label: string | undefined;
    name: string | undefined;
    disable?: boolean;
    rules: Rule[];
    showCount?: boolean;
    type: string;
    min?: number;
    max?: number;
    maxLength?: number;
    placeholder: string;
  }
  const [pageInfo, setPageInfo] = useState<PageInfoType>({
    title: '',
    intor: '',
    bannerImg: '',
    paramsData: { type: '0' },
    tabList: [],
  });
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [secondeCon, setsecondeCon] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tabActive, setTabActive] = useState<string>('1');
  const renderNoOrder = () => (
    <div className={style.notOrder}>
      {notShowFrom ? '' : <h2>{I18N.notOrder.youHaveNotOrderedYet2}</h2>}
      <p>{I18N.ModelManagement.contactPhoneNumber}</p>
      <p>{I18N.ModelManagement.emailM}</p>
    </div>
  );
  // eslint-disable-next-line react/no-unstable-nested-components
  const Header = (info: PageInfoType) => (
    <div className={style.header}>
      <img className={style.bgImg} src={info.bannerImg} alt='' />
      <div className={style.mainBox}>
        <span className={style.tit}>{info.title}</span>
        <span className={style.intor}>{info.intor}</span>
      </div>
    </div>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const SubmitForm = () => {
    const firstItemFn = (): ItemType[] => [
      {
        label: I18N.notOrder.corporateStructure,
        type: 'input',
        name: 'orgName',
        showCount: true,
        placeholder: I18N.carbonFootprint.pleaseEnter,
        disable: true,
        maxLength: 30,
        rules: [
          { required: true, message: I18N.notOrder.customerNameNotAvailable },
          {
            type: 'string',
            max: 30,
            message: I18N.system.cannotExceed2,
          },
        ],
      },
      {
        label: I18N.notOrder.contacts,
        type: 'input',
        name: 'clientName',
        showCount: true,
        placeholder: I18N.carbonFootprint.pleaseEnter,
        maxLength: 20,
        rules: [
          { required: true, message: I18N.system.contactPersonCannot },
          {
            type: 'string',
            max: 20,
            message: I18N.system.cannotExceed,
          },
        ],
      },
    ];
    const secondeItemFn = (): ItemType[] => [
      {
        label: I18N.carbonFootprint.contactPhoneNumber,
        type: 'input',
        maxLength: 11,
        showCount: true,
        name: 'phonenumber',
        placeholder: I18N.carbonFootprint.pleaseSelect,
        rules: [
          { required: true, message: I18N.system.contactNumberNotAvailable2 },
          () => ({
            validator(_, value) {
              if (value) {
                if (checkSubmit(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(I18N.system.contactNumberNotAvailable),
                );
              }
              return Promise.resolve();
            },
          }),
        ],
      },
      {
        label: I18N.carbonFootprint.mailbox,
        type: 'input',
        name: 'email',
        rules: [
          { required: true, message: I18N.system.emailCannotBe },
          {
            type: 'email',
            message: I18N.system.theCorrectEmailIsIncorrect,
          },
        ],
        placeholder: I18N.carbonFootprint.pleaseEnter,
      },
      {
        label: I18N.carbonFootprint.leaveAMessage,
        placeholder: I18N.system.pleaseEnterAMessage,
        maxLength: 300,
        showCount: true,
        name: 'remark',
        type: 'textarea',
        rules: [{ required: true, message: I18N.system.theMessageCannotBeFor }],
      },
    ];
    const switchItem = (item: ItemType) => {
      // if (index % 2 == 0) {
      //   return (
      //     <Row>
      //   )
      // }
      if (item.type === 'input') {
        return (
          <Input
            disabled={item.disable}
            placeholder={item.placeholder}
            maxLength={item.maxLength}
          />
        );
      }
      if (item.type === 'textarea') {
        return (
          <Input.TextArea
            showCount
            autoSize={{ minRows: 4, maxRows: 6 }}
            className={style.textArea}
            placeholder={item.placeholder}
            maxLength={item.maxLength}
          />
        );
      }
      return '';
    };
    return (
      <div className={style.formBox}>
        <div className={style.mainBox}>
          <p className={style.blodWord}>
            {I18N.carbonFootprint.welcomeToCooperate}
          </p>
          <p className={style.tip}>{I18N.notOrder.pleaseLeaveYour}</p>
          <img src={circleIcon3} className={style.circle1} alt='' />
          <img src={circleIcon4} className={style.circle2} alt='' />
          <Form
            style={{ width: '835px', position: 'relative', left: '200px' }}
            form={form}
            layout='vertical'
          >
            <Row>
              {firstItemFn()?.map((item: ItemType) => (
                <Col span={12}>
                  <Form.Item colon={false} {...item} key={item.name}>
                    {switchItem(item)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <Row>
              {secondeItemFn()?.map((item: ItemType, index: number) => (
                <Col span={index === 2 ? 24 : 12}>
                  <Form.Item
                    colon={false}
                    style={{ display: index === 2 ? 'block' : 'flex' }}
                    {...item}
                    key={item.name}
                  >
                    {switchItem(item)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <Form.Item style={{ marginBottom: 0 }}>
              <Modal
                title={I18N.carbonFootprint.prompt}
                width={420}
                open={secondeCon}
                onOk={() => {
                  if (isSubmit) {
                    Toast('warn', I18N.notOrder.pleaseDoNotMentionItRepeatedly);
                    return;
                  }
                  form.validateFields().then(
                    res => {
                      const data = res;
                      apiAddClew({
                        ...data,
                        sourceType: pageInfo.paramsData.type,
                      }).then(
                        () => {
                          Toast(
                            'success',
                            I18N.carbonFootprint.submittedSuccessfully,
                          );
                          let localSubmitObj: any =
                            localStorage.getItem('submitObj');
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const type =
                            new URLSearchParams(window.location.search).get(
                              'type',
                            ) || '';
                          if (localSubmitObj) {
                            localSubmitObj = JSON.parse(localSubmitObj);
                            localSubmitObj[type] = '1';
                          }
                          localStorage.setItem(
                            'submitObj',
                            JSON.stringify(localSubmitObj),
                          );
                          setIsSubmit(true);
                          setsecondeCon(false);
                        },
                        () => {},
                      );
                    },
                    () => {},
                  );
                }}
                onCancel={() => setsecondeCon(false)}
              >
                {/* <p className='Modal_text'>
                  <IconFont
                    type='icon-icon-shanshuzhatu'
                    className='Modal_del_icon'
                  />
                </p> */}
                <span className='Modal_text'>
                  {I18N.notOrder.areYouSureToWithdraw}
                </span>
              </Modal>
              <Button
                className={style.submitBtn}
                type='primary'
                disabled={isSubmit}
                style={{ float: 'right', margin: '6px 10px 0 0' }}
                onClick={() => {
                  form.validateFields().then(() => {
                    setsecondeCon(true);
                  });
                }}
              >
                {I18N.carbonFootprint.submitNow}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  };
  // eslint-disable-next-line react/no-unstable-nested-components
  const TabList = (tabs: TabListType[]) => {
    const { TabPane } = Tabs;
    const callback = index => {
      setTabActive(index);
    };
    return (
      <div className={style.tabBox}>
        <p className={style.blodWord}>
          {I18N.carbonFootprint.functionIntroduction}
        </p>
        <Tabs activeKey={tabActive} onChange={callback}>
          {tabs.map((item: TabListType) => (
            <TabPane tab={item.name} key={item.id}>
              <div className={style.tabPaneBox}>
                <p className={style.cont}>{item.cont}</p>
                <img className={style.intorImg} src={item.imgPath} alt='' />
              </div>
            </TabPane>
          ))}
        </Tabs>
        <div
          className={style.mainBox}
          style={{ position: 'absolute', top: '175px' }}
        >
          <img className={style.icon1} src={circleIcon1} alt='' />
          <img className={style.icon2} src={circleIcon2} alt='' />
        </div>
      </div>
    );
  };
  // eslint-disable-next-line react/no-unstable-nested-components
  const Footer = () =>
    notShowFrom ? (
      <div className={style.foots}>
        <div className={style.mainBox}>
          <ul>
            <li>
              <img alt='' width={16} src={phoneIcon} />
              <span className={style.word2}>010-50973498</span>
            </li>
            <li>
              <img alt='' width={16} src={emailIcon} />
              <span className={style.word2}>mail@carbonstop.com</span>
            </li>
          </ul>
        </div>
      </div>
    ) : (
      <div className={style.foot} style={{ marginBottom: '63px' }}>
        <div className={style.mainBox}>
          <p className={style.word1}>{I18N.notOrder.youHaveNotOrderedYet}</p>

          <ul>
            <li>
              <img alt='' width={16} src={phoneIcon} />
              <span className={style.word2}>010-50973498</span>
            </li>
            <li>
              <img alt='' width={16} src={emailIcon} />
              <span className={style.word2}>mail@carbonstop.com</span>
            </li>
          </ul>
        </div>
      </div>
    );
  const renderIntor = (info: PageInfoType) => {
    const show = Object.keys(info);
    if (!show.length) {
      return renderNoOrder();
    }
    const { tabList } = info;
    return (
      <div className='intor-box'>
        {Header(info)}
        {notShowFrom ? '' : SubmitForm()}
        {TabList(tabList)}
        {Footer()}
      </div>
    );
  };
  const search = new URLSearchParams(window.location.search);
  let type = search.get(PRODUCT_NAME) || search.get('type') || '';

  if (!type) {
    if (window.location.pathname.includes('greenMeeting')) {
      type = 'greenMeeting';
    }
    if (window.location.pathname.includes('EnterpriseCarbonAccount')) {
      type = 'Enterprise_CarbonAccount';
    }
    if (window.location.pathname.includes('carbonDataManagemen')) {
      // 碳数据
      type = 'carbon_DataManagemen';
    }
    if (window.location.pathname.includes('CarbonFootprint')) {
      // 碳足迹旗舰版
      type = 'CarbonFootprint_Flag';
    }
  }

  const userInfo = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  )?.userInfo;

  useEffect(() => {
    const COMPANY_ID = localStorage.getItem('COMPANY_ID');
    apiQueryByCompanyId({ id: Number(COMPANY_ID) })
      .then(
        ({ data }) => {
          form.setFieldsValue({ orgName: data.data.companyName });
          const userName = userInfo?.username;
          form.setFieldsValue({ phonenumber: userName });
          return apiQueryByPageType({
            userName,
            page: 1,
            size: 1,
          });
        },
        () => {},
      )
      .then(
        (res: any) => {
          form.setFieldsValue({
            clientName: res.data.data.rows[0]?.employName,
          });
          form.setFieldsValue({ email: '' });
          form.setFieldsValue({ remark: '' });
        },
        () => {},
      );
    setTabActive('1');
    document.querySelector('.intor-box')?.scrollTo(0, 0);
    setPageInfo(creatPageInfo(type));
    let localUubmitObj = localStorage.getItem('submitObj');
    if (localUubmitObj) {
      localUubmitObj = JSON.parse(localUubmitObj);
      setIsSubmit(!!Number(localUubmitObj && localUubmitObj[type]));
    } else {
      localStorage.setItem('submitObj', JSON.stringify(submitObj));
    }
  }, [type]);

  /** 查到对应的没有订单的数据 */
  const currentOrder = noOrderPageData?.find(
    ({ typeName }) => typeName === type,
  );

  return (
    <div className={style.norderContent}>
      {currentOrder ? currentOrder.components : renderIntor(pageInfo)}
    </div>
  );
};

export default OntOrder;
