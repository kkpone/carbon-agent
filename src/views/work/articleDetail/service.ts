import { request } from '@api/request';

type ArticleLabel = {
  id: number; // 文章 id
  icon: string;
  cname: string;
};
type ArticleInfo = {
  id: number; // 文章 id
  title: string;
  titleOther: string;
  content: string;
  auth: null;
  orderNum: number;
  imageLocation: string;
  jumpUrl: string;
  herfUrl: string;
  path: string;
  describes: string;
  imageUrl: string;
  buttonText: null;
  remark: string;
  otherImgUrl: null;
  imageUrlH5: string;
  articleLabel: string;
  showPage: string;
  contentType: string;
  industry: string;
  publishTime: string;
  modelType: number;
  isOnline: number;
  reportUrl: null;
  articleLabelList: ArticleLabel[];
};
// 获取文章详情
export const getArticleDetail = async (params: { id: string }) =>
  request<{ data: ArticleInfo }>({
    method: 'GET',
    url: `/management/websiteArticle/detail`,
    params,
  });
