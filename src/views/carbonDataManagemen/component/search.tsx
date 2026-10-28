/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-18 09:40:39
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:32:15
 */
import I18N from '@src/lang/I18N';
import { CSSProperties, useContext, useEffect } from 'react';
import IconFont from '@components/iconfont';
import { Button, Col, Form, Input, Row, Select, DatePicker } from 'antd';
import Permission from '@components/Permission';
import '@views/greenMeeting/carbon-greenMeeting.scss';
import { useHistory } from 'react-router-dom';
import { AppContact } from '../list';
import './style.less';

const { RangePicker } = DatePicker;
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
  onClick?: () => void;
}
const SearchContract = (props: SearchFormProps) => {
  // @ts-ignore   // fixme 待补充类型
  const { state } = useContext(AppContact);
  const history = useHistory();
  const [form] = Form.useForm();
  const formList = (path): FormType[] => {
    const formArr = [
      {
        name: 'targetName',
        placeholder: I18N.carbonFootprint.pleaseEnter,
        label: I18N.carbonDataManagemen.targetName,
        style: { width: '240px' },
        type: 'Input',
        options: [],
      },
      {
        name: 'status',
        placeholder: I18N.carbonFootprint.pleaseSelect,
        label: I18N.carbonDataManagemen.targetStatus,
        style: { width: '240px' },
        type: 'Select',
        options: [
          {
            value: '',
            label: I18N.carbonFootprint3.whole,
          },
          {
            value: '0',
            label: I18N.carbonDataManagemen.unallocated,
          },
          {
            value: '1',
            label: I18N.components.inProgress,
          },
          {
            value: '2',
            label: I18N.carbonDataManagemen.archived,
          },
        ],
      },
    ];
    if (path === '/carbonDataManagemen/goalObjective') {
      return [
        {
          name: 'targetName',
          placeholder: I18N.carbonFootprint.pleaseEnter,
          label: I18N.carbonDataManagemen.targetName,
          style: { width: '240px' },
          type: 'Input',
          options: [],
        },
        {
          name: 'exStatus',
          placeholder: I18N.carbonFootprint.pleaseSelect,
          label: I18N.carbonDataManagemen.targetStatus,
          style: { width: '240px' },
          type: 'Select',
          options: [
            {
              value: '',
              label: I18N.carbonFootprint3.whole,
            },
            {
              value: '0',
              label: I18N.carbonDataManagemen.toBeConfirmed,
            },
            {
              value: '1',
              label: I18N.components.inProgress,
            },
            {
              value: '2',
              label: I18N.carbonDataManagemen.rejected,
            },
            {
              value: '3',
              label: I18N.carbonDataManagemen.archived,
            },
            {
              value: '4',
              label: I18N.carbonDataManagemen.reviewed,
            },
          ],
        },
      ];
    }
    if (path === '/carbonDataManagemen/dataToSubmit') {
      return [
        {
          name: 'subName',
          placeholder: I18N.carbonFootprint.pleaseEnter,
          label: I18N.carbonInternational.dataName,
          style: { width: '240px' },
          type: 'Input',
          options: [],
        },
        {
          name: 'targetName',
          placeholder: I18N.carbonFootprint.pleaseEnter,
          label: I18N.carbonInternational.associatedTargets,
          style: { width: '240px' },
          type: 'Input',
        },
        {
          name: 'userName',
          placeholder: I18N.carbonFootprint.pleaseEnter,
          label: I18N.carbonDataManagemen.submittedBy2,
          style: { width: '240px' },
          type: 'Input',
        },
        {
          name: 'subStatus',
          placeholder: I18N.carbonFootprint.pleaseSelect,
          label: I18N.carbonFootprint3.reviewStatus,
          style: { width: '240px' },
          type: 'Select',
          options: [
            {
              value: '',
              label: I18N.carbonFootprint3.whole,
            },
            {
              value: '0',
              label: I18N.carbonFootprint3.pendingReview,
            },
            {
              value: '1',
              label: I18N.carbonFootprint3.approved,
            },
            {
              value: '2',
              label: I18N.emission.reviewRejection,
            },
          ],
        },
        {
          name: 'type',
          placeholder: I18N.carbonFootprint.pleaseSelect,
          label: I18N.DomesticVersion.dataSources,
          style: { width: '240px' },
          type: 'Select',
          options: [
            {
              value: '',
              label: I18N.carbonFootprint3.whole,
            },
            {
              value: '1',
              label: I18N.carbonFootprint3.enterpriseCarbonAccounting,
            },
            {
              value: '2',
              label: I18N.carbonFootprint.carbonFootprintVerification2,
            },
          ],
        },
        {
          name: 'beginTime',
          placeholder: I18N.carbonFootprint.pleaseEnter,
          label: I18N.carbonDataManagemen.submissionTime,
          style: { width: '240px' },
          type: 'RangePicker',
        },
      ];
    }
    if (path === '/carbonDataManagemen/performanceManagement') {
      return [
        {
          name: 'targetName',
          placeholder: I18N.carbonFootprint.pleaseEnter,
          label: I18N.carbonDataManagemen.targetName,
          style: { width: '240px' },
          type: 'Input',
          options: [],
        },
        {
          name: 'userName',
          placeholder: I18N.carbonFootprint.pleaseEnter,
          label: I18N.carbonDataManagemen.responsiblePerson,
          style: { width: '240px' },
          type: 'Input',
          options: [],
        },
        {
          name: 'isScored',
          placeholder: I18N.carbonFootprint.pleaseSelect,
          label: I18N.carbonDataManagemen.whetherToRate,
          style: { width: '240px' },
          type: 'Select',
          options: [
            {
              label: I18N.carbonFootprint3.whole,
              value: '',
            },
            {
              label: I18N.carbonNeutral.yes,
              value: 1,
            },
            {
              label: I18N.carbonNeutral.no,
              value: 0,
            },
          ],
        },
      ];
    }
    if (path === '/carbonDataManagemen/downLoadManagement') {
      return [
        {
          name: 'name',
          placeholder: I18N.carbonFootprint.pleaseEnter,
          label: I18N.carbonFootprint.fileName,
          style: { width: '240px' },
          type: 'Input',
          options: [],
        },
        {
          name: 'name',
          placeholder: I18N.carbonFootprint.pleaseSelect,
          label: I18N.carbonFootprint3.dataType,
          style: { width: '240px' },
          type: 'Select',
          options: [
            {
              value: I18N.carbonNeutral.yes,
              label: I18N.carbonNeutral.yes,
            },
            {
              value: I18N.carbonNeutral.no,
              label: I18N.carbonNeutral.no,
            },
          ],
        },
      ];
    }
    if (path === '/carbonDataManagemen/enterPriceBasicData/baseYearSet') {
      return [];
    }
    if (
      path ===
      '/carbonDataManagemen/enterPriceBasicData/productionAndOperationIndex'
    ) {
      return [];
    }
    if (
      path ===
      '/carbonDataManagemen/enterPriceBasicData/productionOperationData'
    ) {
      return [];
    }
    return formArr;
  };
  const path = history.location.pathname;

  useEffect(() => {
    // reset()
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
  // const obj = {
  //   建筑: 'ConstructionManagement:add',
  //   核算: 'AccountingList:add',
  // };
  const flagObj = {
    设定: 'goalSetting:addTarget',
    指标: 'productionAndOperationIndex:add',
    运营: 'productionOperationData:add',
  };
  return (
    <ul className='search'>
      {/* <Row className='title'>
        <h2 className='tip'>{state.pageName}</h2>
      </Row> */}
      <Row justify='space-between'>
        <Form
          form={form}
          layout='inline'
          onFinish={onSearch}
          style={{ gap: '5px' }}
        >
          {formList(path)?.map(item => (
            <Form.Item name={item.name}>
              {item.type === 'Input' ? (
                <Input
                  style={item.style}
                  placeholder={item.label}
                  maxLength={50}
                />
              ) : item.type === 'Select' ? (
                <Select
                  style={item.style}
                  options={item.options}
                  placeholder={item.label}
                  onChange={() => {
                    onSearch();
                  }}
                />
              ) : item.type === 'RangePicker' ? (
                <RangePicker style={item.style} />
              ) : (
                ''
              )}
            </Form.Item>
          ))}
          {formList(path).length > 0 && (
            <>
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
            </>
          )}
        </Form>

        {state.addWord && (
          <Col span={3} style={{ textAlign: 'right' }}>
            <Permission flag={flagObj[state.addWord]}>
              <Button
                type='primary'
                onClick={() => {
                  if (state.addWord === I18N.carbonDataManagemen.setting) {
                    history.push(`/carbonDataManagemen/goalSetting/add`);
                  }
                  if (state.pageName === I18N.carbonDataManagemen.targetExecution) {
                    history.push(`/carbonDataManagemen/goalObjective/add`);
                  }
                  if (state.addWord === I18N.carbonDataManagemen.operations) {
                    history.push(
                      '/carbonDataManagemen/enterPriceBasicData/productionOperationData/add',
                    );
                    return;
                  }
                  if (state.addWord === I18N.carbonDataManagemen.index) {
                    if (props?.onClick) {
                      props.onClick();
                    }
                  }
                }}
                style={{ marginRight: '20px', width: '70px' }}
              >
                {/* 新建{state.addWord} */}
                {I18N.carbonFootprint.newAddition}</Button>
            </Permission>
          </Col>
        )}
      </Row>
    </ul>
  );
};

export default SearchContract;
