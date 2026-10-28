/*
 * @@description:绿色会议 数据统计
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-09-29 11:15:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-28 20:04:53
 */

import I18N from '@src/lang/I18N';
import html2canvas from 'html2canvas';
import { createContext, FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../carbon-greenMeeting.scss';
import { Button, Radio } from 'antd';
import { EChartsCoreOption } from 'echarts';
import { Toast } from '@src/utils/Toast';
import moment from 'moment';
import classNames from 'classnames';

import style from './addAdjustData.module.less';
import { resultData } from './adjustData';
import Echart from '../../carbonproduct/components/echartBar';
import { apiCarbonAccountingStatistics } from '../service';

export const AppContact: any = createContext({});
const Product: FC = () => {
  const [infoData, setInfoData] = useState({
    accountingName: '',
    actName: '',
    emissionTotal: '',
  });
  const layoutDom: HTMLDivElement | any =
    document.querySelector('.layout__container');
  layoutDom && (layoutDom.style.height = 'calc(100% - 130px)');
  const [chartType, setChartType] = useState('bar');
  const [resultList, setResultList] = useState(resultData);
  const [modelClassfiy, setModelClassfiy] = useState([]);
  const history = useHistory();
  const creatImg = (type = 'chartBox') => {
    const ele: any = document.getElementById(type);
    let downloadName = '';
    let date = moment(new Date()).format('YYYY-MM-DD HH:SS:MM');
    date = date.replaceAll(':', '：');
    switch (type) {
      case 'chartBox':
        downloadName = I18N.template(
          I18N.greenMeeting.classificationOfEmissionSources3,
          { val1: date },
        );
        break;
      case 'letOutList':
        downloadName = I18N.template(I18N.greenMeeting.emissionInventoryD, {
          val1: date,
        });
        break;
      case 'letOutResult':
        downloadName = I18N.template(I18N.greenMeeting.emissionResultsScore2, {
          val1: date,
        });
        break;
      default:
        break;
    }
    setTimeout(() => {
      html2canvas(ele, {}).then(
        canvas => {
          const dataURL = canvas.toDataURL('image/png');
          const downloadElement = document.createElement('a');
          downloadElement.style.display = 'none';
          downloadElement.download = downloadName;
          downloadElement.href = dataURL;
          downloadElement.click(); // 点击下载
        },
        () => {},
      );
    }, 100);
  };
  const renderDataComparison = () => {
    const barChart: EChartsCoreOption = {
      color: '#6F94F1',
      xAxis: {
        type: 'category',
        with: '60px',
        nameGap: 20,
        data: modelClassfiy?.map((item: any) => item.className),
        axisLine: {
          lineStyle: {
            color: '#999',
          },
        },
        axisLabel: {
          lineHeight: 35,
          fontSize: 14,
          fontWeight: 400,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
      },
      grid: {
        top: '12%',
        bottom: '0',
        left: '2%',
        right: '0%',
        containLabel: true,
      },
      yAxis: {
        type: 'value',
        nameTextStyle: {
          color: '#999999',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 35,
          align: 'center',
          padding: [0, 0, 0, 30],
        },
        name: I18N.greenMeeting.unitTCo,
      },
      series: [
        {
          barWidth: 60,
          data: modelClassfiy?.map((item: any) => item.total),
          type: 'bar',
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            rich: {
              a: {
                color: '#666666',
                lineHeight: 22,
                align: 'center',
              },
              hr: {
                borderColor: '#fff',
                width: '100%',
                borderWidth: 1,
                height: 0,
              },
              b: {
                color: '#666666',
                fontSize: 12,
                lineHeight: 33,
              },
              per: {
                color: '#fff',
                backgroundColor: '#4C5058',
                padding: [3, 4],
                borderRadius: 4,
              },
            },
          },
        },
      ],
    };

    const pieChart: EChartsCoreOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <br/>{c}({d}%)',
      },
      color: [
        '#FFC372',
        '#FF995B',
        '#FF5867',
        '#8169F7',
        '#6F94F1',
        '#3AD0BE',
        '#61D7F5',
      ].slice(0, modelClassfiy.length),
      legend: {
        itemGap: 10,
        itemHeight: 14,
        itemWidth: 14,
        top: '-5',
        textStyle: {
          color: '#666666',
        },
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            formatter: '{b|{b}:}{c}',
            rich: {
              a: {
                color: '#666666',
                lineHeight: 22,
                align: 'center',
              },
              hr: {
                borderColor: '#fff',
                width: '100%',
                borderWidth: 1,
                height: 0,
              },
              b: {
                color: '#666666',
                fontSize: 12,
                lineHeight: 33,
              },
              per: {
                color: '#fff',
                backgroundColor: '#4C5058',
                padding: [3, 4],
                borderRadius: 4,
              },
            },
          },
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: '{b} : {d}%',
              },
              labelLine: { show: true },
            },
          },
          labelLine: {
            show: false,
          },
          grid: {
            top: '17%',
            bottom: '0',
            left: '1%',
            right: '0%',
            containLabel: true,
          },
          data: modelClassfiy?.map((item: any) => ({
            name: item.className,
            value: item.total,
          })),
        },
      ],
    };

    return (
      <div className='data-box'>
        <p className='tip'>
          {I18N.greenMeeting.classificationOfEmissionSources2}
        </p>
        <div className='tit-box'>
          <Radio.Group
            value={chartType}
            onChange={() => {
              const result = chartType === 'bar' ? 'carn' : 'bar';
              setChartType(result);
            }}
          >
            <Radio.Button value='bar'>
              {I18N.carbonFootprint.barChart}
            </Radio.Button>
            <Radio.Button value='carn'>
              {I18N.greenMeeting.pieChart}
            </Radio.Button>
          </Radio.Group>
          <Button
            onClick={() => {
              Toast('success', I18N.greenMeeting.generatingImages, 0.5);
              creatImg('chartBox');
            }}
          >
            {I18N.carbonFootprint.download}
          </Button>
        </div>
        <div id='chartBox'>
          <Echart
            option={chartType === 'bar' ? barChart : pieChart}
            style={{
              height: '390px',
              width: '100%',
            }}
          />
        </div>
      </div>
    );
  };
  const renderLetOutList = () => (
    <div className='data-box' style={{ paddingTop: 0 }}>
      <div className='tit-box'>
        <p className='tip'>{I18N.carbonFootprint3.emissionInventory}</p>
        <Button
          onClick={() => {
            creatImg('letOutList');
          }}
        >
          {I18N.carbonFootprint.download}
        </Button>
      </div>
      <table className='result-table' id='letOutList'>
        <tr>
          <th>{I18N.greenMeeting.classificationOfEmissionSources}</th>
          <th>{I18N.greenMeeting.emissionsTC}</th>
          <th>{I18N.greenMeeting.proportion}</th>
        </tr>
        {modelClassfiy.map((item: any) => (
          <>
            <tr>
              <td style={{ fontWeight: 500 }}>{item.className}</td>
              <td style={{ fontWeight: 500 }}>{item.total}</td>
              <td style={{ fontWeight: 500 }}>{item.rate}</td>
            </tr>
            {item.children.map((ite, index) => (
              <tr>
                <td style={{ paddingLeft: '35px' }}>{ite.className}</td>
                <td>{ite.total}</td>
                {index === 0 ? (
                  <td rowSpan={item.children.length}>
                    {Number.isNaN(ite.rate * 2) ? '--' : ite.rate * 2 || '--'}
                  </td>
                ) : (
                  ''
                )}
              </tr>
            ))}
          </>
        ))}
        <tr style={{ background: '#F7F8F9' }}>
          <td>{I18N.greenMeeting.total}</td>
          <td>{infoData.emissionTotal}</td>
          <td>100</td>
        </tr>
      </table>
    </div>
  );
  const renderLetOutresult = () => (
    <div className='data-box'>
      <div className='tit-box'>
        <p className='tip'>{I18N.greenMeeting.emissionResultsScore}</p>
        <Button
          onClick={() => {
            creatImg('letOutResult');
          }}
        >
          {I18N.carbonFootprint.download}
        </Button>
      </div>
      <div id='letOutResult'>
        <table className='result-table'>
          <tr>
            <th>{I18N.greenMeeting.classificationOfEmissionSources}</th>
            <th>{I18N.carbonFootprint.emissionSources}</th>
            <th>{I18N.greenMeeting.emissionsTC}</th>
            <th>{I18N.greenMeeting.proportion}</th>
          </tr>
          {resultList.map((item, index) => (
            <tr>
              {/*  eslint-disable-next-line no-nested-ternary */}
              {index === 0 || index === 2 || index === 7 ? (
                <td rowSpan={2}>{item.originClass}</td>
              ) : index === 2 ||
                index === 4 ||
                index === 5 ||
                index === 6 ||
                index === 7 ||
                index === 9 ? (
                <td>{item.originClass}</td>
              ) : (
                ''
              )}
              <td>{item.origin}</td>
              <td>{item.out}</td>
              <td>{item.radio}</td>
            </tr>
          ))}
          <tr style={{ background: '#F7F8F9' }}>
            <td colSpan={2}>{I18N.greenMeeting.total}</td>
            <td>{infoData.emissionTotal}</td>
            <td>100</td>
          </tr>
        </table>
      </div>
    </div>
  );
  const rendetTop = () => (
    <div className='adjustdata-box'>
      <p className='tip'>{I18N.ModelManagement.dataStatistics2}</p>
      <div className='name-box'>
        <p>
          {I18N.greenMeeting.carbonAccountingName}
          {infoData.accountingName}
        </p>
        <p>
          {I18N.greenMeeting.activityName2}
          {infoData.actName}
        </p>
      </div>
    </div>
  );
  useEffect(() => {
    const accountingId = new URLSearchParams(window.location.search).get('id');
    apiCarbonAccountingStatistics({ accountingId }).then((res: any) => {
      if (res.data.data) {
        const { accounting, guide, modelClass } = res.data.data;
        setInfoData({
          actName: accounting.actName,
          accountingName: accounting.accountingName,
          emissionTotal: accounting.emissionTotal,
        });
        if (guide?.length) {
          resultData.forEach(item => {
            guide.forEach(ite => {
              if (item.key === ite.key) {
                // eslint-disable-next-line no-param-reassign
                item.out = ite.total || '--';
                // eslint-disable-next-line no-param-reassign
                item.radio = ite.rate || '--';
              }
            });
          });
          setResultList(resultData);
        }
        setModelClassfiy(
          modelClass.map(item => ({
            ...item,
            key: '1',
          })),
        );
      }
    });
  }, []);
  useEffect(() => {}, []);
  return (
    <div className={classNames('two-box', style.addjustDatawrapper)}>
      {rendetTop()}
      {renderDataComparison()}
      {renderLetOutList()}
      {renderLetOutresult()}
      <div className='bottom-box'>
        <Button
          onClick={() => {
            history.go(-1);
          }}
        >
          {I18N.carbonFootprint.return}
        </Button>
      </div>
    </div>
  );
};

export default Product;
