import { FC } from 'react';
import { Steps } from 'antd';

const { Step } = Steps;
interface ComStepProps {
  current: number;
  steps: { modelName: string; orderNum: string }[];
  style?: React.CSSProperties;
}
const ComStep: FC<ComStepProps> = ({ current, steps, style }) => (
  <Steps
    labelPlacement='vertical'
    current={current}
    className='comStep'
    style={style || { width: '100%' }}
  >
    {steps.map(item => (
      <Step key={item.modelName} title={item.modelName} />
    ))}
  </Steps>
);

export default ComStep;
