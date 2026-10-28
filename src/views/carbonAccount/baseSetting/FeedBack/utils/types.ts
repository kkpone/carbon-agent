import { Moment } from 'moment';
import { FeedBackKeys, levels, status } from '.';

export type FeedBackSearchParams = {
  [FeedBackKeys.dateRange]: Moment[];
  [FeedBackKeys.feedbackLevel]: keyof ReturnType<typeof levels>;
  [FeedBackKeys.feedbackStatus]: keyof ReturnType<typeof status>;
  [FeedBackKeys.mobile]: string;
};
