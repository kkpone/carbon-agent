import I18N from '@src/lang/I18N';
import { Button, Collapse, Table } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';

import ghgCategoryImg from '@/assets/svg/classify.svg';
import ghgClassifyImg from '@/assets/svg/secondClassify.svg';
import { IconAlibaba } from '@/components/iconfont';

import styles from './index.module.less';
import { ListModel, ModelDetails as ModeDetailsType } from '../type';

const expandIcon = ({ isActive }: { isActive?: boolean }) => (
  <IconAlibaba
    className={classNames(styles.expandArrow, {
      [styles.activeExpandArrow]: isActive,
    })}
    type='icon-icon_arrow_rioght'
  />
);

const ModelDetails: FC<{
  model: ListModel | null;
  modelDetails: ModeDetailsType;
  onCancel: () => void;
  onApply: () => void;
}> = ({ model, modelDetails, onApply, onCancel }) => {
  const [expandKeys, setExpandKeys] = useState<string[]>([]);

  const emissionColumns = [
    {
      title: (
        <div className={styles['caption-s']}>
          {I18N.carbonFootprint3.emissionSourceName}
        </div>
      ),
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: (
        <div className={styles['caption-s']}>
          {I18N.components.emissionFacilityActivity}
        </div>
      ),
      dataIndex: 'facility',
      ellipsis: true,
    },
    {
      title: (
        <div className={styles['caption-s']}>
          {I18N.enterpriseCarbonAccount2.dataUnit}
        </div>
      ),
      dataIndex: 'activityUnitDesc',
      ellipsis: true,
    },
  ];

  const onCategoryClick = (keys: string[], id: string) => {
    setExpandKeys([...new Set([...expandKeys, ...keys])]);

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  useEffect(() => {
    const activeKeys: string[] = [];

    (modelDetails || []).forEach(({ ghgCategory, nodes, count }) => {
      if (count > 0) {
        activeKeys.push(ghgCategory);
        (nodes || []).forEach(node => {
          if (node.count > 0) {
            activeKeys.push(ghgCategory + node.ghgClassify);
          }
        });
      }
    });

    setExpandKeys(activeKeys);
  }, [modelDetails]);

  return (
    <div className={styles.modelDetails}>
      <div className={styles.modelDetailsContent}>
        <div className={styles.classifyList}>
          {modelDetails.map(item => {
            const { ghgCategory, name, count, nodes } = item;
            return (
              <div key={ghgCategory}>
                <div
                  className={styles.ghgCategory}
                  onClick={() =>
                    onCategoryClick([ghgCategory], `ghgCategory_${ghgCategory}`)
                  }
                >
                  <img alt='' src={ghgCategoryImg} />
                  <div className={styles.classifyName}>{name}</div>
                  <div className={styles['caption-s']}>{count}</div>
                </div>
                {nodes.map(node => {
                  const {
                    name: classifyName,
                    count: classifyCount,
                    ghgClassify,
                  } = node;
                  return (
                    <div
                      className={styles.ghgClassify}
                      key={ghgClassify}
                      onClick={() =>
                        onCategoryClick(
                          [ghgCategory, `${ghgCategory}${ghgClassify}`],
                          `ghgClassify_${ghgCategory}${ghgClassify}`,
                        )
                      }
                    >
                      <img alt='' src={ghgClassifyImg} />
                      <div className={styles.classifyName}>{classifyName}</div>
                      <div className={styles['caption-s']}>{classifyCount}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className={styles.emissionContent}>
          {modelDetails.map(item => {
            const { ghgCategory, name, nodes } = item;
            return (
              <Collapse
                className={styles.categoryCollapse}
                expandIcon={expandIcon}
                key={ghgCategory}
                activeKey={expandKeys}
                items={[
                  {
                    key: ghgCategory,
                    label: (
                      <div
                        className={styles['body-l-b']}
                        id={`ghgCategory_${ghgCategory}`}
                      >
                        {name}
                      </div>
                    ),
                    children: nodes.map(node => {
                      const {
                        name: classifyName,
                        ghgClassify,
                        dictSourceList,
                      } = node;

                      return (
                        <Collapse
                          className={styles.classifyCollapse}
                          expandIcon={expandIcon}
                          key={ghgClassify}
                          activeKey={expandKeys}
                          items={[
                            {
                              key: `${ghgCategory}${ghgClassify}`,
                              label: (
                                <div
                                  className={styles['body-m-b']}
                                  id={`ghgClassify_${ghgCategory}${ghgClassify}`}
                                >
                                  {classifyName}
                                </div>
                              ),
                              children: (
                                <Table
                                  size='middle'
                                  columns={
                                    model?.modelType === 1
                                      ? [
                                          ...emissionColumns,
                                          {
                                            title: (
                                              <div
                                                className={styles['caption-s']}
                                              >
                                                {
                                                  I18N.enterpriseCarbonAccount2
                                                    .reportedBy
                                                }
                                              </div>
                                            ),
                                            dataIndex: 'appoint',
                                            ellipsis: true,
                                          },
                                        ]
                                      : emissionColumns
                                  }
                                  dataSource={dictSourceList}
                                  pagination={false}
                                />
                              ),
                            },
                          ]}
                          onChange={setExpandKeys}
                        />
                      );
                    }),
                  },
                ]}
                onChange={setExpandKeys}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.modelDetailsFooter}>
        <Button onClick={onCancel}>{I18N.carbonFootprint.return}</Button>
        <Button type='primary' onClick={onApply}>
          {I18N.carbonFootprint3.apply}
        </Button>
      </div>
    </div>
  );
};

export default ModelDetails;
