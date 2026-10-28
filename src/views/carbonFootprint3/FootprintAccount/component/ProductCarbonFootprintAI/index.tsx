/**
 * @description: 产品碳足迹 AI 入口（与 carbonstop_website ProductCarbonFootprintAI 对齐：双上传、scope/factor、getWebInfoData 入参）
 */
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import I18N, { serviceLangMap } from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { Cascader, message, Tooltip } from 'antd';
import type { ChangeEvent } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { IconAlibabaNew } from '@/components/iconfont';
import {
  QUICK_ACCOUNT_LIFE_CYCLE,
  QUICK_ACCOUNT_LIFE_CYCLE_LABEL,
} from '@/views/carbonFootprint3/constant';
import { getPublishedGlobalFactorPreferencePlans } from '../GlobalFactorPreference/service';

import BrandPillSelect from './BrandPillSelect';
import type { BrandPillKey } from './BrandPillSelect';
import style from './index.module.less';
import {
  FootprintAccountLifeCycle,
  getAiDatalist,
  getFactorScopes,
  postAiModelAndAll,
  postChatGetWebInfoData,
  uploadAiChatFile,
} from './service';
import { ACCOUNT_SELECT_LIFE_CYCLE_LABEL } from '../../constant';

const MAX_FILES = 1;
// const MAX_REFER_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const IMAGE_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

// const REFER_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.ppt,.pptx,.zip';

// const isImageLikeFile = (file: File): boolean => {
//   if (file.type.startsWith('image/')) return true;
//   const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
//   return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'heic'].includes(
//     ext,
//   );
// };

function clearFileInput(el: HTMLInputElement) {
  // 重置 input 以便可重复选择同一文件
  // eslint-disable-next-line no-param-reassign -- DOM 重置 file input
  el.value = '';
}

const { HALF, FULL, CUSTOM } = FootprintAccountLifeCycle;

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  uploadUrl?: string;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
}

interface ParsedAiContent {
  product_name: string;
  product_description: string;
  unit: string;
  amount: string;
}

const parseAiContent = (aiContent: string): ParsedAiContent | null => {
  try {
    let jsonString = aiContent.trim();
    jsonString = jsonString.replace(/^```json\s*/i, '');
    jsonString = jsonString.replace(/^```\s*/, '');
    jsonString = jsonString.replace(/\s*```$/g, '');
    const parsed = JSON.parse(jsonString.trim()) as ParsedAiContent;
    return parsed;
  } catch {
    return null;
  }
};

type AccountDetailUrlExtras = {
  scope?: number;
  scopeValue?: string;
  factorPrefId?: number;
  factorScope?: number;
};

function buildAccountDetailUrl(
  accountId: number,
  productId: number,
  userContent: string,
  referId?: string | number | null,
  extras?: AccountDetailUrlExtras,
): string {
  const path = RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail;
  const params = new URLSearchParams({
    productId: String(productId),
    accountId: String(accountId),
    status: '1',
    stepValue: '1',
    listOrGraph: '1',
    source: 'PRODUCT_FOOTPRINT_LIST_AI',
    useContent: '1',
  });
  params.set('userContent', userContent);
  if (referId != null) {
    params.set('referId', String(referId));
  }
  if (extras?.scope != null) {
    params.set('scope', String(extras.scope));
  }
  if (extras?.scopeValue != null && extras.scopeValue !== '') {
    params.set('scopeValue', extras.scopeValue);
  }
  if (extras?.factorPrefId != null) {
    params.set('factorPrefId', String(extras.factorPrefId));
  }
  if (extras?.factorScope != null) {
    params.set('factorScope', String(extras.factorScope));
  }
  return `${window.location.origin}${path}?${params.toString()}`;
}

export default function ProductCarbonFootprintAI() {
  const { locale } = useContext(LocaleContext);
  const lang = serviceLangMap[locale] ?? 'zh';
  const [loading, setLoading] = useState(false);
  const [userContent, setUserContent] = useState('');
  const [showGif, setShowGif] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  const [scope, setScope] = useState<{ value: number; label: string }[][]>([
    [{ value: FULL, label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[FULL] }],
  ]);
  const [productUploadedFiles, setProductUploadedFiles] = useState<
    UploadedFile[]
  >([]);
  const [referUploadedFiles, setReferUploadedFiles] = useState<UploadedFile[]>(
    [],
  );
  const [factorPrefId, setFactorPrefId] = useState('');
  const [factorPreferenceOptions, setFactorPreferenceOptions] = useState<
    { value: string; label: string }[]
  >([]);
  /** factorPref/list 有数据时走新方案；否则走 account/factorScopes 旧枚举 */
  const [useFactorPrefPlans, setUseFactorPrefPlans] = useState(false);
  const [factorScope, setFactorScope] = useState('');
  const [factorScopeOptions, setFactorScopeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [factorPreferenceLoading, setFactorPreferenceLoading] = useState(true);
  const [openPill, setOpenPill] = useState<BrandPillKey | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    message.config({
      top: 90,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFactorPreferenceLoading(true);
      try {
        const plans = await getPublishedGlobalFactorPreferencePlans();
        if (cancelled) return;

        if (plans.length > 0) {
          setUseFactorPrefPlans(true);
          setFactorPreferenceOptions([
            { value: '0', label: I18N.carbonFootprint3.whole },
            ...plans.map(plan => ({
              value: String(plan.id),
              label: plan.name,
            })),
          ]);
          const defaultPlanId = plans.find(plan => plan.isDefault)?.id;
          setFactorPrefId(defaultPlanId ? String(defaultPlanId) : '0');
          setFactorScope('');
          setFactorScopeOptions([]);
        } else {
          setUseFactorPrefPlans(false);
          setFactorPreferenceOptions([]);
          setFactorPrefId('');

          const response = await getFactorScopes({ lang });
          if (cancelled) return;

          if (response.code === 200 && Array.isArray(response.data)) {
            setFactorScopeOptions(response.data);
          } else {
            setFactorScopeOptions([]);
          }
        }
      } catch {
        if (!cancelled) {
          setUseFactorPrefPlans(false);
          setFactorPreferenceOptions([]);
          setFactorScopeOptions([]);
        }
      } finally {
        if (!cancelled) setFactorPreferenceLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    if (useFactorPrefPlans) {
      if (!factorPrefId) return;
      if (!factorPreferenceOptions.some(o => o.value === factorPrefId)) {
        setFactorPrefId('');
      }
      return;
    }
    if (!factorScope) return;
    if (!factorScopeOptions.some(o => o.value === factorScope)) {
      setFactorScope('');
    }
  }, [
    factorPrefId,
    factorPreferenceOptions,
    factorScope,
    factorScopeOptions,
    useFactorPrefPlans,
  ]);

  const onScopeChange = (val: { value: number; label: string }[][]) => {
    const lastSelectedNode = val[val.length - 1];

    if (scope.length === 0 || !lastSelectedNode) {
      setScope(val);
      return;
    }

    // HALF / FULL 单选：只保留最后一次选择
    if (lastSelectedNode.length === 1) {
      setScope([lastSelectedNode]);
      return;
    }

    // CUSTOM 子项：允许多选子项，只保留长度为 2 的路径
    if (lastSelectedNode.length === 2) {
      setScope(val.filter(item => item.length === 2));
    }
  };

  useEffect(() => {
    const fetchQuickSuggestions = async () => {
      try {
        const response = await getAiDatalist(lang);
        if (response.data?.code === 200 && response.data?.data) {
          const suggestions = response.data.data.map(item =>
            lang === 'en' ? item.questionEn : item.question,
          );
          setQuickSuggestions(suggestions);
        }
      } catch {
        setQuickSuggestions([
          I18N.productCarbonFootprintAI.quickSuggestions.suggestion1,
          I18N.productCarbonFootprintAI.quickSuggestions.suggestion2,
          I18N.productCarbonFootprintAI.quickSuggestions.suggestion3,
        ]);
      }
    };

    fetchQuickSuggestions();
  }, [lang]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handlePageReady = () => {
      setShowGif(true);
      timer = setTimeout(() => {
        setShowGif(false);
      }, 1000);
    };

    if (document.readyState === 'complete') {
      handlePageReady();
    } else {
      window.addEventListener('load', handlePageReady);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('load', handlePageReady);
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return '/images/icon-csv.png';
      case 'xlsx':
      case 'xls':
        return '/images/icon-excel.png';
      case 'pdf':
        return '/images/icon-pdf.png';
      case 'png':
        return '/images/icon-png.png';
      case 'jpg':
      case 'jpeg':
        return '/images/icon-jpg.png';
      case 'doc':
      case 'docx':
        return '/images/icon-word.png';
      default:
        return '/images/file-icon.svg';
    }
  };

  const handleRemoveProductFile = (fileId: string) => {
    setProductUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleRemoveReferFile = (fileId: string) => {
    setReferUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDownloadFile = (file: UploadedFile) => {
    if (!file.uploadUrl) return;
    const link = document.createElement('a');
    link.href = file.uploadUrl;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProductFileUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { files } = event.target;
    if (!files) return;

    const fileArray = Array.from(files);
    const currentFileCount = productUploadedFiles.length;
    const remainingSlots = MAX_FILES - currentFileCount;

    if (fileArray.length > remainingSlots) {
      message.warning(
        I18N.template(I18N.productCarbonFootprintAI.maxFilesExceeded, {
          val1: String(MAX_FILES),
          val2: String(currentFileCount),
          val3: String(remainingSlots),
        }),
      );
      clearFileInput(event.currentTarget);
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: { name: string; reason: string }[] = [];

    fileArray.forEach(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isImageFile =
        file.type.startsWith('image/') ||
        (!!fileExtension && IMAGE_FILE_EXTENSIONS.includes(fileExtension));

      if (!isImageFile) {
        invalidFiles.push({
          name: file.name,
          reason: I18N.productCarbonFootprintAI.imageOnlySupported,
        });
      } else if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push({
          name: file.name,
          reason: I18N.productCarbonFootprintAI.fileSizeExceeded,
        });
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ name, reason }) => {
        message.error(`${name}: ${reason}`);
      });
    }

    if (validFiles.length === 0) {
      clearFileInput(event.currentTarget);
      return;
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      uploadStatus: 'pending' as const,
    }));

    setProductUploadedFiles(prev => [...prev, ...newFiles]);
    clearFileInput(event.currentTarget);

    Promise.all(
      newFiles.map(async newFile => {
        try {
          setProductUploadedFiles(prev =>
            prev.map(f =>
              f.id === newFile.id
                ? { ...f, uploadStatus: 'uploading' as const }
                : f,
            ),
          );
          const uploadUrl = await uploadAiChatFile(newFile.file);
          setProductUploadedFiles(prev =>
            prev.map(f =>
              f.id === newFile.id
                ? { ...f, uploadStatus: 'success' as const, uploadUrl }
                : f,
            ),
          );
        } catch (err: unknown) {
          const e = err as { message?: string; data?: { msg?: string } };
          setProductUploadedFiles(prev =>
            prev.map(f =>
              f.id === newFile.id
                ? { ...f, uploadStatus: 'error' as const }
                : f,
            ),
          );
          message.error(
            I18N.template(I18N.productCarbonFootprintAI.uploadFailedWithName, {
              val1: newFile.name,
              val2:
                e?.data?.msg ||
                e?.message ||
                I18N.productCarbonFootprintAI.uploadFailed,
            }),
          );
        }
      }),
    );
  };

  // const handleReferFileUpload = async (
  //   event: ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const { files } = event.target;
  //   if (!files) return;

  //   const fileArray = Array.from(files);
  //   const currentFileCount = referUploadedFiles.length;
  //   const remainingSlots = MAX_REFER_FILES - currentFileCount;

  //   if (fileArray.length > remainingSlots) {
  //     message.warning(
  //       I18N.template(I18N.productCarbonFootprintAI.maxFilesExceeded, {
  //         val1: String(MAX_REFER_FILES),
  //         val2: String(currentFileCount),
  //         val3: String(remainingSlots),
  //       }),
  //     );
  //     clearFileInput(event.currentTarget);
  //     return;
  //   }

  //   const validFiles: File[] = [];
  //   const invalidFiles: { name: string; reason: string }[] = [];

  //   fileArray.forEach(file => {
  //     if (isImageLikeFile(file)) {
  //       invalidFiles.push({
  //         name: file.name,
  //         reason: I18N.productCarbonFootprintAI.attachmentNoImage,
  //       });
  //     } else if (file.size > MAX_FILE_SIZE) {
  //       invalidFiles.push({
  //         name: file.name,
  //         reason: I18N.productCarbonFootprintAI.fileSizeExceeded,
  //       });
  //     } else {
  //       validFiles.push(file);
  //     }
  //   });

  //   if (invalidFiles.length > 0) {
  //     invalidFiles.forEach(({ name, reason }) => {
  //       message.error(`${name}: ${reason}`);
  //     });
  //   }

  //   if (validFiles.length === 0) {
  //     clearFileInput(event.currentTarget);
  //     return;
  //   }

  //   const newFiles: UploadedFile[] = validFiles.map(file => ({
  //     id: `refer-${Date.now()}-${Math.random()}`,
  //     file,
  //     name: file.name,
  //     size: file.size,
  //     uploadStatus: 'pending' as const,
  //   }));

  //   setReferUploadedFiles(prev => [...prev, ...newFiles]);
  //   clearFileInput(event.currentTarget);

  //   Promise.all(
  //     newFiles.map(async newFile => {
  //       try {
  //         setReferUploadedFiles(prev =>
  //           prev.map(f =>
  //             f.id === newFile.id
  //               ? { ...f, uploadStatus: 'uploading' as const }
  //               : f,
  //           ),
  //         );
  //         const uploadUrl = await uploadAiChatFile(newFile.file);
  //         setReferUploadedFiles(prev =>
  //           prev.map(f =>
  //             f.id === newFile.id
  //               ? { ...f, uploadStatus: 'success' as const, uploadUrl }
  //               : f,
  //           ),
  //         );
  //       } catch (err: unknown) {
  //         const e = err as { message?: string; data?: { msg?: string } };
  //         setReferUploadedFiles(prev =>
  //           prev.map(f =>
  //             f.id === newFile.id
  //               ? { ...f, uploadStatus: 'error' as const }
  //               : f,
  //           ),
  //         );
  //         message.error(
  //           I18N.template(I18N.productCarbonFootprintAI.uploadFailedWithName, {
  //             val1: newFile.name,
  //             val2:
  //               e?.data?.msg ||
  //               e?.message ||
  //               I18N.productCarbonFootprintAI.uploadFailed,
  //           }),
  //         );
  //       }
  //     }),
  //   );
  // };

  const handleClick = async () => {
    const hasUploading =
      productUploadedFiles.some(
        f => f.uploadStatus === 'uploading' || f.uploadStatus === 'pending',
      ) ||
      referUploadedFiles.some(
        f => f.uploadStatus === 'uploading' || f.uploadStatus === 'pending',
      );
    if (hasUploading) {
      message.warning(I18N.productCarbonFootprintAI.waitForUploadComplete);
      return;
    }
    if (
      productUploadedFiles.some(f => f.uploadStatus === 'error') ||
      referUploadedFiles.some(f => f.uploadStatus === 'error')
    ) {
      message.warning(I18N.productCarbonFootprintAI.removeFailedFilesRetry);
      return;
    }

    const successProduct = productUploadedFiles.filter(
      f => f.uploadStatus === 'success' && f.uploadUrl,
    );
    const fileList = successProduct.map(f => ({
      name: f.name,
      url: f.uploadUrl!,
    }));

    const successRefer = referUploadedFiles.filter(
      f => f.uploadStatus === 'success' && f.uploadUrl,
    );
    const referList = successRefer.map(f => ({
      name: f.name,
      url: f.uploadUrl!,
    }));

    if (
      !userContent.trim() &&
      fileList.length === 0 &&
      referList.length === 0
    ) {
      return;
    }
    if (!userContent.trim() && fileList.length === 0) {
      message.warning(I18N.productCarbonFootprintAI.placeholder);
      return;
    }

    setLoading(true);
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;
      const content = userContent.trim();
      const selectedScope = scope?.[0]?.[0]?.value ?? FULL;
      let scopeValue: string | undefined;

      if (selectedScope === CUSTOM) {
        // 与 AddAccount 一致：多选 children -> 取第二段 value 拼接；仅选了 CUSTOM（无 children）则传全量
        if (scope.length > 1) {
          scopeValue = scope.map(item => item[1].value).join(',');
        } else {
          scopeValue = Object.values(QUICK_ACCOUNT_LIFE_CYCLE).join(',');
        }
      }

      const factorPreferenceParams = useFactorPrefPlans
        ? factorPrefId
          ? { factorPrefId: Number(factorPrefId) }
          : {}
        : factorScope
        ? { factorScope: Number(factorScope) }
        : {};

      const parseRes = await postChatGetWebInfoData({
        userKeys: fingerprint,
        userContent: content,
        scope: Number(selectedScope),
        ...(selectedScope === CUSTOM ? { scopeValue } : {}),
        ...factorPreferenceParams,
        ...(fileList.length > 0 ? { fileList } : {}),
        ...(referList.length > 0 ? { referList } : {}),
        lang,
      });

      if (parseRes.data?.code !== 200) {
        message.error(
          parseRes.data?.msg || I18N.enterpriseCarbonAccount2.analysisFailed,
        );
        return;
      }

      const parsedData = parseAiContent(parseRes.data.data?.aiContent || '');
      const referId = parseRes.data.data?.referId;

      const response = await postAiModelAndAll({
        userKeys: fingerprint,
        userContent: content,
        productName: parsedData?.product_name || '',
        productDesc: parsedData?.product_description || '',
        accountUnitName: parsedData?.unit || '',
        amount: parsedData?.amount || '',
        scope: Number(selectedScope),
        ...(selectedScope === CUSTOM ? { scopeValue } : {}),
        ...factorPreferenceParams,
      });

      if (response.data?.code === 200 && response.data?.data) {
        const { accountId, productId } = response.data.data;
        const url = buildAccountDetailUrl(
          accountId,
          productId,
          content,
          referId,
          {
            scope: Number(selectedScope),
            ...(selectedScope === CUSTOM ? { scopeValue } : {}),
            ...factorPreferenceParams,
          },
        );
        window.open(url, '_blank');
      }
    } catch (error: unknown) {
      const err = error as { data?: { msg?: string } };
      message.error(err?.data?.msg || I18N.carbonFootprint3.requestFailed);
    } finally {
      setLoading(false);
    }
  };

  const isProductUploadDisabled = productUploadedFiles.length >= MAX_FILES;
  // const isReferUploadDisabled = referUploadedFiles.length >= MAX_REFER_FILES;

  const handleQuickSuggestion = (suggestion: string) => {
    setUserContent(suggestion);
  };

  const fileStatusSubText = (file: UploadedFile) => {
    if (file.uploadStatus === 'uploading') {
      return I18N.productCarbonFootprintAI.uploading;
    }
    if (file.uploadStatus === 'error') {
      return I18N.productCarbonFootprintAI.uploadFailed;
    }
    return formatFileSize(file.size);
  };

  const renderFileChip = (
    file: UploadedFile,
    onRemove: (id: string) => void,
  ) => (
    <div key={file.id} className={style.fileChip}>
      <div className={style.fileIconWrap}>
        <img
          src={getFileIcon(file.name)}
          alt={I18N.productCarbonFootprintAI.altFile}
          className={style.fileIcon}
        />
      </div>
      <div className={style.fileMeta}>
        <Tooltip title={file.name}>
          {file.uploadUrl ? (
            <button
              type='button'
              className={style.fileNameBtn}
              onClick={() => handleDownloadFile(file)}
            >
              {file.name}
            </button>
          ) : (
            <p className={style.fileNameText}>{file.name}</p>
          )}
        </Tooltip>
        <p className={style.fileSubText}>{fileStatusSubText(file)}</p>
      </div>
      <button
        type='button'
        className={style.fileRemoveBtn}
        aria-label={I18N.productCarbonFootprintAI.removeFile}
        onClick={() => onRemove(file.id)}
      >
        <svg
          className={style.fileRemoveIcon}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>
    </div>
  );

  return (
    <div className={style.wrap}>
      <div className={style.bgWrap}>
        {/* <img
          src="/images/bg.gif"
          alt=""
          className={style.bgImg}
        /> */}
      </div>

      <div className={style.content}>
        <div className={style.titleBlock}>
          <div className={style.aiIconWrap}>
            <img
              src={showGif ? '/images/CarbonAi.gif' : '/images/CarbonAi.png'}
              alt={I18N.enterpriseCarbonAccount2.aiAssistant}
              className={style.aiIcon}
            />
          </div>

          <div className={style.titleRow}>
            <div className={style.titleLine}>
              <h1 className={style.titleText}>
                {I18N.productCarbonFootprintAI.title}
              </h1>
              <div className={style.titleGradientWrap}>
                <h1 className={style.titleGradient}>
                  {I18N.productCarbonFootprintAI.aiAgent}
                </h1>
                <div className={style.titleReveal} />
              </div>
            </div>

            <p className={style.description}>
              {I18N.productCarbonFootprintAI.description}
            </p>
          </div>
        </div>

        <div className={style.inputBlock}>
          <div className={style.inputBox}>
            {(productUploadedFiles.length > 0 ||
              referUploadedFiles.length > 0) && (
              <div className={style.fileListRow}>
                <div ref={fileListRef} className={style.fileListScroll}>
                  {productUploadedFiles.map(file =>
                    renderFileChip(file, handleRemoveProductFile),
                  )}
                  {referUploadedFiles.map(file =>
                    renderFileChip(file, handleRemoveReferFile),
                  )}
                </div>
              </div>
            )}

            <div className={style.inputInner}>
              <div className={style.inputIconWrap}>
                <img
                  src='/images/product-input-icon.svg'
                  alt=''
                  className={style.inputIcon}
                />
              </div>
              <textarea
                ref={textareaRef}
                value={userContent}
                onChange={e => setUserContent(e.target.value)}
                onKeyDown={e => {
                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey &&
                    (userContent.trim() ||
                      productUploadedFiles.length > 0 ||
                      referUploadedFiles.length > 0)
                  ) {
                    e.preventDefault();
                    handleClick();
                  }
                }}
                maxLength={500}
                placeholder={I18N.productCarbonFootprintAI.placeholder}
                rows={3}
                className={style.textarea}
                disabled={loading}
              />
            </div>

            <div className={style.actionRow}>
              <div className={style.actionRowLeft}>
                <Cascader
                  value={scope.map(item => item.map(i => i.value))}
                  maxTagCount='responsive'
                  multiple
                  variant='borderless'
                  options={[
                    {
                      value: HALF,
                      label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[HALF],
                    },
                    {
                      value: FULL,
                      label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[FULL],
                    },
                    {
                      value: CUSTOM,
                      label: ACCOUNT_SELECT_LIFE_CYCLE_LABEL[CUSTOM],
                      children: Object.values(QUICK_ACCOUNT_LIFE_CYCLE).map(
                        value => ({
                          value,
                          label: QUICK_ACCOUNT_LIFE_CYCLE_LABEL()[value],
                        }),
                      ),
                    },
                  ]}
                  onChange={(_, opt) => {
                    onScopeChange(
                      opt as unknown as { value: number; label: string }[][],
                    );
                  }}
                >
                  <div className={style.dropdownContent}>
                    {scope[0] ? (
                      <span>{scope[0][0].label}</span>
                    ) : (
                      <span className={style.placeholder}>
                        {I18N.carbonFootprint3.lifeCycle}
                      </span>
                    )}
                    <IconAlibabaNew
                      className={style.dropdownIcon}
                      type='icon-chevron-down'
                    />
                  </div>
                </Cascader>
                {useFactorPrefPlans ? (
                  <BrandPillSelect
                    pillKey='factor'
                    openPill={openPill}
                    setOpenPill={setOpenPill}
                    value={factorPrefId}
                    onChange={setFactorPrefId}
                    options={factorPreferenceOptions}
                    placeholder={
                      I18N.productCarbonFootprintAI.factorPreferencePlaceholder
                    }
                    disabled={loading || factorPreferenceLoading}
                    aria-label={
                      I18N.productCarbonFootprintAI.factorPreferencePlaceholder
                    }
                    triggerClassName={style.pillTriggerFactor}
                  />
                ) : factorScopeOptions.length > 0 ? (
                  <BrandPillSelect
                    pillKey='factor'
                    openPill={openPill}
                    setOpenPill={setOpenPill}
                    value={factorScope}
                    onChange={setFactorScope}
                    options={factorScopeOptions}
                    allowEmpty
                    placeholder={
                      I18N.productCarbonFootprintAI.factorPreferencePlaceholder
                    }
                    disabled={loading || factorPreferenceLoading}
                    aria-label={
                      I18N.productCarbonFootprintAI.factorPreferencePlaceholder
                    }
                    triggerClassName={style.pillTriggerFactor}
                  />
                ) : null}
              </div>
              <div className={style.actionRowRight}>
                <Tooltip
                  title={
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          lineHeight: '20px',
                        }}
                      >
                        {I18N.productCarbonFootprintAI.uploadImage}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          lineHeight: '20px',
                          color: 'rgba(255,255,255,0.7)',
                        }}
                      >
                        {I18N.productCarbonFootprintAI.productUploadFileTip}
                      </p>
                    </div>
                  }
                  overlayInnerStyle={{
                    backgroundColor: '#04252b',
                    padding: '8px 12px',
                    borderRadius: 8,
                    maxWidth: 280,
                  }}
                >
                  <label
                    htmlFor='product-cfp-ai-image-input'
                    className={
                      isProductUploadDisabled
                        ? `${style.uploadLabel} ${style.uploadLabelDisabled}`
                        : style.uploadLabel
                    }
                  >
                    <span className={style.srOnly}>
                      {I18N.productCarbonFootprintAI.uploadImage}
                    </span>
                    <input
                      id='product-cfp-ai-image-input'
                      type='file'
                      className={style.hiddenFileInput}
                      onChange={handleProductFileUpload}
                      accept='image/*'
                      disabled={isProductUploadDisabled}
                    />
                    <div
                      className={
                        isProductUploadDisabled
                          ? `${style.uploadCircle} ${style.uploadCircleDisabled}`
                          : style.uploadCircle
                      }
                      aria-hidden
                    >
                      <svg
                        width={18}
                        height={18}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#04252b'
                        strokeWidth={1.75}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        aria-hidden
                      >
                        <rect x='3' y='3' width='18' height='18' rx='2' />
                        <circle cx='8.5' cy='8.5' r='1.5' fill='#04252b' />
                        <path d='M21 15l-5-5L5 21' />
                      </svg>
                    </div>
                  </label>
                </Tooltip>
                {/* <Tooltip
                  title={
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          lineHeight: '20px',
                        }}
                      >
                        {I18N.productCarbonFootprintAI.uploadFile}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          lineHeight: '20px',
                          color: 'rgba(255,255,255,0.7)',
                        }}
                      >
                        {I18N.productCarbonFootprintAI.referUploadFileTip}
                      </p>
                    </div>
                  }
                  overlayInnerStyle={{
                    backgroundColor: '#04252b',
                    padding: '8px 12px',
                    borderRadius: 8,
                    maxWidth: 280,
                  }}
                >
                  <label
                    htmlFor='product-cfp-ai-refer-input'
                    className={
                      isReferUploadDisabled
                        ? `${style.uploadLabel} ${style.uploadLabelDisabled}`
                        : style.uploadLabel
                    }
                  >
                    <span className={style.srOnly}>
                      {I18N.productCarbonFootprintAI.uploadFile}
                    </span>
                    <input
                      id='product-cfp-ai-refer-input'
                      type='file'
                      className={style.hiddenFileInput}
                      multiple
                      accept={REFER_ACCEPT}
                      onChange={handleReferFileUpload}
                      disabled={isReferUploadDisabled}
                    />
                    <div
                      className={
                        isReferUploadDisabled
                          ? `${style.uploadCircle} ${style.uploadCircleDisabled}`
                          : style.uploadCircle
                      }
                    >
                      <svg
                        width={18}
                        height={18}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='#04252b'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        aria-hidden
                      >
                        <path d='M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48' />
                      </svg>
                    </div>
                  </label>
                </Tooltip> */}
                <button
                  type='button'
                  onClick={handleClick}
                  disabled={
                    loading ||
                    (!userContent.trim() &&
                      productUploadedFiles.length === 0 &&
                      referUploadedFiles.length === 0) ||
                    (!userContent.trim() && productUploadedFiles.length === 0)
                  }
                  className={style.sendBtn}
                >
                  {loading ? (
                    <svg
                      className={`${style.sendIcon} ${style.spin}`}
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className={style.spinnerCircle}
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className={style.spinnerPath}
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  ) : (
                    <img
                      src='/images/home/send.svg'
                      alt={I18N.productCarbonFootprintAI.altSend}
                      className={style.sendIcon}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className={style.quickWrap}>
            {quickSuggestions.map(suggestion => (
              <button
                key={suggestion}
                type='button'
                onClick={() => handleQuickSuggestion(suggestion)}
                className={style.quickBtn}
              >
                <img
                  src='/images/aiPromptHome.svg'
                  alt={I18N.carbonFootprint.prompt}
                  className={style.quickIcon}
                />
                <span className={style.quickText}>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
