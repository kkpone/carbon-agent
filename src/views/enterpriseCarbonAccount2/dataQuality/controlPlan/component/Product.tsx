/**
 * @file 控制计划新增，拷贝
 * @author lixingchen
 * */
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../../../style.less';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { FormActions } from '@src/components/FormActions';
import { useIndexColumn } from '@src/views/emission/utils';
import { Button, Dropdown, Form, FormProps, Menu, Modal } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import {
  apiDeleteProduct,
  apiProduct,
  PropsType,
} from '@src/views/enterpriseCarbonAccount2/service';
import { Toast } from '@src/utils/Toast';
// import { Dicts } from '@src/views/emission/Show/type';
// import { listALLByDictTypeBatchUsingGET1CDictEnumControllerApi } from '@src/sdks/java/management';

enum PAGETYPE {
  EDIT = 0,
  SHOW = 1,
  ADD = 2,
}

const PAGETYPE_TEXT = {
  [PAGETYPE.ADD]: I18N.carbonFootprint.newAddition,
  [PAGETYPE.EDIT]: I18N.carbonFootprint.edit,
  [PAGETYPE.SHOW]: I18N.carbonFootprint3.details,
};

export const Product = (props: PropsType) => {
  const history = useHistory();
  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
  });
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [tableData, setTableData] = useState<any>();
  const [titAdd, setTitAdd] = useState<any>();
  const [mainProductId, setMainProductId] = useState();
  const [isDetail, setIsDetail] = useState(false);
  // const [serviceUnit, setServiceUnit] = useState<Dicts[]>([]);

  const [form] = Form.useForm();
  // let pageType = '';
  /** 基础信息表单 */
  // const id = new URLSearchParams(location.search).get('id');
  useEffect(() => {
    const path = history.location.pathname;
    setIsDetail(path.includes('Detail'));
    setTableData('');
    setTimeout(() => {
      setTableData(props?.data?.controlPlanProductList);
    }, 200);
    // listALLByDictTypeBatchUsingGET1CDictEnumControllerApi(
    //   'organizationIndustry',
    // ).then((res: any) => {
    //   setServiceUnit(res.data.data.organizationIndustry);
    // });
    // };
  }, [props]);
  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);

  const tableColumns: any = [
    {
      title: I18N.enterpriseCarbonAccount2.mainProductService3,
      dataIndex: 'serviceName',
      ellipsis: true,
      width: 160,
      render: (text: number) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.enterpriseCarbonAccount2.mainProductService2,
      dataIndex: 'serviceUnit',
      ellipsis: true,
      width: 160,
      render: (text: string) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.enterpriseCarbonAccount2.mainProductService,
      dataIndex: 'serviceDesc',
      ellipsis: true,
      width: 670,
      render: (text: number) => <div>{text || '--'}</div>,
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'opreation',
      fixed: 'right',
      width: 150,
      render: (text, record) => {
        const menu = (
          <Menu className='drop-box'>
            {/* <Permission flag='meeting:activity:edit'> */}
            <Menu.Item key='1'>
              {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
              <p
                onClick={() => {
                  setVisible(true);
                  form.setFieldsValue({
                    ...record,
                    serviceUnit: record.serviceUnitValue.split(','),
                  });
                  setTitAdd(PAGETYPE.SHOW);
                }}
              >
                {I18N.carbonFootprint3.details}
              </p>
            </Menu.Item>
            {/* </Permission> */}
            {/* <Permission flag='meeting:activity:edit'> */}
            <Menu.Item key='2'>
              {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
              <p
                onClick={() => {
                  setMainProductId(record.mainProductId);
                  setDeleteVisible(true);
                }}
              >
                {I18N.carbonFootprint.delete}
              </p>
            </Menu.Item>
            {/* </Permission> */}
          </Menu>
        );
        return (
          <>
            {/* <Permission flag='meeting:activity:edit'> */}
            {isDetail ? (
              <Button
                type='link'
                style={{ paddingLeft: 0 }}
                onClick={() => {
                  setVisible(true);
                  form.setFieldsValue({
                    ...record,
                    serviceUnit: record.serviceUnitValue.split(','),
                  });
                  setTitAdd(PAGETYPE.SHOW);
                }}
              >
                {I18N.carbonFootprint3.details}
              </Button>
            ) : (
              <>
                <Button
                  type='link'
                  style={{ paddingLeft: 0 }}
                  onClick={() => {
                    setTitAdd(PAGETYPE.EDIT);
                    setMainProductId(record.mainProductId);
                    setVisible(true);

                    form.setFieldsValue({
                      ...record,
                      serviceUnit: record.serviceUnitValue.split(','),
                    });
                  }}
                >
                  {I18N.carbonFootprint.edit}
                </Button>
                {/* </Permission> */}
                {/* <Permission flag='meeting:activity:delete'> */}
                <Dropdown
                  overlay={menu}
                  overlayClassName='carbon-account-dropdown'
                >
                  {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a
                    className='ant-dropdown-link'
                    onClick={e => e.preventDefault()}
                  >
                    {I18N.Certification.more}
                    <CaretDownOutlined />
                  </a>
                </Dropdown>
              </>
            )}
            {/* </Permission> */}
          </>
        );
      },
    },
  ];
  const returnFetchApi = back => ({
    data: back.data.rows,
    count: back.data.total,
  });

  const isShow = titAdd === PAGETYPE.SHOW;

  const renderModal = () => {
    const basicsFormProps: FormProps = {
      ...formPropsInit(),
      form,
      layout: 'vertical',
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };
    const formItems: any = [
      {
        label: I18N.enterpriseCarbonAccount2.mainProductService3,
        name: 'serviceName',
        type: 'input',
        rules: !isShow,
        placeholder: isDetail ? '\n' : I18N.carbonFootprint.pleaseEnter,
        col: 24,
        props: {
          disabled: isShow,
        },
      },
      {
        label: I18N.enterpriseCarbonAccount2.mainProductService2,
        name: 'serviceUnit',
        placeholder: isDetail ? '\n' : I18N.carbonFootprint.pleaseSelect,
        type: 'cascader',
        rules: !isShow,
        col: 24,
        props: {
          options: props.unitMList,
          displayRender(label) {
            return label[label.length - 1];
          },
          fieldNames: {
            label: 'dictLabel',
            value: 'dictValue',
            children: 'enumList',
          },
          disabled: isShow,
        },
      },
      {
        label: I18N.enterpriseCarbonAccount2.mainProductService,
        name: 'serviceDesc',
        placeholder: isDetail ? '\n' : I18N.carbonFootprint.pleaseEnter,
        type: 'textArea',
        rules: false,
        col: 24,
        props: {
          rows: 5,
          maxLength: 500,
          showCount: true,
          disabled: isShow,
        },
      },
    ];

    return (
      <Modal
        open={visible}
        className='product-modal'
        title={
          isShow
            ? I18N.enterpriseCarbonAccount2.mainProductService5
            : I18N.template(I18N.enterpriseCarbonAccount2.paget2, {
                val1: PAGETYPE_TEXT[titAdd],
              })
        }
        onCancel={() => setVisible(false)}
        footer={[
          <Button
            type='default'
            style={{ width: '70px' }}
            onClick={() => {
              setVisible(false);
              props.getData();
            }}
          >
            {I18N.carbonFootprint.cancel}
          </Button>,
          !isShow ? (
            <Button
              style={{ width: '70px' }}
              type='primary'
              onClick={() => {
                form.validateFields().then(values => {
                  const method = titAdd === PAGETYPE.ADD ? 'POST' : 'PUT';
                  const data = {
                    ...values,
                    controlPlanId: props.data.controlPlanId,
                    serviceUnit: values.serviceUnit?.join(','),
                  };
                  titAdd === PAGETYPE.EDIT
                    ? (data.mainProductId = mainProductId)
                    : '';
                  apiProduct(data, method).then((res: any) => {
                    if (res.data.code === 200) {
                      Toast(
                        'success',
                        I18N.template(I18N.enterpriseCarbonAccount2.paget, {
                          val1: PAGETYPE_TEXT[titAdd],
                        }),
                      );
                      setVisible(false);
                      form.resetFields();
                      props.refreshData();
                    }
                  });
                });
              }}
            >
              {I18N.carbonFootprint.preserve}
            </Button>
          ) : (
            ''
          ),
        ]}
      >
        <FormItemUtil
          paddRight={1}
          antdFormProps={basicsFormProps}
          formItems={formItems}
        />
      </Modal>
    );
  };

  // 删除弹窗
  const renderDeleteModal = () => (
    <Modal
      open={deleteVisible}
      okButtonProps={{ type: 'default' }}
      title={I18N.carbonFootprint.delete}
      className='delete-modal'
      onCancel={() => {
        setDeleteVisible(false);
      }}
      onOk={() => {
        apiDeleteProduct(mainProductId).then((res: any) => {
          if (res.data.code === 200) {
            Toast('success', I18N.carbonFootprint.deleteSuccessful);
            props.refreshData();
            setDeleteVisible(false);
          }
        });
      }}
    >
      <span className='text'>
        {I18N.enterpriseCarbonAccount2.confirmDeletionOfThis4}
      </span>
    </Modal>
  );

  return (
    <div className='product padd-t-16'>
      <div className='add-box'>
        {/* <p>功能描述：此处为一段描述</p> */}
        <p>&nbsp;</p>
        {props.pageType === 'detail' ? (
          ''
        ) : (
          <Button
            type='primary'
            onClick={() => {
              setVisible(true);
              setTitAdd(PAGETYPE.ADD);
            }}
          >
            {I18N.carbonFootprint.newAddition}
          </Button>
        )}
      </div>
      {tableData ? (
        <CommonTable
          columns={[...indexColumn, ...tableColumns]}
          scroll={{ y: 'calc(100vh - 350px)' }}
          // @ts-ignore
          fetchApi={params => {
            setPage({ current: params.page, pageSize: params.size });
            return new Promise(resolve => {
              resolve({
                data: {
                  // @ts-ignore
                  rows: [...tableData],
                  // @ts-ignore
                  total: tableData.length,
                },
              });
            });
          }}
          returnFetchApi={returnFetchApi}
          pagePosition={false}
        />
      ) : (
        <div>&nbsp;</div>
      )}

      <FormActions
        place='center'
        buttons={[
          {
            type: 'default',
            title: I18N.carbonFootprint.cancel,
            onClick: async () => {
              history.goBack();
            },
          },
        ]}
      />
      {renderModal()}
      {renderDeleteModal()}
    </div>
  );
};
