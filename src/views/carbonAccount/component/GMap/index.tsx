/**
 * @file 高德地图
 */
import I18N from '@src/lang/I18N';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Select } from '@src/components/Select';
import classNames from 'classnames';
import { memo, useEffect, useRef, useState } from 'react';

import style from './index.module.less';
import {
  GMapChangeParams,
  GMapProps,
  MapSearchResult,
  SearchOptions,
} from '../types';

const circleRadiuses = [100, 200, 300, 500, 700, 1000];
export const carbonstopPoint: GMapChangeParams = {
  pointName: undefined, // 碳阻迹
  points: [116.397455, 39.909187],
  circleRadius: circleRadiuses[0],
};

function GMap({
  points,
  pointName,
  onPointChange,
  className,
  circleRadius,
}: GMapProps) {
  const mapPoint = points;
  const mapId = useRef(`map${Date.now()}`);
  const mapRef = useRef(null);
  const mapClassRef = useRef<any>();
  const mapCircleRef = useRef(null);
  const markerRef = useRef(null);
  const renderMarker = (map: any, AMap: any) => {
    if (markerRef.current) {
      map.remove(markerRef.current);
      map.remove(mapCircleRef.current);
    }
    const circle = new AMap.Circle({
      center: mapPoint,
      radius: circleRadius, // 半径
      strokeOpacity: 0.2,
      fillOpacity: 0.4,
      fillColor: '#1791fc',
      zIndex: 50,
    });
    mapCircleRef.current = circle;
    map.add(circle);
    map.setCenter(mapPoint);
    const marker = new AMap.Marker({
      icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
      position: mapPoint,
      draggable: !!pointName,
      offset: new AMap.Pixel(-13, -30),
      cursor: 'move',
    });
    markerRef.current = marker;
    marker.setMap(map);
    if (pointName) {
      marker.on('dragend', e => {
        onPointChange?.({
          points: [e.lnglat.lng, e.lnglat.lat],
          pointName,
          circleRadius,
        });
      });
    } else {
      marker.off('dragend');
    }
  };
  useEffect(() => {
    if (!mapClassRef.current) {
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      window._AMapSecurityConfig = {
        securityJsCode: '2bd177027969e37ddf455821bef04e32',
      };
      AMapLoader.load({
        key: 'd613f633fede334b78bdd7690c6ab181', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.Scale', 'AMap.AutoComplete', 'AMap.ToolBar'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      })
        .then(AMap => {
          // @ts-ignore
          mapClassRef.current = AMap;
          const map = new AMap.Map(mapId.current, {
            center: mapPoint,
            zoom: 16,
          });
          mapRef.current = map;
          const scale = new AMap.Scale({
            visible: true,
          });
          const toolBar = new AMap.ToolBar({
            visible: true,
            position: {
              bottom: '10px',
              right: '10px',
            },
          });

          map.addControl(scale);
          map.addControl(toolBar);
          renderMarker(map, AMap);
        })
        .catch(e => {
          // eslint-disable-next-line
          console.log(e);
        });
    } else {
      renderMarker(mapRef.current, mapClassRef.current);
    }
  }, [mapPoint, circleRadius]);

  const [searchOptions, setSearchOptions] = useState<SearchOptions[]>([]);
  return (
    <div className={classNames(style.wrapper, className)}>
      <form action=''>
        <div className={style.formWrapper}>
          <Select
            className={style.select}
            showSearch
            aria-label='gmap-select'
            value={pointName}
            placeholder={I18N.carbonFootprint.pleaseEnter}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={keywords => {
              if (mapClassRef.current) {
                // 搜素
                const autoComplete = new mapClassRef.current.Autocomplete({
                  city: I18N.workbench.nationwide,
                });

                autoComplete.search(
                  keywords,
                  (status, result: MapSearchResult) => {
                    const tips = result?.tips?.filter(t => t?.location?.lng);
                    if (tips?.length) {
                      setSearchOptions(
                        tips.map(v => ({ ...v, label: v.name, value: v.id })),
                      );
                    } else {
                      setSearchOptions([]);
                    }
                  },
                );
              }
            }}
            options={searchOptions}
            onChange={v => {
              const checked = searchOptions.find(o => o.id === v);
              if (checked) {
                onPointChange?.({
                  points: [checked.location.lng, checked.location.lat],
                  pointName: checked.name,
                  circleRadius,
                });
              }
            }}
            notFoundContent={null}
          />
          <Select
            className={style.circleRadius}
            value={circleRadius}
            aria-label='map-circle-radius'
            options={circleRadiuses.map(v => ({
              label: I18N.template(I18N.carbonAccount.vMeters, { val1: v }),
              value: v,
            }))}
            onChange={v => {
              onPointChange?.({ points, pointName, circleRadius: +v });
            }}
          />
        </div>
      </form>
      <div id={mapId.current} className={classNames(style.map)} />
    </div>
  );
}

export default memo(GMap);
