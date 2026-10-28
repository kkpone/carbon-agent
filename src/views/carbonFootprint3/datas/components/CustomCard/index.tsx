import { RightOutlined } from '@ant-design/icons';
import carbonCoin from '@src/assets/svg/accountProductImg.svg';
import I18N from '@src/lang/I18N';
import { Dropdown, MenuProps } from 'antd';
import classNames from 'classnames';
import { FC } from 'react';

import style from './index.module.less';
import TextWidthOverflow from '../../../component/TextOverflowTable/byWidth';
import { ProductData } from '../../Compare/types';

interface CustomCardProps {
  info: ProductData;
  onDelete: () => void;
  onDetail: () => void;
}

const CustomCard: FC<CustomCardProps> = props => {
  const { info, onDelete, onDetail } = props;

  const items: MenuProps['items'] = [
    {
      key: '2',
      label: I18N.carbonFootprint3.details,
    },
    {
      key: '3',
      label: I18N.carbonFootprint.delete,
    },
  ];

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === '2') {
      onDetail();
    } else if (key === '3') {
      onDelete();
    }
  };

  return (
    <div
      className={classNames(style.customCard, {
        [style.disabledCard]: info.accountCompareStatus === 0,
      })}
    >
      <div
        className={classNames(style.header, {
          [style.disabledCard]: info.accountCompareStatus === 0,
        })}
      >
        <div className={style.left}>
          <div className={style.imgWrapper}>
            <img
              className={style.img}
              src={info.productPic || carbonCoin}
              alt=''
            />
          </div>
          <div className={style.Title}>
            <TextWidthOverflow width={150} value={info.accountName} />
          </div>
          <div className={style.Subtitle}>{info.emissionTotal} kgCO₂e</div>
        </div>
        <div className={style.line} />
        <div className={style.right}>
          <div className={style.imgWrapper}>
            <img
              className={style.img}
              src={info.productPicCompare || carbonCoin}
              alt=''
            />
          </div>
          <div className={style.Title}>
            <TextWidthOverflow width={150} value={info.accountNameCompare} />
          </div>
          <div className={style.Subtitle}>
            {info.emissionTotalCompare} kgCO₂e
          </div>
        </div>
      </div>
      <div className={style.link} onClick={() => onDetail()}>
        <span>{I18N.carbonFootprint3.viewComparisonDetails}</span>
        <RightOutlined />
      </div>
      <div className={style.vs}>VS</div>
      <div className={style.menu}>
        <Dropdown menu={{ items, onClick }}>
          <span>...</span>
        </Dropdown>
      </div>
      {info.accountCompareStatus === 0 && (
        <div className={style.disabled}>
          <div className={style.disabledText}>
            {I18N.carbonFootprint3.productComparisonHasBeenMade}
          </div>
          <div
            className={classNames(style.disabledText, style.delete)}
            onClick={() => onDelete()}
          >
            {I18N.carbonFootprint.delete}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCard;
