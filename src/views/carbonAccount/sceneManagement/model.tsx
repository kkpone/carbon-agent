/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-09-22 14:15:46
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-16 18:53:21
 */
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import { Tags } from '@src/components/UI/Tags';
import I18N from '@src/lang/I18N';
import { SceneDto } from '@src/sdks/java/carbonAccount';
import { Options } from '@src/typings/utils';
import { ColumnsType } from 'antd/es/table';

const sceneType = {
  0: I18N.carbonFootprint.enabled,
  1: I18N.carbonFootprint.deactivated,
};

/**
 * 场景管理表格的表头
 * @returns
 */
export const carbonAccountSceneManageTableCol = (
  page: number,
  size: number,
): ColumnsType<SceneDto> => [
  {
    title: I18N.carbonFootprint.number,
    dataIndex: 'sIndex',
    render: (_, record, index) => (page - 1) * size + index + 1,
  },
  {
    title: I18N.carbonAccount.sceneEncoding,
    dataIndex: 'sceneCode',
  },
  {
    title: I18N.carbonAccount.sceneName,
    dataIndex: 'sceneName',
  },
  {
    title: I18N.carbonFootprint3.sort,
    dataIndex: 'orderNum',
  },
  {
    title: I18N.carbonAccount.sceneType,
    dataIndex: 'sceneType',
    render: (val: number) => {
      const arr = [
        I18N.carbonAccount.default,
        I18N.carbonAccount.smallTasks,
        I18N.carbonFootprint.custom,
      ];
      return arr[val];
    },
  },
  {
    title: I18N.carbonAccount.classification,
    dataIndex: 'sceneClassify_name',
  },
  {
    title: I18N.carbonAccount.carbonReductionCoefficient,
    dataIndex: 'rate',
  },
  {
    title: I18N.carbonAccount.unitActivityCarbon2,
    dataIndex: 'unitScore',
  },
  {
    title: I18N.carbonFootprint.state,
    dataIndex: 'sceneStatus',
    render: (val: number) => (
      <div>
        {val === 0 ? (
          <Tags tagText={sceneType[val]} color='blue' kind='raduis' />
        ) : (
          <Tags tagText={sceneType[1]} color='default' kind='raduis' />
        )}
      </div>
    ),
  },
];

/**
 * 用户列表的搜索
 */
export const carbonAccountSceneManageSearchForm = ({
  sceneClassify,
}: {
  sceneClassify?: Options;
}): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    formItemInputSchema({
      placeholder: I18N.carbonAccount.sceneName,
      name: 'likeSceneName',
    }),
    // todo 接口还不支持
    formItemInputSchema({
      placeholder: I18N.carbonAccount.sceneEncoding,
      name: 'sceneCode',
      props: { maxLength: 50 },
    }),
    formItemInitType('select', '', 'sceneClassify', false, {
      props: {
        placeholder: I18N.carbonAccount.classification,
        options: sceneClassify,
      },
    }),
    formItemInitType('select', '', 'sceneStatus', false, {
      props: {
        placeholder: I18N.carbonFootprint.state,
        options: Object.keys(sceneType).map(s => ({
          label: sceneType[s],
          value: s,
        })),
      },
    }),
  ];
  return data.map(item => {
    const back = item;
    back.props = {
      ...back.props,
      style: { width: '200px' },
    };
    return back;
  });
};
