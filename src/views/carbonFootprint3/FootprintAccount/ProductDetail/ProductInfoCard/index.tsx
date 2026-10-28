/* eslint-disable @typescript-eslint/no-unused-vars */
/** 碳足迹详情 - 左侧card - 产品信息 */
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import defaultImg from '@src/assets/svg/accountProductImg.svg';
import IconFont, { IconAlibabaNew } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { SubAccountProductFormData } from '@src/views/carbonFootprint3/component/FormAccountProductDrawer/type';
import TextWidthOverflow from '@src/views/carbonFootprint3/component/TextOverflowTable/byWidth';
import { haveProductEditPermissions } from '@src/views/carbonFootprint3/permissions';
import { AddFileDataAndUid } from '@src/views/carbonFootprint3/type';
import { Image, Spin } from 'antd';
import classNames from 'classnames';
import { FC, memo, useState } from 'react';

import ProductModal from '@/views/carbonFootprint3/component/ProductModal';

import { AccountProductIdNext } from '../../constant';
import { postAccountProductEditData } from '../../service';
import { AccountProductData } from '../../type';
import style from '../index.module.less';

type Props = {
  isStartList: string;
  isEndList: string;
  loading: boolean;
  info?: AccountProductData;
  changeProductInfo: (status: AccountProductIdNext) => void;
  eidtSubForm: () => void;
  backList: () => void;
  accountUnitName?: string;
};

export const ProductInfoCard: FC<Props> = memo(
  ({
    info,
    loading,
    isStartList,
    isEndList,
    changeProductInfo,
    eidtSubForm,
    backList,
    accountUnitName,
  }) => {
    /**
     * 获取产品生产工艺图
     * @param files 接口上的files
     * @returns 返回ReactNode
     */
    const getFilesImg = (files?: AddFileDataAndUid[]) =>
      files && files.length > 0 ? (
        <Image.PreviewGroup>
          {files.map(file => (
            <Image
              key={file.id}
              width={56}
              height={56}
              style={{ borderRadius: 4 }}
              src={file.url}
            />
          ))}
        </Image.PreviewGroup>
      ) : (
        '-'
      );

    const [productModalOpen, setProductModalOpen] = useState(false);

    /**
     * 编辑产品
     * @param data 表单返回值
     */
    const subForm = async (data: SubAccountProductFormData) => {
      if (info) {
        await postAccountProductEditData({
          ...data,
        });
        Toast('success', I18N.carbonFootprint.editSuccessful);
        eidtSubForm();
        setProductModalOpen(false);
      }
    };

    /**
     * 点击编辑产品按钮
     */
    const editProducClick = () => {
      setProductModalOpen(true);
    };

    return (
      <div className={style.ProductInfoCardMain}>
        <ProductModal
          id={info?.id}
          open={productModalOpen}
          onCancel={() => setProductModalOpen(false)}
          onConfirm={subForm}
        />
        <div className={style.ProductInfoCard}>
          <div className={style.infoBackMain}>
            <div className={style.backTitle} onClick={backList}>
              <IconFont
                className={style.backTitleIcon}
                type='icon-icon-shangyiye'
              />
              <span className={style.backTitleText}>
                {I18N.carbonFootprint3.productInformation}
              </span>
            </div>
            {haveProductEditPermissions() && (
              <div onClick={editProducClick} className={style.editMain}>
                <IconAlibabaNew
                  className={style.editMainIcon}
                  type='icon-account-edit'
                />
                <span className={style.editMainTitleText}>
                  {I18N.carbonFootprint.edit}
                </span>
              </div>
            )}
          </div>
          <Spin spinning={loading}>
            <Image
              rootClassName={style.infoBanner}
              preview={{ getContainer: false }}
              src={info?.productPic || defaultImg}
              onClick={e => {
                e.stopPropagation();
              }}
            />

            <div className={style.detailMain}>
              <div className={style.productInfo}>
                <div className={style.productInfoLabel}>
                  {I18N.carbonFootprint.productName}
                </div>
                <div className={style.productInfoValue}>
                  {info?.productName}
                </div>
              </div>
              <div className={style.productInfoRow}>
                <div className={style.productInfo}>
                  <div className={style.productInfoLabel}>
                    {I18N.carbonFootprint3.specificationAndModel}
                  </div>
                  <div
                    className={style.productInfoValue}
                    title={info?.specification}
                  >
                    {info?.specification}
                  </div>
                </div>
                <div className={style.productInfo}>
                  <div className={style.productInfoLabel}>
                    {I18N.carbonFootprint.productCode}
                  </div>
                  <div
                    className={style.productInfoValue}
                    title={info?.productCode}
                  >
                    {info?.productCode}
                  </div>
                </div>
              </div>
              <div className={style.productInfoRow}>
                <div className={style.productInfo}>
                  <div className={style.productInfoLabel}>
                    {I18N.carbonFootprint.unit}
                  </div>
                  <div
                    className={style.productInfoValue}
                    title={`${info?.accountUnitName || '-'}`}
                  >
                    {info?.accountUnitName || '-'}
                  </div>
                </div>
                <div className={style.productInfo}>
                  <div className={style.productInfoLabel}>
                    {I18N.carbonFootprint3.productWeight}
                  </div>
                  <div
                    className={style.productInfoValue}
                    title={`${info?.perWeight || '-'}${
                      info?.perUnitName || '-'
                    }`}
                  >
                    {`${info?.perWeight || '-'}${info?.perUnitName || '-'}`}
                  </div>
                </div>
              </div>
              <div className={style.productInfo}>
                <div className={style.productInfoLabel}>
                  {I18N.carbonFootprint3.productProductionWorker}
                </div>
                <div className={style.imgGroup}>{getFilesImg(info?.files)}</div>
              </div>
              <div className={style.productInfo}>
                <div className={style.productInfoLabel}>
                  {I18N.carbonFootprint3.productionProcessDescription}
                </div>
                <div className={style.productInfoValue}>
                  {info?.techDesc || '-'}
                </div>
              </div>
              <div className={style.productInfo}>
                <div className={style.productInfoLabel}>
                  {I18N.carbonFootprint3.productDescription}
                </div>
                <div className={style.productInfoValue}>
                  {info?.productDesc || '-'}
                </div>
              </div>
            </div>
          </Spin>
        </div>
        <div className={style.infoFooter}>
          <div
            className={classNames(style.back, style.infoFooterEvery, {
              [style.infoFooterEveryNoStatus]: isStartList === 'true',
            })}
            onClick={() => {
              if (isStartList === 'true') return;
              changeProductInfo(AccountProductIdNext.BACK);
            }}
          >
            <LeftOutlined className={style.infoFooterIcon} />
            <span className={style.infoFooterText}>
              {I18N.carbonFootprint3.previous}
            </span>
          </div>
          <div
            className={classNames(style.next, style.infoFooterEvery, {
              [style.infoFooterEveryNoStatus]: isEndList === 'true',
            })}
            onClick={() => {
              if (isEndList === 'true') return;
              changeProductInfo(AccountProductIdNext.NEXT);
            }}
          >
            <span className={style.infoFooterText}>
              {I18N.carbonFootprint3.next}
            </span>
            <RightOutlined className={style.infoFooterIcon} />
          </div>
        </div>
      </div>
    );
  },
);
