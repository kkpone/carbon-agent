/**
 * @description 外售产品信息
 */

import { ActionType, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { compact } from 'lodash-es';
import { useRef, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { InfoTitle } from '@/components/InfoTitle';
import { useCbamPageInfo } from '@/views/cbam/ReportForm/Info/context';
import I18N from '@/lang/I18N';
import { PageTypeInfo } from '@/router/utils/enums';
import { Toast } from '@/utils';

import { ProductInfo } from './Info';
import { productColumns } from './columns';
import { getSaleProductListApi } from '../../service';
import { SaleProductResp } from '../../type';

const { add } = PageTypeInfo;

interface ProductSaleInfoProps {
  /** 下一步方法 */
  onClickNextStep: ({ reportId }: { reportId?: number }) => void;
  /** 返回方法 */
  onClickBack: () => void;
  /** 是否是CBAM跳转 */
  isCbamInfo?: boolean;
}

const ProductSaleInfo = ({
  onClickNextStep,
  onClickBack,
  isCbamInfo,
}: ProductSaleInfoProps) => {
  const { isDetail, id: cbamId } = useCbamPageInfo();

  const actionRef = useRef<ActionType>();

  /** 控制工序详情的抽屉 */
  const [open, setOpen] = useState(false);

  /** 产品ID */
  const [productId, setProcessId] = useState<number>();

  /** total */
  const [productTotal, setProcessTotal] = useState<number>(0);

  /** 列表操作按钮的类型 */
  const [actionBtnType, setActionBtnType] = useState<string>();

  /** 操作按钮 */
  const onActionBtnClick = (type: string, id?: number) => {
    /** 操作按钮的类型 */
    setActionBtnType(type);
    /** 工序ID */
    setProcessId(id);
    /* 打开详情抽屉 */
    setOpen(true);
  };

  /** 刷新表格 */
  const reload = () => {
    actionRef.current?.reload();
  };

  /** 初始化抽屉 */
  const onInit = () => {
    setProcessId(undefined);
    setActionBtnType(undefined);
    setOpen(false);
  };

  return (
    <div>
      <InfoTitle
        title={I18N.cbam.externalSalesProductLetter2}
        rightRender={
          !isDetail && (
            <Button
              type='primary'
              onClick={() => {
                /** 外售产品建立数量上限100个，点击新增时toast提示：“新建失败，外售产品数量最大为100” */
                if (productTotal >= 100) {
                  Toast('error', I18N.cbam.newCreationFailed3);
                  return;
                }

                onActionBtnClick(add);
              }}
            >
              {I18N.Factors.newAddition}
            </Button>
          )
        }
      />

      <ProTable<SaleProductResp>
        actionRef={actionRef}
        key={`productTable${cbamId}`}
        rowKey='id'
        search={false}
        pagination={false}
        toolBarRender={false}
        columns={productColumns({ isDetail, onActionBtnClick, reload })}
        params={{
          cbamId,
        }}
        request={async params => {
          if (params?.cbamId) {
            return getSaleProductListApi({
              cbamId: params?.cbamId,
            }).then(({ data }) => {
              const total = data?.data?.length || 0;
              setProcessTotal(total);
              return {
                data: data?.data || [],
                success: true,
                total,
              };
            });
          }
          return { data: [], success: true };
        }}
      />

      {/* 外售产品信息详情抽屉 */}
      <ProductInfo
        open={open}
        productId={productId}
        cbamId={cbamId}
        actionBtnType={actionBtnType}
        onOk={() => {
          onInit();
          reload();
        }}
        onClose={() => onInit()}
      />

      <FormActions
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.carbonFootPrintLCA.nextStep,
            type: 'primary',
            onClick: async () => {
              onClickNextStep({ reportId: cbamId });
            },
          },
          (!isDetail || isCbamInfo) && {
            title: I18N.Factors.return,
            onClick: async () => {
              onClickBack();
            },
          },
        ])}
      />
    </div>
  );
};

export default ProductSaleInfo;
