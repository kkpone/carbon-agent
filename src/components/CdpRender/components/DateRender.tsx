import { isUndefined } from 'lodash-es';
import moment from 'moment';
import React from 'react';

interface DateRenderProps {
  question: any;
  language: string;
  index?: number;
}

export const DateRender: React.FC<DateRenderProps> = props => {
  const { question, language, index } = props;
  let { answers } = question;
  if (!isUndefined(index)) {
    answers = [question.answers[index]];
  }
  return (
    <section
      key={question.question_id}
      className='ndp_formatted_response__question'
      id={`formatted_responses_question_${question.question_id}`}
    >
      <h3 className='ndp_formatted_response__header'>
        {question.description[language]}
      </h3>
      {answers?.map(answer => (
        <section
          key={answer.question_id}
          className='ndp_formatted_response__answer'
        >
          <div className='ndp_formatted_response__value'>
            {moment(answer.value?.date).format('LL')}
          </div>
        </section>
      ))}
    </section>
  );
};
