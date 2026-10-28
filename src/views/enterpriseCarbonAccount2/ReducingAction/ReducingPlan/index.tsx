import useUrlState from '@ahooksjs/use-url-state';
import reducingPlanImg from '@assets/svg/reducing_plan.svg';
import I18N from '@src/lang/I18N';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { FC, useEffect, useState } from 'react';

import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibaba } from '@/components/iconfont';
import { Toast } from '@/utils/Toast';

import Overview from './Overview';
import ReducingForecast from './ReducingForecast';
import ReducingPlanDrawer from './ReducingPlanDrawer';
import ReducingTarget from './ReducingTarget';
import ReductionMeasures from './ReductionMeasures';
import {
  REDUCING_TAB,
  REDUCING_TAB_KEY,
  REDUCING_TARGET_LABEL,
} from './constant';
import styles from './index.module.less';
import {
  addReducingPlan,
  deleteReducingPlan,
  editReducingPlan,
  getReducingPlanList,
} from './service';
import { ReducingPlan } from './type';

const { OVERVIEW, TARGET, FORECAST, REDUCTION_MEASURES } = REDUCING_TAB_KEY;

const ReducingPlanPage: FC = () => {
  const [urlTabState, setUrlTabState] = useUrlState<{
    tabKey: string;
    open?: string;
    measureId?: string;
  }>({ tabKey: OVERVIEW });

  const [planList, setPlanList] = useState<ReducingPlan[]>([]);

  const [planListModalOpen, setPlanListModalOpen] = useState(false);

  const [plan, setPlan] = useState<ReducingPlan>();

  const { tabKey } = urlTabState;

  const addPlanDisabled = planList.length >= 5;

  const getPlanList = async (opt?: { id?: number; useFirstPlan?: boolean }) => {
    const { useFirstPlan, id } = opt || {};
    const { data } = await getReducingPlanList();
    setPlanList(data.data);

    if (useFirstPlan) {
      setPlan(data.data[0]);
    } else if (!isNil(id)) {
      setPlan(data.data.find(planItem => planItem.id === id));
    }
  };

  const addEditPlan = async (planData: ReducingPlan) => {
    const { id } = planData;
    const reqFunc = isNil(id) ? addReducingPlan : editReducingPlan;
    const { data } = await reqFunc(planData);
    Toast('success', I18N.carbonFootprint.operationSuccessful);
    getPlanList({ id: data.data });
  };

  const deletePlan = (id: number) => {
    Modal.confirm({
      title: I18N.carbonFootprint.confirm,
      content: I18N.enterpriseCarbonAccount2.doYouWantToDeleteThis3,
      onOk: async () => {
        await deleteReducingPlan({ id });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        getPlanList();
      },
    });
  };

  useEffect(() => {
    getPlanList({ useFirstPlan: true });
  }, []);

  return (
    <div className={styles.reducingPlan}>
      <div className={styles.reducingPlanHeader}>
        <div className={styles.reducingPlanOperate}>
          {plan && (
            <div
              className={styles.reducingPlanNameContent}
              onClick={() => setPlanListModalOpen(true)}
            >
              <img src={reducingPlanImg} alt='' />
              <div className={styles.planName}>{plan.name}</div>
              <IconAlibaba
                className={styles.reducingPlanDropdownIcon}
                type='icon-icon_arrow_rioght'
              />
            </div>
          )}
          <div>
            {checkPermissions(
              <ReducingPlanDrawer
                title={I18N.router.editObjective}
                reducingPlan={plan}
                onConfirm={addEditPlan}
              >
                <Button
                  className={styles.editBtn}
                  type='primary'
                  icon={<IconAlibaba type='icon-a-icon_edit' />}
                />
              </ReducingPlanDrawer>,
              'enterprise:plan:edit',
            )}

            {checkPermissions(
              <ReducingPlanDrawer
                title={I18N.enterpriseCarbonAccount2.addTarget}
                disabledText={
                  addPlanDisabled
                    ? I18N.enterpriseCarbonAccount2.addAtMost2
                    : ''
                }
                onConfirm={addEditPlan}
              >
                <Button>
                  <IconAlibaba type='icon-messages_icon_addchat' />
                  <span>{I18N.enterpriseCarbonAccount2.addTarget}</span>
                </Button>
              </ReducingPlanDrawer>,
              'enterprise:plan:add',
            )}
          </div>
        </div>
        <div className={styles.reducingPlanTabs}>
          {Object.values(REDUCING_TAB_KEY).map(key => (
            <div
              className={classNames(styles.reducingPlanTab, {
                [styles.currTab]: tabKey === key,
              })}
              onClick={() =>
                setUrlTabState({
                  tabKey: key,
                  open: undefined,
                  measureId: undefined,
                })
              }
            >
              {REDUCING_TAB[key]}
            </div>
          ))}
        </div>
      </div>
      {plan && (
        <div className={styles.reducingPlanContent}>
          {tabKey === OVERVIEW && (
            <Overview
              reducingPlan={plan}
              changeTab={key => setUrlTabState({ tabKey: key })}
            />
          )}
          {tabKey === TARGET && (
            <ReducingTarget reducingPlan={plan} refreshPlanList={getPlanList} />
          )}
          {tabKey === FORECAST && <ReducingForecast reducingPlan={plan} />}
          {tabKey === REDUCTION_MEASURES && (
            <ReductionMeasures
              reducingPlan={plan}
              changeTab={key => setUrlTabState({ tabKey: key })}
            />
          )}
        </div>
      )}
      <Modal
        title={I18N.enterpriseCarbonAccount2.emissionReductionTargetColumn}
        open={planListModalOpen}
        footer={null}
        onCancel={() => setPlanListModalOpen(false)}
      >
        {planList.map(planItem => {
          const selected = plan?.id === planItem.id;

          return (
            <div
              className={classNames(styles.planItem, {
                [styles.currPlanItem]: selected,
              })}
              key={planItem.id}
              onClick={() => {
                setPlan(planItem);
                setPlanListModalOpen(false);
              }}
            >
              <div>
                <div className={styles.planItemName}>{planItem.name}</div>
                <div className={styles.planItemTarget}>
                  {REDUCING_TARGET_LABEL[planItem.targetSetting]}
                </div>
              </div>
              {selected ? (
                <div className={styles.selectedText}>
                  {I18N.enterpriseCarbonAccount2.currentSelection}
                </div>
              ) : (
                checkPermissions(
                  <IconAlibaba
                    className={styles.deleteIcon}
                    type='icon-icon_delete'
                    onClick={e => {
                      e.stopPropagation();
                      deletePlan(planItem.id);
                    }}
                  />,
                  'enterprise:plan:delete',
                )
              )}
            </div>
          );
        })}
        {checkPermissions(
          <ReducingPlanDrawer
            title={I18N.enterpriseCarbonAccount2.addTarget}
            disabledText={
              addPlanDisabled ? I18N.enterpriseCarbonAccount2.addAtMost2 : ''
            }
            onConfirm={addEditPlan}
          >
            <div
              className={styles.modalAddPlanBtn}
              onClick={() => setPlanListModalOpen(false)}
            >
              <IconAlibaba
                className={styles.modalAddPlanBtnIcon}
                type='icon-messages_icon_addchat'
              />
              <span>{I18N.enterpriseCarbonAccount2.addTarget}</span>
            </div>
          </ReducingPlanDrawer>,
          'enterprise:plan:add',
        )}
      </Modal>
    </div>
  );
};

export default ReducingPlanPage;
