import {
  operatingRecordaddOperating,
  projectInspectqueryByPage,
} from '@src/api/authentication/verification';
import Permission from '@src/components/Permission';
import I18N from '@src/lang/I18N';
import { RootState } from '@src/store';
import VerifyUtils from '@src/utils/verifty';
import { Button, Modal } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import {
  Enterprise_verification_index,
  Productindexjson,
  ProductStatuslist,
} from './indesjson';
import style from '../Enterprise/index.module.scss';
import CertificationSearchForm from '../searchFrom';
import CerSearchTable from '../searchTable';

const CertificationProductProduct = () => {
  const history = useHistory();
  const [loading, setloading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalList, setmodalList] = useState<any>({ test: '', label: '' });
  const [modelRecord, setModalRecord] = useState<any>();
  const [total, settotal] = useState(0);
  const Service_list = useMemo(
    () => Enterprise_verification_index('/Certification/Product/index'),
    [history.location.pathname],
  );
  const [form, setfrom] = useState<any>({});
  const [pagetion, setpagetion] = useState({
    page: 1,
    size: 10,
  });
  const [datasource, setdatasource] = useState([]);
  const userinfo = useSelector<
    RootState,
    RootState['companyUserInfo']['userInfo']
  >(s => s.companyUserInfo?.userInfo);
  const chanageStatus = b => {
    const obj: any = {
      platform: '1',
      projectId: b.projectId,
      companyId: localStorage.getItem('COMPANY_ID'),
      userName: userinfo.username,
      type: '1',
      operatingFlag: modalList.text,
      status: modalList.value,
      userId: userinfo.userId,
    };
    operatingRecordaddOperating({ ...obj })
      .then(() => {
        VerifyUtils.Toast('success', I18N.carbonFootprint.operationSuccessful);
        setShowModal(false);
        getlist();
      })
      .catch(() => {});
  };
  // eslint-disable-next-line consistent-return
  const handleClick = (e, b) => {
    switch (e) {
      case 'detail':
        return history.push(`${EnterprieindexjsonList.detailUrl}?${b}`);
      case 'list':
        setpagetion({
          page: 1,
          size: 10,
        });
        return getlist();
      case 'status':
        return chanageStatus(b);
      case 'submitlist':
        return history.push(`${b.url}?${b.id}`);
      case 'url':
        return history.push(`${b}`);
      case 'handle':
        setShowModal(true);
        setModalRecord(b.recoedList);
        setmodalList(b.itemlist);
        break;
      default:
    }
    // }
  };
  const EnterprieindexjsonList = useMemo(
    () => Productindexjson(ProductStatuslist(), handleClick),
    [datasource],
  );
  const handlePage = e => {
    setpagetion(e);
  };
  const getlist = () => {
    projectInspectqueryByPage({
      type: 1,
      pageSize: pagetion.size,
      pageNum: pagetion.page,
      companyId: localStorage.getItem('COMPANY_ID'),
      ...form,
    })
      .then((res: any) => {
        setdatasource(res.data.rows);
        settotal(res.data.total);
        setloading(false);
      })
      .finally(() => {
        setloading(false);
      });
  };
  useEffect(() => {
    getlist();
  }, [pagetion]);
  return (
    <div className={style.EnterpriseIndex}>
      <div className={style.searchTitle}>
        <div className={style.searchTitle_text}>
          {EnterprieindexjsonList.title}
        </div>
      </div>
      {/* 查询区域 */}
      <div className={style.flextitle}>
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
          loading={loading}
          columns={EnterprieindexjsonList.searchTableColumns}
          pageTion={pagetion}
          dataSource={datasource}
          handlePage={handlePage}
          total={total}
        />
      </div>
      <Modal
        open={showModal}
        title={modalList?.label}
        onCancel={() => setShowModal(false)}
        onOk={() => {
          chanageStatus(modelRecord);
        }}
      >
        <p className={style.modeltitle}>
          {I18N.Certification.thisOperationIsNotAllowed}
          {modalList?.label.indexOf(I18N.carbonFootprint.confirm) !== -1
            ? modalList?.label
            : I18N.template(I18N.Certification.confirmMod2, {
                val1: modalList?.label,
              })}
          {I18N.Certification.isIt}
        </p>
      </Modal>
    </div>
  );
};
export default CertificationProductProduct;
