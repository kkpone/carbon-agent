import { useContext, useLayoutEffect, useState } from 'react';
import { LEVEL_COLOR, provinceWithPath } from '../constant';
import { ProvinceLevel } from '../type';
import styles from './index.module.less';
import { LocaleContext } from '@/components/LocaleProvider';
import { LocaleType } from '@/lang/I18N';

export default function Map({
  provinceLevelList,
  onMapClick,
}: {
  provinceLevelList: ProvinceLevel[];
  onMapClick: (areaCode: number) => void;
}) {
  const [provincePaths, setProvincePaths] = useState(provinceWithPath);

  const { locale } = useContext(LocaleContext);

  useLayoutEffect(() => {
    const svgEle = document.getElementById('mapSvg');
    provinceLevelList.forEach(({ areaCode, level }) => {
      const code = Number(areaCode);
      const elements = svgEle?.querySelectorAll(`[data-code='${code}']`);
      const color = LEVEL_COLOR[level];
      elements?.forEach(el => {
        if (el.tagName === 'path') {
          el.setAttribute('fill', color);
        }
      });
    });
  }, [provinceLevelList]);

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      version='1.1'
      baseProfile='full'
      fill='#F7F8F9'
      stroke='#D5D7DA'
      strokeWidth='0.39604'
      viewBox='303 50 573 450'
      className={styles.mapSvg}
      id='mapSvg'
    >
      <g>
        {provincePaths.map(pathItem => (
          <path
            key={pathItem.id}
            data-code={pathItem.id}
            data-name={pathItem.name}
            d={pathItem.path}
            onMouseEnter={() => {
              setProvincePaths([
                ...provincePaths.filter(p => p.id !== pathItem.id),
                pathItem,
              ]);
            }}
            onClick={() => onMapClick(pathItem.id)}
          />
        ))}
      </g>
      <g>
        {provincePaths.map(({ id, name, nameEn, textTransform }) => (
          <text
            key={id}
            xmlSpace='preserve'
            fillOpacity='1'
            stroke='none'
            transform={textTransform}
            dominantBaseline='central'
            textAnchor='middle'
            x='0'
            y='0'
            onClick={() => onMapClick(id)}
          >
            {locale === LocaleType.zhCN ? name : nameEn}
          </text>
        ))}
      </g>
      <g>
        <path d='M 792.0894 412.5616 L 798.2929 419.3854 L 805.3826 420.0058 L 818.6759 415.6633 L 829.3104 410.0802 L 838.1726 410.0802 L 841.7175 416.2837 L 844.3761 410.0802 L 848.8072 410.0802 L 848.8072 409.4598 L 796.5205 409.4598 L 792.0894 412.5616 Z M 803.6102 423.7279 L 808.9275 422.4872 L 806.2688 428.6907 L 801.8378 429.9314 L 803.6102 423.7279 Z M 802.724 437.996 L 804.4964 443.5791 L 805.3826 443.5791 L 803.6102 437.996 L 802.724 437.996 Z M 806.2688 451.6437 L 802.724 456.6065 L 803.6102 456.6065 L 808.0413 451.6437 L 806.2688 451.6437 Z M 797.4067 466.5321 L 799.1791 471.4949 L 800.0653 471.4949 L 799.1791 466.5321 L 797.4067 466.5321 Z M 812.4723 482.6612 L 817.7896 480.1798 L 818.6759 480.1798 L 814.2448 482.6612 L 812.4723 482.6612 Z M 824.8794 472.1153 L 830.1967 464.671 L 831.0829 464.671 L 826.6518 472.1153 L 824.8794 472.1153 Z M 834.6277 454.7454 L 837.2864 449.7826 L 839.0588 449.7826 L 836.4002 454.7454 L 834.6277 454.7454 Z M 837.2864 440.4774 L 837.2864 434.8942 L 839.0588 434.8942 L 839.0588 440.4774 L 837.2864 440.4774 Z M 838.1726 429.311 L 840.8312 424.9686 L 841.7175 424.9686 L 839.0588 429.311 L 838.1726 429.311 Z M 843.4899 420.6261 L 847.0347 415.6633 L 847.921 415.6633 L 845.2623 420.6261 L 843.4899 420.6261 Z M 792.0894 412.5616 L 792.0894 491.9665 L 848.8072 491.9665 L 848.8072 409.4598 L 847.921 409.4598 L 847.921 491.3461 L 792.9756 491.3461 L 792.9756 412.5616 L 792.0894 412.5616 Z' />
      </g>
    </svg>
  );
}
