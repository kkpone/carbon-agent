/** 批量解析/建模流程 — 上传文件约束（与产品说明一致） */
export const BATCH_FILE_MAX_COUNT = 10;
export const BATCH_FILE_MAX_SIZE_MB = 10;
export const BATCH_FILE_ACCEPT = '.csv,.xls,.xlsx,.CSV,.XLS,.XLSX';

const BATCH_FILE_ALLOWED_EXTENSIONS = new Set(['csv', 'xls', 'xlsx']);

/** 是否为允许的 csv / excel 文件 */
export const isBatchUploadFileAllowed = (fileName?: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  return ext ? BATCH_FILE_ALLOWED_EXTENSIONS.has(ext) : false;
};

/** 将文件大小（字节）格式化为 KB / MB，批量解析/建模上传列表共用 */
export const formatBatchFileSizeText = (
  size?: string | number,
  sizeUnit?: string,
) => {
  if (size === undefined || size === null || size === '') {
    return '-';
  }

  let bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '-';
  }

  if (sizeUnit === 'KB') {
    bytes *= 1024;
  } else if (sizeUnit === 'MB') {
    bytes *= 1024 * 1024;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)}KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
};
