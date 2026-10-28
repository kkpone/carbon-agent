import I18N, { LocaleType } from '@src/lang/I18N';
import { Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import copyToClipboard from 'copy-to-clipboard';
import { throttle } from 'lodash-es';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { streamFetch } from '@/api/streamFetch';
import aiAssistantIcon from '@/assets/svg/aiCarbon.svg';
import AIAvatarImg from '@/assets/svg/ai_avatar.svg';
import copySvg from '@/assets/svg/copy.svg';
import resendSvg from '@/assets/svg/resend.svg';
import {
  EChatSource,
  useAICarbonFloating,
} from '@/components/AICarbonFloating/AICarbonContext';
import { getQuestionGuide } from '@/components/AICarbonFloating/AiDrawerContent/service';
import { LocaleContext } from '@/components/LocaleProvider';
// import { checkPermissions } from '@/components/Permission/utils';
import { tryParseJSON } from '@/utils';
import { getRecommend } from '@/views/carbonFootprint3/component/AISuggestion/service';
import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';

import expandIcon from './expand.svg';
import styles from './index.module.less';
import { CarbonReport } from './type';
import {
  // EnterpriseCarbonToolInfo,
  getAiEmissionInfo,
  getNewTopicId,
  // getToolBar,
} from '../../service';

interface AIReductionAdviceProps {
  year?: number;
  orgId?: number;
  autoGenerate?: boolean;
  readonly?: boolean;
  getAiEmissionInfoService?: typeof getAiEmissionInfo;
  getNewTopicIdService?: typeof getNewTopicId;
  getQuestionGuideService?: typeof getQuestionGuide;
  streamUrl?: string;
  buildStreamData?: (data: {
    year: number;
    orgId: number;
  }) => Record<string, any>;
}

// 处理高亮文本的辅助函数
const renderHighlightText = (text: string, uniqueId?: string) => {
  if (!text) return text;

  // 使用正则表达式匹配 *** 包裹的内容
  const parts = text.split(/(\*{3}[^*]*\*{3})/g);

  return parts.map(part => {
    // 检查是否是被 *** 包裹的内容
    if (part.startsWith('***') && part.endsWith('***')) {
      // 移除 *** 标记并添加高亮样式
      const highlightText = part.slice(3, -3);
      return (
        <span
          key={`highlight-${uniqueId}-${highlightText}`}
          className={styles.highlightText}
        >
          {highlightText}
        </span>
      );
    }
    return <span key={`text-${uniqueId}-${part}-${part.length}`}>{part}</span>;
  });
};

const AIReductionAdvice: React.FC<AIReductionAdviceProps> = props => {
  const {
    year,
    orgId,
    autoGenerate = true,
    readonly = false,
    getAiEmissionInfoService = getAiEmissionInfo,
    getNewTopicIdService = getNewTopicId,
    getQuestionGuideService = getQuestionGuide,
    streamUrl,
    buildStreamData,
  } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const useAICarbonContext = useAICarbonFloating();
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [carbonReport, setCarbonReport] = useState<CarbonReport>();
  const [topicId, setTopicId] = useState<number>();
  const [recommendProducts, setRecommendProducts] = useState<
    Record<string, any>[]
  >([]);

  const [toolBar, setToolBar] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {}, [toolBar, loading, answer]);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contentDivRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);

  const getToolBarFun = () => {
    if (topicId && !readonly) {
      getQuestionGuideService({ topicId }).then(res => {
        setToolBar(res.data.data);
      });
    }
  };

  useEffect(() => {
    if (topicId) {
      getToolBarFun();
    }
  }, [topicId]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const throttledSetPosition = useMemo(
    () =>
      throttle(newPos => {
        setPosition(newPos);
      }, 16),
    [],
  );

  const rePostAiEmissionInfo = async () => {
    if (!autoGenerate && !streamUrl) {
      setVisible(false);
      return;
    }
    setLoading(true);
    setCarbonReport(undefined);
    setAnswer('');
    setIsExpanded(true);
    setRecommendProducts([]);
    setPending(true);
    let streamText = '';
    try {
      await streamFetch({
        url:
          streamUrl ||
          `${process.env.REACT_APP_API_URL}/enterprise/computation/aiEmissionAnalysisCreate`,
        data: buildStreamData
          ? buildStreamData({ orgId: orgId!, year: year! })
          : {
              orgId: orgId!,
              year: year!,
            },
        onMessage: (e: string) => {
          streamText += e;
          setLoading(false);
          const parsedSuggestion = tryParseJSON(streamText);
          if (parsedSuggestion) {
            setCarbonReport(parsedSuggestion);
          }
        },
        abortCtrl: new AbortController(),
      }).then(() => {
        getToolBarFun();
        getRecommend({ type: '1' }).then(resp => {
          setRecommendProducts(resp.data.data);
        });
        getAiEmissionInfoService({ orgId: orgId!, year: year! }).then(res => {
          if (res.data.data.chatResult === '1') {
            setTopicId(res.data.data.topicId);
          }
        });
      });
    } finally {
      setLoading(false);
      setPending(false);
    }
  };

  useEffect(() => {
    if (year && orgId) {
      setVisible(true);
      getAiEmissionInfoService({ orgId: orgId!, year: year! }).then(res => {
        // console.log(res.data.data.chatResult);
        if (res.data.data.chatResult === '1') {
          setAnswer(res.data.data.aiContent);
          const repairedSuggestion = tryParseJSON(res.data.data.aiContent);
          setTopicId(res.data.data.topicId);
          if (repairedSuggestion) {
            setCarbonReport(repairedSuggestion);
          }
          getRecommend({ type: '1' }).then(resp => {
            setRecommendProducts(resp.data.data);
          });
        } else if (autoGenerate) {
          rePostAiEmissionInfo();
        } else {
          setVisible(false);
        }
      });
    }
  }, [year, orgId]);

  const onCopy = () => {
    if (loading) {
      return;
    }
    const copySuccess = copyToClipboard(
      `${
        carbonReport?.organizationEmissionInfo
      }\n${carbonReport?.analysisPoints?.join(
        '\n',
      )}\n${carbonReport?.reductionSuggestions
        ?.map(
          item =>
            `${item.suggestionTitle}\n${item.suggestionContent?.join('\n')}`,
        )
        .join('\n')}`,
    );
    if (copySuccess) {
      Toast('success', I18N.carbonFootprint3.copySuccessful);
    } else {
      Toast('error', I18N.dashborad.copyFailed);
    }
  };

  const openAiAssistant = async (extra?: string, ReferencesText?: string) => {
    if (readonly) {
      return;
    }
    const res = await getNewTopicIdService({ topicId: topicId! });
    useAICarbonContext.setChatSource(EChatSource.ENTERPRISE_CARBON);
    useAICarbonContext.setTopicId(res.data.data.topicId);
    useAICarbonContext.setExtra(extra ?? '');
    useAICarbonContext.setReferencesText(ReferencesText ?? '');
    useAICarbonContext.setExpanded(true);
    useAICarbonContext.setIsOrgAiAssistant(true);
    useAICarbonContext.setAccountId(undefined);
  };

  const { locale } = useContext(LocaleContext);

  // const hasAIReduce = checkPermissions(true, 'aiReduceFloating');
  const hasAIReduce = !readonly;
  /** 是否是英文 */
  const isEn = locale === LocaleType.enUS;

  const [showPopover, setShowPopover] = useState(false);
  const proxyDivRef = useRef<HTMLDivElement>(null);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={classNames(styles.aiReductionAdvice, {
        [styles.expanded]: isExpanded,
      })}
    >
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.titleLabel}>
          <span className={styles.aiIcon}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='12'
              viewBox='0 0 20 12'
              fill='none'
            >
              <path
                d='M8.85955 0.580078C9.17011 0.580115 9.44854 0.771554 9.55974 1.06152L13.4523 11.2158C13.4899 11.314 13.4177 11.4197 13.3127 11.4199H10.0881C9.7353 11.4198 9.43054 11.1738 9.35564 10.8291L9.09197 9.61328H5.83904L5.13884 11.0068C5.01154 11.26 4.75226 11.4198 4.46892 11.4199H1.13787C1.02378 11.4199 0.951048 11.2972 1.00603 11.1973L6.63201 0.96875C6.7638 0.729114 7.01575 0.580113 7.28923 0.580078H8.85955ZM18.4191 4.19336C18.5092 4.19348 18.5787 4.27284 18.5676 4.3623L17.7677 10.7627C17.7208 11.138 17.4018 11.4198 17.0236 11.4199H14.6037C14.5135 11.4199 14.4431 11.3405 14.4543 11.251L15.2551 4.85059C15.302 4.47526 15.621 4.19336 15.9992 4.19336H18.4191ZM8.20037 5.51172C8.17036 5.37356 7.98367 5.34935 7.92009 5.47559L6.74724 7.80664H8.69939L8.20037 5.51172ZM18.8635 0.580078C18.9561 0.58013 19.0261 0.663481 19.0109 0.754883L18.6935 2.66309C18.6333 3.02473 18.3199 3.29004 17.9533 3.29004H15.5138C15.4212 3.29001 15.3511 3.20665 15.3664 3.11523L15.6838 1.20703C15.744 0.84539 16.0574 0.580078 16.424 0.580078H18.8635Z'
                fill='white'
              />
            </svg>
          </span>
          {I18N.carbonFootprint3.emissionReductionSuggestions}
        </div>
        <div className={styles.headerActions}>
          {isExpanded && !readonly && (
            <div className={styles.right}>
              <Tooltip title={I18N.carbonFootprint.copy} placement='top'>
                <div className={styles.operation} onClick={onCopy}>
                  <img src={copySvg} alt='' />
                </div>
              </Tooltip>
              <Tooltip title={I18N.components.reAnswer} placement='top'>
                <div
                  className={classNames(styles.operation, {
                    [styles.pending]: pending,
                  })}
                  onClick={() => {
                    if (pending) {
                      return;
                    }
                    setToolBar([]);
                    rePostAiEmissionInfo();
                  }}
                >
                  <img src={resendSvg} alt='' />
                </div>
              </Tooltip>
            </div>
          )}
          {hasAIReduce && (
            <div
              className={styles.aiAssistant}
              onClick={() => openAiAssistant()}
            >
              <img
                className={styles.aiAssistantIcon}
                src={aiAssistantIcon}
                alt=''
              />
              <span
                className={classNames(styles.aiAssistantText, {
                  [styles.aiAssistantTextEn]: isEn,
                })}
              >
                {I18N.components.aiSmallCarbon}
              </span>
            </div>
          )}
        </div>
      </div>

      <Spin spinning={loading}>
        <div
          className={styles.content}
          ref={contentDivRef}
          onMouseMove={event => {
            const content = contentDivRef.current;

            if (content) {
              const rect = content.getBoundingClientRect();

              const x = event.clientX - rect.left;
              const y = event.clientY - rect.top;

              throttledSetPosition({ top: y, left: x });
            }
          }}
        >
          <div className={styles.detailedContent}>
            <div className={styles.adviceSection}>
              {/* <div className={styles.sectionNumber}>1</div> */}
              <div className={styles.sectionContent}>
                <h4>{carbonReport?.organizationEmissionInfo}</h4>
                <div className={styles.subSection}>
                  {carbonReport?.analysisPoints?.map(item => (
                    <div
                      key={`analysis-${item}`}
                      className={styles.subSectionItem}
                    >
                      {renderHighlightText(item, `analysis-${item}`)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {isExpanded &&
              carbonReport?.reductionSuggestions?.map((item, index) => (
                <div
                  className={classNames(
                    styles.adviceSection,
                    styles.hoverSection,
                  )}
                  onMouseEnter={() => setShowPopover(true)}
                  onMouseLeave={() => setShowPopover(false)}
                  onClick={() =>
                    openAiAssistant(
                      undefined,
                      `${item.suggestionTitle}\n${item.suggestionContent?.join(
                        '\n',
                      )}`,
                    )
                  }
                >
                  <div className={styles.sectionNumber}>{index + 1}</div>
                  <div className={styles.sectionContent}>
                    <h4>{item.suggestionTitle}</h4>
                    <div className={styles.subSection}>
                      {item.suggestionContent?.map(point => (
                        <p key={`suggestion-point-${point}`}>
                          {renderHighlightText(
                            point,
                            `suggestion-point-${point}`,
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            {isExpanded && hasAIReduce && (
              <div className={styles.actionButtons}>
                {toolBar.map(item => (
                  <Tooltip title={item} placement='top'>
                    <div
                      className={styles.actionBtn}
                      onClick={() => openAiAssistant(item)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='14'
                        height='14'
                        viewBox='0 0 14 14'
                        fill='none'
                      >
                        <path
                          d='M5.4925 2.28339C5.6125 1.85672 6.22584 1.85672 6.34584 2.28339L6.9325 4.39006C7.26584 5.57672 8.19917 6.51006 9.39917 6.84339L11.5058 7.44339C11.9325 7.56339 11.9325 8.17672 11.5058 8.29672L9.39917 8.88339C8.19917 9.23005 7.26584 10.1501 6.9325 11.3501L6.34584 13.4567C6.22584 13.8834 5.6125 13.8834 5.4925 13.4567L4.8925 11.3501C4.55917 10.1634 3.62584 9.23005 2.43917 8.88339L0.332503 8.29672C0.237484 8.27278 0.153175 8.21781 0.092942 8.14052C0.0327093 8.06323 0 7.96804 0 7.87006C0 7.77207 0.0327093 7.67688 0.092942 7.59959C0.153175 7.5223 0.237484 7.46733 0.332503 7.44339L2.43917 6.84339C3.62584 6.51006 4.55917 5.57672 4.8925 4.39006L5.4925 2.28339ZM11.1192 0.323389C11.1592 0.190055 11.3325 0.190055 11.3725 0.323389L11.6125 1.15006C11.7458 1.64339 12.1325 2.03006 12.6258 2.16339L13.4525 2.40339C13.5858 2.44339 13.5858 2.61672 13.4525 2.65672L12.6258 2.89672C12.1325 3.03006 11.7458 3.41672 11.6125 3.91006L11.3725 4.73672C11.3325 4.87006 11.1592 4.87006 11.1192 4.73672L10.8792 3.91006C10.7458 3.41672 10.3592 3.03006 9.86584 2.89672L9.03917 2.65672C8.90584 2.61672 8.90584 2.44339 9.03917 2.40339L9.86584 2.16339C10.3592 2.03006 10.7458 1.64339 10.8792 1.15006L11.1192 0.323389Z'
                          fill='#026961'
                        />
                      </svg>
                      <span className={styles.actionBtnText}>{item}</span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            )}
            {isExpanded && recommendProducts.length > 0 && (
              <div className={styles.recommend}>
                <div className={styles.recommendTitle}>
                  {I18N.enterpriseCarbonAccount2.apartFromUsingNeedles}
                </div>
                <div className={styles.productList}>
                  {recommendProducts.map(product => (
                    <div
                      className={styles.product}
                      key={product.goodsId}
                      onClick={() =>
                        window.open('/carbonNeutral/service?open=1', '_blank')
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
                        <div>
                          <span className={styles.price}>¥{product.price}</span>
                          <span className={styles.priceUnit}>
                            {I18N.carbonNeutral.yuanTon}
                          </span>
                        </div>
                        <div className={styles.stock}>
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
          </div>
          {showPopover && hasAIReduce && (
            <div
              className={styles.popover}
              ref={proxyDivRef}
              style={{
                width: isEn ? 226 : 96,
                top: `${position.top - 6}px`,
                left: `${position.left + 14}px`,
              }}
              onMouseEnter={() => setShowPopover(true)}
              onMouseLeave={() => setShowPopover(false)}
            >
              <img className={styles.popoverImg} src={AIAvatarImg} alt='' />
              <div className={styles.popoverText}>
                {I18N.carbonFootprint3.followUpWithLittleCarbon}
              </div>
            </div>
          )}
        </div>
      </Spin>

      {/* Expand/Collapse Button */}
      <div className={styles.expandToggleContainer} onClick={toggleExpand}>
        <div
          className={classNames(styles.expandToggle, {
            [styles.expanded]: isExpanded,
          })}
        >
          <img src={expandIcon} alt='' />
        </div>
      </div>
    </div>
  );
};

export default AIReductionAdvice;
