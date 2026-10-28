import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Select,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { toJS } from '@formily/reactive';
import I18N, { LocaleType } from '@src/lang/I18N';
import { useQuery } from '@tanstack/react-query';
import { Image, Modal, Tooltip, Upload, UploadFile } from 'antd';
import classNames from 'classnames';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import FormilyCommon from '@/components/FormilyUtil/FormilyCommon';
import { LocaleContext } from '@/components/LocaleProvider';
import { IconAlibaba, IconAlibabaNew } from '@/components/iconfont';
import useFieldFlattenUnitDictSource from '@/hooks/useFieldFlattenUnitDataSource';
import { RouteMaps } from '@/router/route-paths';
import { RootState } from '@/store';
import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';

import styles from './index.module.less';
import { schema } from './schema';
import uploadIconSvg from './uploadIcon.svg';
import {
  createReportFromWord,
  getReportYears,
  normalizeReportYears,
} from '../../service';

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    FormLayout,
    FormItem,
    Input,
    Select,
  },
});

export interface IScoreModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  refresh: () => void;
}

const FILE_TYPE = [
  // '.png',
  // '.PNG',
  // '.jpg',
  // '.JPG',
  // '.JPEG',
  // '.jpeg',
  // '.xlsx',
  // '.XLSX',
  // '.XLS',
  // '.xls',
  '.doc',
  '.DOC',
  '.docx',
  '.DOCX',
  // '.pdf',
  // '.PDF',
  // '.rar',
  // '.RAR',
  // '.zip',
  // '.ZIP',
];

const uploadFileRender = (uploadFile: UploadFile, remove: () => void) => {
  const { status, name } = uploadFile;

  return (
    <Tooltip
      overlay={
        status === 'error' ? I18N.enterpriseCarbonAccount2.uploadError : null
      }
    >
      <div className={styles.uploadFile}>
        <div className={styles.uploadFileLeft}>
          {status === 'done' && <img alt='' src='' />}
          {status === 'uploading' && (
            <LoadingOutlined className={styles.uploadingIcon} />
          )}
          {status === 'error' && (
            <ExclamationCircleOutlined className={styles.errorIcon} />
          )}
          <IconAlibabaNew type='icon-icon-word1' />
          <span
            className={classNames(styles.fileName, {
              [styles.errorFileName]: status === 'error',
            })}
            title={name}
          >
            {name}
          </span>
        </div>
        <IconAlibaba
          className={styles.fileDeleteIcon}
          type='icon-icon_delete'
          onClick={remove}
        />
      </div>
    </Tooltip>
  );
};

export const ScoreModal: FC<IScoreModalProps> = props => {
  const { visible, setVisible, refresh } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const Form = useMemo(
    () =>
      createForm<{
        year: string;
        reportVersion: string;
        corporateName: string;
        business: string;
      }>({
        initialValues: {
          reportVersion: '1',
        },
      }),
    [schema],
  );

  const user = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );

  const companyName = user?.userInfo?.companyName;

  const { data: reportYears } = useQuery(
    ['cdpScoreRuleYears'],
    getReportYears,
    {
      refetchOnWindowFocus: false,
    },
  );

  const yearList = useMemo(
    () => normalizeReportYears(reportYears),
    [reportYears],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    Form.setFieldState('year', state => {
      state.dataSource = yearList.map(year => ({
        label: year,
        value: year,
      }));
    });
    if (yearList.length && !yearList.includes(Form.values.year)) {
      Form.setValuesIn('year', yearList[0]);
    }
  }, [Form, visible, yearList]);

  useEffect(() => {
    Form.setFieldState('corporateName', state => {
      state.initialValue = companyName;
    });
  }, [companyName]);

  const [confirmLoading, setConfirmLoading] = useState(false);

  const history = useHistory();

  const onOk = async () => {
    await Form.validate();
    if (!fileList[0]?.response?.data) {
      Toast('error', I18N.enterpriseCarbonAccount2.pleaseUploadTheFile);
      return;
    }
    setConfirmLoading(true);
    const result = await createReportFromWord({
      ...toJS(Form.values),
      url: fileList[0].response.data || '',
    }).finally(() => {
      setConfirmLoading(false);
    });
    Form.reset();
    setFileList([]);
    refresh();
    setVisible(false);
    history.push(
      `${RouteMaps.enterpriseCarbonAccountingCdpAiReportScore}?id=${result.data.data.id}`,
    );
  };

  const { locale } = useContext(LocaleContext);

  const isEn = locale === LocaleType.enUS;

  return (
    <Modal
      destroyOnClose
      closable
      onClose={() => setVisible(false)}
      onCancel={() => setVisible(false)}
      open={visible}
      confirmLoading={confirmLoading}
      // footer={null}
      okText={I18N.enterpriseCarbonAccount2.startRating}
      width={1050}
      styles={{
        body: {
          padding: 0,
        },
      }}
      centered
      onOk={() => onOk()}
      title={I18N.enterpriseCarbonAccount2.questionnaireUpload}
    >
      <Upload.Dragger
        className={styles.upload}
        name='file'
        accept={FILE_TYPE.join(',')}
        // multiple
        disabled={fileList.length >= 1}
        action={`${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`}
        fileList={fileList}
        onRemove={() => {}}
        itemRender={(_, uploadFile, fileList, { remove }) =>
          uploadFileRender(uploadFile, remove)
        }
        // showUploadList={false}
        beforeUpload={uploadFile => {
          if (uploadFile.size > 10 * 1024 * 1024) {
            Toast('error', I18N.enterpriseCarbonAccount2.fileMaximumNot2);
            return false;
          }
          return true;
        }}
        onChange={async ({ fileList: changeFiles }) => {
          setFileList(changeFiles);
        }}
      >
        <img alt='' src={uploadIconSvg} />
        <div className={styles.uploadText}>
          <span>{I18N.enterpriseCarbonAccount2.directlyTransferTheCd}</span>
          <span className={styles.uploadClickText}>
            {I18N.components.clickToUpload}
          </span>
        </div>
        <div className={styles.uploadTip}>
          {I18N.enterpriseCarbonAccount2.pleaseUploadTheOfficial}
        </div>
      </Upload.Dragger>
      <FormilyCommon form={Form} className={styles.formCommon}>
        <SchemaField
          scope={{ useFieldFlattenUnitDictSource }}
          schema={schema}
        />
      </FormilyCommon>
      <div className={styles.tour}>
        <div className={styles.title}>
          {I18N.enterpriseCarbonAccount2.uploadGuidance}
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div>{I18N.enterpriseCarbonAccount2.stepOfficer}</div>
            <div>
              {I18N.enterpriseCarbonAccount2.enterCdp}
              <a
                href='https://myportal.cdp.net/'
                target='_blank'
                rel='noreferrer'
              >
                {I18N.enterpriseCarbonAccount2.officialWebsiteQuestionnaireLink}
              </a>
            </div>
            <div className={styles.img}>
              <Image
                height={136}
                width={315}
                src={`${process.env.REACT_APP_API_URL_OSS}/saas/cdp/${
                  isEn ? 'reportStep1En.png' : 'reportStep1.png'
                }`}
              />
            </div>
          </div>
          <div className={styles.step}>
            <div>{I18N.enterpriseCarbonAccount2.stepDown}</div>
            <div>{I18N.enterpriseCarbonAccount2.fillInAsRequired}</div>
            <div className={styles.img}>
              <Image
                height={138}
                width={315}
                src={`${process.env.REACT_APP_API_URL_OSS}/saas/cdp/${
                  isEn ? 'reportStep2En.png' : 'reportStep2.png'
                }`}
              />
            </div>
          </div>
          <div className={styles.step}>
            <div>{I18N.enterpriseCarbonAccount2.stepUp}</div>
            <div>{I18N.enterpriseCarbonAccount2.dragAndDropAbove}</div>
            <div className={styles.img}>
              <Image
                height={138}
                width={315}
                src={`${process.env.REACT_APP_API_URL_OSS}/saas/cdp/${
                  isEn ? 'reportStep3En.png' : 'reportStep3.png'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
