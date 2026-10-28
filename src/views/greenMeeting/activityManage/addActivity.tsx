/**
 * @file 绿色会议 活动 编辑
 */
import I18N from '@src/lang/I18N';
import { Selector } from '@src/views/carbonInternational/carbonManagement/Selector';
import {
  Button,
  Cascader,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Table,
} from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../carbon-greenMeeting.scss';
import { PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { Toast } from '@src/utils/Toast';
import { uuid } from '@src/utils';

import {
  apiActivityAdd,
  apiActivityEdit,
  apiActivityInfo,
  apiAddressTree,
} from '../service';

export const AppContact: any = React.createContext({});
const AddActivity: FC = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [addList, setAddList] = useState<any[]>([
    {
      contactName: '',
      phone: '',
      fixPhone: '',
      email: '',
      contactId: uuid(),
    },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageType, setPageType] = useState('');
  const [addressList, setAddressList] = useState([]);
  const [actId, setActId] = useState('');
  // const [starDate, setStarDate] = useState('');
  // const [endDate, setEndDate] = useState('');
  const layoutDom: HTMLDivElement | any =
    document.querySelector('.layout__container');
  layoutDom && (layoutDom.style.height = 'calc(100% - 130px)');

  const addTable = () => {
    const addColumn: ColumnsType<any> = [
      {
        title: I18N.carbonFootprint.contacts,
        dataIndex: 'contactName',
        width: 300,
        render: (text: string, record: any) =>
          pageType === 'detail' ? (
            text
          ) : (
            <Input
              maxLength={50}
              value={record.contactName}
              onChange={(e: any) => {
                const index = addList.findIndex(
                  item => item.contactId === record.contactId,
                );
                addList[index].contactName = e.target.value;
                setAddList([...addList]);
              }}
            />
          ),
      },
      {
        title: I18N.dashborad.mobilePhoneNumber,
        dataIndex: 'phone',
        width: 300,
        render: (text: string, record: any) =>
          pageType === 'detail' ? (
            text
          ) : (
            <Input
              value={record.phone}
              onChange={(e: any) => {
                const index = addList.findIndex(
                  item => item.contactId === record.contactId,
                );
                addList[index].phone = e.target.value;
                setAddList([...addList]);
              }}
            />
          ),
      },
      {
        title: I18N.greenMeeting.fixedLineTelephone,
        dataIndex: 'fixPhone',
        width: 300,
        render: (text: string, record: any) =>
          pageType === 'detail' ? (
            text
          ) : (
            <Input
              value={record.fixPhone}
              onChange={(e: any) => {
                const index = addList.findIndex(
                  item => item.contactId === record.contactId,
                );
                addList[index].fixPhone = e.target.value;
                setAddList([...addList]);
              }}
            />
          ),
      },
      {
        title: I18N.carbonFootprint.mailbox,
        dataIndex: 'email',
        width: 300,
        render: (text: string, record: any) =>
          pageType === 'detail' ? (
            text
          ) : (
            <Input
              value={record.email}
              onChange={(e: any) => {
                const index = addList.findIndex(
                  item => item.contactId === record.contactId,
                );
                addList[index].email = e.target.value;
                setAddList([...addList]);
              }}
            />
          ),
      },
      {
        title: I18N.carbonFootprint.operation,
        dataIndex: 'scriptName',
        width: 300,
        render: (text: string, record: any) =>
          addList.length > 1 ? (
            <Button
              danger
              type='link'
              onClick={() => {
                const index = addList.findIndex(
                  item => item.contactId === record.contactId,
                );
                addList.splice(index, 1);
                setAddList([...addList]);
              }}
            >
              {I18N.carbonFootprint.delete}
            </Button>
          ) : (
            '--'
          ),
      },
    ];
    return (
      <>
        <Table
          style={{ width: '100%', marginTop: '-16px' }}
          scroll={{ x: 900 }}
          className='SearchTable'
          dataSource={addList}
          columns={addColumn}
          pagination={false}
        />
        {pageType === 'detail' || addList.length > 9 ? (
          ''
        ) : (
          <div
            className='add-linkman'
            onClick={() => {
              addList.push({
                contactName: '',
                phone: '',
                fixPhone: '',
                email: '',
                contactId: uuid(),
              });
              setAddList([...addList]);
            }}
          >
            <PlusOutlined />
            {I18N.greenMeeting.addContactPerson}
          </div>
        )}
      </>
    );
  };
  const Meeting = [
    {
      name: I18N.greenMeeting.activityName,
      id: 'actName',
      val: '',
      className: 'colunms-3',
      render: (
        <Input
          disabled={pageType === 'detail'}
          style={{ marginRight: '50px' }}
          maxLength={100}
          placeholder={I18N.greenMeeting.pleaseEnterTheActivity}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.activityType,
      id: 'actType',
      className: 'colunms-3',
      render: (
        <Selector
          aria-label='actType'
          disabled={pageType === 'detail'}
          style={{ marginRight: '50px' }}
          placeholder={I18N.carbonFootprint.pleaseSelect}
          options={
            [
              { value: '0', label: I18N.greenMeeting.free },
              { value: '1', label: I18N.greenMeeting.charge },
            ] || []
          }
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.activityClassification,
      id: 'actClass',
      className: 'colunms-3',
      render: (
        <Selector
          aria-label='actClass'
          disabled={pageType === 'detail'}
          placeholder={I18N.carbonFootprint.pleaseSelect}
          options={
            [
              { value: '0', label: I18N.carbonNeutral.meeting },
              { value: '1', label: I18N.carbonNeutral.forum },
              { value: '2', label: I18N.carbonNeutral.show },
              { value: '3', label: I18N.carbonNeutral.exhibition },
              { value: '4', label: I18N.carbonNeutral.match },
              { value: '5', label: I18N.carbonFootprint3.other },
            ] || []
          }
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.startPreparationDay2,
      id: 'prepareTime',
      className: 'colunms-3',
      render: (
        <DatePicker
          disabled={pageType === 'detail'}
          style={{ marginRight: '50px', width: '100%' }}
          format='YYYY-MM-DD HH:mm'
          showTime={{ format: 'HH:mm' }}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.holdingTime,
      id: 'beginTime',
      className: 'colunms-3',
      render: (
        <DatePicker.RangePicker
          showTime={{ format: 'HH:mm' }}
          disabled={pageType === 'detail'}
          style={{ marginRight: '50px', width: '100%' }}
          format='YYYY-MM-DD HH:mm'
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.expectedClosing2,
      id: 'closeTime',
      className: 'colunms-3',
      render: (
        <DatePicker
          disabled={pageType === 'detail'}
          showTime={{ format: 'HH:mm' }}
          style={{ marginRight: '50px', width: '100%' }}
          format='YYYY-MM-DD HH:mm'
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.venue,
      id: 'area',
      className: 'colunms-3',
      render: (
        <Cascader
          disabled={pageType === 'detail'}
          style={{ marginRight: '20px' }}
          placeholder={I18N.system.location}
          options={addressList}
          fieldNames={{ label: 'name', value: 'code', children: 'children' }}
          changeOnSelect
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.dashborad.detailedAddress,
      id: 'address',
      className: 'colunms-3',
      render: (
        <Input
          maxLength={200}
          disabled={pageType === 'detail'}
          placeholder={I18N.dashborad.detailedAddress}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.organizer,
      id: 'sponsor',
      val: '',
      className: 'colunms-3',
      render: (
        <Input
          disabled={pageType === 'detail'}
          style={{ marginRight: '50px' }}
          maxLength={100}
          placeholder={I18N.carbonFootprint.pleaseEnter}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.numberOfAttendees,
      id: 'actNumber',
      className: 'colunms-3',
      render: (
        <InputNumber
          className={pageType === 'detail' ? 'number-box' : ''}
          disabled={pageType === 'detail'}
          addonAfter={I18N.greenMeeting.people}
          max={999999}
          min={1}
          placeholder={I18N.carbonFootprint.pleaseEnter}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.eventContact,
      id: 'contacts',
      className: 'w_100',
      render: addTable(),
      rule_required: false,
    },
    {
      name: I18N.greenMeeting.activityContent,
      id: 'content',
      className: 'w_100',
      render: (
        <Input.TextArea
          disabled={pageType === 'detail'}
          style={{ height: '120px' }}
          placeholder={I18N.greenMeeting.activityActivities}
          autoSize={{ minRows: 5, maxRows: 8 }}
          showCount
          maxLength={500}
        />
      ),
      rule_required: true,
    },
  ];
  const getDetail = async (actId: string) => {
    try {
      const res: any = await apiActivityInfo({ actId });
      const {
        actName,
        actType,
        actClass,
        content,
        actNumber,
        sponsor,
        address,
        beginTime,
        area,
        endTime,
        contacts,
        prepareTime,
        closeTime,
      } = res?.data?.data || {};

      form.setFieldsValue({
        actName,
        actType,
        actClass,
        content,
        actNumber,
        sponsor,
        area: area && area?.split('-'),
        address,
        prepareTime: moment(prepareTime),
        closeTime: moment(closeTime),
        beginTime: [moment(beginTime), moment(endTime)],
      });

      setAddList([...contacts]);
      // eslint-disable-next-line
    } catch (error) {}
  };
  const getAddData = () => {
    apiAddressTree({ level: 3 }).then(
      (res: any) => {
        setAddressList(res.data.data);
        // form.setFieldsValue({ area: res.data.data });
      },
      () => {},
    );
  };
  useEffect(() => {
    getAddData();
    const path = history.location.pathname;
    const id = new URLSearchParams(window.location.search).get('id');
    setActId(id || '');
    id && getDetail(id);

    if (path.includes('addActivity')) {
      setPageType('add');
    } else if (path.includes('eidtActivity')) {
      setPageType('edit');
    } else if (path.includes('detailActivity')) {
      setPageType('detail');
    }
  }, []);
  const phoneReg = /^1[3456789]\d{9}$/;
  const fixPhoneReg = /^\d{5,13}$/;
  const emailReg =
    /^([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

  const checkContact = (item): string => {
    let flag = 'pass';
    if (!item.contactName) {
      flag = 'complete';
    } else if (!item.phone && !item.fixPhone) {
      flag = 'complete';
    } else if (item.phone && !phoneReg.test(item.phone)) {
      flag = 'phone';
    } else if (item.fixPhone) {
      if (item.fixPhone.includes('-')) {
        // eslint-disable-next-line
        item.fixPhone = item.fixPhone.replace('-', '');
      } else if (item.fixPhone.includes('—')) {
        // eslint-disable-next-line
        item.fixPhone = item.fixPhone.replace('—', '');
      }

      if (!fixPhoneReg.test(item.fixPhone.trim())) {
        flag = 'fixPhone';
      }
    } else if (item.email && !emailReg.test(item.email)) {
      flag = 'email';
    }

    if (flag === 'complete') {
      Toast('warn', I18N.greenMeeting.pleaseImproveTheContactInformation);
    } else if (flag === 'phone') {
      Toast('warn', I18N.greenMeeting.cellPhone);
    } else if (flag === 'fixPhone') {
      Toast('warn', I18N.greenMeeting.fixedLinePhoneError);
    } else if (flag === 'email') {
      Toast('warn', I18N.greenMeeting.contactEmail);
    }
    return flag;
  };
  return (
    <div className='main-box' style={{ background: '#fff' }}>
      <Form
        form={form}
        onFinish={e => {
          // 校验联系人列表
          const beginTime = new Date(
            moment(e.beginTime[0]).format('YYYY-MM-DD'),
          );
          const endTime = new Date(moment(e.beginTime[1]).format('YYYY-MM-DD'));
          const closeTime = new Date(moment(e.closeTime).format('YYYY-MM-DD'));
          const prepareTime = new Date(
            moment(e.prepareTime).format('YYYY-MM-DD'),
          );
          if (beginTime < prepareTime) {
            Toast('warn', I18N.greenMeeting.startPreparationDay);
            return;
          }
          if (closeTime < endTime) {
            Toast('warn', I18N.greenMeeting.expectedClosing);
            return;
          }
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < addList.length; i++) {
            const item = addList[i];
            if (checkContact(item) !== 'pass') return;
          }
          // 联系人列表
          const contacts = addList.map(item => ({
            contactName: item.contactName,
            phone: item.phone,
            fixPhone: item.fixPhone,
            email: item.email,
          }));
          const formatTimeRule = 'YYYY-MM-DD  HH:mm:ss';
          const params = {
            ...e,
            contacts,
            beginTime: moment(e.beginTime[0]).format(formatTimeRule),
            endTime: moment(e.beginTime[1]).format(formatTimeRule),
            prepareTime: moment(e.prepareTime).format(formatTimeRule),
            closeTime: moment(e.closeTime).format(formatTimeRule),
            area: e.area.join('-'),
          };
          if (pageType === 'add') {
            apiActivityAdd(params).then(
              (res: any) => {
                if (res.data.code === 200) {
                  Toast('success', I18N.carbonFootprint.saveSuccessful);
                  setTimeout(() => {
                    history.go(-1);
                  }, 800);
                }
              },
              () => {},
            );
          } else {
            Object.assign(params, {
              actId,
            });
            apiActivityEdit(params).then(
              (res: any) => {
                if (res.data.code === 200) {
                  Toast('success', I18N.carbonFootprint.saveSuccessful);
                  setTimeout(() => {
                    history.go(-1);
                  }, 800);
                }
              },
              () => {},
            );
          }
        }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
        layout='vertical'
      >
        {Meeting.map(item => (
          <Form.Item
            className={`${item?.className ?? ''}`}
            name={item.id}
            key={item.id}
            label={item.name}
            required
            rules={[
              {
                required: item.rule_required,
                message: I18N.template(I18N.greenMeeting.itemn, {
                  val1: item.name,
                }),
              },
            ]}
          >
            {item.render}
          </Form.Item>
        ))}
        <div className='bottom-box'>
          <Button
            onClick={() => {
              history.go(-1);
            }}
          >
            {pageType === 'detail'
              ? I18N.carbonFootprint.return
              : I18N.carbonFootprint.cancel}
          </Button>
          {pageType === 'detail' ? (
            ''
          ) : (
            <Button type='primary' htmlType='submit'>
              {I18N.carbonFootprint.preserve}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default AddActivity;
