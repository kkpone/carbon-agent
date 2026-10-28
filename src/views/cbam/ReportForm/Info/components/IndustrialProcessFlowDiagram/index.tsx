/**
 * @description 工业过程流程图
 */

import I18N from '@src/lang/I18N';
import { Spin } from 'antd';
import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { InfoTitle } from '@/components/InfoTitle';
import ProcessStructureDiagram from '@/views/cbam/ReportForm/Info/components/ProcessStructureDiagram';

import styles from './index.module.less';
import { getProcessResultEdge } from '../../../service';
import { EdgeResultDTO } from '../../../type';

const IndustrialProcessFlowDiagram = (
  { cbamId }: { cbamId: number },
  ref?: Ref<unknown>,
) => {
  /** 流程图数据 */
  const [diagramData, setDiagramData] = useState<EdgeResultDTO>();

  /** 流程图loading */
  const [loading, setLoading] = useState(false);

  /** 流程图刷新标识 */
  const [refresh, setRefresh] = useState(false);

  /** 刷新流程图的方法 */
  const onRefresh = () => {
    setRefresh(!refresh);
  };

  /** 获取流程图数据 */
  const getData = async () => {
    setLoading(true);
    try {
      const { data } = await getProcessResultEdge({ cbamId });
      setDiagramData(data?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cbamId) {
      getData();
    }
  }, [cbamId, refresh]);

  /** 暴露组件方法 接受外部获取的ref */
  useImperativeHandle(ref, () => ({
    /** 刷新左侧树的方法 */
    onRefreshFlowDiagram: onRefresh,
  }));

  return (
    <div className={styles.flowDiagramWrapper}>
      <InfoTitle title={I18N.cbam.industrialProcessFlow} />
      <Spin spinning={loading} className={styles.spinWrapper} />
      {!loading && <ProcessStructureDiagram data={diagramData} />}
    </div>
  );
};

export default forwardRef(IndustrialProcessFlowDiagram);
