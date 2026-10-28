import I18N from '@src/lang/I18N';
import { Form, Modal, FormInstance, Select, Slider } from 'antd';
import { isNil } from 'lodash-es';
import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import ScopeInput from './ScopeInput';
import styles from './index.module.less';
import { SCOPE_VAL, TARGET_STAGE, TARGET_STAGE_LABEL } from '../../constant';
import { Ghg } from '../../type';
import {
  calcReducingPercentage,
  calcTargetStage,
  getTargetStageDetails,
  getTargetYearList,
} from '../service';
import { TargetStage } from '../type';

const { Item } = Form;

type StageModalProps = {
  open: boolean;
  planId: number;
  ghgCategoryList: Ghg[];
  stageId?: number;
  onCancel: () => void;
  onConfirm: (val: TargetStage) => Promise<void> | void;
};

const marks = Object.values(TARGET_STAGE).reduce(
  (prev, stage) => ({
    ...prev,
    [stage]: {
      label: (
        <div className={styles.stageMark}>{TARGET_STAGE_LABEL[stage]}</div>
      ),
    },
  }),
  {},
);

const StageForm = forwardRef<
  FormInstance,
  { ghgCategoryList: Ghg[]; planId: number; stageId?: number }
>(({ ghgCategoryList, planId, stageId }, ref) => {
  const [targetYearList, setTargetYearList] = useState<string[]>([]);

  const [form] = Form.useForm();

  useImperativeHandle(ref, () => form, [form]);

  const ghgKeys = ghgCategoryList.map(ghg => ghg.value);

  const classifyKeys = ghgCategoryList.reduce(
    (prev, curr) => [
      ...prev,
      ...(curr.classifyList || []).map(classify => classify.value),
    ],
    [] as string[],
  );

  const validatePercentage = (value: Record<string, number>) => {
    const filledClassifyKeys = Object.keys(value || {}).filter(
      valueKey =>
        ![SCOPE_VAL.ONE, SCOPE_VAL.TWO, SCOPE_VAL.THREE].includes(valueKey),
    );

    return (
      filledClassifyKeys.length === classifyKeys.length &&
      (!ghgKeys.includes(SCOPE_VAL.ONE) || !isNil(value[SCOPE_VAL.ONE])) &&
      (!ghgKeys.includes(SCOPE_VAL.TWO) || !isNil(value[SCOPE_VAL.TWO]))
    );
  };

  const onTargetStageChange = async (targetStage: number) => {
    const targetYear = form.getFieldValue('targetYear');

    if (targetYear) {
      const { data } = await calcReducingPercentage({
        id: planId,
        targetStage,
        targetYear,
      });
      form.setFieldValue(
        'percentage',
        [...ghgKeys, ...classifyKeys].reduce(
          (p, key) => ({ ...p, [key]: data.data.generalRatio }),
          {},
        ),
      );
    }
  };

  const onPercentageChange = async (percentage: Record<string, number>) => {
    const targetYear = form.getFieldValue('targetYear');

    if (targetYear && validatePercentage(percentage)) {
      const { data } = await calcTargetStage({
        id: planId,
        targetYear,
        percentage,
      });
      form.setFieldValue('targetStage', data.data.targetStage);
    }
  };

  useEffect(() => {
    getTargetYearList({ id: planId, stageId }).then(({ data }) => {
      setTargetYearList(data.data);
    });
  }, [planId, stageId]);

  useEffect(() => {
    if (!isNil(stageId)) {
      getTargetStageDetails({ stageId }).then(({ data }) => {
        form.setFieldsValue(data.data);
      });
    } else {
      form.setFieldsValue({
        targetStage: TARGET_STAGE.STAGE_1,
      });
    }
  }, [stageId, form]);

  return (
    <Form form={form} layout='vertical'>
      <Item
        name='targetYear'
        label={I18N.enterpriseCarbonAccount2.targetYear2}
        required
        rules={[
          {
            required: true,
            message: I18N.enterpriseCarbonAccount2.pleaseSelectTheTarget,
          },
        ]}
      >
        <Select
          className={styles.targetYearSelect}
          placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectTheTarget}
          options={targetYearList.map(year => ({ value: year, label: year }))}
        />
      </Item>
      <Item
        name='targetStage'
        label={I18N.enterpriseCarbonAccount2.sbtGoal}
        required
        rules={[
          {
            required: true,
            message: I18N.enterpriseCarbonAccount2.pleaseSetGoals,
          },
        ]}
      >
        <Slider
          dots
          marks={marks}
          max={4}
          tooltip={{ open: false }}
          onChange={onTargetStageChange}
        />
      </Item>
      <Item
        name='percentage'
        label={I18N.enterpriseCarbonAccount2.emissionReductionRatio}
        required
        rules={[
          {
            validator(_, value: Record<string, any>, callback) {
              if (validatePercentage(value)) {
                callback();
              } else {
                callback(
                  I18N.enterpriseCarbonAccount2.pleaseSetEmissionReduction,
                );
              }
            },
          },
        ]}
      >
        <ScopeInput
          ghgCategoryList={ghgCategoryList}
          onChange={onPercentageChange}
        />
      </Item>
    </Form>
  );
});
const StageModal: FC<StageModalProps> = props => {
  const { open, ghgCategoryList, planId, stageId, onCancel, onConfirm } = props;

  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormInstance>(null);

  const submit = async () => {
    const form = formRef.current;

    if (form) {
      try {
        setLoading(true);
        const val = await form.validateFields();
        await onConfirm({ ...val, stageId });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      title={
        isNil(stageId)
          ? I18N.enterpriseCarbonAccount2.addStage
          : I18N.enterpriseCarbonAccount2.editingStage
      }
      width={704}
      open={open}
      destroyOnClose
      okButtonProps={{ loading }}
      onCancel={onCancel}
      onClose={onCancel}
      onOk={submit}
    >
      <StageForm
        planId={planId}
        stageId={stageId}
        ref={formRef}
        ghgCategoryList={ghgCategoryList}
      />
    </Modal>
  );
};

export default StageModal;
