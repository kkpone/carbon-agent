import { isUndefined } from 'lodash-es';
import React from 'react';

import { hideText } from './util';

interface TextRenderProps {
  question: any;
  language: string;
  withHeader?: boolean;
  index?: number;
}

export const TextRender: React.FC<TextRenderProps> = props => {
  const { question, language, withHeader = true, index } = props;
  let { answers } = question;
  if (!isUndefined(index)) {
    answers = [question.answers[index]];
  }
  return (
    <>
      {withHeader && (
        <section className='ndp_formatted_response__question'>
          <h3 className='ndp_formatted_response__header'>
            {question.description[language]}
          </h3>
        </section>
      )}
      {answers?.map(answer => (
        <div className='ndp_formatted_response__value' key={answer.question_id}>
          {answer.was_hidden ? hideText : answer.value?.text}
        </div>
      ))}
    </>
  );
};
