import I18N from '@src/lang/I18N';
import { Selector } from '@src/views/carbonInternational/carbonManagement/Selector';
import { Button, Form, Input } from 'antd';
import React, { FC, useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import '../carbon-greenMeeting.scss';
import { Toast } from '@src/utils/Toast';
import {
  apiActivityList,
  apiCarbonAccountingTplModels,
  apiCarbonAccountingAdd,
  apiCarbonAccountingInit,
  apiCarbonAccountingEdit,
} from '../service';
import { actClassify } from '../columns';

export const AppContact: any = React.createContext({});
const Product: FC = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [activeList, setActiveList] = useState([]);
  const [actClassfiy, setActClassfiy] = useState<number>(10);
  const [modelList, setModelList] = useState<any[]>([]);
  // 选中的模型id
  const [act, setAct] = useState(0);
  const [accountingId, setAccountingId] = useState('');
  const [pageType, setPageType] = useState('');
  const path = history.location.pathname;
  const id = new URLSearchParams(window.location.search).get('id');

  const initData = async () => {
    const res: any = await apiActivityList({ page: 1, size: 10000 });
    const list = res.data.data.rows;
    setActiveList(
      list.map(item => ({
        value: item.actId,
        label: item.actName,
        actClass: item.actClass,
      })),
    );
    // 编辑的时候不展示列表数据，只展示一条选中的值
    if (!id) {
      apiCarbonAccountingTplModels({
        page: 1,
        size: 10000,
      }).then(modelData => {
        const { rows } = modelData.data.data;
        setModelList(rows);
        if (rows?.[0]?.modelId) {
          form.setFieldsValue({
            modelId: rows?.[0]?.modelId,
          });
          setAct(rows[0].modelId);
        }
      });
    }
  };
  const getDetail = async (accountingId: string) => {
    const res: any = await apiCarbonAccountingInit({ accountingId });
    const { accountingName, actClass, actId, modelId, modelName } =
      res?.data?.data || {};
    setActClassfiy(Number(actClass));
    form.setFieldsValue({
      accountingName,
      actId,
      modelId,
    });
    setModelList([{ modelId, modelName }]);
    setAct(modelId);
  };
  useEffect(() => {
    initData();
    if (path.includes('eidtAdjustOne')) {
      setAccountingId(id || '');
      setPageType('edit');
    } else if (path.includes('addAdjustOne')) {
      setPageType('add');
    }
    id && getDetail(id);
  }, []);
  const actData = useMemo(() => activeList, [activeList]);

  const modalType = () => (
    <div className='model-box'>
      {modelList?.map((item: any) => (
        <div
          key={item.modelId}
          title={item.modelName}
          className={
            act === item.modelId ? 'model-item model-act' : 'model-item'
          }
          style={{
            cursor: pageType === 'edit' ? 'not-allowed' : 'pointer',
          }}
          onClick={() => {
            if (pageType === 'edit') return;
            setAct(item.modelId);
            form.setFieldsValue({ modelId: item.modelId });
          }}
        >
          {item.modelName}
        </div>
      ))}
    </div>
  );
  const formList = [
    {
      name: I18N.greenMeeting.carbonAccountingName2,
      id: 'accountingName',
      className: 'colunms-3',
      render: (
        <Input
          style={{ marginRight: '50px' }}
          maxLength={100}
          placeholder={I18N.carbonFootprint.pleaseEnter}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.activityName,
      id: 'actId',
      className: 'colunms-3',
      render: (
        <Selector
          aria-label='actId'
          disabled={pageType === 'edit'}
          onChange={value => {
            const actObj: any = actData.find(
              (item: any) => `${item.value}` === `${value}`,
            );
            setActClassfiy(Number(actObj.actClass));
          }}
          style={{ marginRight: '50px' }}
          placeholder={I18N.carbonFootprint.pleaseSelect}
          options={actData || []}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.greenMeeting.activityClassification,
      id: 'actClass',
      className: 'colunms-3',
      render: (
        <div className='readonly'>
          <Input value={actClassify[actClassfiy]} disabled />
        </div>
      ),
    },
    {
      name: I18N.greenMeeting.carbonAccountingModel,
      id: 'modelId',
      className: 'w_100',
      render: modalType(),
      rule_required: true,
    },
  ];

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
        onFinish={e => {
          const { accountingName, actId, modelId } = e;

          if (pageType === 'edit' && accountingId) {
            apiCarbonAccountingEdit({
              accountingName,
              accountingId,
            }).then(
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
            apiCarbonAccountingAdd({ accountingName, actId, modelId }).then(
              (res: any) => {
                if (res.data.code === 200) {
                  Toast('success', I18N.carbonFootprint.saveSuccessful);
                  history.push(
                    `/greenMeeting/adjust/addAdjustTwo?id=${res.data.data}`,
                  );
                }
              },
              () => {},
            );
          }
        }}
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
                message: I18N.template(I18N.greenMeeting.itemn2, { val1: item.name }),
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
            {I18N.carbonFootprint.cancel}</Button>
          <Button type='primary' htmlType='submit'>
            {I18N.carbonFootprint.preserve}{pageType === 'edit' ? '' : I18N.carbonFootprint.nextStep}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Product;
