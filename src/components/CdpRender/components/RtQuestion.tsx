import { FC } from 'react';

interface EtQuestionProps {
  question: any;
  default_language: string;
}

export const RtQuestion: FC<EtQuestionProps> = props => {
  const { question, default_language } = props;
  return (
    <section
      key={question.question_id}
      className='ndp_formatted_response__question'
      id={`formatted_responses_question_${question.question_id}`}
    >
      <h3 className='ndp_formatted_response__header'>
        {question.description[default_language]}
      </h3>
      {question.answers?.map(answer => (
        <section
          key={answer.question_id}
          className='ndp_formatted_response__answer'
        >
          <div
            className='ndp_formatted_response__value'
            dangerouslySetInnerHTML={{
              __html: answer.value?.html,
            }}
          />
        </section>
      ))}
    </section>
  );
};
