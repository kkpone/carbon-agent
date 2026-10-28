/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-10 16:54:38
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-11 11:25:01
 */
import I18N from '@src/lang/I18N';
import { FromItemProps } from '@src/components/FormUtil/type';
import { RouteMaps, virtualLinkTransform } from '@src/router/route-paths';
import { PageInfoType, PageInfoTypeName } from '@src/router/type';
import { ListDictTypeAndDataByType } from '@src/views/emission/Show/type';
import { ButtonProps } from 'antd';
import { DataNode } from 'antd/lib/tree';
import { useHistory } from 'react-router-dom';

export const formItems = ({
  cascaderOptions,
}: {
  cascaderOptions: ListDictTypeAndDataByType[];
}) =>
  [
    {
      label: '',
      name: 'name',
      type: 'input',
      rules: false,
      placeholder: I18N.carbonFootprint3.emissionSourceName,
      props: {
        style: { width: 220 },
        maxLength: 50,
      },
    },
    {
      label: '',
      name: 'facility',
      type: 'input',
      rules: false,
      placeholder: I18N.components.emissionFacilityActivity,
      props: {
        style: { width: 220 },
        maxLength: 50,
      },
    },
    {
      label: '',
      name: 'activityUnit',
      type: 'cascader',
      rules: false,
      placeholder: I18N.components.activityDataSheet3,
      props: {
        style: { width: 220 },
        options: cascaderOptions,
        fieldNames: {
          label: 'dictLabel',
          value: 'dictValue',
          children: 'enumList',
        },
      },
    },
  ] as FromItemProps<any>[];

export const topButtons = (
  history: ReturnType<typeof useHistory>,
  selectedClassify?: DataNode,
) =>
  [
    {
      flag: 'enterprise:dictSource:add',
      btnProps: {
        'aria-label': I18N.carbonFootprint.newAddition,
        type: 'primary',
        onClick: () => {
          if (selectedClassify) {
            sessionStorage.setItem(
              'selectedClassify',
              JSON.stringify(selectedClassify),
            );
          }
          history.push(
            virtualLinkTransform(
              RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
              [PageInfoTypeName, ':id'],
              [PageInfoType.add, ''],
            ),
          );
        },
      },
    },
    {
      flag: 'enterprise:dictSource:import',
      btnProps: {
        'aria-label': I18N.carbonFootprint.import,
        type: 'defalut',
        onClick: () => {
          history.push(
            RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicImport,
          );
        },
      },
    },
  ] as { flag: string; btnProps: ButtonProps }[];
