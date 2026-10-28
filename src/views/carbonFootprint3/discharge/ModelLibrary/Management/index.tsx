import I18N from '@src/lang/I18N';
import { ArrowLeftOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { FullscreenModal } from '@/components/FullscreenModal';
import { IconAlibaba } from '@/components/iconfont';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Button, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { getModelInfo } from '../service';
import { ModelItem, ModelSourceEnum } from '../type';
import ModelList from './ModelList';
import ModelVisual from './ModelVisual';
import styles from './index.module.less';

type ViewMode = 'visual' | 'list';

const ModelManagement = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [modelInfo, setModelInfo] = useState<ModelItem>();
  const [viewMode, setViewMode] = useState<ViewMode>('visual');

  const fetchModelInfo = async id => {
    const res = await getModelInfo({ id: Number(id) });
    setModelInfo(res.data.data);
  };

  useEffect(() => {
    fetchModelInfo(id);
  }, [id]);

  const isSystemModel = modelInfo?.source === ModelSourceEnum.SYSTEM;

  const goBack = () => {
    history.push(RouteMapsCorbonFootprint3.carbonFootprint3ModelLibrary);
  };

  return (
    <FullscreenModal>
      <div className={styles.modelManagement}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <ArrowLeftOutlined className={styles.backIcon} onClick={goBack} />
            <span className={styles.title}>
              {modelInfo?.modelName ||
                I18N.productDigitalPassport.modelManagement}
            </span>
            {isSystemModel && (
              <span className={styles.systemTag}>
                {I18N.carbonFootprint3.builtIn}
              </span>
            )}
          </div>
          <div className={styles.headerRight}>
            <Tooltip
              title={
                viewMode === 'visual'
                  ? I18N.carbonFootprint3.switchToList
                  : I18N.carbonFootprint3.switchToVisual
              }
              placement='bottom'
            >
              <Button
                size='small'
                icon={
                  viewMode === 'visual' ? (
                    <IconAlibaba type='icon-icon_qiehuanzhikeshihua' />
                  ) : (
                    <UnorderedListOutlined />
                  )
                }
                onClick={() =>
                  setViewMode(viewMode === 'visual' ? 'list' : 'visual')
                }
              />
            </Tooltip>
          </div>
        </div>

        <div className={styles.content}>
          {viewMode === 'visual' && modelInfo && (
            <ModelVisual
              modelInfo={modelInfo}
              refreshModelInfo={() => fetchModelInfo(id)}
            />
          )}
          {viewMode === 'list' && modelInfo && (
            <ModelList
              modelInfo={modelInfo}
              refreshModelInfo={() => fetchModelInfo(id)}
            />
          )}
        </div>
      </div>
    </FullscreenModal>
  );
};

export default ModelManagement;
