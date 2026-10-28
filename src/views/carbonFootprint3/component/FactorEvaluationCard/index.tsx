import { RightOutlined } from '@ant-design/icons';
import AIIcon from '@src/assets/images/carbonFootprint3.6.4/AIIcon.png';
import I18N from '@src/lang/I18N';
import { QuickBusinessAccountingSource } from '@src/views/carbonFootprint3/QuickBusinessAccounting/type';
import { Button } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import styles from './index.module.less';
import { getFactorEvaluation } from './service';
import FactorEvaluationModal from '../FactorEvaluationModal';

export interface FactorEvaluationCardProps {
  /**
   * 与排放源新增/编辑接口一致的 body 参数对象（Partial）。
   * 选择因子时由 factorObj.id 触发；手动填写时由 factorObj.name/institution/year 触发。
   * 为空或因子数据为空时不展示卡片。
   */
  params: Partial<QuickBusinessAccountingSource> | null | undefined;
  className?: string;
}

/** 生成触发请求的稳定 key：优先取 id，手动填写时取 name|institution|year 组合 */
const buildTriggerKey = (
  params: Partial<QuickBusinessAccountingSource> | null | undefined,
): string => {
  const fo = params?.factorObj;
  if (!fo) return '';
  if (fo.id) return String(fo.id);
  if (fo.name)
    return `${fo.name ?? ''}|${fo.institution ?? ''}|${fo.year ?? ''}`;
  return '';
};

const withRouteAccountId = (
  params: Partial<QuickBusinessAccountingSource> | null | undefined,
  search: string,
) => {
  if (!params) return null;
  if (params.accountId) return params;

  const accountId = new URLSearchParams(search).get('accountId') ?? undefined;

  return accountId ? { ...params, accountId } : params;
};

const FactorEvaluationCard: FC<FactorEvaluationCardProps> = ({
  params,
  className,
}) => {
  const location = useLocation();
  const evaluationParams = useMemo(
    () => withRouteAccountId(params, location.search),
    [location.search, params],
  );
  const triggerKey = buildTriggerKey(evaluationParams);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<string[] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const requestIdRef = useRef(0);

  // 切换因子时清空旧评价，并使进行中的旧请求失效
  useEffect(() => {
    requestIdRef.current += 1;
    setItems(null);
    setModalVisible(false);
    setLoading(false);

    return () => {
      requestIdRef.current += 1;
    };
  }, [triggerKey]);

  const handleLoadEvaluation = async () => {
    if (!triggerKey || loading) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const res = await getFactorEvaluation(evaluationParams ?? {});
      if (requestId !== requestIdRef.current) return;
      setItems(res.data.data ?? null);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setItems(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  if (!triggerKey) return null;

  const hasDetails = Boolean(items?.length);

  return (
    <>
      <div className={classNames(styles.wrapper, className)}>
        <div
          className={styles.card}
          data-has-details={hasDetails}
          onClick={() => hasDetails && setModalVisible(true)}
        >
          <div className={styles.left}>
            <div className={styles.header}>
              <span className={styles.title}>
                {I18N.carbonFootprint3.factorEvaluation}
              </span>
              <img src={AIIcon} alt='AI' className={styles.aiIcon} />
            </div>
            {items && items.length > 0 ? (
              <div className={styles.itemList}>
                {items.map((item, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index} className={styles.itemRow} title={item}>
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {hasDetails ? (
            <div className={styles.arrow}>
              <RightOutlined />
            </div>
          ) : (
            <Button
              type='link'
              size='small'
              loading={loading}
              className={styles.loadButton}
              onClick={async event => {
                event.stopPropagation();
                await handleLoadEvaluation();
              }}
            >
              {I18N.carbonFootprint3.loadFactorEvaluation}
            </Button>
          )}
        </div>
      </div>
      {items?.length ? (
        <FactorEvaluationModal
          visible={modalVisible}
          items={items}
          onClose={() => setModalVisible(false)}
        />
      ) : null}
    </>
  );
};

export default FactorEvaluationCard;
