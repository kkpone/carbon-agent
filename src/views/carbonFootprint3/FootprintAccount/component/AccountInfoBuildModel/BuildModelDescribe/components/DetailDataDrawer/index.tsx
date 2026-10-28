import { DownloadOutlined } from '@ant-design/icons';
import { checkPermissions } from '@src/components/Permission/utils';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Button, Empty, Spin } from 'antd';
import saveAs from 'file-saver';
import { debounce } from 'lodash-es';
import { FC, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { CustomDrawer } from '@/components/CustomDrawer';
import { RootState } from '@/store';
import WebOfficeSDK from '@/views/subModules/CarbonFootprintModel/WPSFile/web-office-sdk-solution-v2.0.7.es';

import styles from './index.module.less';
import {
  postAccountEmissionSyncWpsSheetMap,
  postAccountEmissionSyncWpsSheetMapDelta,
  SyncWpsSheetMapDeltaType,
} from '../../service';

export type DetailDataDrawerProps = {
  open: boolean;
  onClose: () => void;
  excelUrl?: string;
  accountName?: string;
  accountId?: string | number;
  /** 打开抽屉后需要激活的 sheet（由排放源详情提供） */
  activeSheetId?: string | number;
};

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

function getOfficeType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
  if (['doc', 'docx', 'wps', 'wpt', 'dot', 'dotx', 'rtf'].includes(ext))
    return 'w';
  if (['xls', 'xlsx', 'et', 'csv', 'xlt', 'xlsm'].includes(ext)) return 's';
  if (['ppt', 'pptx', 'dps', 'dpt', 'pps', 'ppsx'].includes(ext)) return 'p';
  if (ext === 'pdf') return 'f';
  return 'w';
}

export const DetailDataDrawer: FC<DetailDataDrawerProps> = ({
  open,
  onClose,
  excelUrl,
  accountName,
  accountId,
  activeSheetId,
}) => {
  const hasAccountEditPermission = checkPermissions(
    true,
    'footprint3:account:edit',
  );
  const isReadOnly = !hasAccountEditPermission;
  const effectiveActiveSheetId =
    activeSheetId === undefined ||
    activeSheetId === null ||
    activeSheetId === ''
      ? 94496278298144
      : activeSheetId;
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
      ? I18N.template(I18N.carbonFootprint3.accou7, { val1: accountName })
      : I18N.carbonFootprint3.detailedDataX;
    return { name: safeName, url: excelUrl || '' };
  }, [accountName, excelUrl]);

  const mountRef = useRef<HTMLDivElement>(null);
  const wpsInstanceRef = useRef<{
    destroy?: () => void;
    save?: () => void;
    ApiEvent?: {
      AddApiEventListener?: (
        name: string,
        cb: (data: { status?: number }) => void,
      ) => void;
    };
  } | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const syncWpsMapSentRef = useRef(false);
  const syncWpsMapSyncingRef = useRef(false);
  const sheetDeltaBaselineRef = useRef<Record<
    string,
    { index: number; name?: string; id?: unknown }
  > | null>(null);
  const sheetDeltaSyncingRef = useRef(false);

  const debounceSave = useMemo(
    () =>
      debounce(() => {
        wpsInstanceRef.current?.save?.();
      }, 1000),
    [],
  );

  const destroyWps = () => {
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
    if (!excelUrl || !open) return;
    if (!mountRef.current) return;

    const getEtApp = (instance: any) =>
      instance?.ExcelApplication?.() ||
      instance?.EtApplication?.() ||
      instance?.Application;

    type SheetInfo = { index: number; name?: string; id?: unknown };
    type ValidSyncSheetRow = { index: string; name: string; id: string };

    const toValidSyncSheetRow = (
      sheet: SheetInfo,
    ): ValidSyncSheetRow | null => {
      if (sheet.id === undefined || sheet.id === null) return null;
      const id = `${sheet.id}`.trim();
      if (!id) return null;
      return {
        index: `${sheet.index}`,
        name: `${sheet.name ?? ''}`,
        id,
      };
    };

    const dumpSheetsByEtApi = async (instance: any) => {
      try {
        const etApp = getEtApp(instance);
        const wb =
          etApp?.ActiveWorkbook || etApp?.activeWorkbook || etApp?.Workbook;
        const sheets =
          wb?.Worksheets || wb?.worksheets || wb?.Sheets || wb?.sheets;
        // WPS SDK 这里的 Count/Name 等字段是“可 await 的代理属性”
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
        return { sheets, sheetList, sheetCount: safeCount };
      } catch (_e) {
        return { sheets: undefined, sheetList: [], sheetCount: 0 };
      }
    };

    const activateSheetByEtApi = async (
      instance: any,
      sheetId: string | number | undefined,
    ) => {
      if (sheetId === null || sheetId === undefined || sheetId === '') return;
      try {
        // 等待 advanced api ready，确保 ExcelApplication / EtApplication 已注入
        await instance?.ready?.();
        const { sheets, sheetList, sheetCount } = await dumpSheetsByEtApi(
          instance,
        );
        if (!sheets || !sheetCount) return;

        const sheetIdStr = `${sheetId}`;
        const sheetIdNum =
          typeof sheetId === 'string' &&
          sheetId.trim() !== '' &&
          !Number.isNaN(Number(sheetId))
            ? Number(sheetId)
            : typeof sheetId === 'number'
            ? sheetId
            : undefined;

        // 只在“确认是索引”或“能匹配到 name/id”时才取 Item，避免 Item(超大数字) 导致 SDK 代理抛错
        let targetIndex: number | undefined;

        // 1) 如果是数字且在范围内，按 index 处理（1-based）
        if (
          sheetIdNum !== undefined &&
          Number.isFinite(sheetIdNum) &&
          sheetIdNum >= 1 &&
          sheetIdNum <= sheetCount
        ) {
          targetIndex = sheetIdNum;
        } else {
          // 2) 否则按 name/id 匹配 sheetList
          const matched = sheetList.find(
            s => `${s.name}` === sheetIdStr || `${s.id}` === sheetIdStr,
          );
          if (matched?.index) {
            targetIndex = matched.index;
          }
        }

        if (!targetIndex) return;

        const targetRaw =
          sheets?.Item?.(targetIndex) ||
          sheets?.item?.(targetIndex) ||
          sheets?.getItem?.(targetIndex);
        const target = targetRaw ? await Promise.resolve(targetRaw) : undefined;
        if (!target) return;

        // SDK 的代理 getter 也可能抛错，所以这里单独包一层
        try {
          const activateFn = target?.Activate ?? target?.activate;
          if (typeof activateFn === 'function') {
            await Promise.resolve(activateFn.call(target));
          }
        } catch (_e) {
          // ignore
        }
        await dumpSheetsByEtApi(instance);
      } catch (_err) {
        await dumpSheetsByEtApi(instance);
      }
    };

    const performSyncWpsSheetMapIfNeeded = async (
      sheetList: SheetInfo[],
      sheetCount: number,
    ) => {
      if (isReadOnly || sheetCount <= 0) return;
      if (syncWpsMapSentRef.current || syncWpsMapSyncingRef.current) return;
      const resolvedAccountId = resolveAccountIdForSync(accountId);
      if (resolvedAccountId === undefined) return;

      const rows = sheetList
        .map(toValidSyncSheetRow)
        .filter((row): row is ValidSyncSheetRow => !!row);
      if (rows.length === 0) return;

      syncWpsMapSyncingRef.current = true;
      try {
        await postAccountEmissionSyncWpsSheetMap({
          accountId: resolvedAccountId,
          sheetList: rows,
        });
        syncWpsMapSentRef.current = true;
      } finally {
        syncWpsMapSyncingRef.current = false;
      }
    };

    const postSyncWpsSheetMapDeltaIfNeeded = async (
      type: SyncWpsSheetMapDeltaType,
      sheet: SheetInfo,
    ): Promise<boolean> => {
      if (isReadOnly) return false;
      const resolvedAccountId = resolveAccountIdForSync(accountId);
      if (resolvedAccountId === undefined) return false;
      const row = toValidSyncSheetRow(sheet);
      if (!row) return false;
      try {
        if (type === 'add') {
          await delayMs(800);
        }
        await postAccountEmissionSyncWpsSheetMapDelta({
          accountId: resolvedAccountId,
          type,
          sheet: row,
        });
        return true;
      } catch {
        return false;
      }
    };

    const syncWpsSheetMapDeltaOnDiff = async (sheetList: SheetInfo[]) => {
      const validCurrentRows = sheetList
        .map(toValidSyncSheetRow)
        .filter((s): s is ValidSyncSheetRow => !!s);
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
      try {
        await Promise.all(
          deleted.map(sheet =>
            postSyncWpsSheetMapDeltaIfNeeded('delete', sheet),
          ),
        );
        await Promise.all(
          added.map(sheet => postSyncWpsSheetMapDeltaIfNeeded('add', sheet)),
        );
        await Promise.all(
          updated.map(sheet =>
            postSyncWpsSheetMapDeltaIfNeeded('update', sheet),
          ),
        );
      } finally {
        sheetDeltaSyncingRef.current = false;
        const latestMap: Record<string, SheetInfo> = {};
        validCurrentRows.forEach(row => {
          latestMap[row.id] = {
            id: row.id,
            index: Number(row.index),
            name: row.name,
          };
        });
        sheetDeltaBaselineRef.current = latestMap;
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

      instance.ApiEvent?.AddApiEventListener?.('DocumentSaveStatus', d => {
        if (d?.status === 7) debounceSave();
        const inst = wpsInstanceRef.current;
        if (!inst) return;
        dumpSheetsByEtApi(inst)
          .then(dump => syncWpsSheetMapDeltaOnDiff(dump.sheetList))
          .catch(() => {
            /* best effort */
          });
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
            const inst = wpsInstanceRef.current;
            if (!inst) return;
            dumpSheetsByEtApi(inst)
              .then(dump => syncWpsSheetMapDeltaOnDiff(dump.sheetList))
              .catch(() => {
                /* best effort */
              });
          });
        } catch {
          /* ignore unsupported event name */
        }
      });

      wpsInstanceRef.current = instance;

      // 等待 SDK advanced api ready 后再 dump/激活（否则拿不到 Worksheets）
      try {
        instance
          ?.ready?.()
          ?.then(async () => {
            const readyDump = await dumpSheetsByEtApi(wpsInstanceRef.current);
            await performSyncWpsSheetMapIfNeeded(
              readyDump.sheetList,
              readyDump.sheetCount,
            );
            await syncWpsSheetMapDeltaOnDiff(readyDump.sheetList);
            if (activeSheetId !== undefined && activeSheetId !== null) {
              activateSheetByEtApi(wpsInstanceRef.current, activeSheetId);
            }
          })
          .catch(() => {
            /* ignore */
          });
      } catch {
        /* ignore */
      }

      // 打开后切换到指定 sheet（WPS 初始化可能异步，做短暂重试）
      if (
        effectiveActiveSheetId !== undefined &&
        effectiveActiveSheetId !== null
      ) {
        let tryCount = 0;
        const maxTry = 12;
        const timer = window.setInterval(() => {
          tryCount += 1;
          if (!open || !wpsInstanceRef.current) {
            window.clearInterval(timer);
            return;
          }
          activateSheetByEtApi(wpsInstanceRef.current, effectiveActiveSheetId);
          if (tryCount >= maxTry) {
            window.clearInterval(timer);
          }
        }, 250);
      } else {
        // 没有指定 sheetId 时也尝试 dump 一次当前 sheet（等 ready 后会再 dump 一次）
        dumpSheetsByEtApi(wpsInstanceRef.current);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <CustomDrawer
      open={open}
      onClose={() => {
        destroyWps();
        syncWpsMapSentRef.current = false;
        syncWpsMapSyncingRef.current = false;
        sheetDeltaBaselineRef.current = null;
        sheetDeltaSyncingRef.current = false;
        onClose();
      }}
      width={800}
      title={I18N.enterpriseCarbonAccount2.detailData}
      headerExtra={
        excelUrl ? (
          <Button
            className={styles.downloadBtn}
            icon={<DownloadOutlined />}
            onClick={() => saveAs(excelUrl, file.name)}
          >
            {I18N.carbonFootprint3.downloadExc}
          </Button>
        ) : null
      }
      destroyOnClose
      maskClosable={false}
      styles={{
        body: {
          padding: '32px 40px 40px',
        },
      }}
      afterOpenChange={v => {
        if (v) initWps();
      }}
    >
      {!excelUrl ? (
        <div className={styles.emptyWrap}>
          <Empty
            description={
              I18N.carbonFootprint3.noDetailedInformationAvailableAtTheMoment
            }
          />
        </div>
      ) : (
        <Spin spinning={registerLoading}>
          <div className={styles.sheetWrap} ref={mountRef} />
        </Spin>
      )}
    </CustomDrawer>
  );
};

export default DetailDataDrawer;
