import I18N from '@src/lang/I18N';
import VerifyUtils from '@src/utils/verifty';
import { Input, Select, Tooltip } from 'antd';
import style from './index.module.scss';

const { Option } = Select;
export interface TextName {
  list: TextList[];
  Name: Name;
}

interface Name {
  wasteWater?: string;
  importCod?: string;
  exitCod?: string;
  methaneRecycle?: string;
  methaneAmend?: string;
  methaneHumidifying?: string;
  amType?: string;
  huType?: string;
  userId?: string;
  companyId?: string;
  sludgeType?: string;
}
export interface TextList {
  title: string;
  tabform: Tabform[] | [];
  formlist: FormlistElement[];
}

export interface FormlistElement {
  label: string | JSX.Element;
  type: string;
  reg?: RegExp;
  placeholder: string;
  unit: string | JSX.Element;
  name: string;
  othname?: string;
  optList: [] | Tablist[];
  require: any[];
}

interface Tabform {
  id: string;
  list: FormlistElement[];
}

interface Tablist {
  name: string;
  id: string;
}
// 甲烷修正因子
const Methanefactor: Tablist[] = [
  {
    name: '0.1',
    id: '0.1',
  },
  {
    name: '0.3',
    id: '0.3',
  },
  {
    name: '0.5',
    id: '0.5',
  },
  {
    name: '0.7',
    id: '0.7',
  },
  {
    name: I18N.carbonFootprint3.other,
    id: I18N.carbonFootprint3.other,
  },
];
// 甲烷的增温潜势
const Methanewram: Tablist[] = [
  {
    name: '21(Second Assessment Report.IPCC)',
    id: '21',
  },
  {
    name: '25(Fourth Assessment Report.IPCC.2007)',
    id: '25',
  },
  {
    name: '28(Fifth Assessment Report.IPCC.2013)',
    id: '28',
  },
  {
    name: I18N.carbonFootprint3.other,
    id: I18N.carbonFootprint3.other,
  },
];
// 用污泥清除的有机物总量
const Methaneslude: Tablist[] = [
  {
    name: '0',
    id: '0',
  },
  {
    name: I18N.carbonFootprint3.other,
    id: I18N.carbonFootprint3.other,
  },
];

export const TableList = (page: number) => ({
  '0_工业废水碳排放计算器': [
    {
      title: I18N.dashborad.number,
      dataIndex: 'name',
      align: 'center',
      key: 'name',
      width: '75px',
      render: (text, record, index: number) => (
        <div>{(Number(page) - 1) * 10 + index + 1}</div>
      ),
    },
    {
      title: I18N.consulting.anaerobicTreatmentOfWastewater,
      dataIndex: 'discharge',
      align: 'center',
      key: 'discharge',
      width: '200px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.removeWithSludge,
      dataIndex: 'sludge',
      align: 'center',
      key: 'sludge',
      width: '200px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.anaerobicWastewaterTreatment,
      dataIndex: 'wasteWater',
      align: 'center',
      key: 'wasteWater',
      width: '130px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.anaerobicTreatmentInlet2,
      dataIndex: 'importCod',
      align: 'center',
      key: 'importCod',
      width: '174px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.anaerobicTreatment2,
      dataIndex: 'exitCod',
      align: 'center',
      key: 'exitCod',
      width: '174px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.methaneRecoveryAmount,
      dataIndex: 'methaneRecycle',
      align: 'center',
      key: 'methaneRecycle',
      width: '110px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.methaneCorrectionFactor,
      dataIndex: 'methaneAmend',
      align: 'center',
      key: 'methaneAmend',
      width: '124px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.methaneWarming,
      dataIndex: 'methaneHumidifying',
      align: 'center',
      key: 'methaneHumidifying',
      width: '174px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.operatorsTime,
      dataIndex: 'userName',
      align: 'center',
      key: 'userName',
      width: '174px',
      render: (text, record) => (
        <Tooltip title={`${text}${VerifyUtils.get_time(record.createTime)}`}>
          <div className='productName'>
            {text}/{VerifyUtils.get_time(record.createTime)}
          </div>
        </Tooltip>
      ),
    },
  ],
  '0_外购热力碳排放计算器': [
    {
      title: I18N.dashborad.number,
      dataIndex: 'name',
      align: 'center',
      key: 'name',
      width: '75px',
      render: (text, record, index: number) => (
        <div>{(Number(page) - 1) * 10 + index + 1}</div>
      ),
    },
    {
      title: I18N.consulting.hotWaterCarbonFootprint,
      dataIndex: 'discharge',
      align: 'center',
      key: 'discharge',
      width: '200px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.temperature,
      dataIndex: 'temperature',
      align: 'center',
      key: 'temperature',
      width: '100px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.qualityOfHotWater,
      dataIndex: 'quality',
      align: 'center',
      key: 'quality',
      width: '120px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.heatFactor,
      dataIndex: 'heatDivisor',
      align: 'center',
      key: 'heatDivisor',
      width: '120px',
      render: text => (
        <Tooltip title={text}>
          <div className='productName'>{text}</div>
        </Tooltip>
      ),
    },
    {
      title: I18N.consulting.operatorsTime,
      dataIndex: 'userName',
      align: 'center',
      key: 'userName',
      width: '200px',
      render: (text, record) => (
        <Tooltip title={`${text}${VerifyUtils.get_time(record.createTime)}`}>
          <div className='productName'>
            {text}/{VerifyUtils.get_time(record.createTime)}
          </div>
        </Tooltip>
      ),
    },
  ],
});
export const informaton = () => [
  {
    title: I18N.consulting.industrialWastewaterCarbon,
    tablist: [],
    tabform: [],
    formlist: [
      {
        label: (
          <span>
            <span className={style.recolor}>*</span>
            {I18N.consulting.anaerobicWastewaterTreatment}
          </span>
        ),
        type: 'input',
        name: 'wasteWater',
        reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
        placeholder: I18N.consulting.maximumInput,
        optList: [],
        unit: (
          <span>
            m<sup>3</sup>
          </span>
        ),
        require: [],
      },
      {
        label: (
          <span>
            <span className={style.recolor}>*</span>
            {I18N.consulting.anaerobicTreatmentInlet}
          </span>
        ),
        type: 'input',
        reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
        placeholder: I18N.consulting.maximumInput,
        name: 'importCod',
        optList: [],
        unit: (
          <span>
            kgCOD/m<sup>3</sup>
          </span>
        ),
        require: [],
      },
      {
        label: (
          <span>
            <span className={style.recolor}>*</span>
            {I18N.consulting.anaerobicTreatment}
          </span>
        ),
        type: 'input',
        reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
        placeholder: I18N.consulting.maximumInput,
        name: 'exitCod',
        optList: [],
        unit: (
          <span>
            kgCOD/m<sup>3</sup>
          </span>
        ),
        require: [],
      },
      {
        label: (
          <span>
            <span className={style.recolor}>*</span>
            {I18N.consulting.methaneRecoveryAmount}
          </span>
        ),
        type: 'input',
        name: 'methaneRecycle',
        unit: 't',
        reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
        placeholder: I18N.consulting.maximumInput,
        require: [],
        optList: [],
      },
      {
        label: (
          <span>
            <span className={style.recolor}>*</span>
            {I18N.consulting.removeWithSludge}
          </span>
        ),
        type: 'select',
        name: 'sludgeType',
        optList: Methaneslude,
        placeholder: I18N.carbonFootprint.pleaseSelect,
        unit: <span>tCOD</span>,
        require: [],
      },
      {
        label: ' ',
        othname: 'sludgeType',
        type: 'inputnounit',
        reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
        placeholder: I18N.consulting.maximumInput,
        name: 'sludge',
        optList: Methaneslude,
        unit: (
          <span>
            kgCO<sub>2</sub>e/GJ
          </span>
        ),
        require: [],
      },
      {
        label: (
          <span>
            <span className={style.recolor}>*</span>
            {I18N.consulting.methaneCorrectionFactor}
          </span>
        ),
        type: 'select',
        name: 'amType',
        optList: Methanefactor,
        placeholder: I18N.carbonFootprint.pleaseSelect,
        unit: '',
        require: [],
      },
      {
        label: ' ',
        othname: 'amType',
        type: 'inputnounit',
        name: 'methaneAmend',
        reg: /^([0-1]{0,1}|([0-1])|([0]+\.[0-9]{0,10}))$/,
        placeholder: I18N.consulting.pleaseEnterBetween2,
        optList: Methaneslude,
        unit: '',
        require: [],
      },
      {
        label: (
          <span>
            <span className={style.recolor}>*</span>
            {I18N.consulting.methaneWarming}
          </span>
        ),
        type: 'select',
        unit: '',
        require: [],
        placeholder: I18N.carbonFootprint.pleaseSelect,
        name: 'huType',
        optList: Methanewram,
      },
      {
        label: ' ',
        othname: 'huType',
        type: 'inputnounit',
        reg: /^([1-9]?\d|100)$/,
        placeholder: I18N.consulting.pleaseEnterBetween,
        name: 'methaneHumidifying',
        optList: Methaneslude,
        unit: '',
        require: [],
      },
    ],
  },
  {
    title: I18N.consulting.outsourcedThermalCarbon,
    tablist: [],
    tabform: [
      {
        id: 'heat1',
        list: [
          {
            label: I18N.consulting.temperature,
            name: '',
            optList: [],
            type: '',
            unit: (
              <span>
                <sup>o</sup>C
              </span>
            ),
            require: [],
            reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
            placeholder: I18N.consulting.maximumInput,
          },
          {
            label: I18N.consulting.pressure,
            name: '',
            optList: [],
            type: '',
            unit: 'Mpa',
            require: [],
            reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
            placeholder: I18N.consulting.maximumInput,
          },
          {
            label: I18N.consulting.enthalpy,
            optList: [],
            name: '',
            type: '',
            unit: 'kJ/kg',
            require: [],
            reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
            placeholder: I18N.consulting.maximumInput,
          },
          {
            label: I18N.consulting.steamVolume,
            optList: [],
            name: '',
            type: '',
            unit: 't',
            require: [],
            reg: /^([0-9]{0,5}|([0-9]+\.[0-9]{0,10}))$/,
            placeholder: I18N.consulting.supportDecimalPoint,
          },
          {
            label: I18N.consulting.heatFactor,
            optList: [],
            type: '',
            unit: '',
            name: '',
            require: [],
            reg: /^([0-9]{0,5}|([0-9]+\.[0-9]{0,10}))$/,
            placeholder: I18N.consulting.suggestUsingSupport2,
          },
        ],
      },
      {
        id: 'heat2',
        list: [
          {
            label: (
              <span>
                <span className={style.recolor}>*</span>
                {I18N.consulting.temperature}
              </span>
            ),
            type: 'input',
            name: 'temperature',
            optList: [],
            unit: (
              <span>
                <sup>o</sup>C
              </span>
            ),
            require: [],
            reg: /^(([1-9]?\d(\.\d{1,10})?)|100|100.00)$/,
            placeholder: I18N.consulting.pleaseInputHotWater2,
          },
          {
            label: (
              <span>
                <span className={style.recolor}>*</span>
                {I18N.consulting.qualityOfHotWater}
              </span>
            ),
            type: 'input',
            optList: [],
            name: 'quality',
            unit: 't',
            require: [],
            reg: /^(([1-9]{0,7}?\d(\.\d{1,10})?)|100000000|100000000.00)$/,
            placeholder: I18N.consulting.pleaseInputHotWater,
          },
          {
            label: (
              <span>
                <span className={style.recolor}>*</span>
                {I18N.consulting.heatFactor}
              </span>
            ),
            type: 'input',
            optList: [],
            unit: (
              <span>
                kgCO<sub>2</sub>e/GJ
              </span>
            ),
            name: 'heatDivisor',
            require: [],
            reg: /^\d{1,12}$|^\d{1,12}[.]\d{1,10}$/,
            placeholder: I18N.consulting.maximumInput,
          },
        ],
      },
    ],
    formlist: [],
  },
  {
    title: I18N.consulting.aircraftTravelCarbon2,
    tablist: [],
    tabform: [],
    formlist: [],
  },
];
const InputEle = (placeholder: string) => (
  <Input className={style.iptwid} placeholder={placeholder} />
);
const SelectEle = (
  option: Tablist[],
  chanage: (e, b) => void,
  name: string,
  placeholder: string,
) => (
  <Select
    className={style.iptwid}
    onChange={e => chanage(e, name)}
    placeholder={placeholder}
  >
    {option.map((item: Tablist) => (
      <Option value={item.id}>{item.name}</Option>
    ))}
  </Select>
);
export const listElm = (tem: FormlistElement, chanage) => {
  switch (tem.type) {
    case 'input':
      return (
        <div>
          {InputEle(
            tem.name === 'heatDivisor'
              ? I18N.consulting.suggestUsingSupport
              : I18N.consulting.supportDecimalPoint,
          )}
          <span className={style.spanLe}>{tem.unit}</span>
        </div>
      );
    case 'inputnounit':
      return InputEle(
        tem.name === 'heatDivisor'
          ? I18N.consulting.suggestUsingSupport
          : I18N.consulting.supportDecimalPoint,
      );
    case 'select':
      return (
        <div className={style.selectwid}>
          {SelectEle(tem.optList, chanage, tem.name, tem.placeholder)}
          <span className={style.spanLe}>{tem.unit}</span>
        </div>
      );
    default:
      return '';
  }
};
