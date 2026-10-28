import { FormPath, createForm } from '@formily/core';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import ProcessAccountInOutTab from '@src/views/carbonFootprint3/ProcessBusinessAccounting/Management/ProcessAccountInOutTab';
import ProcessAccountSelectFactor from '@src/views/carbonFootprint3/ProcessBusinessAccounting/Management/ProcessAccountSelectFactor';
import {
  getAccountProcess,
  postProcessAccountEdit,
} from '@src/views/carbonFootprint3/ProcessBusinessAccounting/service';
import ProcessLibBasicForm from '@src/views/carbonFootprint3/discharge/process/components/ProcessLibBasicForm';
import { ProcessLibData } from '@src/views/carbonFootprint3/discharge/process/type';
import { Button } from 'antd';
import { FC, memo, useEffect, useMemo, useState } from 'react';

import { BuildModelListProcessTableProps } from './type';
import style from '../index.module.less';

export const BuildModelListProcessTable: FC<BuildModelListProcessTableProps> =
  memo(
    ({
      menuInfo,
      apiExtraParams,
      parentMenuInfo,
      accountInfo,
      isEdit,
      isOnlyDetail,
      currentWidth,
      expandedKeys,
      selectKey,
      onUpdateMenuClickBack,
      updateTreeNode,
      enableFactorSourceRange,
    }) => {
      const { id, accountName } = accountInfo;

      /** 是否显示基本信息可编辑 */
      const [showProcessInfo, setShowProcessInfo] = useState(false);

      const [infoId, setInfoId] = useState<string | number>();

      const form = useMemo(
        () => createForm<any>({ readPretty: !isEdit }),
        [isEdit],
      );

      const getProcessLibInfo = async (id: string) => {
        try {
          const {
            data: {
              data: {
                id: numberId,
                name,
                type,
                boundary,
                accountYear,
                productErea,
                processEquipment,
                productScale,
                mainMaterial,
                mainEnergy,
              },
            },
          } = await getAccountProcess({ ...apiExtraParams, id });
          setInfoId(numberId);

          form.setValues({
            name,
            type,
            boundary,
            accountYear,
            productErea,
            processEquipment,
            productScale,
            mainMaterial,
            mainEnergy,
          });

          // 过程核算必填项重新修改
          form.setFieldState('boundary', {
            required: true,
          });

          // 根节点不展示类别
          if (menuInfo.parentId === '0') {
            form.setFieldState('type', {
              visible: false,
            });
          } else {
            form.setFieldState('type', {
              visible: true,
            });
          }

          // eslint-disable-next-line no-empty
        } catch {}
      };

      /**
       * @description: 过程描述保存
       */
      const editProcessLib = async () => {
        if (infoId) {
          try {
            const processLibData = await form.submit<ProcessLibData>();
            const resp = await postProcessAccountEdit({
              ...apiExtraParams,
              ...processLibData,
              id: infoId,
            });
            Toast('success', resp.data.msg);
            getProcessLibInfo(`${infoId}`);
            form.setFieldState(
              FormPath.parse(
                '*(type,name,boundary, accountYear,productErea,processEquipment,productScale, mainMaterial, mainEnergy)',
              ),
              {
                readPretty: true,
              },
            );
            setShowProcessInfo(false);
            onUpdateMenuClickBack();

            // eslint-disable-next-line no-empty
          } catch {}
        }
      };

      useEffect(() => {
        if (menuInfo.matchType === 1) {
          getProcessLibInfo(menuInfo.id);
        }

        form.setFieldState(
          FormPath.parse(
            '*(type,boundary, name, accountYear,productErea,processEquipment,productScale, mainMaterial, mainEnergy)',
          ),
          {
            readPretty: true,
            required: false,
          },
        );
        setShowProcessInfo(false);
      }, [menuInfo]);

      return (
        <div>
          {menuInfo.matchType === 0 ? (
            <ProcessAccountSelectFactor
              apiExtraParams={apiExtraParams}
              isOnlyDetail={isOnlyDetail}
              key={menuInfo.dataId}
              processAccountId={`${id}`}
              isEdit={false}
              treeNode={menuInfo}
              currentWidth={currentWidth}
              onUpdateClick={onUpdateMenuClickBack}
              enableFactorSourceRange={enableFactorSourceRange && !isOnlyDetail}
              factorPrefId={accountInfo.factorPrefId}
            />
          ) : (
            <div className={style.tabMain} style={{ marginTop: 0 }}>
              <div className={style.tabMainContent}>
                <ProcessLibBasicForm
                  isProcessBusinessAccount
                  isProcess={false}
                  form={form}
                  isEdit={showProcessInfo}
                  processTreeInfo={menuInfo}
                  operateNode={
                    <div>
                      {showProcessInfo ? (
                        <>
                          <Button
                            onClick={async () => {
                              setShowProcessInfo(false);
                              form.setFormState({
                                readPretty: true,
                              });
                              form.setFieldState(
                                FormPath.parse(
                                  '*(type,name,boundary, accountYear,productErea,processEquipment,productScale, mainMaterial, mainEnergy)',
                                ),
                                {
                                  readPretty: true,
                                },
                              );
                              if (menuInfo.matchType === 1) {
                                getProcessLibInfo(`${menuInfo.id}`);
                              }
                            }}
                          >
                            {I18N.carbonFootprint.cancel}
                          </Button>
                          <Button
                            type='primary'
                            className='m-l-10'
                            onClick={editProcessLib}
                          >
                            {I18N.carbonFootprint.preserve}
                          </Button>
                        </>
                      ) : (
                        !isOnlyDetail && (
                          <Button
                            type='primary'
                            onClick={async () => {
                              setShowProcessInfo(true);
                              form.setFormState({
                                readPretty: false,
                              });

                              if (menuInfo.parentId === '0') {
                                form.setFieldState('name', {
                                  disabled: true,
                                });
                              } else {
                                form.setFieldState('name', {
                                  disabled: false,
                                });
                              }
                              form.setFieldState(
                                FormPath.parse(
                                  '*(type,boundary,accountYear,productErea,processEquipment,productScale, mainMaterial, mainEnergy)',
                                ),
                                {
                                  disabled: false,
                                },
                              );
                              form.setFieldState(
                                FormPath.parse(
                                  '*(type,boundary, name,accountYear)',
                                ),
                                {
                                  required: true,
                                },
                              );
                            }}
                          >
                            {I18N.carbonFootprint.edit}
                          </Button>
                        )
                      )}
                    </div>
                  }
                />
                <ProcessAccountInOutTab
                  apiExtraParams={apiExtraParams}
                  isHaveSetDetil={isOnlyDetail}
                  isEdit={isEdit}
                  id={id}
                  isProcess={false}
                  name={accountName}
                  processTreeInfo={menuInfo}
                  parentProcessNodeInfo={parentMenuInfo}
                  updateTreeNode={updateTreeNode}
                  expandedKeys={expandedKeys}
                  selectKey={selectKey}
                  enableFactorSourceRange={
                    enableFactorSourceRange && !isOnlyDetail
                  }
                  factorPrefId={accountInfo.factorPrefId}
                />
              </div>
            </div>
          )}
        </div>
      );
    },
  );
