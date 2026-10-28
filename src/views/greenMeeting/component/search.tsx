/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-18 09:40:39
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:26:47
 */
import I18N from '@src/lang/I18N';
import { CSSProperties, useContext, useEffect } from 'react';
import IconFont from '@components/iconfont';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import '../carbon-greenMeeting.scss';
import { useHistory } from 'react-router-dom';
import Permission from '@src/components/Permission';
import { AppContact } from '../index';

interface FormType {
  name: string;
  placeholder: string;
  label: string;
  style: CSSProperties;
  type: string;
  options?: { value: string | number; label: string }[];
}
interface SearchFormProps {
  onSearch: (values: any) => void;
}
const SearchContract = (props: SearchFormProps) => {
  // @ts-ignore   // fixme 再生塑料代码，已经淘汰
  const { state } = useContext(AppContact);

  const history = useHistory();
  const [form] = Form.useForm();
  const formList = (path): FormType[] => {
    const form = [
      {
        name: 'actName',
        placeholder: I18N.carbonFootprint.pleaseEnter,
        label: I18N.greenMeeting.activityName2,
        style: { width: '240px' },
        type: 'Input',
        options: [],
      },
      {
        name: 'status',
        placeholder: I18N.carbonFootprint.pleaseSelect,
        style: { width: '180px' },
        label: I18N.greenMeeting.activityStatus2,
        type: 'Select',
        options: [
          { value: '', label: I18N.carbonFootprint3.whole },
          { value: 0, label: I18N.components.notStartedYet },
          { value: 1, label: I18N.components.inProgress },
          { value: 2, label: I18N.greenMeeting.ended },
        ],
      },
    ];
    switch (path) {
      case '/greenMeeting/activity':
        break;
      case '/greenMeeting/adjust':
        form.pop();
        break;
      // case '/greenMeeting/activity':
      //   form.pop();
      //   break;
      case '/greenMeeting/report':
        form.pop();
        break;
      default:
    }
    return form;
  };
  const path = history.location.pathname;
  useEffect(() => {
    formList(path);
  }, []);
  const onSearch = async () => {
    await form.validateFields().then(res => {
      props.onSearch(res);
    });
  };
  const reset = () => {
    form.resetFields();
    props.onSearch({});
  };
  return (
    <div className='search'>
      <Row className='title'>
        <h2 className='tip'>{state.pageName}</h2>
      </Row>
      <Row>
        <Col span={20}>
          <Form form={form} layout='inline' onFinish={onSearch}>
            {formList(path)?.map(item => (
              <Form.Item label={item.label} name={item.name}>
                {/*  eslint-disable-next-line no-nested-ternary */}
                {item.type === 'Input' ? (
                  <Input style={item.style} placeholder={item.placeholder} />
                ) : item.type === 'Select' ? (
                  <Select
                    style={item.style}
                    options={item.options}
                    placeholder={item.placeholder}
                  />
                ) : (
                  ''
                )}
              </Form.Item>
            ))}
            <Form.Item>
              <Button
                className='btn-style'
                icon={<IconFont type='icon-icon-xiaosuo' />}
                htmlType='submit'
              >
                {I18N.carbonNeutral.query}</Button>
            </Form.Item>

            <Form.Item>
              <Button className='btn-style' htmlType='reset' onClick={reset}>
                {I18N.carbonFootprint3.reset}</Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={4} style={{ textAlign: 'right' }}>
          <Permission flag={state.flag}>
            <Button
              type='primary'
              onClick={() => {
                const path =
                  // eslint-disable-next-line no-nested-ternary
                  state.addWord === I18N.greenMeeting.activity
                    ? '/greenMeeting/activity/addActivity'
                    : state.addWord === I18N.greenMeeting.carbonAccounting
                    ? '/greenMeeting/adjust/addAdjustOne'
                    : '/greenMeeting/report/addReport';
                history.push(path);
              }}
            >
              {I18N.carbonFootprint.newAddition}{state.addWord}
            </Button>
          </Permission>
        </Col>
      </Row>
    </div>
  );
};

export default SearchContract;
