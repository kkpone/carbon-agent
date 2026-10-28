/* eslint-disable */
/**
 * @file 创建、编辑 报告主体、详情
 * @author qifeng
 */
import I18N from '@src/lang/I18N';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Form, Spin } from 'antd';
import {
  createDepartmentType,
  createIndustryType,
  createOrganization,
  delDepartmentType,
  delIndustryType,
  getOrganizationInfo,
  getOrganizationSelectors,
  putOrganization,
} from '@api/carbon-international';
import {
  OrganizationsCreateResponse,
  OrganizationsSelector,
} from '@api/carbon-international/types';
import { antFormSrcoll2FirstErrorConfig, genFormData } from '@utils/index';
import { Selector } from './Selector';
import { BraftEditorComponent } from '@components/BraftEditor';
import { Toast } from '@utils/Toast';
import { Upload, UploadProps } from '@components/Upload';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import classNames from 'classnames';
import './operationManagement.less';
import style from './operationManagement.module.less';
import { Page } from '@src/components/Page';
import { Input } from '@src/components/Input';
import { FormActions } from '@src/components/FormActions';
import { PlusOutlined } from '@ant-design/icons';

type UploadFileType = string | File;
type FileList = {
  floor_plan_img: UploadFileType;
  leader_organization_chart: UploadFileType;
  execute_organization_chart: UploadFileType;
};

const OperationManagement = () => {
  const title = I18N.Certification.reportSubject;
  const history = useHistory();
  const { id } = useParams() as { id?: number };
  const isReadOnly = history.location.pathname.includes(
    virtualLinkTransform(
      RouteMaps.internationaloperationManagementShow,
      [':id?'],
      [''],
    ),
  );

  const [subloading, set_subloading] = useState(false);
  const [form] = Form.useForm();
  // 编辑状态 获取初始化数据 从接口
  const [formInitialValues, setFormInitialValues] =
    useState<OrganizationsCreateResponse>();
  const [files, setFiles] = useState<FileList>({
    floor_plan_img: '',
    leader_organization_chart: '',
    execute_organization_chart: '',
  });
  const addFiles = (file: UploadFileType, target: keyof FileList) => {
    const isCanUse = file instanceof File && file.size > 1024 * 5 * 1024;
    if (isCanUse) Toast('warn', I18N.carbonInternational.uploadLargeImages);
    form.setFieldsValue({
      ...form.getFieldsValue(),
      [target]: isCanUse ? undefined : file,
    });
    setFiles({ ...files, [target]: file });
  };
  const [items, setItems] = useState<OrganizationsSelector>();

  // 修改，查询数据
  useEffect(() => {
    if (id)
      getOrganizationInfo(id).then(({ data }) => {
        const r = data?.data;
        if (r) {
          setFormInitialValues({
            ...r,
            boundaries: r.boundaries,
            department: r.department,
            industry: r.industry,
          });

          setFiles({
            floor_plan_img: r.floor_plan_img,
            leader_organization_chart: r.leader_organization_chart,
            execute_organization_chart: r.execute_organization_chart,
          });
        }
      });
  }, [id]);

  // 获取所有的选项
  const getSelectors = () =>
    getOrganizationSelectors({}).then(({ data }) => {
      if (data) {
        setItems(data.data?.[0]);
      }
    });
  useEffect(() => {
    getSelectors();
  }, []);
  // 添加选项
  const onAddItem = (item: string, target: keyof OrganizationsSelector) => {
    switch (target) {
      case 'department_list':
        createDepartmentType(item).then(() => {
          getSelectors();
        });
        break;
      case 'industry_list':
        createIndustryType(item).then(() => {
          getSelectors();
        });
        break;
      default:
    }
  };
  const onDelItem = (item: number, target: keyof OrganizationsSelector) => {
    switch (target) {
      case 'department_list':
        delDepartmentType(item).then(() => {
          getSelectors();
          form.setFieldsValue({
            department: '',
          });
        });
        break;
      case 'industry_list':
        delIndustryType(item).then(() => {
          getSelectors();
          form.setFieldsValue({
            industry: '',
          });
        });
        break;
      default:
    }
  };

  type UploadRender = {
    type: keyof FileList;
    hideTips?: boolean;
  };

  const uploadProps: Partial<UploadProps> = {
    accept: '.jpg, .jpeg, .png',
    maxCount: 1,
    showUploadList: false,
    headers: {},
    disabled: isReadOnly,
    className: style.reportSubject,
  };
  const uploadRender = ({ type, hideTips }: UploadRender) => (
    <>
      {!hideTips && (
        <div className={style.tips}>
          图片格式：JPG、JPEG、GIF；图片大小：最大500k
        </div>
      )}
      {/*  @ts-ignore */}
      <Upload
        {...uploadProps}
        value={files[type]}
        onChange={file => {
          addFiles(file as unknown as UploadFileType, type);
        }}
      >
        <div>
          <PlusOutlined />
          <p className='acf_from_upload'>
            <span className='upload_text'>
              {I18N.carbonFootprint.uploadImages}
            </span>
          </p>
        </div>
      </Upload>
    </>
  );

  // form base item
  const Meeting = [
    {
      name: `${title}`,
      id: 'organization_name',
      className: 'w_50',
      render: (
        <Input
          key='organization_name'
          aria-label='organization_name'
          maxLength={30}
          readOnly={isReadOnly}
          placeholder={I18N.template(I18N.carbonInternational.pleaseEnterTi, {
            val1: title,
          })}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.dashborad.industry,
      id: 'industry',
      className: 'w_50',
      render: (
        <Selector
          aria-label='industry'
          defaultValue={formInitialValues?.industry}
          readonly={isReadOnly}
          options={
            items?.industry_list?.map(({ industry_name, user }) => ({
              label: industry_name,
              value: industry_name,
              user,
            })) || []
          }
          onAddItem={async item => onAddItem(item, 'industry_list')}
          onDelItem={async (e, item) => {
            const id = items?.industry_list?.find(
              ({ industry_name }) => industry_name === item,
            )?.id;

            if (id) onDelItem(id, 'industry_list');
          }}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.enterpriseCarbonAccount2.responsibleForCarbonInventoryCheck,
      id: 'department',
      className: 'w_50',
      val: '',
      render: (
        <Selector
          aria-label='department'
          defaultValue={formInitialValues?.department}
          readonly={isReadOnly}
          options={
            items?.department_list?.map(({ department_name, user }) => ({
              label: department_name,
              value: department_name,
              user,
            })) || []
          }
          placeholder={I18N.carbonFootprint.pleaseSelect}
          onAddItem={async item => onAddItem(item, 'department_list')}
          onDelItem={async (e, item) => {
            const id = items?.department_list?.find(
              ({ department_name }) => department_name === item,
            )?.id;
            if (id) onDelItem(id, 'department_list');
          }}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.carbonInternational.clearOrganizationalBoundaries,
      id: 'boundaries',
      val: '',
      className: 'w_50',
      render: (
        <Selector
          aria-label='boundaries'
          readonly={isReadOnly}
          defaultValue={formInitialValues?.boundaries}
          options={
            items?.boundaries_list?.map(({ boundaries_name, user }) => ({
              label: boundaries_name,
              value: boundaries_name,
              user,
            })) || []
          }
          placeholder={I18N.carbonFootprint.pleaseSelect}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.carbonInternational.companyAddress,
      id: 'company_address',
      val: '',
      className: 'w_100',
      render: (
        <Input
          readOnly={isReadOnly}
          aria-label='company_address'
          placeholder={I18N.carbonInternational.pleaseEnterCompany}
        />
      ),
      rule_required: true,
    },
    {
      name: I18N.carbonFootprint.basicInformation,
      id: 'basic_info',
      className: 'w_100',
      render: (
        <div className='Editor'>
          <BraftEditorComponent
            readOnly={isReadOnly}
            placeholder={I18N.carbonInternational.enterHere}
            defaultValue={formInitialValues?.basic_info}
            onChange={val => {
              form.setFieldsValue({
                ...form.getFieldsValue,
                basic_info: val,
              });
            }}
          />
        </div>
      ),
      rule_required: true,
    },
    {
      name: I18N.carbonInternational.organizationalBoundaryDetails,
      id: 'boundaries_detailed',
      value: '',
      className: 'w_100',
      render: (
        <div className='Editor'>
          <BraftEditorComponent
            readOnly={isReadOnly}
            defaultValue={formInitialValues?.boundaries_detailed}
            placeholder={
              I18N.carbonInternational.shouldBeGovernedByIndependentLaw
            }
            onChange={val => {
              form.setFieldsValue({
                ...form.getFieldsValue,
                boundaries_detailed: val,
              });
            }}
          />
        </div>
      ),
      rule_required: true,
    },
    {
      name: I18N.carbonInternational.planDiagram,
      id: 'floor_plan_img',
      className: style.picture,
      render: uploadRender({
        type: 'floor_plan_img',
      }),
      rule_required: false,
    },
    {
      name: I18N.carbonInternational.managementTeamFramework,
      className: style.picture,
      id: 'leader_organization_chart',
      render: uploadRender({
        type: 'leader_organization_chart',
      }),
      rule_required: false,
    },
    {
      name: '',
      id: 'execute_organization_chart',
      className: classNames(style.picture, style.lastUpload),
      render: uploadRender({
        type: 'execute_organization_chart',
        hideTips: true,
      }),
      rule_required: false,
    },
  ];

  if (id && !formInitialValues) return <Spin />;

  return (
    <Page
      wrapperClassName={style.wrapper}
      breadCrumbs={[
        {
          title: I18N.carbonInternational.reportSubjectManagement2,
          key: 'reportSubjectManagement',
          href: RouteMaps.internationalCarbonManagement,
        },
        {
          title: isReadOnly
            ? I18N.carbonFootprint.check
            : id
            ? I18N.carbonInternational.editReportMaster
            : I18N.carbonInternational.newReportMaster,
          key: 'reportSubjectManagement',
        },
      ]}
    >
      <div
        className={classNames('operation-management-wrapper', {
          [style.readonlyClass]: isReadOnly,
        })}
      >
        {/* 表单 */}
        <div className={style.mainFormContent}>
          <Form
            className='addlist_content_From'
            form={form}
            scrollToFirstError={antFormSrcoll2FirstErrorConfig}
            layout='vertical'
            initialValues={formInitialValues}
            onFinish={async (values: any) => {
              const val: any = {};
              // 如果图片没有修改，就不重新返回
              for (const key in values) {
                if (
                  key === 'floor_plan_img' ||
                  key === 'execute_organization_chart' ||
                  key === 'leader_organization_chart'
                ) {
                  if (typeof values[key] !== 'string') {
                    val[key] = values[key];
                  }
                } else {
                  val[key] = values[key];
                }
              }
              const fd = genFormData(val);
              set_subloading(true);
              const dealErr = (data: OrganizationsCreateResponse) => {
                const unknownErr = I18N.carbonInternational.unknownError;
                if (data.code === 201) {
                  Toast(
                    'warn',
                    I18N.template(I18N.carbonInternational.title, {
                      val1: title,
                    }),
                  );
                } else if (data.code === 400) {
                  Toast('warn', data.msg || unknownErr);
                }
              };
              if (!id) {
                createOrganization(fd).then(({ data }) => {
                  if (data.code === 200) {
                    Toast(
                      'success',
                      I18N.carbonInternational.createdSuccessfully,
                    );
                    history.goBack();
                  }
                  dealErr(data);
                });
              } else {
                putOrganization(fd, id).then(({ data }) => {
                  if (data.code === 200) {
                    Toast(
                      'success',
                      I18N.carbonInternational.modifiedSuccessfully,
                    );
                    history.goBack();
                  }
                  dealErr(data);
                });
              }
              set_subloading(false);
            }}
          >
            {Meeting.map(item => {
              return (
                <Form.Item
                  className={classNames('acf_Item', item?.className)}
                  name={item.id}
                  label={item.name}
                  rules={[
                    {
                      required: item.rule_required,
                      message: I18N.template(I18N.carbonInternational.itemn, {
                        val1: item.name,
                      }),
                    },
                  ]}
                >
                  {item.render}
                </Form.Item>
              );
            })}
            <FormActions
              className={style.formActionsWrapper}
              place='center'
              buttons={
                isReadOnly
                  ? [
                      {
                        title: I18N.carbonFootprint.return,
                        onClick: async () => {
                          history.goBack();
                        },
                      },
                    ]
                  : [
                      {
                        title: I18N.carbonFootprint.preserve,
                        htmlType: 'submit',
                        type: 'primary',
                        loading: subloading,
                      },
                      {
                        title: I18N.carbonFootprint.cancel,
                        onClick: async () => history.goBack(),
                      },
                    ]
              }
            ></FormActions>
          </Form>
        </div>
      </div>
    </Page>
  );
};

export default OperationManagement;
