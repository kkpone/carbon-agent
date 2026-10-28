/* eslint-disable react/no-array-index-key */
import React from 'react';

import { DateRender } from './DateRender';
import { NumberRender } from './NumberRender';
import { RadioRender } from './RadioRender';
import { TextRender } from './TextRender';

interface MdRepeaterProps {
  question: any;
  language: string;
}

export const MdRepeater: React.FC<MdRepeaterProps> = props => {
  const { question, language } = props;
  const maxLength = Math.max(
    ...question.questions.map(q => q.answers?.length || 0),
  );
  const newArray = new Array(maxLength).fill(1);
  return (
    <section className='ndp_formatted_response__question'>
      <h3 className='ndp_formatted_response__header'>
        {question.description[language]}
      </h3>
      {newArray.map((a, index) => (
        <section
          key={index}
          className='ndp_formatted_response__repeater'
          id={`formatted_responses_repeater_${question.question_id}_${index}`}
        >
          {question.questions.map(question => {
            switch (question.type) {
              case 'date':
                return (
                  <DateRender
                    key={`${question.question_id}_${index}`}
                    question={question}
                    language={language}
                    index={index}
                  />
                );
              case 'checkbox':
              case 'radio':
                return (
                  <RadioRender
                    key={`${question.question_id}_${index}`}
                    question={question}
                    language={language}
                    index={index}
                  />
                );
              case 'text':
                return (
                  <TextRender
                    key={`${question.question_id}_${index}`}
                    question={question}
                    language={language}
                    index={index}
                  />
                );
              case 'calculation':
              case 'number':
                return (
                  <NumberRender
                    key={`${question.question_id}_${index}`}
                    question={question}
                    language={language}
                    index={index}
                  />
                );
              default:
                return null;
            }
          })}
          <hr />
        </section>
      ))}
    </section>
  );
};
