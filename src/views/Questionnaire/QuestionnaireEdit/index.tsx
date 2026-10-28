import { FC } from 'react';
import { useParams } from 'react-router-dom';

import QuestionnaireDetails from '../components/QuestionnaireDetails';

const QuestionnaireEdit: FC = () => {
  const { id } = useParams<{ id: string }>();

  return <QuestionnaireDetails id={id} />;
};

export default QuestionnaireEdit;
