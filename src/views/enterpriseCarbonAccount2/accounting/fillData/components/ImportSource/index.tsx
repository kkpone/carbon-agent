import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { FC, PropsWithChildren, useState } from 'react';
import ImportDischarge from 'src/views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/emissionManage/importDischarge';

type ImportDischargeProps = {
  computationId: string;
  computationPeriod?: string;
  onImportSuccess: () => void;
};

export const ImportSource: FC<
  PropsWithChildren<ImportDischargeProps>
> = props => {
  const [visible, setVisible] = useState(false);
  const { onImportSuccess } = props;
  return (
    <>
      <Modal
        title={I18N.carbonFootprint.importEmissionSources}
        destroyOnClose
        width={1200}
        open={visible}
        onOk={() => {
          setVisible(false);
          onImportSuccess();
        }}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <ImportDischarge
          computationId={props.computationId}
          computationPeriod={props.computationPeriod}
          hideTitle
        />
      </Modal>
      <div onClick={() => setVisible(true)}>{props.children}</div>
    </>
  );
};
