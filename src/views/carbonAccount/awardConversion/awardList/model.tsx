import I18N from '@src/lang/I18N';
import { Image } from 'antd';
import { FromItemProps } from '@src/components/FormUtil/type';
import {
  formItemInitInput,
  formItemInitType,
  formItemInputSchema,
} from '@src/components/FormUtil/util';
import { ColumnsType } from 'antd/es/table';
import { compact } from 'lodash-es';
import { Tags } from '@src/components/UI/Tags';
import { CarbonAccountAwardListTable } from './type';
import { Organizations } from '../../baseSetting/utils/types';
import styles from './index.module.less';

/**
 * 奖品列表
 * @returns
 */
export const carbonAccountAwardListTableCol = ({
  flatOrganizations,
}: {
  flatOrganizations: Organizations[];
}): ColumnsType<CarbonAccountAwardListTable> => [
  {
    title: I18N.components.coverImage,
    dataIndex: 'imgPath',
    render: (val: string) => <Image height={80} src={val} />,
  },
  {
    title: I18N.carbonAccount.prizeName,
    dataIndex: 'goodsName',
  },
  {
    title: I18N.carbonAccount.effectiveChannels,
    dataIndex: 'orgIds',
    render(vals) {
      const res = compact(
        vals
          ?.split(',')
          ?.map(
            v => flatOrganizations?.find(org => org.id === +v)?.orgName || '',
          ),
      );
      return res?.join('、');
    },
  },
  {
    title: I18N.carbonAccount.consumptionOfCarbonCoins2,
    dataIndex: 'score',
  },
  {
    title: I18N.carbonAccount.exchangeCap,
    dataIndex: 'countLimit',
    render: (val: number, item: CarbonAccountAwardListTable) =>
      item.limitFlag === 0 ? '-' : val,
  },
  {
    title: I18N.carbonAccount.redeemed,
    dataIndex: 'saleAmount',
  },
  {
    title: I18N.carbonAccount.remainingInventory,
    dataIndex: 'amount',
  },
  {
    title: I18N.carbonFootprint.state,
    dataIndex: 'goodsStatus',
    render: (val: number) => (
      <div>
        {val === 0 ? (
          <Tags
            tagText={I18N.carbonAccount.notListed}
            color='default'
            kind='raduis'
          />
        ) : (
          <Tags
            tagText={I18N.carbonAccount.listed}
            color='blue'
            kind='raduis'
          />
        )}
      </div>
    ),
  },
  {
    title: I18N.carbonFootprint.creationTime,
    dataIndex: 'createTime',
  },
];
/** 所属分组 */
export const organizationFormItems = ({
  organizations,
  placeholder,
  label,
  name,
  props,
}: {
  organizations: Organizations[];
  placeholder?: string;
  label?: string;
  name?: string;
  props?: FromItemProps<'treeSelect'>['props'];
}): FromItemProps<'treeSelect'> =>
  formItemInitType('treeSelect', label || '', name || 'orgIds', false, {
    props: {
      className: styles.treeSelect,
      treeData: organizations,
      treeCheckable: true,
      placeholder: placeholder || I18N.carbonAccount.effectiveChannels,
      fieldNames: {
        label: 'orgName',
        value: 'id',
      },
      ...props,
    },
  });
/**
 * 兑换列表的搜索
 */
export const carbonAccountAwardListSearchForm = ({
  organizations,
}: {
  organizations: Organizations[];
}): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    formItemInputSchema({
      placeholder: I18N.carbonAccount.prizeName,
      name: 'goodsName',
    }),
    {
      ...formItemInitType('select', '', 'goodsStatus', false),
      props: {
        placeholder: I18N.carbonFootprint.state,
        options: [
          {
            label: I18N.carbonAccount.notListed,
            value: 0,
          },
          {
            label: I18N.carbonAccount.listed,
            value: 1,
          },
        ],
      },
    },
    organizationFormItems({ organizations }),
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

/**
 * 兑换列表的出库表单
 * @returns
 */
export const carbonAccountawardListlStockRemovalItem = (
  status: boolean,
  stockInInfo?: CarbonAccountAwardListTable,
): FromItemProps<any>[] => {
  const data: FromItemProps<any>[] = [
    formItemInitInput(I18N.carbonAccount.prizeName, 'goodsName', false),
    formItemInitInput(
      I18N.carbonAccount.consumptionOfCarbonCoins2,
      'score',
      false,
    ),
    formItemInitInput(I18N.carbonAccount.currentInventory, 'saleAmount', false),
    {
      ...formItemInitType(
        'inputNumber',
        status
          ? I18N.carbonAccount.outboundQuantity
          : I18N.carbonAccount.inventoryQuantity,
        'amount',
        true,
      ),
      rulesCustom: [
        () => ({
          validator(_: any, validatorVal: number) {
            if (!validatorVal) {
              return Promise.reject(
                new Error(status ? I18N.carbonAccount.deliveryQuantityMustBe2 : I18N.carbonAccount.theQuantityOfGoodsReceivedMustBe),
              );
            }
            if (status && stockInInfo?.amount) {
              if (validatorVal > stockInInfo.amount)
                return Promise.reject(
                  new Error(I18N.carbonAccount.deliveryQuantityMustBe),
                );
            }
            return Promise.resolve();
          },
        }),
      ],
    },
  ];
  return data.map(item => {
    const back = item;
    back.col = 12;
    if (item.name !== 'amount') {
      back.props = {
        disabled: true,
      };
    }
    return back;
  });
};
