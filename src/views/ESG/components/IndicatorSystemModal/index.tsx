import {
  Form as FormComponent,
  FormItem,
  Input,
  Radio,
  Select,
  DatePicker,
} from '@formily/antd-v5';
import { createForm, Form } from '@formily/core';
import { createSchemaField, FormConsumer } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Button, Modal, Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { Moment } from 'moment';
import {
  cloneElement,
  FC,
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Toast } from '@/utils';

import ReferStandard from './ReferStandard';
import styles from './index.module.less';
import { getFrameTopicIds, getIndicatorSystem, getTopicGroup } from './service';
import { IMPORTANCE_ANALYSIS_STATUS } from '../../ImportanceAnalysis/constant';
import { getImportanceAnalysisList } from '../../ImportanceAnalysis/service';
import { TOPIC_COLOR } from '../../constant';
import { IndicatorSystem as IndicatorSystemType, TopicGroup } from '../../type';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Radio,
    DatePicker,
    ReferStandard,
    Select,
  },
});

const ImportanceIcon = ({ level }: { level: number }) => {
  const color = {
    0: '#004541',
    1: '#026961',
    2: '#0CBF9F',
  };

  if (isNil(level)) {
    return null;
  }

  return (
    <div
      className={styles.importanceIcon}
      style={{ background: color[level] }}
    />
  );
};

const CustomRadio = ({ checked }: { checked?: boolean }) => (
  <div
    className={classNames(styles.customRadio, {
      [styles.customRadioChecked]: checked,
    })}
  >
    {checked && (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='9'
        height='7'
        viewBox='0 0 9 7'
        fill='none'
      >
        <path
          d='M1 3L3.5 5.5L7.5 1.5'
          stroke='white'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    )}
  </div>
);

const IndicatorSystem = forwardRef<
  {
    form: Form;
  },
  {
    step: number;
    indicatorSystemList: IndicatorSystemType[];
    topicGroup: TopicGroup[];
    topicList: { id: number; disabled: boolean }[];
    id?: number;
    setTopicList: (val: { id: number; disabled: boolean }[]) => void;
  }
>(
  (
    { step, id, indicatorSystemList, topicGroup, topicList, setTopicList },
    ref,
  ) => {
    const form = useMemo(() => createForm(), []);

    const [loading, setLoading] = useState(false);

    useImperativeHandle(ref, () => ({ form }), [form]);

    useEffect(() => {
      getImportanceAnalysisList({
        pageNum: 1,
        pageSize: 100000,
        status: IMPORTANCE_ANALYSIS_STATUS.PUBLISHED_OR_CLOSED,
      }).then(({ data }) => {
        form
          .query('surveyId')
          .take()
          ?.setComponentProps({
            options: data.rows.map(item => ({
              label: item.name,
              value: item.id,
            })),
          });
      });
    }, [form]);

    useEffect(() => {
      if (!isNil(id)) {
        setLoading(true);
        getIndicatorSystem({ id })
          .then(({ data }) => {
            form.setValues({
              ...data.data,
              referenceIds: data.data.referenceIds
                ?.split(',')
                .map(referenceId => Number(referenceId)),
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }, [form, id]);

    useEffect(() => {
      form
        .query('period')
        .take()
        ?.setComponentProps({
          disabledDate: (date: Moment) => {
            const selectedPeriod = indicatorSystemList
              .filter(system => system.id !== id)
              .map(system => system.period);

            return selectedPeriod.includes(date.format('YYYY'));
          },
        });
    }, [form, id, indicatorSystemList]);

    return (
      <FormComponent form={form} layout='vertical'>
        <Spin spinning={loading}>
          {step === 1 && (
            <>
              <SchemaField
                schema={{
                  type: 'object',
                  properties: {
                    period: {
                      type: 'string',
                      title: I18N.esg.indicatorSystemWeek,
                      required: true,
                      'x-decorator': 'FormItem',
                      'x-decorator-props': {
                        colon: false,
                      },
                      'x-component': 'DatePicker',
                      'x-component-props': {
                        picker: 'year',
                      },
                    },
                    surveyId: {
                      type: 'string',
                      title: I18N.esg.importanceOfApplication,
                      'x-decorator': 'FormItem',
                      'x-decorator-props': {
                        colon: false,
                      },
                      'x-component': 'Select',
                      'x-component-props': {
                        allowClear: true,
                        placeholder: I18N.esg.importanceOfApplication,
                      },
                    },
                    referenceIds: {
                      type: 'string',
                      title: I18N.esg.selectReferenceStandard,
                      'x-decorator': 'FormItem',
                      'x-decorator-props': {
                        colon: false,
                      },
                      'x-component': 'ReferStandard',
                    },
                  },
                }}
              />
              <FormConsumer>
                {formIns => {
                  const { referenceIds } = formIns.values as {
                    referenceIds?: number[];
                  };
                  return (
                    <div className={styles.tip}>
                      {I18N.esg.selected}
                      {(referenceIds || []).length}
                      {I18N.esg.referenceStandards}
                    </div>
                  );
                }}
              </FormConsumer>
            </>
          )}
          {step === 2 && (
            <div className={styles.topicGroup}>
              <div className={styles.importanceContent}>
                <div className={styles.importance}>
                  <ImportanceIcon level={0} />
                  <div className={styles.importanceName}>
                    {I18N.esg.highlyImportant}
                  </div>
                </div>
                <div className={styles.importance}>
                  <ImportanceIcon level={1} />
                  <div className={styles.importanceName}>
                    {I18N.esg.moderatelyImportant}
                  </div>
                </div>
                <div className={styles.importance}>
                  <ImportanceIcon level={2} />
                  <div className={styles.importanceName}>
                    {I18N.esg.lowImportance}
                  </div>
                </div>
              </div>
              {topicGroup.map((group, index) => (
                <div className={styles.subjectGroup} key={group.code}>
                  <div className={styles.groupHeader}>
                    <div
                      className={styles.groupIcon}
                      style={{ background: TOPIC_COLOR[index] }}
                    />
                    <div className={styles.groupTitle}>{group.name}</div>
                  </div>
                  <div className={styles.groupContent}>
                    {group.topicList.map(topic => {
                      const checked = topicList.some(
                        topicItem => topicItem.id === topic.id,
                      );
                      const disabled = !!topicList.find(
                        topicItem => topicItem.id === topic.id,
                      )?.disabled;
                      return (
                        <Tooltip
                          title={disabled ? I18N.esg.youChooseCompletely : ''}
                        >
                          <div
                            className={classNames(styles.subject, {
                              [styles.disabledSubject]: disabled,
                              [styles.checkedSubject]: checked,
                            })}
                            key={topic.id}
                            onClick={() => {
                              if (disabled) {
                                return;
                              }
                              setTopicList(
                                !checked
                                  ? [
                                      ...topicList,
                                      {
                                        id: topic.id as number,
                                        disabled: false,
                                      },
                                    ]
                                  : topicList.filter(
                                      topicItem => topicItem.id !== topic.id,
                                    ),
                              );
                            }}
                          >
                            <div className={styles.subjectNameContent}>
                              <CustomRadio checked={checked} />
                              <div
                                className={styles.subjectName}
                                title={topic.name}
                              >
                                {topic.name}
                              </div>
                            </div>
                            <ImportanceIcon level={topic.level} />
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Spin>
      </FormComponent>
    );
  },
);

type IndicatorSystemModalProps = {
  children: ReactElement;
  indicatorSystemList: IndicatorSystemType[];
  id?: number;
  onConfirm: (val: IndicatorSystemType) => Promise<void>;
};

const IndicatorSystemModal: FC<IndicatorSystemModalProps> = ({
  children,
  id,
  indicatorSystemList,
  onConfirm,
}) => {
  const [open, setOpen] = useState(false);

  const [topicGroup, setTopicGroup] = useState<TopicGroup[]>([]);

  const [topicList, setTopicList] = useState<
    { id: number; disabled: boolean }[]
  >([]);

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const ref = useRef<{
    form: Form;
  }>(null);

  const nextStep = async () => {
    const { form } = ref.current || {};

    if (!form) {
      return;
    }

    const { referenceIds = [], surveyId } = await form.submit<{
      referenceIds?: number[];
      surveyId?: number;
    }>();

    try {
      setLoading(true);

      const topicGroupResp = await getTopicGroup({ surveyId });
      setTopicGroup(topicGroupResp.data.data);

      if (referenceIds.length > 0) {
        const { data } = await getFrameTopicIds({
          ids: referenceIds.join(','),
          surveyId,
        });

        setTopicList(
          (data.data || []).map(topicId => ({
            id: topicId,
            disabled: false,
          })),
        );
      } else {
        setTopicList([]);
      }
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const { form } = ref.current || {};

    if (!form) {
      return;
    }

    if (topicList.length === 0) {
      Toast('warn', I18N.esg.pleaseSelectAtLeast);
      return;
    }

    try {
      setLoading(true);
      const val = await form.submit<
        Omit<IndicatorSystemType, 'referenceIds'> & { referenceIds?: number[] }
      >();
      await onConfirm({
        ...val,
        referenceIds: val.referenceIds?.join(','),
        topicList,
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={(() => {
          if (step === 1) {
            return isNil(id)
              ? I18N.esg.addNewIndicatorBody
              : I18N.esg.editIndicatorBody;
          }

          return I18N.esg.chooseATopic;
        })()}
        width={step === 1 ? 712 : 1078}
        open={open}
        destroyOnClose
        footer={
          <div className={styles.footer}>
            <div />
            <div className={styles.btnContent}>
              <Button onClick={() => setOpen(false)}>
                {I18N.carbonFootprint.cancel}
              </Button>
              {step === 1 && (
                <Button type='primary' loading={loading} onClick={nextStep}>
                  {I18N.carbonFootprint.nextStep}
                </Button>
              )}
              {step === 2 && (
                <>
                  <Button onClick={() => setStep(1)}>
                    {I18N.carbonFootPrintLCA.previousStep}
                  </Button>
                  <Button type='primary' loading={loading} onClick={submit}>
                    {I18N.carbonFootprint.preserve}
                  </Button>
                </>
              )}
            </div>
          </div>
        }
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        afterOpenChange={() => {
          setStep(1);
          setTopicGroup([]);
          setTopicList([]);
        }}
      >
        <IndicatorSystem
          ref={ref}
          step={step}
          id={id}
          topicGroup={topicGroup}
          topicList={topicList}
          indicatorSystemList={indicatorSystemList}
          setTopicList={setTopicList}
        />
      </Modal>
      {cloneElement(children, { onClick: () => setOpen(true) })}
    </>
  );
};

export default IndicatorSystemModal;
