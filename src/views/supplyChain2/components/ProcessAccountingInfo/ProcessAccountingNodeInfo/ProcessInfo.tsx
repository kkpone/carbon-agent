import {
  FormItem,
  FormGrid,
  Input,
  Select,
  DatePicker,
} from '@formily/antd-v5';
import { createForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import FormilyCommon from '@src/components/FormilyUtil/FormilyCommon';
import I18N from '@src/lang/I18N';
import { GetComponentProps } from '@src/utils/utilTypes';
import EmissionDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer';
import ExportDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ExportDrawer';
import OutPutDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer';
import ProcessDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProcessDrawer';
import ProductDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProductDrawer';
import { Button, Radio, Spin, Table } from 'antd';
import { VFC, useMemo, useState, useEffect } from 'react';

import TableExpandRow from './ExpandRow';
import {
  genInTableColumns,
  genOutTableColumns,
  genProductRootTableColumns,
  genProductTableColumns,
} from './columns';
import styles from './index.module.less';
import { genProcessBasicInfoSchema, genProcessRepSchema } from './schema';
import { MATCH_WAY, MATCH_WAY_LABEL } from '../constant';
import {
  getEmissionInfo,
  getOutputList,
  getProcessDetails,
  getProcessInDetails,
  getProcessInfo,
  getProductList,
} from '../service';
import {
  Process,
  ProcessAccounting,
  ProcessIn,
  ProcessOut,
  ProcessProduct,
} from '../type';

const PROCESS_DESC = {
  value: 'DESC',
  name: I18N.carbonFootprint3.processDescription,
};
const PROCESS_IN_OUT = {
  value: 'IN_OUT',
  name: I18N.carbonFootprint3.inputOutput,
};
const EMISSION_MATCH_WAY_OPTIONS = [
  { value: MATCH_WAY.FACTOR, label: MATCH_WAY_LABEL[MATCH_WAY.FACTOR] },
  {
    value: MATCH_WAY.FACTOR_CREATE,
    label: MATCH_WAY_LABEL[MATCH_WAY.FACTOR_CREATE],
  },
  {
    value: MATCH_WAY.SUPPLIER,
    label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
  },
];
const SchemaField = createSchemaField({
  components: { FormItem, FormGrid, Input, Select, DatePicker },
});
type ProcessInfoProps = {
  process: ProcessAccounting;
  parentProcess: ProcessAccounting | null;
  flag?: boolean;
};

const ProcessInfo: VFC<ProcessInfoProps> = ({
  process,
  parentProcess,
  flag,
}) => {
  const [loading, setLoading] = useState(false);

  const [infoType, setInfoType] = useState(PROCESS_IN_OUT.value);

  const [processInfo, setProcessInfo] = useState<Partial<Process>>({});

  const [processDetails, setProcessDetails] = useState<{
    processIns: ProcessIn[];
    processOuts: ProcessOut[];
    processProducts: ProcessProduct[];
  }>({ processIns: [], processOuts: [], processProducts: [] });

  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const [productDrawerProps, setProductDrawerProps] = useState<
    Partial<GetComponentProps<typeof ProductDrawer>>
  >({});

  const [outputDrawerProps, setOutputDrawerProps] = useState<
    Partial<GetComponentProps<typeof OutPutDrawer>>
  >({});

  const [exportDrawerProps, setExportDrawerProps] = useState<
    Partial<GetComponentProps<typeof ExportDrawer>>
  >({});

  const [emissionDrawerProps, setEmissionDrawerProps] = useState<
    Partial<GetComponentProps<typeof EmissionDrawer>>
  >({});

  const [processDrawerProps, setProcessDrawerProps] = useState<
    Partial<GetComponentProps<typeof ProcessDrawer>>
  >({});

  const form = useMemo(() => createForm({ readPretty: true }), []);

  const isRootNode = process.parentId === '0';

  const viewProduct = async () => {
    setProductDrawerProps({ visible: true, loading: true });
    const resp = await getProductList({ processId: process.processId, flag });
    setProductDrawerProps(prevProductDrawerProps => ({
      ...prevProductDrawerProps,
      loading: false,
      initValues: resp.data.data as GetComponentProps<
        typeof ProductDrawer
      >['initValues'],
    }));
  };

  const viewOutput = async () => {
    setOutputDrawerProps({ visible: true, loading: true });
    const resp = await getProductList({ processId: process.processId, flag });
    setOutputDrawerProps(prevOutputDrawerProps => ({
      ...prevOutputDrawerProps,
      loading: false,
      initValues: resp.data.data as GetComponentProps<
        typeof OutPutDrawer
      >['initValues'],
    }));
  };

  const viewExport = async () => {
    setExportDrawerProps({ visible: true, loading: true });
    const resp = await getOutputList({ id: process.processId, flag });
    setExportDrawerProps(prevExportDrawerProps => ({
      ...prevExportDrawerProps,
      loading: false,
      initValues: resp.data.data as GetComponentProps<
        typeof ExportDrawer
      >['initValues'],
    }));
  };

  const viewEmission = async (id: number) => {
    setEmissionDrawerProps({ visible: true, loading: true });
    const resp = await getEmissionInfo({ id, flag });
    setEmissionDrawerProps(prevEmissionDrawerProps => ({
      ...prevEmissionDrawerProps,
      loading: false,
      initialValues: resp.data.data as GetComponentProps<
        typeof EmissionDrawer
      >['initialValues'],
    }));
  };

  const viewProcess = async (id: number) => {
    setProcessDrawerProps({ visible: true, loading: true });
    const resp = await getProcessInDetails({ id, flag });
    setProcessDrawerProps(prevProcessDrawerProps => ({
      ...prevProcessDrawerProps,
      loading: false,
      initialValues: resp.data.data as GetComponentProps<
        typeof ProcessDrawer
      >['initialValues'],
    }));
  };

  const renderTableExpandRow = (processIn: ProcessIn) => (
    <TableExpandRow processIn={processIn} flag={flag} />
  );

  useEffect(() => {
    setInfoType(PROCESS_IN_OUT.value);
    setExpandedRowKeys([]);
  }, [process]);

  useEffect(() => {
    const requestStatus = { info: false, details: false };
    setLoading(true);

    getProcessInfo({ id: process.id, flag })
      .then(({ data }) => {
        setProcessInfo(data.data);
      })
      .finally(() => {
        requestStatus.info = true;
        setLoading(!(requestStatus.info && requestStatus.details));
      });

    getProcessDetails({
      id: process.id,
      matchType: process.matchType,
      flag,
    })
      .then(({ data }) => {
        setProcessDetails(data.data);
      })
      .finally(() => {
        requestStatus.details = true;
        setLoading(!(requestStatus.info && requestStatus.details));
      });
  }, [process, flag]);

  useEffect(() => {
    form.setValues({ ...processInfo });
  }, [form, processInfo]);

  return (
    <div>
      <Radio.Group value={infoType} onChange={e => setInfoType(e.target.value)}>
        <Radio.Button value={PROCESS_DESC.value}>
          {PROCESS_DESC.name}
        </Radio.Button>
        <Radio.Button value={PROCESS_IN_OUT.value}>
          {PROCESS_IN_OUT.name}
        </Radio.Button>
      </Radio.Group>
      <Spin spinning={loading}>
        {infoType === PROCESS_DESC.value && (
          <div>
            <FormilyCommon form={form}>
              <>
                <div className={styles.formSection}>
                  <div className={styles.formTitle}>
                    {I18N.carbonFootprint.basicInformation}
                  </div>
                  <SchemaField schema={genProcessBasicInfoSchema()} />
                </div>
                <div className={styles.formSection}>
                  <div className={styles.formTitle}>
                    {I18N.carbonFootprint3.dataRepresentativeness}
                  </div>
                  <SchemaField schema={genProcessRepSchema()} />
                </div>
              </>
            </FormilyCommon>
          </div>
        )}
        {infoType === PROCESS_IN_OUT.value && (
          <>
            <div className={styles.tableSection}>
              <div className={styles.formTitle}>
                {isRootNode
                  ? I18N.carbonFootprint3.product
                  : I18N.carbonFootprint3.output2}
                <Button
                  type='primary'
                  onClick={() => {
                    if (isRootNode) {
                      viewProduct();
                    } else {
                      viewOutput();
                    }
                  }}
                >
                  {isRootNode
                    ? I18N.supplyChain2.viewProducts
                    : I18N.supplyChain2.viewOutput2}
                </Button>
              </div>
              <Table
                rowKey='id'
                columns={
                  isRootNode
                    ? genProductRootTableColumns()
                    : genProductTableColumns()
                }
                dataSource={processDetails.processProducts}
                pagination={false}
              />
            </div>
            <div className={styles.tableSection}>
              <div className={styles.formTitle}>
                {I18N.carbonFootprint3.input}
              </div>
              <Table
                rowKey='id'
                columns={genInTableColumns({
                  onView: processIn => {
                    const { matchWay, id } = processIn;
                    if (
                      matchWay === MATCH_WAY.PROCESS_LIB ||
                      matchWay === MATCH_WAY.PROCESS_CREATE
                    ) {
                      viewProcess(id);
                    } else {
                      viewEmission(id);
                    }
                  },
                })}
                dataSource={processDetails.processIns}
                pagination={false}
                expandable={{
                  expandedRowKeys,
                  rowExpandable: record =>
                    record.matchWay === MATCH_WAY.PROCESS_LIB ||
                    record.matchWay === MATCH_WAY.PROCESS_CREATE,
                  onExpand: (expanded, record) => {
                    if (expanded) {
                      setExpandedRowKeys([...expandedRowKeys, record.id]);
                    } else {
                      setExpandedRowKeys(
                        expandedRowKeys.filter(key => key !== record.id),
                      );
                    }
                  },
                }}
                expandedRowRender={renderTableExpandRow}
              />
            </div>
            <div className={styles.tableSection}>
              <div className={styles.formTitle}>
                {I18N.carbonFootprint3.output}
                {!isRootNode && (
                  <Button type='primary' onClick={viewExport}>
                    {I18N.supplyChain2.viewOutput}
                  </Button>
                )}
              </div>
              <Table
                rowKey='id'
                columns={genOutTableColumns()}
                dataSource={processDetails.processOuts}
                pagination={false}
              />
            </div>
          </>
        )}
      </Spin>
      <ProductDrawer
        {...productDrawerProps}
        isEdit={false}
        isOnlyDetail
        visible={!!productDrawerProps.visible}
        loading={!!productDrawerProps.loading}
        onOk={() => {}}
        onCancel={() => setProductDrawerProps({ visible: false })}
      />
      {!!outputDrawerProps.visible && (
        <OutPutDrawer
          {...outputDrawerProps}
          isEdit={false}
          isOnlyDetail
          visible={!!outputDrawerProps.visible}
          loading={!!outputDrawerProps.loading}
          parentProcessNodeInfo={
            (parentProcess as unknown as GetComponentProps<
              typeof OutPutDrawer
            >['parentProcessNodeInfo']) || undefined
          }
          onOk={() => {}}
          onCancel={() => setOutputDrawerProps({ visible: false })}
        />
      )}
      <ExportDrawer
        {...exportDrawerProps}
        isEdit={false}
        isOnlyDetail
        visible={!!exportDrawerProps.visible}
        loading={!!exportDrawerProps.loading}
        accountId={0}
        processId={process.processId}
        onOk={() => {}}
        onCancel={() => setExportDrawerProps({ visible: false })}
      />
      <EmissionDrawer
        {...emissionDrawerProps}
        visible={!!emissionDrawerProps.visible}
        loading={!!emissionDrawerProps.loading}
        readPretty
        isOnlyDetail
        matchWayOptions={EMISSION_MATCH_WAY_OPTIONS}
        onCancel={() => setEmissionDrawerProps({ visible: false })}
      />
      {!!processDrawerProps.visible && (
        <ProcessDrawer
          {...processDrawerProps}
          visible={!!processDrawerProps.visible}
          loading={!!processDrawerProps.loading}
          readPretty
          isOnlyDetail
          parentProcess={process}
          onCancel={() => setProcessDrawerProps({ visible: false })}
        />
      )}
    </div>
  );
};

export default ProcessInfo;
