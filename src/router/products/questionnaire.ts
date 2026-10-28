import { lazy } from 'react';

import { RouteMaps } from '../route-paths';

export const QuestionnaireRoutes = [
  {
    path: RouteMaps.questionnaire,
    meta: {
      icon: 'DashboardOutlined',
    },
    redirect: RouteMaps.questionnaireList,
    children: [
      {
        path: RouteMaps.questionnaireList,
        component: lazy(
          () => import('@src/views/Questionnaire/QuestionnaireList'),
        ),
      },
      {
        path: RouteMaps.questionnaireAdd,
        component: lazy(
          () => import('@src/views/Questionnaire/QuestionnaireAdd'),
        ),
      },
      {
        path: RouteMaps.questionnaireEdit,
        component: lazy(
          () => import('@src/views/Questionnaire/QuestionnaireEdit'),
        ),
      },
      {
        path: RouteMaps.questionnaireFill,
        id: 'questionnaireFill',
        component: lazy(
          () => import('@src/views/Questionnaire/QuestionnaireFill'),
        ),
      },
      {
        path: RouteMaps.questionnaireResult,
        component: lazy(
          () => import('@src/views/Questionnaire/QuestionnaireResult'),
        ),
      },
    ],
  },
];
