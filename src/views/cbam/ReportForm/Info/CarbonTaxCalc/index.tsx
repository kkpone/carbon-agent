/**
 * @description 碳税计算
 */
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Button, Modal, Space } from 'antd';
import classNames from 'classnames';
import { compact } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { InfoTitle } from '@/components/InfoTitle';
import { useCbamPageInfo } from '@/views/cbam/ReportForm/Info/context';
import I18N from '@/lang/I18N';
import { PageTypeInfo } from '@/router/utils/enums';
import { modelFooterBtnStyle, Toast } from '@/utils';
import { downloadFile } from '@/views/carbonData/enterpriseCarbonAccounting/commonFn';
import { useCbamEnums } from '@/views/cbam/hook';
import { useAllEnumsBatch } from '@/views/dashborad/Dicts/hooks';

import { CarbonTaxInfo } from './Info';
import { columns } from './columns';
import style from './index.module.less';
import {
  exportCarbonTax,
  getCarbonTaxCalc,
  getCarbonTaxListApi,
  getCarbonTaxStatus,
} from '../../service';
import { CarbonTaxResp } from '../../type';
import { CARBON_TAX_CALC_STATUS } from '../constant';

const { NOT_CALC, CALC_ING, CALC_END, VERSION_NOT_SAME } =
  CARBON_TAX_CALC_STATUS;
const { add } = PageTypeInfo;

interface CarbonTaxCalcProps {
  onClickPreStep: ({ reportId }: { reportId?: number }) => void;
  onClickNextStep: ({ reportId }: { reportId?: number }) => void;
  onClickBack: () => void;
  isCbamInfo?: boolean;
}

const CarbonTaxCalc = ({
  onClickPreStep,
  onClickNextStep,
  onClickBack,
  isCbamInfo,
}: CarbonTaxCalcProps) => {
  const { isDetail, id: cbamId } = useCbamPageInfo();
  const actionRef = useRef<ActionType>();
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const taxTypeEnum = useCbamEnums('TaxType');
  const offsetMethodEnum = useCbamEnums('OffsetMethod');
  const enumOptions = useAllEnumsBatch('CBAMCurrency,CBAMcountryinfo');
  const currencyTypeEnum = enumOptions?.CBAMCurrency || [];
  const countryTypeEnum = enumOptions?.CBAMcountryinfo || [];
  const [calcStatus, setCalcStatus] = useState<number>();
  const [tips, setTips] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [taxId, setTaxId] = useState<number>();
  const [actionBtnType, setActionBtnType] = useState<string>();

  const getCalcStatus = async () => {
    if (!cbamId) return;
    const { data } = await getCarbonTaxStatus({ cbamId });
    setCalcStatus(data?.data);
  };

  const reload = () => actionRef.current?.reload();

  const onActionBtnClick = (type: string, id?: number) => {
    setActionBtnType(type);
    setTaxId(id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setActionBtnType(undefined);
    setTaxId(undefined);
  };

  useEffect(() => {
    getCalcStatus();
  }, [cbamId]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    switch (calcStatus) {
      case CALC_ING:
        setTips(I18N.cbam.emissionResultCalculation2);
        timerRef.current = setInterval(getCalcStatus, 5000);
        break;
      case CALC_END:
        setTips(I18N.cbam.emissionResultCalculation);
        reload();
        break;
      case NOT_CALC:
      case VERSION_NOT_SAME:
        setTips('');
        if (!isDetail) {
          Modal.confirm({
            title: I18N.Factors.prompt,
            icon: '',
            content: (
              <span>
                {I18N.cbam.reportDetected}
                <br />
                {I18N.cbam.carbonTaxActualRecalculationNotice}
              </span>
            ),
            ...modelFooterBtnStyle,
            okText: I18N.base.confirm,
            cancelText: I18N.Factors.cancel,
            onOk: async () => {
              if (!cbamId) return;
              const { data } = await getCarbonTaxCalc({ cbamId });
              if (data) {
                Toast('success', I18N.carbonFootPrintLCA.calculationCompleted);
              }
              await getCalcStatus();
            },
            onCancel: () => onClickPreStep?.({ reportId: cbamId }),
          });
        }
        break;
      default:
        setTips('');
        break;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [calcStatus]);

  return (
    <div>
      <InfoTitle
        title={I18N.cbam.carbonTaxCalculation}
        rightRender={
          <Space>
            <Button
              disabled={!cbamId}
              onClick={async () => {
                if (!cbamId) return;
                const response = await exportCarbonTax(cbamId);
                downloadFile(response.data, response);
              }}
            >
              {I18N.cbam.exportCarbonTaxCalculationSheet}
            </Button>
            {!isDetail && (
              <Button
                type='primary'
                disabled={calcStatus === CALC_ING}
                onClick={() => onActionBtnClick(add)}
              >
                {I18N.cbam.addProductCarbonTax}
              </Button>
            )}
          </Space>
        }
      />
      <div
        className={classNames(style.tips, {
          [style.calcEnd]: calcStatus === CALC_END,
          primaryColor: calcStatus === CALC_ING,
        })}
      >
        {tips}
      </div>
      <ProTable<CarbonTaxResp>
        actionRef={actionRef}
        key={`carbonTaxTable${cbamId}`}
        rowKey='id'
        search={false}
        pagination={false}
        toolBarRender={false}
        scroll={{ x: 2220 }}
        columns={columns({
          isDetail,
          taxTypeEnum,
          currencyTypeEnum,
          offsetMethodEnum,
          onActionBtnClick,
          reload,
        })}
        params={{ cbamId }}
        request={async params => {
          if (!params.cbamId) return { data: [], success: true };
          const { data } = await getCarbonTaxListApi({
            cbamId: params.cbamId,
          });
          return {
            data: data?.data || [],
            success: true,
            total: data?.data?.length || 0,
          };
        }}
      />

      <CarbonTaxInfo
        open={drawerOpen}
        actionBtnType={actionBtnType}
        taxId={taxId}
        cbamId={cbamId}
        currencyTypeEnum={currencyTypeEnum}
        countryTypeEnum={countryTypeEnum}
        onClose={closeDrawer}
        onOk={() => {
          closeDrawer();
          reload();
        }}
      />

      <FormActions
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.carbonFootPrintLCA.nextStep,
            type: 'primary',
            onClick: async () => onClickNextStep({ reportId: cbamId }),
          },
          (!isDetail || isCbamInfo) && {
            title: I18N.Factors.return,
            onClick: async () => onClickBack(),
          },
        ])}
      />
    </div>
  );
};

export default CarbonTaxCalc;
