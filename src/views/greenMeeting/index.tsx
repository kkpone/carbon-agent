import I18N from '@src/lang/I18N';
import { createContext, FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useSyncCallback from '@utils/useSyncCallback';
import { Button, Modal } from 'antd';
import { Toast } from '@src/utils/Toast';
import SearchContract from './component/search';
import SearchTableList from './component/tableList';
import { creatColumns } from './columns';
import {
  apiActivityDelete,
  apiActivityList,
  apiCarbonAccountingList,
  apiAccountingReportList,
  apiAccountingReportDelete,
  apiAccountingReportGenerate,
  apiCarbonAccountingDelete,
} from './service';
import uploadSuccess from '../../assets/icon/sy/upload-success.svg';
import './carbon-greenMeeting.scss';

export const AppContact: any = createContext({});
const GreenMeeting: FC = () => {
  const history = useHistory();
  const path = history.location.pathname;

  const [state, setState] = useState({
    pageName:
      // eslint-disable-next-line no-nested-ternary
      path === '/greenMeeting/activity'
        ? I18N.greenMeeting.activityList
        : path === '/greenMeeting/adjust'
        ? I18N.greenMeeting.carbonEmissionAccounting
        : I18N.carbonNeutral.carbonAccountingReport,
    addWord:
      // eslint-disable-next-line no-nested-ternary
      path === '/greenMeeting/activity'
        ? I18N.greenMeeting.activity
        : path === '/greenMeeting/adjust'
        ? I18N.greenMeeting.carbonAccounting
        : I18N.carbonNeutral.report,
    flag:
      // eslint-disable-next-line no-nested-ternary
      path === '/greenMeeting/activity'
        ? 'meeting:activity:add'
        : path === '/greenMeeting/adjust'
        ? 'meeting:carbonAccounting:add'
        : 'meeting:accountingReport:add',
    TablePage: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    tablList: [],
  });
  const layoutDom: HTMLDivElement | any =
    document.querySelector('.layout__container');
  layoutDom && (layoutDom.style.height = 'calc(100% - 35px)');

  // const [IndexPage, setIndexPage] = useState(1);
  const [showLoading, setshowLoading] = useState(true);
  const [deleteId, setDeleteId] = useState();
  const [visible, setVisible] = useState(false);

  const [parmas, setParmas] = useState({
    page: 1,
    size: 10,
  });
  const [pageType, setPageType] = useState('');
  const [reportVisible, setReportVisible] = useState(false);
  const getlist = async () => {
    let res: any;
    switch (path) {
      case '/greenMeeting/activity':
        res = await apiActivityList(parmas);
        setPageType('act');
        break;
      case '/greenMeeting/adjust':
        res = await apiCarbonAccountingList(parmas);
        setPageType('adjust');
        break;
      case '/greenMeeting/report':
        res = await apiAccountingReportList(parmas);
        setPageType('report');
        break;
      default:
        break;
    }

    setState({
      ...state,
      tablList: res?.data?.data?.rows,
      TablePage: { ...state.TablePage, total: res?.data?.data?.total },
    });

    setshowLoading(false);
  };

  const syncCallbackFn = useSyncCallback(getlist);
  const getTabelLits = () => {};
  useEffect(() => {
    syncCallbackFn();
  }, []);
  useEffect(() => {
    getTabelLits();
  }, [
    state.TablePage.current,
    state.TablePage.pageSize,
    history.location.search,
  ]);
  const onSearch = e => {
    const { page, size } = parmas;
    setParmas({ ...e, page, size });
    syncCallbackFn();
  };
  const deleteItem = id => {
    setDeleteId(id);
    setVisible(true);
  };
  const creatReport = reportId => {
    setDeleteId(reportId);
    setReportVisible(true);
  };
  const columns = creatColumns(state.pageName, { deleteItem, creatReport });

  return (
    <div>
      {/* eslint-disable-next-line */}
      <AppContact.Provider value={{ state, setState }}>
        <SearchContract onSearch={onSearch} />
        <SearchTableList
          dataSource={state.tablList}
          page={state.TablePage}
          showLoading={showLoading}
          onchanage={e => {
            setState({ ...state, TablePage: e });
            setParmas({ ...parmas, page: e.current, size: e.pageSize });
            syncCallbackFn();
          }}
          columns={columns || []}
        />
      </AppContact.Provider>
      <Modal
        title={I18N.carbonFootprint.prompt}
        width={430}
        open={visible}
        cancelButtonProps={{ type: 'primary' }}
        onOk={() => {
          const formData = new FormData();
          let api: any;

          switch (path) {
            case '/greenMeeting/activity':
              api = apiActivityDelete;
              formData.append('actId', deleteId || '');
              break;
            case '/greenMeeting/adjust':
              api = apiCarbonAccountingDelete;
              formData.append('accountingId', deleteId || '');
              break;
            case '/greenMeeting/report':
              api = apiAccountingReportDelete;
              formData.append('reportId', deleteId || '');
              break;
            default:
              break;
          }

          api(formData).then(
            (res: any) => {
              if (res.data.code === 200) {
                // eslint-disable-next-line no-void
                void Toast('success', I18N.carbonFootprint.deleteSuccessful);
                syncCallbackFn();
              } else {
                // eslint-disable-next-line no-void
                void Toast(
                  'error',
                  res.data.msg || I18N.carbonFootprint.deleteSuccessful,
                );
              }
              setVisible(false);
            },
            () => {},
          );
        }}
        onCancel={() => setVisible(false)}
      >
        <p className='Modal_text'>
          {/* eslint-disable-next-line no-nested-ternary */}
          {pageType === 'act'
            ? I18N.greenMeeting.thisOperationWillBeTheSameAs
            : pageType === 'adjust'
            ? I18N.greenMeeting.thisOperationWillBeTheSameAs
            : I18N.greenMeeting.thisOperationWillDelete}
        </p>
      </Modal>
      <Modal
        title={I18N.carbonFootprint.generateReport}
        width={460}
        open={reportVisible}
        className='creatReport'
        onCancel={() => {
          setReportVisible(false);
        }}
        footer={[
          <div style={{ textAlign: 'center' }}>
            <Button key='submit' onClick={() => setReportVisible(false)}>
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button
              key='link'
              type='primary'
              onClick={() => {
                const formData = new FormData();
                formData.append('reportId', deleteId || '');
                apiAccountingReportGenerate(formData).then((res: any) => {
                  if (res.data.code === 200) {
                    setReportVisible(false);
                    const { userInfo } = JSON.parse(
                      localStorage.getItem('SET_COMPANY_USER_INFO') || '',
                    );

                    const index = userInfo.permissions?.findIndex(
                      item => item === 'management:report:download',
                    );
                    if (index >= 0) {
                      history.push('/dashborad/downloadManage');
                    } else {
                      Toast(
                        'warn',
                        I18N.greenMeeting.youCurrentlyHaveNoDownloadsAvailable,
                      );
                    }
                  }
                });
              }}
            >
              {I18N.carbonFootprint.confirm2}
            </Button>
          </div>,
        ]}
      >
        <img
          width={102}
          style={{ margin: '0px auto 10px auto', display: 'block' }}
          src={uploadSuccess}
          alt=''
        />

        <p
          style={{
            textAlign: 'center',
            color: '#333',
            fontSize: '14px',
            fontWeight: '400',
            marginBottom: '20px',
          }}
        >
          {I18N.greenMeeting.generateReportTask}
        </p>
      </Modal>
    </div>
  );
};

export default GreenMeeting;
