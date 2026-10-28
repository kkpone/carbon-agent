import { PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useMount, useUnmount } from 'ahooks';
import { App, Button, Input, Select, Spin } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import { useContext, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { streamFetch } from '@/api/streamFetch';
import { LocaleContext } from '@/components/LocaleProvider';
import { checkPermissions } from '@/components/Permission/utils';
import IconFont, { IconAlibabaNew } from '@/components/iconfont';
import { LocaleType } from '@/lang/I18N';
import { RouteMaps } from '@/router/route-paths';
import { Toast, tryParseJSON } from '@/utils';

import QuestionModal from './QuestionModal';
import RoleModal from './RoleModal';
import TopicModal from './TopicModal';
import { IMPORTANCE, IMPORTANCE_LABEL } from './constant';
import styles from './index.module.less';
import {
  editImportanceAnalysisInfo,
  getImportanceAnalysisInfo,
} from './service';
import AnalysisStatusTag from '../ImportanceAnalysis/AnalysisStatusTag';
import { IMPORTANCE_ANALYSIS_STATUS } from '../ImportanceAnalysis/constant';
import { publishImportanceAnalysis } from '../ImportanceAnalysis/service';

const ImportanceAnalysisInfo = () => {
  const abortCtrlRef = useRef<AbortController>();

  const { modal } = App.useApp();

  const generateId = useRef<number>();

  const { locale, changeLocale } = useContext(LocaleContext);

  const { id } = useParams<{ id: string }>();

  const [analysisInfo, setAnalysisInfo] = useState<Record<string, any>>();

  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);

  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);

  const [topicModalOpen, setTopicModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const isAdd = !id;

  const isZh = locale === LocaleType.zhCN;

  const history = useHistory();

  const editPermission = !!checkPermissions(true, 'esg:survey:edit');

  const getInfo = async params => {
    const { isLoading = true, ...restParams } = params;
    try {
      setLoading(isLoading ?? true);
      const { data } = await getImportanceAnalysisInfo({ ...restParams });
      setAnalysisInfo(data.data);
    } finally {
      setLoading(false);
    }
  };

  const getStreamInfo = data => {
    const abortCtrl = new AbortController();
    abortCtrlRef.current?.abort();
    abortCtrlRef.current = abortCtrl;

    let streamText = '';

    setLoading(true);

    streamFetch({
      url: `${process.env.REACT_APP_API_URL}/esg/survey/aiSurveyCreate`,
      data,
      onMessage: (txt: string) => {
        streamText += txt;
        const jsonResp = tryParseJSON(streamText);
        if (jsonResp) {
          setAnalysisInfo(jsonResp);
        }
      },
      abortCtrl,
    })
      .then(({ responseData }) => {
        const analysisId = (responseData as unknown as { id: number }).id;
        generateId.current = analysisId;
        history.replace(
          RouteMaps.ESGImportanceAnalysisInfo.replace(':id', `${analysisId}`),
        );
      })
      .catch(() => {
        Toast('error', I18N.carbonFootPrintLCA.error);
        setLoading(false);
      });
  };

  const updateAnalysisInfo = useMemo(
    () =>
      debounce(async data => {
        await editImportanceAnalysisInfo(data);
        getInfo({ id: id ?? generateId.current, isLoading: false });
      }, 500),
    [id],
  );

  const editAnalysisInfo = data => {
    const editData = { ...data, id: id ?? generateId.current };
    setAnalysisInfo(editData);
    updateAnalysisInfo(editData);
  };

  useMount(() => {
    if (isAdd) {
      const searchParams = new URLSearchParams(window.location.search);
      getStreamInfo({
        companyName: searchParams.get('companyName'),
        year: searchParams.get('year'),
        query: searchParams.get('query'),
      });
    } else {
      getInfo({ id });
    }
  });

  useUnmount(() => {
    abortCtrlRef.current?.abort();
  });
  return (
    <div className={styles.importanceAnalysisInfo}>
      <RoleModal
        open={addRoleModalOpen}
        onCancel={() => setAddRoleModalOpen(false)}
        onConfirm={data => {
          editAnalysisInfo({
            ...analysisInfo,
            roles: [
              ...(analysisInfo?.roles || []),
              { ...data, id: (analysisInfo?.roles || []).length + 1 },
            ],
          });
          setAddRoleModalOpen(false);
        }}
      />
      <QuestionModal
        open={addQuestionModalOpen}
        onCancel={() => setAddQuestionModalOpen(false)}
        onConfirm={question => {
          editAnalysisInfo({
            ...analysisInfo,
            questions: [...(analysisInfo?.questions || []), question],
          });
          setAddQuestionModalOpen(false);
        }}
      />
      <TopicModal
        open={topicModalOpen}
        locale={locale}
        topics={analysisInfo?.topics || []}
        onCancel={() => setTopicModalOpen(false)}
        onConfirm={topics => {
          editAnalysisInfo({
            ...analysisInfo,
            topics,
          });
          setTopicModalOpen(false);
        }}
      />
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div
            className={styles.backBtn}
            onClick={() => history.push(RouteMaps.ESGImportanceAnalysis)}
          >
            <IconFont className={styles.backIcon} type='icon-icon-shangyiye' />
          </div>
          <div
            className={classNames(styles.headerText, styles.analysisName)}
            title={analysisInfo?.[isZh ? 'name' : 'nameEn']}
          >
            {analysisInfo?.[isZh ? 'name' : 'nameEn']}
          </div>
          <div className={styles.split} />
          <div className={styles.headerText}>{analysisInfo?.year}</div>
          <AnalysisStatusTag status={analysisInfo?.status} />
        </div>
        <div
          className={styles.langBtn}
          onClick={() =>
            changeLocale({
              currentLocale:
                locale === LocaleType.zhCN ? LocaleType.enUS : LocaleType.zhCN,
            })
          }
        >
          <IconAlibabaNew
            className={styles.langIcon}
            type={isZh ? 'icon-zhongwen' : 'icon-EN'}
          />
        </div>
      </div>
      <div className={styles.content}>
        <div
          className={styles.questionnaire}
          style={{ width: isZh ? 800 : 1136 }}
        >
          <Spin spinning={loading}>
            {analysisInfo && (
              <div className={styles.questionnaireContent}>
                <div className={styles.basicInfo}>
                  {'name' in analysisInfo && (
                    <div className={styles.basicInfoItem}>
                      <div>
                        {I18N.supplyChainCarbonManagement.questionnaireName2}
                      </div>
                      <Input
                        value={isZh ? analysisInfo.name : analysisInfo.nameEn}
                        onChange={e =>
                          editAnalysisInfo({
                            ...analysisInfo,
                            [isZh ? 'name' : 'nameEn']: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                  {'introduction' in analysisInfo && (
                    <div className={styles.basicInfoItem}>
                      <div>
                        {
                          I18N.supplyChainCarbonManagement
                            .questionnaireDescription
                        }
                      </div>
                      <Input.TextArea
                        maxLength={1000}
                        rows={4}
                        value={
                          analysisInfo[isZh ? 'introduction' : 'introductionEn']
                        }
                        onChange={e =>
                          editAnalysisInfo({
                            ...analysisInfo,
                            [isZh ? 'introduction' : 'introductionEn']:
                              e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                {'roles' in analysisInfo && (
                  <div>
                    <div className={styles.secondaryTitle}>
                      {I18N.carbonFootprint3.basicInformation}
                    </div>
                    <div className={styles.basicInfoItem}>
                      <div className={styles.label}>
                        {I18N.esg.whatIsYourIdentity}
                        <Button
                          className={styles.textBtn}
                          type='link'
                          icon={<PlusOutlined />}
                          onClick={() =>
                            setAddRoleModalOpen(
                              (analysisInfo?.roles || []).length < 20,
                            )
                          }
                        >
                          {I18N.auth.addRole}
                        </Button>
                      </div>
                      <Select
                        mode='multiple'
                        open={false}
                        suffixIcon={null}
                        value={analysisInfo.roles?.map(role => role.id)}
                        options={analysisInfo.roles?.map(role => ({
                          value: role.id,
                          label: role[isZh ? 'role' : 'roleEn'],
                        }))}
                        onChange={val => {
                          editAnalysisInfo({
                            ...analysisInfo,
                            roles: val.map((roleId, index) => ({
                              ...analysisInfo.roles?.find(
                                role => roleId === role.id,
                              ),
                              id: index + 1,
                            })),
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
                {'topics' in analysisInfo && (
                  <div>
                    <div className={styles.secondaryTitle}>
                      {I18N.esg.importanceOfTheTopic}
                      <Button
                        className={styles.textBtn}
                        type='link'
                        icon={<PlusOutlined />}
                        onClick={() => setTopicModalOpen(true)}
                      >
                        {I18N.esg.addATopic}
                      </Button>
                    </div>
                    <div className={styles.topicGroup}>
                      {analysisInfo.topics?.map(topicGroup => (
                        <div
                          className={classNames(styles.topicGroupItem, {
                            [styles.ETopicGroupItem]:
                              topicGroup.moduleType === '1',
                            [styles.STopicGroupItem]:
                              topicGroup.moduleType === '2',
                            [styles.GTopicGroupItem]:
                              topicGroup.moduleType === '3',
                          })}
                        >
                          <div className={styles.topicGroupName}>
                            {topicGroup[isZh ? 'moduleName' : 'moduleNameEn']}
                          </div>
                          {topicGroup.topicList
                            ?.filter(topic => topic.related === 1)
                            ?.map(topic => {
                              const topicName = topic[isZh ? 'name' : 'nameEn'];
                              return (
                                <div className={styles.topicItem}>
                                  <div className={styles.topicInfoItem}>
                                    <div className={styles.topicInfoIntro}>
                                      {topicName}
                                      <Button
                                        className={classNames(
                                          styles.textBtn,
                                          styles.topicDeleteBtn,
                                        )}
                                        type='link'
                                        onClick={() => {
                                          Object.assign(topic, { related: 0 });
                                          editAnalysisInfo({ ...analysisInfo });
                                        }}
                                      >
                                        <IconFont type='icon-icon_delete' />
                                      </Button>
                                    </div>
                                    <Input
                                      value={
                                        topic[isZh ? 'analysis' : 'analysisEn']
                                      }
                                      onChange={e => {
                                        Object.assign(topic, {
                                          [isZh ? 'analysis' : 'analysisEn']:
                                            e.target.value,
                                        });
                                        editAnalysisInfo({ ...analysisInfo });
                                      }}
                                    />
                                  </div>
                                  <div className={styles.topicInfoItem}>
                                    <div className={styles.topicInfoIntro}>
                                      {I18N.esg.importantToTheCompany}
                                      {topicName}
                                      {I18N.esg.forTheCompanysBusiness}
                                    </div>
                                    <div className={styles.importanceTab}>
                                      {Object.values(IMPORTANCE).map(
                                        importance => (
                                          <div
                                            className={classNames(
                                              styles.importanceTabItem,
                                              {
                                                [styles.enImportanceTabItem]:
                                                  !isZh,
                                              },
                                            )}
                                          >
                                            {IMPORTANCE_LABEL(importance)}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                  <div className={styles.topicInfoItem}>
                                    <div className={styles.topicInfoIntro}>
                                      {I18N.esg.regardingStakeholdersInterests}
                                      {topicName}
                                      {I18N.esg.forYou}
                                    </div>
                                    <div className={styles.importanceTab}>
                                      {Object.values(IMPORTANCE).map(
                                        importance => (
                                          <div
                                            className={classNames(
                                              styles.importanceTabItem,
                                              {
                                                [styles.enImportanceTabItem]:
                                                  !isZh,
                                              },
                                            )}
                                          >
                                            {IMPORTANCE_LABEL(importance)}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {'questions' in analysisInfo && (
                  <div>
                    <div className={styles.secondaryTitle}>
                      {I18N.esg.otherIssues}
                      <Button
                        className={styles.textBtn}
                        type='link'
                        icon={<PlusOutlined />}
                        onClick={() => setAddQuestionModalOpen(true)}
                      >
                        {I18N.esg.addQuestion}
                      </Button>
                    </div>
                    <div className={styles.otherQuestionList}>
                      {analysisInfo.questions?.map((question, index) => {
                        const valueKey = isZh ? 'question' : 'questionEn';
                        return (
                          <Input
                            suffix={
                              <Button
                                className={styles.textBtn}
                                type='link'
                                onClick={() => {
                                  analysisInfo.questions.splice(index, 1);
                                  editAnalysisInfo({ ...analysisInfo });
                                }}
                              >
                                <IconFont type='icon-icon_delete' />
                              </Button>
                            }
                            value={question[valueKey]}
                            onChange={e => {
                              Object.assign(question, {
                                [valueKey]: e.target.value,
                              });
                              editAnalysisInfo({ ...analysisInfo });
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Spin>
        </div>
      </div>
      <div className={styles.footer}>
        <Button onClick={() => history.push(RouteMaps.ESGImportanceAnalysis)}>
          {I18N.carbonFootprint.return}
        </Button>
        {editPermission && (
          <Button
            type='primary'
            disabled={
              loading ||
              analysisInfo?.status === IMPORTANCE_ANALYSIS_STATUS.PUBLISHED
            }
            onClick={() => {
              modal.confirm({
                icon: null,
                title: I18N.esg.confirmTheReleaseOfThis,
                content: I18N.esg.modifyAfterPublishing,
                onOk: async () => {
                  await publishImportanceAnalysis(id ?? generateId.current);
                  Toast('success', I18N.cbam.publishedSuccessfully);
                  getInfo({ id: id ?? generateId.current });
                },
              });
            }}
          >
            {I18N.supplyChainCarbonManagement.publishQuestionnaire}
          </Button>
        )}
      </div>
    </div>
  );
};
export default ImportanceAnalysisInfo;
