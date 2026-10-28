/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import useUrlState from '@ahooksjs/use-url-state';
import { createForm, onFieldInputValueChange } from '@formily/core';
import { useMount, useRequest } from 'ahooks';
import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { LocaleContext } from '@/components/LocaleProvider';
import { LocaleType, serviceLangMap } from '@/lang/I18N';
import { checkIsMobile } from '@/utils';
import { getAreaCode } from '@/views/system/login/service';

import MobileFill from '../components/MobileFill';
import PCFill from '../components/PCFill';
import {
  getQuestionnaire,
  getWorkdayTotalPreview,
} from '../components/QuestionnaireDetails/service';
import {
  CHANGE_STATUS,
  TIME_TYPE,
  TRANSPORT_WAY_LABEL,
  WORKDAY_TYPE,
} from '../constant';
import { Questionnaire } from '../type';
import { getAnnualWorkdayCount } from '../utils';

const QuestionnaireFill: FC = () => {
  const isMobile = checkIsMobile();

  const { id } = useParams<{ id: string }>();

  const { locale, changeLocale } = useContext(LocaleContext);

  const [urlParams] = useUrlState<{ locale: string }>({
    locale: LocaleType.zhCN,
  });

  const [questionnaire, setQuestionnaire] = useState<Questionnaire>();

  const [loading, setLoading] = useState(false);

  const form = useMemo(
    () =>
      createForm({
        effects: () => {
          const syncWorkdayCount = async () => {
            const values = form.values as Record<string, any>;

            if (questionnaire?.workdayType !== WORKDAY_TYPE.YEARLY) {
              return;
            }

            if (!questionnaire?.id || values.entryTimeType === undefined) {
              form.setValues({
                weekdayCount: undefined,
                workdayTotal: undefined,
              });
              return;
            }

            if (
              Number(values.entryTimeType) === TIME_TYPE.DURING &&
              !values.entryTime
            ) {
              form.setValues({
                weekdayCount: undefined,
                workdayTotal: undefined,
              });
              return;
            }

            const previewWeekdayCount = getAnnualWorkdayCount({
              year: questionnaire.year,
              entryTimeType: values.entryTimeType,
              entryTime: values.entryTime,
            });

            if (!previewWeekdayCount) {
              form.setValues({
                weekdayCount: undefined,
                workdayTotal: undefined,
              });
              return;
            }

            const { data } = await getWorkdayTotalPreview({
              questionId: questionnaire.id,
              entryTimeType: values.entryTimeType,
              weekdayCount: previewWeekdayCount,
              entryTime: values.entryTime,
            });

            form.setValues({
              weekdayCount: data.data,
              workdayTotal: data.data,
            });
          };

          const syncWorkdayTotal = async () => {
            const values = form.values as Record<string, any>;

            if (questionnaire?.workdayType === WORKDAY_TYPE.YEARLY) {
              form.setValues({
                workdayTotal: values.weekdayCount
                  ? Number(values.weekdayCount)
                  : undefined,
              });
              return;
            }

            if (!questionnaire?.id || values.entryTimeType === undefined) {
              form.setValues({
                workdayTotal: undefined,
              });
              return;
            }

            if (!values.weekdayCount) {
              form.setValues({
                workdayTotal: undefined,
              });
              return;
            }

            if (
              Number(values.entryTimeType) === TIME_TYPE.DURING &&
              !values.entryTime
            ) {
              form.setValues({
                workdayTotal: undefined,
              });
              return;
            }

            const { data } = await getWorkdayTotalPreview({
              questionId: questionnaire.id,
              entryTimeType: values.entryTimeType,
              weekdayCount: values.weekdayCount,
              entryTime: values.entryTime,
            });

            form.setValues({
              workdayTotal: data.data,
            });
          };

          const syncChangeWorkdayCount = async () => {
            const values = form.values as Record<string, any>;

            if (
              values.changeStatus !== CHANGE_STATUS.YES ||
              !questionnaire?.id ||
              !values.changeTime ||
              !values.weekdayCount
            ) {
              form.setValues({
                changeWeekdayCount: undefined,
              });
              return;
            }

            const { data } = await getWorkdayTotalPreview({
              questionId: questionnaire.id,
              entryTimeType: TIME_TYPE.DURING,
              weekdayCount: values.weekdayCount,
              entryTime: values.changeTime,
            });

            form.setValues({
              changeWeekdayCount: data.data,
            });
          };

          onFieldInputValueChange('transportWay', field => {
            const { value = [] } = field;
            const step = Number((100 / value.length).toFixed(0));

            form.setValues({
              transportRatio: value.map((val, index) => ({
                transType: val,
                transName: TRANSPORT_WAY_LABEL()[val],
                value: index === value.length - 1 ? 100 : (index + 1) * step,
              })),
            });
            form.validate('transportRatio');
          });

          onFieldInputValueChange('changeTransportWay', field => {
            const { value = [] } = field;
            const step = Number((100 / value.length).toFixed(0));

            form.setValues({
              changeTransportRatio: value.map((val, index) => ({
                transType: val,
                transName: TRANSPORT_WAY_LABEL()[val],
                value: index === value.length - 1 ? 100 : (index + 1) * step,
              })),
            });
            form.validate('changeTransportRatio');
          });

          onFieldInputValueChange('entryTimeType', syncWorkdayCount);
          onFieldInputValueChange('entryTime', syncWorkdayCount);
          onFieldInputValueChange('entryTimeType', syncWorkdayTotal);
          onFieldInputValueChange('entryTime', syncWorkdayTotal);
          onFieldInputValueChange('weekdayCount', syncWorkdayTotal);
          onFieldInputValueChange('changeStatus', syncChangeWorkdayCount);
          onFieldInputValueChange('changeTime', syncChangeWorkdayCount);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questionnaire, locale],
  );

  const { data: areaCode = [] } = useRequest(
    () =>
      getAreaCode({
        lang: serviceLangMap[locale],
      }),
    {
      cacheKey: locale,
      staleTime: 30 * 1000 * 60,
      refreshDeps: [locale],
    },
  );

  const areaCodeList = useMemo(
    () =>
      areaCode.map(item => ({
        label: item.areaContent,
        value: item.areaContent,
      })),
    [areaCode],
  );

  useEffect(() => {
    form.setFieldState('phoneNum', {
      dataSource: areaCodeList,
    });

    form.setValues({
      phoneNum: {
        ...form.values.phoneNum,
        areaCode: form.values.phoneNum?.areaCode || areaCodeList?.[0]?.value,
      },
      changeStatus:
        form.values.changeStatus === undefined
          ? CHANGE_STATUS.NO
          : form.values.changeStatus,
    });
  }, [areaCodeList, form]);

  const FillComponent = isMobile ? MobileFill : PCFill;

  useEffect(() => {
    setLoading(true);
    getQuestionnaire({ id })
      .then(({ data }) => {
        setQuestionnaire(data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useMount(() => {
    changeLocale({
      currentLocale: Object.values(LocaleType).includes(
        urlParams.locale as LocaleType,
      )
        ? (urlParams.locale as LocaleType)
        : LocaleType.zhCN,
      onlyFeSwitch: true,
    });
  });

  return (
    <FillComponent
      questionId={id}
      questionnaire={questionnaire}
      loading={loading}
      form={form}
      locale={locale}
      changeLang={(lang: LocaleType) => {
        location.search = `?locale=${lang}`;
      }}
    />
  );
};

export default QuestionnaireFill;
