import { FC, useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';
import I18N from '@src/lang/I18N';
import { CloseOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  Tabs,
  TabsProps,
  Empty,
  Spin,
  message,
  Upload,
} from 'antd';
import { Editor } from '@tiptap/core';
import {
  DataType,
  delDataItem,
  getDatabaseList,
  PostEsgDataUploadImages,
} from './service';
import { useRequest } from 'ahooks';
import { ImagePreviewCard } from './components/ImagePreviewCard';
import { IconAlibaba } from '@/components/iconfont';
import { FileItem } from './components/FileItem';
import { LinkItem } from './components/LinkItem';
import { javaFileUpload } from '@/api/api';
import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';
import emptySvg from '@src/assets/icon/empty.svg';

export interface ILibraryDrawerContentProps {
  open: boolean;
  onClose: () => void;
  editor: Editor;
  reportId: number;
}

const items: TabsProps['items'] = [
  {
    key: '1',
    label: (
      <span className={styles.tabLabel}>{I18N.carbonAccount.picture}</span>
    ),
  },
  {
    key: '2',
    label: <span className={styles.tabLabel}>{I18N.Certification.file}</span>,
  },
  {
    key: '3',
    label: <span className={styles.tabLabel}>{I18N.system.link}</span>,
  },
  {
    key: '4',
    label: (
      <span className={styles.tabLabel}>
        {I18N.productDigitalPassport.text}
      </span>
    ),
  },
];

export const LibraryDrawerContent: FC<ILibraryDrawerContentProps> = props => {
  const { open, onClose, editor, reportId } = props;
  const [activeKey, setActiveKey] = useState<DataType>(DataType.picture);
  const [searchText, setSearchText] = useState('');

  const { data: dataListResult, refresh } = useRequest(
    () => getDatabaseList({ reportId: reportId.toString(), type: activeKey }),
    {
      refreshDeps: [reportId, activeKey],
    },
  );

  const handleDelete = async (id: number) => {
    await delDataItem({ id });
    message.success(I18N.carbonFootprint.deleteSuccessful);
    refresh();
  };

  const [originalDataList, setOriginalDataList] = useState<
    {
      url: string;
      name: string;
      createBy: string;
      createTime: string;
      id: number;
    }[]
  >([]);

  useEffect(() => {
    setOriginalDataList([]);
    setSearchText('');
  }, [activeKey]);

  useEffect(() => {
    setOriginalDataList(
      dataListResult?.data?.data.map(item => ({
        url: item.url,
        name: item.name,
        createBy: item.createBy,
        createTime: item.createTime,
        id: item.id,
      })) || [],
    );
  }, [dataListResult]);

  const DataList = useMemo(() => {
    return originalDataList.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [originalDataList, searchText]);

  // 处理插入图片到编辑器
  const handleInsertImage = (url: string, name: string) => {
    console.log(url, name);
    if (editor) {
      const pos = editor.state.selection.from;
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .insertContentAt(pos, [
          {
            type: 'image',
            attrs: { src: url, alt: 'test', title: 'test' },
          },
        ])
        .run();
      message.success(I18N.components.imageInserted);
    }
  };

  // 处理下载图片
  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(I18N.components.startDownloading2);
  };

  return (
    <div className={styles.libraryDrawerContent}>
      <div className={styles.header}>
        <div className={styles.title}>{I18N.components.database2}</div>
        <div className={styles.headerRight}>
          <div className={styles.close} onClick={() => onClose()}>
            <CloseOutlined />
          </div>
        </div>
      </div>
      <Tabs
        activeKey={activeKey.toString()}
        items={items}
        onChange={key => setActiveKey(key as any as DataType)}
      />
      {activeKey === DataType.picture.toString() && (
        <div className={styles.imageList}>
          <div className={styles.imageHeader}>
            <Input
              placeholder={I18N.components.searchForImageName}
              prefix={<SearchOutlined />}
              className={styles.searchInput}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
            <Upload
              accept='.jpg,.jpeg,.png,.webp'
              customRequest={({ onError, onSuccess, file }) => {
                // const uploadApi = useMoreType ? javaFileUploadMore : javaFileUpload;
                javaFileUpload(file as File)
                  .then(async ({ data }) => {
                    // uploadSuccess?.(data);
                    onSuccess?.({ ...data });
                    console.log(data);
                    await PostEsgDataUploadImages({
                      reportId,
                      imgUrl: data.data.url,
                      imgName: data.data.name,
                    });
                    refresh();
                  })
                  .catch(() => {
                    onError?.({ name: 'error', message: 'error', status: 500 });
                  });
              }}
              beforeUpload={file => {
                // if (onFileCountChange?.(file)) {
                //   return Upload.LIST_IGNORE;
                // }
                if (file.size > 50 * 1024 * 1024) {
                  Toast('error', I18N.carbonFootprint.theFileIsTooLarge);
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
              itemRender={(node, f, files, action) => {
                // if (f?.error) {
                //   action.remove();
                //   return null;
                // }

                return null;
              }}
            >
              <Button
                type='default'
                icon={<IconAlibaba type='icon-icon_upload' />}
              >
                {I18N.carbonFootprint.uploadImages}
              </Button>
            </Upload>
          </div>

          <Spin spinning={false}>
            <div className={styles.imageGrid}>
              {DataList &&
                DataList.length > 0 &&
                DataList.map((image, index) => (
                  <ImagePreviewCard
                    key={`${image.url}-${index}`}
                    name={image.name}
                    createBy={image.createBy}
                    createTime={image.createTime}
                    url={image.url}
                    onInsert={() => handleInsertImage(image.url, image.name)}
                    onDownload={() => handleDownload(image.url, image.name)}
                    onDelete={() => handleDelete(image.id)}
                  />
                ))}
            </div>
            {DataList && DataList.length === 0 && (
              <Empty
                description={I18N.components.noImageAvailable}
                image={emptySvg}
              />
            )}
          </Spin>
        </div>
      )}
      {activeKey === DataType.file.toString() && (
        <div className={styles.imageList}>
          <div className={styles.imageHeader}>
            <Input
              placeholder={I18N.components.searchForFileName}
              prefix={<SearchOutlined />}
              className={styles.searchInput}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </div>

          <Spin spinning={false}>
            <div className={styles.fileList}>
              {DataList.length > 0 ? (
                DataList.map((image, index) => (
                  <FileItem
                    canDownload
                    key={`${image.url}-${index}`}
                    name={image.name}
                    createBy={image.createBy}
                    createTime={image.createTime}
                    url={image.url}
                    onInsert={() => handleInsertImage(image.url, image.name)}
                    onDownload={() => handleDownload(image.url, image.name)}
                    onDelete={() => handleDelete(image.id)}
                  />
                ))
              ) : (
                <Empty
                  description={
                    I18N.Certification.thereAreCurrentlyNoFilesAvailable
                  }
                  image={emptySvg}
                />
              )}
            </div>
          </Spin>
        </div>
      )}
      {activeKey === DataType.link.toString() && (
        <div className={styles.imageList}>
          <div className={styles.imageHeader}>
            <Input
              placeholder={I18N.components.searchLinkName}
              prefix={<SearchOutlined />}
              className={styles.searchInput}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </div>

          <Spin spinning={false}>
            <div className={styles.fileList}>
              {DataList.length > 0 ? (
                DataList.map((image, index) => (
                  <LinkItem
                    key={`${image.url}-${index}`}
                    name={image.name}
                    createBy={image.createBy}
                    createTime={image.createTime}
                    url={image.url}
                    onInsert={() => handleInsertImage(image.url, image.name)}
                    onDownload={() => handleDownload(image.url, image.name)}
                    onDelete={() => handleDelete(image.id)}
                  />
                ))
              ) : (
                <Empty
                  description={I18N.components.noLinkAvailableAtTheMoment}
                  image={emptySvg}
                />
              )}
            </div>
          </Spin>
        </div>
      )}
      {activeKey === DataType.text.toString() && (
        <div className={styles.imageList}>
          <div className={styles.imageHeader}>
            <Input
              placeholder={I18N.components.searchText}
              prefix={<SearchOutlined />}
              className={styles.searchInput}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </div>

          <Spin spinning={false}>
            <div className={styles.fileList}>
              {DataList.length > 0 ? (
                DataList.map((image, index) => (
                  <FileItem
                    hiddenIcon
                    key={`${image.url}-${index}`}
                    name={image.name}
                    createBy={image.createBy}
                    createTime={image.createTime}
                    url={image.url}
                    onInsert={() => handleInsertImage(image.url, image.name)}
                    onDownload={() => handleDownload(image.url, image.name)}
                    onDelete={() => handleDelete(image.id)}
                  />
                ))
              ) : (
                <Empty
                  description={I18N.components.noTextAvailableAtTheMoment}
                  image={emptySvg}
                />
              )}
            </div>
          </Spin>
        </div>
      )}
    </div>
  );
};
