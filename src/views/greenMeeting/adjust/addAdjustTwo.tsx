/**
 * @file 数据管理
 */
import I18N from '@src/lang/I18N';
import { Button, InputNumber, Radio, Table, Tabs } from 'antd';
import { createContext, FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../carbon-greenMeeting.scss';
import { Toast } from '@src/utils/Toast';
import { apiCarbonAccountingData, apiCarbonAccountingInfo } from '../service';

export const AppContact: any = createContext({});
const Product: FC = () => {
  const layoutDom: HTMLDivElement | any =
    document.querySelector('.layout__container');
  layoutDom && (layoutDom.style.height = 'calc(100% - 130px)');
  const history = useHistory();
  const [infoData, setInfoData] = useState({
    accountingName: '',
    actName: '',
  });
  const rendetTop = () => (
    <div className='adjustdata-box'>
      <p className='tip'>{I18N.greenMeeting.dataManagement}</p>
      <div className='name-box'>
        <p>{I18N.greenMeeting.carbonAccountingName}{infoData.accountingName}</p>
        <p>{I18N.greenMeeting.activityName2}{infoData.actName}</p>
      </div>
    </div>
  );
  const [accountingId, setAccountingId] = useState('');
  const [pageType, setPageType] = useState('');
  // 要展示的tab页
  const [treeList, setTreeList] = useState<any>([]);
  const [radioValue, setRadioValue] = useState<number | null>(0);
  const [allTable, setAllTable] = useState<any>([]);
  const [tabValue, setTabValue] = useState('');
  const listToTree = (list: string | any[]) => {
    const map: any = {};
    let node;
    const tree: any = [];
    let i;
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < list.length; i++) {
      // eslint-disable-next-line
      list[i].children = [];
      // eslint-disable-next-line
      list[i].key = i;
      map[list[i].classId] = list[i];
    }
    for (i = 0; i < list.length; i += 1) {
      // eslint-disable-next-line
      list[i].key = 1000 + i;
      node = list[i];
      if (node.parentId !== 0) {
        map[node.parentId].children.push(node);
      } else {
        tree.push(node);
      }
    }
    return tree;
  };
  const renderTab = () => {
    const column = [
      {
        title: I18N.carbonFootprint.number,
        width: 70,
        render: (text, record, index: number) => index + 1,
      },
      {
        title: I18N.carbonFootprint3.emissionSourceName,
        dataIndex: 'emissionName',
        width: 300,
      },
      {
        title: I18N.carbonFootprint3.activityData,
        dataIndex: 'emissionValue',
        width: 200,
        render: (text: string, record: any, i) => (
          <>
            {/* pageType = data 时是数据管理  add 是添加数据 */}
            {pageType === 'data' || pageType === 'add' ? (
              <InputNumber
                autoFocus={i === 0}
                tabIndex={i + 100}
                value={record.emissionValue}
                onChange={e => {
                  const index = allTable.findIndex(
                    item => `${item.emissionId}` === `${record.emissionId}`,
                  );
                  allTable[index].emissionValue = e;
                  setAllTable([...allTable]);
                }}
                onBlur={() => {
                  const index = allTable.findIndex(
                    item => `${item.emissionId}` === `${record.emissionId}`,
                  );
                  allTable[index].isEidt = false;
                  setAllTable([...allTable]);
                }}
                maxLength={99999999.9999}
              />
            ) : (
              <div
                style={{
                  color: text ? '#333' : '#AAAAAA',
                  height: '32px',
                  lineHeight: '32px',
                }}
                onClick={() => {
                  const index = allTable.findIndex(
                    item => `${item.emissionId}` === `${record.emissionId}`,
                  );

                  allTable[index].isEidt = true;
                  setAllTable([...allTable]);
                }}
              >
                {(pageType === 'data' || pageType === 'add') && !text
                  ? I18N.carbonFootprint.pleaseEnter
                  : text}
              </div>
            )}
          </>
        ),
      },
      {
        title: I18N.components.activityDataSheet3,
        dataIndex: 'unitDesc',
        width: 100,
        render: (text: string) => <div>{text}</div>,
      },
    ];

    return (
      <Tabs
        type='card'
        className='first-tab'
        onChange={id => {
          setTabValue(id);
          const curItem = treeList.find(
            (item: any) => `${item.classId}` === `${id}`,
          );
          const hasSecond = curItem?.children;
          if (hasSecond.length) {
            setRadioValue(curItem?.children[0]?.classId);
          } else {
            setRadioValue(null);
          }
        }}
      >
        {treeList.map((item: any) => (
          <Tabs.TabPane
            className='tab-item'
            tab={item.className}
            key={item.classId}
          >
            {item.children && item.children.length ? (
              <Radio.Group
                value={radioValue}
                onChange={val => {
                  const classTwo = val.target.value;
                  setRadioValue(classTwo);
                }}
              >
                {item.children.map((ite: any) => (
                  <Radio.Button key={ite.classId} value={ite.classId}>
                    {ite.className}
                  </Radio.Button>
                ))}
              </Radio.Group>
            ) : (
              ''
            )}

            <Table
              style={{ width: '100%' }}
              scroll={{ x: 900 }}
              className='SearchTable'
              dataSource={allTable.filter(
                item =>
                  `${item.classOne}` === `${tabValue}` &&
                  `${item.classTwo}` === `${radioValue}`,
              )}
              columns={column}
              pagination={false}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    );
  };
  const getData = (accountingId: string) => {
    apiCarbonAccountingInfo({ accountingId }).then(res => {
      const { accountingName, actName, modelEmissions } = res.data.data;
      setInfoData({ accountingName, actName });
      setAllTable(modelEmissions);
      const classTree = listToTree(res.data.data.modelClasses);
      setRadioValue(classTree?.children?.[0]?.classId || null);

      setTreeList(classTree);
      if (classTree.length) {
        const classOne = classTree[0]?.classId;
        const classTwo = classTree[0]?.children[0]?.classId;
        setTabValue(classOne);
        if (classTwo) {
          setRadioValue(classTree[0]?.children[0]?.classId);
        }
      }
    });
  };

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id') || '';
    id && getData(id);
    setAccountingId(id);
    if (history.location.pathname.includes('eidtAdjust')) {
      // 编辑
      setPageType('edit');
    } else if (history.location.pathname.includes('adjustDetail')) {
      // 详情
      setPageType('detail');
    } else if (history.location.pathname.includes('dataManage')) {
      // 数据管理
      setPageType('data');
    } else if (history.location.pathname.includes('addAdjustTwo')) {
      // 添加的二步
      setPageType('add');
    }
  }, []);

  useEffect(() => {}, [history.location.search]);
  return (
    <div className='two-box'>
      {rendetTop()}
      {renderTab()}
      <div className='bottom-box'>
        <Button
          onClick={() => {
            history.go(-1);
          }}
        >
          {I18N.carbonFootprint.cancel}</Button>
        <Button
          type='primary'
          onClick={() => {
            if (pageType === 'data' || pageType === 'add') {
              apiCarbonAccountingData({
                accountingId,
                modelEmissions: allTable,
              }).then((res: any) => {
                if (res.data.code === 200) {
                  Toast('success', I18N.carbonFootprint.saveSuccessful);
                  setTimeout(() => {
                    history.replace('/greenMeeting/adjust');
                  }, 800);
                }
              });
            }
          }}
        >
          {I18N.carbonFootprint.preserve}</Button>
      </div>
    </div>
  );
};

export default Product;
