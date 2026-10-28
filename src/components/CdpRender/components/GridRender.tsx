/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';

import { NumberRender } from './NumberRender';
import { RadioRender } from './RadioRender';
import { TextRender } from './TextRender';

interface GridRenderProps {
  // Define your props here
  question: any;
  language: string;
}

export const GridRender: React.FC<GridRenderProps> = props => {
  const { question, language } = props;
  const { questions } = question;
  const thead = questions[0]?.questions?.map(q => ({
    key: q.question_id,
    value: q.description[language],
  }));
  return (
    <section
      key={question.question_id}
      className='ndp_formatted_response__question'
      id={`formatted_responses_matrix_set_grid_${question.question_id}`}
    >
      <h3 className='ndp_formatted_response__header'>
        {question.description[language]}
      </h3>
      <table className='ndp_formatted_response__table'>
        <thead>
          <tr>
            <th />
            {thead?.map(th => (
              <th key={th.key}>{th.value}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.question_id}>
              <td>{q.description[language]}</td>
              {q.questions.map(innerQ => {
                switch (innerQ.type) {
                  case 'checkbox':
                  case 'radio':
                    return (
                      <td key={innerQ.question_id}>
                        <RadioRender
                          question={innerQ}
                          language={language}
                          withHeader={false}
                        />
                      </td>
                    );
                  case 'text':
                    return (
                      <td key={innerQ.question_id}>
                        <TextRender
                          question={innerQ}
                          language={language}
                          withHeader={false}
                        />
                      </td>
                    );
                  case 'calculation':
                  case 'number':
                    return (
                      <td key={innerQ.question_id}>
                        <NumberRender
                          question={innerQ}
                          language={language}
                          withHeader={false}
                        />
                      </td>
                    );

                  default:
                    return <td key={innerQ.question_id} />;
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
