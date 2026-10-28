import React from 'react';

import { NumberRender } from './NumberRender';
import { RadioRender } from './RadioRender';
import { TextRender } from './TextRender';

type TableRenderProps = {
  // Define your props here
  question: any;
  language: string;
};

export const TableRender: React.FC<TableRenderProps> = props => {
  // Component logic goes here
  const { question, language } = props;
  const { questions } = question;
  const thead = questions.map(q => ({
    key: q.question_id,
    value: q.description[language],
  }));
  return (
    <section
      key={question.question_id}
      className='ndp_formatted_response__question'
      id={`formatted_responses_question_${question.question_id}`}
    >
      <h3 className='ndp_formatted_response__header'>
        {question.description[language]}
      </h3>
      <table className='ndp_formatted_response__table'>
        <thead>
          <tr>
            {thead.map(th => (
              <th key={th.key}>{th.value}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {questions.map(q => {
              switch (q.type) {
                case 'checkbox':
                case 'radio':
                  return (
                    // eslint-disable-next-line jsx-a11y/control-has-associated-label
                    <td key={q.question_id}>
                      <RadioRender
                        question={q}
                        language={language}
                        withHeader={false}
                      />
                    </td>
                  );
                case 'text':
                  return (
                    // eslint-disable-next-line jsx-a11y/control-has-associated-label
                    <td key={q.question_id}>
                      <TextRender
                        question={q}
                        language={language}
                        withHeader={false}
                      />
                    </td>
                  );
                case 'calculation':
                case 'number':
                  return (
                    // eslint-disable-next-line jsx-a11y/control-has-associated-label
                    <td key={q.question_id}>
                      <NumberRender
                        question={q}
                        language={language}
                        withHeader={false}
                      />
                    </td>
                  );

                default:
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label
                  return <td key={q.question_id} />;
              }
            })}
          </tr>
        </tbody>
      </table>
    </section>
  );
};
