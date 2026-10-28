import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Modal, Popover } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { FC, ReactElement, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconAlibaba } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import { getQuestionnaireList } from '@/views/Questionnaire/QuestionnaireList/service';
import {
  QUESTIONNAIRE_STATUS,
  QUESTIONNAIRE_STATUS_LABEL,
} from '@/views/Questionnaire/constant';
import { Questionnaire } from '@/views/Questionnaire/type';

import styles from './index.module.less';
import CommuteImportResult from '../CommuteImportResult';

const CommuteImport: FC<{
  children: ReactElement;
  computationId: string;
  computationPeriod?: string;
  onImportSuccess: () => void;
}> = ({ children, computationId, computationPeriod, onImportSuccess }) => {
  const [open, setOpen] = useState(false);

  const [importQuestionnaire, setImportQuestionnaire] =
    useState<Questionnaire | null>(null);

  const [commuteQuestionnaireList, setCommuteQuestionnaireList] = useState<
    Questionnaire[]
  >([]);

  const [importModalOpen, setImportModalOpen] = useState(false);

  const [showImportResult, setShowImportResult] = useState(false);

  const history = useHistory();

  useMount(() => {
    getQuestionnaireList({ pageNum: 1, pageSize: 100000 }).then(({ data }) => {
      setCommuteQuestionnaireList(data.data.rows);
    });
  });

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        title={I18N.enterpriseCarbonAccount2.confirmImportTo}
        width={440}
        open={importModalOpen}
        zIndex={3000}
        onCancel={() => {
          setImportQuestionnaire(null);
          setImportModalOpen(false);
        }}
        onClose={() => {
          setImportQuestionnaire(null);
          setImportModalOpen(false);
        }}
        onOk={() => {
          setShowImportResult(true);
          setImportModalOpen(false);
        }}
      >
        {importQuestionnaire && (
          <div className={styles.importQuestionnaire}>
            <div>
              <div
                className={styles.questionnaireName}
                title={importQuestionnaire.name}
              >
                {importQuestionnaire.name}
              </div>
              <div className={styles.questionnaireInfo}>
                <div>{importQuestionnaire.year}</div>
                <div>
                  {I18N.enterpriseCarbonAccount2.recycle}
                  {importQuestionnaire.submitCount}
                </div>
              </div>
            </div>
            <div
              className={classNames(styles.statusTag, {
                [styles.publishedTag]:
                  importQuestionnaire.status === QUESTIONNAIRE_STATUS.PUBLISHED,
                [styles.closeTag]:
                  importQuestionnaire.status === QUESTIONNAIRE_STATUS.CLOSE,
                [styles.UnpublishTag]:
                  importQuestionnaire.status ===
                  QUESTIONNAIRE_STATUS.UN_PUBLISH,
              })}
            >
              {QUESTIONNAIRE_STATUS_LABEL[importQuestionnaire.status]}
            </div>
          </div>
        )}
      </Modal>
      {showImportResult && !isNil(importQuestionnaire) && (
        <CommuteImportResult
          questionnaire={importQuestionnaire}
          computationId={computationId}
          computationPeriod={computationPeriod}
          onResultClose={() => {
            setShowImportResult(false);
            setImportQuestionnaire(null);
          }}
          onImportSuccess={onImportSuccess}
        />
      )}
      <Popover
        rootClassName={styles.questionnairePopover}
        // align={{ offset: [-20, -10] }}
        // placement='leftTop'
        arrow={false}
        trigger={['click']}
        open={open}
        content={
          <>
            <div className={styles.questionnaireList}>
              {commuteQuestionnaireList.map(questionnaire => {
                const { id, name, year, submitCount, status } = questionnaire;
                return (
                  <div
                    className={styles.questionnaire}
                    key={id}
                    onClick={() => {
                      setOpen(false);
                      setImportQuestionnaire(questionnaire);
                      setImportModalOpen(true);
                    }}
                  >
                    <div>
                      <div className={styles.questionnaireName} title={name}>
                        {name}
                      </div>
                      <div className={styles.questionnaireInfo}>
                        <div>{year}</div>
                        <div>
                          {I18N.enterpriseCarbonAccount2.recycle}
                          {submitCount}
                        </div>
                      </div>
                    </div>
                    <div
                      className={classNames(styles.statusTag, {
                        [styles.publishedTag]:
                          status === QUESTIONNAIRE_STATUS.PUBLISHED,
                        [styles.closeTag]:
                          status === QUESTIONNAIRE_STATUS.CLOSE,
                        [styles.UnpublishTag]:
                          status === QUESTIONNAIRE_STATUS.UN_PUBLISH,
                      })}
                    >
                      {QUESTIONNAIRE_STATUS_LABEL[status]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className={styles.addQuestionnaire}
              onClick={() => history.push(RouteMaps.questionnaireAdd)}
            >
              <div>
                {I18N.enterpriseCarbonAccount2.createEmployeeCommunication}
              </div>
              <IconAlibaba type='icon-icon_arrow_rioght' />
            </div>
          </>
        }
        onOpenChange={setOpen}
      >
        {children}
      </Popover>
    </div>
  );
};

export default CommuteImport;
