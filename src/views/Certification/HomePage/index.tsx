import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import {
  Button,
  Select,
  Input,
  TableProps,
  GetProp,
  Table,
  Modal,
  Dropdown,
  MenuProps,
} from 'antd';
import { isUndefined } from 'lodash-es';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ButtonRadio } from '@/components/ButtonRadio';
import CustomerServicePopover from '@/components/CustomerServicePopover';
import { LocaleContext } from '@/components/LocaleProvider';
import Permission from '@/components/Permission';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils/Toast';
import { getAuthFileConfig } from '@/views/subModules/CarbonFootprintModel/Certification/CertificationForm/constant';
import { Page } from '@/views/subModules/CarbonFootprintModel/components/Page';

import { columns } from './columns';
import DownLoadModal from './components/DownLoadModal';
import {
  CERTIFYPROJECTSTATUS,
  CERTIFYPROJECTSTATUS_LABEL,
  PAGETAYPE,
} from './const';
// import cerIcon1Svg from './image/cerIcon1.svg';
// import cerIcon2Svg from './image/cerIcon2.svg';
// import cerIcon3Svg from './image/cerIcon3.svg';
// import cerIcon4Svg from './image/cerIcon4.svg';
import chevronDownSvg from './image/chevron-down.svg';
import earSvg from './image/ear.svg';
import emailSvg from './image/email.svg';
import phoneSvg from './image/phone.svg';
import plusSvg from './image/plus.svg';
import searchSvg from './image/search.svg';
import styles from './index.module.less';
import { postSubmitAuthByTable } from '../carbonFootprintCertification/certificationProject/component/ApplayCertification/service';
import { CERTIFYPROJECTTYPE } from '../carbonFootprintCertification/certificationProject/const';
import {
  apiCancelCarbonAuth,
  apiDeletevCarbonAuth,
  apiGETCarbonAuthFiles,
  apiGETCarbonAuthList,
} from '../carbonFootprintCertification/service';

export interface IHomePageProps {}

const { Search } = Input;

// const infoCardList = [
//   {
//     title: I18N.Certification.accurateData,
//     desc: I18N.Certification.carbonCloudCollaboratesWithTheWhole,
//     icon: cerIcon1Svg,
//   },
//   {
//     title: I18N.Certification.efficientCertification,
//     desc: I18N.Certification.carbonCloudCollaboratesWithTheWhole,
//     icon: cerIcon2Svg,
//   },
//   {
//     title: I18N.Certification.costOptimization,
//     desc: I18N.Certification.carbonCloudCollaboratesWithTheWhole,
//     icon: cerIcon3Svg,
//   },
//   {
//     title: I18N.Certification.valueUpgrade,
//     desc: I18N.Certification.carbonCloudCollaboratesWithTheWhole,
//     icon: cerIcon4Svg,
//   },
// ];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, 'pagination'>,
  boolean
>;

interface TableParams {
  pagination?: TablePaginationConfig;
}

export const HomePage: FC<IHomePageProps> = () => {
  const { locale } = useContext(LocaleContext);
  const [authType, setAuthType] = useState<string | number | undefined>();
  const [status, setStatus] = useState<string | number | undefined>();
  const [vis, setVis] = useState(false);
  const [downlaodModelTitle, setDownlaodModelTitle] = useState('');
  const [fileList, setFileList] = useState<{}[]>([]);
  const [searchContent, setSearchContent] = useState<string>('');
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  /**
   * 所有
   * 企业碳核算
   * 产品碳足迹报告
   * 产品对比报告
   */
  const authTypeList = useMemo(
    () => [
      {
        label: I18N.Certification.carbonFootprintVerification4,
        value: 0,
      },
      // {
      //   label: I18N.carbonFootprint3.productComparisonReport,
      //   value: 1,
      // },
      {
        label: I18N.Certification.corporateCarbonAccounting,
        value: 2,
      },
      {
        label: I18N.Certification.productCarbonLabeling,
        value: CERTIFYPROJECTTYPE.CARBON_LABEL,
      },
    ],
    [locale],
  );
  const statusList = useMemo(
    () => [
      {
        label: I18N.Certification.allOfThem,
        value: undefined,
      },
      {
        label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.AWAIT_AUDIT],
        value: CERTIFYPROJECTSTATUS.AWAIT_AUDIT,
      },
      // {
      //   label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.AWAIT_AUDIT],
      //   value: '0',
      // },
      {
        label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.IN_AUDIT],
        value: CERTIFYPROJECTSTATUS.IN_AUDIT,
      },
      // {
      //   label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.FAIL],
      //   value: CERTIFYPROJECTSTATUS.FAIL,
      // },
      // {
      //   label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.RETRACT],
      //   value: CERTIFYPROJECTSTATUS.RETRACT,
      // },
      // {
      //   label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.FAILURE],
      //   value: CERTIFYPROJECTSTATUS.FAILURE,
      // },
      // {
      //   label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.WAIT_ON_SITE_AUDIT],
      //   value: CERTIFYPROJECTSTATUS.WAIT_ON_SITE_AUDIT,
      // },
      // {
      //   label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.INITIAL_AUDIT_FAIL],
      //   value: CERTIFYPROJECTSTATUS.INITIAL_AUDIT_FAIL,
      // },
      // {
      //   label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.ON_SITE_AUDIT_FAIL],
      //   value: CERTIFYPROJECTSTATUS.ON_SITE_AUDIT_FAIL,
      // },

      {
        label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.WAIT_CONFIRM],
        value: '2',
      },
      {
        label:
          CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.WAIT_CERTIFICATE],
        value: '3',
      },
      {
        label: I18N.greenMeeting.ended,
        value: '4',
      },
      // {
      //   label: CERTIFYPROJECTSTATUS_LABEL[CERTIFYPROJECTSTATUS.CONFIRM_FILE_WAIT_MODIFY],
      //   value: CERTIFYPROJECTSTATUS.CONFIRM_FILE_WAIT_MODIFY,
      // },
    ],
    [locale],
  );
  const { data, loading, run } = useRequest(
    async () =>
      apiGETCarbonAuthList({
        authType: isUndefined(authType) ? undefined : authType?.toString(),
        authStatus: isUndefined(status) ? undefined : status,
        pageNum: tableParams.pagination?.current || 1,
        pageSize: tableParams.pagination?.pageSize || 10,
        searchContent,
      }),
    {
      refreshDeps: [
        authType,
        status,
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        searchContent,
      ],
    },
  );

  useEffect(() => {
    document
      .getElementsByClassName('layout__main')?.[0]
      ?.setAttribute('style', 'padding: 0; overflow: hidden;');
    return () => {
      document
        .getElementsByClassName('layout__main')?.[0]
        ?.setAttribute('style', 'overflow: hidden;');
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setTableParams(pre => ({
        ...pre,
        pagination: {
          ...pre.pagination,
          total: data?.data.data?.total,
        },
      }));
    }, 32);
  }, [data]);

  const handleTableChange: TableProps['onChange'] = pagination => {
    setTableParams({
      pagination,
    });
  };

  const history = useHistory();

  const onPageTo = (
    pageType: string,
    id?: number,
    applyNo?: string,
    authType?: number,
  ) => {
    history.push(
      `${RouteMaps.CarbonFootprintCertificationProjectApplay}?pageType=${pageType}&id=${id}&applyNo=${applyNo}&authType=${authType}`,
    );
  };

  // 删除
  const onDelete = async (id: number, name: string) => {
    Modal.confirm({
      title: I18N.carbonFootPrintLCA.confirmDeletion,
      icon: null,
      content: (
        <div className={styles.modalContent}>
          {I18N.Certification.areYouSure3}
          <span className={styles.warn}>{name}</span>
          {I18N.Certification.certificationReviewApplication}
        </div>
      ),
      okButtonProps: {
        style: { background: '#004541', color: '#fff' },
      },
      closable: true,
      onOk: async () => {
        await apiDeletevCarbonAuth({
          id,
        });
        run();
        Toast('success', I18N.components.success);
      },
    });
  };

  const submitComment = useRef<string>();

  // 提交
  const onSubmit = async (id: number, name: string, authFile: any[]) => {
    if (
      (authFile || []).some(fileItem => {
        const { required } = getAuthFileConfig(fileItem);
        return required && (fileItem.file || []).length === 0;
      })
    ) {
      Toast('error', I18N.subModules.pleaseUploadAll);
      return;
    }
    submitComment.current = '';
    Modal.confirm({
      title: I18N.enterpriseCarbonAccount2.confirmSubmission,
      width: 516,
      icon: null,
      closable: true,
      content: (
        <div className={styles.modalContent}>
          {/* {I18N.Certification.areYouSure2} */}
          {I18N.subModules.youConfirmSubmission}
          <span className={styles.info}>{name}</span>
          {I18N.subModules.theApplication}
          <div className={styles.itemTitle}>{I18N.carbonFootprint.remarks}</div>
          <Input.TextArea
            onChange={e => {
              submitComment.current = e.target.value;
            }}
            rows={4}
            placeholder={I18N.eca.pleaseEnterANote}
            maxLength={200}
            style={{ marginTop: 8, marginBottom: 30 }}
          />
          {/* {I18N.Certification.pleaseReviewTheApplication} */}
        </div>
      ),
      okButtonProps: {
        style: { background: '#004541', color: '#fff' },
      },
      onOk: async () => {
        await postSubmitAuthByTable({
          id,
          comment: submitComment.current,
        });
        run();
        Toast('success', I18N.components.success);
      },
    });
  };

  const cancelComment = useRef<string>();

  // 撤回
  const onRetract = async (id: number, name: string) => {
    if (isUndefined(id)) return;
    cancelComment.current = '';
    Modal.confirm({
      title: I18N.Certification.confirmRevocation,
      width: 516,
      content: (
        <div className={styles.modalContent}>
          {/* {I18N.Certification.areYouSure2} */}
          {I18N.Certification.youConfirmRevocation}
          <span className={styles.info}>{name}</span>
          {I18N.subModules.theApplication}
          <div className={styles.itemTitle}>{I18N.carbonFootprint.remarks}</div>
          <Input.TextArea
            onChange={e => {
              cancelComment.current = e.target.value;
            }}
            rows={4}
            placeholder={I18N.eca.pleaseEnterANote}
            maxLength={200}
            style={{ marginTop: 8, marginBottom: 30 }}
          />
          {/* {I18N.Certification.pleaseReviewTheApplication} */}
        </div>
      ),
      icon: null,
      okButtonProps: {
        style: { background: '#004541', color: '#fff' },
      },
      closable: true,
      onOk: async () => {
        await apiCancelCarbonAuth({ id, comment: cancelComment.current });
        run();
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
    setDownlaodModelTitle(I18N.carbonNeutral.downloadCertificate);
    setVis(true);
  };

  // 下载
  const onDownloadComfirmFile = async (
    id: number,
    status: CERTIFYPROJECTSTATUS,
  ) => {
    const { data } = await apiGETCarbonAuthFiles({
      type: status === CERTIFYPROJECTSTATUS.WAIT_CONFIRM ? 8 : 9,
      sourceId: id,
    });

    setFileList(
      data?.data?.map(d => ({
        name: d?.name,
        url: d?.url,
        id: d?.id,
      })) || [],
    );
    setDownlaodModelTitle(I18N.Certification.downloadConfirmationDocument);
    setVis(true);
  };

  const onClick: MenuProps['onClick'] = ({ key }) => {
    history.push(
      `${RouteMaps.CarbonFootprintCertificationProjectApplay}?authType=${key}&pageType=${PAGETAYPE.ADD}`,
    );
  };

  const items: MenuProps['items'] = [
    {
      label: I18N.Certification.carbonFootprintVerification4,
      key: '0',
    },
    {
      label: I18N.Certification.corporateCarbonAccounting,
      key: '2',
    },
    {
      label: I18N.Certification.productCarbonLabeling,
      key: `${CERTIFYPROJECTTYPE.CARBON_LABEL}`,
    },
  ];

  return (
    <Page title={I18N.router.verificationAndCertificationServices}>
      <div className={styles.banner}>
        <div className={styles.bannerTitle}>
          {I18N.Certification.carbonCloudCollaboratesWithTheWhole}
        </div>
        <div className={styles.bannerRight}>
          <a href='tel:+4008014067' className={styles.rightItem}>
            <div>
              <img src={phoneSvg} alt='' />
            </div>
            <div>400-80-14067</div>
          </a>
          <a href='mailto:mail@carbonstop.com' className={styles.rightItem}>
            <div>
              <img src={emailSvg} alt='' />
            </div>
            <div>mail@carbonstop.com</div>
          </a>
          <CustomerServicePopover placement='bottomRight'>
            <div className={styles.rightItem}>
              <div>
                <img src={earSvg} alt='' />
              </div>
              <div>{I18N.carbonFootprint3.contactCustomerService}</div>
            </div>
          </CustomerServicePopover>
        </div>
      </div>
      {/* <div className={styles.infoCards}>
        {infoCardList.map(item => (
          <div className={styles.infoCard}>
            <div className={styles.icon}>
              <img src={item.icon} alt='' />
            </div>
            <div className={styles.cardTitle}>{item.title}</div>
            <div className={styles.cardDes}>{item.desc}</div>
          </div>
        ))}
      </div> */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableTitle}>
          <div>{I18N.Certification.certificationList}</div>
        </div>
        <div className={styles.form}>
          <ButtonRadio
            value={status}
            onChange={staus => {
              setTableParams({
                pagination: {
                  current: 1,
                  pageSize: 10,
                },
              });
              setStatus(staus);
              // setAuthType(type);
            }}
            options={statusList}
          />
          <div className={styles.formRight}>
            <Select
              style={{ width: 140, borderRadius: 4 }}
              allowClear
              suffixIcon={
                <img
                  className={styles.controlIcon}
                  src={chevronDownSvg}
                  alt=''
                />
              }
              value={authType}
              onChange={type => {
                setTableParams({
                  pagination: {
                    current: 1,
                    pageSize: 10,
                  },
                });
                setAuthType(type);
              }}
              options={authTypeList}
              placeholder={I18N.Certification.allTypes}
            />
            <Search
              placeholder={I18N.Certification.projectNameI}
              style={{ width: 160, borderRadius: 4 }}
              enterButton={
                <img className={styles.controlIcon} src={searchSvg} alt='' />
              }
              onBlur={e => {
                if (e.target.value === searchContent) {
                  return;
                }
                setTableParams({
                  pagination: {
                    current: 1,
                    pageSize: 10,
                  },
                });
                setSearchContent(e.target.value);
              }}
              onSearch={e => {
                if (e === searchContent) {
                  return;
                }
                setTableParams({
                  pagination: {
                    current: 1,
                    pageSize: 10,
                  },
                });
                setSearchContent(e);
              }}
            />
            <Permission flag='CertificationCarbonFootprintProject:Apply'>
              <Dropdown menu={{ items, onClick }}>
                <div>
                  <Button
                    type='primary'
                    icon={
                      <img className={styles.buttonIcon} src={plusSvg} alt='' />
                    }
                    // onClick={() =>
                    //   history.push(
                    //     RouteMaps.CarbonFootprintCertificationProjectApplay,
                    //   )
                    // }
                  >
                    {I18N.Certification.initiateCertificationApplication}
                  </Button>
                </div>
              </Dropdown>
            </Permission>
          </div>
        </div>
        <Table
          columns={columns({
            onDelete,
            onDownload,
            onPageTo,
            onRetract,
            onSubmit,
            onDownloadComfirmFile,
            refresh: run,
          })}
          rowKey={record => record.id}
          dataSource={data?.data.data?.rows}
          pagination={tableParams.pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{
            x: '100%',
            // y: 'calc(100vh - 550px)',
          }}
        />
        <DownLoadModal
          title={downlaodModelTitle}
          visible={vis}
          onCancel={() => {
            setVis(false);
          }}
          fileList={fileList}
        />
      </div>
    </Page>
  );
};

export default HomePage;
