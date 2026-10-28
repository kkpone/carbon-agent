import { SearchOutlined, UndoOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import {
  Button,
  DatePicker,
  Input,
  Modal,
  Segmented,
  Select,
  Table,
} from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconAlibabaNew } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import { Toast } from '@/utils';

import styles from './index.module.less';
import { getQuestionnaireList, publishQuestionnaire } from './service';
import QRCodeModal from '../components/QRCodeModal';
import {
  QUESTIONNAIRE_CATEGORY,
  QUESTIONNAIRE_CATEGORY_LABEL,
  QUESTIONNAIRE_STATUS,
  QUESTIONNAIRE_STATUS_LABEL,
} from '../constant';
import { Questionnaire } from '../type';

const QuestionnaireList: FC = () => {
  const [searchParams, setSearchParams] = useState<{
    pageNum: number;
    pageSize: number;
    name?: string;
    year?: string;
    type?: string;
    status?: string;
  }>({ pageNum: 1, pageSize: 10 });

  const [questionnaireList, setQuestionnaireList] = useState<Questionnaire[]>(
    [],
  );

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const queryList = async (params: typeof searchParams) => {
    setSearchParams(params);

    try {
      setLoading(true);
      const { data } = await getQuestionnaireList({
        ...params,
        type: params.type === 'all' ? undefined : params.type,
      });

      setTotal(data.data.total);
      setQuestionnaireList(data.data.rows);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = ({ id, status }: { id: number; status: number }) => {
    Modal.confirm({
      icon: null,
      width: 494,
      title:
        status === QUESTIONNAIRE_STATUS.PUBLISHED
          ? I18N.questionnaire.confirmToPublish
          : I18N.questionnaire.confirmToTakeDown,
      content: (
        <div className={styles.confirmText}>
          {status === QUESTIONNAIRE_STATUS.PUBLISHED
            ? I18N.questionnaire.afterReleaseItCanBeCommunicated
            : I18N.questionnaire.postDelistingQuestionnaire}
        </div>
      ),
      onOk: async () => {
        await publishQuestionnaire({
          id,
          status,
        });
        Toast('success', I18N.carbonFootprint.operationSuccessful);
        queryList({ ...searchParams });
      },
    });
  };
  useMount(() => {
    queryList(searchParams);
  });

  return (
    <div className={styles.questionnaireList}>
      <div className={styles.title}>
        {I18N.questionnaire.questionnaireService}
      </div>
      <div className={styles.questionnaireCategoryContent}>
        <div
          className={styles.questionnaireCategory}
          onClick={() => history.push(RouteMaps.questionnaireAdd)}
        >
          <IconAlibabaNew className={styles.categoryIcon} type='icon-tongqin' />
          <div className={styles.categoryName}>
            {I18N.questionnaire.employeeCommutingQuestions}
          </div>
          <IconAlibabaNew
            className={styles.addIcon}
            type='icon-icon-tianjia-new'
          />
        </div>
      </div>
      <div className={styles.listTitle}>
        {I18N.questionnaire.questionnaireList}
      </div>
      <Segmented
        className={styles.segmented}
        options={[
          {
            value: 'all',
            label: I18N.carbonFootprint3.whole,
          },
          ...Object.values(QUESTIONNAIRE_CATEGORY).map(value => ({
            value: `${value}`,
            label: QUESTIONNAIRE_CATEGORY_LABEL()[value],
          })),
        ]}
        onChange={type => queryList({ ...searchParams, type, pageNum: 1 })}
      />
      <div className={styles.searchContent}>
        <Input
          value={searchParams.name}
          placeholder={I18N.supplyChainCarbonManagement.questionnaireName2}
          onChange={e =>
            setSearchParams({ ...searchParams, name: e.target.value })
          }
        />
        <DatePicker
          value={searchParams.year ? moment(searchParams.year) : undefined}
          placeholder={I18N.questionnaire.collectYear}
          picker='year'
          onChange={(_, year) =>
            setSearchParams({
              ...searchParams,
              year: year ? (year as string) : undefined,
            })
          }
        />
        <Select
          value={searchParams.status}
          placeholder={I18N.carbonFootprint.state}
          allowClear
          options={Object.values(QUESTIONNAIRE_STATUS).map(status => ({
            value: status,
            label: QUESTIONNAIRE_STATUS_LABEL[status],
          }))}
          onChange={status => setSearchParams({ ...searchParams, status })}
        />
        <Button
          type='primary'
          icon={<SearchOutlined />}
          onClick={() => queryList({ ...searchParams, pageNum: 1 })}
        >
          {I18N.carbonNeutral.query}
        </Button>
        <Button
          icon={<UndoOutlined />}
          onClick={() =>
            queryList({ pageNum: 1, pageSize: searchParams.pageSize })
          }
        >
          {I18N.carbonFootprint3.reset}
        </Button>
      </div>

      <Table
        rowKey='id'
        scroll={{ x: 1156 }}
        loading={loading}
        dataSource={questionnaireList}
        columns={[
          {
            title: I18N.supplyChainCarbonManagement.questionnaireName2,
            dataIndex: 'name',
            width: 302,
            ellipsis: true,
            fixed: 'left',
          },
          {
            title: I18N.questionnaire.collectYear,
            dataIndex: 'year',
            width: 96,
            ellipsis: true,
          },
          {
            title: I18N.carbonFootprint.state,
            dataIndex: 'status',
            width: 118,
            ellipsis: true,
            render: (_, { status }) => (
              <div
                className={classNames(styles.statusTag, {
                  [styles.publishedTag]:
                    status === QUESTIONNAIRE_STATUS.PUBLISHED,
                  [styles.closeTag]: status === QUESTIONNAIRE_STATUS.CLOSE,
                  [styles.UnpublishTag]:
                    status === QUESTIONNAIRE_STATUS.UN_PUBLISH,
                })}
              >
                {QUESTIONNAIRE_STATUS_LABEL[status]}
              </div>
            ),
          },
          {
            title: I18N.questionnaire.deadline,
            dataIndex: 'expireTime',
            width: 270,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            title: I18N.questionnaire.questionnaireCollectionVolume,
            dataIndex: 'submitCount',
            width: 130,
            ellipsis: true,
          },
          {
            title: I18N.carbonFootprint.operation,
            dataIndex: '__operate__',
            width: 240,
            fixed: 'right',
            render: (_, record) => {
              const { status } = record;

              return (
                <div className={styles.operateColumn}>
                  <Button
                    type='link'
                    onClick={() =>
                      history.push(
                        RouteMaps.questionnaireResult.replace(
                          ':id',
                          `${record.id}`,
                        ),
                      )
                    }
                  >
                    {I18N.carbonFootprint3.details}
                  </Button>
                  {status !== QUESTIONNAIRE_STATUS.PUBLISHED && (
                    <Button
                      type='link'
                      onClick={() =>
                        history.push(
                          RouteMaps.questionnaireEdit.replace(
                            ':id',
                            `${record.id}`,
                          ),
                        )
                      }
                    >
                      {I18N.carbonFootprint.edit}
                    </Button>
                  )}
                  {status !== QUESTIONNAIRE_STATUS.CLOSE && (
                    <Button
                      type='link'
                      onClick={() =>
                        changeStatus({
                          id: record.id,
                          status:
                            status === QUESTIONNAIRE_STATUS.UN_PUBLISH
                              ? QUESTIONNAIRE_STATUS.PUBLISHED
                              : QUESTIONNAIRE_STATUS.UN_PUBLISH,
                        })
                      }
                    >
                      {status === QUESTIONNAIRE_STATUS.UN_PUBLISH
                        ? I18N.cbam.release
                        : I18N.questionnaire.unPublish}
                    </Button>
                  )}
                  {status === QUESTIONNAIRE_STATUS.PUBLISHED && (
                    <QRCodeModal id={record.id} name={record.name}>
                      <Button type='link'>
                        {I18N.questionnaire.questionnaireLink}
                      </Button>
                    </QRCodeModal>
                  )}
                </div>
              );
            },
          },
        ]}
        pagination={{
          total,
          current: searchParams.pageNum,
          pageSize: searchParams.pageSize,
        }}
        onChange={pager => {
          queryList({
            ...searchParams,
            pageNum: pager.current || 1,
            pageSize: pager.pageSize || 10,
          });
        }}
      />
    </div>
  );
};

export default QuestionnaireList;
