/**
 * @file 认证 碳核查项目
 */
import I18N from '@src/lang/I18N';
import Permission from '@src/components/Permission';
import { Button, Modal } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  operatingRecordaddOperating,
  projectInspectqueryByPage,
} from '@src/api/authentication/verification';
import { useHistory } from 'react-router-dom';
import VerifyUtils from '@src/utils/verifty';
import { useSelector } from 'react-redux';
import { RootState } from '@src/store';
import { Enterprieindexjson } from './indexjson';
import style from './index.module.scss';
import CertificationSearchForm from '../searchFrom';
import CerSearchTable from '../searchTable';
import {
  Enterprise_verification_index,
  ProductStatuslist,
} from '../Product/indesjson';
import { AuthIndex, AuthProduct } from '../indexjson';

const CertificationEnterpriseProduct = () => {
  const [showModal, setShowModal] = useState(false); // 是否要展示状态操作的执行框
  const [modelRecord, setModalRecord] = useState<AuthIndex['recoedList']>(); // 状态改变的model的内容
  const [modalList, setModalList] = useState<AuthProduct>({
    label: '',
    text: '',
    value: '',
  });
  const history = useHistory();
  const [total, settotal] = useState(0); // 列表总数量
  const [form, setfrom] = useState({}); // 搜索的form表单数据
  const Service_list = useMemo(
    () =>
      // 根绝路由来判断是哪个产品底下的列表展示
      Enterprise_verification_index('/Certification/Enterprise/index'),
    [history.location.pathname],
  );
  // 列表操作的点击事件
  const handleChange = (b: AuthIndex) => {
    // eslint-disable-next-line no-empty
    if (b.itemlist.url) {
    } else {
      setShowModal(true);
      setModalList(b.itemlist);
      setModalRecord(b.recoedList);
    }
  };
  // 列表操作的点击事件
  const handleClick = (e, b) => {
    switch (e) {
      case 'status':
        return handleChange(b);
      case 'detail':
        return history.push(`/Certification/Enterprise/product/detail?${b}`);
      case 'url':
        return history.push(b);
      case 'handle': // 如果是handle的话执行展示model的操作
        return handleChange(b);
      default:
        return null;
    }
  };
  // 列表页码
  const [pagetion, setpagetion] = useState({
    page: 1,
    size: 10,
  });
  // 列表展示的相关内容
  const EnterprieindexjsonList = useMemo(
    () => Enterprieindexjson(ProductStatuslist(), handleClick),
    [ProductStatuslist()],
  );
  const userSelector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const [datasource, setdatasource] = useState([]); // 列表内容
  const [loading, setLoad] = useState(true); // 列表的加载事件
  const handlePage = e => {
    // 列表页码跳转
    setpagetion(e);
  };
  // 执行状态改变的操作
  const chanageStatus = b => {
    const userinfo = userSelector?.userInfo;
    const obj: AuthIndex['authSubStatus'] = {
      platform: '1',
      projectId: b.projectId,
      companyId: localStorage.getItem('COMPANY_ID'),
      userName: userinfo.username,
      type: '0',
      operatingFlag: modalList.text,
      status: modalList.value,
      userId: `${userinfo.userId}`,
    };
    operatingRecordaddOperating({ ...obj }).then(() => {
      VerifyUtils.Toast('success', I18N.carbonFootprint.operationSuccessful);
      setShowModal(false);
      getlist();
    });
  };
  // 获取列表内容
  const getlist = () => {
    projectInspectqueryByPage({
      type: 0,
      pageSize: pagetion.size,
      pageNum: pagetion.page,
      companyId: localStorage.getItem('COMPANY_ID'),
      ...form,
    })
      .then(res => {
        setdatasource(res.data.rows);
        settotal(res.data.total);
        setLoad(false);
      })
      .catch(() => {
        setLoad(false);
      });
  };
  useEffect(() => {
    getlist();
  }, [pagetion, form]);
  return (
    <div className={style.EnterpriseIndex}>
      <div className={style.searchTitle}>
        {/* 标题区 */}
        <div className={style.searchTitle_text}>
          {EnterprieindexjsonList.title}
        </div>
      </div>
      <div className={style.flextitle}>
        {/* 查询区域 */}
        <CertificationSearchForm
          handlefinlist={e => {
            setfrom(e);
            setpagetion({
              page: 1,
              size: 10,
            });
          }}
          searchFrom={EnterprieindexjsonList.searchFrom}
        />
        {/* 发起申请区 */}
        <Permission flag={EnterprieindexjsonList.addBtn.flag}>
          <Button
            type='primary'
            onClick={() => {
              localStorage.setItem(
                'initSelect',
                JSON.stringify(Service_list.Specifications[0].json),
              );
              history.push(Service_list?.addul);
            }}
          >
            {EnterprieindexjsonList.addBtn.text}
          </Button>
        </Permission>
      </div>
      {/* 图表展示区域 */}
      <div style={{ padding: '0px 16px' }}>
        <CerSearchTable
          columns={EnterprieindexjsonList.searchTableColumns}
          loading={loading}
          pageTion={pagetion}
          total={total}
          dataSource={datasource}
          handlePage={handlePage}
        />
      </div>
      {/* 列表的更多操作 */}
      <Modal
        open={showModal}
        width='400px'
        title={
          modalList?.label &&
          modalList?.label.indexOf(I18N.carbonFootprint.confirm) !== -1
            ? modalList?.label
            : I18N.template(I18N.Certification.confirmMod, {
                val1: modalList?.label,
              })
        }
        onCancel={() => setShowModal(false)}
        onOk={() => {
          chanageStatus(modelRecord);
        }}
      >
        <p className={style.modeltitle}>
          {I18N.Certification.thisOperationIsNotAllowed}
          {modalList?.label &&
          modalList?.label.indexOf(I18N.carbonFootprint.confirm) !== -1
            ? modalList?.label
            : I18N.template(I18N.Certification.confirmMod, {
                val1: modalList?.label,
              })}
          {I18N.Certification.isIt}
        </p>
      </Modal>
    </div>
  );
};
export default CertificationEnterpriseProduct;
