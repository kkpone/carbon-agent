/*
 * @@description: 报告列表
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-20 11:22:25
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-21 20:08:25
 */
/**
 * @file 报告列表
 */
import '../style.less';
import {
  FilePdfOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { Empty } from 'antd';
import { downloadFile } from '@src/components/DownLoadFile';
import { Report } from '../carbonDataManage/CarbonDataFill/type';

interface PropTypes {
  reportList?: Report[];
  /** 模型共享提交前禁用下载 */
  disabled?: boolean;
}
const ReportDownloadList = (props: PropTypes) => {
  const { reportList, disabled = false } = props;

  return (
    <div className='supply-chain-container'>
      <div className='report-list'>
        {Array.isArray(reportList) && reportList?.length ? (
          reportList?.map(item => (
            <div
              className={`report-item flex-a-c flex-j-b${
                disabled ? ' report-item-disabled' : ''
              }`}
              onClick={() => {
                if (disabled || !item.url) return;
                downloadFile(item.name, item.url);
              }}
            >
              <div className='flex-a-c'>
                <FilePdfOutlined className='pdficon' />
                <span className='report-name'>{item.name}</span>
              </div>
              <VerticalAlignBottomOutlined className='downloadicon' />
            </div>
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{ height: 75, marginTop: '20vh' }}
          />
        )}
      </div>
    </div>
  );
};
export default ReportDownloadList;
