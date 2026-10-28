import { useMemo } from 'react';

import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import style from '../../index.module.less';
import {
  asRecord,
  getOptionalScalarString,
  getOptionalString,
  parsePythonLiteral,
} from './utils';

export type TodoItem = {
  content: string;
  status: string;
};

const TODO_STATUS_LABELS = createI18nLabelMap<string, string>({
  cancelled: () => I18N.carbonAgent.todoCancelled,
  completed: () => I18N.carbonAgent.todoCompleted,
  done: () => I18N.carbonAgent.todoCompleted,
  in_progress: () => I18N.carbonAgent.todoInProgress,
  pending: () => I18N.carbonAgent.todoPending,
});

const TODO_STATUS_TONES = new Set(['completed', 'done', 'in_progress']);

const getTodoStatusLabel = (status: string) =>
  TODO_STATUS_LABELS[status] || status || I18N.carbonAgent.todoPending;

const getTodoStatusTone = (status: string) => {
  if (status === 'completed' || status === 'done') {
    return 'completed';
  }

  if (status === 'in_progress') {
    return 'running';
  }

  return TODO_STATUS_TONES.has(status) ? status : 'pending';
};

export const parseWriteTodosResult = (result: string): TodoItem[] => {
  const listLiteral = result.match(/Updated todo list to\s*(\[.*\])\s*$/s)?.[1];
  const parsed = parsePythonLiteral(listLiteral || result);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map(item => {
      const itemRecord = asRecord(item);
      const content =
        getOptionalString(itemRecord.content) ||
        getOptionalScalarString(itemRecord.title) ||
        getOptionalScalarString(itemRecord.task);
      const status =
        getOptionalString(itemRecord.status) ||
        getOptionalScalarString(itemRecord.state) ||
        'pending';

      return content ? { content, status } : undefined;
    })
    .filter(Boolean) as TodoItem[];
};

const WriteTodosResult = ({ result }: { result: string }) => {
  const todos = useMemo(() => parseWriteTodosResult(result), [result]);

  if (!todos.length) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  return (
    <div className={style.writeTodosResult}>
      <div className={style.writeTodosHead}>
        <span>{I18N.carbonAgent.todoListUpdated}</span>
        <b>
          {I18N.template(I18N.carbonAgent.todoCount, { val1: todos.length })}
        </b>
      </div>
      <ol className={style.writeTodosList}>
        {todos.map(todo => {
          const tone = getTodoStatusTone(todo.status);

          return (
            <li
              className={style.writeTodosItem}
              key={`${todo.content}-${todo.status}`}
            >
              <span
                className={`${style.writeTodosMarker} ${
                  style[`writeTodosMarker-${tone}`]
                }`}
                aria-hidden='true'
              />
              <span className={style.writeTodosContent}>{todo.content}</span>
              <b className={style.writeTodosStatus}>
                {getTodoStatusLabel(todo.status)}
              </b>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default WriteTodosResult;
