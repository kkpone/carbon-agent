/**
 * @file 减排场景表单 新增 编辑 详情
 * @author lixingchen
 * */

import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { Form, FormProps } from 'antd';
import '../../style.less';
import { FormActions } from '@src/components/FormActions';
import FormItemUtil from '@src/components/FormUtil/FormItemUtil';
import { formPropsInit } from '@src/components/FormUtil/util';
import { Page } from '@src/components/Page';
import { Toast } from '@src/utils/Toast';
import { apiListALLByDictTypeData } from '@src/views/emission/Show/service';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getFormList } from './formData';
import {
  apiEmissionInfo,
  apiEmissionEdit,
  apiEmissionAdd,
} from '../../service';

const titleMap = {
  add: I18N.enterpriseCarbonAccount2.newAdditionsAndDeletionsInLayout,
  edit: I18N.enterpriseCarbonAccount2.editingAndReducingLayout,
  detail: I18N.enterpriseCarbonAccount2.detailsOfEmissionReductionScenarios,
  undefined: I18N.enterpriseCarbonAccount2.emissionReductionScenarios,
};

const EmissionLessForm = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const id = new URLSearchParams(window.location.search).get('id');
  const [pageType, setPageType] = useState<'add' | 'edit' | 'detail'>();
  const [sceneType, setSceneType] = useState<string[]>(['0']);
  const [unitMList, setUnitMList] = useState<any>([]);
  const [unitObject, setUnitObject] = useState<any>({
    unitInitValue: 0,
    unitEndValue: 0,
    unitQuantity: 0,
    unitLessenType: 0,
  });
  const [totalObject, setTotalObject] = useState<any>({
    totalInitValue: 0,
    totalEndValue: 0,
    totalQuantity: 0,
    totalLessenType: 0,
  });
  const basicsFormProps: FormProps = {
    ...formPropsInit(),
    form,
    layout: 'vertical',
    labelCol: { span: 24 },
    wrapperCol: { span: 24 },
  };
  const getDeatil = id => {
    apiEmissionInfo(id).then((res: any) => {
      const { data } = res.data;
      form.setFieldsValue({
        ...data,
        sceneType: data.sceneType?.split(','),
        unitUnitType: data.unitUnitType?.split(','),
        totalInitValue: data.totalInitValue || data.totalQuantity,
        unitInitValue: data.unitInitValue || data.unitQuantity,
      });

      setSceneType(data.sceneType?.split(','));
      setUnitObject({
        unitInitValue: data.unitInitValue,
        unitEndValue: data.unitEndValue,
        unitQuantity: data.unitQuantity,
        unitLessenType: data.unitLessenType,
      });
      setTotalObject({
        totalInitValue: data.totalInitValue,
        totalEndValue: data.totalEndValue,
        totalQuantity: data.totalQuantity,
        totalLessenType: data.totalLessenType,
      });
    });
  };
  const [baseItemForm, emsiionLessItemForm, unitLessDeschargeItemForm] =
    getFormList(
      pageType,
      unitMList,
      setSceneType,
      setUnitObject,
      unitObject,
      setTotalObject,
      totalObject,
      sceneType,
      form,
    );

  useEffect(() => {
    apiListALLByDictTypeData({ dictType: 'factorUnitM' }).then(res => {
      setUnitMList(res.data.data);
    });
    const path = history.location.pathname;
    if (
      path ===
      RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneAdd
    ) {
      setTotalObject({
        totalInitValue: null,
        totalEndValue: null,
        totalQuantity: null,
        totalLessenType: null,
      });
      setUnitObject({
        unitInitValue: null,
        unitEndValue: null,
        unitQuantity: null,
        unitLessenType: null,
      });
      setPageType('add');
    }
    if (
      path ===
      RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneEdit
    ) {
      setPageType('edit');
    }
    if (
      path ===
      RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneDetail
    ) {
      setPageType('detail');
    }
    if (id) {
      getDeatil(id);
    } else {
      form.setFieldsValue({
        sceneType: ['0'],
      });
    }
  }, []);

  const renturnBtnArr = () => {
    const save = {
      type: 'primary',
      title: I18N.carbonFootprint.preserve,
      onClick: async () => {
        const formData = form.getFieldsValue(true);

        if (formData.unitUnitType?.length !== 2 && sceneType.includes('1')) {
          Toast('warn', I18N.enterpriseCarbonAccount2.pleaseAddUnit3);
          return;
        }
        if (
          !unitObject.unitInitValue &&
          sceneType.includes('1') &&
          formData.unitLessenType === 1
        ) {
          Toast('warn', I18N.enterpriseCarbonAccount2.pleaseAddUnit2);
          return;
        }
        if (
          !unitObject.unitEndValue &&
          sceneType.includes('1') &&
          formData.unitLessenType === 1
        ) {
          Toast('warn', I18N.enterpriseCarbonAccount2.pleaseAddUnit);
          return;
        }
        if (
          !totalObject.totalInitValue &&
          sceneType.includes('0') &&
          formData.totalLessenType === 1
        ) {
          Toast(
            'warn',
            I18N.enterpriseCarbonAccount2.pleaseAddTheTotalDeduction2,
          );
          return;
        }
        if (
          !totalObject.totalEndValue &&
          sceneType.includes('0') &&
          formData.totalLessenType === 1
        ) {
          Toast(
            'warn',
            I18N.enterpriseCarbonAccount2.pleaseAddTheTotalDeduction,
          );
          return;
        }
        form.validateFields().then(() => {
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            ...totalObject,
            ...unitObject,
          });
          let data = {
            ...formData,
            // ...totalObject,
            // ...unitObject,
            sceneType: formData.sceneType?.join(','),
            unitUnitType: formData.unitUnitType?.join(','),
          };
          const sceneType = form.getFieldValue('sceneType');
          if (sceneType.length === 2) {
            data = { ...data, ...totalObject, ...unitObject };
          } else if (sceneType.includes('0')) {
            data = {
              ...data,
              ...totalObject,
              unitInitValue: null,
              unitEndValue: null,
              unitQuantity: null,
              unitLessenType: null,
              unitDesc: '',
              unitUnit: '',
              unitUnitType: '',
            };
          } else if (sceneType.includes('1')) {
            data = {
              ...data,
              ...unitObject,
              totalInitValue: null,
              totalEndValue: null,
              totalQuantity: null,
              totalLessenType: null,
              totalDesc: '',
              totalUnit: '',
            };
          }

          const api = id ? apiEmissionEdit : apiEmissionAdd;
          api(data).then((res: any) => {
            if (res.data.code === 200) {
              Toast('success', I18N.carbonFootprint.operationSuccessful);
              setTimeout(() => {
                history.goBack();
              }, 400);
            }
          });
        });
      },
    };
    const back = {
      type: 'default',
      title:
        pageType === 'detail'
          ? I18N.carbonFootprint.return
          : I18N.carbonFootprint.cancel,
      onClick: async () => {
        history.goBack();
      },
    };
    if (pageType === 'detail') {
      return [back];
    }
    return [save, back];
  };

  return (
    <div className='enterprise-carbon-account2 emissionless-box'>
      <Page
        breadCrumbs={[
          {
            title: I18N.enterpriseCarbonAccount2.emissionReductionScenarios,
            key: I18N.enterpriseCarbonAccount2.emissionReductionScenarios,
            href: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneList,
          },
          {
            title: titleMap[pageType || 'undefined'],
            key: I18N.enterpriseCarbonAccount2.emissionSourceManagement,
            href: ``,
          },
        ]}
      >
        <div
          className='bg-box'
          style={{
            borderBottom: sceneType.length !== 0 ? '10px solid #F7F8F9' : 0,
          }}
        >
          <div className='form-box padd-b-0 mar-t-15'>
            <FormItemUtil
              antdFormProps={basicsFormProps}
              formItems={baseItemForm}
              paddRight={30}
            />
          </div>
        </div>
        <div
          className='bg-box'
          style={{
            display: sceneType.includes('0') ? 'block' : 'none',
            borderBottom: sceneType.includes('1') ? '10px solid #F7F8F9' : 0,
          }}
        >
          <div className='form-box padd-b-0 mar-t-15'>
            <span className='title'>
              {I18N.enterpriseCarbonAccount2.totalEmissionReduction}
            </span>
            <FormItemUtil
              antdFormProps={basicsFormProps}
              formItems={emsiionLessItemForm}
              paddRight={30}
            />
          </div>
        </div>

        <div
          className='bg-box'
          style={{
            display: sceneType.includes('1') ? 'block' : 'none',
            borderBottom: sceneType.includes('0') ? '10px solid #F7F8F9' : 0,
            overflow: 'inherit',
            height: 300,
          }}
        >
          <div
            className='form-box padd-b-0 mar-t-15'
            style={{
              marginBottom: unitObject.unitLessenType === 1 ? -32 : 0,
            }}
          >
            <span className='title'>
              {I18N.enterpriseCarbonAccount2.unitEmissionReduction}
            </span>
            {/* <span className='name-position'>/</span> */}
            <FormItemUtil
              antdFormProps={basicsFormProps}
              formItems={unitLessDeschargeItemForm}
              paddRight={30}
            />
          </div>
        </div>
      </Page>
      {/* @ts-ignore */}
      <FormActions place='center' buttons={renturnBtnArr()} />
    </div>
  );
};
export default EmissionLessForm;
