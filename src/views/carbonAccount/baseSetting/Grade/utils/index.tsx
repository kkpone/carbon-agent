import I18N from '@src/lang/I18N';
import { Input } from '@src/components/Input';
import { LevelDto } from '@src/sdks/java/carbonAccount';
import { Form } from 'antd';
import { ColumnsType } from 'antd/es/table';

const levelColumn = () => [
  {
    dataIndex: 'level',
    title: I18N.carbonAccount.grade,
    render: t => `LV${t}`,
  },
];

/** 经验值设置 columns  */
export const gradeLevelColumn = (): ColumnsType<LevelDto> => [
  ...levelColumn(),
  {
    dataIndex: 'levelReduction',
    title: I18N.carbonAccount.requiredCarbonReduction,
  },
];
/** 升级设置 columns  */
export const upgradeLevelColumn = ({
  isEdit,
  onValueChange,
}: {
  isEdit?: boolean;
  onValueChange: (v: string | number, record: LevelDto) => void;
}): ColumnsType<LevelDto> => [
  ...levelColumn(),

  {
    dataIndex: 'rewardScore',
    title: I18N.carbonAccount.rewardCarbonCoins,
    render(t, record) {
      return isEdit ? (
        <Form.Item
          name={`v${record.level}`}
          rules={[
            {
              validator(rule, value) {
                const v = +value;

                if (v < 0)
                  return Promise.reject(new Error(I18N.carbonAccount.theHighestLevelReward2));
                if (v > 999999)
                  return Promise.reject(new Error(I18N.carbonAccount.theHighestLevelReward));
                return Promise.resolve('');
              },
            },
          ]}
        >
          <Input
            type='number'
            aria-label='rewardScore'
            defaultValue={t}
            min={0}
            max={999999}
            onChange={ev => {
              onValueChange(ev.target.value, record);
            }}
          />
        </Form.Item>
      ) : (
        t
      );
    },
  },
];
