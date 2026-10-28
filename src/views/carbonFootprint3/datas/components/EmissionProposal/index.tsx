/**
 * @description 减排建议
 */
import qrCodeImg from '@assets/svg/service_qr_code.png';
import { EmptyPage } from '@src/components/EmptyPage';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Button, theme, Tooltip } from 'antd';
import { CSSProperties } from 'react';

import style from './index.module.less';

const { useToken } = theme;

interface EmissionProposalProps<T> {
  title?: string;
  orgCol?: {
    name: string;
    title: string;
    width: number;
  }[];
  orgList?: T[];
  tipList?: {
    icon: string;
    iconStyle: CSSProperties;
    iconTitle: string;
    descTitle: string;
    desc: string;
  }[];
  onClickMore?: () => void;
}

interface OrgListType {
  orgName: string;
  type: string;
  goodsType: string;
}

function EmissionProposal<T = OrgListType>({
  title = I18N.carbonFootprint3.emissionReductionSuggestions,
  orgList = [] as T[],
  orgCol = [],
  tipList = [
    {
      icon: 'icon-icon_raw-materials',
      iconStyle: {
        color: '#35B3FA',
      },
      iconTitle: I18N.carbonFootprint.rawMaterial,
      descTitle: '',
      desc: I18N.carbonFootprint3.usingSustainableMethods,
    },
    {
      icon: 'icon-icon_manufacturing',
      iconStyle: {
        color: '#0CBF9F',
      },
      iconTitle: I18N.carbonFootprint3.manufacture,
      descTitle: '',
      desc: I18N.carbonFootprint3.improveEnergyEfficiency,
    },
    {
      icon: 'icon-icon_distribution',
      iconStyle: {
        color: '#EE9F56',
      },
      iconTitle: I18N.carbonFootprint3.distributionAndRetail,
      descTitle: '',
      desc: I18N.carbonFootprint3.adoptingIntelligence,
    },
    {
      icon: 'icon-icon_usage',
      iconStyle: {
        color: '#01C1CD',
      },
      iconTitle: I18N.carbonFootprint3.consumerUse,
      descTitle: '',
      desc: I18N.carbonFootprint3.promoteSustainability,
    },
    {
      icon: 'icon-icon_disposal',
      iconStyle: {
        color: '#999EA4',
      },
      iconTitle: I18N.carbonFootprint3.disposalOfRegenerationBenefits,
      descTitle: '',
      desc: I18N.carbonFootprint3.establishWaste,
    },
  ],
  onClickMore,
}: EmissionProposalProps<T>) {
  const { token } = useToken();

  return (
    <div className={style.emissionProposal}>
      <h4 className={style.title}>{title}</h4>

      <div className={style.content}>
        <div className={style.tipList}>
          {tipList?.map((tp, i) => {
            const { icon, iconTitle, descTitle, desc, iconStyle } = tp;

            const showLine = i !== tipList.length - 1;

            return (
              <div className={style.tipItem}>
                <div className={style.tipDot} />

                {showLine && <div className={style.line} />}

                <div className={style.lineTop} />
                <div className={style.lineBottom} />

                <div className={style.tipIconBox}>
                  <IconAlibaba
                    type={icon}
                    className={style.tipIcon}
                    style={iconStyle}
                  />
                  <span className={style.iconTitle}>{iconTitle}</span>
                </div>
                <div className={style.descBox}>
                  <span className={style.descTitle}>{descTitle}</span>
                  <div className={style.desc}>{desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={style.org}>
          <div className={style.orgInfo}>
            <span className={style.infoText}>
              {I18N.carbonFootprint3.recommendedGreenSupply}
            </span>
            <div className={style.infoDesc}>
              {I18N.carbonFootprint3.ifYouNeedMoreDetails}
            </div>
            <Tooltip
              trigger={['hover']}
              title={
                <div className={style.contact}>
                  <div>{I18N.carbonFootprint3.contactExclusiveCustomers}</div>
                  <img src={qrCodeImg} style={{ width: '140px' }} alt='' />
                </div>
              }
              color={token.Menu?.itemBg}
              arrow={false}
              placement='bottom'
            >
              <div className={style.concactBtn}>
                <IconAlibaba type='icon-icon_dialogue' className={style.icon} />
                <span className={style.text}>{I18N.system.contactUs}</span>
              </div>
            </Tooltip>

            {/* <Popover
              content={
                <div className={style.concactBox}>
                  <div className={style.concactText}>
                    {I18N.carbonFootprint3.contactExclusiveCustomers}
                  </div>
                  <div className={style.img}>
                    <img
                      className={style.img}
                      src={qrCodeImg}
                      alt={I18N.carbonAccount.picture}
                    />
                  </div>
                </div>
              }
              title=''
              trigger='hover'
              placement='bottom'
            >
              <div className={style.concactBtn}>
                <IconAlibaba type='icon-icon_dialogue' className={style.icon} />
                <span className={style.text}>{I18N.system.contactUs}</span>
              </div>
            </Popover> */}
          </div>

          <div className={style.orgContent}>
            <div className={style.orgtable}>
              <div className={style.orgTableHead}>
                {orgCol?.map(oC => (
                  // const { width } = oC;
                  <div
                    className={style.orgTableTitle}
                    // style={{
                    //   width: `${width}px`,
                    // }}
                  >
                    {oC.title}
                  </div>
                ))}
              </div>

              {orgList?.map(ol => (
                // const { name, value } = ol;
                <div className={style.orgTableContent}>
                  {orgCol?.map(oC => {
                    const { width } = oC;
                    return (
                      <Tooltip title={ol?.[oC?.name]}>
                        <div
                          className={style.orgTableItem}
                          style={{
                            minWidth: `${width}px`,
                          }}
                        >
                          {ol?.[oC?.name] || '-'}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}

              {!orgList?.length && <EmptyPage />}
            </div>

            <div className={style.orgMore}>
              <Button
                className={style.moreBtn}
                type='link'
                onClick={onClickMore}
              >
                {I18N.components.viewMore}
                <IconAlibaba
                  type='icon-icon_arrow_rioght'
                  className={style.icon}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmissionProposal;
