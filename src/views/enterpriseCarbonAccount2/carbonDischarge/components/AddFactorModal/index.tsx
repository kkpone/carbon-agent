/*
 * @@description: 手动填写因子
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-04-28 16:30:29
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 19:47:31
 */
import {
  DownOutlined,
  InfoCircleOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Text } from '@components/formily/components/Text';
import {
  DatePicker,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  Cascader,
  Select,
} from '@formily/antd-v5';
import { createForm, onFieldValueChange } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { CO2E } from '@src/views/carbonInternational/organizationalManagement/utils';
import {
  ColUmsType,
  apiListALLByDictTypeData,
  apiMnumListALLByDictTypeBatch,
} from '@src/views/emission/Show/service';
import { Dicts } from '@src/views/emission/Show/type';
import { selectOptionMap } from '@src/views/emission/utils';
import { EmissionFactorMenu } from '@src/views/emission/utils/index-type';
import { changeDicts2Options } from '@src/views/utils';
import { Modal, Table, Tooltip } from 'antd';
import classNames from 'classnames';
import { noop } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import style from './index.module.less';
import { AddFactorModalProps } from './types';
import { defaultFactorData } from './utils';
import { FactorGasTableColumns } from '../../emissionAccount/emissionManage/columns';
import { factorSchema } from '../AddEmission/schema';
import { SelectFormily } from '../Selector';

export const AddFactorModal = ({
  isShow,
  factorData,
  defaultFactorName,
  ...modalProps
}: AddFactorModalProps) => {
  const SchemaField = createSchemaField({
    // 组件列表
    components: {
      FormLayout,
      FormGrid,
      FormItem,
      Input,
      Cascader,
      Select,
      DatePicker,
      SelectFormily,
      Text,
    },
  });
  // 是否展示table
  const [showGasList, setShowGasList] = useState(false);
  // 表格数据
  const [numberFactorDatas, setNumberFactorDatas] = useState<ColUmsType[]>(
    // co2e 不在表格中展示
    defaultFactorData().filter(d => !d.greenhouseGasesType.includes(CO2E)),
  );
  // 单位选项
  const [cascaderOptions, getCascaderOptions] = useState<Dicts[]>([]);
  const [menuList, getMenuList] = useState<EmissionFactorMenu>({});

  const apiListALLByDictTypeDataFn = async () => {
    const { data } = await apiListALLByDictTypeData({
      dictType: 'factorUnitM',
    });
    getCascaderOptions(data?.data || []);
  };
  const factorForm = useMemo(() => createForm({ readPretty: isShow }), []);

  const gasListColumns = FactorGasTableColumns({
    isDisabled: isShow ? 'detail' : '',
    menuList,
    cascaderOptions,
    setFactorDatas: setNumberFactorDatas,
    changeDenominator: noop,
  });

  const apiMnumListALLByDictTypeBatchFn = async () => {
    const { data } = await apiMnumListALLByDictTypeBatch({
      dictTypes: `sourceLanguage,factorDataType,reportArea,sourceLevel,factorUnitM,factorUnitZ,PFCseNUM,HFCsEnum,business,factorLabel,reportCountries,methaneUnitZ,nitrousUnitZ,hydrofluorocarbonUnitZ,perfluorocarbonUnitZ,sulfurUnitZ,nitrogenUnitZ,cequivalentUnitZ,firstClassify,placeOfPublication,formulaChance,documentType,carrierTypes,formulaUnitZ,formulaUnitM,forestryUnitZ,forestryUnitM,co2eFormulaUnitZ,co2eForestryUnitZ,transportationKMZ,co2eTransportationKMZ,transportationKMM,transportationTKMZ,co2eTransportationTKMZ,transportationTKMM`,
    });
    const result = data?.data;
    getMenuList(result);
  };
  // co2e 分子单位
  useEffect(() => {
    const numberTypeZ = menuList?.[selectOptionMap['CO₂e']];
    factorForm.setFieldState('.factorUnit', {
      dataSource: numberTypeZ?.map(t => ({
        value: t.dictValue,
        label: t.dictLabel,
      })),
    });
  }, [menuList]);
  // co2e 分母单位
  useEffect(() => {
    const dataSource = cascaderOptions.map(d => ({
      ...changeDicts2Options([d])?.[0],
      children: changeDicts2Options(d.enumList),
    }));
    factorForm.setFieldState('.factorUnitM', {
      dataSource,
    });
  }, [cascaderOptions]);

  // 上面分母单位变化，表格单位随之变化
  const addEffects = () => {
    setTimeout(() => {
      factorForm.addEffects('denominatorUnitListener', () => {
        onFieldValueChange('.factorUnitM', field => {
          const { value = [] } = field;
          if (value?.join(',') !== numberFactorDatas[0].factorUnitM) {
            setNumberFactorDatas(s =>
              s.map(v => ({ ...v, factorUnitM: value?.join(',') })),
            );
          }
        });
      });
    });
  };
  const rmEffects = () => {
    factorForm.removeEffects('denominatorUnitListener');
  };

  useEffect(() => {
    addEffects();

    return rmEffects;
  }, []);

  useEffect(() => {
    if (defaultFactorName) {
      factorForm.setInitialValuesIn('name', defaultFactorName);
    }
  }, [defaultFactorName, factorForm]);

  useEffect(() => {
    if (menuList && factorData) {
      const unit = menuList?.factorUnitM?.find(
        u => u.dictValue === factorData.factorUnitM?.[1],
      )?.dictLabel;
      factorForm.setFieldState('.factorUnitM', {
        visible: !isShow,
      });
      factorForm.setFieldState('.factorUnitM2', {
        visible: isShow,
      });
      factorForm.setValues({
        ...factorData,
        factorUnitM2: unit,
        factorValue: shouldHideEcoinventValue(factorData)
          ? ''
          : factorData.factorValue,
      });

      if (factorData.gasList?.length) {
        setNumberFactorDatas(
          factorData.gasList.filter(g => !g.greenhouseGasesType.includes(CO2E)),
        );
      }
    }
  }, [isShow, menuList]);

  // 表格分母单位变化，上面字段中的分母单位跟着变化
  useEffect(() => {
    const denominatorUnit = numberFactorDatas[0].factorUnitM;
    const formUnitM = factorForm.values?.factorUnitM;
    if (denominatorUnit && denominatorUnit !== formUnitM) {
      rmEffects();
      factorForm.setValues({ factorUnitM: denominatorUnit.split(',') });
      addEffects();
    }
  }, [numberFactorDatas]);

  useEffect(() => {
    apiMnumListALLByDictTypeBatchFn();
    apiListALLByDictTypeDataFn();
  }, []);
  /* 手动填写因子
   * co2e 不在表格中展示，提交数据时需要把值放到tableData 中
   */
  return (
    <Modal
      title={I18N.carbonFootprint.manualFilling}
      width={864}
      centered
      maskClosable={false}
      transitionName=''
      okButtonProps={{
        style: isShow ? { display: 'none' } : {},
      }}
      cancelText={
        isShow ? I18N.carbonFootprint.confirm2 : I18N.carbonFootprint.cancel
      }
      okText={I18N.carbonFootprint.preserve}
      {...modalProps}
      wrapClassName={classNames(style.addfactor, modalProps.wrapClassName)}
      onOk={async () =>
        modalProps?.onOk({
          form: factorForm,
          tableData: numberFactorDatas,
        })
      }
    >
      <FormilyCommon form={factorForm}>
        <SchemaField schema={factorSchema()} />
      </FormilyCommon>
      <div className={classNames('tip-word', style.addOtherGas)}>
        <div className=''>
          {showGasList ? (
            <UpOutlined onClick={() => setShowGasList(!showGasList)} />
          ) : (
            <DownOutlined onClick={() => setShowGasList(!showGasList)} />
          )}
          <span
            className={style.title}
            onClick={() => setShowGasList(!showGasList)}
          >
            {I18N.enterpriseCarbonAccount2.editGreenhouseGas}
            <Tooltip
              title={I18N.enterpriseCarbonAccount2.ifThereIsNoTemperature}
            >
              <InfoCircleOutlined />
            </Tooltip>
          </span>
        </div>
        {showGasList && (
          <Table
            style={{ width: '100%' }}
            scroll={{ y: 150 }}
            className={style.table}
            pagination={false}
            dataSource={numberFactorDatas}
            columns={gasListColumns}
          />
        )}
      </div>
    </Modal>
  );
};
