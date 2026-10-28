import { FC, useState, useEffect } from 'react';
import IconFont from '@components/iconfont';
import { Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import './style.less';

export interface DataType {
  departmentName: string;
  departmentId: string;
  isOpen?: boolean;
  children: {
    departmentName: string;
    departmentId: string;
    isOpen?: boolean;
    children: {
      departmentName: string;
      departmentId: string;
      isOpen?: boolean;
    }[];
  }[];
}
interface DepartMentOptionType {
  data: DataType[];
  isModalVisible: boolean;
  ApiGetUserCompanyByDeptIdFn: (departmentId) => void;
}
const DepartMentOption: FC<DepartMentOptionType> = ({
  data,
  isModalVisible,
  ApiGetUserCompanyByDeptIdFn,
}) => {
  const [mapData, getMapData] = useState<DataType[]>([]);
  const [currentValue, chooseCurrentValue] = useState<string[] | []>([]);
  useEffect(() => {
    const arr = JSON.parse(JSON.stringify(data));
    getMapData([...arr]);
    return () => {
      getMapData([]);
      chooseCurrentValue([]);
    };
  }, [data, isModalVisible]);
  const renderChilDren = (arr, num) => {
    num++;
    return (
      <ul className='customdepart_children'>
        {arr.map(item => (
          <>
            {/*  eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <li
              style={{ paddingLeft: `${num * 30}px` }}
              key={item.departmentId}
              onClick={() => {
                item.isOpen = !item.isOpen;
                getMapData([...mapData]);
                const arr: string[] = currentValue;
                if (arr.indexOf(item.departmentId) === -1) {
                  arr.push(item.departmentId);
                  chooseCurrentValue([...arr]);
                }
                // 部门下的员工
                ApiGetUserCompanyByDeptIdFn(item.departmentId);
              }}
              className={` ${
                currentValue.some(it => it === item.departmentId) && item.isOpen
                  ? 'isActive'
                  : ''
              }`}
            >
              <div style={{ display: 'flex' }}>
                <Button className='customdepart_part' type='link'>
                  {item.departmentName}
                </Button>
              </div>
              {item.children ? (
                item.isOpen ? (
                  <UpOutlined
                    style={{
                      color: item.isOpen ? 'rgba(12, 191, 159, 1)' : '',
                    }}
                  />
                ) : (
                  <DownOutlined />
                )
              ) : (
                ''
              )}
            </li>
            {item.children && item.isOpen && renderChilDren(item.children, num)}
          </>
        ))}
      </ul>
    );
  };
  const returnTree = () =>
    mapData?.map((item, index) => (
      <>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <li
          key={item.departmentId}
          onClick={() => {
            mapData[index].isOpen = !item.isOpen;
            getMapData([...mapData]);
            chooseCurrentValue([]);
            if (mapData[index].isOpen === true) {
              const arr: string[] = [];
              arr.push(item.departmentId);
              chooseCurrentValue([...arr]);
            } else {
              chooseCurrentValue([]);
            }
            // 部门下的员工
            ApiGetUserCompanyByDeptIdFn(item.departmentId);
          }}
        >
          <div style={{ display: 'flex' }}>
            <span className='customdepart_icon'>
              <IconFont
                type='icon-icon-zuzhijiagou'
                style={{ fontSize: '30px', color: '#08c' }}
              />
            </span>
            <Button
              className={`customdepart_part ${
                currentValue.some(it => it === item.departmentId) && item.isOpen
                  ? 'customdepart_part_isActive'
                  : ''
              }`}
              type='link'
            >
              {item.departmentName}
            </Button>
          </div>
          {item.isOpen ? <UpOutlined /> : <DownOutlined />}

          {/**/}
        </li>
        {item.children && item.isOpen && renderChilDren(item.children, 1)}
      </>
    ));
  return <ul className='customdepart'>{returnTree()}</ul>;
};
export default DepartMentOption;
