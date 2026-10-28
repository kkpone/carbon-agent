import useUrlState from '@ahooksjs/use-url-state';
import aiStarSvg from '@src/assets/svg/aiStar.svg';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Button, Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import { streamFetch } from '@/api/streamFetch';
import reductionAiAvatarIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/reduction-ai-avatar.svg';
import referenceIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/history-dialogue.svg';
import reductionAiIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/reduction-ai-icon.svg';
import reductionRefreshIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/reduction-refresh.svg';
import { getFootprint3QuestionGuide } from '@/components/AICarbonFloating/AiDrawerContent/service';
import { tryParseJSON } from '@/utils';

import expandImg from './expand.svg';
import styles from './index.module.less';
import { getAskFootAiAssistant, getRecommend, getSuggestion } from './service';

const SUGGESTION_STATE = {
  NOT_EXIST: '0',
  EXIST: '1',
  NO_NEED: '2',
};

const SELECTION_TOOLBAR_HEIGHT = 36;
const SELECTION_TOOLBAR_GAP = 8;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type Suggestion = {
  emissionPercentage: string;
  emissionSourceCategory: string;
  emissionSourceName: string;
  lifecycleStage: string;
  reductionMeasure: string;
};
type SuggestionOverview = DeepPartial<{
  productName: string;
  industryCategory: string;
  emissionReductionOverview: string;
  emissionReductionEvaluation: {
    summaryStatement: string;
    totalReductionAmount: number;
    reductionPercentage: number;
  };
  emissionSourceSuggestions: Suggestion[];
  lifecycleStageSuggestion: Suggestion;
  overallSuggestions: Suggestion[];
}>;

type AISuggestionUrlParams = {
  shareAuth?: string;
  snapFlag?: string;
  lang?: string;
};

type SuggestionServiceResponse = {
  data: {
    data: {
      chatResult: string;
      aiContent: string;
      topicId: number;
    };
  };
};

type AISuggestionProps = {
  accountId: number | string;
  collapse?: boolean;
  isSharePages?: boolean;
  onReferenceSelect?: (content: string) => void;
  autoGenerate?: boolean;
  readonly?: boolean;
  getSuggestionService?: (
    params: Record<string, any>,
  ) => Promise<SuggestionServiceResponse>;
  getRecommendService?: typeof getRecommend;
  getAskFootAiAssistantService?: typeof getAskFootAiAssistant;
  fetchQuestionGuideListService?: (
    accountId: number | string,
  ) => Promise<string[]>;
  streamUrl?: string;
  buildStreamData?: (data: {
    accountId: number | string;
  }) => Record<string, any>;
  onQuestionGuideClick?: (question: string) => void | Promise<void>;
  onSuggestionReferenceAdd?: (referenceText: string) => void | Promise<void>;
};

function fetchQuestionGuideList(accountId: number | string) {
  return getFootprint3QuestionGuide({ accountId: Number(accountId) }).then(
    result => (Array.isArray(result.data.data) ? result.data.data : []),
  );
}

const AISuggestion: FC<AISuggestionProps> = props => {
  const {
    accountId,
    isSharePages,
    onReferenceSelect,
    autoGenerate = true,
    readonly = false,
    getSuggestionService = getSuggestion,
    getRecommendService = getRecommend,
    getAskFootAiAssistantService = getAskFootAiAssistant,
    fetchQuestionGuideListService = fetchQuestionGuideList,
    streamUrl,
    buildStreamData,
    onQuestionGuideClick,
    onSuggestionReferenceAdd,
  } = props;

  const [urlParams] = useUrlState<AISuggestionUrlParams>();

  const abortCtrlRef = useRef<AbortController>();

  const [suggestion, setSuggestion] = useState<SuggestionOverview>();

  const [showAISuggestion, setShowAISuggestion] = useState(false);

  const [collapse, setCollapse] = useState(() => props.collapse ?? true);

  const topicIdRef = useRef<number>();

  const [recommendProducts, setRecommendProducts] = useState<
    Record<string, any>[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [generateLoading, setGenerateLoading] = useState(false);

  const [questionGuide, setQuestionGuide] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionPanelRef = useRef<HTMLDivElement>(null);
  const selectionToolbarRef = useRef<HTMLButtonElement>(null);
  const [selectionToolbar, setSelectionToolbar] = useState<{
    key: string;
    text: string;
    top: number;
    left: number;
  } | null>(null);

  const generatorSuggestion = (data: { accountId: number | string }) => {
    const abortCtrl = new AbortController();
    abortCtrlRef.current?.abort();
    abortCtrlRef.current = abortCtrl;

    let streamText = '';
    setTimeout(() => {
      setGenerateLoading(true);
    });

    setSuggestion(undefined);
    setSelectionToolbar(null);
    setRecommendProducts([]);
    setQuestionGuide([]);
    setCollapse(false);

    if (!autoGenerate && !streamUrl) {
      return;
    }

    const requestUrl =
      streamUrl ||
      (isSharePages
        ? `${process.env.REACT_APP_API_URL}/footprint3/account/aiAccountAnalysisCreateThird`
        : `${process.env.REACT_APP_API_URL}/footprint3/account/aiEmissionAnalysisCreate`);

    const streamData: Record<string, any> = buildStreamData
      ? buildStreamData(data)
      : { ...data };
    if (isSharePages) {
      if (urlParams.shareAuth) {
        streamData.shareAuth = urlParams.shareAuth;
      }
      if (
        urlParams.snapFlag != null &&
        String(urlParams.snapFlag).trim() !== ''
      ) {
        streamData.snapFlag = String(urlParams.snapFlag);
      }
      streamData.lang = urlParams.lang === LocaleType.enUS ? 'en' : 'zh';
    }

    streamFetch({
      url: requestUrl,
      data: streamData,
      onMessage: (txt: string) => {
        streamText += txt;
        const sug = tryParseJSON(streamText);
        if (sug) {
          setSuggestion(sug);
        }
      },
      abortCtrl,
    })
      .then(({ responseData }) => {
        topicIdRef.current = (
          (responseData as unknown as { topicId: number }) || {}
        ).topicId;
        // 重新获取推荐产品
        if (!isSharePages) {
          getRecommendService({ type: '1' }).then(resp => {
            setRecommendProducts(resp.data.data);
          });
          fetchQuestionGuideListService(accountId)
            .then(setQuestionGuide)
            .catch(() => setQuestionGuide([]));
        }
      })
      .finally(() => {
        setGenerateLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    const suggestionParams: {
      accountId: number | string;
      shareAuth?: string;
      snapFlag?: string;
      lang?: string;
    } = { accountId };
    if (urlParams.shareAuth) {
      suggestionParams.shareAuth = urlParams.shareAuth;
    }
    if (
      urlParams.snapFlag != null &&
      String(urlParams.snapFlag).trim() !== ''
    ) {
      suggestionParams.snapFlag = String(urlParams.snapFlag);
    }
    if (urlParams.lang) {
      suggestionParams.lang = urlParams.lang === LocaleType.enUS ? 'en' : 'zh';
    }

    getSuggestionService(suggestionParams)
      .then(async ({ data }) => {
        const result = data.data.chatResult;

        setShowAISuggestion(result !== SUGGESTION_STATE.NO_NEED);

        if (result === SUGGESTION_STATE.EXIST) {
          topicIdRef.current = data.data.topicId;
          const sug = tryParseJSON(data.data.aiContent);
          if (sug) {
            setSuggestion(sug);
          }

          if (!isSharePages) {
            getRecommendService({ type: '1' }).then(resp => {
              setRecommendProducts(resp.data.data);
            });
          }
        }

        if (result === SUGGESTION_STATE.NOT_EXIST && autoGenerate) {
          generatorSuggestion({ accountId });
        }

        if (result === SUGGESTION_STATE.NOT_EXIST && !autoGenerate) {
          setShowAISuggestion(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      setGenerateLoading(false);
      abortCtrlRef.current?.abort();
    };
  }, [accountId, urlParams.shareAuth, urlParams.snapFlag, urlParams.lang]);

  useEffect(() => {
    let cancelled = false;
    if (isSharePages || readonly) {
      setQuestionGuide([]);
      return () => {
        cancelled = true;
      };
    }
    fetchQuestionGuideListService(accountId)
      .then(data => {
        if (!cancelled) {
          setQuestionGuide(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuestionGuide([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [accountId, isSharePages]);

  useEffect(() => {
    if (!selectionToolbar) {
      return undefined;
    }

    const handleDocumentPointerDown = (event: MouseEvent | TouchEvent) => {
      const { target } = event;
      if (
        target instanceof Node &&
        selectionToolbarRef.current?.contains(target)
      ) {
        return;
      }

      setSelectionToolbar(null);
    };

    document.addEventListener('mousedown', handleDocumentPointerDown);
    document.addEventListener('touchstart', handleDocumentPointerDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown);
      document.removeEventListener('touchstart', handleDocumentPointerDown);
    };
  }, [selectionToolbar]);

  if (!showAISuggestion) {
    return null;
  }

  const suggestionItems = [
    ...(suggestion?.overallSuggestions || []),
    ...(suggestion?.lifecycleStageSuggestion
      ? [suggestion.lifecycleStageSuggestion]
      : []),
    ...(suggestion?.emissionSourceSuggestions || []),
  ];
  const hasSuggestionSummary = Boolean(
    suggestion?.emissionReductionEvaluation?.summaryStatement,
  );
  const hasSuggestionListContent =
    hasSuggestionSummary || suggestionItems.length > 0;
  const canAddSuggestionReference = Boolean(
    onReferenceSelect || onSuggestionReferenceAdd,
  );

  const handleQuestionGuideClick = async (item: string) => {
    if (isSharePages) {
      return;
    }
    await getAskFootAiAssistantService({
      accountId: Number(accountId),
    });
    await onQuestionGuideClick?.(item || '');
  };

  const getSuggestionItemKey = (item: Partial<Suggestion>, index: number) =>
    `${
      item.emissionSourceName ||
      item.lifecycleStage ||
      I18N.carbonFootprint3.emissionReductionSuggestions
    }-${item.reductionMeasure || ''}-${index}`;

  const handleSuggestionItemClick = (
    item: Partial<Suggestion>,
    index: number,
    target: HTMLDivElement,
  ) => {
    const panel = suggestionPanelRef.current;
    const text = item.reductionMeasure?.trim() ?? '';
    if (
      isSharePages ||
      readonly ||
      !panel ||
      !text ||
      !canAddSuggestionReference
    ) {
      setSelectionToolbar(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const suggestionContentRect =
      target.querySelector('ol')?.getBoundingClientRect() ?? rect;
    const panelRect = panel.getBoundingClientRect();
    const toolbarLeft = Math.min(
      Math.max(rect.left - panelRect.left + rect.width / 2, 80),
      Math.max(panelRect.width - 80, 80),
    );
    const toolbarTop =
      suggestionContentRect.top -
      panelRect.top -
      SELECTION_TOOLBAR_HEIGHT -
      SELECTION_TOOLBAR_GAP;

    setSelectionToolbar({
      key: getSuggestionItemKey(item, index),
      text,
      left: toolbarLeft,
      top: toolbarTop,
    });
  };

  const handleAddSelectionToChat = async () => {
    const text = selectionToolbar?.text.trim();
    if (!text || isSharePages || readonly) {
      return;
    }
    if (onReferenceSelect) {
      onReferenceSelect(text);
      setSelectionToolbar(null);
      return;
    }
    await getAskFootAiAssistantService({
      accountId: Number(accountId),
    });
    await onSuggestionReferenceAdd?.(text);
    setSelectionToolbar(null);
  };

  const handleCollapseToggle = () => {
    const nextCollapse = !collapse;
    setCollapse(nextCollapse);

    if (nextCollapse) {
      requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({ block: 'start' });
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.container, {
        [styles.collapseContainer]: collapse,
      })}
    >
      <div className={styles.header}>
        <div className={styles.aiTag}>
          <img src={reductionAiIcon} alt='' />
          {I18N.carbonFootprint3.emissionReductionSuggestions}
        </div>
        <div className={styles.headerRight}>
          {!collapse && !readonly && (
            <Button
              className={styles.reBtn}
              icon={
                <img
                  className={styles.reBtnIcon}
                  src={reductionRefreshIcon}
                  alt=''
                />
              }
              loading={generateLoading}
              onClick={() => generatorSuggestion({ accountId })}
            />
          )}
        </div>
      </div>
      <div className={styles.content}>
        <Spin spinning={loading}>
          {suggestion && (
            <>
              <div className={styles.description}>
                <div>
                  {/* <span className={styles.boldText}>
                    {suggestion.productName}
                    {suggestion.industryCategory && '属于'}
                    {suggestion.industryCategory}
                  </span> */}
                  <span>{suggestion.emissionReductionOverview}</span>
                </div>
              </div>
              {hasSuggestionListContent && (
                <div className={styles.suggestionList}>
                  {hasSuggestionSummary && (
                    <div className={styles.suggestionSummary}>
                      <img src={reductionAiAvatarIcon} alt='' />
                      <span>
                        {
                          suggestion.emissionReductionEvaluation
                            ?.summaryStatement
                        }
                      </span>
                    </div>
                  )}
                  {suggestionItems.length > 0 && (
                    <div
                      className={styles.suggestionPanel}
                      ref={suggestionPanelRef}
                    >
                      {selectionToolbar && (
                        <button
                          ref={selectionToolbarRef}
                          type='button'
                          className={styles.selectionToolbar}
                          style={{
                            top: selectionToolbar.top,
                            left: selectionToolbar.left,
                          }}
                          onMouseDown={event => event.preventDefault()}
                          onClick={() => {
                            handleAddSelectionToChat().catch(() => {});
                          }}
                        >
                          <span className={styles.selectionToolbarInner}>
                            <img
                              className={styles.selectionToolbarIcon}
                              src={referenceIcon}
                              alt=''
                            />
                            <span className={styles.selectionToolbarText}>
                              {I18N.carbonFootprint3.addToDialogue}
                            </span>
                          </span>
                        </button>
                      )}
                      {suggestionItems.map((item, index) => {
                        const sug = item || {};
                        const suggestionKey = getSuggestionItemKey(sug, index);
                        const isSelected =
                          selectionToolbar?.key === suggestionKey;
                        return (
                          <div
                            className={classNames(styles.suggestionItem, {
                              [styles.suggestionItemSelected]: isSelected,
                            })}
                            key={suggestionKey}
                            onClick={event =>
                              handleSuggestionItemClick(
                                sug,
                                index,
                                event.currentTarget,
                              )
                            }
                          >
                            {(sug.emissionSourceName || sug.lifecycleStage) && (
                              <div className={styles.sugHeader}>
                                <div className={styles.sugTag}>
                                  <div className={styles.emissionName}>
                                    {sug.emissionSourceName ||
                                      sug.lifecycleStage}
                                  </div>
                                  {sug.emissionSourceCategory && (
                                    <div className={styles.material}>
                                      {sug.emissionSourceCategory}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <ol
                              className={classNames(styles.sugDesc, {
                                [styles.sugDescSelected]: isSelected,
                              })}
                              start={index + 1}
                            >
                              <li>
                                <span className={styles.sugDescText}>
                                  {sug.reductionMeasure}
                                </span>
                              </li>
                            </ol>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {!isSharePages && questionGuide.length > 0 && (
                <div className={styles.actionButtons}>
                  {questionGuide.map(item => (
                    <Tooltip title={item} placement='top' key={item}>
                      <div
                        className={styles.actionBtn}
                        onClick={() => {
                          handleQuestionGuideClick(item).catch(() => {});
                        }}
                      >
                        <img
                          className={styles.actionBtnIcon}
                          src={aiStarSvg}
                          alt=''
                        />
                        <span className={styles.actionBtnText}>{item}</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              )}
              {!generateLoading && (
                <div className={styles.recommend}>
                  <div className={styles.recommendTitle}>
                    {I18N.carbonFootprint3.apartFromUsingNeedles}
                  </div>
                  <div className={styles.productList}>
                    {recommendProducts.map(product => (
                      <div
                        className={styles.product}
                        key={product.goodsId}
                        onClick={() =>
                          window.open('/carbonNeutral/service', '_blank')
                        }
                      >
                        <div className={styles.productInfo}>
                          <div className={styles.productInfoLeft}>
                            <img src={product.imgPath} alt='' />
                          </div>
                          <div className={styles.productInfoRight}>
                            <div
                              className={styles.productName}
                              title={product.goodsName}
                            >
                              {product.goodsName}
                            </div>
                            <div
                              className={styles.productDesc}
                              title={product.info}
                            >
                              {product.info}
                            </div>
                          </div>
                        </div>
                        <div className={styles.productPrice}>
                          <div className={styles.productPriceMain}>
                            <span className={styles.price}>
                              ¥{product.price}
                            </span>
                            <span className={styles.priceUnit}>
                              {I18N.carbonNeutral.yuanTon}
                            </span>
                          </div>
                          <div
                            className={styles.stock}
                            title={`${I18N.carbonNeutral.stock}${product.realAmount}${I18N.carbonNeutral.ton}`}
                          >
                            {I18N.carbonNeutral.stock}
                            {product.realAmount}
                            {I18N.carbonNeutral.ton}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Spin>
      </div>
      <div className={styles.collapseContent}>
        <div
          className={classNames(styles.collapseBtn)}
          style={{
            transform: `rotate(${collapse ? 180 : 0}deg)`,
          }}
          onClick={handleCollapseToggle}
        >
          <img src={expandImg} alt='' />
        </div>
      </div>
    </div>
  );
};

export default AISuggestion;
