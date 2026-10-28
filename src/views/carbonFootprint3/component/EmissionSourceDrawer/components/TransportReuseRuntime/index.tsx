import { useForm } from '@formily/react';
import {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ApiExtraParams } from '@/components/CarbonFootprintAccount/BuildModelMainData/type';
import { LocaleContext } from '@/components/LocaleProvider';
import { serviceLangMap } from '@/lang/I18N';
import { TransportReuseModal } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/components/TransportReuseModal';
import { TransportReuseRuntimeContext } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportReuse/context';
import type {
  BatchReuseResult,
  CurrentDraftTransport,
  DistanceOptionsParams,
  TransportFormRow,
  TransportReuseKind,
  TransportReuseRow,
  TransportReuseScope,
} from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportReuse/types';
import { TransportListTransToService } from '@/views/subModules/CarbonFootprintModel/components/EmissionSourceDrawer/transportUtil';

import { transportReuseService } from '../../transportReuse/service';

const loadTransportDistanceOptions = (params: DistanceOptionsParams) =>
  transportReuseService.getDistanceOptions(params);

type NormalizedTransportRow = TransportFormRow & {
  rate?: string | number;
};

interface TransportReuseRuntimeProps extends PropsWithChildren {
  accountId: number | string;
  apiExtraParams?: ApiExtraParams;
  emissionAiFlag?: number;
  emissionSourceId?: number;
  enabled: boolean;
  onApplied: () => void | Promise<void>;
  visible: boolean;
}

export const TransportReuseRuntime: FC<TransportReuseRuntimeProps> = ({
  accountId,
  apiExtraParams,
  children,
  emissionAiFlag,
  emissionSourceId,
  enabled,
  onApplied,
  visible,
}) => {
  const form = useForm();
  const { locale } = useContext(LocaleContext);
  const scope = useMemo<TransportReuseScope>(
    () => ({
      accountId: String(accountId),
      snapFlag: apiExtraParams?.snapFlag ?? 0,
      shareAuth: apiExtraParams?.shareAuth,
      currentEmissionId:
        emissionSourceId === undefined ? undefined : String(emissionSourceId),
      currentAiFlag: emissionAiFlag ?? 0,
      lang: serviceLangMap[locale],
    }),
    [
      accountId,
      apiExtraParams?.shareAuth,
      apiExtraParams?.snapFlag,
      emissionAiFlag,
      emissionSourceId,
      locale,
    ],
  );
  const [distanceOptions, setDistanceOptions] = useState<TransportReuseRow[]>(
    [],
  );
  const [mileageOptionsLoading, setMileageOptionsLoading] = useState(false);
  const [reuseKind, setReuseKind] = useState<TransportReuseKind>('distance');
  const [currentTransport, setCurrentTransport] = useState<TransportFormRow>();
  const [currentDraftTransports, setCurrentDraftTransports] = useState<
    CurrentDraftTransport[]
  >([]);
  const [distanceSourceTransportIds, setDistanceSourceTransportIds] = useState<
    Record<number, string | undefined>
  >({});
  const [modalOpen, setModalOpen] = useState(false);

  const refreshDistanceOptions = async () => {
    setMileageOptionsLoading(true);
    try {
      setDistanceOptions(
        await loadTransportDistanceOptions({
          ...scope,
          keyword: '',
          pageNum: 1,
          pageSize: 100,
        }),
      );
    } finally {
      setMileageOptionsLoading(false);
    }
  };

  useEffect(() => {
    setDistanceSourceTransportIds({});
    if (!enabled || !visible) {
      setDistanceOptions([]);
      setModalOpen(false);
      return undefined;
    }

    let cancelled = false;
    setMileageOptionsLoading(true);
    loadTransportDistanceOptions({
      ...scope,
      keyword: '',
      pageNum: 1,
      pageSize: 100,
    })
      .then(options => {
        if (!cancelled) setDistanceOptions(options);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setMileageOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, scope, visible]);

  const runtimeValue = useMemo(
    () => ({
      enabled,
      canBatchReuse: enabled,
      currentAiFlag: scope.currentAiFlag,
      currentEmissionId: scope.currentEmissionId,
      distanceOptions,
      distanceSourceTransportIds,
      mileageOptionsLoading,
      setDistanceSourceTransportId: (
        transportIndex: number,
        transportId?: string,
      ) => {
        setDistanceSourceTransportIds(current => ({
          ...current,
          [transportIndex]: transportId,
        }));
      },
      openReuse: (kind: TransportReuseKind, transportIndex: number) => {
        if (!enabled) return;

        const transportRows = (form.values.accountEmissionTransportList ||
          []) as TransportFormRow[];
        const currentEmissionTransports = distanceOptions.filter(
          option =>
            option.emissionId === scope.currentEmissionId &&
            option.aiFlag === scope.currentAiFlag,
        );
        const normalizedRows = TransportListTransToService(
          transportRows.map(row => ({
            ...row,
            factorObj: { ...(row.factorObj || {}) },
          })) as Parameters<typeof TransportListTransToService>[0],
          String(form.values.name || ''),
        ) as NormalizedTransportRow[];
        const draftTransports = normalizedRows.flatMap((row, index) => {
          const transportId =
            currentEmissionTransports.find(
              option =>
                Number(option.transportType) === Number(row.transportType) &&
                Number(option.routeNo) === Number(row.routeNo ?? index + 1),
            )?.transportId ?? row.transportId;
          if (transportId === undefined || transportId === null) {
            return [];
          }
          return [
            {
              transportId: String(transportId),
              aiFlag: row.aiFlag ?? scope.currentAiFlag,
              transportType: row.transportType,
              way: row.way,
              unitCode:
                row.unitCode === undefined ? undefined : String(row.unitCode),
              unitName: row.unitName,
              factorUnit: row.factorObj?.unit,
              rate: row.rate === undefined ? undefined : String(row.rate),
            },
          ];
        });
        const selectedTransport = transportRows[transportIndex];
        const defaultCurrentTransport = currentEmissionTransports.find(
          option =>
            Number(option.transportType) ===
              Number(selectedTransport?.transportType) &&
            Number(option.routeNo) ===
              Number(selectedTransport?.routeNo ?? transportIndex + 1),
        );
        const persistedCurrentTransportId =
          defaultCurrentTransport?.transportId ??
          selectedTransport?.transportId;
        const currentTransportId = persistedCurrentTransportId;

        setReuseKind(kind);
        setCurrentTransport(
          selectedTransport
            ? { ...selectedTransport, transportId: currentTransportId }
            : undefined,
        );
        setCurrentDraftTransports(draftTransports);
        setModalOpen(true);
      },
    }),
    [
      distanceOptions,
      distanceSourceTransportIds,
      emissionSourceId,
      enabled,
      form,
      mileageOptionsLoading,
      scope.currentAiFlag,
      scope.currentEmissionId,
    ],
  );

  const handleApplied = async (result: BatchReuseResult) => {
    if (result.pendingUpdates.length > 0) {
      const transportRows = (form.values.accountEmissionTransportList ||
        []) as TransportFormRow[];
      const nextRows = transportRows.map(row => {
        const rowAiFlag = row.aiFlag ?? scope.currentAiFlag;
        const update = result.pendingUpdates.find(
          item =>
            String(row.transportId) === item.transportId &&
            rowAiFlag === item.aiFlag,
        );
        if (!update) return row;
        if (update.distance !== undefined) {
          return { ...row, distance: update.distance };
        }
        if (!update.factorObj) return row;
        const [numeratorUnit, denominatorUnit] = (
          update.factorObj.unit || ''
        ).split('/');
        return {
          ...row,
          factorObj: {
            ...row.factorObj,
            ...update.factorObj,
            matchWay: update.matchWay,
            rate: update.rate,
            numeratorUnit: numeratorUnit || undefined,
            denominatorUnit: denominatorUnit || undefined,
          },
        };
      });
      form.setValuesIn('accountEmissionTransportList', nextRows);
      form.modified = true;
    }

    await onApplied();
    await refreshDistanceOptions();
  };

  return (
    <TransportReuseRuntimeContext.Provider value={runtimeValue}>
      {children}
      <TransportReuseModal
        currentTransport={currentTransport}
        currentDraftTransports={currentDraftTransports}
        kind={reuseKind}
        open={modalOpen}
        scope={scope}
        service={transportReuseService}
        onApplied={handleApplied}
        onCancel={() => setModalOpen(false)}
      />
    </TransportReuseRuntimeContext.Provider>
  );
};
