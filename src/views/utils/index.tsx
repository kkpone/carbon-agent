import I18N from '@src/lang/I18N';
import { Options } from '@src/typings/utils';
import { addEllipsisToColumn } from '@src/utils';
import { Dicts } from '@src/views/emission/Show/type';
import { ColumnsType } from 'antd/es/table';

/**
 * 1 自有因子 2 收藏因子 3 碳因子
 */
export enum FactorUse {
  'carbonstop' = '2',
  'organization' = '1',
  'all' = '3',
}

const cutZero = (old: string) => {
  // 拷贝一份 返回去掉零的新串
  let newstr = old;
  // 循环变量 小数部分长度
  const leng = old.length - old.indexOf('.') - 1;

  // 判断是否有效数
  if (old.indexOf('.') > -1) {
    // 循环小数部分
    for (let i = leng; i > 0; i--) {
      // 如果newstr末尾有0
      if (newstr.lastIndexOf('0') > -1 && newstr.slice(-1) === '0') {
        const k = newstr.lastIndexOf('0');
        // 如果小数点后只有一个0 去掉小数点
        if (newstr.charAt(k - 1) === '.') {
          return newstr.substring(0, k - 1);
        }
        // 否则 去掉一个0
        newstr = newstr.substring(0, k);
      } else {
        // 如果末尾没有0
        return newstr;
      }
    }
  }

  return old;
};

// 因子搜索 column
export const searchFactorColumns = <T,>(): ColumnsType<T> =>
  addEllipsisToColumn<T>([
    {
      title: I18N.carbonFootprint.factorName,
      dataIndex: 'emission_factor_name',
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.year,
      dataIndex: 'year',
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.emissionFactors,
      dataIndex: 'emission_factor',
      render: text => (text ? cutZero(text) : '-'),
    },
    {
      title: I18N.carbonFootprint.unit,
      dataIndex: 'emission_factor_unit',
      render: text => text || '-',
    },
    // {
    //   title: '适用行业',
    //   dataIndex: 'business',
    // },
    {
      title: I18N.carbonFootprint.publishingInstitution,
      dataIndex: 'emission_factor_resource',
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.country,
      dataIndex: 'country',
      render: text => text || '-',
    },
    {
      title: I18N.carbonFootprint.scenarioDescription,
      dataIndex: 'description',
      render: text => text || '-',
    },
  ]);

/**
 * @description 将字典值改为select可用的option选项
 */
export const changeDicts2Options = (
  dicts?: Dicts[],
  changeshow?: { label?: keyof Dicts; value?: keyof Dicts },
): Options | undefined =>
  dicts?.map(d => ({
    ...d,
    label: String(changeshow?.label ? d[changeshow?.label] : d.dictLabel),
    value: String(changeshow?.value ? d[changeshow.value] : d.dictValue),
  }));
