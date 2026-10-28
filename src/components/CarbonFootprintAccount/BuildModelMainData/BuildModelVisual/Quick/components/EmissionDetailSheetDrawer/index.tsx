import {
  CloseOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { useMount } from 'ahooks';
import { Button, Empty, Modal, Spin, Table, Tooltip } from 'antd';
import { debounce } from 'lodash-es';
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { CustomDrawer } from '@/components/CustomDrawer';
import { RootState } from '@/store';
import WebOfficeSDK from '@/views/subModules/CarbonFootprintModel/WPSFile/web-office-sdk-solution-v2.0.7.es';

import styles from './index.module.less';
import {
  AccountEmissionAlysisResult,
  postAccountEmissionAlysisEmissionSheet,
  postAccountEmissionEditEmissionData,
  postAccountEmissionEditEmissionSheet,
  postAccountEmissionSyncWpsSheetMap,
  postAccountEmissionSyncWpsSheetMapDelta,
  SyncWpsSheetMapDeltaType,
} from '../../service';

const LOG_PREFIX = '[EmissionDetailSheetDrawer]';

function logSheet(scope: string, payload: Record<string, unknown>): void {
  if (import.meta.env.MODE === 'development') {
    // eslint-disable-next-line no-console -- WPS sheet 绑定 / 激活调试
    console.info(LOG_PREFIX, scope, payload);
  }
}

export type EmissionDetailSheetDrawerProps = {
  open: boolean;
  onClose: () => void;
  isShare?: boolean;
  excelUrl?: string;
  accountName?: string;
  emissionName?: ReactNode;
  categoryName?: ReactNode;
  stageName?: ReactNode;
  /**
   * 用于 WPS 内定位的 sheet id：可为接口 wpsSheetId，或旧字段 sheetId 等合并结果（见外层 firstNonEmptySheetId）
   */
  wpsSheetId?: string | number;
  /**
   * 仅接口「原始」wpsSheetId（extra / matchObject.wpsSheetId，不含 sheetId 兜底）。
   * 是否需调 syncWpsSheetMap 只看此字段；有值表示后端已绑定映射。
   */
  apiWpsSheetId?: string | number;
  /** 排放源详情接口 sheetIndex（多为 1-based，兼容 0-based）；wps 按 id 匹配失败时会回退此项 */
  activeSheetIndex?: number;
  showAiBanner?: boolean;
  onAiParse?: () => void;
  emissionId?: number;
  /**
   * 核算 id。未绑定 wpsSheetId 时，抽屉内在 WPS 就绪后调用
   * `POST .../syncWpsSheetMap` 写入 sheet 映射。
   */
  accountId?: number | string;
  /**
   * 抽屉内完成 syncWpsSheetMap 绑定成功后调用。
   * 外层应在此重新拉取核算/account 详情（如 accountView）并重绘画布。
   */
  onRefreshAccount?: () => void | Promise<void>;
};

function getOfficeType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
  if (['doc', 'docx', 'wps', 'wpt', 'dot', 'dotx', 'rtf'].includes(ext))
    return 'w';
  if (['xls', 'xlsx', 'et', 'csv', 'xlt', 'xlsm'].includes(ext)) return 's';
  if (['ppt', 'pptx', 'dps', 'dpt', 'pps', 'ppsx'].includes(ext)) return 'p';
  if (ext === 'pdf') return 'f';
  return 'w';
}

type SheetInfo = { index: number; name?: string; id?: unknown };
type SheetOption = { id: string; name: string };
type SheetTarget = {
  wpsSheetId?: string | number | null;
  activeSheetIndex?: number | null;
};

function parseSheetIds(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  return Array.from(
    new Set(
      `${value}`
        .split(/[,，;；]/)
        .map(v => v.trim())
        .filter(Boolean),
    ),
  );
}

/** 将接口可能返回的 1-based 或 0-based 序号转为 WPS Worksheets.Item 使用的 1-based 下标 */
function toOneBasedWorksheetIndex(
  idx: number,
  sheetCount: number,
): number | undefined {
  if (!Number.isFinite(idx) || sheetCount < 1) return undefined;
  const n = Math.trunc(idx);
  if (n >= 1 && n <= sheetCount) return n;
  if (n >= 0 && n <= sheetCount - 1) return n + 1;
  return undefined;
}

function resolveAccountIdForSync(
  raw: number | string | undefined,
): number | undefined {
  if (raw === undefined || raw === null || `${raw}`.trim() === '') {
    return undefined;
  }
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.trunc(n);
}

function delayMs(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function sheetIdEqualsCell(a: unknown, b: string | number): boolean {
  if (a === b) return true;
  if (a == null) return false;
  const bs = `${b}`.trim();
  if (`${a}` === bs) return true;
  if (typeof a === 'number' && typeof b === 'number' && a === b) return true;
  const an = Number(a);
  const bn = Number(b);
  if (
    !Number.isNaN(an) &&
    !Number.isNaN(bn) &&
    Number.isFinite(an) &&
    Number.isFinite(bn) &&
    an === bn
  ) {
    return true;
  }
  return false;
}

function normalizeSheetId(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = `${value}`.trim();
  return s === '' ? undefined : s;
}

function normalizeFiniteIndex(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}

function hasSheetTarget(opts: SheetTarget): boolean {
  return (
    normalizeSheetId(opts.wpsSheetId) !== undefined ||
    normalizeFiniteIndex(opts.activeSheetIndex) !== undefined
  );
}

function buildSheetTargetKey(opts: SheetTarget): string {
  const sid = normalizeSheetId(opts.wpsSheetId) ?? '';
  const idx = normalizeFiniteIndex(opts.activeSheetIndex);
  return `sid:${sid}|idx:${idx}`;
}

function AiParseIcon(): JSX.Element {
  return (
    <span className={styles.aiBtnIcon} aria-hidden='true'>
      <svg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M8 1.5L9.62 6.38L14.5 8L9.62 9.62L8 14.5L6.38 9.62L1.5 8L6.38 6.38L8 1.5Z'
          fill='currentColor'
        />
        <circle cx='12.5' cy='3.5' r='1.25' fill='currentColor' />
      </svg>
    </span>
  );
}

export const EmissionDetailSheetDrawer: FC<EmissionDetailSheetDrawerProps> = ({
  open,
  onClose,
  isShare,
  excelUrl,
  accountName,
  emissionName,
  categoryName,
  stageName,
  wpsSheetId,
  apiWpsSheetId,
  activeSheetIndex,
  showAiBanner,
  onAiParse,
  emissionId,
  accountId,
  onRefreshAccount,
}) => {
  type AiParseState = 'idle' | 'loading' | 'success';

  const normalizedWpsSheetId = normalizeSheetId(wpsSheetId);
  const effectiveWpsSheetId =
    normalizedWpsSheetId !== undefined ? wpsSheetId : undefined;
  const isShareAccountPath =
    typeof window !== 'undefined' &&
    window.location.pathname.includes('/footprintAccount/shareAccountLogin');
  const hasAccountEditPermission = checkPermissions(
    true,
    'footprint3:account:edit',
  );
  const isReadOnlyByShare = !!isShare || isShareAccountPath;
  const isReadOnly = isReadOnlyByShare || !hasAccountEditPermission;

  /** 仅原始接口字段，用于判断是否仍需 syncWpsSheetMap（不能与合并后的 wpsSheetId/sheetId 混用） */
  const normalizedApiWpsSheetId = normalizeSheetId(apiWpsSheetId);
  const effectiveApiWpsSheetId =
    normalizedApiWpsSheetId !== undefined ? apiWpsSheetId : undefined;

  /** 轮询激活 sheet 时读取最新 props（同步接口返回后父组件会更新 wpsSheetId） */
  const sheetTargetRef = useRef({
    wpsSheetId: effectiveWpsSheetId as string | number | undefined,
    activeSheetIndex,
  });
  useEffect(() => {
    sheetTargetRef.current = {
      wpsSheetId: effectiveWpsSheetId,
      activeSheetIndex,
    };
  }, [effectiveWpsSheetId, activeSheetIndex]);

  const syncWpsMapSentRef = useRef(false);
  /** 防止 activate / wait / latePoll 并发重复 POST */
  const syncWpsMapSyncingRef = useRef(false);
  /** 同一目标 sheet 切换成功后不再重复激活 */
  const activatedTargetKeyRef = useRef<string | null>(null);
  /** 防止同一目标在短时间内并发触发多次激活 */
  const activatingTargetKeyRef = useRef<string | null>(null);
  const sheetDeltaBaselineRef = useRef<Record<string, SheetInfo> | null>(null);
  const sheetDeltaSyncingRef = useRef(false);
  useEffect(() => {
    if (!open) {
      syncWpsMapSentRef.current = false;
      syncWpsMapSyncingRef.current = false;
      activatedTargetKeyRef.current = null;
      activatingTargetKeyRef.current = null;
      sheetDeltaBaselineRef.current = null;
      sheetDeltaSyncingRef.current = false;
      setSheetOptions([]);
      setLinkSheetVisible(false);
      setSelectedSheetIds([]);
      setLinking(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    logSheet(I18N.components.drawe, {
      accountId,
      wpsSheetId,
      apiWpsSheetId,
      effectiveApiWpsSheetId,
      wpsSheetIdType:
        wpsSheetId === undefined || wpsSheetId === null
          ? 'empty'
          : typeof wpsSheetId,
      activeSheetIndex,
      effectiveWpsSheetId,
      excelUrlPreview:
        excelUrl && excelUrl.length > 160
          ? `${excelUrl.slice(0, 160)}…`
          : excelUrl,
      fileName: accountName
        ? I18N.template(I18N.components.accou2, { val1: accountName })
        : I18N.carbonFootprint3.detailedDataX,
      emissionLabel:
        typeof emissionName === 'string' || typeof emissionName === 'number'
          ? String(emissionName)
          : '[ReactNode]',
      categoryLabel:
        typeof categoryName === 'string' || typeof categoryName === 'number'
          ? String(categoryName)
          : categoryName
          ? '[ReactNode]'
          : '',
      stageLabel:
        typeof stageName === 'string' || typeof stageName === 'number'
          ? String(stageName)
          : stageName
          ? '[ReactNode]'
          : '',
    });
  }, [
    open,
    accountId,
    wpsSheetId,
    apiWpsSheetId,
    effectiveApiWpsSheetId,
    activeSheetIndex,
    effectiveWpsSheetId,
    excelUrl,
    accountName,
    emissionName,
    categoryName,
    stageName,
  ]);

  const userInfo = useSelector<RootState, RootState['companyUserInfo']>(
    state => state.companyUserInfo,
  )?.userInfo as
    | {
        userId?: string | number;
        username?: string;
        userName?: string;
      }
    | undefined;

  const registerApiPath =
    import.meta.env.REACT_APP_WPS_API_URL ||
    (process.env.REACT_APP_WPS_API_URL as string);
  const appId =
    import.meta.env.REACT_APP_WPS_APP_ID ||
    (process.env.REACT_APP_WPS_APP_ID as string);

  const file = useMemo(() => {
    const safeName = accountName
      ? I18N.template(I18N.components.accou2, { val1: accountName })
      : I18N.carbonFootprint3.detailedDataX;
    return { name: safeName, url: excelUrl || '' };
  }, [accountName, excelUrl]);

  const mountRef = useRef<HTMLDivElement>(null);
  const wpsInstanceRef = useRef<{
    destroy?: () => void;
    save?: () => void;
    ready?: () => Promise<void>;
    ApiEvent?: {
      AddApiEventListener?: (
        name: string,
        cb: (data: { status?: number }) => void,
      ) => void;
    };
  } | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [aiBannerVisible, setAiBannerVisible] = useState(!!showAiBanner);
  const [aiParseState, setAiParseState] = useState<AiParseState>('idle');
  const [aiParseResult, setAiParseResult] =
    useState<AccountEmissionAlysisResult | null>(null);
  const [aiFillLoading, setAiFillLoading] = useState(false);
  const [sheetOptions, setSheetOptions] = useState<SheetOption[]>([]);
  const [linkSheetVisible, setLinkSheetVisible] = useState(false);
  const [selectedSheetIds, setSelectedSheetIds] = useState<string[]>([]);
  const [linking, setLinking] = useState(false);

  const linkSheetRows = useMemo(
    () =>
      sheetOptions.map(item => ({
        sheetId: item.id,
        sheetName: item.name,
      })),
    [sheetOptions],
  );

  useEffect(() => {
    if (!open) return;
    setAiBannerVisible(!!showAiBanner);
    setAiParseState('idle');
    setAiParseResult(null);
    setAiFillLoading(false);
  }, [open, showAiBanner]);

  const handleAiParse = async () => {
    if (isReadOnly) return;
    if (!excelUrl) return;
    const id = Number(emissionId);
    if (!Number.isFinite(id) || id <= 0) {
      Toast('warn', I18N.components.emissionSourceInformation);
      return;
    }
    setAiBannerVisible(true);
    setAiParseState('loading');
    setAiParseResult(null);
    if (onAiParse) onAiParse();
    try {
      const { data } = await postAccountEmissionAlysisEmissionSheet({
        emissionId: Math.trunc(id),
      });
      if (data?.code !== 200 || !data?.data) {
        throw new Error(data?.msg || I18N.components.aiAnalysisLost2);
      }
      setAiParseResult(data.data);
      setAiParseState('success');
    } catch (error) {
      setAiBannerVisible(false);
      setAiParseState('idle');
      Toast('error', I18N.components.aiAnalysisLost);
    }
  };

  const handleAiFillData = async () => {
    if (isReadOnly) return;
    const id = Number(emissionId);
    if (!Number.isFinite(id) || id <= 0) {
      Toast('warn', I18N.components.emissionSourceInformation);
      return;
    }
    const amount = `${aiParseResult?.finalValue ?? ''}`.trim();
    const unitName = `${aiParseResult?.finalValueUnit ?? ''}`.trim();
    if (!amount || !unitName) {
      Toast('warn', I18N.components.aiAnalysisResults2);
      return;
    }
    setAiFillLoading(true);
    try {
      const { data } = await postAccountEmissionEditEmissionData({
        id: Math.trunc(id),
        amount,
        unitName,
      });
      if (data?.code && data.code !== 200) {
        throw new Error(data.msg || I18N.components.dataInputIsMissing);
      }
      Toast('success', I18N.components.fillInTheDataAs);
      await Promise.resolve(onRefreshAccount?.());
    } catch (error) {
      // Toast('error', '数据填入失败，请稍后重试');
    } finally {
      setAiFillLoading(false);
    }
  };

  const debounceSave = useMemo(
    () =>
      debounce(() => {
        wpsInstanceRef.current?.save?.();
      }, 1000),
    [],
  );

  const destroyWps = () => {
    sheetDeltaBaselineRef.current = null;
    sheetDeltaSyncingRef.current = false;
    try {
      wpsInstanceRef.current?.destroy?.();
    } finally {
      wpsInstanceRef.current = null;
    }
  };

  useMount(() => () => {
    debounceSave.cancel();
    destroyWps();
  });

  const initWps = async () => {
    if (!excelUrl || !open) {
      logSheet('initWps.skip', {
        reason: !excelUrl ? 'no excelUrl' : 'not open',
      });
      return;
    }
    if (!mountRef.current) {
      await delayMs(50);
    }
    if (!mountRef.current) {
      logSheet('initWps.skip', { reason: 'mountRef missing after wait' });
      return;
    }

    logSheet('initWps.start', {
      effectiveApiWpsSheetId,
      effectiveWpsSheetId,
      activeSheetIndex,
      file: file.name,
    });

    const getEtApp = (instance: any) => {
      try {
        const raw = instance?.Application;
        if (typeof raw === 'function') {
          return raw.call(instance);
        }
        if (raw != null) {
          return raw;
        }
      } catch {
        /* fall through */
      }
      return (
        instance?.ExcelApplication?.() ||
        instance?.EtApplication?.() ||
        instance?.excelApplication?.() ||
        instance?.etApplication?.()
      );
    };

    const dumpSheetsByEtApi = async (instance: any, verboseList: boolean) => {
      try {
        const etApp = getEtApp(instance);
        if (!etApp) {
          logSheet('dumpSheets', { ok: false, reason: I18N.components.getEt });
        }
        const wb =
          etApp?.ActiveWorkbook || etApp?.activeWorkbook || etApp?.Workbook;
        if (!wb && etApp) {
          logSheet('dumpSheets', {
            ok: false,
            reason: I18N.components.workbookAc,
            etAppKeys:
              etApp && typeof etApp === 'object'
                ? Object.keys(etApp as object).slice(0, 30)
                : [],
          });
        }
        const sheets =
          wb?.Worksheets || wb?.worksheets || wb?.Sheets || wb?.sheets;
        const countRaw =
          sheets?.Count ?? sheets?.count ?? sheets?.getCount?.() ?? 0;
        const count =
          typeof countRaw === 'number'
            ? countRaw
            : await Promise.resolve(countRaw);
        const safeCount =
          typeof count === 'number' && Number.isFinite(count) ? count : 0;
        const sheetList: SheetInfo[] = (
          await Promise.all(
            Array.from({ length: safeCount }, (_, idx) => idx + 1).map(
              async (i): Promise<SheetInfo | null> => {
                const sRaw =
                  sheets?.Item?.(i) ||
                  sheets?.item?.(i) ||
                  sheets?.getItem?.(i);
                const s =
                  typeof sRaw === 'object' && sRaw
                    ? await Promise.resolve(sRaw)
                    : sRaw;
                if (!s) return null;
                const nameRaw = s?.Name ?? s?.name;
                const idRaw = s?.Id ?? s?.id;
                const name =
                  typeof nameRaw === 'string'
                    ? nameRaw
                    : await Promise.resolve(nameRaw);
                const id =
                  typeof idRaw === 'string' || typeof idRaw === 'number'
                    ? idRaw
                    : await Promise.resolve(idRaw);
                return { index: i, name, id };
              },
            ),
          )
        ).filter((v): v is SheetInfo => v !== null);
        const currentSheetOptions = sheetList
          .map(item => {
            const id = normalizeSheetId(item.id);
            if (!id) return null;
            const name = `${item.name ?? ''}`.trim() || id;
            return { id, name };
          })
          .filter((v): v is SheetOption => !!v);
        setSheetOptions(prev => {
          if (
            prev.length === currentSheetOptions.length &&
            prev.every(
              (p, i) =>
                p.id === currentSheetOptions[i].id &&
                p.name === currentSheetOptions[i].name,
            )
          ) {
            return prev;
          }
          return currentSheetOptions;
        });
        if (verboseList || safeCount === 0) {
          logSheet(I18N.components.dumpS, {
            sheetCount: safeCount,
            verboseList,
            sheets:
              safeCount === 0
                ? []
                : sheetList.map(s => ({
                    itemIndex1Based: s.index,
                    name: s.name,
                    id: s.id,
                    idType:
                      s.id === undefined || s.id === null
                        ? 'empty'
                        : typeof s.id,
                  })),
          });
        }
        return { sheets, sheetList, sheetCount: safeCount };
      } catch (err) {
        logSheet('dumpSheets.error', {
          message: err instanceof Error ? err.message : String(err),
        });
        return { sheets: undefined, sheetList: [], sheetCount: 0 };
      }
    };

    /** ready() 后 ET 工作簿常延迟就绪，需轮询直至枚举到 sheet 再 sync */
    const waitForWorkbookSheets = async (instance: any) => {
      const maxAttempts = 40;
      const pollIntervalMs = 200;

      const attemptUntilReady = async (
        attempt: number,
      ): Promise<{
        sheets: any;
        sheetList: SheetInfo[];
        sheetCount: number;
      }> => {
        const dump = await dumpSheetsByEtApi(
          instance,
          attempt === 1 || attempt === maxAttempts,
        );
        if (dump.sheetCount > 0) {
          logSheet('waitForWorkbookSheets.ok', {
            attempt,
            sheetCount: dump.sheetCount,
          });
          return dump;
        }
        if (attempt >= maxAttempts) {
          logSheet('waitForWorkbookSheets.giveUp', {
            sheetCount: dump.sheetCount,
          });
          return dump;
        }
        await delayMs(pollIntervalMs);
        return attemptUntilReady(attempt + 1);
      };

      return attemptUntilReady(1);
    };

    const performSyncWpsSheetMapIfNeeded = async (
      sheetList: SheetInfo[],
      sheetCount: number,
      source: string,
    ) => {
      if (isReadOnly) {
        logSheet('syncWpsSheetMap.skip', {
          source,
          reason: I18N.components.readOnlyScenario,
        });
        return;
      }
      if (sheetCount <= 0) return;
      if (syncWpsMapSentRef.current || syncWpsMapSyncingRef.current) return;

      const resolvedAccountId = resolveAccountIdForSync(accountId);
      logSheet('syncWpsSheetMap.gate', {
        source,
        sheetCount,
        accountIdProp: accountId,
        resolvedAccountId,
        effectiveApiWpsSheetId,
        activateIdProp: effectiveWpsSheetId,
        alreadySent: syncWpsMapSentRef.current,
        syncing: syncWpsMapSyncingRef.current,
      });

      if (resolvedAccountId === undefined) {
        logSheet('syncWpsSheetMap.skip', {
          source,
          reason: I18N.components.accou,
        });
        return;
      }
      if (effectiveApiWpsSheetId !== undefined) {
        logSheet('syncWpsSheetMap.skip', {
          source,
          reason: I18N.components.originalInterfaceW,
          apiWpsSheetId: effectiveApiWpsSheetId,
          activateIdProp: effectiveWpsSheetId,
        });
        return;
      }

      const rows = sheetList
        .filter(
          s => s.id !== undefined && s.id !== null && `${s.id}`.trim() !== '',
        )
        .map(s => ({
          index: String(s.index),
          name: `${s.name ?? ''}`,
          id: `${s.id}`,
        }));

      if (rows.length === 0) {
        logSheet('syncWpsSheetMap.skipRows', {
          source,
          sheetCount,
          rawSheets: sheetList.map(s => ({
            index: s.index,
            id: s.id,
            name: s.name,
          })),
        });
        return;
      }

      syncWpsMapSyncingRef.current = true;
      try {
        logSheet('syncWpsSheetMap.request', {
          source,
          accountId: resolvedAccountId,
          sheetRows: rows.length,
        });
        await postAccountEmissionSyncWpsSheetMap({
          accountId: resolvedAccountId,
          sheetList: rows,
        });
        syncWpsMapSentRef.current = true;
        logSheet('syncWpsSheetMap.ok', {
          source,
          accountId: resolvedAccountId,
          sheetRows: rows.length,
        });
        await Promise.resolve(onRefreshAccount?.());
      } catch (e) {
        logSheet('syncWpsSheetMap.error', {
          source,
          message: e instanceof Error ? e.message : String(e),
        });
      } finally {
        syncWpsMapSyncingRef.current = false;
      }
    };

    const toValidSyncSheetRow = (
      sheet: SheetInfo,
    ): { index: string; name: string; id: string } | null => {
      if (sheet.id === undefined || sheet.id === null) return null;
      const id = `${sheet.id}`.trim();
      if (!id) return null;
      return {
        index: `${sheet.index}`,
        name: `${sheet.name ?? ''}`,
        id,
      };
    };

    const postSyncWpsSheetMapDeltaIfNeeded = async (
      type: SyncWpsSheetMapDeltaType,
      sheet: SheetInfo,
      source: string,
    ): Promise<boolean> => {
      if (isReadOnly) {
        logSheet('syncWpsSheetMapDelta.skip', {
          source,
          type,
          reason: I18N.components.readOnlyScenario,
        });
        return false;
      }
      const resolvedAccountId = resolveAccountIdForSync(accountId);
      if (resolvedAccountId === undefined) {
        logSheet('syncWpsSheetMapDelta.skip', {
          source,
          type,
          reason: I18N.components.accou,
        });
        return false;
      }
      const row = toValidSyncSheetRow(sheet);
      if (!row) {
        logSheet('syncWpsSheetMapDelta.skip', {
          source,
          type,
          reason: I18N.components.sheet,
          sheet,
        });
        return false;
      }
      try {
        if (type === 'add') {
          await delayMs(2000);
        }
        await postAccountEmissionSyncWpsSheetMapDelta({
          accountId: resolvedAccountId,
          type,
          sheet: row,
        });
        logSheet('syncWpsSheetMapDelta.ok', {
          source,
          accountId: resolvedAccountId,
          type,
          sheet: row,
        });
        return true;
      } catch (err) {
        logSheet('syncWpsSheetMapDelta.error', {
          source,
          type,
          sheet: row,
          message: err instanceof Error ? err.message : String(err),
        });
        return false;
      }
    };

    const syncWpsSheetMapDeltaOnDiff = async (
      sheetList: SheetInfo[],
      source: string,
    ) => {
      const validCurrentRows = sheetList
        .map(toValidSyncSheetRow)
        .filter((s): s is { index: string; name: string; id: string } => !!s);
      const currentMap: Record<string, SheetInfo> = {};
      validCurrentRows.forEach(row => {
        currentMap[row.id] = {
          id: row.id,
          index: Number(row.index),
          name: row.name,
        };
      });

      const prevMap = sheetDeltaBaselineRef.current;
      if (!prevMap) {
        sheetDeltaBaselineRef.current = currentMap;
        logSheet('syncWpsSheetMapDelta.baseline.init', {
          source,
          sheetCount: Object.keys(currentMap).length,
        });
        return;
      }
      if (sheetDeltaSyncingRef.current) return;

      const deleted: SheetInfo[] = [];
      const added: SheetInfo[] = [];
      const updated: SheetInfo[] = [];

      Object.keys(prevMap).forEach(id => {
        if (!currentMap[id]) deleted.push(prevMap[id]);
      });
      Object.keys(currentMap).forEach(id => {
        if (!prevMap[id]) {
          added.push(currentMap[id]);
          return;
        }
        const prev = prevMap[id];
        const next = currentMap[id];
        if (
          `${prev.index}` !== `${next.index}` ||
          `${prev.name ?? ''}` !== `${next.name ?? ''}`
        ) {
          updated.push(next);
        }
      });

      if (deleted.length === 0 && added.length === 0 && updated.length === 0) {
        return;
      }

      sheetDeltaSyncingRef.current = true;
      let allSuccess = true;
      try {
        if (deleted.length > 0) {
          const deleteResults = await Promise.all(
            deleted.map(sheet =>
              postSyncWpsSheetMapDeltaIfNeeded('delete', sheet, source),
            ),
          );
          if (!deleteResults.every(Boolean)) allSuccess = false;
        }
        if (added.length > 0) {
          const addResults = await Promise.all(
            added.map(sheet =>
              postSyncWpsSheetMapDeltaIfNeeded('add', sheet, source),
            ),
          );
          if (!addResults.every(Boolean)) allSuccess = false;
        }
        if (updated.length > 0) {
          const updateResults = await Promise.all(
            updated.map(sheet =>
              postSyncWpsSheetMapDeltaIfNeeded('update', sheet, source),
            ),
          );
          if (!updateResults.every(Boolean)) allSuccess = false;
        }
      } finally {
        sheetDeltaSyncingRef.current = false;
      }

      if (allSuccess) {
        sheetDeltaBaselineRef.current = currentMap;
      }
    };

    const activateSheetByEtApi = async (
      instance: any,
      opts: {
        wpsSheetId?: string | number | null;
        activeSheetIndex?: number | null;
      },
      ctx?: { attempt?: number; phase?: string },
    ): Promise<boolean> => {
      const { wpsSheetId: sid, activeSheetIndex: idx } = opts;
      const targetKey = buildSheetTargetKey({
        wpsSheetId: sid,
        activeSheetIndex: idx,
      });
      const normalizedSid = normalizeSheetId(sid);
      const normalizedIdx = normalizeFiniteIndex(idx);
      const hasWps = normalizedSid !== undefined;
      const hasIdx = normalizedIdx !== undefined;
      if (activatedTargetKeyRef.current === targetKey) {
        logSheet(I18N.components.activ9, {
          phase: ctx?.phase,
          attempt: ctx?.attempt,
          targetKey,
        });
        return false;
      }
      if (activatingTargetKeyRef.current === targetKey) {
        logSheet(I18N.components.activ8, {
          phase: ctx?.phase,
          attempt: ctx?.attempt,
          targetKey,
        });
        return false;
      }
      activatingTargetKeyRef.current = targetKey;
      logSheet(I18N.components.activ7, {
        phase: ctx?.phase,
        attempt: ctx?.attempt,
        hasWps,
        wpsSheetId: sid,
        hasIdx,
        activeSheetIndex: idx,
      });
      if (!hasWps && !hasIdx) {
        logSheet('activate.skip', {
          reason: I18N.components.noWpsS,
        });
        return false;
      }
      try {
        await instance?.ready?.();
        const verboseDump =
          ctx?.attempt == null ||
          ctx.attempt <= 1 ||
          ctx?.phase === 'instance.ready';
        const { sheets, sheetList, sheetCount } = await dumpSheetsByEtApi(
          instance,
          verboseDump,
        );
        if (!sheets || !sheetCount) {
          logSheet('activate.wait', {
            reason: I18N.components.works,
            hasSheetsCollection: !!sheets,
            sheetCount,
            phase: ctx?.phase,
            attempt: ctx?.attempt,
          });
          return false;
        }

        await performSyncWpsSheetMapIfNeeded(
          sheetList,
          sheetCount,
          `activate:${ctx?.phase ?? '-'}:#${ctx?.attempt ?? '-'}`,
        );

        const idxNum = normalizedIdx;

        let targetIndex: number | undefined;
        let resolvedBy:
          | 'wps_numeric_to_item_index'
          | 'wps_name_or_id_match'
          | 'fallback_activeSheetIndex'
          | undefined;
        if (hasWps) {
          const sheetIdStr = normalizedSid as string;
          const sheetIdNum =
            typeof sid === 'string' &&
            sid.trim() !== '' &&
            !Number.isNaN(Number(sid))
              ? Number(sid)
              : typeof sid === 'number'
              ? sid
              : undefined;

          if (sheetIdNum !== undefined && Number.isFinite(sheetIdNum)) {
            targetIndex = toOneBasedWorksheetIndex(sheetIdNum, sheetCount);
            if (targetIndex != null) {
              resolvedBy = 'wps_numeric_to_item_index';
            }
          }
          if (targetIndex == null) {
            const matched = sheetList.find(
              s =>
                `${s.name}`.trim() === sheetIdStr ||
                sheetIdEqualsCell(s.id, sid as string | number),
            );
            if (matched != null && matched.index != null) {
              targetIndex = matched.index;
              resolvedBy = 'wps_name_or_id_match';
            } else if (hasWps) {
              logSheet(I18N.components.activ6, {
                wpsSheetIdRaw: sid,
                wpsSheetIdString: sheetIdStr,
                triedNumericAsIndex:
                  sheetIdNum !== undefined
                    ? toOneBasedWorksheetIndex(sheetIdNum, sheetCount)
                    : undefined,
                sheetNamesAndIds: sheetList.map(s => ({
                  itemIndex1Based: s.index,
                  name: s.name,
                  id: s.id,
                })),
              });
            }
          }
        }

        if (targetIndex == null && hasIdx && idxNum !== undefined) {
          targetIndex = toOneBasedWorksheetIndex(idxNum, sheetCount);
          if (targetIndex != null) {
            resolvedBy = 'fallback_activeSheetIndex';
          }
        }

        if (targetIndex == null) {
          logSheet(I18N.components.activ5, {
            sheetCount,
            activeSheetIndexRaw: idx,
            activeSheetIndexParsed1Based:
              idxNum !== undefined
                ? toOneBasedWorksheetIndex(idxNum, sheetCount)
                : undefined,
            wpsSheetId: sid,
            phase: ctx?.phase,
            attempt: ctx?.attempt,
          });
          return false;
        }
        const targetRaw =
          sheets?.Item?.(targetIndex) ||
          sheets?.item?.(targetIndex) ||
          sheets?.getItem?.(targetIndex);
        const target = targetRaw ? await Promise.resolve(targetRaw) : undefined;
        if (!target) {
          logSheet(I18N.components.activ4, {
            targetIndex,
            resolvedBy,
            phase: ctx?.phase,
            attempt: ctx?.attempt,
          });
          return false;
        }

        const resolvedName = target?.Name ?? target?.name ?? '(unknown)';
        const resolvedId = target?.Id ?? target?.id;

        try {
          const activateFn = target?.Activate ?? target?.activate;
          if (typeof activateFn === 'function') {
            await Promise.resolve(activateFn.call(target));
          } else {
            logSheet('activate.warn', { noActivateMethod: true });
          }
          const selectFn = target?.Select ?? target?.select;
          if (typeof selectFn === 'function') {
            await Promise.resolve(selectFn.call(target));
          }
          logSheet('activate.success', {
            resolvedBy,
            targetItemIndex1Based: targetIndex,
            resolvedSheetName: resolvedName,
            resolvedSheetId: resolvedId,
            phase: ctx?.phase,
            attempt: ctx?.attempt,
          });
          activatedTargetKeyRef.current = targetKey;
          return true;
        } catch (err) {
          logSheet(I18N.components.activ3, {
            message: err instanceof Error ? err.message : String(err),
            targetIndex,
            resolvedBy,
            phase: ctx?.phase,
            attempt: ctx?.attempt,
          });
          return false;
        }
      } catch (err) {
        logSheet(I18N.components.activ2, {
          message: err instanceof Error ? err.message : String(err),
          phase: ctx?.phase,
          attempt: ctx?.attempt,
        });
        return false;
      } finally {
        if (activatingTargetKeyRef.current === targetKey) {
          activatingTargetKeyRef.current = null;
        }
      }
    };

    setRegisterLoading(true);
    try {
      const res = await fetch(`${registerApiPath}/wps/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ossUrl: file.url,
          fileName: file.name,
          userId: `${userInfo?.userId ?? ''}`,
          userName: `${userInfo?.username ?? userInfo?.userName ?? ''}`,
          filePermission: { update: isReadOnly ? 0 : 1 },
        }),
      });

      const data: { fileId: string; wpsUrl: string; token: string } =
        await res.json();

      if (!res.ok) {
        throw new Error(
          (data as unknown as { message: string }).message ||
            I18N.subModules.registrationFailed,
        );
      }

      logSheet('wps.register.ok', {
        fileId: data.fileId,
        officeType: getOfficeType(file.url),
      });

      destroyWps();

      const officeType = getOfficeType(file.url);
      const instance = WebOfficeSDK.init({
        appId,
        officeType,
        fileId: data.fileId,
        mount: mountRef.current,
        token: data.token,
        readOnly: isReadOnly,
      });

      wpsInstanceRef.current = instance;
      const triggerSheetDeltaCheck = (source: string) => {
        const inst = wpsInstanceRef.current;
        if (!inst) return;
        dumpSheetsByEtApi(inst, false)
          .then(dump =>
            syncWpsSheetMapDeltaOnDiff(dump.sheetList, `event:${source}`),
          )
          .catch(() => {
            /* delta check best-effort */
          });
      };

      instance.ApiEvent?.AddApiEventListener?.('DocumentSaveStatus', d => {
        if (d?.status === 7) debounceSave();
        triggerSheetDeltaCheck(`DocumentSaveStatus:${d?.status ?? 'unknown'}`);
      });
      [
        'WorkbookNewSheet',
        'WorkbookSheetAdd',
        'WorkbookBeforeSheetDelete',
        'WorkbookAfterSheetDelete',
        'WorkbookSheetDelete',
      ].forEach(eventName => {
        try {
          instance.ApiEvent?.AddApiEventListener?.(eventName, () => {
            triggerSheetDeltaCheck(eventName);
          });
        } catch {
          /* ignore unsupported event name */
        }
      });

      const triggerCurrentTargetActivation = (ctx: {
        phase: string;
        attempt?: number;
      }) => {
        const currentInstance = wpsInstanceRef.current;
        if (!currentInstance) return;
        const target = sheetTargetRef.current;
        if (!hasSheetTarget(target)) return;
        activateSheetByEtApi(
          currentInstance,
          {
            wpsSheetId: target.wpsSheetId,
            activeSheetIndex: target.activeSheetIndex,
          },
          ctx,
        ).catch(() => {
          /* activate best-effort */
        });
      };

      const startLateSyncPollIfNeeded = (initialSheetCount: number) => {
        if (
          initialSheetCount !== 0 ||
          resolveAccountIdForSync(accountId) === undefined ||
          effectiveApiWpsSheetId !== undefined
        ) {
          return;
        }
        logSheet('syncWpsSheetMap.latePoll.start', {
          note: I18N.components.firstRoundEnumerationS,
        });
        const runLatePoll = async (i: number): Promise<void> => {
          if (!open || !wpsInstanceRef.current || syncWpsMapSentRef.current)
            return;
          if (i >= 60) {
            logSheet('syncWpsSheetMap.latePoll.giveUp', {});
            return;
          }
          await delayMs(450);
          const inst = wpsInstanceRef.current;
          if (!inst) return;
          const dump = await dumpSheetsByEtApi(inst, i === 0 || i === 59);
          await performSyncWpsSheetMapIfNeeded(
            dump.sheetList,
            dump.sheetCount,
            `latePoll:${i + 1}`,
          );
          if (syncWpsMapSentRef.current) return;
          await runLatePoll(i + 1);
        };
        runLatePoll(0).catch(() => {
          /* late poll best-effort */
        });
      };

      const startActivateRetryInterval = () => {
        if (!hasSheetTarget(sheetTargetRef.current)) return;
        let tryCount = 0;
        const maxTry = 40;
        const timer = window.setInterval(() => {
          tryCount += 1;
          if (!open || !wpsInstanceRef.current) {
            window.clearInterval(timer);
            return;
          }
          triggerCurrentTargetActivation({
            attempt: tryCount,
            phase: 'interval',
          });
          if (tryCount >= maxTry) {
            window.clearInterval(timer);
            const target = sheetTargetRef.current;
            logSheet(I18N.components.activ, {
              maxTry,
              wpsSheetId: target.wpsSheetId,
              activeSheetIndex: target.activeSheetIndex,
            });
          }
        }, 250);
      };

      try {
        // 流程：WPS 就绪 → 枚举 sheet；若未绑定 wpsSheetId 则在抽屉内调 syncWpsSheetMap；
        // 绑定成功后通过 onRefreshAccount 通知外层重新获取核算详情并重绘画布。
        await instance?.ready?.();

        const initialDump = await waitForWorkbookSheets(instance);

        await performSyncWpsSheetMapIfNeeded(
          initialDump.sheetList,
          initialDump.sheetCount,
          'waitForWorkbookSheets',
        );
        await syncWpsSheetMapDeltaOnDiff(
          initialDump.sheetList,
          'waitForWorkbookSheets',
        );

        startLateSyncPollIfNeeded(initialDump.sheetCount);
        triggerCurrentTargetActivation({ phase: 'instance.ready' });
      } catch (err) {
        logSheet('instance.ready.error', {
          message: err instanceof Error ? err.message : String(err),
        });
      }

      startActivateRetryInterval();
    } catch (err) {
      logSheet('initWps.error', {
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const openLinkSheetDialog = () => {
    if (isReadOnly) return;
    if (!excelUrl) return;
    setSelectedSheetIds(
      parseSheetIds(effectiveApiWpsSheetId ?? effectiveWpsSheetId),
    );
    setLinkSheetVisible(true);
  };

  const submitLinkSheet = async () => {
    if (isReadOnly) return;
    const id = Number(emissionId);
    if (!Number.isFinite(id) || id <= 0) {
      Toast('warn', I18N.components.emissionSourceInformation);
      return;
    }
    setLinking(true);
    try {
      await postAccountEmissionEditEmissionSheet({
        emissionId: Math.trunc(id),
        wpsSheetId: selectedSheetIds.join(','),
      });
      Toast('success', I18N.components.reuseSuccessful);
      setLinkSheetVisible(false);
      await Promise.resolve(onRefreshAccount?.());
    } catch (error) {
      Toast('error', I18N.components.reuseFailedPlease);
    } finally {
      setLinking(false);
    }
  };

  const titleNode = (
    <div className={styles.titleRow}>
      <Tooltip title={emissionName} placement='bottom'>
        <span className={styles.titleText}>{emissionName || '—'}</span>
      </Tooltip>
      {categoryName || stageName ? (
        <span className={styles.titleMeta}>
          {categoryName ? (
            <span className={styles.categoryTag}>{categoryName}</span>
          ) : null}
          {stageName ? (
            <span className={styles.stageTag}>{stageName}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );

  const canShowHeaderActions = !!excelUrl && !isReadOnly;

  const headerActions = (
    <div className={styles.headerActions}>
      <Button
        className={styles.linkBtn}
        icon={<LinkOutlined />}
        disabled={!excelUrl}
        onClick={openLinkSheetDialog}
      >
        {I18N.components.relatedShe}
      </Button>
      <Button
        type='primary'
        className={styles.aiBtn}
        icon={<AiParseIcon />}
        disabled={!excelUrl}
        onClick={handleAiParse}
      >
        {I18N.enterpriseCarbonAccount2.aiParsing}
      </Button>
    </div>
  );

  return (
    <>
      <CustomDrawer
        open={open}
        onClose={() => {
          destroyWps();
          onClose();
        }}
        width={800}
        destroyOnClose
        maskClosable={false}
        title={titleNode}
        headerExtra={canShowHeaderActions ? headerActions : null}
        styles={{
          body: {
            padding: '32px 40px 40px',
          },
        }}
        afterOpenChange={v => {
          if (!v) return;
          // 等待 Drawer 子节点与 ref 挂载后再初始化 WPS，避免 mount 为空
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              initWps().catch(() => {
                /* init best-effort */
              });
            });
          });
        }}
      >
        <div className={styles.body}>
          {!isReadOnly && aiBannerVisible ? (
            aiParseState === 'success' && aiParseResult ? (
              <div className={styles.aiBannerResult}>
                <div className={styles.aiBannerTitleRow}>
                  <div className={styles.aiBannerTitle}>
                    <RobotOutlined />
                    <span>{I18N.components.aiAnalysisResults}</span>
                  </div>
                  <Button
                    type='text'
                    icon={<CloseOutlined />}
                    onClick={() => setAiBannerVisible(false)}
                  />
                </div>
                <div className={styles.aiResultMain}>
                  <div className={styles.aiResultLine}>
                    <span className={styles.aiResultLabel}>
                      {I18N.components.activityValues}
                    </span>
                    <span className={styles.aiResultValue}>
                      {`${aiParseResult.finalValue ?? '-'}${
                        aiParseResult.finalValueUnit ?? ''
                      }`}
                    </span>
                  </div>
                  <div className={styles.aiResultLine}>
                    <span className={styles.aiResultLabel}>
                      {I18N.components.dataSource}
                    </span>
                    <span className={styles.aiResultValue}>
                      {aiParseResult.mergeReason || '-'}
                    </span>
                  </div>
                </div>
                {aiParseResult.logic?.length ? (
                  <div className={styles.aiRule}>
                    <ExclamationCircleOutlined />
                    <span>
                      {I18N.components.rulesDescription}
                      {aiParseResult.logic.join('；')}
                    </span>
                  </div>
                ) : null}
                <Button
                  className={styles.aiFillBtn}
                  loading={aiFillLoading}
                  onClick={handleAiFillData}
                >
                  {I18N.components.dataInput}
                </Button>
              </div>
            ) : (
              <div className={styles.aiBanner}>
                <div className={styles.aiBannerLeft}>
                  <RobotOutlined />
                  <span>{I18N.enterpriseCarbonAccount2.inAiParsing}</span>
                </div>
                <Button
                  type='text'
                  icon={<CloseOutlined />}
                  onClick={() => setAiBannerVisible(false)}
                />
              </div>
            )
          ) : null}

          {!excelUrl ? (
            <div className={styles.emptyWrap}>
              <Empty
                description={
                  I18N.carbonFootprint3
                    .noDetailedInformationAvailableAtTheMoment
                }
              />
            </div>
          ) : (
            <Spin spinning={registerLoading}>
              <div className={styles.sheetWrap} ref={mountRef} />
            </Spin>
          )}
        </div>
      </CustomDrawer>
      <Modal
        open={!isReadOnly && linkSheetVisible}
        title={I18N.components.relatedShe}
        width={720}
        destroyOnClose
        maskClosable={false}
        onCancel={() => setLinkSheetVisible(false)}
        onOk={submitLinkSheet}
        okText={I18N.components.confirmReuse}
        cancelText={I18N.carbonFootprint.cancel}
        okButtonProps={{
          loading: linking,
        }}
      >
        <div className={styles.linkModalTip}>
          <ExclamationCircleOutlined className={styles.linkModalTipIcon} />
          <span className={styles.linkModalTipText}>
            {I18N.components.pleaseChooseOne}
          </span>
        </div>
        <Table
          className={styles.linkSheetTable}
          rowKey='sheetId'
          pagination={false}
          dataSource={linkSheetRows}
          rowSelection={{
            selectedRowKeys: selectedSheetIds,
            onChange: keys => {
              setSelectedSheetIds((keys as string[]).map(v => `${v}`));
            },
          }}
          columns={[
            {
              title: I18N.components.summaryTableShe,
              dataIndex: 'sheetName',
              key: 'sheetName',
              width: 420,
            },
          ]}
          locale={{
            emptyText: I18N.components.noReusableAtTheMoment,
          }}
        />
      </Modal>
    </>
  );
};

export default EmissionDetailSheetDrawer;
