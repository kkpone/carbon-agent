import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { BraftEditorComponent } from '@components/BraftEditor';
import { Button, Form, Input, Select } from 'antd';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../carbon-greenMeeting.scss';
import {
  apiAccountingReportAdd,
  apiAccountingReportInfo,
  apiAccountingReportEdit,
  apiCarbonAccountingList,
} from '../service';

export const AppContact: any = React.createContext({});
const Product: FC = () => {
  const layoutDom: HTMLDivElement | any =
    document.querySelector('.layout__container');
  layoutDom && (layoutDom.style.height = 'calc(100% - 130px)');
  const history = useHistory();
  const [form] = Form.useForm();
  const [pageType, setPageType] = useState('');
  const [reportId, setReportId] = useState('');
  const [otherParams, setOtherParams] = useState({
    accountingName: '',
    actId: '',
    actName: '',
  });
  const [adjustList, setAdjustList] = useState([
    { label: '', value: '', props: '', actId: '', actName: '' },
  ]);
  const [initForm, setInitForm] = useState<{ background: string }>();
  const getData = (reportId: string) => {
    apiAccountingReportInfo({ reportId }).then((res: any) => {
      form.setFieldsValue(res.data.data);
      setOtherParams({
        ...otherParams,
        accountingName: res.data.data.accountingName,
      });
      setInitForm({ background: res.data.data.background });
    });
  };
  useEffect(() => {
    apiCarbonAccountingList({ page: 1, size: 10000 }).then(res => {
      setAdjustList(
        res.data.data.rows.map((item: any) => ({
          label: item.accountingName,
          value: item.accountingId,
          props: item.actName,
          actId: item.actId,
          actName: item.actName,
        })),
      );
    });
    const id = new URLSearchParams(window.location.search).get('id') || '';
    setReportId(id);
    id && getData(id);
    const path = history.location.pathname;
    if (path.includes('addReport')) {
      setPageType('add');
    } else if (path.includes('eidtReport')) {
      setPageType('eidt');
    } else if (path.includes('reportDetail')) {
      setPageType('detail');
    }
  }, []);
  const formList = useMemo(
    () => [
      {
        name: I18N.carbonFootprint.reportName,
        id: 'reportName',
        className: 'colunms-3',
        render: (
          <Input
            style={{ marginRight: '50px' }}
            disabled={pageType === 'detail'}
            maxLength={100}
            placeholder={I18N.carbonFootprint.pleaseEnter}
          />
        ),
        rule_required: true,
      },
      {
        name: I18N.carbonFootprint.accountingName,
        id: 'accountingId',
        className: 'colunms-3',
        render: (
          <Select
            style={{ marginRight: '50px' }}
            disabled={pageType === 'detail'}
            placeholder={I18N.carbonFootprint.pleaseSelect}
            onChange={(val, row: any) => {
              setOtherParams({
                ...otherParams,
                accountingName: row.children,
                actId: row.actId,
                actName: row.actName,
              });
              form.setFieldsValue({ actName: row.data });
            }}
          >
            {adjustList.map(item => (
              <Select.Option
                value={item.value}
                data={item.props}
                key={item.value}
                actId={item.actId}
                actName={item.actName}
              >
                {item.label}
              </Select.Option>
            ))}
          </Select>
        ),
        rule_required: true,
      },
      {
        name: I18N.greenMeeting.activityName,
        id: 'actName',
        className: 'colunms-3',
        render: <Input disabled maxLength={100} placeholder={I18N.carbonFootprint.pleaseEnter} />,
      },
      {
        name: I18N.greenMeeting.eventBackground,
        id: 'background',
        className: 'w_66',
        render:
          pageType === 'detail' ? (
            <Input.TextArea className='textarea' disabled />
          ) : (
            <div className='Editor'>
              <BraftEditorComponent
                defaultValue={initForm?.background}
                changeControls={() => [
                  'undo',
                  'redo',
                  'font-size',
                  'subscript',
                  'superscript',
                  'remove-styles',
                  'text-color',
                  'bold',
                  'italic',
                  'underline',
                  'strike-through',
                  'text-align',
                ]}
                placeholder={I18N.carbonFootprint.pleaseEnter}
                max={2000}
                onChange={(val?: string) => {
                  form.setFieldsValue({
                    ...form.getFieldsValue,
                    background: val,
                  });
                }}
              />
            </div>
          ),
        rule_required: true,
      },
    ],
    [initForm, adjustList],
  );

  return (
    <div className='main-box' style={{ background: '#fff' }}>
      <Form
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
        layout='vertical'
        form={form}
        initialValues={initForm}
      >
        {formList.map(item => (
          <Form.Item
            key={item.id}
            className={`${item?.className ?? ''}`}
            name={item.id}
            label={item.name}
            rules={[
              {
                required: item.rule_required,
                message: I18N.template(I18N.greenMeeting.itemn3, { val1: item.name }),
              },
            ]}
          >
            {item.render}
          </Form.Item>
        ))}
      </Form>
      <div className='bottom-box'>
        <Button
          onClick={() => {
            history.go(-1);
          }}
        >
          {I18N.carbonFootprint.return}</Button>
        {pageType === 'detail' ? (
          ''
        ) : (
          <Button
            type='primary'
            onClick={() => {
              form
                .validateFields()
                .then(res => {
                  let api;
                  const params: any = {
                    reportName: res.reportName,
                    accountingId: res.accountingId,
                    accountingName: otherParams.accountingName,
                    background: res.background,
                    actId: otherParams.actId,
                    actName: otherParams.actName,
                  };
                  if (pageType === 'add') {
                    api = apiAccountingReportAdd;
                  } else if (pageType === 'eidt') {
                    api = apiAccountingReportEdit;
                    params.reportId = reportId;
                  }

                  api(params).then(res => {
                    if (res.data.code === 200) {
                      Toast('success', I18N.carbonFootprint.operationSuccessful);
                      history.go(-1);
                    }
                  });
                })
                .catch(() => {});
            }}
          >
            {I18N.carbonFootprint.preserve}</Button>
        )}
      </div>
    </div>
  );
};

export default Product;
