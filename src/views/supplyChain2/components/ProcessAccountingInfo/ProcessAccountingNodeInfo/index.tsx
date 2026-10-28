import EmissionInfo from './EmissionInfo';
import ProcessInfo from './ProcessInfo';
import styles from './index.module.less';
import { PROCESS_ACCOUNTING_NODE_TYPE } from '../constant';
import { ProcessAccounting } from '../type';

type ProcessAccountingNodeProps = {
  processAccountingNode: ProcessAccounting;
  parentProcessAccountingNode: ProcessAccounting | null;
  flag?: boolean;
};

const ProcessAccountingNodeInfo: React.VFC<ProcessAccountingNodeProps> = ({
  processAccountingNode,
  parentProcessAccountingNode,
  flag,
}) => (
  <div className={styles.processAccountingNodeInfo}>
    {(() => {
      switch (processAccountingNode.matchType) {
        case PROCESS_ACCOUNTING_NODE_TYPE.PROCESS:
          return (
            <ProcessInfo
              process={processAccountingNode}
              parentProcess={parentProcessAccountingNode}
              flag={flag}
            />
          );
        case PROCESS_ACCOUNTING_NODE_TYPE.EMISSION:
          return <EmissionInfo emission={processAccountingNode} flag={flag} />;
        default:
          return null;
      }
    })()}
  </div>
);

export default ProcessAccountingNodeInfo;
