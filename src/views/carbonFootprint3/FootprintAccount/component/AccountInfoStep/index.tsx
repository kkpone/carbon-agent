/**
 * 核算详情头部步骤条
 * @returns
 */
import useUrlState from '@ahooksjs/use-url-state';
import { checkPermissions } from '@src/components/Permission/utils';
import IconFont from '@src/components/iconfont';
import I18N, { LocaleType } from '@src/lang/I18N';
import {
  STEP_OPTION_LABEL,
  STEP_OPTION_VALUE,
} from '@src/views/carbonFootprint3/util/constant';
import { Button, Steps } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { FC, memo, useContext } from 'react';

import logoPng from '@/assets/images/logo_white_bg.png';
import EnLogoPng from '@/assets/images/logo_white_bg_en.png';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import { useGlobalLoginModal } from '@/components/GlobalLoginModal';
import { LocaleContext } from '@/components/LocaleProvider';
import { getToken } from '@/utils/cookie';
import { useAccountIdBindWithUpgrade } from '@/utils/useAccountIdBindWithUpgrade';
import { CompanyType } from '@/views/system/login/component/Login';

import style from './index.module.less';
import { FootprintAccountStatusType } from '../../constant';
import { AccountInfoStepProps } from './type';
import { ShareModelSubmitButton } from '../../../component/ShareModelSubmitButton';
import { canShowModelShareAction } from '../../../share';

const { MODEL, RESULT } = STEP_OPTION_VALUE;
const { ACCOUNT_SHARE_EDIT } = API_EXTRA_PARAMS_SNAPFLAG;

/** 分享头图（Logo + 碳云）仅在此类 snapFlag 的链接下展示 */
const isSnapFlagForShareBrandHeader = (snap: unknown) =>
  snap === '6' || snap === '7' || snap === 6 || snap === 7;

export const AccountInfoStep: FC<AccountInfoStepProps> = memo(
  ({
    shareStatus,
    expireTime,
    agentPreviewLayout,
    backText,
    isDetail,
    stepValue,
    stepStatus,
    backClick,
    changeSetp,
    createFinishReport,
    goAddReport,
    goCarbonLabel,
    onModelShare,
    goEditModel,
    hideBackHeader,
    hideResultOutputActions,
    aiAgentSlot,
    shareFlag,
    accountShareStatus,
    accountId,
    accountStatus,
    accountType,
    onShareModelSubmitSuccess,
    snapFlag: snapFlagProp,
    shareCanAction,
  }) => {
    const { openLoginModal } = useGlobalLoginModal();
    const handleAccountIdBindWithUpgrade = useAccountIdBindWithUpgrade();
    const stepStatusNumber = Number(stepStatus);
    /** 暂时隐藏掉新手引导入口 */
    // const [guideModalVisible, setGuideModalVisible] = useState(false);
    // const [guideVideoList, setGuideVideoList] = useState<Dicts[]>([]);
    // const videoRef = useRef<HTMLVideoElement>(null);
    // useEffect(() => {
    //   listALLByDictTypeBatch<{ footprint3: Dicts[] }>({
    //     dictTypes: 'footprint3',
    //   }).then(({ data }) => {
    //     setGuideVideoList(data?.data?.footprint3 ?? []);
    //   });
    // }, []);

    /**
     * 显示核算结果的 disabled（共享编辑以 account/info 的 accountStatus 为准）
     */
    const showResultDisabled = () => {
      if (stepStatusNumber === RESULT) {
        return false;
      }

      return true;
    };

    const { locale } = useContext(LocaleContext);

    const isEn = locale === LocaleType.enUS;

    const isFinish = stepStatusNumber === RESULT;

    const [urlState] = useUrlState<Record<string, unknown>>(
      {},
      { parseOptions: { parseBooleans: true, parseNumbers: true } },
    );
    const snapFlagFromUrl = urlState?.snapFlag ?? urlState?.snapflag;
    const resolvedSnapFlag =
      snapFlagProp != null ? snapFlagProp : snapFlagFromUrl;

    /** 共享编辑 snapFlag=8：以 account/info 返回的 accountStatus 控制按钮与步骤 */
    const isShareEditSnapFlag = Number(resolvedSnapFlag) === ACCOUNT_SHARE_EDIT;
    /** account/info 的 accountStatus：2=已完成建模，展示「编辑模型」 */
    const shareEditAccountStatusNumber =
      accountStatus != null ? Number(accountStatus) : stepStatusNumber;
    const isShareEditAccountFinished = shareEditAccountStatusNumber === RESULT;
    const shareEditCanAction = shareCanAction ?? !isDetail;
    const showShareEditModelStepAction =
      isShareEditSnapFlag && shareEditCanAction && stepValue === MODEL;
    const showShareEditResultStepEditAction =
      isShareEditSnapFlag &&
      shareEditCanAction &&
      stepValue === RESULT &&
      isShareEditAccountFinished;

    const showShareEditResultStepEnabled =
      isShareEditSnapFlag && isShareEditAccountFinished;

    const isNotLogin = !getToken();

    const urlMatchesShareBrandMode =
      !isSnapFlagForShareBrandHeader(snapFlagFromUrl);

    // 分享页 + URL 为 6/7：左侧品牌区；普通核算页：左侧返回；分享但非 6/7：左侧不展示
    const showShareBrandHeader =
      Boolean(shareStatus) && urlMatchesShareBrandMode;
    const showBackHeader = !shareStatus && !hideBackHeader;
    const showResultOutputActions =
      stepValue === RESULT && !isDetail && !hideResultOutputActions;

    const handleStepChange = (step: number) => {
      if (!getToken() && !shareStatus) {
        openLoginModal({
          companyType: CompanyType.company,
          showWechatLogin: true,
          onSuccess: async () => {
            await handleAccountIdBindWithUpgrade();
          },
        });
        return;
      }
      changeSetp(step + 1);
    };

    return (
      <div
        className={classNames(
          style.stepBox,
          !shareStatus && style.stepBoxAccountToolbar,
          agentPreviewLayout && style.agentPreviewToolbar,
        )}
      >
        <div className={style.stepMainGroup}>
          {showShareBrandHeader && (
            <div className={style.stepBoxBack} style={{ cursor: 'default' }}>
              <img
                className={style.stepBoxImg}
                src={isEn ? EnLogoPng : logoPng}
                alt='icon'
              />
            </div>
          )}
          {showBackHeader && (
            <div className={style.stepBoxBack} onClick={backClick}>
              <IconFont
                type='icon-icon-zuojiantou'
                style={{ fontSize: 24, marginRight: 8 }}
              />
              <span className={style.stepBoxBackText} title={backText}>
                {backText || '-'}
              </span>
            </div>
          )}
          {(showShareBrandHeader || showBackHeader) && (
            <div className={style.stepNavDivider} />
          )}
        </div>
        <Steps
          className={style.stepsClass}
          current={stepValue - 1}
          onChange={handleStepChange}
          size='small'
        >
          <Steps.Step
            key={MODEL}
            title={
              <span
                className={style.stepTitle}
                title={STEP_OPTION_LABEL()[MODEL]}
              >
                {STEP_OPTION_LABEL()[MODEL]}
              </span>
            }
          />
          <Steps.Step
            disabled={
              showShareEditResultStepEnabled ? false : showResultDisabled()
            }
            key={RESULT}
            title={
              <span
                className={style.stepTitle}
                title={STEP_OPTION_LABEL()[RESULT]}
              >
                {STEP_OPTION_LABEL()[RESULT]}
              </span>
            }
          />
        </Steps>

        <div className={style.stepBoxGoResutMain}>
          {/* 暂时隐藏掉新手引导入口 */}
          {/* {!isDetail && !shareStatus && guideVideoList.length > 0 && (
            <div className={style.stepBoxGoResut}>
              <Button onClick={() => setGuideModalVisible(true)}>
                {I18N.carbonFootprint3.beginnerGuidance}
              </Button>
            </div>
          )}
          {!isDetail && !shareStatus && guideVideoList.length > 0 && (
            <Modal
              title={I18N.carbonFootprint3.beginnerGuidance}
              open={guideModalVisible}
              footer={null}
              width={800}
              destroyOnClose
              onCancel={() => {
                setGuideModalVisible(false);
                videoRef.current?.pause();
              }}
            >
              <video
                ref={videoRef}
                src={guideVideoList[0]?.dictValue}
                controls
                style={{ width: '100%', maxHeight: 450, background: '#000' }}
              />
            </Modal>
          )} */}
          {stepValue === MODEL &&
            !isDetail &&
            !showShareEditModelStepAction &&
            checkPermissions(
              <div className={style.stepBoxGoResut}>
                <Button
                  type='primary'
                  onClick={() =>
                    isFinish ? goEditModel?.(true) : createFinishReport()
                  }
                >
                  {isFinish
                    ? I18N.productDigitalPassport.editModel
                    : I18N.carbonFootprint3.completeModeling}
                </Button>
              </div>,
              'footprint3:account:edit',
            )}
          {showShareEditModelStepAction && (
            <div className={style.stepBoxGoResut}>
              <Button
                type='primary'
                onClick={() =>
                  isShareEditAccountFinished
                    ? goEditModel?.(true)
                    : createFinishReport()
                }
              >
                {isShareEditAccountFinished
                  ? I18N.productDigitalPassport.editModel
                  : I18N.carbonFootprint3.completeModeling}
              </Button>
            </div>
          )}
          {isNotLogin && !shareStatus && (
            <Button
              type='primary'
              onClick={() => {
                if (!getToken() && !shareStatus) {
                  openLoginModal({
                    companyType: CompanyType.company,
                    showWechatLogin: true,
                    onSuccess: async () => {
                      await handleAccountIdBindWithUpgrade();
                    },
                  });
                }
              }}
            >
              {isFinish
                ? I18N.productDigitalPassport.editModel
                : I18N.carbonFootprint3.completeModeling}
            </Button>
          )}
          {showResultOutputActions &&
            onModelShare &&
            Number(accountType) !== FootprintAccountStatusType.PROCESS &&
            checkPermissions(
              <div className={style.stepBoxGoResut}>
                <Button onClick={onModelShare}>
                  {I18N.carbonFootprint3.modelShare}
                </Button>
              </div>,
              canShowModelShareAction({
                accountStatus,
                finishStatus: RESULT,
                shareFlag,
              })
                ? 'footprint3:share:add'
                : '',
            )}
          {showResultOutputActions &&
            checkPermissions(
              <div className={style.stepBoxGoResut}>
                <Button onClick={goCarbonLabel}>
                  {I18N.carbonFootprint3.applyForCarbonLabels}
                </Button>
              </div>,
              'footprint3:label:add',
            )}
          {showResultOutputActions && accountId && (
            <ShareModelSubmitButton
              accountId={accountId}
              shareStatus={accountShareStatus}
              wrapperClassName={style.stepBoxGoResut}
              onSuccess={onShareModelSubmitSuccess}
            />
          )}
          {showResultOutputActions &&
            !showShareEditResultStepEditAction &&
            checkPermissions(
              <div className={style.stepBoxGoResut}>
                <Button onClick={() => goEditModel?.(true)}>
                  {I18N.productDigitalPassport.editModel}
                </Button>
              </div>,
              'footprint3:account:edit',
            )}
          {showShareEditResultStepEditAction && (
            <div className={style.stepBoxGoResut}>
              <Button onClick={() => goEditModel?.(true)}>
                {I18N.productDigitalPassport.editModel}
              </Button>
            </div>
          )}

          {showResultOutputActions &&
            checkPermissions(
              <div className={style.stepBoxGoResut}>
                <Button type='primary' onClick={goAddReport}>
                  {I18N.carbonFootprint.generateReport}
                </Button>
              </div>,
              'footprint3:report:add',
            )}
          {expireTime && (
            <div className={style.stepExpireTime}>
              {I18N.carbonFootprint3.validityUntil}
              <span style={{ fontWeight: 500 }}>
                {moment(expireTime).format(I18N.carbonFootprint3.yyyy)}
              </span>
            </div>
          )}
          {aiAgentSlot && (
            <>
              <div className={style.aiAgentDivider} />
              <div className={style.aiAgentSlot}>{aiAgentSlot}</div>
            </>
          )}
        </div>
      </div>
    );
  },
);
