import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Input, Modal, Spin } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';

import { IconAlibaba } from '@/components/iconfont';
import CarbonFootprintModel from '@/views/subModules/CarbonFootprintModel';

import style from './index.module.less';
import { getSelectModelList, getSelectModelmenu } from './service';
import {
  SelectModelListData,
  SelectModelListParams,
  SelectModelMenu,
} from './type';
import TextWidthOverflow from '../../component/TextOverflowTable/byWidth';
import {
  ACCOUNT_SELECT_LIFE_CYCLE_LABEL,
  FootprintAccountStatusType,
} from '../constant';

type Props = {
  visible: boolean;
  onModelUse: (modelInfo: SelectModelListData) => void;
  onCancel: () => void;
};

const defaultMenu = '999';

const { QUICK } = FootprintAccountStatusType;

// const accountType = [
//   {
//     name: I18N.carbonFootprint3.whole,
//     value: undefined,
//   },
//   {
//     name: I18N.carbonFootprint3.quickAccounting,
//     value: QUICK as number,
//   },
//   {
//     name: I18N.carbonFootprint3.processAccounting,
//     value: PROCESS as number,
//   },
// ];

const SelectModel: FC<Props> = ({ visible, onModelUse, onCancel }) => {
  /** 查询条件 */
  const [searchParams, serSearchParams] = useState<SelectModelListParams>({
    pageNum: 1,
    pageSize: 10,
  });

  const [loading, setLoading] = useState<boolean>(false);

  /** 模型弹框显示隐藏 */
  const [modelDetailvisible, setModelDetailvisible] = useState<boolean>(false);

  /** 模型详情 */
  const [modelInfo, setModelInfo] = useState<SelectModelListData>();

  /** 搜索模型的输入框 */
  const [searchInput, setSearchInput] = useState<string>();

  /** 查询的条件 */
  const [modelList, setModelList] = useState<SelectModelListData[]>([]);

  const [, setMenuData] = useState<ItemType[]>([]);

  /** 行业列表数据 */
  const [businessData, setBusinessData] = useState<SelectModelMenu[]>([]);

  /** 当前选中的行业 */
  const [activeBusiness, setActiveBusiness] = useState<SelectModelMenu>({
    name: I18N.carbonFootprint3.recommendation,
    code: defaultMenu,
    codeArr: defaultMenu,
  });

  /** 选择的核算类型 */
  // const [activeType, setActiveType] = useState<number>();

  /**
   * @description: 搜索模型
   */
  const searchModel = async () => {
    serSearchParams({
      pageNum: 1,
      pageSize: 10,
      modelName: searchInput,
    });
  };

  /**
   * @description: 获取模型列表
   */
  const getModelList = async () => {
    setLoading(true);
    const data = await getSelectModelList({
      ...searchParams,
      // type: activeType,
    });

    setModelList(data.data.data);
    setLoading(false);
  };

  /**
   * @description: 获取菜单
   */
  const getMenus = async () => {
    const { data } = await getSelectModelmenu();
    const backData = data.data.map(menu => ({
      label: menu.name,
      key: menu.codeArr,
    }));
    setBusinessData([
      {
        name: I18N.carbonFootprint3.recommendation,
        code: defaultMenu,
        codeArr: defaultMenu,
      },
      ...data.data,
    ]);
    setMenuData([
      { label: I18N.carbonFootprint3.recommendation, key: defaultMenu },
      ...backData,
    ]);
  };

  const clickMenus = (key: string) => {
    // 全部 去掉行业
    if (key === '999') {
      serSearchParams({
        ...searchParams,
        industry: undefined,
      });
      return;
    }

    serSearchParams({
      ...searchParams,
      industry: key,
    });
  };

  /**
   * 预览模型
   * @param info 模型详情
   */
  const previewModel = (info: SelectModelListData) => {
    setModelDetailvisible(true);
    setModelInfo(info);
  };

  const getBtnIcon = (business: SelectModelMenu) => {
    if (business.codeArr === defaultMenu) {
      if (activeBusiness.codeArr === business.codeArr) {
        return (
          <img
            className={style.businessBtnIcon}
            src='https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/carbonFootprint/BussinessRecommendActive.png'
            alt={I18N.carbonFootprint3.recommendation}
          />
        );
      }
      return (
        <img
          className={style.businessBtnIcon}
          src='https://carbonstop-saas.oss-cn-beijing.aliyuncs.com/carbonFootprint/BussinessRecommend.png'
          alt={I18N.carbonFootprint3.recommendation}
        />
      );
    }
    return undefined;
  };

  useEffect(() => {
    getModelList();
  }, [searchParams]);

  useEffect(() => {
    getMenus();
  }, []);

  useEffect(() => {
    setModelDetailvisible(false);
  }, [visible]);
  return (
    <>
      <Modal
        className={style.selectModelDiv}
        title={I18N.carbonFootprint3.selectModel}
        visible={visible}
        width={1200}
        style={{ top: 50 }}
        onCancel={onCancel}
        destroyOnClose
        footer={null}
      >
        <div style={{ background: ' #f7f8f9', borderRadius: 8 }}>
          <div className={style.selectModelContent}>
            <div className={style.businessMain}>
              {businessData.map(business => (
                <Button
                  icon={getBtnIcon(business)}
                  type={
                    activeBusiness.code === business.code ? 'primary' : 'text'
                  }
                  className={classNames(style.businessBtn, {
                    [style.businessBtnActive]:
                      business.code === activeBusiness.code,
                  })}
                  onClick={() => {
                    setActiveBusiness(business);
                    clickMenus(business.code);
                  }}
                >
                  <TextWidthOverflow value={business.name} width={120} />
                </Button>
              ))}
            </div>
            <div className={style.splitLine} />
            <div className={style.selectFiltrMain}>
              <div className={style.typeFiltr}>
                {/* {accountType.map(type => (
                  <span
                    className={classNames(style.everyType, {
                      [style.everyTypeActive]: activeType === type.value,
                    })}
                    onClick={() => {
                      setActiveType(type.value);
                    }}
                  >
                    {type.name}
                  </span>
                ))} */}
              </div>
              <div>
                <Input
                  allowClear
                  suffix={<SearchOutlined />}
                  onChange={event => setSearchInput(event.target.value)}
                  onBlur={searchModel}
                  style={{ width: 300 }}
                  placeholder={I18N.carbonFootprint3.searchModel}
                />
              </div>
            </div>
          </div>
          <Spin spinning={loading}>
            <div className={style.selectModelData}>
              {modelList.map(data => (
                <div className={style.everyList}>
                  <div className={style.modelNameRow}>
                    <IconAlibaba
                      type='icon-icon_model'
                      className={style.listNameIcon}
                    />
                    <span className={style.listNameText} title={data.modelName}>
                      {data.modelName}
                    </span>
                  </div>
                  <div className={style.listDetail}>
                    <div className={style.detail}>{data.accountName}</div>
                    <div className={style.detail}>
                      {data.type === QUICK
                        ? I18N.carbonFootprint3.quickAccounting
                        : I18N.carbonFootprint3.processAccounting}
                    </div>
                    <div className={style.detail}>
                      {ACCOUNT_SELECT_LIFE_CYCLE_LABEL[data.scope]}
                    </div>
                  </div>
                  <div className={style.listIntro}>{data.intro}</div>
                  <div className={style.setBtnMain}>
                    <Button
                      className={style.preview}
                      onClick={() => {
                        previewModel(data);
                      }}
                    >
                      {I18N.carbonFootprint3.preview}
                    </Button>
                    <Button
                      type='primary'
                      className={style.btnUse}
                      onClick={() => {
                        onModelUse(data);
                      }}
                    >
                      {I18N.carbonFootprint3.apply}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Spin>
        </div>
      </Modal>

      {modelInfo && modelDetailvisible && (
        <Modal
          className={style.modelInfoMain}
          visible={modelDetailvisible}
          title={undefined}
          onCancel={() => {
            setModelDetailvisible(false);
          }}
          style={{ top: 20 }}
          footer={null}
          maskClosable={false}
          closable={false}
        >
          <div style={{ borderRadius: 8 }}>
            <Button
              className={style.modelInfoSubBtn}
              type='primary'
              onClick={() => {
                onModelUse(modelInfo);
              }}
            >
              {I18N.carbonFootprint3.apply}
            </Button>
            <CarbonFootprintModel
              readPretty
              backFunc={() => {
                setModelDetailvisible(false);
              }}
              info={
                modelInfo
                  ? {
                      ...modelInfo,
                      industry: JSON.parse(modelInfo.industry) as string[][],
                    }
                  : undefined
              }
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default SelectModel;
