import { formPropsInit } from '@src/components/FormUtil/util';
import { checkPermissions } from '@src/components/Permission/utils';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Toast } from '@src/utils/Toast';
import { Button, Form, FormProps, Modal } from 'antd';
import { isUndefined } from 'lodash-es';
import { FC, memo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { columns } from './columns';
import { PAGETAYPE } from './const';
import { searchTableFormItem } from './formItems';
import style from './index.module.less';
import DownLoadModal from '../../HomePage/components/DownLoadModal';
import {
  apiAddSubmit,
  apiCancelCarbonAuth,
  apiDeletevCarbonAuth,
  apiGETCarbonAuthFiles,
  apiGETCarbonAuthList,
} from '../service';
import {
  CarbonAuthInfoReturn,
  CarbonAuthListParam,
  PageReturn,
  Response,
} from '../type';

const CertificationProject: FC = () => {
  const history = useHistory();

  const childRef = useRef<TableRef>();

  const [searchForm] = Form.useForm();

  const [searchParamsData, setSearchParamsData] = useState<CarbonAuthListParam>(
    {
      pageNum: 1,
      pageSize: 10,
    },
  );

  const [vis, setVis] = useState<boolean>(false);

  const [fileList, setFileList] = useState<any[]>([]);

  const searchFormProps: FormProps = {
    ...formPropsInit(),
    layout: 'inline',
    form: searchForm,
  };

  const searchSub = () => {
    const val = searchForm.getFieldsValue();
    setSearchParamsData({
      ...searchParamsData,
      ...val,
    });
  };

  const resetBack = () => {
    setSearchParamsData({
      pageNum: searchParamsData?.pageNum,
      pageSize: searchParamsData?.pageSize,
    });
  };

  const onPageTo = (pageType: PAGETAYPE, id?: number, applyNo?: string) => {
    history.push(
      `${RouteMaps.CarbonFootprintCertificationProjectApplay}?pageType=${pageType}&id=${id}&applyNo=${applyNo}`,
    );
  };

  // 删除
  const onDelete = async (id: number, name: string) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      icon: (
        <IconAlibaba
          type='icon-icon_warning'
          size={24}
          style={{
            color: '#FBA93E',
          }}
        />
      ),
      content: (
        <div className={style.modalContent}>
          {I18N.Certification.areYouSure3}
          <span className={style.warn}>{name}</span>
          {I18N.Certification.certificationReviewApplication}
        </div>
      ),
      okButtonProps: {
        style: { background: '#fba93e', color: '#fff' },
      },
      onOk: async () => {
        await apiDeletevCarbonAuth({
          id,
        });
        childRef.current?.reset();
        Toast('success', I18N.components.success);
      },
    });
  };

  // 提交
  const onSubmit = async (id: number, name: string) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      icon: (
        <IconAlibaba
          type='icon-icon_warning'
          size={24}
          style={{
            color: '#0cbf9f',
          }}
        />
      ),
      content: (
        <div className={style.modalContent}>
          {I18N.Certification.areYouSure2}
          <span className={style.info}>{name}</span>
          {I18N.Certification.pleaseReviewTheApplication}
        </div>
      ),
      okButtonProps: {
        style: { background: '#0cbf9f', color: '#fff' },
      },
      onOk: async () => {
        await apiAddSubmit({
          id,
        });
        childRef.current?.reset();
        Toast('success', I18N.components.success);
      },
    });
  };

  // 撤回
  const onRetract = async (id: number, name: string) => {
    if (isUndefined(id)) return;
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: (
        <div className={style.modalContent}>
          {I18N.Certification.areYouSure}
          <span className={style.warn}>{name}</span>
          {I18N.Certification.reviewApplication}
        </div>
      ),
      okButtonProps: {
        style: { background: '#fba93e', color: '#fff' },
      },
      onOk: async () => {
        await apiCancelCarbonAuth({ id });
        childRef.current?.reset();
        Toast('success', I18N.components.success);
      },
    });
  };

  // 下载
  const onDownload = async (id: number) => {
    const { data } = await apiGETCarbonAuthFiles({
      type: 7,
      sourceId: id,
    });

    setFileList(
      data?.data?.map(d => ({
        name: d?.name,
        url: d?.url,
        id: d?.id,
      })) || [],
    );
    setVis(true);
  };

  return (
    <div className={style.certificationProject}>
      <div className={style.header}>
        <div className={style.title}>
          {I18N.Certification.carbonFootprintCertification2}
        </div>
        <div className={style.operateBtn}>
          {checkPermissions(
            <Button type='primary' onClick={() => onPageTo(PAGETAYPE.ADD)}>
              {I18N.Certification.initiateCertificationApplication}
            </Button>,
            'CertificationCarbonFootprintProject:Apply',
          )}
        </div>
      </div>
      <div className={style.searchForm}>
        <SearchFormUtil
          antdFormProps={searchFormProps}
          searchSub={searchSub}
          resetBack={resetBack}
          formItems={searchTableFormItem()}
        />
      </div>
      <CommonTable<
        CarbonAuthInfoReturn,
        Response<PageReturn<CarbonAuthInfoReturn>>,
        CarbonAuthListParam
      >
        bordered={false}
        searchParams={searchParamsData}
        cRef={childRef}
        pageSize={10}
        scroll={{ x: 1200 }}
        fetchApi={params =>
          apiGETCarbonAuthList({
            ...params,
            pageNum: params.page,
            pageSize: params.size,
          })
        }
        returnFetchApi={data => ({
          data: data.data.data?.rows || [],
          count: data.data.data?.total || 0,
        })}
        columns={columns({
          onSubmit,
          onRetract,
          onDelete,
          onPageTo,
          onDownload,
        })}
        rowKey='id'
      />
      <DownLoadModal
        title={I18N.Certification.downloadReportsAnd}
        visible={vis}
        onCancel={() => {
          setVis(false);
        }}
        fileList={fileList}
      />
    </div>
  );
};

export default memo(CertificationProject);
