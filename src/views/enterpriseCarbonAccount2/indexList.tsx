/*
 * @@description:企业碳核算外部列表页  & 产品碳足迹下载管理 企业碳核算-碳排放管理-排放源库列表   企业碳核算-碳排放管理-核算模型列表
 * @Author: lxc qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-10 17:07:57
 */

import {
  QuestionCircleOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import Permission from '@src/components/Permission';
import SearchFormUtil from '@src/components/SearchForm';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { addLogUsingPOSTSysOperationLogControllerApi } from '@src/sdks/java/management';
import { Toast } from '@src/utils/Toast';
import { useIndexColumn } from '@src/views/emission/utils';
import { Button, DatePicker, Form, FormProps, Modal, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { cloneDeep, noop } from 'lodash-es';
import moment from 'moment';
import React, { FC, Key, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getTableColumns } from './listInfo/columns';
import { getFormList } from './listInfo/formInfo';
import {
  apiEnterprisePlanList,
  apiDeletePlane,
  apiEnterpriseComputationList,
  apiComputationDeleted,
  apiToModel,
  apiReportList,
  apiCalculateDelete,
  apiAccountModelList,
  apiModelDelete,
  apiAccuntModeEdit,
  apiAccuntModeAdd,
  apiAccountModeCopy,
  apiModelSourceLists,
  apiStandardList,
  apiEmissionList,
  apiEmissionDelete,
  apiModelSourceDeleted,
  apiInventoryReportGhg,
  apiInventoryReportIso,
  apiInventoryReportWordGhg,
  apiInventoryReportSimpleGhg,
  apiInventoryReportSimpleIso,
  apiInventoryReportWordIso,
  apiModelSourceCategoryList,
} from './service';
import './style.less';
import styles from './indexList.module.less';
import { GWPinfo } from './listInfo/util';
import { SourceCategoryListType } from './utils/type';
import { RouteMapsCorbonFootprint3 } from '../../router/route-paths/corbonFootprint3';
import { apiReportFileList } from '../dashborad/downloadManage/service';
import {
  apiListALLByDictTypeData,
  apiMnumListALLByDictTypeBatch,
} from '../emission/Show/service';

import { DataNode } from 'antd/lib/tree';
import classNames from 'classnames';

import ClassifyTree from './carbonDischarge/components/ClassifyTree';

export const TableContact: any = React.createContext({});
const EnterpriseCarbonAccountingList: FC = () => {
  // 当前标题
  const [currentName, setCurrentName] = useState('');
  const [unitM, setUnitM] = useState<any[]>([]);
  const selectKeyRef = useRef<Key[]>([0]);

  const [saveModelisible, setSaveModelisible] = useState(false);
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [downInfo, setdownInfo] = useState({
    title: '',
    path: '',
  });
  sessionStorage.removeItem('emssionInfo');
  sessionStorage.removeItem('factorId');
  sessionStorage.removeItem('categoryId');
  sessionStorage.removeItem('accountTab');
  sessionStorage.removeItem('accountStepkey');
  sessionStorage.removeItem('modelId');
  sessionStorage.removeItem('computationId');
  // 搜索栏
  const [formLists, setFormLists] = useState<any>();
  const [picker, setPicker] = useState<any>('year');
  const [pageType, setPageType] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | number>('');
  const [modelType, setModelType] = useState<string>('');
  const [tableListLen, setTableListLen] = useState<number>(0);
  const [dowloadModel, setDowloadModel] = useState<boolean>(false);
  const [cascaderOptions, getCascaderOptions] = useState<any[]>([]);

  const [expandKey, setExpandKey] = useState<Key[]>([]);

  const [dicTree, setDicTree] = useState<(DataNode & SourceCategoryListType)[]>(
    [],
  );
  const [categortTotal, setCategortTotal] = useState<number>(0);

  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  const [generateReportVisible, setGenerateReportVisible] =
    useState<boolean>(false);
  const [searchSupplyForm] = Form.useForm();
  const searchFormProps: FormProps = {
    layout: 'inline',
    form: searchSupplyForm,
  };
  const history = useHistory();
  const path = history.location.pathname;

  const childRef = useRef<TableRef>();
  const [searchParamsData, setSearchParamsData] = useState<any>();
  const [page, setPage] = useState({
    current: 1,
    pageSize: 10,
  });
  const [btn, setBtn] = useState<any>([]);
  const searchSupplySub = () => {
    const res = searchSupplyForm.getFieldsValue();

    if (path === RouteMaps.enterpriseCarbonAccountingcarbonDischarge) {
      if (
        typeof res.rageType === 'undefined' ||
        res.rageType === 0 ||
        res.rageType === 1 ||
        res.rageType === 2 ||
        res.rageType === 3
      ) {
        let format = 'YYYY';
        if (res.rageType === 1) {
          format = 'YYYY-Q';
        }
        if (res.rageType === 2) {
          format = 'YYYY-MM';
        }
        if (res.dateRange) {
          const date = moment(res?.dateRange).format(format);

          if (res.rageType === 0) {
            res.cYear = date;
          }
          if (res.rageType === 1) {
            // eslint-disable-next-line prefer-destructuring
            res.cYear = date.split('-')[0];
            // eslint-disable-next-line prefer-destructuring
            res.cQuarter = date.split('-')[1];
          }
          if (res.rageType === 2) {
            // eslint-disable-next-line prefer-destructuring
            res.cYear = date.split('-')[0];
            // eslint-disable-next-line prefer-destructuring
            res.cMonth =
              date.split('-')[1].indexOf('0') === 0
                ? date.split('-')[1].replace('0', '')
                : date.split('-')[1];
          }
        }

        if (res.rageType === 3) {
          res.begTime = moment(res?.dateRanges[0]).format('YYYY-MM-DD');
          res.endTime = moment(res?.dateRanges[1]).format('YYYY-MM-DD');
        }
      } else {
        delete res.dateRange;
      }

      delete res.dateRange;
      delete res.rageType;
      delete res.dateRanges;

      setSearchParamsData(res);
      return;
    }
    if (
      history.location.pathname ===
      RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicList
    ) {
      selectKeyRef.current = [0];
      const { name, facility, activityUnit } = res;
      const data = {
        name,
        facility,
        activityUnit: activityUnit?.[1],
      };
      setSearchParamsData(data);
      getGHGClassify(data);
      return;
    }
    setSearchParamsData(res);
  };

  const returnFetchApi = back => {
    if (
      (
        [
          RouteMaps.enterpriseCarbonAccountingDownloadList,
          RouteMapsCorbonFootprint3.carbonFootprint3Download,
        ] as string[]
      ).includes(history.location.pathname)
    ) {
      setTableListLen(back.data.data.rows.length);
      return {
        data: back.data.data.rows,
        count: back.data.data.total,
      };
    }
    if (
      history.location.pathname ===
      RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardList
    ) {
      const list = back.data.rows || [];
      // eslint-disable-next-line prefer-const
      let initList = [
        { standardType: 0 },
        { standardType: 1 },
        { standardType: 2 },
      ];
      initList.forEach((item, index) => {
        list.forEach(ite => {
          if (item.standardType === ite.standardType) {
            initList[index] = cloneDeep(ite);
          }
        });
      });

      setTableListLen(initList.length);
      return {
        data: initList,
        count: back.data.total,
      };
    }

    setTableListLen(back.data.rows.length);
    return {
      data: back.data.rows,
      count: back.data.total,
    };
  };
  // const tableInfo = returnFetchApi();
  const controlPlan = (type, id) => {
    setPageType('controlPlan');
    if (type === 'delete') {
      setDeleteVisible(true);
      setDeleteId(id);
    }
  };
  const carbonDischarge = (type, record) => {
    setPageType('carbonDischarge');
    if (type === 'delete') {
      setDeleteVisible(true);
      setDeleteId(record.computationId);
    } else if (type === 'saveModel') {
      setSaveModelisible(true);
      modelForm.setFieldsValue({
        ...record,
        quantization: record.quantization.split(','),
        description: record.remark,
      });
    }
  };
  const accountReport = (type, record) => {
    if (type === 'generateReport') {
      generateForm.setFieldsValue(record);
      setGenerateReportVisible(true);
    }
    if (type === 'delete') {
      setDeleteVisible(true);
      setDeleteId(record.reportId);
      setPageType('accountReport');
    }
  };
  const acountModel = (type, record) => {
    setModelType(type);
    setPageType('acountModel');
    if (type === 'delete') {
      setDeleteVisible(true);
      setDeleteId(record.modelId);
    } else if (type === 'edit' || type === 'copy' || type === 'add') {
      setSaveModelisible(true);
      modelForm.setFieldsValue({
        ...record,
        quantization: record?.quantization?.split(','),
      });
    }
  };
  const emissionDic = (type, record) => {
    setPageType('emissionDic');
    if (type === 'delete') {
      setDeleteVisible(true);
      setDeleteId(record.dictSourceId);
    }
  };
  const emissionScene = (type, record: any) => {
    setPageType('emissionScene');
    if (type === 'delete') {
      setDeleteVisible(true);
      setDeleteId(record.lessenEmissionId);
    }
  };
  const donwload = (type, record) => {
    if (type === 'donwload') {
      // 记录下载日志
      addLogUsingPOSTSysOperationLogControllerApi({
        module: I18N.enterpriseCarbonAccount2.downloadFiles,
        moduleType: '4',
        operValue: I18N.template(
          I18N.enterpriseCarbonAccount2.downloadFileText2,
          { val1: record.fileName },
        ),
      }).catch(noop);
      const downloadElement = document.createElement('a');
      downloadElement.style.display = 'none';
      downloadElement.href = record.path;
      downloadElement.download = record.fileName; // 下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); // 点击下载
      document.body.removeChild(downloadElement);
      setTimeout(() => {
        setdownInfo({
          path: record.path,
          title: record.fileName,
        });
        setDownloadVisible(true);
      }, 1000);
    }
  };
  const tableColumns: ColumnsType<any> = getTableColumns(
    history,
    controlPlan,
    carbonDischarge,
    accountReport,
    acountModel,
    emissionDic,
    emissionScene,
    donwload,
    unitM,
  );
  const deleteOpretion = res => {
    if (res.data.code === 200) {
      Toast('success', I18N.carbonFootprint.deleteSuccessful);
      setDeleteVisible(false);

      if (tableListLen === 1 && page.current !== 1) {
        childRef.current?.reset({
          page: page.current - 1,
          size: page.pageSize,
        });
      } else {
        childRef.current?.reset();
      }
    } else {
      Toast('warn', I18N.enterpriseCarbonAccount2.deleteFailedPlease);
    }
  };
  const indexColumn = useIndexColumn<any>((page.current - 1) * page.pageSize);
  // 生成报告弹窗
  const [generateForm] = Form.useForm();
  const renderGenerateReportModal = () => {
    generateForm.setFieldsValue({ ghg: [1], iso: [1] });
    const itemForm: any = [
      {
        label: I18N.enterpriseCarbonAccount2.ghgPr,
        name: 'ghg',
        type: 'checkbox',
        rules: false,
        placeholder: I18N.carbonFootprint.pleaseEnter,
        col: 24,
        props: {
          options: [
            { value: 1, label: I18N.enterpriseCarbonAccount2.reportSummary },
            { value: 2, label: I18N.enterpriseCarbonAccount2.completeReport },
            { value: 3, label: I18N.enterpriseCarbonAccount2.inventoryFile },
          ],
        },
      },
      {
        label: I18N.enterpriseCarbonAccount2.isoVersion,
        name: 'iso',
        type: 'checkbox',
        rules: false,
        placeholder: I18N.carbonFootprint.pleaseEnter,
        col: 24,
        props: {
          options: [
            { value: 1, label: I18N.enterpriseCarbonAccount2.reportSummary },
            { value: 2, label: I18N.enterpriseCarbonAccount2.completeReport },
            { value: 3, label: I18N.enterpriseCarbonAccount2.inventoryFile },
          ],
        },
      },
    ];
    const modelFormProps: FormProps = {
      ...formPropsInit(),
      form: generateForm,
      layout: 'vertical',
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };

    return (
      <>
        <Modal
          open={generateReportVisible}
          title={I18N.carbonFootprint.generateReport}
          className='generate-modal'
          onCancel={() => {
            setGenerateReportVisible(false);
          }}
          onOk={() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const data = generateForm.getFieldsValue(true);
            const { ghg, iso, reportId } = data;

            if (ghg.includes(3)) {
              apiInventoryReportGhg({ reportId }).then((res: any) => {
                if (res.data.code === 200) {
                  setDowloadModel(true);
                  setGenerateReportVisible(false);
                }
              });
            }
            if (ghg.includes(2)) {
              apiInventoryReportWordGhg({ reportId }).then((res: any) => {
                if (res.data.code === 200) {
                  setDowloadModel(true);
                  setGenerateReportVisible(false);
                }
              });
            }
            if (ghg.includes(1)) {
              apiInventoryReportSimpleGhg({ reportId }).then((res: any) => {
                if (res.data.code === 200) {
                  setDowloadModel(true);
                  setGenerateReportVisible(false);
                }
              });
            }
            if (iso.includes(3)) {
              apiInventoryReportIso({ reportId }).then((res: any) => {
                if (res.data.code === 200) {
                  setDowloadModel(true);
                  setGenerateReportVisible(false);
                }
              });
            }
            if (iso.includes(2)) {
              apiInventoryReportWordIso({ reportId }).then((res: any) => {
                if (res.data.code === 200) {
                  setDowloadModel(true);
                  setGenerateReportVisible(false);
                }
              });
            }
            if (iso.includes(1)) {
              apiInventoryReportSimpleIso({ reportId }).then((res: any) => {
                if (res.data.code === 200) {
                  setDowloadModel(true);
                  setGenerateReportVisible(false);
                }
              });
            }
          }}
        >
          <FormItemUtil
            antdFormProps={modelFormProps}
            formItems={itemForm}
            paddRight={30}
          />
        </Modal>
        <Modal
          width={400}
          title={I18N.carbonFootprint3.exportEmissionSources}
          open={dowloadModel}
          okText={I18N.carbonFootprint.confirm}
          cancelText={I18N.carbonFootprint.cancel}
          onCancel={() => setDowloadModel(false)}
          onOk={() => {
            history.push(RouteMaps.enterpriseCarbonAccountingDownloadList);
            setDowloadModel(false);
          }}
        >
          <span>{I18N.enterpriseCarbonAccount2.exportEmissionSources}</span>
        </Modal>
      </>
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
        switch (pageType) {
          case 'controlPlan':
            apiDeletePlane(deleteId).then(res => {
              // console.log(res);
              deleteOpretion(res);
            });
            break;
          case 'carbonDischarge':
            apiComputationDeleted(deleteId).then(res => {
              // console.log(res);
              deleteOpretion(res);
            });
            break;
          case 'accountReport':
            apiCalculateDelete(deleteId).then(res => {
              // console.log(res);
              deleteOpretion(res);
            });
            break;
          case 'acountModel':
            apiModelDelete(deleteId).then(res => {
              // console.log(res);
              deleteOpretion(res);
            });
            break;
          case 'emissionScene':
            apiEmissionDelete(deleteId).then(res => {
              // console.log(res);
              deleteOpretion(res);
            });
            break;
          case 'emissionDic':
            apiModelSourceDeleted(deleteId).then(res => {
              // console.log(res);
              deleteOpretion(res);
            });
            break;
          default:
            break;
        }
      }}
    >
      <span className='text'>
        {I18N.enterpriseCarbonAccount2.confirmDeletionOfThis2}
        {currentName === I18N.carbonFootprint3.emissionSourceRepository
          ? currentName.slice(0, 3)
          : currentName}
        ？
      </span>
    </Modal>
  );
  const [modelForm] = Form.useForm();
  // 保存模型弹窗
  const ModelItemForm: any = [
    {
      label: I18N.carbonFootprint.modelName,
      name: 'name',
      type: 'input',
      rules: true,
      padding: '0',
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 24,
      props: {
        maxLength: 50,
      },
    },
    {
      label: I18N.enterpriseCarbonAccount2.quantitativeMethods,
      name: 'quantization',
      type: 'checkbox',
      rules: true,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 24,
      padding: '0',
      props: {
        options: [
          {
            value: '0',
            label: I18N.enterpriseCarbonAccount2.emissionFactorMethod,
          },
          {
            value: '1',
            label: I18N.enterpriseCarbonAccount2.materialBalanceMethod,
          },
        ],
      },
    },
    {
      label: (
        <div>
          <Tooltip title={I18N.enterpriseCarbonAccount2.gwpRefersTo}>
            {I18N.enterpriseCarbonAccount2.gwpInformation}
            <QuestionCircleOutlined />
          </Tooltip>
        </div>
      ),
      name: 'gwp',
      type: 'select',
      padding: '0',
      rules: true,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 24,
      props: {
        options: GWPinfo,
      },
      rulesCustom: [
        {
          required: true,
          message: I18N.enterpriseCarbonAccount2.pleaseSelectGw,
        },
      ],
    },
    {
      label: I18N.enterpriseCarbonAccount2.modelIntroduction,
      name: 'description',
      type: 'textArea',
      padding: '0',
      rules: false,
      placeholder: I18N.carbonFootprint.pleaseEnter,
      col: 24,
      props: {
        rows: 4,
        style: { maxHeight: 200 },
      },
    },
  ];
  const renderSaveModel = () => {
    const modelFormProps: FormProps = {
      ...formPropsInit(),
      form: modelForm,
      layout: 'vertical',
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };
    let title;

    if (pageType === 'carbonDischarge') {
      title = I18N.enterpriseCarbonAccount2.saveAs;
    } else if (pageType === 'acountModel') {
      if (modelType === 'edit') {
        title = I18N.carbonFootprint.edit;
      } else if (modelType === 'copy') {
        title = I18N.carbonFootprint.copy;
      } else if (modelType === 'add') {
        title = I18N.carbonFootprint.newAddition;
      }
    }
    title += I18N.carbonFootprint.accountingModel;

    return (
      <Modal
        open={saveModelisible}
        width={600}
        title={title}
        onCancel={() => {
          setSaveModelisible(false);
        }}
        onOk={() => {
          modelForm.validateFields().then(values => {
            const { name, gwp, description, quantization } = values;
            if (pageType === 'carbonDischarge') {
              const computationId = modelForm.getFieldValue('computationId');
              apiToModel({
                computationId,
                name,
                gwp,
                description,
                quantization: quantization.join(','),
              }).then((res: any) => {
                if (res.data.code === 200) {
                  title = title.replace(
                    I18N.carbonFootprint.accountingModel,
                    '',
                  );
                  Toast('success', I18N.carbonFootprint.operationSuccessful);
                  setSaveModelisible(false);
                  childRef.current?.reset();
                }
                // console.log(res);
              });
            } else if (pageType === 'acountModel') {
              const data = {
                name,
                gwp,
                description,
                quantization: quantization.join(','),
                modelId: '',
              };
              let api;

              if (modelType === 'edit') {
                api = apiAccuntModeEdit;
                data.modelId = modelForm.getFieldValue('modelId');
              } else if (modelType === 'copy') {
                data.modelId = modelForm.getFieldValue('modelId');
                api = apiAccountModeCopy;
              } else if (modelType === 'add') {
                // delete data.modelId;
                api = apiAccuntModeAdd;
              }

              api(data).then((res: any) => {
                if (res.data.code === 200) {
                  title = title.replace(
                    I18N.carbonFootprint.accountingModel,
                    '',
                  );
                  Toast(
                    'success',
                    I18N.template(I18N.enterpriseCarbonAccount2.title, {
                      val1: title,
                    }),
                  );
                  setSaveModelisible(false);
                  childRef.current?.reset();
                }
              });
            }
          });
        }}
      >
        <FormItemUtil
          antdFormProps={modelFormProps}
          formItems={ModelItemForm}
          paddRight={30}
        />
      </Modal>
    );
  };
  const renderDownloadModel = () => (
    <Modal
      title={I18N.carbonFootprint.prompt}
      className={classNames('delete-modal', styles.downloadModal)}
      open={downloadVisible}
      onOk={() => {
        setDownloadVisible(false);
      }}
      onCancel={() => {
        setdownInfo({ title: '', path: '' });
        setDownloadVisible(false);
      }}
    >
      <div className='cur-po'>
        <span>
          {I18N.enterpriseCarbonAccount2.forExample}
          <a
            href={downInfo.path}
            target='_blank'
            download={downInfo.title || I18N.carbonFootprint.download}
            rel='noreferrer'
            onClick={() => {
              addLogUsingPOSTSysOperationLogControllerApi({
                module: I18N.enterpriseCarbonAccount2.downloadFiles,
                moduleType: '4',
                operValue: I18N.template(
                  I18N.enterpriseCarbonAccount2.downloadFileText,
                  { val1: downInfo.title || I18N.carbonFootprint.download },
                ),
              }).catch(noop);
            }}
          >
            {I18N.enterpriseCarbonAccount2.downloadHere}
          </a>
        </span>
      </div>
    </Modal>
  );
  const getGHGClassify = searchParams => {
    apiModelSourceCategoryList(searchParams).then(({ data }) => {
      const {
        data: { list, total },
      } = data;
      setCategortTotal(total);
      setDicTree(list);
      setExpandKey(list.map(item => item.id) || []);
    });
  };
  useEffect(() => {
    const { titleName, formList, btnInfo } = getFormList(history);
    apiMnumListALLByDictTypeBatch({ dictTypes: 'factorUnitM' }).then(
      (res: any) => {
        setUnitM(res.data.data.factorUnitM);
      },
    );

    if (path === RouteMaps.enterpriseCarbonAccountingcarbonDischarge) {
      const list = [
        {
          label: '',
          name: 'name',
          type: 'input',
          rules: false,
          placeholder: I18N.carbonFootprint.accountingName,
          props: {
            style: { width: 260 },
            maxLength: 50,
          },
        },
        {
          label: '',
          name: 'rageType',
          placeholder: I18N.enterpriseCarbonAccount2.accountingCycleCategory,
          type: 'select',
          rules: true,
          props: {
            style: { width: 180 },
            options: [
              { value: 0, label: I18N.enterpriseCarbonAccount2.yearly },
              { value: 1, label: I18N.enterpriseCarbonAccount2.quarterly },
              { value: 2, label: I18N.enterpriseCarbonAccount2.monthly },
              { value: 3, label: I18N.carbonFootprint.custom },
            ],
            allowClear: false,
            onChange(e) {
              searchSupplyForm.setFieldsValue({
                ...searchSupplyForm.getFieldsValue(true),
                dateRange: moment(),
              });
              if (e === 0) {
                setPicker('year');
              }
              if (e === 1) {
                setPicker('quarter');
              }
              if (e === 2) {
                setPicker('month');
              }
              if (e === 3) {
                searchSupplyForm.setFieldsValue({
                  ...searchSupplyForm.getFieldsValue(true),
                  dateRanges: [moment(), moment()],
                });
                setPicker('custom');
              }
            },
          },
        },
        searchSupplyForm.getFieldValue('rageType') === 3
          ? {
              label: '',
              name: 'dateRanges',
              type: 'render',
              rules: false,
              col: 16,
              render() {
                return <DatePicker.RangePicker />;
              },
            }
          : {
              label: '',
              name: 'dateRange',
              type: 'date',
              rules: false,
              props: {
                style: { width: 260 },
                picker,
              },
            },
      ];
      setFormLists(list);
    } else {
      setFormLists(formList || []);
    }
    setCurrentName(titleName);
    setBtn(btnInfo || []);
  }, [picker, cascaderOptions]);
  useEffect(() => {
    if (
      path ===
      RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicList
    ) {
      apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(
        ({ data }: { data: any }) => {
          getCascaderOptions(data?.data || []);
        },
      );
      setTimeout(() => {
        const res = searchSupplyForm.getFieldsValue();
        const { name, facility, activityUnit } = res;
        const data = {
          name,
          facility,
          activityUnit: activityUnit?.[1],
        };
        getGHGClassify(data);
        setSearchParamsData(data);
      }, 200);
    }
  }, []);
  return (
    <div className='enterprise-carbon-account2' style={{ overflow: 'initial' }}>
      {RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicList ===
      history.location.pathname ? (
        <div className='list-components'>
          <div className='title-box'>
            <span className='title'>{currentName}</span>
            {btn.length ? (
              <div>
                {btn.map(item => (
                  <Permission flag={item.flag}>
                    <Button type='primary' {...item} className='button-style'>
                      {item.btnName}
                    </Button>
                  </Permission>
                ))}
              </div>
            ) : (
              ''
            )}
          </div>
          <div className='lib-form'>
            {formLists?.length ? (
              <SearchFormUtil
                antdFormProps={searchFormProps}
                formItems={formLists}
                searchSub={searchSupplySub}
                resetBack={() => {
                  setSearchParamsData(undefined);
                  getGHGClassify({});
                }}
              />
            ) : (
              ''
            )}
          </div>

          <div className='flex-j-b'>
            <ClassifyTree
              total={categortTotal}
              onAllClick={() => {
                const res = searchSupplyForm.getFieldsValue();
                const { name, facility, activityUnit } = res;
                const data = {
                  name,
                  facility,
                  activityUnit: activityUnit?.[1],
                };
                setSearchParamsData(data);
                selectKeyRef.current = [0];
              }}
              defaultExpandAll
              expandedKeys={expandKey}
              selectedKeys={selectKeyRef.current}
              onExpand={(keys: Key[]) => {
                setExpandKey([...keys]);
              }}
              treeData={dicTree}
              blockNode
              onSelect={(key, info) => {
                const res = searchSupplyForm.getFieldsValue();
                const { node } = info;
                const { name, facility, activityUnit } = res;
                const data = {
                  name,
                  facility,
                  activityUnit: activityUnit?.[1],
                  // @ts-ignore
                  ghgCategory: node.level === 1 ? node.businessId : '',
                  // @ts-ignore
                  ghgClassify: node.level === 2 ? node.businessId : '',
                };

                setSearchParamsData(data);
                selectKeyRef.current = [key[0]];
              }}
            />
            <div className='table-box'>
              <CommonTable
                columns={[...indexColumn, ...tableColumns]}
                cRef={childRef}
                scroll={{ y: 'calc(100vh - 317px)' }}
                pageSize={10}
                pagination={{
                  showTotal: total =>
                    I18N.template(I18N.enterpriseCarbonAccount2.totalTota10, {
                      val1: total,
                    }),
                }}
                fetchApi={async params => {
                  setPage({ current: params.page, pageSize: params.size });
                  return apiModelSourceLists({
                    pageNum: params.page,
                    pageSize: params.size,
                    ...searchParamsData,
                  });
                }}
                returnFetchApi={returnFetchApi}
                searchParams={searchParamsData}
                pagePosition
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='list-component'>
          <div className='title-box'>
            <span className='title'>
              {currentName}
              {history.location.pathname ===
                RouteMaps.enterpriseCarbonAccountingcarbonDischarge && (
                <Tooltip
                  overlayInnerStyle={{ width: 580 }}
                  overlay={
                    <>
                      <span>
                        {
                          I18N.enterpriseCarbonAccount2
                            .theNewVersionOnlySupports
                        }
                      </span>
                      <br />
                      <span>{I18N.enterpriseCarbonAccount2.forHistory}</span>
                    </>
                  }
                >
                  <ExclamationCircleFilled className='m-l-6 ExclamationCircleFilled' />
                </Tooltip>
              )}
            </span>
            {btn.length ? (
              <div>
                {btn.map(item => (
                  <Permission flag={item.flag}>
                    <Button type='primary' {...item} className='btn-style'>
                      {item.btnName}
                    </Button>
                  </Permission>
                ))}
              </div>
            ) : (
              ''
            )}
          </div>

          <div className='form-style'>
            {formLists?.length ? (
              <SearchFormUtil
                antdFormProps={searchFormProps}
                formItems={formLists}
                searchSub={searchSupplySub}
                resetBack={() => {
                  setSearchParamsData(undefined);
                }}
              />
            ) : (
              ''
            )}
          </div>
          <CommonTable
            columns={[...indexColumn, ...tableColumns]}
            cRef={childRef}
            scroll={{ y: 'calc(100vh - 305px)' }}
            pageSize={10}
            pagination={{
              showTotal: total =>
                I18N.template(I18N.enterpriseCarbonAccount2.totalTota10, {
                  val1: total,
                }),
            }}
            showPageBar={
              history.location.pathname !==
              RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardList
            }
            fetchApi={async params => {
              setPage({ current: params.page, pageSize: params.size });

              const path = history.location.pathname;
              switch (path) {
                case RouteMapsCorbonFootprint3.carbonFootprint3Download:
                  return apiReportFileList({
                    page: params.page,
                    size: params.size,
                    module: 'carbonFootprint3',
                  });
                case RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanList:
                  return apiEnterprisePlanList({
                    pageNum: params.page,
                    pageSize: params.size,
                    ...searchParamsData,
                  });
                case RouteMaps.enterpriseCarbonAccountingcarbonDischarge:
                  return apiEnterpriseComputationList({
                    pageNum: params.page,
                    pageSize: params.size,
                    ...searchParamsData,
                  });
                case RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportList:
                  return apiReportList({
                    pageNum: params.page,
                    pageSize: params.size,
                    ...searchParamsData,
                  });
                case RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountModelList:
                  return apiAccountModelList({
                    pageNum: params.page,
                    pageSize: params.size,
                    ...searchParamsData,
                  });
                case RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicList:
                  return apiModelSourceLists({
                    pageNum: params.page,
                    pageSize: params.size,
                    ...searchParamsData,
                  });
                case RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardList:
                  return apiStandardList({});

                case RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneList:
                  return apiEmissionList({
                    pageNum: params.page,
                    pageSize: params.size,
                    ...searchParamsData,
                  });
                case RouteMaps.enterpriseCarbonAccountingDownloadList:
                  return apiReportFileList({
                    page: params.page,
                    size: params.size,
                    module: 'enterprise',
                    channel: null,
                  });

                default:
                  return apiEnterprisePlanList({
                    page: params.page,
                    size: params.size,
                    ...searchParamsData,
                  });
              }
            }}
            returnFetchApi={returnFetchApi}
            searchParams={searchParamsData}
            pagePosition
          />
        </div>
      )}
      {renderDeleteModal()}
      {renderSaveModel()}
      {renderGenerateReportModal()}
      {renderDownloadModel()}
    </div>
  );
};

export default EnterpriseCarbonAccountingList;
