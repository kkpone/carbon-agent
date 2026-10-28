import React from 'react';

import { DateRender } from './DateRender';
import { NumberRender } from './NumberRender';
import { RadioRender } from './RadioRender';
import { TextRender } from './TextRender';

interface ReporterProps {
  question: any;
  language: string;
}

export const Repeater: React.FC<ReporterProps> = props => {
  const { question, language } = props;
  return (
    <section
      key={question.question_id}
      className='ndp_formatted_response__question'
      id={`formatted_responses_question_${question.question_id}`}
    >
      <h3 className='ndp_formatted_response__header'>
        {question.description[language]}
      </h3>
      {question.questions.map(innerQuestion => {
        if (
          innerQuestion.type === 'matrixrow' &&
          innerQuestion?.answers &&
          innerQuestion?.answers?.[0].was_hidden
        ) {
          return <div />;
        }
        return (
          <section
            key={innerQuestion.question_id}
            className='ndp_formatted_response__question'
            id={`formatted_responses_question_${innerQuestion.question_id}`}
          >
            <h3 className='ndp_formatted_response__header'>
              {innerQuestion.description[language]}
            </h3>
            {innerQuestion.questions.map(question => {
              switch (question.type) {
                case 'date':
                  return (
                    <DateRender
                      key={question.question_id}
                      question={question}
                      language={language}
                    />
                  );
                case 'checkbox':
                case 'radio':
                  return (
                    <RadioRender
                      key={question.question_id}
                      question={question}
                      language={language}
                    />
                  );
                case 'text':
                  return (
                    <TextRender
                      key={question.question_id}
                      question={question}
                      language={language}
                    />
                  );
                case 'calculation':
                case 'number':
                  return (
                    <NumberRender
                      key={question.question_id}
                      question={question}
                      language={language}
                    />
                  );
                default:
                  return null;
              }
            })}
          </section>
        );
      })}
    </section>
  );
};
