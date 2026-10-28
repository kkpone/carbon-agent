/**
 * @file 生成排放报告
 */
import I18N from '@src/lang/I18N';
import { Radio, RadioChangeEvent } from 'antd';
import { useEffect, useState } from 'react';
import { combineClassName, cutFile } from '@utils/index';
import {
  getAllBackgroundImgs,
  getReportCover,
} from '@api/carbon-international';
import {
  BackGroundImg,
  ReportCoverPayload,
} from '@api/carbon-international/types';
import { EmptyLoading } from '@components/EmptyLoading';
import IconFont from '@components/iconfont';
import { Upload } from '@components/Upload';
import { Toast } from '@utils/Toast';
import styles from './reportStep3.module.less';

interface Props {
  commitedMsg: (obj: CommitedMsgProps) => void;
  id: number;
}

export type CommitedMsgProps = CheckedDefaultThumb & {
  hasDefaultCover: boolean;
};

type CheckedDefaultThumb = Omit<
  ReportCoverPayload,
  'id' | 'report_word_cover'
> & {
  report_word_cover: string | File;
};

export const ReportStepsThree = ({ commitedMsg, id }: Props) => {
  // 默认封面
  const baseUri = `${process.env.REACT_APP_API_URL_PYTHON}/api/v1/templates`;
  // 自定义封面
  const userImgUri = `${process.env.REACT_APP_API_URL_PYTHON}/media`;
  const [isLoading, setIsLoading] = useState(true);
  // 默认封面选中项
  const defaultCoverStatus = 2;
  const [checkedDefaultThumb, setCheckedDefaultThumb] =
    useState<CheckedDefaultThumb>({
      report_word_cover_status: defaultCoverStatus,
      report_word_cover: '',
    });
  // 清册
  // const [logo, setLogo] = useState(1);

  // 封面图片
  const [coverFile, setCoverFile] = useState<File>();
  // 后台接口返回的cover
  const [defaultCoverFile, setDefaultCoverFile] = useState('');
  const [coverList, setCoverList] = useState<BackGroundImg[]>();
  const formatFileUrl = (url: string) =>
    url.startsWith('/') ? url.slice(1) : url;
  useEffect(() => {
    Promise.all([getReportCover(id), getAllBackgroundImgs()])
      .then(([cover, allbg]) => {
        let checkedThumb: CheckedDefaultThumb = { ...checkedDefaultThumb };
        // 获取保存的封面
        const reportCover = cover.data.data;
        setIsLoading(false);
        if (reportCover?.report_word_cover_status) {
          const report_word_cover =
            reportCover?.report_word_cover &&
            `${userImgUri}/${formatFileUrl(reportCover.report_word_cover)}`;
          checkedThumb = {
            ...checkedThumb,
            report_word_cover_status:
              reportCover?.report_word_cover_status || defaultCoverStatus,
            default_cover_report_image:
              reportCover?.default_cover_report_image_id,
            report_word_cover,
          };
          setDefaultCoverFile(report_word_cover);
        }
        // 获取所有默认封面
        if (allbg.data?.data.length) {
          const r = allbg.data.data.map(item => ({
            ...item,
            images_url: `${baseUri}/${formatFileUrl(item.images_url)}/`,
          }));
          setCoverList(r);
          if (!checkedThumb.default_cover_report_image) {
            checkedThumb.default_cover_report_image = r[0].id;
          }
        }
        setCheckedDefaultThumb(checkedThumb);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);
  const coverUrl = coverFile
    ? window.URL.createObjectURL(coverFile)
    : (checkedDefaultThumb.report_word_cover as string) || defaultCoverFile;
  // 默认封面变化-》更换 file
  useEffect(() => {
    commitedMsg({ ...checkedDefaultThumb, hasDefaultCover: !!coverUrl });
  }, [checkedDefaultThumb]);

  // eslint-disable-next-line consistent-return
  const onFileUpload = (file: File) => {
    // 限制大小 3M
    if (file?.size && file.size < 1024 * 1024 * 3) {
      cutFile(file, { width: 595, height: 842 })
        .then(file => {
          if (file) {
            setCheckedDefaultThumb({
              ...checkedDefaultThumb,
              report_word_cover: file,
            });
            setCoverFile(file);
          }
        })
        .catch(() => {
          Toast('error', I18N.carbonInternational.imageUploadLoss);
        });
    } else {
      Toast(
        'warn',
        I18N.template(I18N.carbonInternational.filen, { val1: file.name }),
      );

      return false;
    }
  };

  const onChange = (e: RadioChangeEvent) => {
    const index = e.target.value as string | number;
    const checkedThumb = {
      ...checkedDefaultThumb,
      report_word_cover_status: index,
    };

    switch (index) {
      case 1:
        checkedThumb.default_cover_report_image = coverList?.[0].id;
        checkedThumb.report_word_cover = '';
        break;
      case 2:
        checkedThumb.report_word_cover = coverFile || '';
        checkedThumb.default_cover_report_image = undefined;
        break;
      default:
        checkedThumb.report_word_cover = '';
        checkedThumb.default_cover_report_image = undefined;
    }
    setCheckedDefaultThumb(checkedThumb);
  };
  if (isLoading) return <EmptyLoading />;
  const coverIndex = checkedDefaultThumb.report_word_cover_status;

  return (
    <div className={styles.report_steps_three}>
      <div className={styles.topSelect}>
        <p className={styles.cover_title}>
          {I18N.carbonInternational.coverPage}
        </p>
        <Radio.Group
          onChange={onChange}
          value={checkedDefaultThumb.report_word_cover_status}
        >
          <Radio value={1}>{I18N.carbonInternational.useDefaultSealing}</Radio>
          <Radio value={2}>{I18N.carbonInternational.usePersonalSeal}</Radio>
          <Radio value={3}>{I18N.carbonInternational.doNotUseCover}</Radio>
        </Radio.Group>
      </div>
      {/* 默认封面 */}
      {coverIndex === 1 && (
        <div className={styles.defaultThumbList}>
          {coverList?.map(item => (
            <div
              key={item.id}
              className={combineClassName(styles.thumbItem)}
              onClick={() =>
                setCheckedDefaultThumb({
                  ...checkedDefaultThumb,
                  default_cover_report_image: item.id,
                })
              }
            >
              <img
                className={combineClassName(
                  checkedDefaultThumb.default_cover_report_image === item.id
                    ? styles.active
                    : '',
                  styles.thumb,
                )}
                src={item?.images_url}
                alt=''
              />
              <IconFont
                className={styles.checked}
                type={
                  checkedDefaultThumb.default_cover_report_image === item.id
                    ? 'icon-icon-gouxuan'
                    : 'icon-icon-shanxuanweixuanzhong-2'
                }
              />
            </div>
          ))}
        </div>
      )}
      {/* 个人封面 */}
      {coverIndex === 2 && (
        <Upload
          className={styles.uploadCover}
          value={coverUrl}
          onChange={file => onFileUpload(file)}
        />
      )}
    </div>
  );
};
