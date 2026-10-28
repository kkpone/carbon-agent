/**
 * @file 碳足迹 数据对比
 * @auth jiahui
 */
import I18N from '@src/lang/I18N';
import { useState } from 'react';
import {
  Modal,
  Progress as ProgressAnt,
  ProgressProps,
  Table,
  Typography,
} from 'antd';
import './comparisonMode.less';
import { combineClassName } from '@utils/index';
import { getContrast } from '@api/foot-print';
import style from '@src/styles/global.module.scss';
import decline from '../../../assets/icon/sy/decline.svg';
import LineChart from './linechart';
import rise from '../../../assets/icon/sy/rise.png';

const { Paragraph } = Typography;

const Progress = (props: ProgressProps) => (
  <ProgressAnt {...props} format={percent => `${percent}%`} />
);
interface TitleString {
  title: any;
  record: any;
}
const ComparisonMode = ({ title, record }: TitleString) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ellipsis, setEllipsis] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModal = () => {
    getContrastData(record);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const [system_boundary, setsystem_boundary] = useState([]);
  const [
    product_baseline_statistical_data,
    setProduct_baseline_statistical_data,
  ] = useState({
    a2: 0,
    b2: 0,
    c2: 0,
    d2: 0,
    e2: 0,
  });
  const [product_line_statistical_data, setProduct_line_statistical_data] =
    useState({
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
    });
  const [product_statistical_data, setProduct_statistical_data] = useState({
    product_disposed_waste_sum: '',
    product_distribution_sum: '',
    product_manufacturing_sum: '',
    product_material_sum: '',
    product_total_sum: '',
    product_use_energy_sum: '',
  });
  const [core_data, setCore_data] = useState({
    product_cumulative_emission_data: {
      product_cumulative_emission_contrast_baseline_data: '',
    },
    product_emission_data: {
      product_emission_contrast_baseline_data: '',
      product_emission_reduction_data: '',
      product_emission_name: '',
    },
    product_emission_ratio_data: {
      product_emission_contrast_baseline_data: '',
      product_emission_reduction_data: '',
      product_emission_name: '',
    },
    product_emission_reduction_data: {
      product_emission_contrast_baseline_data: '',
      product_emission_name: '',
      product_emission_reduction_data: '',
    },
  });
  const [product_baseline_data, setProduct_baseline_data] = useState({
    product_disposed_waste_sum: '',
    product_distribution_sum: '',
    product_manufacturing_sum: '',
    product_material_sum: '',
    product_total_sum: '',
    product_use_energy_sum: '',
  });
  const percentNum = (num: number, num2: number) =>
    // 小数点后两位百分比
    Math.round((num / num2) * 10000) / 100.0;
  const getContrastData = (record: {
    system_boundary: React.SetStateAction<never[]>;
    id: string;
  }) => {
    setsystem_boundary(record.system_boundary);
    getContrast(record.id).then((res: any) => {
      if (res?.status === 200) {
        const result = res?.data?.data?.context;
        // 产品模型数据
        setProduct_statistical_data(result.product_statistical_data);
        // 对照模型数据
        setProduct_baseline_data(result.product_baseline_statistical_data);
        setCore_data(result.core_data);
        // 计算进度条
        const a = percentNum(
          Number(result.product_statistical_data.product_material_sum),
          Number(result.product_statistical_data.product_total_sum),
        );
        const b = percentNum(
          Number(result.product_statistical_data.product_manufacturing_sum),
          Number(result.product_statistical_data.product_total_sum),
        );
        const c = percentNum(
          Number(result.product_statistical_data.product_use_energy_sum),
          Number(result.product_statistical_data.product_total_sum),
        );
        const d = percentNum(
          Number(result.product_statistical_data.product_distribution_sum),
          Number(result.product_statistical_data.product_total_sum),
        );
        const e = percentNum(
          Number(result.product_statistical_data.product_disposed_waste_sum),
          Number(result.product_statistical_data.product_total_sum),
        );
        setProduct_line_statistical_data({ a, b, c, d, e });
        const a2 = percentNum(
          Number(result.product_baseline_statistical_data.product_material_sum),
          Number(result.product_baseline_statistical_data.product_total_sum),
        );
        const b2 = percentNum(
          Number(
            result.product_baseline_statistical_data.product_manufacturing_sum,
          ),
          Number(result.product_baseline_statistical_data.product_total_sum),
        );
        const c2 = percentNum(
          Number(
            result.product_baseline_statistical_data.product_use_energy_sum,
          ),
          Number(result.product_baseline_statistical_data.product_total_sum),
        );
        const d2 = percentNum(
          Number(
            result.product_baseline_statistical_data.product_distribution_sum,
          ),
          Number(result.product_baseline_statistical_data.product_total_sum),
        );
        const e2 = percentNum(
          Number(
            result.product_baseline_statistical_data.product_disposed_waste_sum,
          ),
          Number(result.product_baseline_statistical_data.product_total_sum),
        );
        setProduct_baseline_statistical_data({ a2, b2, c2, d2, e2 });
      }
    });
    setIsModalVisible(true);
  };
  const dataSource = [
    {
      key: '1',
      name: I18N.carbonFootprint.rawMaterial,
      scene: Number(product_baseline_data.product_material_sum).toFixed(2),
      address: Number(product_statistical_data.product_material_sum).toFixed(2),
      emission: (
        Number(product_baseline_data.product_material_sum) -
        Number(product_statistical_data.product_material_sum)
      ).toFixed(2),
    },
    {
      key: '2',
      name: I18N.carbonproduct.production,
      scene: Number(product_baseline_data.product_manufacturing_sum).toFixed(2),
      address: Number(
        product_statistical_data.product_manufacturing_sum,
      ).toFixed(2),
      emission: (
        Number(product_baseline_data.product_manufacturing_sum) -
        Number(product_statistical_data.product_manufacturing_sum)
      ).toFixed(2),
    },

    {
      key: '3',
      name: I18N.carbonproduct.distribution,
      scene: Number(product_baseline_data.product_distribution_sum).toFixed(2),
      address: Number(
        product_statistical_data.product_distribution_sum,
      ).toFixed(2),
      emission: (
        Number(product_baseline_data.product_distribution_sum) -
        Number(product_statistical_data.product_distribution_sum)
      ).toFixed(2),
    },
    {
      key: '4',
      name: I18N.carbonFootprint3.apply,
      scene: Number(product_baseline_data.product_use_energy_sum).toFixed(2),
      address: Number(product_statistical_data.product_use_energy_sum).toFixed(
        2,
      ),
      emission: (
        Number(product_baseline_data.product_use_energy_sum) -
        Number(product_statistical_data.product_use_energy_sum)
      ).toFixed(2),
    },
    {
      key: '5',
      name: I18N.carbonproduct.abandoned,
      scene: Number(product_baseline_data.product_disposed_waste_sum).toFixed(
        2,
      ),
      address: Number(
        product_statistical_data.product_disposed_waste_sum,
      ).toFixed(2),
      emission: (
        Number(product_baseline_data.product_disposed_waste_sum) -
        Number(product_statistical_data.product_disposed_waste_sum)
      ).toFixed(2),
    },
    {
      key: '6',
      name: I18N.carbonFootprint3.lifeCycle,
      scene: Number(product_baseline_data.product_total_sum).toFixed(2),
      address: Number(product_statistical_data.product_total_sum).toFixed(2),
      emission: (
        Number(product_baseline_data.product_total_sum) -
        Number(product_statistical_data.product_total_sum)
      ).toFixed(2),
    },
  ];

  const columns = [
    {
      title: I18N.carbonproduct.stageName,
      dataIndex: 'name',
      key: 'name',
      // fixed: true,
      // width: 100,
    },
    {
      title: I18N.carbonproduct.benchmarkScenarioK,
      dataIndex: 'scene',
      key: 'scene',
    },
    {
      title: I18N.carbonproduct.projectScenarioK,
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: I18N.carbonproduct.reducedDisplacementKg,
      dataIndex: 'emission',
      key: 'emission',
    },
  ];
  return (
    <div className='comparisonModelBox'>
      <div className='top-title-btn'>
        <text
          onClick={showModal}
          className={combineClassName(style.textHoverBlue, style.textBlue)}
        >
          {title}
        </text>
      </div>
      <Modal
        title={I18N.carbonproduct.carbonReductionData}
        className='comparisonModel'
        width='90%'
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <div className='modular'>
          <p className='modular-title'>{I18N.carbonproduct.coreDataSpeed}</p>
          <div className='modular-content' style={{ padding: 5 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                height: '50%',
              }}
            >
              <div className='bg-white modular-detail'>
                <div className='stage-model-title'>
                  <Paragraph ellipsis={ellipsis}>
                    {I18N.carbonproduct.accumulatedCarbonEmissions}
                    <span className='kgSpan'>(kgCO₂e)</span>
                  </Paragraph>
                </div>
                <div className='stage-model-num'>
                  <span>
                    {product_statistical_data.product_total_sum.toLocaleString()}
                  </span>{' '}
                </div>
                <div className='detailstage'>
                  {' '}
                  <div className='gray_line' />
                  <span>{I18N.carbonproduct.comparedToTheBenchmark}</span>
                  {record.baseline === null ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {Number(
                        core_data.product_cumulative_emission_data
                          .product_cumulative_emission_contrast_baseline_data,
                      ) > 0 ? (
                        <img src={decline} alt='' />
                      ) : (
                        <img src={rise} alt='' />
                      )}
                      {String(
                        core_data.product_cumulative_emission_data
                          .product_cumulative_emission_contrast_baseline_data,
                      ).replace(/-/g, '')}
                      %
                    </span>
                  )}
                </div>
              </div>
              <div className='bg-white modular-detail'>
                <div className='stage-model-title'>
                  <Paragraph ellipsis={ellipsis}>
                    {I18N.carbonproduct.maximumEmissions}
                    {core_data.product_emission_data.product_emission_name}
                    <span className='kgSpan'>(kgCO₂e)</span>
                  </Paragraph>
                </div>
                <div className='stage-model-num'>
                  {record.baseline === null ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {Number(
                        core_data.product_emission_data
                          .product_emission_reduction_data,
                      ).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className='detailstage'>
                  <div className='gray_line' />
                  <span>{I18N.carbonproduct.comparedToTheBenchmark}</span>{' '}
                  {record.baseline === null ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {Number(
                        core_data.product_emission_data
                          .product_emission_contrast_baseline_data,
                      ) > 0 ? (
                        <img src={decline} alt='' />
                      ) : (
                        <img src={rise} alt='' />
                      )}
                      {String(
                        core_data.product_emission_data
                          .product_emission_contrast_baseline_data,
                      ).replace(/-/g, '')}
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                height: '50%',
              }}
            >
              <div className='bg-white modular-detail'>
                <div className='stage-model-title'>
                  <Paragraph ellipsis={ellipsis}>
                    {I18N.carbonproduct.maximumReductionInDisplacement}
                    {
                      core_data.product_emission_ratio_data
                        .product_emission_name
                    }
                    <span className='kgSpan'>(kgCO₂e)</span>
                  </Paragraph>
                </div>
                <div className='stage-model-num'>
                  {record.baseline === null ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {Number(
                        core_data.product_emission_ratio_data
                          .product_emission_reduction_data,
                      ).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className='detailstage'>
                  {' '}
                  <div className='gray_line' />
                  <span>{I18N.carbonproduct.comparedToTheBenchmark}</span>{' '}
                  {record.baseline === null ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {' '}
                      {Number(
                        core_data.product_emission_ratio_data
                          .product_emission_contrast_baseline_data,
                      ) > 0 ? (
                        <img src={decline} alt='' />
                      ) : (
                        <img src={rise} alt='' />
                      )}
                      {String(
                        core_data.product_emission_ratio_data
                          .product_emission_contrast_baseline_data,
                      ).replace(/-/g, '')}
                      %
                    </span>
                  )}
                </div>
              </div>
              <div className='bg-white modular-detail'>
                <div className='stage-model-title'>
                  <Paragraph ellipsis={ellipsis}>
                    {I18N.carbonproduct.maximumEmissionReductionRatio}
                    {
                      core_data.product_emission_reduction_data
                        .product_emission_name
                    }
                    <span className='kgSpan'>(kgCO₂e)</span>
                  </Paragraph>
                </div>
                <div className='stage-model-num'>
                  {record.baseline === null ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {Number(
                        core_data.product_emission_reduction_data
                          .product_emission_reduction_data,
                      ).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className='detailstage'>
                  <div className='gray_line' />
                  <span>{I18N.carbonproduct.comparedToTheBenchmark}</span>
                  {record.baseline === null ? (
                    <span>-</span>
                  ) : (
                    <span>
                      {Number(
                        core_data.product_emission_reduction_data
                          .product_emission_contrast_baseline_data,
                      ) > 0 ? (
                        <img src={decline} alt='' />
                      ) : (
                        <img src={rise} alt='' />
                      )}
                      {String(
                        core_data.product_emission_reduction_data
                          .product_emission_contrast_baseline_data,
                      ).replace(/-/g, '')}
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='modular'>
          <p className='modular-title'>
            {I18N.carbonproduct.emissionsAtEachStage}
          </p>
          <div className='modular-content'>
            <div className='bg-white modular-progress'>
              <div className='progress'>
                <p style={{ marginLeft: 10 }}>
                  {I18N.carbonproduct.benchmarkScenario}
                </p>
                <div className='progresswidth'>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.rawMaterialStage}</p>
                    <Progress
                      strokeColor='#6F94F1'
                      trailColor='rgba(111, 148, 241, 0.2)'
                      percent={product_baseline_statistical_data.a2}
                      size='small'
                    />
                  </div>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.productionStage}</p>
                    <Progress
                      strokeColor='#3AD0BE'
                      trailColor='rgba(58, 208, 190, 0.2)'
                      percent={product_baseline_statistical_data.b2}
                      size='small'
                    />
                  </div>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.distributionStage}</p>
                    <Progress
                      strokeColor='#FFA372'
                      trailColor='rgba(255, 163, 114, 0.2)'
                      percent={product_baseline_statistical_data.d2}
                      size='small'
                    />
                  </div>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.usageStage}</p>
                    <Progress
                      strokeColor='#FFCB72'
                      trailColor='rgba(255, 203, 114, 0.2)'
                      percent={product_baseline_statistical_data.c2}
                      size='small'
                    />
                  </div>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.abandonmentStage}</p>
                    <Progress
                      strokeColor='#FF7272'
                      trailColor='rgba(255, 114, 114, 0.2)'
                      percent={product_baseline_statistical_data.e2}
                      size='small'
                    />
                  </div>
                </div>
              </div>
              <div className='progress'>
                <p style={{ marginLeft: 10 }}>
                  {I18N.carbonproduct.projectScenarios}
                </p>
                <div className='progresswidth'>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.rawMaterialStage}</p>
                    <Progress
                      strokeColor='#6F94F1'
                      trailColor='rgba(111, 148, 241, 0.2)'
                      percent={product_line_statistical_data.a}
                      size='small'
                    />
                  </div>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.productionStage}</p>
                    <Progress
                      strokeColor='#3AD0BE'
                      trailColor='rgba(58, 208, 190, 0.2)'
                      percent={product_line_statistical_data.b}
                      size='small'
                    />
                  </div>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.distributionStage}</p>
                    <Progress
                      strokeColor='#FFA372'
                      trailColor='rgba(255, 163, 114, 0.2)'
                      percent={product_line_statistical_data.d}
                      size='small'
                    />
                  </div>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.usageStage}</p>
                    <Progress
                      strokeColor='#FFCB72'
                      trailColor='rgba(255, 203, 114, 0.2)'
                      percent={product_line_statistical_data.c}
                      size='small'
                    />
                  </div>
                  <div className='progressname'>
                    <p>{I18N.carbonproduct.abandonmentStage}</p>
                    <Progress
                      strokeColor='#FF7272'
                      trailColor='rgba(255, 114, 114, 0.2)'
                      percent={product_line_statistical_data.e}
                      size='small'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='modular'>
          <p className='modular-title'>
            {I18N.carbonproduct.emissionReductionInEachStage}
          </p>
          <div className='modular-content'>
            <LineChart
              system_boundary={system_boundary}
              product_statistical_data={product_statistical_data}
              product_baseline_data={product_baseline_data}
            />
          </div>
        </div>
        <div className='modular'>
          <p className='modular-title'>
            {I18N.carbonproduct.comparisonOfEmissionReductions}
          </p>
          <div className='modular-content'>
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ComparisonMode;
