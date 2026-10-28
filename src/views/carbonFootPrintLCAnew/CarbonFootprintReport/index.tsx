/**
 * @description 碳足迹报告列表页
 */

import { PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Form } from 'antd';
import { CheckboxOptionType } from 'antd/es/checkbox';
import { useState } from 'react';
import { useTable, withTable } from 'table-render';

import { Page } from '@/components/LcaPage';
import { TableRender } from '@/components/x-render/TableRender';
import type { CustomSearchProps } from '@/components/x-render/TableRender/types';
import { useOrgs } from '@/hooks';
import { useDrawer } from '@/hooks/useDrawer';
import usePageType from '@/hooks/usePageType';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { useNavigate } from '@/utils/polyfill';
import { refreshAction } from '@/utils/refresh';

import { CarbonFootprintReportInfo } from './Info';
import { columns } from './columns';
import { searchSchema } from './schemas';
import { getReportList } from './service';
import { ReportProps, Request } from './type';
import { useLcaEnums } from '../hook';

const { add, edit, show } = PageTypeInfo;

const CarbonFootprintReport = () => {
  const { refresh } = useTable();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  /** 设置页面抽屉状态 */
  const { pageType, setModelAction } = usePageType(add);

  const { visible, showDrawer, onClose } = useDrawer();

  /** 报告语言option */
  // const plainOptions = useLcaEnums('LcaLangType')?.map(lcaLangTypeItem => ({
  //   label: lcaLangTypeItem.name,
  //   value: lcaLangTypeItem.code,
  // }));

  /** 数据质量类别枚举 */
  const dataQualityCategoryOptions = useLcaEnums('DataQualityCategory')?.map(
    dataQualityCategoryItem => ({
      label: dataQualityCategoryItem.name,
      value: dataQualityCategoryItem.code,
    }),
  );

  /** 所属组织枚举 */
  const orgList = useOrgs();

  /** 报告ID */
  const [reportId, setReportId] = useState<number>();

  /** 列表操作按钮 */
  const onActionBtnClick = (type: PageTypeInfo, id?: number) => {
    /** 校验ID */
    if (!id) return; // 如果没有 id 直接返回，避免无效操作

    /** 根据类型设置操作 */
    switch (type) {
      case edit:
      case show:
        /** 报告id */
        setReportId(id);
        setModelAction(type); // 设置模型操作类型
        showDrawer(); // 显示抽屉
        break;
      default:
    }
  };

  const onInit = () => {
    setReportId(undefined);
    setModelAction(add);
    onClose();
  };

  const searchApi: CustomSearchProps<ReportProps, Request> = args =>
    getReportList(args).then(({ data }) => data?.data);

  return (
    <Page
      title={I18N.carbonFootPrintLCA.carbonFootprintReport}
      onBtnClick={async () => {
        setModelAction?.(add);
        setReportId(undefined);
        showDrawer();
      }}
      actionBtnChild={checkAuth(
        '/carbonFootprintLCAnew/report/add',
        <div>
          <PlusOutlined /> {I18N.Factors.newAddition}
        </div>,
      )}
    >
      <TableRender<ReportProps, Request>
        searchProps={{
          schema: searchSchema(orgList),
          api: searchApi,
        }}
        tableProps={{
          columns: columns({
            navigate,
            // plainOptions: plainOptions as CheckboxOptionType[],
            dataQualityCategoryOptions:
              dataQualityCategoryOptions as CheckboxOptionType[],
            refresh,
            onActionBtnClick,
            form,
          }),
          scroll: { x: 1800 },
        }}
        autoSaveSearchInfo
        autoAddIndexColumn
        autoFixNoText
      />

      {/* 碳足迹报告详情抽屉 */}
      <CarbonFootprintReportInfo
        open={visible}
        reportId={reportId}
        actionBtnType={pageType || add}
        onOk={() => {
          onInit();
          refreshAction(pageType !== add, refresh);
        }}
        onClose={() => onInit()}
      />
    </Page>
  );
};
export default withTable(CarbonFootprintReport);
