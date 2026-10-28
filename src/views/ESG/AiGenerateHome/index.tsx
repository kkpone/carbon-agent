/* eslint-disable react/no-unstable-nested-components */
import upArrowSvg from '@src/assets/icon/esg/upArrow.svg';
import I18N from '@src/lang/I18N';
import { useMount, useRequest } from 'ahooks';
import {
  Dropdown,
  Input,
  Select,
  Space,
  Spin,
  Tooltip,
  UploadFile,
} from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { AppendixFile } from '@/components/Appendix/File';
import { AppendixLink } from '@/components/Appendix/Link';
import { AppendixItem, AppendixList } from '@/components/Appendix/ShowList';
import { AppendixText } from '@/components/Appendix/Text';
import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibaba } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import { getYear, uuid } from '@/utils';
import { useFrameOrgTreeData } from '@/views/dashborad/organization/components/hooks';

import { UploadData } from './components/UploadData';
import uploadIconSvg from './components/UploadData/uploadIcon.svg';
import styles from './index.module.less';
import { getReportList, postCreateReport } from './service';
import { getTaskPeriodList } from '../FillManagement/service';
import { getFrameList } from '../components/IndicatorSystemModal/service';
import { ReportCard } from '../components/ReportCard';
import { IndicatorSystem } from '../type';

export interface IAiGenerateHomeProps {}

export const AiGenerateHome: FC<IAiGenerateHomeProps> = () => {
  const [appendix, setAppendix] = useState<AppendixItem[]>([]);

  const taskPeriodListRef = useRef<IndicatorSystem[]>([]);

  const [orgId, setOrgId] = useState<number[]>([]);
  // const [selectedOptions, setSelectedOptions] = useState<
  //   { name: string; code: number }[]
  // >([]);
  const [year, setYear] = useState<number>(new Date().getFullYear() - 1);

  const [treeData] = useFrameOrgTreeData();

  const [indicatorOptions, setIndicatorOptions] = useState<
    { label: string; value: string; type: string }[]
  >([]);
  const [indicatorValue, setIndicatorValue] = useState<number | string>();
  const [standards, setStandards] = useState<number[]>([]);
  const [orgName, setOrgName] = useState<string>('');

  // 继续添加的其他要求
  const [userContent, setUserContent] = useState<string>('');

  // console.log(indicatorValue);
  // console.log();
  const indicator = indicatorOptions.filter(
    Option => Option.value === indicatorValue,
  );

  const { data } = useRequest(getFrameList);

  const { data: reportListData, run, loading } = useRequest(getReportList);

  const reportList = reportListData?.data.rows || [];

  // const fileAppendixLength = useMemo(
  //   () => appendix.filter(item => item.type === 'file').length,
  //   [appendix],
  // );

  const standardOptions = data?.data.rows || [];

  useEffect(() => {
    if (orgId.length === 0 && treeData?.length > 0) {
      setOrgId([treeData[0].id]);
      setOrgName(treeData[0].name);
      // setSelectedOptions([{ name: treeData[0].name, code: treeData[0].code }]);
    }
  }, [treeData]);

  const history = useHistory();

  const [createLoading, setCreateLoading] = useState(false);

  const indicatorType = useMemo(() => {
    if (indicator.length === 0) {
      return 0;
    }
    if (indicator[0].type === 'uploadFile') {
      return 1;
    }
    return 0;
  }, [indicator]);

  const createReport = async () => {
    setCreateLoading(true);
    const result = await postCreateReport({
      orgId: Number(orgId[orgId.length - 1]),
      orgName,
      userContent,
      period: year.toString(),
      indicatorType,
      standardIds: standards.join(','),
      referFiles: appendix
        .filter(item => item.type === 'file')
        .map(item => ({
          name: item.value.showName,
          url: item.value.fileUrl || '',
        })),
      referLink: appendix
        .filter(item => item.type === 'link')
        .map(item => item.value.showName),
      referText: appendix
        .filter(item => item.type === 'text')
        .map(item => item.value.showName),
      indicatorFiles:
        indicatorType === 0
          ? undefined
          : {
              name: indicator[0].label,
              url: indicator[0].value,
            },
      frameId: indicatorType === 0 ? indicator[0]?.value : undefined,
    }).finally(() => {
      setCreateLoading(false);
    });

    history.push(`${RouteMaps.ESGAiGenerateOutline}?id=${result.data.data}`);
  };

  const enable =
    !!orgId.length &&
    !!year &&
    !!standards.length &&
    !!orgName.length &&
    checkPermissions(true, 'esg:frameReport:add');

  const [UploadDataOpen, setUploadDataOpen] = useState(false);

  const appendixFileRef = useRef<{ delFile: (uid: string) => void }>(null);

  const UploadDataOk = (file: UploadFile) => {
    setIndicatorOptions(pre => [
      ...pre,
      {
        label: file.name,
        value: file.response.data,
        type: 'uploadFile',
      },
    ]);
    setIndicatorValue(file.response.data);
    setUploadDataOpen(false);
  };

  const onYearChange = (yearVal: number) => {
    setYear(yearVal);

    if (indicator[0] && indicator[0].type !== 'uploadFile') {
      setIndicatorValue(undefined);
    }

    const matchedTask = taskPeriodListRef.current.find(
      taskPeriod => yearVal === Number(taskPeriod.period),
    );

    const newIndicatorOptions = indicatorOptions.filter(
      opt => opt.type === 'uploadFile',
    );

    if (matchedTask) {
      newIndicatorOptions.unshift({
        value: matchedTask.id,
        label: matchedTask.name,
      });
    }
    setIndicatorOptions(newIndicatorOptions);
  };

  useMount(async () => {
    const urlSearchParams = new URLSearchParams(location.search);
    const taskId = urlSearchParams.get('taskId');
    const resp = await getTaskPeriodList();
    const taskList = resp.data.data || [];
    taskPeriodListRef.current = taskList;
    const matchedTask = taskList.find(
      taskPeriod => taskPeriod.id === Number(taskId),
    );

    if (matchedTask) {
      setYear(Number(matchedTask.period));
      setIndicatorOptions([{ value: matchedTask.id, label: matchedTask.name }]);
      setIndicatorValue(matchedTask.id);
    }
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.body}>
          <div className={styles.footer}>
            <div className={styles.footerTitle}>
              {I18N.esg.aiIntelligentAssistant}
            </div>
            {/* <div className={styles.subTitle}>
              {I18N.esg.pleaseProvideADescription}
            </div> */}
            <div className={styles.inputWrapper}>
              <div className={styles.input}>
                <span>{I18N.esg.iWantTo}</span>
                <span className={styles.CascaderWrapper}>
                  <Input
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                  />
                </span>
                <span>{I18N.esg.generateACopy}</span>
                <div className={styles.selectWrapper}>
                  <Select
                    defaultValue={new Date().getFullYear() - 1}
                    onChange={onYearChange}
                    value={year}
                    suffixIcon={null}
                    dropdownStyle={{ width: 80 }}
                    variant='borderless'
                    options={getYear(1990, new Date().getFullYear()).map(
                      year => ({
                        value: year,
                        label: year.toString(),
                      }),
                    )}
                  />
                </div>
                <span>{I18N.esg.esgReport2}</span>
                <div className={styles.selectWrapper}>
                  <Select
                    onChange={value => setStandards(value)}
                    value={standards}
                    suffixIcon={null}
                    mode='multiple'
                    placeholder={I18N.esg.pleaseSelectReference}
                    style={{
                      minWidth: 140,
                      padding: '0 6px',
                    }}
                    dropdownStyle={{ width: 180 }}
                    variant='borderless'
                    tagRender={props => (
                      <span
                        style={{
                          cursor: 'pointer',
                        }}
                      >
                        {props.label}
                        {props.value === standards[standards.length - 1]
                          ? ''
                          : '、'}
                      </span>
                    )}
                    optionRender={option => (
                      <Space>
                        <span role='img' aria-label={option.data.name}>
                          <img
                            style={{
                              height: 12,
                            }}
                            src={option.data.lgList[0].url}
                            alt=''
                          />
                        </span>
                        {option.data.name}
                      </Space>
                    )}
                    options={standardOptions}
                    fieldNames={{
                      label: 'name',
                      value: 'id',
                    }}
                  />
                </div>
                <span>{I18N.esg.disclosureFramework}</span>
                <span className={styles.gray}>
                  {I18N.esg.ifThereAreIndicators}
                </span>
                <div
                  className={classNames(
                    styles.selectWrapper,
                    styles.indicatorSelectWrapper,
                  )}
                >
                  {!!indicatorOptions.length && (
                    <Select
                      onChange={value => setIndicatorValue(value)}
                      value={indicatorValue}
                      suffixIcon={null}
                      placeholder={I18N.esg.pleaseUploadTheIndicators}
                      dropdownStyle={{ width: 180 }}
                      variant='borderless'
                      options={indicatorOptions}
                      dropdownRender={menu => (
                        <div>
                          {menu}
                          <div
                            style={{
                              cursor: 'pointer',
                              padding: '4px 8px',
                              height: '32px',
                            }}
                            onClick={() => setUploadDataOpen(true)}
                          >
                            <img
                              style={{
                                width: '16px',
                                height: '16px',
                              }}
                              src={uploadIconSvg}
                              alt=''
                            />
                            {I18N.esg.numberOfUploadedIndicators}
                          </div>
                        </div>
                      )}
                    />
                  )}
                  {!indicatorOptions.length && (
                    <div
                      className={styles.uploadBtn}
                      onClick={() => setUploadDataOpen(true)}
                    >
                      {I18N.esg.pleaseUploadTheIndicators}
                    </div>
                  )}
                  <UploadData
                    open={UploadDataOpen}
                    onOK={UploadDataOk}
                    onClose={() => setUploadDataOpen(false)}
                  />
                </div>
                <div
                  className={classNames(
                    styles.CascaderWrapper,
                    styles.userContentWrapper,
                  )}
                >
                  <Input.TextArea
                    // type='text'
                    maxLength={2000}
                    style={{ width: '720px' }}
                    placeholder={I18N.esg.continueAddingIt}
                    value={userContent}
                    autoSize={{ minRows: 1, maxRows: 8 }}
                    onChange={e => setUserContent(e.target.value)}
                  />
                </div>
                {/* <span>{I18N.esg.generateCompliance}</span>
               
                <span>{I18N.esg.reportOf}</span> */}
              </div>
              <div className={styles.bottom}>
                <AppendixList
                  items={appendix}
                  canDelete
                  del={uuid => {
                    const item = appendix.find(item => item.uuid === uuid);
                    if (item?.type === 'file') {
                      appendixFileRef.current?.delFile(item.fileUid || '');
                    }
                    setAppendix(prev =>
                      prev.filter(item => item.uuid !== uuid),
                    );
                  }}
                />
                <div className={styles.appendixWrapper}>
                  <Dropdown
                    trigger={['click']}
                    disabled={appendix.length >= 10}
                    menu={{
                      items: [
                        {
                          key: '1',
                          label: (
                            <AppendixFile
                              ref={appendixFileRef}
                              maxCount={10 - appendix.length}
                              submit={(
                                value: {
                                  showName: string;
                                  fileSize: string;
                                  fileUrl: string;
                                  fileUid: string;
                                  status?: string;
                                }[],
                              ) => {
                                setAppendix(prev => {
                                  // 创建一个 uid 到 value 的映射
                                  const valueMap = new Map(
                                    value.map(item => [item.fileUid, item]),
                                  );

                                  // 存储新增的项
                                  const newItems: any[] = [];

                                  // 更新已有项，保持原顺序
                                  const updatedPrev = prev.map(existingItem => {
                                    if (
                                      existingItem.fileUid &&
                                      valueMap.has(existingItem.fileUid)
                                    ) {
                                      const item = valueMap.get(
                                        existingItem.fileUid,
                                      )!;
                                      valueMap.delete(existingItem.fileUid); // 标记为已处理
                                      return {
                                        ...existingItem,
                                        value: {
                                          showName: item.showName,
                                          fileSize: item.fileSize,
                                          fileUrl: item.fileUrl,
                                          status: item.status,
                                        },
                                      };
                                    }
                                    return existingItem;
                                  });

                                  // 将未处理的新项添加到末尾
                                  valueMap.forEach(item => {
                                    // if (key !== lastFileUid) {
                                    //   return;
                                    // }
                                    newItems.push({
                                      value: {
                                        showName: item.showName,
                                        fileSize: item.fileSize,
                                        fileUrl: item.fileUrl,
                                        status: item.status,
                                      },
                                      type: 'file',
                                      fileUid: item.fileUid,
                                      uuid: uuid(),
                                    });
                                  });

                                  return [...updatedPrev, ...newItems];
                                });
                              }}
                            />
                          ),
                        },
                        {
                          key: '2',
                          label: (
                            <AppendixLink
                              submit={(value: string) => {
                                setAppendix(prev => [
                                  ...prev,
                                  {
                                    value: {
                                      showName: value,
                                    },
                                    type: 'link',
                                    uuid: uuid(),
                                  },
                                ]);
                              }}
                            />
                          ),
                        },
                        {
                          key: '3',
                          label: (
                            <AppendixText
                              submit={(value: string) => {
                                setAppendix(prev => [
                                  ...prev,
                                  {
                                    value: {
                                      showName: value,
                                    },
                                    type: 'text',
                                    uuid: uuid(),
                                  },
                                ]);
                              }}
                            />
                          ),
                        },
                      ],
                    }}
                  >
                    <Tooltip title={I18N.esg.otherCanBeAdded}>
                      <Space>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='14'
                          height='14'
                          viewBox='0 0 14 14'
                          fill='none'
                        >
                          <path
                            d='M3.53809 7.04297C3.67073 6.85086 3.93398 6.80329 4.12598 6.93457C4.31888 7.06681 4.36681 7.33065 4.23438 7.52246L3.09668 9.16406C2.79671 9.59809 2.68417 10.1222 2.7793 10.6396C2.87451 11.157 3.16614 11.6073 3.60156 11.9062C3.94417 12.1416 4.33501 12.2539 4.72363 12.2539C5.35335 12.2539 5.97259 11.9564 6.35645 11.4033L7.49316 9.76172C7.62579 9.56964 7.88907 9.52213 8.08105 9.65332C8.27396 9.78556 8.32189 10.0494 8.18945 10.2412L7.05176 11.8828C6.62276 12.5008 5.97871 12.9179 5.23633 13.0527C5.06368 13.0842 4.8904 13.0996 4.71973 13.0996C4.15156 13.0995 3.59834 12.9282 3.12207 12.6006H3.12109C2.50119 12.1733 2.08273 11.5317 1.94727 10.792L1.91016 10.5137C1.85544 9.8663 2.02588 9.22559 2.40137 8.68457L3.53809 7.04297ZM8.76465 0.947266C9.5056 0.811343 10.2564 0.972053 10.8779 1.39941H10.8789C11.4988 1.82674 11.9173 2.46824 12.0527 3.20801C12.1722 3.85554 12.0637 4.51029 11.7471 5.07812L11.5986 5.31543L10.4619 6.95703C10.3802 7.07531 10.2472 7.13965 10.1133 7.13965C10.0299 7.13956 9.94712 7.11452 9.87402 7.06445C9.68112 6.93221 9.63319 6.66935 9.76562 6.47754L10.9033 4.83594L11.0088 4.66406C11.4904 3.78976 11.2397 2.67193 10.3984 2.09375C9.50056 1.47574 8.2635 1.70222 7.64453 2.59668L6.50781 4.23828C6.37507 4.43053 6.11195 4.47733 5.91992 4.3457C5.72702 4.21346 5.67908 3.9506 5.81152 3.75879L6.94922 2.11719C7.37822 1.49907 8.02219 1.08211 8.76465 0.947266Z'
                            fill='#002A23'
                            stroke='#002A23'
                            strokeWidth='0.2'
                          />
                          <path
                            d='M8.0249 4.56787C8.15913 4.43448 8.36142 4.39344 8.5376 4.46436L8.62354 4.50928C8.84136 4.65449 8.90251 4.94869 8.75732 5.16846H8.75635L6.48486 8.59424C6.39415 8.73359 6.24143 8.80703 6.08838 8.80713C5.99813 8.80713 5.90649 8.78125 5.82568 8.72803H5.82471C5.60683 8.58276 5.54653 8.28863 5.69189 8.06885L7.96436 4.64209L8.0249 4.56787Z'
                            fill='#002A23'
                            stroke='#002A23'
                            strokeWidth='0.2'
                          />
                        </svg>
                        {I18N.components.addAttachment}
                      </Space>
                    </Tooltip>
                  </Dropdown>
                  <Spin spinning={createLoading}>
                    <div
                      className={classNames(styles.send, {
                        [styles.enable]: enable,
                      })}
                      onClick={() => {
                        if (!enable) {
                          return;
                        }
                        createReport();
                      }}
                    >
                      <img src={upArrowSvg} alt='' />
                    </div>
                  </Spin>
                </div>
              </div>
            </div>
          </div>
          <Spin spinning={loading}>
            <div className={styles.history}>
              <div className={styles.historyTitle}>
                <div className={styles.bold}>{I18N.esg.recordLast}</div>
                {reportList.length > 4 && (
                  <div
                    className={styles.more}
                    onClick={() => history.push(RouteMaps.ESGAiGenerateList)}
                  >
                    {`${I18N.components.viewMore} `}
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='6'
                      height='9'
                      viewBox='0 0 6 9'
                      fill='none'
                    >
                      <path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M0.449002 8.75C0.547589 8.75 0.647204 8.71351 0.730387 8.64053L5.08261 4.75314C5.18838 4.6585 5.25 4.51596 5.25 4.36429C5.25 4.21377 5.18838 4.07009 5.08261 3.97658L0.748872 0.109721C0.555805 -0.0624688 0.273393 -0.0282588 0.118324 0.186123C-0.036746 0.400505 -0.00593755 0.714096 0.187129 0.886286L4.08544 4.36543L0.167618 7.86396C-0.0254492 8.03615 -0.0562577 8.34974 0.0988119 8.56413C0.188157 8.68614 0.317552 8.75 0.449002 8.75Z'
                        fill='#999EA4'
                      />
                    </svg>
                  </div>
                )}
              </div>
              {reportList.length === 0 && (
                <div className={styles.empty}>
                  <IconAlibaba type='icon-zanwushuju' />
                  <span>
                    {I18N.esg.noHistoricalRecordsAvailableAtTheMoment}
                  </span>
                </div>
              )}
              {reportList.length > 0 && (
                <div className={styles.cardWrapper}>
                  {reportList.slice(0, 4).map(report => (
                    <ReportCard report={report} run={run} />
                  ))}
                </div>
              )}
            </div>
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default AiGenerateHome;
