import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { App, Button, Modal, Spin } from 'antd';
import { FC, useContext, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { LocaleContext } from '@/components/LocaleProvider';
import { checkPermissions } from '@/components/Permission/utils';
import IconFont from '@/components/iconfont';
import { LocaleType } from '@/lang/I18N';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils';

import SummaryAdvice from './SummaryAdvice';
import SummaryAnalysis from './SummaryAnalysis';
import SummaryInfo from './SummaryInfo';
import SummaryTable from './SummaryTable';
import styles from './index.module.less';
import { closeSurvey } from './service';
import AnalysisStatusTag from '../ImportanceAnalysis/AnalysisStatusTag';
import { IMPORTANCE_ANALYSIS_STATUS } from '../ImportanceAnalysis/constant';
import { getImportanceAnalysisInfo } from '../ImportanceAnalysisInfo/service';

const ImportanceAnalysisResult: FC = () => {
  const { id } = useParams<{ id: string }>();

  const { modal } = App.useApp();

  const [analysisInfo, setAnalysisInfo] = useState<Record<string, any>>();

  const history = useHistory();

  const editPermission = !!checkPermissions(true, 'esg:survey:edit');

  const back = () => history.push(RouteMaps.ESGImportanceAnalysis);

  const { locale } = useContext(LocaleContext);
  const isZh = locale === LocaleType.zhCN;

  const updateImportanceAnalysis = async () => {
    const { data } = await getImportanceAnalysisInfo({ id });
    setAnalysisInfo(data.data);
  };

  useMount(updateImportanceAnalysis);

  if (!analysisInfo) {
    return <Spin spinning />;
  }

  return (
    <div className={styles.importanceAnalysisResult}>
      <div className={styles.header}>
        <div
          className={styles.backBtn}
          onClick={() => history.push(RouteMaps.ESGImportanceAnalysis)}
        >
          <IconFont className={styles.backIcon} type='icon-icon-shangyiye' />
        </div>
        <div className={styles.headerText}>
          {analysisInfo[isZh ? 'name' : 'nameEn']}
        </div>
        <div className={styles.split} />
        <div className={styles.headerText}>{analysisInfo.year}</div>
        <AnalysisStatusTag status={analysisInfo.status} />
      </div>
      <div className={styles.content}>
        <SummaryInfo id={id} />
        <SummaryTable
          id={id}
          analysisInfo={analysisInfo}
          editPermission={editPermission}
          updateImportanceAnalysis={updateImportanceAnalysis}
        />
        <SummaryAdvice
          id={id}
          analysisInfo={analysisInfo}
          editPermission={editPermission}
          updateImportanceAnalysis={updateImportanceAnalysis}
        />
        <SummaryAnalysis
          id={id}
          analysisInfo={analysisInfo}
          editPermission={editPermission}
          updateImportanceAnalysis={updateImportanceAnalysis}
        />
      </div>
      <div className={styles.footer}>
        <Button onClick={back}>{I18N.carbonFootprint.return}</Button>
        {analysisInfo.status === IMPORTANCE_ANALYSIS_STATUS.PUBLISHED &&
          editPermission && (
            <>
              <Button
                onClick={() =>
                  modal.confirm({
                    icon: null,
                    title: I18N.esg.confirmToModifyThis,
                    content: I18N.esg.pleaseMakeModifications,
                    onOk: () => {
                      history.push(
                        `${RouteMaps.ESGImportanceAnalysisInfo.replace(
                          ':id',
                          '',
                        )}${id}`,
                      );
                    },
                  })
                }
              >
                {I18N.esg.modifyQuestionnaire}
              </Button>
              <Button
                type='primary'
                onClick={() =>
                  Modal.confirm({
                    className: styles.closeModal,
                    icon: null,
                    title: I18N.esg.confirmDeadlineQuestions,
                    content: null,
                    onOk: async () => {
                      await closeSurvey(id);
                      Toast(
                        'success',
                        I18N.carbonFootprint.operationSuccessful,
                      );
                      updateImportanceAnalysis();
                    },
                  })
                }
              >
                {I18N.esg.deadlineQuestionnaire}
              </Button>
            </>
          )}
      </div>
    </div>
  );
};

export default ImportanceAnalysisResult;
