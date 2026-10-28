import I18N from '@src/lang/I18N';
import IconFont from '@src/components/iconfont';
import Permission from '@src/components/Permission';
import VerifyUtils from '@src/utils/verifty';
import { Button, Dropdown, Input, Menu, Select, Tooltip } from 'antd';
import { ProductStatus, sessionStorageItem } from '../Product/indesjson';
// import style from './index.module.scss';
// 操作列表更多按钮需要显示的内容
const menu = (list, handleClick, record) => (
  <Menu>
    {list.map(item => (
      <Permission flag={item.EnterpriseFlag}>
        <Menu.Item>
          <span
            // eslint-disable-next-line consistent-return
            onClick={() => {
              if (item.label === I18N.Certification.modifyProject) {
                sessionStorageItem(record);

                return handleClick(
                  'url',
                  `${item.enterprisePath}?id=${record.projectId}`,
                );
              }
              if (item.url) {
                sessionStorageItem(record);
                handleClick(
                  'url',
                  `${item.enterprisePath}?${record.projectId}`,
                );
              } else {
                handleClick('handle', {
                  itemlist: item,
                  recoedList: record,
                });
              }
            }}
          >
            {item.label}
          </span>
        </Menu.Item>
      </Permission>
    ))}
  </Menu>
);
// 碳核查列表页相关内容
export const Enterprieindexjson = (
  optionlist: any[],
  handleClick: (e, b) => void,
) => ({
  title: I18N.Certification.carbonVerificationProject, // 列表页面名称
  addBtn: {
    text: I18N.Certification.initiateVerificationApplication, // 按钮文字
    url: '',
    flag: 'Certification:Enterprise:product:add', // 按钮管理权限
  },
  searchFrom: [
    // 搜索列表内容
    {
      label: I18N.carbonNeutral.entryName,
      name: 'projectName',
      hml: <Input placeholder={I18N.carbonFootprint.pleaseEnter} />,
    },
    {
      label: I18N.Certification.projectId,
      name: 'projectId',
      hml: <Input placeholder={I18N.carbonFootprint.pleaseEnter} />,
    },
    {
      label: I18N.carbonFootprint.state,
      name: 'status',
      hml: (
        <Select placeholder={I18N.carbonFootprint.pleaseSelect}>
          {optionlist.map((item: any) => (
            <Select.Option value={item.value}>{item.label}</Select.Option>
          ))}
        </Select>
      ),
    },
  ],
  searchTableColumns: [
    // 列表column
    {
      title: I18N.carbonFootprint.number,
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 60,
      render: (roleName: string, record: any, index: number) => (
        <Tooltip title={index + 1} placement='topLeft'>
          {index + 1}
        </Tooltip>
      ),
    },
    {
      title: I18N.carbonNeutral.entryName,
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      render: (roleName: string) => (
        <Tooltip title={roleName} placement='topLeft'>
          {roleName}
        </Tooltip>
      ),
    },
    {
      title: I18N.Certification.projectId,
      dataIndex: 'projectId',
      key: 'projectId',
      width: 140,
      ellipsis: true,
      render: (roleName: string) => (
        <Tooltip title={roleName} placement='topLeft'>
          {roleName}
        </Tooltip>
      ),
    },
    {
      title: I18N.Certification.estimatedCostInYuan,
      dataIndex: 'expenses',
      key: 'expenses',
      ellipsis: true,
      width: 140,
      render: (roleName: string) => (
        <Tooltip
          title={roleName === null ? '--' : roleName}
          placement='topLeft'
        >
          {roleName === null ? '--' : roleName}
        </Tooltip>
      ),
    },
    {
      title: I18N.Certification.actualCostInYuan,
      dataIndex: 'actualExpenses',
      key: 'actualExpenses',
      ellipsis: true,
      width: 140,
      render: (roleName: string) => (
        <Tooltip
          title={roleName === null ? '--' : roleName}
          placement='topLeft'
        >
          {roleName === null ? '--' : roleName}
        </Tooltip>
      ),
    },
    {
      title: I18N.carbonFootprint.state,
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      width: 140,
      render: (roleName: string) => (
        <Tooltip title={ProductStatus(roleName)?.label} placement='topLeft'>
          <span className={ProductStatus(roleName)?.style}>
            {ProductStatus(roleName)?.label}
          </span>
        </Tooltip>
      ),
    },
    {
      title: I18N.Certification.creatorTime,
      dataIndex: 'createTime',
      key: 'createTime',
      ellipsis: true,
      width: 200,
      render: (roleName: string, record) => (
        <Tooltip
          title={`${`${record.userName}-`}${VerifyUtils.get_time(roleName)}`}
          placement='topLeft'
        >
          {`${record.userName}-`}
          {VerifyUtils.get_time(roleName)}
        </Tooltip>
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      width: 140,
      render: (roleName: string, record: { projectId: string }) => (
        <>
          <Permission flag='Certification:Enterprise:product:detail'>
            <Button
              style={{ paddingLeft: '0px' }}
              type='link'
              onClick={() => {
                handleClick('detail', record.projectId);
              }}
            >
              {I18N.carbonFootprint3.details}
            </Button>
          </Permission>
          {ProductStatus(roleName)?.btnlist.length > 0 ? (
            <Dropdown
              overlay={menu(
                ProductStatus(roleName).btnlist,
                handleClick,
                record,
              )}
            >
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                className='ant-dropdown-link'
                onClick={e => e.preventDefault()}
              >
                {I18N.Certification.more}
                <IconFont type='icon-icon-zhankai' />
              </a>
            </Dropdown>
          ) : (
            ''
          )}

          {/* {ProductStatus(roleName).btnlist.map(item => {
                return item.url ? (
                  <Button
                    type='link'
                    onClick={() =>
                      handleClick('submitlist', {
                        id: record.projectId,
                        url: item.urlPath,
                      })
                    }
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Popconfirm
                    title={`确认${item.label}吗？`}
                    onConfirm={async () => {
                      console.log(item);
                      handleClick('status', {
                        itemList: item,
                        recordList: record,
                      });
                    }}
                    okText='确认'
                    cancelText='取消'
                  >
                    <Button type='link'>{item.label}</Button>
                  </Popconfirm>
                );
              })} */}
        </>
      ),
    },
  ],
});
