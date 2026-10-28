/**
 * @file 认证详情
 */
import I18N from '@src/lang/I18N';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Spin,
  Tooltip,
  Upload,
} from 'antd';
import IconFont from '@src/components/iconfont';
import VerifyUtils from '@src/utils/verifty';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import {
  addmaterials,
  carbon_emission_info_docx,
  carbon_emission_info_excel,
  carbon_footprint_reduction,
  operatingRecordaddOperating,
} from '@src/api/authentication/verification';
import { useSelector } from 'react-redux';
import { RootState } from '@src/store';
import { ProductStatus } from '../Product/indesjson';
import CerSearchTable from '../searchTable';
import style from './index.module.scss';
import {
  enterprise_materials,
  enterprise_materials_sub,
  filterIcon,
  getbasic,
  Operation_record,
  product_materials_sub,
  ProjectDetailsList,
  projectSearchTable,
  projectTableColumns,
  projectTableUpload,
} from './indexjson';
// import { carbon_emission_info_docx } from '@src/api/authentication/verification';
// import { ProductStatus } from '../Product/indesjson';
const ProjectDetailsIndex = () => {
  const history = useHistory();
  const [tableForm] = Form.useForm();
  const [spining, setspining] = useState(false);
  const [selectFile, setselectFile] = useState<any>({});
  const [submitFile, setsubmitFile] = useState<any[]>([]);
  const [essential_information, setessential_information] = useState<any>({});
  const [tableSource, settableSource] = useState([]);
  const [total, settotal] = useState(0);
  const [defaultFileList, setdefaultFileList] = useState<any[]>([]);
  const [defalg] = useState(
    history.location.pathname.split('detail').length > 1,
  );
  const materialsList = useMemo(
    () =>
      ProjectDetailsList.filter(
        (item: { url: string }) => item.url === history.location.pathname,
      )[0],
    [],
  );
  const [Showmodal, setshowmodal] = useState(false);
  const [checkType, setCheckType] = useState<any[]>([]);
  const [count, setcount] = useState(0);
  const [loading] = useState(false);
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );
  const token = selector?.access_token;
  const [page, setpage] = useState({
    pageNum: 1,
    pageSize: 10,
  });
  const [pagetion, setpagetion] = useState({
    pageNum: 1,
    pageSize: 10,
  });
  const [datasource, setdatasource] = useState([]);
  const handlePage = e => {
    if (e.page === pagetion.pageNum) {
      setpagetion({
        pageSize: e.size,
        pageNum: 1,
      });
    } else {
      setpagetion({
        pageSize: e.size,
        pageNum: e.page,
      });
    }
  };
  const handleChange = useCallback(
    // eslint-disable-next-line consistent-return
    ({ file }: UploadChangeParam<UploadFile<any>>) => {
      // debugger;
      if (file.response && file.response.code === 200) {
        setdefaultFileList(defaultFileList => [
          ...defaultFileList,
          {
            uid: file.uid,
            name: file.name,
            status: 'done',
            response: file.response.msg,
            url: file.response.data,
          },
        ]);
        setspining(false);
        // setImgUrl(file.response.data);
        // form.setFieldsValue({ technologyPic: file.response.data });
      } else {
        return setspining(false);
      }
    },
    [],
  );
  const getUpload = obj => {
    const subObj = { is_baseline: 'False', ...obj };
    if (materialsList.type === 0) {
      delete subObj.is_baseline;
    }
    getbasic(materialsList.type)
      .uploadUrl(subObj)
      .then((res: any) => {
        settableSource(res.data.results);
        setcount(res.data.count);
      });
  };
  const getproducturl = obj => {
    getbasic(materialsList.type)
      .producturl({
        projectId: history.location.search.split('?')[1],
        ...obj,
        // type: materialsList.type,
      })
      .then((res: any) => {
        setdatasource(res.data.data.rows);
        settotal(res.data.data.total);
      });
  };
  useEffect(() => {
    getproducturl({ ...pagetion });
  }, [pagetion]);
  useEffect(() => {
    getUpload({
      page: page.pageNum,
      page_size: page.pageSize,
      ...tableForm.getFieldsValue(),
    });
  }, [page]);
  useEffect(() => {
    getbasic(materialsList.type)
      .msgurl({ id: history.location.search.split('?')[1] })
      .then((res: any) => {
        setessential_information(res.data.data);
      });
    getbasic(materialsList.type)
      .emission({ projectId: history.location.search.split('?')[1] })
      .then((res: any) => {
        setsubmitFile(
          product_materials_sub(
            res.data.data,
            materialsList.type,
            history.location.search.split('?')[1],
          ).aleradyList,
        );
        setdefaultFileList(defaultFileList =>
          defaultFileList.concat(
            product_materials_sub(
              res.data.data,
              materialsList.type,
              history.location.search.split('?')[1],
            ).localList,
          ),
        );
      });
  }, []);

  const props: any = useMemo(
    () => ({
      action: `${process.env.REACT_APP_API_URL}/file/file/uploadAuth`,
      // action: `http://172.31.32.250:9300/file/uploadAuth`,
      headers: { token },
      onPreview: e => {
        const w: any = window.open('about:blank');
        w.location.href = `http://${e.response.data}`;
      },
      onRemove: e => {
        const list = [...defaultFileList];
        list.forEach((item: { url: string }, index: number) => {
          if (item.url === e.response.data) {
            list.splice(index, 1);
          }
        });
        setdefaultFileList(list);
      },
      beforeUpload: (e: any) => {
        setspining(true);
        if (defaultFileList.length === 10) {
          VerifyUtils.Toast('info', I18N.Certification.upToUpload);
          setspining(false);
          return false || Upload.LIST_IGNORE;
        }
        const reg =
          /\.(png|jpeg|jpg|PNG|JPEG|JPG|xls|XLS|doc|DOCX|docx|ppt|PPT|PDF|pdf|xlsx|XLSX)$/;
        const maxSize = 10 * 1024 * 1024;
        if (e.size > maxSize || !reg.test(e.name)) {
          VerifyUtils.Toast('info', I18N.Certification.uploadingOnlySupports);
          setspining(false);
          return false || Upload.LIST_IGNORE;
        }
        return true || Upload.LIST_IGNORE;
      },
      // maxCount: 10,
      onChange: handleChange,

      showUploadList: false,
    }),
    [defaultFileList],
  );
  const choiceReport = () => {
    if (checkType.length === 0) {
      VerifyUtils.Toast('info', I18N.Certification.pleaseSelectTheReportFirst);
    } else {
      const list: any[] = [];
      checkType.forEach(item => {
        list.push({
          ...selectFile,
          baseline: item,
        });
      });
      // list.forEach((item, index) => {
      carbon_footprint_reduction({
        reportID: list[0].id,
        button_status: list[0].baseline,
      }).then((res: any) => {
        const newlist: any = {
          ...list[0],
          filePath: res.data.data.word_url,
          fileName: list[0].baseline,
          icontype:
            list[0].baseline === I18N.Certification.carbonReduction
              ? 'icon-icon-tanjianbaibaogao'
              : 'icon-icon-tanjujibaogao',
        };
        if (list.length > 1) {
          carbon_footprint_reduction({
            reportID: list[1].id,
            button_status: list[1].baseline,
          }).then((re: any) => {
            const newlists: any = {
              ...list[1],
              filePath: re.data.data.word_url,
              fileName: list[1].baseline,
              icontype:
                list[0].baseline === I18N.Certification.carbonReduction
                  ? 'icon-icon-tanjianbaibaogao'
                  : 'icon-icon-tanjujibaogao',
            };
            setsubmitFile([newlist, newlists]);
            setshowmodal(false);
            setspining(false);
          });
        } else {
          const filelist = submitFile;
          filelist.unshift(newlist);
          filelist.length = 2;
          setsubmitFile(filelist);
          setshowmodal(false);
          setspining(false);
        }
      });

      // });
    }
  };
  const UploadReport = () => {
    carbon_footprint_reduction({
      reportID: selectFile.id,
      button_status:
        selectFile.baseline === null
          ? I18N.carbonFootprint3.carbonFootprint
          : I18N.Certification.carbonReduction,
    })
      .then((re: any) => {
        const newlists: any = {
          ...selectFile,
          filePath: re.data.data.word_url,
          fileName:
            selectFile.baseline === null
              ? I18N.carbonFootprint3.carbonFootprint
              : I18N.Certification.carbonReduction,
          icontype:
            selectFile.baseline !== null
              ? 'icon-icon-tanjianbaibaogao'
              : 'icon-icon-tanjujibaogao',
        };
        const list = submitFile;
        //   list = selectFile;
        list.unshift(newlists);
        list.length = 2;
        setsubmitFile(list);
        setshowmodal(false);
        setspining(false);
      })
      .catch(() => {
        setspining(false);
      });
  };
  // eslint-disable-next-line consistent-return
  const confirm = e => {
    // 位于产品碳足迹时进行的操作
    setspining(true);

    setshowmodal(false);
    if (materialsList.type === 1) {
      switch (e) {
        case 'choice':
          return choiceReport();
        default:
          return UploadReport();
      }
    } else {
      carbon_emission_info_docx(selectFile.id)
        .then((res: any) => {
          carbon_emission_info_excel(selectFile.id)
            .then((re: any) => {
              let list = { ...selectFile };
              list = {
                ...list,
                filePath: res.data.data.file_url_path,
                inventoryPath: re.data.data.file_url_path,
                edition: list.edition,
              };

              setsubmitFile(() => [{ ...list }]);

              setspining(false);
            })
            .catch(() => {
              setspining(false);
            });
        })
        .catch(() => {
          setspining(false);
        });
    }
  };
  const chanageStatus = () => {
    const userinfo = selector.userInfo;
    const obj: any = {
      platform: '1',
      projectId: essential_information.projectId,
      companyId: localStorage.getItem('COMPANY_ID'),
      userName: userinfo.username,
      phoneNumber: userinfo.username,
      type: materialsList.type,
      operatingFlag: ProductStatus(materialsList.status).text,
      status: ProductStatus(materialsList.status).value,
      userId: userinfo.userId,
    };
    // if (!obj) {
    operatingRecordaddOperating({ ...obj }).then(() => {
      VerifyUtils.Toast('success', I18N.carbonFootprint.operationSuccessful);
      history.go(-1);
      // setShowModal(false);
      // getlist();
    });
    // }
  };

  // eslint-disable-next-line consistent-return
  const handleSub = () => {
    if (defalg) {
      return history.go(-1);
    }
    if (submitFile.length === 0) {
      return VerifyUtils.Toast(
        'info',
        I18N.Certification.pleaseSelectTheMaterialFirst,
      );
    }
    if (defaultFileList.length === 0) {
      return VerifyUtils.Toast('info', I18N.Certification.pleaseSelectItFirst);
    }

    const list: any = enterprise_materials_sub(
      submitFile,
      defaultFileList,
      history.location.search.split('?')[1],
      materialsList.type,
    );
    // if (!list) {
    addmaterials(list).then(() => {
      chanageStatus();
    });
  };
  return (
    <Spin spinning={spining}>
      <div className={style.productContent}>
        <Form>
          {/* 基本信息部分 */}
          <div className={style.projectcon}>
            <div className={style.projectcon_title}>
              {
                Operation_record(materialsList.type).list.essential_information
                  .title
              }
            </div>
            <div>
              <Form.Item>
                <div className={style.filelisticonup}>
                  {I18N.Certification.materialReport}
                  {defalg ? (
                    submitFile.length === 0 ? (
                      I18N.Certification.thereAreCurrentlyNoFilesAvailable
                    ) : (
                      ''
                    )
                  ) : (
                    <Button
                      disabled={defalg}
                      className={style.upbtn}
                      icon={
                        <IconFont
                          type='icon-icon-shangzhuan-3'
                          style={{ fontSize: '16px' }}
                        />
                      }
                      onClick={() => setshowmodal(true)}
                    >
                      {I18N.carbonFootprint.uploadFiles}
                    </Button>
                  )}
                </div>
              </Form.Item>
              {submitFile.length > 0 ? (
                materialsList.type === 0 ? (
                  <div>
                    <div className={style.essential_information_text}>
                      {enterprise_materials.map(item => (
                        <div className={style.label_essential} key={item.label}>
                          <div className={style.label_essential_text}>
                            {item.label}
                          </div>
                          <div>
                            {item.hml === '' && submitFile[0] ? (
                              <Tooltip title={submitFile[0][item.name]}>
                                <div className={style.ellipsisText}>
                                  {item.name === 'edition'
                                    ? Number(submitFile[0][item.name]) === 1
                                      ? 'ISO'
                                      : 'GHG'
                                    : submitFile[0][item.name]}
                                </div>
                              </Tooltip>
                            ) : (
                              <div
                                onClick={() => {
                                  if (
                                    item.label === I18N.Certification.report
                                  ) {
                                    window.open(
                                      submitFile[0].filePath,
                                      '_blank',
                                    );
                                  } else {
                                    window.open(
                                      submitFile[0].inventoryPath,
                                      '_blank',
                                    );
                                  }
                                }}
                              >
                                {item.hml}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  submitFile.map((atem: any) => (
                    <div key={atem?.fileName}>
                      <div className={style.essentiaal_title}>
                        <IconFont type={atem?.icontype} />
                        {I18N.template(I18N.Certification.atemf, {
                          val1: atem?.fileName,
                        })}
                      </div>
                      <div className={style.essential_information_text}>
                        {Operation_record(
                          materialsList.type,
                        ).list.essential_information.list.map(item => (
                          <div
                            className={style.label_essential}
                            key={item.label}
                          >
                            <div className={style.label_essential_text}>
                              {item.label}：
                            </div>
                            <div>
                              {item.icon === '' ? (
                                <Tooltip title={atem[item.name]}>
                                  <div className={style.ellipsisText}>
                                    {atem[item.name]}
                                  </div>
                                </Tooltip>
                              ) : (
                                <div
                                  className={style.iconSize}
                                  onClick={() => {
                                    window.open(atem.filePath, '_blank');
                                  }}
                                >
                                  <IconFont
                                    type={item.icon}
                                    style={{ fontSize: '16px' }}
                                  />
                                  <span>{item.icontext}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )
              ) : (
                ''
              )}
            </div>
            <div>
              <Form.Item>
                <div className={style.filelisticon}>
                  {I18N.Certification.otherSupportingDocuments}
                  {defalg ? (
                    defaultFileList.length === 0 ? (
                      I18N.Certification.thereAreCurrentlyNoFilesAvailable
                    ) : (
                      ''
                    )
                  ) : (
                    <Upload {...props}>
                      <Button
                        className={style.upbtn}
                        disabled={defalg}
                        icon={
                          <IconFont
                            type='icon-icon-shangzhuan-3'
                            style={{ fontSize: '16px' }}
                          />
                        }
                      >
                        {I18N.carbonFootprint.uploadFiles}
                      </Button>
                    </Upload>
                  )}
                  <div className={style.uploadlist}>
                    {defaultFileList.map((item, index) => (
                      <div className={style.uploadlist_list} key={item.name}>
                        <span
                          onClick={() => {
                            window.open(item.url, '_blank');
                          }}
                        >
                          <IconFont
                            className={style.uploadlist_list_icon}
                            style={{ fontSize: '16px' }}
                            type={filterIcon(item.name.split('.')[1])}
                          />
                          {item.name}
                        </span>
                        <IconFont
                          type='icon-icon-shanshu-2'
                          style={{
                            display: defalg ? 'none' : '',
                            fontSize: '16px',
                          }}
                          className={style.uploadlist_list_del}
                          onClick={() => {
                            const list = [...defaultFileList];
                            list.splice(index, 1);
                            setdefaultFileList(list);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Form.Item>
            </div>
          </div>
          {/* 核查材料部分 */}
          <div className={style.projectcon}>
            <div className={style.projectcon_title}>
              {
                Operation_record(materialsList.type).list.verification_materials
                  .title
              }
            </div>
            <div className={style.projectcon_list}>
              {Operation_record(
                materialsList.type,
              ).list.verification_materials.list.map(item => (
                <div className={style.projectcon_list_label} key={item.name}>
                  <span className={style.label_essential_text}>
                    {item.label}
                  </span>
                  <Tooltip
                    title={
                      item.name === 'createTime'
                        ? VerifyUtils.get_time(essential_information[item.name])
                        : essential_information[item.name] === null
                        ? '--'
                        : essential_information[item.name]
                    }
                  >
                    <span
                      className={`${style.ellipsisText} ${
                        style[item.identification]
                      }`}
                      style={{
                        width:
                          item.label === I18N.Certification.projectId2
                            ? `auto`
                            : `calc(100% - ${item.label.length * 14}px)`,
                      }}
                    >
                      {item.name === 'createTime'
                        ? VerifyUtils.get_time(essential_information[item.name])
                        : essential_information[item.name] === null
                        ? '--'
                        : essential_information[item.name]}
                    </span>
                  </Tooltip>

                  {item.status ? (
                    <span
                      className={`${
                        ProductStatus(essential_information.status)?.style
                      }`}
                      style={{ marginLeft: '30px' }}
                    >
                      {ProductStatus(essential_information.status)?.label}
                    </span>
                  ) : (
                    ''
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* 项目记录部分 */}
          <div className={`${style.projectcon} ${style.paddingBottom}`}>
            <div className={style.projectcon_title}>
              {Operation_record(materialsList.type).list.Project_record.title}
            </div>

            <CerSearchTable
              loading={loading}
              columns={projectTableColumns}
              pageTion={{
                page: pagetion.pageNum,
                size: pagetion.pageSize,
              }}
              total={total}
              dataSource={datasource}
              handlePage={handlePage}
              tableClass=''
            />
          </div>
          <div className={style.postProduct}>
            <Button
              style={{
                display: defalg ? 'none' : 'inline-block',
              }}
              onClick={() => history.go(-1)}
            >
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button type='primary' htmlType='submit' onClick={handleSub}>
              {defalg
                ? I18N.carbonFootprint.return
                : I18N.carbonFootprint.preserve}
            </Button>
          </div>
        </Form>

        {/* 选择已有文件弹窗部分 */}
        <Modal
          title={I18N.carbonFootprint.uploadFiles}
          open={Showmodal}
          width={850}
          style={{ height: '600px' }}
          footer={[
            <Button onClick={() => setshowmodal(false)}>
              {I18N.carbonFootprint.cancel}
            </Button>,
            selectFile.baseline !== null && materialsList.type === 1 ? (
              <Popconfirm
                okType='link'
                icon=''
                title={
                  <div>
                    <div>{I18N.Certification.pleaseSelectAReport}</div>
                    <Checkbox.Group onChange={e => setCheckType(e)}>
                      <Checkbox value={I18N.carbonFootprint3.carbonFootprint}>
                        {I18N.carbonFootprint.carbonFootprintReport}
                      </Checkbox>
                      <Checkbox value={I18N.Certification.carbonReduction}>
                        {I18N.carbonFootprint.carbonReductionReport}
                      </Checkbox>
                    </Checkbox.Group>
                  </div>
                }
                cancelButtonProps={{
                  type: 'text',
                  htmlType: 'button',
                }}
                onConfirm={() => confirm('choice')}
                okText={I18N.carbonFootprint.confirm2}
                cancelText={I18N.carbonFootprint.cancel}
              >
                <Button type='primary'>{I18N.carbonFootprint.confirm2}</Button>
              </Popconfirm>
            ) : (
              <Button
                type='primary'
                htmlType='submit'
                onClick={() => confirm('check')}
              >
                {I18N.carbonFootprint.confirm2}
              </Button>
            ),
          ]}
          onCancel={() => setshowmodal(false)}
          onOk={() => {
            if (materialsList.type === 0) {
              carbon_emission_info_docx(selectFile.id).then((res: any) => {
                carbon_emission_info_excel(selectFile.id).then(
                  (resItem: any) => {
                    const obj = {
                      ...selectFile,
                      docxFilePath: res.data.data.file_url_path,
                      excelFilePath: resItem.data.data.file_url_path,
                    };
                    setsubmitFile(() => [obj]);
                  },
                );
              });
              setshowmodal(false);
            } else {
              carbon_footprint_reduction({
                button_status:
                  selectFile.baseline === null
                    ? I18N.Certification.carbonReduction
                    : I18N.carbonFootprint3.carbonFootprint,
                reportID: selectFile.id,
              });
            }
          }}
        >
          <Form
            form={tableForm}
            className={style.projectTableSearch}
            // eslint-disable-next-line consistent-return
            onFinish={e => {
              const reg = /^[+]{0,1}(\d+)$/;
              if (
                (e.id && !reg.test(e.id)) ||
                (e.product_code && !reg.test(e.product_code))
              ) {
                return VerifyUtils.Toast(
                  'info',
                  I18N.Certification.pleaseInputCorrectly,
                );
              }
              setpage({ pageNum: 1, pageSize: 10 });
              getUpload({ page: 1, page_size: 10, ...e });
            }}
          >
            {projectSearchTable(materialsList.type).map(
              (item: { name: string; label: string }) => (
                <Form.Item name={item.name} label={item.label}>
                  <Input placeholder={item.label} maxLength={50} />
                </Form.Item>
              ),
            )}
            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                className={style.btn_style}
                icon={<IconFont type='icon-icon-xiaosuo' />}
                style={{ marginRight: '10px' }}
              >
                {I18N.carbonNeutral.query}
              </Button>
              <Button
                htmlType='reset'
                className={style.btn_style}
                onClick={() => {
                  tableForm.resetFields();
                  setpage({ pageNum: 1, pageSize: 10 });
                }}
              >
                {I18N.carbonFootprint3.reset}
              </Button>
            </Form.Item>
          </Form>
          <CerSearchTable
            loading={loading}
            total={count}
            columns={projectTableUpload(materialsList.type)}
            scroll={tableSource.length > 0 ? { y: 360 } : {}}
            pageTion={{
              page: page.pageNum,
              size: page.pageSize,
            }}
            dataSource={tableSource}
            handlePage={e => {
              if (e.page === page.pageNum) {
                setpage({
                  pageNum: 1,
                  pageSize: e.size,
                });
              } else {
                setpage({
                  pageNum: e.page,
                  pageSize: e.size,
                });
              }
            }}
            tableClass='padd'
            rowKey='id'
            locale={{
              emptyText: (
                <p>{I18N.Certification.thereIsCurrentlyNoDataAvailable}</p>
              ),
            }}
            rowSelection={{
              type: 'radio',
              onChange: (e, b: any) => {
                b[0] = {
                  ...b[0],
                  icontype:
                    b[0].baseline === null
                      ? 'icon-icon-tanjujibaogao'
                      : 'icon-icon-tanjianbaibaogao',
                };

                setselectFile(b[0]);
              },
              getCheckboxProps: record => ({
                disabled:
                  history.location.pathname ===
                  '/Certification/Enterprise/product/submissions'
                    ? !record.emission_source_data
                    : false, // Column configuration not to be checked
                name: record.emission_source_data,
              }),
            }}
          />
        </Modal>
      </div>
    </Spin>
  );
};
export default ProjectDetailsIndex;
