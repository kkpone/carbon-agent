import I18N from '@src/lang/I18N';
import { Button, Modal, Table } from 'antd';

import { getQualityEvaluationStandardsData } from './columns';
import style from './index.module.less';

interface QualityEvaluationStandardsModalProps {
  /** 标准类型 */
  stardardType: number;
  /** 控制弹窗显隐 */
  open: boolean;
  /** 点击取消按钮的方法 */
  handleCancel: () => void;
}
export const QualityEvaluationStandardsModal = ({
  stardardType,
  open,
  handleCancel,
}: QualityEvaluationStandardsModalProps) => {
  const qualityEvaluationStandardsData =
    getQualityEvaluationStandardsData(stardardType);
  return (
    <Modal
      wrapClassName={`${style.wrapper}`}
      centered
      title={I18N.carbonFootPrintLCA.dataQualityAssessment}
      open={open}
      width='85%'
      maskClosable={false}
      destroyOnClose
      onCancel={() => {
        handleCancel();
      }}
      footer={[
        <Button
          onClick={() => {
            handleCancel();
          }}
        >
          {I18N.carbonFootPrintLCA.close}
        </Button>,
      ]}
    >
      <div className={style.qualityEvaluationStandardsContentWrapper}>
        {qualityEvaluationStandardsData.map(item => (
          <div className={style.tableWrapper} key={item.key}>
            {item.title && <p className={style.tableTitle}>{item.title}</p>}
            <Table
              columns={item.columns}
              dataSource={item.dataSource}
              pagination={false}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};
