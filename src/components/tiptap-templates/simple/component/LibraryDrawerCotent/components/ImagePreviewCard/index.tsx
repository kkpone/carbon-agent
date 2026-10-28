import I18N from '@src/lang/I18N';
import { FC } from 'react';
import { Image, Tooltip, Typography } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import { IconAlibaba } from '@/components/iconfont';
import TextWidthOverflow from '@/views/subModules/CarbonFootprintModel/components/byWidth';
import { saveAs } from 'file-saver';

const { Text } = Typography;

export interface IImagePreviewCardProps {
  /** 图片名称 */
  name: string;
  /** 创建时间 */
  createTime: string;
  /** 创建者 */
  createBy: string;
  /** 图片URL */
  url: string;
  /** 点击插入报告回调 */
  onInsert?: () => void;
  /** 点击下载回调 */
  onDownload?: () => void;
  /** 点击删除回调 */
  onDelete?: () => void;
}

export const ImagePreviewCard: FC<IImagePreviewCardProps> = props => {
  const { name, createBy, createTime, url, onInsert, onDownload, onDelete } =
    props;

  return (
    <div className={styles.imageCard}>
      <div className={styles.imageWrapper}>
        <Image
          src={`${url}?x-oss-process=image/resize,m_lfit,w_200,h_200`}
          alt={name}
          className={styles.image}
          preview={{
            mask: (
              <div className={styles.mask}>
                <div
                  className={styles.maskHeader}
                  onClick={e => e.stopPropagation()}
                >
                  <Tooltip title={I18N.components.insertIntoReport}>
                    <div
                      className={styles.maskHeaderIcon}
                      onClick={() => onInsert?.()}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 16 16'
                        fill='none'
                      >
                        <path
                          d='M5.1084 8.75293C5.34323 8.51892 5.7222 8.51892 5.95703 8.75293L8.07715 10.8662C8.13191 10.9208 8.17613 10.9868 8.20703 11.0596C8.23643 11.1309 8.25293 11.2094 8.25293 11.2891C8.25291 11.3688 8.23787 11.4458 8.20703 11.5186C8.17615 11.5913 8.1324 11.6559 8.0791 11.7119L5.95801 13.8252C5.8399 13.9414 5.68644 14 5.5332 14C5.37863 13.9999 5.22504 13.9414 5.1084 13.8252C4.8739 13.5913 4.87398 13.213 5.1084 12.9805L6.20605 11.8877H2.60059C2.26878 11.8877 2.00008 11.6197 2 11.2891C2 10.9584 2.26873 10.6904 2.60059 10.6904H6.20605L5.1084 9.59766C4.87388 9.36375 4.87399 8.9855 5.1084 8.75293ZM11.5996 2C12.9255 2 13.9998 3.07037 14 4.3916V11.5664C14 12.8878 12.9256 13.958 11.5996 13.958H9.19922C8.86756 13.9579 8.59884 13.6908 8.59863 13.3604C8.59863 13.0297 8.86743 12.7618 9.19922 12.7617H11.5996C12.2619 12.7617 12.7988 12.2264 12.7988 11.5664V4.3916C12.7986 3.73177 12.2618 3.19629 11.5996 3.19629H4.40039C3.7382 3.19629 3.20038 3.73177 3.2002 4.3916V6.78418C3.20004 7.11461 2.93216 7.38162 2.60059 7.38184C2.26873 7.38184 2 7.11292 2 6.78223V4.3916C2.00018 3.07037 3.07448 2 4.40039 2H11.5996Z'
                          fill='white'
                        />
                      </svg>
                    </div>
                  </Tooltip>
                  <div className={styles.maskHeaderIconGroup}>
                    <div
                      className={styles.maskHeaderIconGroupItem}
                      onClick={() => saveAs(url, name)}
                    >
                      <DownloadOutlined />
                    </div>
                    <div
                      className={styles.maskHeaderIconGroupItem}
                      onClick={() => onDelete?.()}
                    >
                      <IconAlibaba type='icon-icon_delete' />
                    </div>
                  </div>
                </div>
                {/* <span>预览</span> */}
                <div
                  className={styles.maskFooter}
                  onClick={e => e.stopPropagation()}
                >
                  <TextWidthOverflow value={name} width={134} />
                  <div className={styles.maskFooterInfo}>
                    <div>{createBy}</div>
                    <div>{createTime ? createTime.split('T')[0] : ''}</div>
                  </div>
                </div>
              </div>
            ),
            src: url,
          }}
        />
      </div>
    </div>
  );
};
