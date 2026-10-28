import I18N from '@src/lang/I18N';
import {
  ClockCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Dropdown, Modal, Tooltip } from 'antd';

import { IconAlibabaNew } from '@/components/iconfont';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL,
} from '@/views/carbonFootprint3/FootprintAccount/constant';

import CustomModelIcon from './customModel.svg';
import style from './index.module.less';
import SystemModelIcon from './systemModel.svg';
import { MODEL_SOURCE_LABEL, ModelItem, ModelSourceEnum } from '../../type';

const { confirm } = Modal;

interface ModelCardProps {
  item: ModelItem;
  onEdit: (item: ModelItem) => void;
  onCopy: (item: ModelItem) => void;
  onDelete: (item: ModelItem) => void;
  onViewInfo: (item: ModelItem) => void;
  onCreateAccounting: (item: ModelItem) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  item,
  onEdit,
  onCopy,
  onDelete,
  onViewInfo,
  onCreateAccounting,
}) => {
  const isSystem = item.source === ModelSourceEnum.SYSTEM;
  const updateLabel = item.updateTime ?? '—';

  const menuItems = [
    {
      key: 'copy',
      label: I18N.router.copyModel,
      icon: <CopyOutlined />,
      onClick: () => onCopy(item),
    },
    {
      key: 'delete',
      label: I18N.carbonFootprint3.deleteModel,
      icon: <DeleteOutlined />,
      danger: true,
      disabled: isSystem,
      onClick: () => {
        confirm({
          title: I18N.carbonFootPrintLCA.confirmDeletion,
          content: I18N.template(
            I18N.carbonFootprint3.confirmToDeleteTheModel2,
            { val1: item.modelName },
          ),
          okText: I18N.base.confirm,
          cancelText: I18N.carbonFootprint.cancel,
          okButtonProps: { danger: true },
          onOk: () => onDelete(item),
        });
      },
    },
  ];

  return (
    <div className={style.card} onClick={() => onEdit(item)}>
      <div className={style.productInfo}>
        <div className={style.iconWrapper}>
          {isSystem ? (
            <img
              src={SystemModelIcon}
              alt={I18N.carbonFootprint3.systemModel}
            />
          ) : (
            <img
              src={CustomModelIcon}
              alt={I18N.carbonFootprint3.customModel}
            />
          )}
        </div>
        <div className={style.infoArea}>
          <div className={style.nameRow}>
            <span className={style.modelName} title={item.modelName}>
              {item.modelName}
            </span>
            <div className={style.actions} onClick={e => e.stopPropagation()}>
              <IconAlibabaNew
                type='icon-icon-bianjiyinzi'
                className={style.actionBtn}
                onClick={() => {
                  onViewInfo(item);
                }}
              />
              <PlusOutlined
                className={style.actionBtn}
                onClick={() => onCreateAccounting(item)}
              />
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <span className={style.actionBtn}>
                  <MoreOutlined />
                </span>
              </Dropdown>
            </div>
          </div>
          <div
            className={`${style.sourceTag} ${
              isSystem ? style.system : style.custom
            }`}
          >
            {MODEL_SOURCE_LABEL[item.source]}
          </div>
          <div className={style.timeRow}>
            <ClockCircleOutlined className={style.timeIcon} />
            <span>{updateLabel}</span>
          </div>
        </div>
      </div>

      <div className={style.divider} />

      <div className={style.cardBottom}>
        <div className={style.detailCol}>
          <span className={style.detailLabel}>
            {I18N.carbonFootprint3.industryCategory}
          </span>
          <Tooltip title={item.industryNames}>
            <span className={`${style.detailValue} ${style.detailValueMuted}`}>
              {item.industryNames || '—'}
            </span>
          </Tooltip>
        </div>
        <div className={style.detailCol}>
          <span className={style.detailLabel}>
            {I18N.carbonFootprint3.accountingMethod}
          </span>
          <span className={style.detailValue}>
            {FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL[item.type]}
          </span>
        </div>
        <div className={style.detailCol}>
          <span className={style.detailLabel}>
            {I18N.carbonFootprint.systemBoundary}
          </span>
          <span className={style.detailValue}>
            {ACCOUNT_SELECT_LIFE_CYCLE_LABEL[item.scope]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
