import { EnvironmentOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Modal, Select } from 'antd';
import {
  FC,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { TMap as Map } from 'tlbs-map-react';

import {
  AddressType,
  Address,
} from '@/components/formily/components/AdressSelect';
import { TENCENT_MAP_KEY } from '@/config';
import { jsonp, Toast } from '@/utils';

import styles from './index.module.less';

const MemoMap = memo(Map);

const MapQuery = forwardRef<
  { startPos?: AddressType; endPos?: AddressType },
  { addressList: AddressType[] }
>(({ addressList }, ref) => {
  const [startPos, setStartPos] = useState<AddressType>();
  const [endPos, setEndPos] = useState<AddressType>();

  const mapRef = useRef<{
    panTo: (...args: any[]) => any;
    on: (...args: any[]) => any;
    off: (...args: any[]) => any;
  }>(null);

  useImperativeHandle(ref, () => ({ startPos, endPos }), [startPos, endPos]);

  useEffect(() => {
    if (!mapRef.current || !endPos) {
      return () => {};
    }

    const map = mapRef.current;
    const { TMap } = window as unknown as {
      TMap: {
        LatLng: new (...args: any[]) => any;
        MultiMarker: new (...args: any[]) => {
          setMap: (...args: any[]) => void;
        };
        MarkerStyle: new (...args: any[]) => any;
      };
    };
    const center = new TMap.LatLng(endPos.location.lat, endPos.location.lng);

    const markerLayer = new TMap.MultiMarker({
      map,
      styles: {
        'marker-style': new TMap.MarkerStyle({
          width: 25,
          height: 35,
          anchor: { x: 12, y: 35 },
        }),
      },
      geometries: [
        {
          id: 'marker',
          styleId: 'marker-style',
          position: center,
        },
      ],
    });

    map.panTo(center);

    return () => {
      markerLayer.setMap(null);
    };
  }, [endPos]);

  useEffect(() => {
    const timer = setInterval(() => {
      const map = mapRef.current;

      if (map) {
        clearInterval(timer);
        map.on(
          'click',
          ({ latLng }: { latLng: { lat: number; lng: number } }) => {
            jsonp<{
              status: number;
              result: {
                ad_info: {
                  district: string;
                  province: string;
                  city: string;
                  name: string;
                };
                address: string;
                location: { lat: number; lng: number };
                formatted_addresses: { standard_address: string };
              };
            }>('https://apis.map.qq.com/ws/geocoder/v1', {
              key: TENCENT_MAP_KEY,
              location: `${latLng.lat},${latLng.lng}`,
              output: 'jsonp',
            }).then(resp => {
              const { status, result } = resp;

              if (status === 0) {
                setEndPos({
                  ...result.ad_info,
                  location: result.location,
                  address:
                    result.formatted_addresses?.standard_address ||
                    result.address,
                });
              }
            });
          },
        );
      }
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div>
      <div className={styles.header}>
        <Select
          value={startPos?.address}
          fieldNames={{ value: 'address', label: 'address' }}
          placeholder={I18N.carbonInternational.companyAddress}
          options={addressList.filter(item => !!item.address)}
          onChange={(_, addr) => setStartPos(addr as unknown as AddressType)}
        />
        <Address
          value={endPos}
          placeholder={I18N.questionnaire.address}
          objectValue
          suffixIcon={<EnvironmentOutlined />}
          onChange={val => {
            const addr = val as AddressType;
            setEndPos(addr);
          }}
        />
      </div>
      <MemoMap
        className={styles.mapContainer}
        ref={mapRef}
        apiKey={TENCENT_MAP_KEY}
      />
    </div>
  );
});

const MapQueryModal: FC<{
  addressList: AddressType[];
  onConfirm: (distance: number) => void;
}> = ({ addressList = [], onConfirm }) => {
  const [open, setOpen] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);
  const queryRef = useRef<{ startPos?: AddressType; endPos?: AddressType }>(
    null,
  );
  const submit = () => {
    const { startPos, endPos } = queryRef.current || {};

    if (!startPos || !endPos) {
      Toast('error', I18N.questionnaire.pleaseSelectACompany);
      return;
    }

    setSubmitLoading(true);
    jsonp<{ status: number; result: { routes: { distance: number }[] } }>(
      'https://apis.map.qq.com/ws/direction/v1/driving',
      {
        key: TENCENT_MAP_KEY,
        from: `${startPos.location.lat},${startPos.location.lng}`,
        to: `${endPos.location.lat},${endPos.location.lng}`,
        output: 'jsonp',
      },
    )
      .then(({ status, result }) => {
        if (status === 0) {
          onConfirm(Number((result.routes[0].distance / 1000).toFixed(2)));
          setOpen(false);
        } else {
          Toast('error', I18N.questionnaire.miscalculation);
        }
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  return (
    <div>
      <Modal
        width={1106}
        open={open}
        closeIcon={null}
        destroyOnClose
        okButtonProps={{ loading: submitLoading }}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onOk={submit}
      >
        <MapQuery addressList={addressList} ref={queryRef} />
      </Modal>
      <div className={styles.mapBtnContent}>
        <span className={styles.mapBtn} onClick={() => setOpen(true)}>
          {I18N.questionnaire.mapQuery}
        </span>
      </div>
    </div>
  );
};

export default MapQueryModal;
