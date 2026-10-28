/* eslint-disable no-nested-ternary */
import { EyeOutlined } from '@ant-design/icons';
import { Field } from '@formily/core';
import { connect, useForm } from '@formily/react';
import I18N from '@src/lang/I18N';
import { Popover, Table } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { FC, useEffect, useState } from 'react';

import { IconAlibaba } from '@/components/iconfont';

import IndicatorDataModal from './IndicatorDataModal';
import styles from './orgIndicator.module.less';
import { ORG_TYPE } from '../../constant';
import { ORG_DIMENSION_TYPE } from '../constant';
import { calcIndicatorData, getPartList } from '../service';

const OrgIconMap = {
  [ORG_TYPE.ENTERPRISE]: 'icon-a-icon-qiyebeijing',
  [ORG_TYPE.ORG]: 'icon-icon_hesuanfenzu',
  [ORG_TYPE.MAIN_PART]: 'icon-icon_hesuanzhuti',
};

type Value = Record<
  number,
  {
    type: number | string;
    values: (number | null)[];
    sum?: string;
    monthValues?: string[];
  }
>;

type OrgIndicatorProps = {
  value?: Value;
  dimension: number;
  disabled: boolean;
  onChange: (value?: Value) => void;
};
const OrgIndicator: FC<OrgIndicatorProps> = ({
  value,
  dimension,
  disabled,
  onChange,
}) => {
  const [partList, setPartList] = useState<
    { id: number; orgName: string; orgType: number }[]
  >([]);

  const form = useForm();

  const yearField = form.query('year').take();

  const onIndicatorDataChange = async (
    org: { id: number; orgName: string; orgType: number },
    val: { type: number | string; values: (number | null)[] },
  ) => {
    const { id, orgType } = org;
    const year = (yearField as Field)?.value;

    const { data } = await calcIndicatorData({
      companyType: dimension,
      orgIndicator: {
        ...(orgType === ORG_TYPE.ENTERPRISE ? {} : value),
        [id]: val,
      },
      year,
    });
    onChange(data.data.orgIndicator);
  };

  const renderMonthPopover = (monthValues: string[] = []) =>
    monthValues.length > 0 ? (
      <Popover
        className={styles.monthPopover}
        showArrow={false}
        content={
          <div>
            <div className={styles.monthTitle}>
              {I18N.enterpriseCarbonAccount2.monthlyData}
            </div>
            <div className={styles.monthData}>
              {monthValues.map(val => (
                <div className={styles.monthDataValue}>{val}</div>
              ))}
            </div>
          </div>
        }
      >
        <EyeOutlined className={styles.monthIcon} />
      </Popover>
    ) : null;

  useEffect(() => {
    getPartList().then(({ data }) => {
      setPartList(data.data);
    });
  }, []);

  return (
    <Table
      rowKey='id'
      size='middle'
      dataSource={partList}
      columns={[
        {
          title: I18N.components.organization,
          dataIndex: 'orgName',
          ellipsis: true,
          render: (_, part) => {
            const { orgType, orgName } = part;
            return (
              <div className={styles.orgName}>
                <div
                  className={classNames(styles.orgIcon, {
                    [styles.companyOrgIcon]: orgType === ORG_TYPE.ENTERPRISE,
                  })}
                >
                  <IconAlibaba
                    className={styles.companyOrgImg}
                    type={OrgIconMap[orgType]}
                  />
                </div>
                <div>{orgName}</div>
              </div>
            );
          },
        },
        {
          title: I18N.enterpriseCarbonAccount2.annualTotalRefersTo,
          dataIndex: 'value',
          render: (_, org) => {
            const { id, orgType, orgName } = org;

            const isPart = orgType === ORG_TYPE.MAIN_PART;
            const isPartDimension = dimension === ORG_DIMENSION_TYPE.PART;
            const indicatorData = value?.[id];
            const sum = indicatorData?.sum;
            const monthValues = indicatorData?.monthValues || [];
            const title = (
              <div className={styles.modalTitle}>
                <div
                  className={classNames(styles.orgIcon, {
                    [styles.companyOrgIcon]: orgType === ORG_TYPE.ENTERPRISE,
                  })}
                >
                  <IconAlibaba
                    className={styles.companyOrgImg}
                    type={OrgIconMap[orgType]}
                  />
                </div>
                <div className={styles.modalOrgName}>{orgName}</div>
                <div>{I18N.enterpriseCarbonAccount2.indicatorFilling}</div>
              </div>
            );
            const canEdit =
              (isPart && isPartDimension) || (!isPart && !isPartDimension);

            if (canEdit) {
              return (
                <div className={styles.indicatorData}>
                  {!isNil(sum) ? (
                    <>
                      <div className={styles.indicatorValText}>
                        {sum}
                        {renderMonthPopover(monthValues)}
                      </div>
                      {!disabled && (
                        <IndicatorDataModal
                          title={title}
                          value={indicatorData}
                          onConfirm={async val =>
                            onIndicatorDataChange(org, val)
                          }
                        >
                          <div className={styles.editBtn}>
                            {I18N.carbonFootprint.edit}
                          </div>
                        </IndicatorDataModal>
                      )}
                    </>
                  ) : !disabled ? (
                    <IndicatorDataModal
                      title={title}
                      value={indicatorData}
                      onConfirm={async val => onIndicatorDataChange(org, val)}
                    >
                      <div className={styles.fillBtn}>
                        {I18N.enterpriseCarbonAccount2.clickToFillIn}
                      </div>
                    </IndicatorDataModal>
                  ) : (
                    '-'
                  )}
                </div>
              );
            }
            return !isNil(sum) ? (
              <div className={styles.indicatorValText}>
                {sum}
                {renderMonthPopover(monthValues)}
              </div>
            ) : (
              <div className={styles.calcText}>
                {I18N.enterpriseCarbonAccount2.automaticCalculation}
              </div>
            );
          },
        },
      ]}
      pagination={false}
    />
  );
};

export default connect(OrgIndicator);
