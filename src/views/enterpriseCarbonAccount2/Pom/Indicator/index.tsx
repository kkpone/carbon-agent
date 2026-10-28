import { PlusCircleFilled } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import classNames from 'classnames';
import { FC, useState } from 'react';

import { checkPermissions } from '@/components/Permission/utils';
import { IconAlibaba } from '@/components/iconfont';
import { Toast } from '@/utils/Toast';

import styles from './index.module.less';
import IndicatorModal from '../IndicatorModal';
import { deleteOperateIndicator } from '../service';
import { OperateIndicator } from '../type';

const Indicator: FC<{
  selectedIndicator?: OperateIndicator;
  indicatorList: OperateIndicator[];
  queryIndicatorList: (opt?: { useFirst?: boolean }) => void;
  onClick: (indicator: OperateIndicator) => void;
}> = ({ selectedIndicator, indicatorList, queryIndicatorList, onClick }) => {
  const [indicatorModalVisible, setIndicatorModalVisible] = useState(false);

  const [editIndicator, setEditIndicator] = useState<OperateIndicator | null>(
    null,
  );

  const addEditIndicator = (indicator?: OperateIndicator) => {
    if (indicator) {
      setEditIndicator(indicator);
    } else if (indicatorList.length >= 10) {
      Toast('warn', I18N.enterpriseCarbonAccount2.addAtMost3);
      return;
    }

    setIndicatorModalVisible(true);
  };
  const deleteIndicator = (indicator: OperateIndicator) => {
    Modal.confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(
        I18N.enterpriseCarbonAccount2.confirmDeletionOfThis3,
        { val1: indicator.name },
      ),
      onOk: async () => {
        await deleteOperateIndicator({ id: indicator.id });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        queryIndicatorList({
          useFirst: indicator.id === selectedIndicator?.id,
        });
      },
    });
  };

  const onIndicatorModalCancel = () => {
    setIndicatorModalVisible(false);
    setEditIndicator(null);
  };

  const onIndicatorModalSuccess = () => {
    onIndicatorModalCancel();
    queryIndicatorList();
  };

  return (
    <div className={styles.indicatorContent}>
      {indicatorList.map(indicator => {
        const { preset, id, name, unitName, year, totalValue } = indicator;

        const isPreset = !preset;
        return (
          <div
            className={classNames(styles.indicator, {
              [styles.selectedIndicator]:
                indicator.id === selectedIndicator?.id,
            })}
            key={id}
            onClick={() => onClick(indicator)}
          >
            <div className={styles.indicatorItem}>
              <div className={styles.indicatorInfo}>
                <IconAlibaba type='icon-icon_index2' />
                <div
                  className={styles.indicatorName}
                  title={`${name}（${unitName}）`}
                >
                  {name}（{unitName}）
                </div>
              </div>
              <div className={styles.indicatorYear}>{year}</div>
            </div>
            <div className={styles.indicatorItem}>
              <div className={styles.indicatorValue}>‌{totalValue}</div>
              <div className={styles.indicatorOperate}>
                {!isPreset &&
                  checkPermissions(
                    <>
                      <IconAlibaba
                        type='icon-a-icon_edit'
                        onClick={e => {
                          e.stopPropagation();
                          addEditIndicator(indicator);
                        }}
                      />
                      <IconAlibaba
                        type='icon-icon_delete'
                        onClick={e => {
                          e.stopPropagation();
                          deleteIndicator(indicator);
                        }}
                      />
                    </>,
                    'enterprise:operate:v2:edit',
                  )}
              </div>
            </div>
          </div>
        );
      })}
      {indicatorList.length < 10 &&
        checkPermissions(
          <div
            className={styles.addIndicator}
            onClick={() => addEditIndicator()}
          >
            <PlusCircleFilled />
            <div>{I18N.enterpriseCarbonAccount2.addIndicators}</div>
          </div>,
          'enterprise:operate:v2:edit',
        )}
      <IndicatorModal
        visible={indicatorModalVisible}
        indicator={editIndicator}
        onCancel={onIndicatorModalCancel}
        onSuccess={onIndicatorModalSuccess}
      />
    </div>
  );
};

export default Indicator;
