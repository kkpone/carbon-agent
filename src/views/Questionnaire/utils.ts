import moment from 'moment';

import { TIME_TYPE } from './constant';

export const formatQuestionnaireYear = (value?: unknown) => {
  const year = moment(value as moment.MomentInput);

  return year.isValid() ? year.format('YYYY') : '';
};

export const getAnnualWorkdayCount = ({
  year,
  entryTimeType,
  entryTime,
}: {
  year?: string | number;
  entryTimeType?: number | string;
  entryTime?: unknown;
}) => {
  const currentEntryTimeType = Number(entryTimeType);
  const currentYear = Number(year);

  if (!currentYear || currentEntryTimeType === TIME_TYPE.AFTER) {
    return undefined;
  }

  if (currentEntryTimeType === TIME_TYPE.PREV) {
    return 365;
  }

  if (currentEntryTimeType !== TIME_TYPE.DURING || !entryTime) {
    return undefined;
  }

  const startTime = moment(entryTime as moment.MomentInput).startOf('day');
  const endTime = moment(`${currentYear}-12-31`, 'YYYY-MM-DD').endOf('day');

  if (!startTime.isValid() || startTime.year() !== currentYear) {
    return undefined;
  }

  return Math.min(Math.max(endTime.diff(startTime, 'days') + 1, 1), 365);
};

export const getChangeWorkdayCount = ({
  year,
  changeTime,
}: {
  year?: string | number;
  changeTime?: unknown;
}) => {
  const currentYear = Number(year);

  if (!currentYear || !changeTime) {
    return undefined;
  }

  const startTime = moment(changeTime as moment.MomentInput).startOf('day');
  const endTime = moment(`${currentYear}-12-31`, 'YYYY-MM-DD').endOf('day');

  if (!startTime.isValid() || startTime.year() !== currentYear) {
    return undefined;
  }

  return Math.min(Math.max(endTime.diff(startTime, 'days') + 1, 1), 365);
};
