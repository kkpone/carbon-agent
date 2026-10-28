/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  LeftOutlined,
  InfoCircleOutlined,
  RightOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import avatarImg from '@assets/svg/icon_avatar.svg';
import I18N from '@src/lang/I18N';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { AddSource } from '@src/views/enterpriseCarbonAccount2/accounting/fillData/components/addSource';
import {
  Button,
  Checkbox,
  Collapse,
  InputNumber,
  Popconfirm,
  Popover,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { Key } from 'antd/es/table/interface';
import { DataNode } from 'antd/lib/tree';
import classNames from 'classnames';
import { compact, isNil, last, omit } from 'lodash-es';
import {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  ReactNode,
} from 'react';

import ghgClassifyImg from '@/assets/svg/classify.svg';
import secondGhgClassifyImg from '@/assets/svg/secondClassify.svg';
import { PageInfoType } from '@/router/type';
import { Toast } from '@/utils/Toast';
import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';
import { uniqueIdWithSource } from '@/views/enterpriseCarbonAccount2/carbonDischarge/components/FillActiveData/columns';
import { assignSubmitter } from '@/views/enterpriseCarbonAccount2/carbonDischarge/components/FillActiveData/service';
import {
  batchAssignSubmitter,
  batchDeleteAttachment,
  batchDownloadAttachment,
  batchDeleteSource,
  batchUploadAttachment,
} from '@/views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/service';
import { COMPUTATION_STATUS } from '@/views/enterpriseCarbonAccount2/constant';
import {
  apiComputationCacl,
  apiEditActivityData,
  apiSourceDeleted,
  asyncToDict,
  UpdateFlag,
} from '@/views/enterpriseCarbonAccount2/service';
import { IconFont } from '@/views/subModules/CarbonFootprintModel/iconfont';

import expandImg from './expand.svg';
import styles from './index.module.less';
import FileUploadDrawer from '../FileUploadDrawer';
import { checkPermissions } from '../Permission/utils';
import UserSelectModal from '../UserSelectModal';
import { IconAlibaba } from '../iconfont';

export type TreeCollapseDataNode = Omit<DataNode, 'children'> & {
  children?: TreeCollapseDataNode[];
  collapseTitle?: React.ReactNode;
  dataSource?: any[];
  name: string;
  isoClassify: string;
  ghgClassify: string;
  [P: string]: any;
};

type TreeCollapseProps = {
  computationId?: string;
  readPretty?: boolean;
  isModel?: boolean;
  tableBottom?: (params: any) => React.ReactNode | void;
  treeData: TreeCollapseDataNode[];
  canHideTree?: boolean;
  loading?: boolean;
  expandAll?: boolean;
  computationPeriod?: string;
  versionType?: EVersionType;
  totalEmission?: number;
  columns?: any[];
  computationStatus?: number;
  scopeThreeImport?: ReactNode;
  refresh?: () => void;
  openHistoryDrawer?: (id?: number) => void;
  isShare?: boolean;
};
export interface TreeCollapseRef {
  resetActiveKeys: () => void;
}

const expandIcon = ({ isActive }: { isActive?: boolean }) => (
  <IconAlibaba
    className={classNames(styles.expandArrow, {
      [styles.activeExpandArrow]: isActive,
    })}
    type='icon-icon_arrow_rioght'
  />
);

const SUBMITTER_ASSIGN_STATUS = {
  UNASSIGNED: 0,
  ASSIGNED_OTHER_USER: 1,
  ASSIGNED_CURRENT_USER: 2,
};

const SubmitterTag = ({
  name,
  onClose,
  ...restProps
}: {
  name: string;
  classNames?: string;
  onClose?: () => void;
}) => (
  <div
    {...restProps}
    className={classNames(styles.submitterTag, restProps.classNames)}
  >
    <img className={styles.submitterTagImg} src={avatarImg} alt='' />
    <div className={styles.submitterTagName}>{name}</div>
    {onClose && (
      <CloseOutlined
        className={styles.submitterTagCloseIcon}
        onClick={onClose}
      />
    )}
  </div>
);

export const TreeCollapse = forwardRef((props: TreeCollapseProps, ref) => {
  const {
    tableBottom,
    computationId,
    readPretty,
    treeData,
    canHideTree,
    loading,
    expandAll = false,
    isModel = true,
    columns,
    computationPeriod,
    totalEmission,
    versionType,
    computationStatus,
    scopeThreeImport,
    refresh,
    openHistoryDrawer,
    isShare,
  } = props;
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const checkedCount = checkedIds.length;

  const allEmissionIds = treeData.reduce(
    (ids: number[], category) => [
      ...ids,
      ...(category.children || []).reduce(
        (prev: number[], curr) => [
          ...prev,
          ...(curr.dataSource || []).map(emission => emission.id),
        ],
        [],
      ),
    ],
    [],
  );

  const orgId = new URLSearchParams(location.search).get('orgId');
  const resetActiveKeys = () => {
    const treeDataKeys = treeData.map(item => {
      const itemKeys = compact(
        item.children?.map(child => {
          if (child.dataSource?.length || expandAll) {
            return child.key as string;
          }
          return null;
        }),
      );
      return compact([item.name, itemKeys]);
    });
    const newActiveKeys = treeDataKeys.flat(3);
    setActiveKeys(newActiveKeys);
    if (newActiveKeys.length > 0) {
      document.getElementById(newActiveKeys[0])?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      resetActiveKeys,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [treeData],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => resetActiveKeys(), [treeData?.length]);

  const [hideTree, setHideTree] = useState(false);

  const onSelect = (selectedKey: Key[], info: any) => {
    document.getElementById(selectedKey[0] as string)?.scrollIntoView({
      behavior: 'smooth',
    });
    if (selectedKey.length) {
      setActiveKeys(pre => [...pre, selectedKey[0] as string]);
    } else {
      setActiveKeys(pre => pre.filter(item => item !== info.node.key));
    }
    setSelectedKeys(selectedKey as string[]);
  };

  const collapseChange = (key: string | string[]) => {
    setActiveKeys(key as string[]);
    if (last(key)) {
      setSelectedKeys([last(key) as string]);
    }
  };

  const computationComplete = computationStatus === COMPUTATION_STATUS.COMPLETE;

  const assignSubmitterDisabled =
    computationComplete || !checkPermissions(true, 'enterprise:source:appiont');

  return (
    <div className={styles.wrapper}>
      <div
        className={classNames(styles.treeWrapper, {
          [styles.closeTreeWrapper]: hideTree,
        })}
      >
        {!isNil(totalEmission) && (
          <div className={styles.totalEmission}>
            <div>
              <span className={styles.totalEmissionLabel}>
                {I18N.enterpriseCarbonAccount2.totalEmissions}
              </span>
              <span className={styles.totalEmissionUnit}>/tCO₂e</span>
            </div>
            <div className={styles.totalEmissionValue}>{totalEmission}</div>
          </div>
        )}
        <div className={styles.treeBox}>
          {treeData.map(
            ({ key, name, children, finishCount, totalCount, count }) => (
              <div className={styles.ghgClassifyContent} key={key}>
                <div
                  className={styles.ghgClassify}
                  onClick={() => {
                    onSelect(
                      selectedKeys.includes(key as string) ? [] : [key],
                      {
                        node: { key },
                      },
                    );
                  }}
                >
                  <img src={ghgClassifyImg} alt='' />
                  <div className={styles.classifyName}>{name}</div>
                  <div className={styles.count}>
                    {isModel ? count : `${finishCount}/${totalCount}`}
                  </div>
                </div>
                {(children || []).map(child => {
                  const [category, childName] = child.name.split('：');
                  return (
                    <div
                      className={styles.secondGhgClassify}
                      key={child.key}
                      onClick={() => {
                        onSelect(
                          selectedKeys.includes(child.key as string)
                            ? []
                            : [child.key],
                          { node: { key: child.key } },
                        );
                      }}
                    >
                      <img src={secondGhgClassifyImg} alt='' />
                      <div className={styles.classifyName}>
                        <div className={styles.categoryName}>
                          {childName ?? category}
                        </div>
                        {childName && (
                          <div className={styles.category}>{category}</div>
                        )}
                      </div>
                      <div className={styles.count}>
                        {isModel
                          ? child.count
                          : `${child.finishCount}/${child.totalCount}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ),
          )}
        </div>
      </div>
      {canHideTree && (
        <div className={styles.accountTreeExpand}>
          <div
            className={styles.accountTreeExpandBtn}
            onClick={() => setHideTree(pre => !pre)}
          >
            <img src={expandImg} alt='' />
            {hideTree ? (
              <RightOutlined className={styles.expandIcon} />
            ) : (
              <LeftOutlined className={styles.expandIcon} />
            )}
          </div>
        </div>
      )}
      <div
        className={classNames(styles.collapseWrapper, {
          [styles.expandCollapseWrapper]: hideTree,
        })}
      >
        <Spin spinning={loading}>
          {computationId &&
            !isModel &&
            treeData.map(item => {
              const { name, children, key, totalEmissions, ghgCategory } = item;
              const categoryEmissionIds = (children || []).reduce(
                (prev: number[], curr) => [
                  ...prev,
                  ...(curr.dataSource || []).map(emission => emission.id),
                ],
                [],
              );

              const header = (
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryHeaderLeft}>
                    {!isShare && (
                      <Checkbox
                        disabled={computationComplete}
                        checked={
                          categoryEmissionIds.length > 0 &&
                          categoryEmissionIds.every(id =>
                            checkedIds.includes(id),
                          )
                        }
                        indeterminate={
                          categoryEmissionIds.some(id =>
                            checkedIds.includes(id),
                          ) &&
                          !categoryEmissionIds.every(id =>
                            checkedIds.includes(id),
                          )
                        }
                        onClick={e => e.stopPropagation()}
                        onChange={e => {
                          if (e.target.checked) {
                            setCheckedIds([
                              ...new Set([
                                ...checkedIds,
                                ...categoryEmissionIds,
                              ]),
                            ]);
                          } else {
                            setCheckedIds(
                              checkedIds.filter(
                                checkedId =>
                                  !categoryEmissionIds.includes(checkedId),
                              ),
                            );
                          }
                        }}
                      />
                    )}
                    <div className={styles.headerCategoryName}>{name}</div>
                    <div>
                      <span className={styles.emissions}>{totalEmissions}</span>
                      <span className={styles.unit}>tCO₂e</span>
                    </div>
                  </div>
                  {ghgCategory === '2' && scopeThreeImport}
                </div>
              );
              return (
                <Collapse
                  key={key}
                  activeKey={activeKeys}
                  onChange={collapseChange}
                  expandIcon={expandIcon}
                  className={styles.wrapperCollapse}
                >
                  <Collapse.Panel
                    header={header}
                    key={key as string}
                    id={key.toString()}
                  >
                    {children?.map(childrenItem => {
                      const {
                        name: childName,
                        key: childKey,
                        dataSource,
                        totalEmission: totalEmissionVal,
                      } = childrenItem;

                      const classifyEmissionIds = (dataSource || []).map(
                        emission => emission.id,
                      );
                      const ghgHeader = (
                        <div className={styles.categoryHeader}>
                          <div className={styles.categoryHeaderLeft}>
                            {!isShare && (
                              <Checkbox
                                disabled={computationComplete}
                                checked={
                                  classifyEmissionIds.length > 0 &&
                                  classifyEmissionIds.every(id =>
                                    checkedIds.includes(id),
                                  )
                                }
                                indeterminate={
                                  classifyEmissionIds.some(id =>
                                    checkedIds.includes(id),
                                  ) &&
                                  !classifyEmissionIds.every(id =>
                                    checkedIds.includes(id),
                                  )
                                }
                                onClick={e => e.stopPropagation()}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setCheckedIds([
                                      ...new Set([
                                        ...checkedIds,
                                        ...classifyEmissionIds,
                                      ]),
                                    ]);
                                  } else {
                                    setCheckedIds(
                                      checkedIds.filter(
                                        checkedId =>
                                          !classifyEmissionIds.includes(
                                            checkedId,
                                          ),
                                      ),
                                    );
                                  }
                                }}
                              />
                            )}
                            <div className={styles.headerCategoryName}>
                              {childName}
                            </div>
                            <div>
                              <span className={styles.emissions}>
                                {totalEmissionVal}
                              </span>
                              <span className={styles.unit}>tCO₂e</span>
                            </div>
                          </div>
                          <div
                            className={styles.categoryHeaderOperate}
                            onClick={e => e.stopPropagation()}
                          >
                            {tableBottom?.({
                              ...omit(childrenItem, [
                                'ghgClassify',
                                'isoClassify',
                              ]),
                              isoClassify:
                                versionType === EVersionType.iso
                                  ? childrenItem.isoClassify
                                  : null,
                              ghgClassify:
                                versionType === EVersionType.ghg
                                  ? childrenItem.ghgClassify
                                  : null,
                              computationPeriod,
                            }) || ''}
                          </div>
                        </div>
                      );
                      return (
                        <Collapse
                          key={childKey}
                          activeKey={activeKeys}
                          onChange={collapseChange}
                          expandIcon={expandIcon}
                          className={styles.innerCollapse}
                        >
                          <Collapse.Panel
                            header={ghgHeader}
                            id={childKey.toString()}
                            key={childKey as string}
                          >
                            {(dataSource || []).map(emissionSource => {
                              const {
                                id,
                                name: emissionSourceName,
                                submitterAssignStatus,
                                activityUnit,
                                activityData,
                                emissionQuantity,
                                userList,
                                allowSync,
                                dictSourceId,
                                supportImg,
                                status,
                                facility,
                                factorValue,
                                factorUnit,
                                factorUnitM,
                              } = emissionSource;

                              const [
                                firstSubmitter,
                                secondSubmitter,
                                ...restSubmitter
                              ] = userList || [];
                              const userIds = (userList || []).map(
                                ({ userId }) => userId,
                              );

                              const infoPermission = checkPermissions(
                                true,
                                'enterprise:computation:info',
                              );

                              const deleteSubmitter = async (
                                deleteId: number,
                              ) => {
                                await assignSubmitter({
                                  id,
                                  userIds: userIds.filter(
                                    userId => userId !== deleteId,
                                  ),
                                });
                                Toast(
                                  'success',
                                  I18N.carbonFootprint.operationSuccessful,
                                );
                                refresh?.();
                              };
                              return (
                                <div
                                  className={styles.emissionSource}
                                  key={id}
                                  id={uniqueIdWithSource(id)}
                                >
                                  <div className={styles.emissionSourceHeader}>
                                    <div
                                      className={
                                        styles.emissionSourceHeaderItem
                                      }
                                    >
                                      {!isShare && (
                                        <Checkbox
                                          disabled={computationComplete}
                                          checked={checkedIds.includes(id)}
                                          onChange={e => {
                                            setCheckedIds(
                                              e.target.checked
                                                ? [...checkedIds, id]
                                                : checkedIds.filter(
                                                    checkedId =>
                                                      checkedId !== id,
                                                  ),
                                            );
                                          }}
                                        />
                                      )}
                                      {infoPermission || isShare ? (
                                        <AddSource
                                          id={id}
                                          isShare={isShare}
                                          computationId={computationId}
                                          pageInfoType={PageInfoType.edit}
                                          readPretty={
                                            readPretty ||
                                            submitterAssignStatus ===
                                              SUBMITTER_ASSIGN_STATUS.ASSIGNED_OTHER_USER
                                          }
                                          addSuccess={refresh}
                                        >
                                          <div
                                            className={
                                              styles.emissionSourceName
                                            }
                                          >
                                            {emissionSourceName}
                                          </div>
                                        </AddSource>
                                      ) : (
                                        <div
                                          className={styles.emissionSourceName}
                                        >
                                          {emissionSourceName}
                                        </div>
                                      )}
                                      <div className={styles.facility}>
                                        {facility}
                                      </div>
                                    </div>
                                    <div
                                      className={styles.emissionSourceOperate}
                                    >
                                      {(infoPermission || isShare) && (
                                        <AddSource
                                          id={id}
                                          isShare={isShare}
                                          computationId={computationId}
                                          pageInfoType={PageInfoType.edit}
                                          readPretty={
                                            readPretty ||
                                            submitterAssignStatus ===
                                              SUBMITTER_ASSIGN_STATUS.ASSIGNED_OTHER_USER
                                          }
                                          addSuccess={refresh}
                                        >
                                          <div className={styles.textBtn}>
                                            {I18N.carbonFootprint3.details}
                                          </div>
                                        </AddSource>
                                      )}
                                      {!isShare && (
                                        <div
                                          className={styles.textBtn}
                                          onClick={() =>
                                            openHistoryDrawer?.(id)
                                          }
                                        >
                                          {
                                            I18N.enterpriseCarbonAccount2
                                              .history
                                          }
                                        </div>
                                      )}
                                      {!readPretty && !!allowSync && (
                                        <Popconfirm
                                          title={
                                            I18N.enterpriseCarbonAccount2
                                              .confirmSaveAs
                                          }
                                          onConfirm={async () => {
                                            await asyncToDict({
                                              sourceId: id,
                                              updateFlag: UpdateFlag.add,
                                            });
                                            refresh?.();
                                          }}
                                          okText={I18N.carbonFootprint.confirm2}
                                          cancelText={
                                            I18N.carbonFootprint.cancel
                                          }
                                        >
                                          <div className={styles.textBtn}>
                                            {
                                              I18N.enterpriseCarbonAccount2
                                                .saveAsNew
                                            }
                                          </div>
                                        </Popconfirm>
                                      )}
                                      {!readPretty &&
                                        !!allowSync &&
                                        !!dictSourceId && (
                                          <Popconfirm
                                            title={
                                              I18N.enterpriseCarbonAccount2
                                                .confirmUpdatingThe
                                            }
                                            zIndex={10000}
                                            onConfirm={async () => {
                                              await asyncToDict({
                                                sourceId: id,
                                                updateFlag: UpdateFlag.update,
                                              });
                                              refresh?.();
                                            }}
                                            okText={
                                              I18N.carbonFootprint.confirm2
                                            }
                                            cancelText={
                                              I18N.carbonFootprint.cancel
                                            }
                                          >
                                            <div className={styles.textBtn}>
                                              {
                                                I18N.enterpriseCarbonAccount2
                                                  .updateEmissionSources
                                              }
                                            </div>
                                          </Popconfirm>
                                        )}
                                      {!readPretty &&
                                        submitterAssignStatus !==
                                          SUBMITTER_ASSIGN_STATUS.ASSIGNED_OTHER_USER && (
                                          <Popconfirm
                                            title={
                                              I18N.enterpriseCarbonAccount2
                                                .confirmDeletion
                                            }
                                            onConfirm={async () => {
                                              await apiSourceDeleted(id);
                                              Toast(
                                                'success',
                                                I18N.carbonFootprint
                                                  .deleteSuccessful,
                                              );
                                              refresh?.();
                                            }}
                                            okText={
                                              I18N.carbonFootprint.confirm
                                            }
                                            cancelText={
                                              I18N.carbonFootprint.cancel
                                            }
                                          >
                                            <div className={styles.textBtn}>
                                              {I18N.carbonFootprint.delete}
                                            </div>
                                          </Popconfirm>
                                        )}
                                    </div>
                                  </div>
                                  <div className={styles.emissionSourceContent}>
                                    <div className={styles.emissionData}>
                                      <div className={styles.emissionLabel}>
                                        {I18N.carbonFootprint3.activityData}
                                      </div>
                                      <InputNumber
                                        key={`${id}-${activityData}`}
                                        className={styles.emissionDataInput}
                                        status={status}
                                        disabled={
                                          readPretty ||
                                          submitterAssignStatus ===
                                            SUBMITTER_ASSIGN_STATUS.ASSIGNED_OTHER_USER
                                        }
                                        defaultValue={activityData}
                                        addonAfter={
                                          <div
                                            className={styles.inputUnit}
                                            title={activityUnit}
                                          >
                                            {activityUnit}
                                          </div>
                                        }
                                        min={0}
                                        controls={false}
                                        stringMode
                                        onBlur={async e => {
                                          let val = e.target.value;

                                          if (
                                            Number.isNaN(Number(val)) ||
                                            isNil(val)
                                          ) {
                                            return;
                                          }

                                          if (Number(val) < 0) {
                                            val = '0';
                                          }
                                          await apiEditActivityData({
                                            activityData: val,
                                            id,
                                          });
                                          await apiComputationCacl({
                                            activeData: val,
                                            sourceId: id,
                                          });

                                          refresh?.();
                                        }}
                                      />
                                    </div>
                                    <div className={styles.emissionValue}>
                                      <div className={styles.emissionLabel}>
                                        {
                                          I18N.enterpriseCarbonAccount2
                                            .emissionsTC2
                                        }
                                      </div>
                                      <div className={styles.emissionValueNum}>
                                        {emissionQuantity}
                                      </div>
                                    </div>
                                    <div className={styles.emissionValue}>
                                      <div className={styles.emissionLabel}>
                                        {I18N.carbonFootprint.factorValue}
                                      </div>
                                      <div className={styles.emissionValueNum}>
                                        {(() => {
                                          if (
                                            shouldHideEcoinventValue(
                                              emissionSource,
                                            )
                                          ) {
                                            return I18N.carbonFootprint3
                                              .notDisplayedTemporarily;
                                          }
                                          return factorValue
                                            ? `${factorValue} ${factorUnit}/${factorUnitM}`
                                            : '-';
                                        })()}
                                      </div>
                                    </div>
                                    <div className={styles.emissionAttachment}>
                                      <div className={styles.emissionLabel}>
                                        {I18N.components.attachment}
                                        <Tooltip
                                          overlay={
                                            I18N.enterpriseCarbonAccount2
                                              .supportPdf2
                                          }
                                        >
                                          <InfoCircleOutlined
                                            className={styles.tooltipIcon}
                                          />
                                        </Tooltip>
                                      </div>
                                      <div className={styles.attachment}>
                                        <FileUploadDrawer
                                          files={(supportImg || []).map(
                                            file => ({
                                              id: file.supportImgId,
                                              name: file.name,
                                              url: file.url,
                                            }),
                                          )}
                                          disabled={
                                            readPretty ||
                                            submitterAssignStatus ===
                                              SUBMITTER_ASSIGN_STATUS.ASSIGNED_OTHER_USER
                                          }
                                          onSuccess={async files => {
                                            await batchUploadAttachment({
                                              sourceIdList: [id],
                                              supportImg: files,
                                            });
                                            Toast(
                                              'success',
                                              I18N.enterpriseCarbonAccount2
                                                .uploadSuccessful,
                                            );
                                            refresh?.();
                                          }}
                                          onDelete={async files => {
                                            await batchDeleteAttachment({
                                              supportImgIds: files.map(
                                                file => file.id,
                                              ),
                                            });
                                            Toast(
                                              'success',
                                              I18N.carbonFootprint
                                                .deleteSuccessful,
                                            );
                                            refresh?.();
                                          }}
                                          onBatchDownload={async files => {
                                            const { data } =
                                              await batchDownloadAttachment({
                                                supportImgIds: files.map(
                                                  file => file.id,
                                                ),
                                              });
                                            window.open(data.data.url);
                                          }}
                                        >
                                          <Button>
                                            <IconAlibaba type='icon-icon_upload' />
                                            <span>
                                              {
                                                I18N.components
                                                  .uploadAttachments
                                              }
                                            </span>
                                          </Button>
                                        </FileUploadDrawer>
                                        {supportImg?.length > 0 && (
                                          <div
                                            className={styles.attachmentCount}
                                          >
                                            {
                                              I18N.enterpriseCarbonAccount2
                                                .alreadyUploaded
                                            }
                                            {supportImg.length}
                                            {
                                              I18N.enterpriseCarbonAccount2
                                                .aFile
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {!isShare && (
                                      <div className={styles.emissionSubmitter}>
                                        <div className={styles.emissionLabel}>
                                          {
                                            I18N.enterpriseCarbonAccount2
                                              .reportedBy
                                          }
                                          <Tooltip
                                            overlay={
                                              I18N.enterpriseCarbonAccount2
                                                .selectTheFillingPerson
                                            }
                                          >
                                            <InfoCircleOutlined
                                              className={styles.tooltipIcon}
                                            />
                                          </Tooltip>
                                        </div>
                                        <div
                                          className={styles.submitterContent}
                                        >
                                          <UserSelectModal
                                            userIds={userIds}
                                            orgId={orgId}
                                            disabled={assignSubmitterDisabled}
                                            onConfirm={async selectedUserIds => {
                                              await assignSubmitter({
                                                id,
                                                userIds: selectedUserIds,
                                              });
                                              Toast(
                                                'success',
                                                I18N.carbonFootprint
                                                  .operationSuccessful,
                                              );
                                              refresh?.();
                                            }}
                                          >
                                            <div
                                              className={styles.addSubmitterBtn}
                                            >
                                              <PlusOutlined
                                                className={
                                                  styles.addSubmitterIcon
                                                }
                                              />
                                            </div>
                                          </UserSelectModal>
                                          {firstSubmitter && (
                                            <SubmitterTag
                                              name={firstSubmitter.name}
                                              onClose={
                                                assignSubmitterDisabled
                                                  ? undefined
                                                  : () =>
                                                      deleteSubmitter(
                                                        firstSubmitter.userId,
                                                      )
                                              }
                                            />
                                          )}
                                          {secondSubmitter && (
                                            <SubmitterTag
                                              name={secondSubmitter.name}
                                              onClose={
                                                assignSubmitterDisabled
                                                  ? undefined
                                                  : () =>
                                                      deleteSubmitter(
                                                        secondSubmitter.userId,
                                                      )
                                              }
                                            />
                                          )}
                                          {restSubmitter.length > 0 && (
                                            <Popover
                                              content={
                                                <div
                                                  className={
                                                    styles.submitterPopover
                                                  }
                                                >
                                                  {restSubmitter.map(
                                                    submitter => (
                                                      <SubmitterTag
                                                        name={submitter.name}
                                                        onClose={
                                                          assignSubmitterDisabled
                                                            ? undefined
                                                            : () =>
                                                                deleteSubmitter(
                                                                  submitter.userId,
                                                                )
                                                        }
                                                      />
                                                    ),
                                                  )}
                                                </div>
                                              }
                                            >
                                              <SubmitterTag
                                                classNames={
                                                  styles.restSubmitterTag
                                                }
                                                name={`+${restSubmitter.length}`}
                                              />
                                            </Popover>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </Collapse.Panel>
                        </Collapse>
                      );
                    })}
                  </Collapse.Panel>
                </Collapse>
              );
            })}
          {isModel &&
            treeData.map(item => {
              const { name, children, key } = item;
              const header = (
                <div className={styles.categoryHeader}>
                  <div className={styles.headerCategoryName}>{name}</div>
                </div>
              );
              return (
                <Collapse
                  key={key}
                  activeKey={activeKeys}
                  onChange={collapseChange}
                  expandIcon={expandIcon}
                  className={styles.wrapperCollapse}
                >
                  <Collapse.Panel
                    header={header}
                    key={key as string}
                    id={key.toString()}
                  >
                    {children?.map(childrenItem => {
                      const {
                        name: childName,
                        key: childKey,
                        dataSource,
                      } = childrenItem;

                      const ghgHeader = (
                        <div className={styles.categoryHeader}>
                          <div className={styles.headerCategoryName}>
                            {childName}
                          </div>
                          <div
                            className={styles.categoryHeaderOperate}
                            onClick={e => e.stopPropagation()}
                          >
                            {tableBottom?.({
                              ...omit(childrenItem, ['isoClassify']),
                              computationPeriod,
                            }) || ''}
                          </div>
                        </div>
                      );
                      return (
                        <Collapse
                          key={childKey}
                          activeKey={activeKeys}
                          onChange={collapseChange}
                          expandIcon={expandIcon}
                          className={styles.innerCollapse}
                        >
                          <Collapse.Panel
                            header={ghgHeader}
                            id={childKey.toString()}
                            key={childKey as string}
                          >
                            {dataSource && dataSource.length > 0 && (
                              <Table
                                columns={columns}
                                dataSource={dataSource}
                                rowKey='id'
                                pagination={false}
                              />
                            )}
                          </Collapse.Panel>
                        </Collapse>
                      );
                    })}
                  </Collapse.Panel>
                </Collapse>
              );
            })}
        </Spin>
      </div>
      {checkedCount > 0 && (
        <div
          className={styles.batchOperation}
          style={{ width: hideTree ? '100%' : 'calc(100% - 272px)' }}
        >
          <Checkbox
            disabled={computationComplete}
            checked={checkedIds.length === allEmissionIds.length}
            indeterminate={
              checkedIds.length > 0 && checkedIds.length < allEmissionIds.length
            }
            onChange={e => {
              setCheckedIds(e.target.checked ? allEmissionIds : []);
            }}
          >
            {I18N.components.selectAll}
          </Checkbox>
          <UserSelectModal
            orgId={orgId}
            disabled={assignSubmitterDisabled}
            showClear
            onConfirm={async (selectedUserIds, clearAppoint) => {
              await batchAssignSubmitter({
                sourceIdList: checkedIds,
                userIds: selectedUserIds,
                clearAppoint,
              });
              Toast('success', I18N.carbonFootprint.operationSuccessful);
              refresh?.();
            }}
          >
            <Button className={styles.batchOperateBtn}>
              <IconFont type='icon-icon_informant' />
              <span>{I18N.enterpriseCarbonAccount2.invitingApplicants}</span>
            </Button>
          </UserSelectModal>

          <FileUploadDrawer
            batch={false}
            onSuccess={async files => {
              await batchUploadAttachment({
                sourceIdList: checkedIds,
                supportImg: files,
              });
              Toast('success', I18N.enterpriseCarbonAccount2.uploadSuccessful);
              refresh?.();
            }}
          >
            <Button className={styles.batchOperateBtn} disabled={readPretty}>
              <IconAlibaba type='icon-icon_upload' />
              <span>{I18N.components.uploadAttachments}</span>
            </Button>
          </FileUploadDrawer>
          <Popconfirm
            title={I18N.enterpriseCarbonAccount2.confirmDeletion}
            onConfirm={async () => {
              await batchDeleteSource({ sourceIdList: checkedIds });
              Toast('success', I18N.carbonFootprint.deleteSuccessful);
              refresh?.();
              setCheckedIds([]);
            }}
            okText={I18N.carbonFootprint.confirm}
            cancelText={I18N.carbonFootprint.cancel}
          >
            <Button className={styles.batchOperateBtn} disabled={readPretty}>
              <IconAlibaba type='icon-icon_delete' />
              <span>{I18N.carbonFootprint.delete}</span>
            </Button>
          </Popconfirm>
          <div className={styles.batchCount}>
            <span>{I18N.components.selected}</span>
            <span className={styles.checkedCount}>
              {checkedCount}
              {I18N.workbench.strip}
            </span>
            <span>{I18N.enterpriseCarbonAccount2.emissionSourceData}</span>
          </div>
        </div>
      )}
    </div>
  );
});
