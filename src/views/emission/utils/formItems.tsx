/**
 * @file 因子表单
 */
import { UploadOutlined } from '@ant-design/icons';
import apiPath from '@src/api/config';
import { Button } from '@src/components/Button';
import I18N from '@src/lang/I18N';
import { combineClassName } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { getToken } from '@src/utils/cookie';
import {
  Col,
  Upload,
  Form,
  Input,
  Select,
  Row,
  DatePicker,
  Popconfirm,
} from 'antd';
import { compact } from 'lodash-es';
import { Moment } from 'moment';

import { FormJsonItemType, UploadFiles } from './index-type';
import style from '../index.module.scss';

// 获取后缀名
const getFileSuffix = (fileName: string) => {
  // 获取最后一个.的位置
  const index = fileName.lastIndexOf('.');
  // 获取后缀
  const suffix = fileName.slice(index + 1);
  return suffix;
};
//  // 选择标签 、使用行业
//  const showModal = (item: FormJsonItemType) => {
//   if (item.modelLabel === 'business') {
//     if (form.getFieldValue('business')) {
//       changeCurrentLableIds(form.getFieldValue('business').split(','));
//     } else {
//       changeCurrentLableIds([]);
//     }
//   }
//   if (item.modelLabel === 'factorLabel') {
//     if (form.getFieldValue('labelFactor')) {
//       changeCurrentLableIds(form.getFieldValue('labelFactor').split(','));
//     } else {
//       changeCurrentLableIds([]);
//     }
//   }
//   changeModelVisBle(true);
//   changeCurrentLabel(item.modelLabel || '-');
// };

// const renderCaculateTable = () => {
//   return form.getFieldValue('factorType') === '1' ? (
//     <Table
//       bordered
//       dataSource={formik.values}
//       columns={columns}
//       pagination={false}
//     />
//   ) : (
//     <Table
//       bordered
//       dataSource={formulaFormik.values}
//       columns={formulaColums}
//       pagination={false}
//     />
//   );
// };

// const renderResultTable = () => {
//   return (
//     <Table
//       bordered
//       dataSource={formulaResultFormik.values}
//       columns={ResultColums}
//       pagination={false}
//     />
//   );
// };
// const inputValues = (item: FormJsonItemType) =>
// item.modelLabel === 'business' ? businessLableArr : factorLableArr;

type Props = {
  // 公式类、数值类
  // changeDataValue({
  //   ...form.getFieldsValue(),
  //   factorType: e,
  // });
  onSelectChange?: (e: string | undefined, item: FormJsonItemType) => void;
  showModal?: (item: FormJsonItemType) => void;
  renderResultTable?: () => JSX.Element;
  renderCaculateTable?: () => JSX.Element;
  renderRelevanceFectorTable?: () => JSX.Element;
  isDisabled?: boolean;
  inputValues?: (item: FormJsonItemType) => string[];
  // 来源相关
  yearPickerValue?: Moment;
  datePickerValue?: Moment;
  onfileChange?: (files: any[]) => void;
  fileList?: UploadFiles[];
};
export const renderFormItems =
  ({
    onSelectChange,
    showModal,
    renderResultTable,
    renderCaculateTable,
    yearPickerValue,
    datePickerValue,
    onfileChange,
    isDisabled,
    fileList,
    inputValues,
    renderRelevanceFectorTable,
  }: Props) =>
  (LeftItem: FormJsonItemType[], tab: string, className?: string) => {
    const renderPlaceHolder = (t: {
      disabled?: boolean;
      placeholder?: string;
      [k: string]: any;
    }) =>
      t.disabled || isDisabled
        ? '-'
        : t.placeholder || I18N.carbonFootprint.pleaseEnter;
    return (
      <Col
        span={24}
        key={tab}
        className={combineClassName(
          `${style.col} ${className ? style[className] || className : ''}`,
        )}
      >
        {LeftItem.map(item => {
          if (item.type === 'input') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                className={style[item.class || '']}
                key={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
              >
                <Input
                  disabled={item.disabled || isDisabled}
                  placeholder={renderPlaceHolder(item)}
                  maxLength={item.maxLength}
                />
              </Form.Item>
            );
          }
          if (item.type === 'select') {
            return (
              <>
                <Form.Item
                  name={item.title}
                  aria-label={item.title}
                  key={item.title}
                  label={item.name}
                  labelAlign='right'
                  rules={item.require}
                  className={style[item.class ? item.class : '']}
                  initialValue={item.defaultValue}
                >
                  <Select
                    disabled={item.disabled}
                    allowClear
                    popupClassName={`${item.title}-selected`}
                    placeholder={renderPlaceHolder({
                      placeholder: I18N.carbonFootprint.pleaseSelect,
                      ...item,
                    })}
                    onChange={e => {
                      onSelectChange?.(e as string | undefined, item);
                    }}
                    options={item?.select_list?.map(t => ({
                      value: t.dictValue,
                      label: t.dictLabel,
                    }))}
                  />
                </Form.Item>
                {item.name === I18N.emission.selectFormula && (
                  <div className={style.oneRow8}>{item?.desc}</div>
                )}
              </>
            );
          }
          if (item.type === 'disabledinput') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
              >
                <Input
                  disabled
                  placeholder={renderPlaceHolder(item)}
                  maxLength={100}
                />
              </Form.Item>
            );
          }
          if (item.type === 'text') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
              >
                <span> {item.value}</span>
              </Form.Item>
            );
          }
          if (item.type === 'oneInput') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
                className={item.class ? style[item.class] : ''}
              >
                <Row
                  gutter={24}
                  justify='space-between'
                  style={{ height: '32px' }}
                >
                  <Col flex='1'>
                    {['business', 'factorLabel'].includes(
                      item?.modelLabel || 'null',
                    ) ? (
                      <Input
                        disabled
                        placeholder={renderPlaceHolder(item)}
                        maxLength={100}
                        value={inputValues?.(item)}
                      />
                    ) : (
                      <Input
                        disabled
                        placeholder={renderPlaceHolder(item)}
                        maxLength={100}
                      />
                    )}
                  </Col>
                  {item.isNeedButton || item.disabled ? (
                    ''
                  ) : (
                    <Col span={4}>
                      <Button
                        onClick={async () => {
                          showModal?.(item);
                        }}
                      >
                        {item.buttontext}
                      </Button>
                    </Col>
                  )}
                </Row>
              </Form.Item>
            );
          }
          if (item.type === 'oneInput1') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
                className={item.class ? style[item.class] : ''}
              >
                <Input
                  disabled={item.disabled || isDisabled}
                  placeholder={renderPlaceHolder(item)}
                />
              </Form.Item>
            );
          }
          if (item.type === 'oneResultTable') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
                className={item.class ? style[item.class] : ''}
              >
                <Row gutter={24} justify='space-between'>
                  <Col flex='1'>{renderResultTable?.()}</Col>
                </Row>
              </Form.Item>
            );
          }
          if (item.type === 'oneTable') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
                className={item.class ? style[item.class] : ''}
              >
                <Row gutter={24} justify='space-between'>
                  <Col flex='1'>{renderCaculateTable?.()}</Col>
                </Row>
              </Form.Item>
            );
          }
          if (item.type === 'oneTextarea') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
                className={item.class ? style[item.class] : ''}
              >
                <Input.TextArea
                  showCount
                  rows={4}
                  disabled={item.disabled || isDisabled}
                  placeholder={renderPlaceHolder(item)}
                  maxLength={item.maxLength}
                />
              </Form.Item>
            );
          }
          if (item.type === 'relevanceFector') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
                className={item.class ? style[item.class] : ''}
                style={{
                  position: 'relative',
                  top: '20px',
                }}
              >
                <Row gutter={24} justify='space-between'>
                  <Col flex='1'>{renderRelevanceFectorTable?.()}</Col>
                </Row>
              </Form.Item>
            );
          }
          if (item.type === 'year') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  picker='year'
                  disabledDate={current => current.isAfter(Date.now())}
                  disabled={item.disabled || isDisabled}
                  value={yearPickerValue}
                />
              </Form.Item>
            );
          }
          if (item.type === 'date') {
            return (
              <Form.Item
                name={item.title}
                label={item.name}
                aria-label={item.name}
                labelAlign='right'
                rules={item.require}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  picker='date'
                  disabledDate={current => current.isAfter(Date.now())}
                  disabled={item.disabled || isDisabled}
                  value={datePickerValue}
                />
              </Form.Item>
            );
          }
          if (item.type === 'upload') {
            return (
              <Form.Item
                name={item.title}
                aria-label={item.title}
                label={item.name}
                labelAlign='right'
                rules={item.require}
                className={item.class ? style[item.class] : ''}
              >
                <Upload
                  aria-label='upload-img'
                  maxCount={5}
                  disabled={item.disabled || isDisabled}
                  fileList={fileList}
                  action={`${
                    process.env.REACT_APP_API_URL || ''
                  }${apiPath()}/system/file/uploadImg`}
                  headers={{
                    Authorization: getToken(),
                  }}
                  accept='.jpg,.png,.jpeg,.docx,.pdf,.doc'
                  beforeUpload={file => {
                    if (file.size > 50 * 1024 * 1024) {
                      Toast('error', I18N.carbonFootprint.theFileIsTooLarge);
                      return Upload.LIST_IGNORE;
                    }
                    const suffx = getFileSuffix(file.name).toLowerCase();

                    if (
                      !(
                        ['pdf', 'jpg', 'png', 'jpeg', 'docx'].indexOf(suffx) >=
                        0
                      )
                    ) {
                      Toast('error', I18N.emission.fileFormatIsIncorrect);
                      return Upload.LIST_IGNORE;
                    }
                    return true;
                  }}
                  className={style.upload}
                  progress={{ showInfo: false }}
                  // eslint-disable-next-line
                  itemRender={(originNode, file, f, actions) => {
                    return (
                      <div className={style.uploadWrapper}>
                        <div className={style.fileName}>{file.name}</div>
                        <div className={style.actions}>
                          <Button
                            type='link'
                            onClick={async () => {
                              window.open(file.url);
                            }}
                            aria-label='preview-img'
                          >
                            {I18N.carbonFootprint3.preview}
                          </Button>
                          {!isDisabled && (
                            <Popconfirm
                              title={I18N.emission.areYouSureYouWantToDeleteIt}
                              onConfirm={() => actions.remove()}
                            >
                              {/* eslint-disable-next-line */}
                              <a
                                href='#'
                                aria-label='delete-img'
                                className={style.del}
                              >
                                {I18N.carbonFootprint.delete}
                              </a>
                            </Popconfirm>
                          )}
                        </div>
                      </div>
                    );
                  }}
                  onChange={({ fileList: newFileList }) => {
                    const newArr = newFileList.map(item => {
                      if (item.status === 'done' && item.originFileObj) {
                        // @ts-ignore
                        if (item.response.code === 200) {
                          // @ts-ignore
                          return item.response.data;
                        }
                        // @ts-ignore
                        Toast(
                          'error',
                          item.response?.msg || I18N.emission.uploadFailed,
                        );
                        return null;
                      }
                      return item;
                    });
                    onfileChange?.(compact([...newArr]));
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      disabled={item.disabled || isDisabled}
                      icon={<UploadOutlined />}
                      loading={false}
                    >
                      {I18N.emission.uploadSourceFiles}
                    </Button>
                    <div
                      style={{
                        color: '#ccc',
                      }}
                    >
                      {I18N.emission.onlySupportsPd}
                    </div>
                  </div>
                </Upload>
              </Form.Item>
            );
          }
          return <div key='empty' />;
        })}
      </Col>
    );
  };
