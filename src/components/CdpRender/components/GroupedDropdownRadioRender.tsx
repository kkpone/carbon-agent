import I18N from '@src/lang/I18N';
import { isUndefined } from 'lodash-es';
import React from 'react';

import { hideText } from './util';

interface GroupedDropdownRadioRenderProps {
  question: any;
  language: string;
  withHeader?: boolean;
  index?: number;
}

export const GroupedDropdownRadioRender: React.FC<
  GroupedDropdownRadioRenderProps
> = props => {
  const { question, language, withHeader = true, index } = props;
  const { options, option_groups } = question;
  let { answers } = question;
  if (!isUndefined(index)) {
    answers = [question.answers[index]];
  }
  return (
    <section
      key={question.question_id}
      className={withHeader ? 'ndp_formatted_response__question' : ''}
      id={`formatted_responses_question_${question.question_id}`}
    >
      {withHeader && (
        <h3 className='ndp_formatted_response__header'>
          {question.description[language]}
        </h3>
      )}
      {answers?.map(answer => (
        <section
          key={answer.question_id}
          className={
            withHeader
              ? 'ndp_formatted_response__answer'
              : 'ndp_formatted_response__answer_option'
          }
        >
          {answer.was_hidden
            ? hideText
            : answer.options?.map(option => {
                const currentOption = options.find(
                  o => o.question_option_id === option.option_id,
                );
                const currentGroupOption = option_groups.find(
                  o => o.question_option_group_id === option.option_group_id,
                );
                return (
                  <section
                    key={option.option_id}
                    className='ndp_formatted_response__answer_option'
                    id={`formatted_responses_answer_option_${option.option_id}`}
                  >
                    <table className='ndp_formatted_response__answer_group_option'>
                      <tbody>
                        <tr>
                          <td>{currentGroupOption?.label?.[language]}</td>
                          <td>
                            {currentOption?.label?.[language] ?? I18N.carbonFootprint.pleaseSelect}
                            {option.other ? `(${option.other})` : ''}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {/* <div
                      className={
                        withHeader
                          ? 'ndp_formatted_response__answer_option'
                          : ''
                      }
                    >
                      {currentOption?.label?.[language] ?? '请选择'}
                    </div> */}
                  </section>
                );
              })}
          {(isUndefined(answer.options) || answer.options?.length === 0) &&
            !answer.was_hidden && (
              <section
                className='ndp_formatted_response__answer_option'
                id='formatted_responses_answer_option_no_answer'
              >
                <div
                  className={
                    withHeader ? 'ndp_formatted_response__answer_option' : ''
                  }
                >
                  {I18N.carbonFootprint.pleaseSelect}</div>
              </section>
            )}
        </section>
      ))}
    </section>
  );
};
