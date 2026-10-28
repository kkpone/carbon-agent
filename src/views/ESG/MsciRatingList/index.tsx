import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import AiImgBg from '@assets/svg/ai_btn_bg.svg';
import AiImg from '@assets/svg/ai_white.svg';
import I18N from '@src/lang/I18N';
import { useInfiniteScroll, useRequest } from 'ahooks';
import { Button, Input, message, Select, Space, Spin } from 'antd';
import { FC, useMemo, useRef, useState } from 'react';

import Empty from '@/components/Empty';
import Permission from '@/components/Permission';
import { getYear } from '@/utils';

import { RatingCard, RatingCardData } from './components/RatingCard';
import { RatingModal } from './components/RatingModal';
import styles from './index.module.less';
import {
  deleteMsciRating,
  extractIndustryData,
  getIndustryData,
  getMsciRatingList,
} from './service';
import { extractMsciListData, MsciReportItem } from './utils';

// MSCI 评级等级（用于筛选器）
const RATING_LEVELS = ['CCC', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA'].reverse();

export interface IMsciRatingListProps {}

export const MsciRatingList: FC<IMsciRatingListProps> = () => {
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 10;

  // 筛选条件
  const [businessName, setBusinessName] = useState<string>('');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [rating, setRating] = useState<string | undefined>(undefined);

  const [editId, setEditId] = useState<number | undefined>(undefined);

  // 获取行业数据
  const { data: industryResponse } = useRequest(getIndustryData);
  const industryData = extractIndustryData(industryResponse);

  // 创建子行业 id 到名称的映射
  const subIndustryMap = useMemo(() => {
    const map = new Map<number | string, string>();
    industryData.forEach(industry => {
      if (industry.children) {
        industry.children.forEach(subIndustry => {
          map.set(subIndustry.id, subIndustry.name);
        });
      }
    });
    return map;
  }, [industryData]);

  // 根据子行业 id 获取名称
  const getSubIndustryName = (id: string | number | undefined): string => {
    if (!id) return '—';
    const name = subIndustryMap.get(Number(id));
    return name || '—';
  };

  // 查询条件
  const [searchBusinessName, setSearchBusinessName] = useState<string>('');
  const [searchYear, setSearchYear] = useState<number | undefined>(undefined);
  const [searchRating, setSearchRating] = useState<string | undefined>(
    undefined,
  );

  const {
    data: ratingListData,
    loading,
    loadingMore,
    reload,
  } = useInfiniteScroll(
    async d => {
      const nextPage = (d?.pageNum || 0) + 1;
      const res = await getMsciRatingList({
        businessName: searchBusinessName,
        period: searchYear,
        rating: searchRating,
        pageNum: nextPage,
        pageSize: PAGE_SIZE,
      });

      const { list, total } = extractMsciListData(res as { data?: any });

      return {
        list,
        total,
        pageNum: nextPage,
      };
    },
    {
      target: scrollRef,
      isNoMore: d => {
        if (!d) return false;
        const listLength = d.list?.length || 0;
        const total = d.total ?? listLength;
        return listLength >= total;
      },
      reloadDeps: [searchBusinessName, searchYear, searchRating],
      manual: false,
    },
  );

  const ratingListResponse = (ratingListData?.list as MsciReportItem[]) || [];

  const toNumber = (value?: string | number) => {
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
  };

  const ratingList: RatingCardData[] = Array.isArray(ratingListResponse)
    ? ratingListResponse.map(item => ({
        id: item?.id || 0,
        businessName:
          item?.orgName || item?.businessName || item?.reportName || '—',
        year: toNumber(item?.period) || new Date().getFullYear(),
        industry: getSubIndustryName(item?.industrySub),
        rating: item?.rating || 'N/A',
        environmentScore: toNumber(item?.environmentalScore),
        socialScore: toNumber(item?.socialScore),
        governanceScore: toNumber(item?.governanceScore),
        // 接口未返回占比，使用得分作为展示占比
        environmentPercent: toNumber(item?.environmentalPercent),
        socialPercent: toNumber(item?.socialPercent),
        governancePercent: toNumber(item?.governancePercent),
      }))
    : [];

  // 查询
  const handleSearch = () => {
    setSearchBusinessName(businessName.trim());
    setSearchYear(year);
    setSearchRating(rating);
  };

  // 重置
  const handleReset = () => {
    setBusinessName('');
    setYear(undefined);
    setRating(undefined);
    setSearchBusinessName('');
    setSearchYear(undefined);
    setSearchRating(undefined);
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await deleteMsciRating({ id });
      message.success(I18N.carbonFootprint.deleteSuccessful);
      reload();
    } catch (error) {
      message.error(I18N.supplyChain2.deleteFailed);
    }
  };

  // 编辑
  const handleEdit = (id: number) => {
    // TODO: 跳转到编辑页面
    // eslint-disable-next-line no-console
    console.log(I18N.carbonFootprint.edit, id);
    setEditId(id);
    setRatingModalOpen(true);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>{I18N.esg.esgRating}</div>
        <Permission flag='/esg/msciRating/create'>
          <div
            className={styles.addAccountBtn}
            onClick={() => setRatingModalOpen(true)}
          >
            <div className={styles.addAccountBtnPrefix}>
              <img alt='' src={AiImgBg} />
              <img className={styles.addAccountBtnAiIcon} alt='' src={AiImg} />
            </div>
            {I18N.carbonFootPrintLCA.rating}
          </div>
        </Permission>
      </div>

      <div className={styles.filterWrapper}>
        <Space size={16}>
          <div className={styles.filterItem}>
            {/* <span className={styles.filterLabel}>企业名称</span> */}
            <Input
              allowClear
              placeholder={I18N.system.pleaseEnterTheCompany}
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className={styles.filterCascader}
            />
          </div>

          <div className={styles.filterItem}>
            {/* <span className={styles.filterLabel}>年份</span> */}
            <Select
              placeholder={I18N.DomesticVersion.pleaseSelectTheYear}
              value={year}
              onChange={setYear}
              allowClear
              className={styles.filterSelect}
              options={getYear(2015, new Date().getFullYear()).map(y => ({
                label: y.toString(),
                value: y,
              }))}
            />
          </div>

          <div className={styles.filterItem}>
            {/* <span className={styles.filterLabel}>评级</span> */}
            <Select
              placeholder={I18N.esg.pleaseSelectRating}
              value={rating}
              allowClear
              onChange={setRating}
              className={styles.filterSelect}
              options={RATING_LEVELS.map(r => ({
                label: r,
                value: r,
              }))}
            />
          </div>

          <Button
            type='primary'
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            {I18N.carbonNeutral.query}
          </Button>

          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            {I18N.carbonFootprint3.reset}
          </Button>
        </Space>
      </div>

      <Spin spinning={loading && !ratingListData}>
        <div
          className={styles.content}
          ref={scrollRef}
          style={{ height: 'calc(100vh - 160px)', overflowY: 'auto' }}
        >
          {ratingList.length === 0 ? (
            <Empty />
          ) : (
            <div className={styles.cardGrid}>
              {ratingList.map(item => (
                <RatingCard
                  key={item.id}
                  data={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
              {loadingMore && (
                <div className={styles.loadingMore}>
                  {I18N.components.loading}
                </div>
              )}
            </div>
          )}
        </div>
      </Spin>

      {ratingModalOpen && (
        <RatingModal
          open={ratingModalOpen}
          editId={editId}
          onCancel={() => {
            setEditId(undefined);
            setRatingModalOpen(false);
          }}
          onConfirm={async () => {
            // TODO: 处理提交逻辑
            // eslint-disable-next-line no-console
            // console.log('提交数据', data);
            // message.success('提交成功');
            setEditId(undefined);
            setRatingModalOpen(false);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default MsciRatingList;
