/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-13 18:09:48
 * @Date: 2023-01-04 11:41:11
 * @@description: 产品属性 - 新增产品枚举
 */
import I18N from '@src/lang/I18N';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { FormActions } from '@src/components/FormActions';
import { ColumnsType } from 'antd/lib/table';
import CommonTable from '@src/components/TableUtil/page/CommonTable';
import { TableRef } from '@src/components/TableUtil/types/common';
import { AxiosResponse } from 'axios';
import { Button, Form, FormProps, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { Toast } from '@src/utils/Toast';
import { BackTableData } from '@src/views/carbonFootprint3/type';
import { checkPermissions } from '@src/components/Permission/utils';
import {
  getProductAttributeDetail,
  getProductAttributeEnumTableData,
  postProductAttributeEnumAdd,
  postProductAttributeEnumEdit,
  postProductAttributeEnumUpadate,
} from '../../service';
import {
  ProductAttributeDetail,
  ProductAttributeEnumAdd,
  ProductAttributeEnumTableData,
} from '../../type';
import styleCarbonFootprint3 from '../../../index.module.less';
import {
  carbonFootprintProductAttributeAddEnumTableCol,
  productAttributeAddEnumFormItem,
} from '../model';

const ProductAttributeAddEnum = () => {
  const history = useHistory();
  const [addForm] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const childRef = useRef<TableRef>();
  /** 新增弹框的form */
  const addFormProps: FormProps = {
    ...formPropsInit(),
    form: addForm,
    initialValues: {
      status: 0,
    },
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  /** 当前枚举的对象详情 */
  const [infoData, setInfoData] = useState<ProductAttributeDetail>();
  /** 是否显示新增 */
  const [showAddModal, setAddModal] = useState<boolean>(false);
  /** 是否显示禁用弹框 */
  const [showforbiddenModal, setForbiddenModal] = useState<boolean>(false);
  /** 当前状态 */
  const [editStatus, setEditStatus] = useState<boolean>(false);
  /** 当前选中的值 */
  const [changeInfo, setChangeInfo] = useState<ProductAttributeEnumTableData>();
  /**
   * @description: 新增枚举值
   */
  const goAdd = () => {
    setChangeInfo(undefined);
    setEditStatus(false);
    addForm.resetFields();
    setAddModal(true);
  };

  /**
   * @description: 禁用的提交
   */
  const subFormForbiddenAdd = async () => {
    if (changeInfo) {
      const status = changeInfo.status === 0 ? 1 : 0;
      const back = await postProductAttributeEnumUpadate({
        id: changeInfo.id,
        status,
      });
      if (back.data.code === 200) {
        setForbiddenModal(false);
        childRef.current?.reset();
      }
    }
  };

  /**
   * @description: 新增或者编辑枚举值
   */
  const subFormAdd = async () => {
    const addFormItemData: ProductAttributeEnumAdd =
      await addForm.validateFields();
    if (addFormItemData) {
      const back =
        editStatus && changeInfo
          ? await postProductAttributeEnumEdit({
              ...addFormItemData,
              id: changeInfo.id,
            })
          : await postProductAttributeEnumAdd({
              ...addFormItemData,
              extraId: id,
            });
      if (back.data.code === 200) {
        Toast(
          'success',
          editStatus
            ? I18N.carbonFootprint.editSuccessful
            : I18N.carbonFootprint.newSuccessfullyAdded2,
        );
        setAddModal(false);
        childRef.current?.reset();
        addForm.resetFields();
      }
    }
  };

  /**
   * @description: 编辑枚举值
   */
  const editModal = (item: ProductAttributeEnumTableData) => {
    setChangeInfo(item);
    setEditStatus(true);
    addForm.setFieldsValue(item);
    setAddModal(true);
  };

  /** 表头 */
  const columns: ColumnsType<ProductAttributeEnumTableData> = [
    ...carbonFootprintProductAttributeAddEnumTableCol(),
    {
      title: I18N.carbonFootprint.operation,
      width: 150,
      fixed: 'right',
      dataIndex: 'set',
      render: (val, item: ProductAttributeEnumTableData) => (
        <div>
          {checkPermissions(
            <span
              onClick={() => {
                editModal(item);
              }}
              className={`${styleCarbonFootprint3.primaryColorFont} ${styleCarbonFootprint3.cursorPointerFont} m-r-10`}
            >
              {I18N.carbonFootprint.edit}
            </span>,
            'footprint3:sysExtraEnum:edit',
          )}

          {checkPermissions(
            <span
              onClick={async () => {
                setChangeInfo(item);
                setForbiddenModal(true);
              }}
              className={`${styleCarbonFootprint3.primaryColorFont} ${styleCarbonFootprint3.cursorPointerFont}`}
            >
              {item.status === 0
                ? I18N.carbonFootprint.disabled
                : I18N.carbonFootprint.enable}
            </span>,
            'footprint3:sysExtraEnum:updateStatus',
          )}
        </div>
      ),
    },
  ];
  /**  表格数据格式  */
  const returnFetchApi = (
    back: AxiosResponse<
      AxiosResponse<BackTableData<ProductAttributeEnumTableData>>
    >,
  ) => ({
    data: back.data.data.rows,
    count: back.data.data.total,
  });

  /**
   * @description: 初始化
   */
  const init = async () => {
    const info = await getProductAttributeDetail({ id });
    const { data } = info.data;
    setInfoData(data);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div className={`${styleCarbonFootprint3.carbonFootprint3} m-b-60`}>
      <div className={styleCarbonFootprint3.main}>
        <div className={`${styleCarbonFootprint3.titleAndBtn} m-b-16`}>
          <div>
            {I18N.carbonFootprint3.attributeName}
            <span style={{ fontWeight: 600 }}>{infoData?.name}</span>
          </div>
          <div>
            {checkPermissions(
              <Button
                icon={<PlusOutlined />}
                onClick={goAdd}
                style={{ width: 120 }}
                className={`${styleCarbonFootprint3.btn}`}
                type='primary'
              >
                {I18N.carbonFootprint3.addEnumerationValue}
              </Button>,
              'footprint3:sysExtraEnum:add',
            )}
          </div>
        </div>

        <div>
          <CommonTable<ProductAttributeEnumTableData, any, any>
            bordered={false}
            searchParams={{}}
            cRef={childRef}
            pageSize={10}
            scroll={{ x: 1200 }}
            fetchApi={params =>
              getProductAttributeEnumTableData({
                ...params,
                extraId: id,
                pageNum: params.page,
                pageSize: params.size,
              })
            }
            returnFetchApi={returnFetchApi}
            columns={columns}
            rowKey='id'
            pagePosition={false}
          />
        </div>
      </div>
      <Modal
        width={448}
        title={I18N.carbonFootprint.prompt}
        maskClosable={false}
        getContainer={false}
        open={showforbiddenModal}
        onOk={subFormForbiddenAdd}
        okButtonProps={{
          style: {
            color: '#fff',
            background: '#ED5555',
            borderColor: '#ED5555',
          },
        }}
        onCancel={() => setForbiddenModal(false)}
      >
        <div>
          {I18N.carbonFootprint.confirm}
          {changeInfo?.status === 0
            ? I18N.carbonFootprint.disabled
            : I18N.carbonFootprint.enable}
          {I18N.carbonFootprint3.thisEnumerationValue}
          {changeInfo?.name}
        </div>
      </Modal>
      <Modal
        width={408}
        title={
          editStatus
            ? I18N.carbonFootprint3.editEnumerationValues
            : I18N.carbonFootprint3.addEnumerationValue
        }
        // wrapClassName='productManagementModal'
        maskClosable={false}
        getContainer={false}
        open={showAddModal}
        onOk={subFormAdd}
        onCancel={() => setAddModal(false)}
      >
        <FormItemUtil
          paddRight={1}
          antdFormProps={addFormProps}
          formItems={productAttributeAddEnumFormItem()}
        />
      </Modal>
      <FormActions
        place='center'
        buttons={[
          {
            title: I18N.carbonFootprint.return,
            onClick: async () => {
              history.goBack();
            },
          },
        ]}
      />
    </div>
  );
};

export default ProductAttributeAddEnum;
