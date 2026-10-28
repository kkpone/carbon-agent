export const ENTERPRISE_CARBON_CARD_TYPES = {
  computation: 'enterprise_carbon_computation',
  report: 'enterprise_carbon_report',
} as const;

export const ENTERPRISE_CARBON_MODULE = 'enterprise';

export type EnterpriseCarbonBusinessKind = 'account' | 'report';

export type EnterpriseCarbonReportFile = {
  fileName?: string;
  message?: string;
  path?: string;
  reportFileRecordId?: number | string;
  status?: number | string;
  statusLabel?: string;
  versionType?: number | string;
  versionTypeLabel?: string;
};

export type EnterpriseCarbonReportTargetLike = {
  type?: string;
  year?: string;
};

export const isEnterpriseCarbonReportFileReady = (
  file?: EnterpriseCarbonReportFile,
) => Boolean(file?.path?.trim());

export const getReadyEnterpriseCarbonReportFiles = (
  files: EnterpriseCarbonReportFile[] = [],
) => files.filter(isEnterpriseCarbonReportFileReady);

const getEnterpriseCarbonReportFileIdentity = (
  file?: EnterpriseCarbonReportFile,
) => {
  const recordId = getEnterpriseBusinessScalar(file?.reportFileRecordId);

  if (recordId) {
    return `id:${recordId}`;
  }

  const path = file?.path?.trim();

  if (path) {
    return `path:${path}`;
  }

  return [file?.versionType, file?.fileName]
    .filter(value => value !== undefined && value !== null && value !== '')
    .join(':');
};

export const mergeEnterpriseCarbonReportFiles = (
  ...fileLists: (EnterpriseCarbonReportFile[] | undefined)[]
) => {
  const mergedFiles: EnterpriseCarbonReportFile[] = [];
  const fileIndexByIdentity = new Map<string, number>();

  fileLists.flat().forEach(file => {
    const identity = getEnterpriseCarbonReportFileIdentity(file);
    const existingIndex = identity
      ? fileIndexByIdentity.get(identity)
      : undefined;

    if (existingIndex === undefined) {
      if (identity) {
        fileIndexByIdentity.set(identity, mergedFiles.length);
      }

      mergedFiles.push(file);
      return;
    }

    mergedFiles[existingIndex] = {
      ...mergedFiles[existingIndex],
      ...file,
    };
  });

  return mergedFiles;
};

export const getEnterpriseBusinessScalar = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '';
};

export const getEnterpriseBusinessRecord = (
  value: unknown,
): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const getEnterpriseBusinessValue = (
  records: Record<string, unknown>[],
  keys: string[],
) =>
  records
    .flatMap(record =>
      keys.map(key => getEnterpriseBusinessScalar(record[key])),
    )
    .find(Boolean);

export const getEnterpriseCarbonBusinessKind = (
  records: Record<string, unknown>[],
): EnterpriseCarbonBusinessKind | undefined => {
  const cardType = getEnterpriseBusinessValue(records, [
    'cardType',
    'card_type',
  ]);
  const moduleName = getEnterpriseBusinessValue(records, [
    'module',
    'moduleName',
  ]);
  const bizType = getEnterpriseBusinessValue(records, ['bizType', 'biz_type']);
  const normalizedCardType = cardType?.toLowerCase();
  const normalizedModuleName = moduleName?.toLowerCase();
  const normalizedBizType = bizType?.toLowerCase();

  if (normalizedCardType === ENTERPRISE_CARBON_CARD_TYPES.computation) {
    return 'account';
  }

  if (normalizedCardType === ENTERPRISE_CARBON_CARD_TYPES.report) {
    return 'report';
  }

  if (
    normalizedModuleName === ENTERPRISE_CARBON_MODULE &&
    normalizedBizType === 'account'
  ) {
    return 'account';
  }

  if (
    normalizedModuleName === ENTERPRISE_CARBON_MODULE &&
    normalizedBizType === 'report'
  ) {
    return 'report';
  }

  return undefined;
};

export const getEnterpriseCarbonBusinessId = (
  records: Record<string, unknown>[],
) =>
  getEnterpriseBusinessValue(records, [
    'bizId',
    'biz_id',
    'reportId',
    'report_id',
    'id',
  ]);

export const getEnterpriseCarbonAccountingYear = (
  records: Record<string, unknown>[],
) => {
  const rawYear = getEnterpriseBusinessValue(records, [
    'year',
    'cYear',
    'c_year',
    'accountingYear',
    'accounting_year',
    'computationYear',
    'computation_year',
    'calculatePeriod',
    'calculate_period',
    'bizId',
    'biz_id',
  ]);

  return rawYear?.match(/\d{4}/)?.[0] || rawYear;
};

export const getEnterpriseCarbonReportYear = (
  records: Record<string, unknown>[],
) => {
  const rawYear = getEnterpriseBusinessValue(records, [
    'year',
    'cYear',
    'c_year',
    'accountingYear',
    'accounting_year',
    'computationYear',
    'computation_year',
    'calculatePeriod',
    'calculate_period',
  ]);

  return rawYear?.match(/\d{4}/)?.[0] || rawYear;
};

export const getLastEnterpriseCarbonReportTargetsByYear = <
  Target extends EnterpriseCarbonReportTargetLike,
>(
  targets: Target[],
) => {
  const lastTargetByYear = new Map<string, { index: number; target: Target }>();
  const targetsWithoutYear: { index: number; target: Target }[] = [];

  targets.forEach((target, index) => {
    if (target.type !== 'enterpriseCarbonReport') {
      return;
    }

    const year = target.year?.trim();

    if (!year) {
      targetsWithoutYear.push({ index, target });
      return;
    }

    lastTargetByYear.set(year, { index, target });
  });

  return [...targetsWithoutYear, ...lastTargetByYear.values()]
    .sort((left, right) => left.index - right.index)
    .map(({ target }) => target);
};

const getFileRecordsFromValue = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map(item => getEnterpriseBusinessRecord(item))
        .filter(record => Object.keys(record).length)
    : [];

export const getEnterpriseCarbonReportFiles = (
  records: Record<string, unknown>[],
): EnterpriseCarbonReportFile[] => {
  const files = records.flatMap(record => {
    const nestedData = getEnterpriseBusinessRecord(record.data);
    const nestedDetail = getEnterpriseBusinessRecord(record.detail);
    const fileRecords = [
      ...getFileRecordsFromValue(record.files),
      ...getFileRecordsFromValue(nestedData.files),
      ...getFileRecordsFromValue(nestedDetail.files),
    ];

    return fileRecords.map(file => ({
      fileName:
        getEnterpriseBusinessValue([file], ['fileName', 'file_name', 'name']) ||
        undefined,
      message:
        getEnterpriseBusinessValue([file], ['message', 'msg']) || undefined,
      path:
        getEnterpriseBusinessValue(
          [file],
          [
            'path',
            'url',
            'reportUrl',
            'report_url',
            'fileUrl',
            'file_url',
            'downloadUrl',
            'download_url',
          ],
        ) || undefined,
      reportFileRecordId:
        getEnterpriseBusinessValue(
          [file],
          ['reportFileRecordId', 'report_file_record_id', 'id'],
        ) || undefined,
      status:
        getEnterpriseBusinessValue([file], ['status', 'fileStatus']) ||
        undefined,
      statusLabel:
        getEnterpriseBusinessValue(
          [file],
          ['statusLabel', 'status_label', 'statusName'],
        ) || undefined,
      versionType:
        getEnterpriseBusinessValue([file], ['versionType', 'version_type']) ||
        undefined,
      versionTypeLabel:
        getEnterpriseBusinessValue(
          [file],
          ['versionTypeLabel', 'version_type_label', 'versionName'],
        ) || undefined,
    }));
  });
  const identities = new Set<string>();

  return files.filter(file => {
    const identity = [
      file.reportFileRecordId,
      file.versionType,
      file.path,
      file.fileName,
    ]
      .filter(Boolean)
      .join(':');

    if (!identity || identities.has(identity)) {
      return !identity;
    }

    identities.add(identity);

    return true;
  });
};

const getReportFileBusinessIdentity = (file: EnterpriseCarbonReportFile) => {
  const pathFileName = file.path?.split('/').pop()?.split(/[?#]/)[0];

  return (
    file.fileName ||
    (pathFileName ? decodeURIComponent(pathFileName) : '') ||
    getEnterpriseBusinessScalar(file.reportFileRecordId)
  );
};

export const getEnterpriseCarbonBusinessKey = (
  records: Record<string, unknown>[],
) => {
  const kind = getEnterpriseCarbonBusinessKind(records);

  if (!kind) {
    return '';
  }

  const cardType =
    kind === 'report'
      ? ENTERPRISE_CARBON_CARD_TYPES.report
      : ENTERPRISE_CARBON_CARD_TYPES.computation;
  const bizType = kind === 'report' ? 'report' : 'account';
  const businessIdentity =
    kind === 'account'
      ? getEnterpriseCarbonAccountingYear(records) ||
        getEnterpriseCarbonBusinessId(records)
      : getEnterpriseCarbonReportFiles(records)
          .map(getReportFileBusinessIdentity)
          .filter(Boolean)
          .sort()
          .join('|') ||
        getEnterpriseCarbonBusinessId(records) ||
        getEnterpriseBusinessValue(records, [
          'reportName',
          'report_name',
          'title',
          'name',
        ]);

  return [ENTERPRISE_CARBON_MODULE, cardType, bizType, businessIdentity]
    .filter(Boolean)
    .join(':');
};
