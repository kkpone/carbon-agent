import I18N from '@src/lang/I18N';
import { Button, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import IconFont from '@components/iconfont';
// 获取下拉框的数据
import {
  MumnentListFn,
  RoomListFn,
  getBit,
} from '@views/EnterpriseCarbonAccount/Construction/utils';
import { Dicts } from '@src/views/emission/Show/type';
import { Toast } from '@src/utils/Toast';
import { apiComputationDefaultValue } from '../../service';
import {
  ComstomSelect,
  ComstomInputNumber,
  ComstomSuffixInput,
} from './FromList';

const returnColums = ({ addList, setAddList, pageType, item }): ColumnsType => {
  const mumentList = MumnentListFn(
    'BCA_Room_Type_Heating,BCA_Heating_Mode,BCA_Cooling_Equipment,BCA_Room_Type_Cooling,HFCsEnum,BCA_Use_Frequency',
  );
  const RoomList = RoomListFn();
  const OnChangeFn = ({
    addList,
    setAddList,
    item,
    index,
    value,
    key,
    type = 'number',
  }) => {
    const arr = addList[item.name];
    arr[index][key] = value;
    if (!/^\d+(\.\d{0,4})?$/.test(value) && type === 'number' && value) {
      Toast('error', I18N.carbonNeutral.dataFormatError);
      arr[index][key] = getBit(value);
    }
    if (key === 'coolType') {
      const culObj = mumentList.HFCsEnum?.filter(
        item => item.dictValue === value,
      )[0];
      arr[index].addPotentiality = culObj?.relatedValue;
    }
    setAddList({
      ...addList,
      [item.name]: arr,
    });
  };
  const itemPropsObj = (value, index, name, type = 'number') => ({
    placeholder: I18N.carbonFootprint.pleaseEnter,
    name,
    label: '',
    require: [],
    style: { width: '100%' },
    value,
    onChange: e => {
      OnChangeFn({
        addList,
        setAddList,
        item,
        index,
        value: e,
        key: name,
        type,
      });
    },
  });
  /**
   * 操作删除的方法
   */
  const clumDel = index => {
    const arr = addList[item.name];
    arr.splice(index, 1);
    setAddList({
      ...addList,
      [item.name]: arr,
    });
  };
  switch (item.name) {
    case 'heatingInfoList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },
        {
          title: I18N.carbonNeutral.roomType,
          dataIndex: 'roomType',
          width: 320,
          render: (text: string, record: any, index: number) =>
            pageType === 'detail' ? (
              text
            ) : (
              <ComstomSelect
                item={{
                  options: RoomList,
                }}
                {...itemPropsObj(text, index, 'roomType', 'select')}
                placeholder={I18N.carbonFootprint.pleaseSelect}
              />
            ),
        },
        {
          title: I18N.carbonNeutral.totalRoomArea,
          dataIndex: 'roomArea',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999999999,
              }}
              {...itemPropsObj(text, index, 'roomArea')}
            />
          ),
        },
        {
          title: (
            <>
              全年采暖天数（天）
              <Tooltip title={I18N.carbonNeutral.theSystemWillBeBasedOn2}>
                <IconFont
                  style={{
                    color: '#999999',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                  type='icon-icon-bangchuzhongxin-3'
                />
              </Tooltip>
            </>
          ),
          dataIndex: 'heatingDay',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 365,
              }}
              type='number'
              {...itemPropsObj(text, index, 'heatingDay', 'input')}
              // @ts-ignore
              // formatter={value =>
              //   value ? `${Number(value).toFixed(0)}` : null
              // }
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];
    case 'coolInfoList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },
        {
          title: I18N.carbonNeutral.roomType,
          dataIndex: 'roomType',
          width: 320,
          render: (text: string, record: any, index: number) =>
            pageType === 'detail' ? (
              text
            ) : (
              <ComstomSelect
                item={{
                  options: RoomList,
                }}
                {...itemPropsObj(text, index, 'roomType', 'select')}
                placeholder={I18N.carbonFootprint.pleaseSelect}
              />
            ),
        },
        {
          title: I18N.carbonNeutral.totalRoomArea,
          dataIndex: 'roomArea',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999999999,
              }}
              {...itemPropsObj(text, index, 'roomArea')}
            />
          ),
        },
        {
          title: (
            <>
              全年制冷小时数（h）
              <Tooltip title={I18N.carbonNeutral.theSystemWillBeBasedOn}>
                <IconFont
                  style={{
                    color: '#999999',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                  type='icon-icon-bangchuzhongxin-3'
                />
              </Tooltip>
            </>
          ),
          dataIndex: 'heatingDay',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 8760,
              }}
              type='number'
              {...itemPropsObj(text, index, 'heatingDay', 'input')}
              // @ts-ignore
              // formatter={value =>
              //   value ? `${Number(value).toFixed(0)}` : null
              // }
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];
    case 'transmissionDistributionList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },
        {
          title: I18N.carbonNeutral.waterPumpPowerK,
          dataIndex: 'power',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999999999,
              }}
              {...itemPropsObj(text, index, 'power')}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.quantity,
          dataIndex: 'quantity',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomInputNumber
              decimalSeparator='1'
              item={{
                min: 0,
                max: 99999,
              }}
              type='number'
              {...itemPropsObj(text, index, 'quantity', 'input')}
              // @ts-ignore
              formatter={value =>
                value ? `${Number(value).toFixed(0)}` : null
              }
            />
          ),
        },
        {
          title: I18N.carbonNeutral.expectedAnnualTransportation,
          dataIndex: 'runTime',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomSuffixInput
              item={{
                suffix: (
                  <Button
                    style={{ padding: 0 }}
                    type='link'
                    onClick={async () => {
                      await apiComputationDefaultValue({
                        key: 'runTime',
                      }).then(({ data }) => {
                        OnChangeFn({
                          addList,
                          setAddList,
                          item,
                          index,
                          value: data.data,
                          key: 'runTime',
                          type: 'input',
                        });
                      });
                    }}
                  >
                    {I18N.carbonNeutral.useDefault}
                  </Button>
                ),
                min: 0,
                max: 99999,
              }}
              {...{
                ...itemPropsObj(text, index, 'runTime', 'number'),
              }}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index: number) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];
    case 'airEndList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },
        {
          title: I18N.carbonNeutral.fanPowerK,
          dataIndex: 'power',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999999999,
              }}
              {...itemPropsObj(text, index, 'power')}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.quantity,
          width: 320,
          dataIndex: 'quantity',
          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 99999,
              }}
              type='number'
              {...itemPropsObj(text, index, 'quantity', 'input')}
              // @ts-ignore
              formatter={value =>
                value ? `${Number(value).toFixed(0)}` : null
              }
            />
          ),
        },
        {
          title: I18N.carbonNeutral.expectedAnnualTransportation,
          dataIndex: 'runTime',
          width: 320,
          render: (text: string, record: any, index: number) => (
            <ComstomSuffixInput
              item={{
                suffix: (
                  <Button
                    style={{ padding: 0 }}
                    type='link'
                    onClick={async () => {
                      await apiComputationDefaultValue({
                        key: 'runTime',
                      }).then(({ data }) => {
                        OnChangeFn({
                          addList,
                          setAddList,
                          item,
                          index,
                          value: data.data,
                          key: 'runTime',
                          type: 'input',
                        });
                      });
                    }}
                  >
                    {I18N.carbonNeutral.useDefault}
                  </Button>
                ),
                min: 0,
                max: 99999,
              }}
              {...{
                ...itemPropsObj(text, index, 'runTime', 'number'),
              }}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index: number) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];
    case 'coolLossList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },
        {
          title: I18N.carbonNeutral.refrigerantType,
          dataIndex: 'coolType',
          width: 320,
          render: (text: string, record: any, index: number) =>
            pageType === 'detail' ? (
              text
            ) : (
              <ComstomSelect
                item={{
                  options: mumentList.HFCsEnum,
                }}
                {...itemPropsObj(text, index, 'coolType', 'select')}
                placeholder={I18N.carbonFootprint.pleaseSelect}
              />
            ),
        },
        {
          title: I18N.carbonNeutral.globalWarmingPotential,
          dataIndex: 'addPotentiality',
          width: 320,
          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 99999,
              }}
              {...itemPropsObj(text, index, 'addPotentiality')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.totalFillingAmountK,
          dataIndex: 'loadingLevel',
          width: 320,
          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999999999,
              }}
              {...itemPropsObj(text, index, 'loadingLevel')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.serviceLifeYear,
          dataIndex: 'lifetime',
          width: 320,
          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 1,
                max: 99999,
              }}
              {...itemPropsObj(text, index, 'lifetime', 'number')}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];
    case 'illuminationList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },

        {
          title: I18N.carbonNeutral.roomType,
          dataIndex: 'roomType',
          width: 320,
          render: (text: string, record: any, index: number) =>
            pageType === 'detail' ? (
              text
            ) : (
              <ComstomSelect
                item={{
                  options: RoomList,
                }}
                {...itemPropsObj(text, index, 'roomType', 'select')}
                onChange={e => {
                  const obj: Partial<
                    Dicts & {
                      powerDensity: string;
                      illuminationTime: string;
                      roomType: string;
                    }
                  > = RoomList.filter(item => item.dictValue === e)[0];
                  const arr = addList[item.name];
                  arr[index].roomType = e;
                  arr[index].powerDensity = obj?.powerDensity
                    ? obj?.powerDensity
                    : null;
                  arr[index].illuminationTime = obj?.illuminationTime || null;
                  setAddList({
                    ...addList,
                    [item.name]: arr,
                  });
                }}
                placeholder={I18N.carbonFootprint.pleaseSelect}
              />
            ),
        },
        {
          title: I18N.carbonNeutral.theTotalNumberOfRoomsInThisCategory,
          dataIndex: 'roomArea',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999999999,
              }}
              {...itemPropsObj(text, index, 'roomArea')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.lightingPowerDensity,
          dataIndex: 'powerDensity',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 9999,
              }}
              {...itemPropsObj(text, index, 'powerDensity')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.annualLightingHours,
          dataIndex: 'illuminationTime',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 9999,
              }}
              {...itemPropsObj(text, index, 'illuminationTime')}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];
    case 'elevatorList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },
        {
          title: I18N.carbonNeutral.elevatorUsageEnergy,
          dataIndex: 'elevatorEnergyConsumption',
          width: 320,
          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999,
              }}
              {...itemPropsObj(text, index, 'elevatorEnergyConsumption')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.elevatorStandbyFunction,
          dataIndex: 'standbyEnergyConsumption',
          width: 320,
          render: (text: string, record: any, index) => (
            <ComstomSuffixInput
              item={{
                min: 0,
                max: 99,
                suffix: (
                  <Button
                    style={{ padding: 0 }}
                    type='link'
                    onClick={async () => {
                      await apiComputationDefaultValue({
                        key: 'standbyEnergyConsumption',
                      }).then(({ data }) => {
                        OnChangeFn({
                          addList,
                          setAddList,
                          item,
                          index,
                          value: data.data,
                          key: 'standbyEnergyConsumption',
                          type: 'input',
                        });
                      });
                    }}
                  >
                    {I18N.carbonNeutral.useDefault}
                  </Button>
                ),
              }}
              {...itemPropsObj(text, index, 'standbyEnergyConsumption')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.numberOfElevators,
          dataIndex: 'elevatorQuantity',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999,
              }}
              {...itemPropsObj(text, index, 'elevatorQuantity')}
              onChange={value => {
                const arr = addList[item.name];
                arr[index].elevatorQuantity = Number(getBit(`${value}`, 0));
                setAddList({
                  ...addList,
                  [item.name]: arr,
                });
              }}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.usageFrequency,
          dataIndex: 'frequency',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomSelect
              item={{
                options: mumentList.BCA_Use_Frequency,
              }}
              {...itemPropsObj(text, index, 'frequency')}
              placeholder={I18N.carbonFootprint.pleaseSelect}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.ratedLoadCapacityK,
          dataIndex: 'ratedLoad',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 99999,
              }}
              {...itemPropsObj(text, index, 'ratedLoad')}
            />
          ),
        },
        // {
        //   title: '平均拥挤程度',
        //   dataIndex: 'crowd',
        //   width: 320,

        //   render: (text: string, record: any, index) => {
        //     return (
        //       <>
        //         <ComstomInputNumber
        //           item={{
        //             min: 0,
        //             max: 999,
        //           }}
        //           {...itemPropsObj(text, index, 'crowd')}
        //         />
        //       </>
        //     );
        //   },
        // },
        {
          title: I18N.carbonNeutral.elevatorSpeedM,
          dataIndex: 'speed',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomSuffixInput
              item={{
                min: 0,
                max: 9,
                suffix: (
                  <Button
                    style={{ padding: 0 }}
                    type='link'
                    onClick={async () => {
                      await apiComputationDefaultValue({
                        key: 'speed',
                      }).then(({ data }) => {
                        OnChangeFn({
                          addList,
                          setAddList,
                          item,
                          index,
                          value: data.data,
                          key: 'speed',
                          type: 'input',
                        });
                      });
                    }}
                  >
                    {I18N.carbonNeutral.useDefault}
                  </Button>
                ),
              }}
              {...itemPropsObj(text, index, 'speed')}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];
    case 'solarEnergyList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },

        {
          title: I18N.carbonNeutral.solarIllumination,
          dataIndex: 'sunArea',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999999,
              }}
              {...itemPropsObj(text, index, 'sunArea')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.heatLossRate,
          dataIndex: 'hotLoss',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomSuffixInput
              item={{
                min: 0,
                max: 100,
                suffix: (
                  <Button
                    style={{ padding: 0 }}
                    type='link'
                    onClick={async () => {
                      await apiComputationDefaultValue({
                        key: 'hotLoss',
                      }).then(({ data }) => {
                        OnChangeFn({
                          addList,
                          setAddList,
                          item,
                          index,
                          value: data.data,
                          key: 'hotLoss',
                          type: 'input',
                        });
                      });
                    }}
                  >
                    {I18N.carbonNeutral.useDefault}
                  </Button>
                ),
              }}
              {...itemPropsObj(text, index, 'hotLoss')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.collectionEfficiency,
          dataIndex: 'setEfficiency',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomSuffixInput
              item={{
                min: 0,
                max: 100,
                suffix: (
                  <Button
                    style={{ padding: 0 }}
                    type='link'
                    onClick={async () => {
                      await apiComputationDefaultValue({
                        key: 'setEfficiency',
                      }).then(({ data }) => {
                        OnChangeFn({
                          addList,
                          setAddList,
                          item,
                          index,
                          value: data.data,
                          key: 'setEfficiency',
                          type: 'input',
                        });
                      });
                    }}
                  >
                    {I18N.carbonNeutral.useDefault}
                  </Button>
                ),
              }}
              {...itemPropsObj(text, index, 'setEfficiency')}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];
    case 'photovoltaicList':
      return [
        {
          title: I18N.carbonFootprint.number,
          width: 82,
          render: (text, record, index: number) => index + 1,
        },

        {
          title: I18N.carbonNeutral.pvPanelNet,
          dataIndex: 'photovoltaicArea',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomInputNumber
              item={{
                min: 0,
                max: 999999,
              }}
              {...itemPropsObj(text, index, 'photovoltaicArea')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.photovoltaicCells,
          dataIndex: 'photovoltaicConvert',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomSuffixInput
              item={{
                min: 0,
                max: 100,
                suffix: (
                  <Button
                    style={{ padding: 0 }}
                    type='link'
                    onClick={async () => {
                      await apiComputationDefaultValue({
                        key: 'photovoltaicConvert',
                      }).then(({ data }) => {
                        OnChangeFn({
                          addList,
                          setAddList,
                          item,
                          index,
                          value: data.data,
                          key: 'photovoltaicConvert',
                          type: 'input',
                        });
                      });
                    }}
                  >
                    {I18N.carbonNeutral.useDefault}
                  </Button>
                ),
              }}
              {...itemPropsObj(text, index, 'photovoltaicConvert')}
            />
          ),
        },
        {
          title: I18N.carbonNeutral.photovoltaicSystem,
          dataIndex: 'photovoltaicLoss',
          width: 320,

          render: (text: string, record: any, index) => (
            <ComstomSuffixInput
              item={{
                min: 0,
                max: 100,
                suffix: (
                  <Button
                    style={{ padding: 0 }}
                    type='link'
                    onClick={async () => {
                      await apiComputationDefaultValue({
                        key: 'photovoltaicLoss',
                      }).then(({ data }) => {
                        OnChangeFn({
                          addList,
                          setAddList,
                          item,
                          index,
                          value: data.data,
                          key: 'photovoltaicLoss',
                          type: 'input',
                        });
                      });
                    }}
                  >
                    {I18N.carbonNeutral.useDefault}
                  </Button>
                ),
              }}
              {...itemPropsObj(text, index, 'photovoltaicLoss')}
            />
          ),
        },
        {
          title: I18N.carbonFootprint.operation,
          dataIndex: 'scriptName',
          width: 300,
          render: (text: string, record: any, index) =>
            addList[item.name].length > 1 ? (
              <Button
                danger
                type='link'
                onClick={() => {
                  clumDel(index);
                }}
              >
                {I18N.carbonFootprint.delete}
              </Button>
            ) : (
              '--'
            ),
        },
      ];

    default:
      return [];
  }
};
/**
 * heatingInfoList 采暖
 * coolInfoList 制冷
 * transmissionDistributionList 运输
 * airEndList 末端空气
 * coolLossList 制冷剂逸散
 * illuminationList 照明
 * elevatorList 电梯
 * solarEnergyList 太阳能
 * photovoltaicList 光伏
 * *
 */
export const creatColumns = (item, addList, setAddList, pageType) =>
  returnColums({ addList, setAddList, pageType, item });
