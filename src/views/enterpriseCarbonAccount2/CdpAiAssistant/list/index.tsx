import { FromItemProps } from '@src/components/FormUtil/type';
import SearchFormUtil from '@src/components/SearchForm';
import I18N from '@src/lang/I18N';
import { useOrgTreeData } from '@src/views/dashborad/organization/components/hooks';
import type { OrgInfo } from '@src/views/dashborad/organization/services';
import { useQuery } from '@tanstack/react-query';
import { useMount } from 'ahooks';
import { Dropdown, Empty, Form, FormProps, MenuProps, Spin } from 'antd';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { checkPermissions } from '@/components/Permission/utils';
import { RouteMaps } from '@/router/route-paths';

import cdpLogoSvg from './cdp_logo.png';
import { CreateModal } from './components/CreateModal';
import { ScoreItem } from './components/ScoreItem';
import { ScoreModal } from './components/ScoreModal';
import detailSvg from './detail.svg';
import styles from './index.module.less';
import {
  getReportList,
  getReportYears,
  IReportItem,
  normalizeReportYears,
} from './service';
import { getIndustryList } from '../../AiAssistant/AiReport/service';

export const formItems = ({
  years,
  orgTreeData,
}: {
  years: string[];
  orgTreeData: OrgInfo[];
}) =>
  [
    {
      label: '',
      name: 'orgId',
      type: 'treeSelect',
      rules: false,
      placeholder: I18N.components.organization,
      props: {
        style: { width: 220 },
        maxLength: 50,
        treeData: orgTreeData,
      },
    },
    {
      label: '',
      name: 'year',
      type: 'select',
      rules: false,
      placeholder: I18N.DomesticVersion.pleaseSelectTheYear,
      props: {
        style: { width: 220 },
        maxLength: 50,
        options: years.map(year => ({
          label: year,
          value: year,
        })),
      },
    },
  ] as FromItemProps<any>[];
interface CdpAiAssistantDetailProps {
  // Define your prop types here
}

const SHOW_ONLINE_FILL = false;

const CdpAiAssistantDetail: React.FC<CdpAiAssistantDetailProps> = () => {
  const [list, setList] = React.useState<IReportItem[]>([]);
  const [visible, setVisible] = React.useState(false);
  const [years, setYears] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [scoreVisible, setScoreVisible] = useState(false);

  const [searchSupplyForm] = Form.useForm();
  const searchFormProps: FormProps = {
    layout: 'inline',
    form: searchSupplyForm,
  };

  const [orgTreeData] = useOrgTreeData();

  const formList = useMemo(
    () => formItems({ years, orgTreeData }),
    [years, orgTreeData],
  );

  const { data: IndustryList } = useQuery(
    ['IndustryList'],
    () => getIndustryList(),
    {
      refetchOnWindowFocus: false,
    },
  );

  const searchSupplySub = async () => {
    setLoading(true);
    try {
      const formValue = searchSupplyForm.getFieldsValue();
      const data = await getReportList(formValue);
      setList(data.data.data);
    } finally {
      setLoading(false);
    }
  };

  useMount(async () => {
    const result = await getReportYears();
    setYears(normalizeReportYears(result));
    searchSupplySub();
  });

  const history = useHistory();

  const items: MenuProps['items'] = [
    {
      key: '1',
      disabled: !checkPermissions(
        true,
        '/enterpriseCarbonAccounting/cdp/aiScore',
      ),
      label: (
        <div
          onClick={() => {
            if (
              checkPermissions(true, '/enterpriseCarbonAccounting/cdp/aiScore')
            ) {
              setScoreVisible(true);
            }
          }}
        >
          {I18N.enterpriseCarbonAccount2.questionnaireUpload}
        </div>
      ),
    },
    ...(SHOW_ONLINE_FILL
      ? [
          {
            key: '4',
            label: (
              <div onClick={() => setVisible(true)}>
                {I18N.enterpriseCarbonAccount2.fillInOnline}
              </div>
            ),
          },
        ]
      : []),
  ];
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          {I18N.enterpriseCarbonAccount2.reportRating}
        </div>
        <div className={styles.create}>
          <Dropdown menu={{ items }}>
            <div className={styles.aiReport}>
              <svg
                width='22'
                height='22'
                viewBox='0 0 22 22'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M9.95867 6.5C10.2692 6.5 10.5476 6.6915 10.6589 6.98145L13.8464 15.2959C13.884 15.3941 13.8118 15.4999 13.7067 15.5H11.1696C10.8167 15.5 10.5111 15.254 10.4362 14.9092L10.2389 14H7.53874L6.99285 15.0869C6.8655 15.3402 6.60541 15.5 6.32195 15.5H3.67839C3.5643 15.5 3.49158 15.3773 3.54656 15.2773L8.16081 6.88867C8.29263 6.64901 8.54452 6.5 8.81804 6.5H9.95867ZM17.9548 9.5C18.0449 9.50008 18.1144 9.57946 18.1032 9.66895L17.4567 14.8428C17.4098 15.2181 17.0908 15.4999 16.7126 15.5H14.8444C14.7542 15.5 14.6848 15.4206 14.696 15.3311L15.3425 10.1572C15.3894 9.78192 15.7084 9.50002 16.0866 9.5H17.9548ZM9.51433 10.665C9.48433 10.5269 9.29762 10.5026 9.23406 10.6289L8.29265 12.5H9.91277L9.51433 10.665ZM18.3229 6.5C18.4154 6.50027 18.4856 6.58352 18.4704 6.6748L18.2292 8.12305C18.1689 8.48469 17.8556 8.75 17.4889 8.75H15.6012C15.5087 8.74978 15.4386 8.6665 15.4538 8.5752L15.695 7.12695C15.7553 6.76531 16.0686 6.5 16.4352 6.5H18.3229Z'
                  fill='url(#paint0_linear_40_3953)'
                />
                <defs>
                  <linearGradient
                    id='paint0_linear_40_3953'
                    x1='5.54742'
                    y1='0.499997'
                    x2='19.0588'
                    y2='15.6501'
                    gradientUnits='userSpaceOnUse'
                  >
                    <stop stopColor='#19E0BD' />
                    <stop offset='1' stopColor='#0CBF9F' />
                  </linearGradient>
                </defs>
              </svg>
              {I18N.enterpriseCarbonAccount2.reportRating}
            </div>
          </Dropdown>
          <CreateModal
            visible={visible}
            setVisible={v => setVisible(v)}
            refresh={() => searchSupplySub()}
          />
          <ScoreModal
            refresh={() => searchSupplySub()}
            visible={scoreVisible}
            setVisible={v => setScoreVisible(v)}
          />
        </div>
      </div>
      <div className={classNames('lib-form', styles.form)}>
        <SearchFormUtil
          searchButtonProps={{
            type: 'primary',
          }}
          resetButtonProps={{
            style: {
              backgroundColor: '#fff',
            },
          }}
          antdFormProps={searchFormProps}
          formItems={formList}
          searchSub={searchSupplySub}
          resetBack={async () => {
            const data = await getReportList();
            setList(data.data.data);
          }}
        />
      </div>
      <Spin spinning={loading}>
        <div className={styles.items}>
          {list.map(item => (
            <div key={item.id} className={styles.item}>
              <img src={cdpLogoSvg} style={{ width: 72 }} alt='' />
              <div className={styles.title}>
                <div
                  className={styles.componentName}
                  onClick={() => {
                    if (item.type === '1') {
                      history.push(
                        `/enterpriseCarbonAccounting/CdpAiReport/detail/?reportId=${item.id}`,
                      );
                    } else {
                      history.push(
                        `${RouteMaps.enterpriseCarbonAccountingCdpAiReportScore}?id=${item.id}`,
                      );
                    }
                  }}
                >
                  {item.corporateName || item.title}
                </div>
                <div className={styles.industry}>
                  {
                    IndustryList?.data.data.cdp_industry.find(
                      i => i.dictValue.toString() === item.industry,
                    )?.dictLabel
                  }
                </div>
              </div>
              <div className={styles.year}>
                <div className={styles.yearTitle}>
                  {I18N.enterpriseCarbonAccount2.reportYear3}
                </div>
                <div className={styles.yearLabel}>{item.year}</div>
              </div>
              <div className={styles.version}>
                <div className={styles.versionTitle}>
                  {I18N.enterpriseCarbonAccount2.reportVersion}
                </div>
                <div className={styles.versionLabel}>
                  {item.reportVersion === '1'
                    ? I18N.enterpriseCarbonAccount2.fullVersion
                    : I18N.enterpriseCarbonAccount2
                        .smallAndMediumSizedEnterpriseS}
                </div>
              </div>
              <div className={styles.other}>
                <div className={styles.otherTitle}>
                  {I18N.enterpriseCarbonAccount2.aiRatingOnly}
                </div>
                <div className={styles.otherLabel}>
                  <ScoreItem
                    label={I18N.enterpriseCarbonAccount2.climateChange}
                    score={item.climateScore}
                    modelType='1'
                    reportVersion={item.reportVersion}
                  />
                  {item.reportVersion === '1' && (
                    <ScoreItem
                      label={I18N.enterpriseCarbonAccount2.forest}
                      score={item.forestsScore}
                      modelType='2'
                      reportVersion={item.reportVersion}
                    />
                  )}
                  {item.reportVersion === '1' && (
                    <ScoreItem
                      label={I18N.enterpriseCarbonAccount2.waterSecurity}
                      score={item.waterScore}
                      modelType='3'
                      reportVersion={item.reportVersion}
                    />
                  )}
                </div>
              </div>
              <div
                className={styles.goDetail}
                onClick={() => {
                  if (item.type === '1') {
                    history.push(
                      `/enterpriseCarbonAccounting/CdpAiReport/detail/?reportId=${item.id}`,
                    );
                  } else {
                    history.push(
                      `${RouteMaps.enterpriseCarbonAccountingCdpAiReportScore}?id=${item.id}`,
                    );
                  }
                }}
              >
                <span>{I18N.carbonFootprint3.details}</span>
                <img src={detailSvg} alt='' />
              </div>
              <div
                className={styles.tag}
                style={{
                  backgroundColor: item.type === '2' ? '#FCEEDF' : '#E8F6FF',
                }}
              >
                {item.type === '2'
                  ? I18N.enterpriseCarbonAccount2.officialQuestionnaire
                  : I18N.enterpriseCarbonAccount2.onlineReport}
              </div>
            </div>
          ))}
          {list.length === 0 && <Empty />}
        </div>
      </Spin>
    </div>
  );
};

export default CdpAiAssistantDetail;
