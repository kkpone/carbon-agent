/**
 * @description 左侧卡片-影响评价方案
 */

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import { FC, memo } from 'react';

import { PageEmpty } from '@/components/PageEmpty';
import { usePageInfo } from '@/hooks';
import I18N from '@/lang/I18N';
import { modalText, modelFooterBtnStyle } from '@/utils';

import style from './index.module.less';
// import { PLAN_STATUS } from '../../Info/ImpactAssessment/constant';
import { ImpactAssessmentListResp } from '../../type';

type ProgrammeCardsProps = {
  /** 点击card的方法 */
  onClickCard: (plan: ImpactAssessmentListResp) => void;
  /** 新增评价方案的方法 */
  onAddPlan: () => void;
  /** 删除评价方案的方法 */
  onDelete: (id: number) => void;
  /** 方案列表 */
  planList: ImpactAssessmentListResp[];
  /** 当前选中的cardId */
  cardId?: number;
  /** 方案列表loading */
  loading?: boolean;
};

export const ProgrammeCards: FC<ProgrammeCardsProps> = memo(
  ({ onClickCard, onAddPlan, onDelete, planList, cardId, loading = false }) => {
    // const { TO_BE_CALCULATED, IN_CALCULATION, COMPLETED } = PLAN_STATUS;

    /** 是否是详情 */
    const { isDetail } = usePageInfo();

    return (
      <div className={style.wrapper}>
        <div className={style.top}>
          <h3 className={style.topTitle}>
            {I18N.carbonFootPrintLCA.impactEvaluationParty}
          </h3>
          {!isDetail && (
            <Button type='primary' size='small' onClick={onAddPlan}>
              {I18N.carbonFootPrintLCA.addEvaluator}
            </Button>
          )}
        </div>
        <div className={style.bottom}>
          <Spin spinning={loading}>
            {planList && planList?.length ? (
              planList?.map(plan => (
                <div
                  className={classNames(style.card, {
                    [style.active]: cardId === plan.id,
                  })}
                  key={`${plan.id}`}
                  onClick={() => {
                    if (plan.id) {
                      onClickCard(plan);
                    }
                  }}
                >
                  <div className={style.cardTitle}>
                    <Tooltip title={plan.planName}>
                      <div className={style.cardProductName}>
                        {plan.planName || '-'}
                      </div>
                    </Tooltip>
                    {/* <div
                    className={classNames(style.tag, {
                      [style.tagToBeCalculated]:
                        plan.planStatus === TO_BE_CALCULATED,
                      [style.tagInCalculation]:
                        plan.planStatus === IN_CALCULATION,
                      [style.tagCompleted]: plan.planStatus === COMPLETED,
                    })}
                  >
                    {plan.planStatus_name}
                  </div> */}
                  </div>
                  <div className={style.cardMethodName}>
                    {I18N.carbonFootPrintLCA.evaluationMethods}
                    {plan.assessmentMethodName || '-'}
                  </div>
                  <div className={style.deleteIconBox}>
                    {!isDetail && (
                      <div
                        className={style.deleteIcon}
                        onClick={e => {
                          e.stopPropagation();
                          Modal.confirm({
                            title: I18N.Factors.prompt,
                            icon: '',
                            content: (
                              <span>
                                {I18N.carbonFootPrintLCA.confirmDeletionOfThis2}
                                <span className={modalText}>
                                  {plan.planName}?
                                </span>
                              </span>
                            ),
                            ...modelFooterBtnStyle,
                            okText: I18N.base.confirm,
                            cancelText: I18N.Factors.cancel,
                            onOk: () => {
                              if (!plan.id) return;
                              onDelete(plan.id);
                            },
                          });
                        }}
                      >
                        <DeleteOutlined />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <PageEmpty />
            )}
          </Spin>
        </div>
      </div>
    );
  },
);
