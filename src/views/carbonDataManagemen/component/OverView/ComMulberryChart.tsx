/** **
 * @file 报送趋势图
 * @author ljh
 */
import I18N from '@src/lang/I18N';
import { groupRelationUsingPOSTAccountControllerApi } from '@src/sdks/java/data';
import useSyncCallback from '@utils/useSyncCallback';
import Nodata from '@views/carbonDataManagemen/component/NoData';
import { compact, map, filter, uniq } from 'lodash-es';
import moment from 'moment';
import { useState, useEffect } from 'react';

import EmoChart from '../EmployCarbonData/EmoChart';

export const lineOption = {
  color: ['#6F94F1', '#3AD0BE'],
};
export default function CoMulberryChart({ timeRange }) {
  const [ecuteMenData, getEcuteMenData] = useState<{
    data?: { name: string }[];
    links?: string[];
  }>({});
  // 定义一个方法 用于累加任务数
  const returnValue = (item, arr) =>
    filter(arr, ['source', item.target]).reduce(
      (result, n) => result + n.value,
      0,
    );
  const ApiSubmissionTrendFn = async () => {
    const beginTime =
      (timeRange && moment(timeRange[0]).format('YYYY-MM-DD')) || '';
    const endTime =
      (timeRange && moment(timeRange[1]).format('YYYY-MM-DD')) || '';
    if (beginTime && endTime) {
      await groupRelationUsingPOSTAccountControllerApi({
        beginTime,
        endTime,
      }).then(({ data }) => {
        const newData = data as unknown as {
          code: 200;
          data: {
            data?: string[];
            links?: { target: string; source: string; value: string }[];
          };
        };
        if (newData.code === 200) {
          const mentData = newData.data;
          if (
            Number(mentData?.data?.length) > 0 &&
            Number(mentData?.links?.length) > 0
          ) {
            const arr = uniq(compact(mentData.data)).map(item => ({
              name: item,
            }));
            new Promise(resolve => {
              const newLinks = map(mentData?.links, item => {
                if (
                  item.source === I18N.carbonDataManagemen.numberOfParticipants
                ) {
                  return {
                    ...item,
                    targetNumber: item.value,
                    value: returnValue(item, mentData?.links),
                  };
                }
                return item;
              }) as unknown as string[];
              resolve(newLinks);
            }).then(data => {
              getEcuteMenData({
                data: arr,
                // @ts-ignore
                links: data as unknown as string[],
              });
            });
          } else {
            getEcuteMenData({});
          }
        }
      });
    }
  };
  const syncCallbackFn = useSyncCallback(ApiSubmissionTrendFn);

  useEffect(() => {
    syncCallbackFn();
  }, [timeRange]);
  return (
    <>
      <p className='title'>{I18N.carbonDataManagemen.groupingScenarioPairs}</p>
      <p className='time'>
        {' '}
        {timeRange && moment(timeRange[0]).format('YYYY-MM-DD')}{' '}
        {I18N.carbonFootprint.to}{' '}
        {timeRange && moment(timeRange[1]).format('YYYY-MM-DD')}
      </p>
      {Number(ecuteMenData.data?.length) > 0 &&
      Number(ecuteMenData.links?.length) > 0 ? (
        <EmoChart
          option={{
            tooltip: {
              trigger: 'item',
              triggerOn: 'mousemove',
              transitionDuration: 0.000001,
              className: 'ComCompanyByStrength_tooltip',
              formatter(param) {
                const { data } = param;
                return data.source
                  ? I18N.template(I18N.carbonDataManagemen.datas2, {
                      val1: data.source,
                      val2: data.target,
                      val3: data.value,
                    })
                  : I18N.template(I18N.carbonDataManagemen.datan2, {
                      val1: data.name,
                      val2: param.value,
                    });
              },
            },
            grid: {
              containLabel: true,
              left: '0%',
              bottom: '10%',
              right: 0,
            },
            series: {
              type: 'sankey',
              layout: 'none',
              data: ecuteMenData.data,
              links: ecuteMenData.links,
              emphasis: {
                focus: 'adjacency',
              },

              levels: [
                {
                  depth: 0,
                  itemStyle: {
                    color: '#698CFF',
                  },
                  lineStyle: {
                    color: 'source',
                    opacity: 0.6,
                  },
                },
                {
                  depth: 1,
                  itemStyle: {
                    color: '#64DBC5',
                  },
                  lineStyle: {
                    color: 'source',
                    opacity: 0.6,
                  },
                },
              ],
              lineStyle: {
                curveness: 0.5,
              },
            },
            // width: '79%',
          }}
        />
      ) : (
        <Nodata />
      )}
    </>
  );
}
