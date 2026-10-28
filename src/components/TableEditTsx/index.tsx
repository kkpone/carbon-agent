import I18N from '@src/lang/I18N';
import { Popconfirm, Popover } from 'antd';
import Permission from '@components/Permission';
import './TableEdit.less';

interface TableDataProps {
  btn_title?: string;
  type?: string;
  color?: string;
  is_pop?: boolean;
  flag?: string;
  pop_title?: string;
  btn_sure?: boolean;
  btn_cancel?: boolean;
  is_code?: boolean;
  is_switch?: boolean;
}
interface TableEditProps<T> {
  onHandelType?: (values: TableDataProps) => void;
  onSubmit?: (values: T) => void;
  get_action_data: TableDataProps[];
  record: T;
}

const TableEditTsx = <T extends { [key: string]: any }>({
  get_action_data,
  onHandelType,
  onSubmit,
  record,
}: TableEditProps<T>) => {
  const renderContent = (item: TableDataProps) => {
    if (item.type === 'removeCollect') {
      return (
        <Permission flag={item.flag}>
          <Popconfirm
            title={I18N.carbonFootprint.doYouWantToCancelTheCollection}
            onConfirm={() => {
              if (onHandelType) {
                onHandelType(item);
              }
            }}
            okText={item.btn_sure ? item.btn_sure : I18N.carbonFootprint.confirm2}
            cancelText={item.btn_cancel ? item.btn_cancel : I18N.carbonFootprint.cancel}
          >
            <span className={`${item.color || ''} text-14  margin-right30`}>
              {item.btn_title}
            </span>
          </Popconfirm>
        </Permission>
      );
    }
    if (item.type === 'addCollect') {
      return (
        <Permission flag={item.flag}>
          <Popconfirm
            title={
              Number(record.isCollectFactor) === 1
                ? I18N.carbonFootprint.doYouWantToCancelTheCollection
                : I18N.carbonFootprint.doYouWantToBookmarkThis
            }
            onConfirm={() => {
              if (onHandelType) {
                onHandelType(item);
              }
            }}
            okText={item.btn_sure ? item.btn_sure : I18N.carbonFootprint.confirm2}
            cancelText={item.btn_cancel ? item.btn_cancel : I18N.carbonFootprint.cancel}
          >
            <span className={`${item.color || ''} text-14  margin-right30`}>
              {item.btn_title}
            </span>
          </Popconfirm>
        </Permission>
      );
    }
    if (item.type === 'submit') {
      return (
        <Permission flag={item.flag}>
          <span
            className={`${item.color || ''} text-14 margin-right30`}
            onClick={() => {
              if (onSubmit) {
                onSubmit(record);
              }
            }}
          >
            {item.btn_title}
          </span>
        </Permission>
      );
    }
    if (item.is_pop) {
      return (
        <Permission flag={item.flag}>
          <Popconfirm
            title={item.pop_title}
            onConfirm={() => {
              if (onHandelType) {
                onHandelType(item);
              }
            }}
            okText={item.btn_sure ? item.btn_sure : I18N.carbonFootprint.confirm2}
            cancelText={item.btn_cancel ? item.btn_cancel : I18N.carbonFootprint.cancel}
          >
            <span className={`${item.color || ''} text-14  margin-right30`}>
              {item.btn_title}
            </span>
          </Popconfirm>
        </Permission>
      );
    }
    if (item?.is_code) {
      return (
        <Permission flag={item.flag}>
          <Popover title={item.pop_title} trigger='click'>
            <span className={`${item.color || ''} text-14 margin-right30`}>
              {item.btn_title}
            </span>
          </Popover>
        </Permission>
      );
    }
    if (item?.is_switch) {
      return (
        <Permission flag={item.flag}>
          <span className={`${item.color || ''} text-14 margin-right30`}>
            <Popconfirm
              title={
                Number(record?.status)
                  ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    I18N.template(I18N.components.isThisEnabled, { val1: record?.userName })
                  : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    I18N.template(I18N.components.doYouWantToDisableThis, { val1: record?.userName })
              }
              onConfirm={() => {
                if (onHandelType) {
                  onHandelType(item);
                }
              }}
              okText={item.btn_sure ? item.btn_sure : I18N.carbonFootprint.confirm2}
              cancelText={item.btn_cancel ? item.btn_cancel : I18N.carbonFootprint.cancel}
            >
              {/* <Switch checked={record?.is_active} /> */}
              {record?.status ? I18N.carbonFootprint.enable : I18N.carbonFootprint.disabled}
            </Popconfirm>
          </span>
        </Permission>
      );
    }
    if (item.type === 'addCollect') {
      return (
        <Permission flag={item.flag}>
          <span className={`${item.color || ''} text-14 margin-right30`}>
            <Popconfirm
              title={I18N.components.isThisFactor}
              onConfirm={() => {
                if (onHandelType) {
                  onHandelType(item);
                }
              }}
              okText={item.btn_sure ? item.btn_sure : I18N.carbonFootprint.confirm2}
              cancelText={item.btn_cancel ? item.btn_cancel : I18N.carbonFootprint.cancel}
            >
              {/* <Switch checked={record?.is_active} /> */}
              {record?.status ? I18N.carbonFootprint.enable : I18N.carbonFootprint.disabled}
            </Popconfirm>
          </span>
        </Permission>
      );
    }
    return (
      <Permission flag={item.flag}>
        <span
          className={`${item.color || ''} text-14 margin-right30`}
          onClick={() => {
            if (onHandelType) {
              onHandelType(item);
            }
          }}
        >
          {item.btn_title}
        </span>
      </Permission>
    );
  };
  return (
    <div className='table_edit_main' style={{ cursor: 'pointer' }}>
      {get_action_data?.map(item => renderContent(item))}
    </div>
  );
};

export default TableEditTsx;
