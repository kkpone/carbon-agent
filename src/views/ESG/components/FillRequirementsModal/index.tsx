import I18N from '@src/lang/I18N';
import { Input, Modal } from 'antd';
import {
  cloneElement,
  FC,
  forwardRef,
  ReactElement,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const FillRequirements = forwardRef<
  {
    fillRequire: string;
  },
  {
    fillRequire: string;
  }
>((props, ref) => {
  const [fillRequire, setFillRequire] = useState(props.fillRequire);

  useImperativeHandle(ref, () => ({ fillRequire }), [fillRequire]);

  return (
    <Input.TextArea
      style={{ height: 120, margin: '12px 0' }}
      value={fillRequire}
      placeholder={I18N.esg.fillInRequirements}
      maxLength={300}
      onChange={e => setFillRequire(e.target.value)}
    />
  );
});

const FillRequirementsModal: FC<{
  children: ReactElement;
  fillRequire: string;
  onConfirm: (val: string) => Promise<void>;
}> = ({ children, fillRequire, onConfirm }) => {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const ref = useRef<{ fillRequire: string }>({
    fillRequire: '',
  });

  const submit = async () => {
    try {
      setLoading(true);
      await onConfirm(ref.current.fillRequire);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        width={490}
        title={I18N.esg.fillInTheRequiredForm}
        open={open}
        destroyOnClose
        okButtonProps={{ loading }}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onOk={submit}
      >
        <FillRequirements ref={ref} fillRequire={fillRequire} />
      </Modal>
      {cloneElement(children, { onClick: () => setOpen(true) })}
    </>
  );
};

export default FillRequirementsModal;
