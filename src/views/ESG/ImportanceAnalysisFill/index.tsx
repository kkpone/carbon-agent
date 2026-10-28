/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import I18N, { serviceLangMap } from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Spin, Select, Input, Button } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { FC, useContext, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { FullscreenModal } from '@/components/FullscreenModal';
import { LocaleContext } from '@/components/LocaleProvider';
import { IconAlibabaNew } from '@/components/iconfont';
import { LocaleType } from '@/lang/I18N';
import { generateUUID, Toast } from '@/utils';

import styles from './index.module.less';
import { submitImportanceAnalysis } from './service';
import {
  IMPORTANCE,
  IMPORTANCE_LABEL,
} from '../ImportanceAnalysisInfo/constant';
import { getImportanceAnalysisInfo } from '../ImportanceAnalysisInfo/service';

const ImportanceAnalysisFill: FC = () => {
  const { id } = useParams<{ id: string }>();

  const [analysisInfo, setAnalysisInfo] = useState<Record<string, any>>();

  const [answer, setAnswer] = useState<Record<string, any>>({});

  const [loading, setLoading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const { locale, changeLocale } = useContext(LocaleContext);

  const [submitted, setSubmitted] = useState(false);

  const timeRef = useRef(0);

  const isZh = locale === LocaleType.zhCN;

  const submit = async () => {
    try {
      setSubmitLoading(true);
      if (isNil(answer.roleId)) {
        Toast('error', I18N.esg.pleaseSelectYour);
        return;
      }
      if (
        answer.topics?.some(
          topic => isNil(topic.companyResult) || isNil(topic.selfResult),
        )
      ) {
        Toast('error', I18N.esg.pleaseChooseATopic);
        return;
      }

      await submitImportanceAnalysis({
        ...answer,
        useTime: Number(((Date.now() - timeRef.current) / 1000).toFixed(0)),
        lang: serviceLangMap[locale],
      });
      setSubmitted(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  useMount(() => {
    timeRef.current = Date.now();

    if (id) {
      setLoading(true);
      getImportanceAnalysisInfo({ id: Number(id) })
        .then(async ({ data }) => {
          const questionnaireInfo = data.data;

          const userId = await generateUUID();
          setAnswer({
            surveyId: questionnaireInfo.id,
            userId,
            roleId: null,
            topics: questionnaireInfo.topics?.reduce(
              (prev, topicGroup) => [
                ...prev,
                ...(topicGroup.topicList || [])
                  .filter(topic => topic.related === 1)
                  .map(topic => ({
                    topicId: topic.topicId,
                    companyResult: null,
                    selfResult: null,
                  })),
              ],
              [],
            ),
            questions: questionnaireInfo.questions?.map(question => ({
              id: question.id,
              answer: null,
            })),
          });
          setAnalysisInfo(questionnaireInfo);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  });

  if (submitted) {
    return (
      <FullscreenModal>
        <div className={styles.importanceAnalysisFill}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>{I18N.esg.esgIsImportant2}</div>
          </div>
          <div className={styles.content}>
            <div className={styles.submittedContent}>
              <IconAlibabaNew
                className={styles.submittedIcon}
                type='icon-sucesse'
              />
              <div className={styles.submittedText}>
                {I18N.esg.theQuestionnaireHasBeenSubmitted}
              </div>
            </div>
          </div>
        </div>
      </FullscreenModal>
    );
  }

  return (
    <FullscreenModal>
      <div className={styles.importanceAnalysisFill}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>{I18N.esg.esgIsImportant2}</div>
          <div
            className={styles.langBtn}
            onClick={() =>
              changeLocale({
                currentLocale:
                  locale === LocaleType.zhCN
                    ? LocaleType.enUS
                    : LocaleType.zhCN,
                onlyFeSwitch: true,
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
          <Spin spinning={loading}>
            {analysisInfo && (
              <div
                className={styles.questionnaire}
                style={{
                  width: isZh ? 1000 : 1164,
                  padding: isZh ? '40px 64px' : '40px',
                }}
              >
                <div className={styles.questionnaireHeader}>
                  <div className={styles.questionnaireTitle}>
                    {analysisInfo[isZh ? 'name' : 'nameEn']}
                  </div>
                  <div className={styles.questionnaireDescription}>
                    {analysisInfo[isZh ? 'introduction' : 'introductionEn']}
                  </div>
                </div>
                <div className={styles.questionnaireContent}>
                  <div className={styles.questionnaireItem}>
                    <div className={styles.questionnaireItemTitle}>
                      {I18N.carbonFootprint3.basicInformation}
                    </div>
                    <div className={styles.questionnaireRow}>
                      <div>{I18N.esg.whatIsYourIdentity}</div>
                      <Select
                        value={answer.roleId}
                        options={analysisInfo.roles?.map(role => ({
                          label: role[isZh ? 'role' : 'roleEn'],
                          value: role.id,
                        }))}
                        onChange={roleId => {
                          setAnswer({ ...answer, roleId });
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.questionnaireItem}>
                    <div className={styles.questionnaireItemTitle}>
                      {I18N.esg.importanceOfTheTopic}
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
                              const topicAnswer =
                                answer.topics?.find(
                                  t => t.topicId === topic.topicId,
                                ) || {};

                              return (
                                <div className={styles.topicItem}>
                                  <div className={styles.topicInfoItem}>
                                    <div className={styles.topicTitle}>
                                      {topicName}
                                    </div>
                                    <div>
                                      {topic[isZh ? 'analysis' : 'analysisEn']}
                                    </div>
                                  </div>
                                  <div className={styles.topicInfoItem}>
                                    <div className={styles.topicTitle}>
                                      {I18N.esg.importantToTheCompany}
                                      {topicName}
                                      {I18N.esg.forTheCompanysBusiness}
                                    </div>
                                    <div className={styles.scoreContent}>
                                      <div className={styles.importanceTab}>
                                        {Object.values(IMPORTANCE).map(
                                          importance => (
                                            <div
                                              className={classNames(
                                                styles.importanceTabItem,
                                                {
                                                  [styles.currentImportanceTabItem]:
                                                    topicAnswer.companyResult ===
                                                    importance,
                                                  [styles.enImportanceTabItem]:
                                                    !isZh,
                                                },
                                              )}
                                              onClick={() => {
                                                Object.assign(topicAnswer, {
                                                  companyResult: importance,
                                                });
                                                setAnswer({ ...answer });
                                              }}
                                            >
                                              {IMPORTANCE_LABEL(importance)}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                      {!isNil(topicAnswer.companyResult) &&
                                        topicAnswer.companyResult >= 0 && (
                                          <div className={styles.score}>
                                            {topicAnswer.companyResult}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                  <div className={styles.topicInfoItem}>
                                    <div className={styles.topicTitle}>
                                      {I18N.esg.regardingStakeholdersInterests}
                                      {topicName}
                                      {I18N.esg.forYou}
                                    </div>
                                    <div className={styles.scoreContent}>
                                      <div className={styles.importanceTab}>
                                        {Object.values(IMPORTANCE).map(
                                          importance => (
                                            <div
                                              className={classNames(
                                                styles.importanceTabItem,
                                                {
                                                  [styles.currentImportanceTabItem]:
                                                    topicAnswer.selfResult ===
                                                    importance,
                                                  [styles.enImportanceTabItem]:
                                                    !isZh,
                                                },
                                              )}
                                              onClick={() => {
                                                Object.assign(topicAnswer, {
                                                  selfResult: importance,
                                                });
                                                setAnswer({ ...answer });
                                              }}
                                            >
                                              {IMPORTANCE_LABEL(importance)}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                      {!isNil(topicAnswer.selfResult) &&
                                        topicAnswer.selfResult >= 0 && (
                                          <div className={styles.score}>
                                            {topicAnswer.selfResult}
                                          </div>
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
                  <div className={styles.questionnaireItem}>
                    <div className={styles.questionnaireItemTitle}>
                      {I18N.esg.otherIssues}
                    </div>
                    <div className={styles.otherQuestionContent}>
                      {analysisInfo.questions?.map(question => {
                        const questionAnswer =
                          answer.questions?.find(q => q.id === question.id) ||
                          {};

                        return (
                          <div className={styles.questionnaireRow}>
                            <div>
                              {question[isZh ? 'question' : 'questionEn']}
                            </div>
                            <Input.TextArea
                              value={questionAnswer.answer}
                              onChange={e => {
                                Object.assign(questionAnswer, {
                                  answer: e.target.value,
                                });
                                setAnswer({ ...answer });
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Spin>
        </div>
        <div className={styles.footer}>
          <Button
            className={styles.submitBtn}
            type='primary'
            loading={submitLoading}
            onClick={submit}
          >
            {I18N.questionnaire.submitQuestionnaire}
          </Button>
        </div>
      </div>
    </FullscreenModal>
  );
};

export default ImportanceAnalysisFill;
