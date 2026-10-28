/**
 * @description: 全局共用hooks
 */
import html2canvas from 'html2canvas';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSearchParams } from '@/utils/polyfill';

import { getSystemOrgUserList, OrgPojo } from '@/sdks/systemV2ApiDocs';

// import { getEnumsApi } from '@/api/compution';
import I18N from '@/lang/I18N';
import { PageTypeInfo } from '@/router/utils/enums';
// import { getComputationEnumsEnumName } from '@/sdks/computation/computationV2ApiDocs';
// import { EnumResp, getSystemEnumsEnumName } from '@/sdks/systemV2ApiDocs';
import { Toast, getSearchParams } from '@/utils';
import { listALLByDictTypeBatch } from '@/api/api';

export type Dicts = {
  dictLabel: string;
  dictValue: string;
  sourceType: string;
  dictSort: number;
  id: null;
  sourceName: null | string;
  relatedValue: null | string;
  dictType: string;
};

//  获取字段翻译
//  获取语言字段
// 项目管理 审核状态
export const usePageNumberInfo = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageNum = Number(searchParams.get('pageNum')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const getParamsByKeys = useCallback(
    (keys?: (string | number | undefined | symbol)[]) => {
      if (!keys) return {};
      return keys.reduce((prev, cur) => {
        const searchParamsValueArr = searchParams.getAll(String(cur));
        if (cur && searchParamsValueArr && searchParamsValueArr.length === 1) {
          return {
            ...prev,
            [cur]: searchParams.get(String(cur)),
          };
        }
        if (cur && searchParamsValueArr && searchParamsValueArr.length > 1) {
          return {
            ...prev,
            [cur]: searchParamsValueArr,
          };
        }
        return prev;
      }, {});
    },
    [],
  );
  return {
    pageNum,
    pageSize,
    getParamsByKeys,
    setSearchParams,
  };
};

type PageInfoType = {
  isAdd: boolean;
  isEdit: boolean;
  isDetail: boolean;
  id: number;
  [property: string]: any;
};

/** echarts图片下载方法 */
export const useDownloadHandler = (fileName: () => string, id: string) => {
  const handleDownload = useRef(
    debounce(() => {
      const element = document.getElementById(id);
      if (element) {
        html2canvas(element, { scale: 2 })
          .then(canvas => {
            // 将Canvas转换为图像URL
            const imageURL = canvas.toDataURL('image/png');
            // 创建一个隐藏的<a>标签，并设置下载属性
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = `${fileName?.()}.png`;
            // 模拟点击链接以触发下载
            link.click();
          })
          .catch(() => {
            Toast('error', I18N.carbonData.downloadFailed);
          });
      }
    }, 500),
  ).current;

  return handleDownload;
};

/**
 * @description 获取页面信息
 */
export const usePageInfo = (): PageInfoType => {
  const { pageTypeInfo, id } = useParams<{
    pageTypeInfo: PageTypeInfo;
    id: string;
  }>();
  const search = { ...getSearchParams()[0] };
  return {
    ...search,
    isAdd: pageTypeInfo === PageTypeInfo.add,
    isEdit: pageTypeInfo === PageTypeInfo.edit,
    isDetail: pageTypeInfo === PageTypeInfo.show,
    id: Number(search?.id || id),
  };
};

/** 获取用户下的所有组织 */
export const useOrgs = () => {
  const [orgs, setOrgs] = useState<OrgPojo[]>([]);
  useEffect(() => {
    getSystemOrgUserList({}).then(({ data }) => {
      setOrgs(data?.data || []);
    });
  }, []);
  return orgs;
};

/** 批量获取枚举值 */
export const useAllEnumsBatch = <T = Record<string, Dicts[]>>(
  dictTypes?: string,
) => {
  const [dict, setDict] = useState<T>();
  useEffect(() => {
    if (dictTypes)
      listALLByDictTypeBatch({ dictTypes }).then(({ data }) => {
        setDict(data?.data as T | undefined);
      });
  }, [location.pathname, dictTypes]);
  return dict;
};
