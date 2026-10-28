/* eslint-disable no-empty */
/*
 * @@description: 过程库新增过程
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-03 11:33:04
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-02-13 17:34:28
 */

import I18N from '@src/lang/I18N';
import { VFC, useMemo } from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { createForm } from '@formily/core';
import { FormActions } from '@src/components/FormActions';
import ProcessLibBasicForm from '@src/views/carbonFootprint3/discharge/process/components/ProcessLibBasicForm';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import styleCarbonFootprint3 from '@src/views/carbonFootprint3/index.module.less';
import styles from '../index.module.less';
import { postProcessLibAdd } from '../service';
import { ProcessLibData } from '../type';
import { PROCESS_TAB_KEYS, URL_PARAMS_KEY } from '../constant';

const AddProcessLibrary: VFC = () => {
  const form = useMemo(() => createForm<ProcessLibData>(), []);

  const history = useHistory();

  const submit = async () => {
    try {
      const processLibData = await form.submit<ProcessLibData>();
      const { data } = await postProcessLibAdd(processLibData);
      history.push(
        `${
          RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryEdit.split(
            ':',
          )[0]
        }${data.data}?${URL_PARAMS_KEY.IS_EDIT}=true&${
          URL_PARAMS_KEY.TAB_KEY
        }=${PROCESS_TAB_KEYS.IN_OUT}`,
      );
    } catch {}
  };

  return (
    <div
      className={classNames(
        styles.mainContainer,
        styleCarbonFootprint3.carbonFootprint3,
        'm-b-60',
      )}
    >
      <ProcessLibBasicForm form={form} />
      <FormActions
        place='center'
        buttons={[
          {
            type: 'primary',
            title: I18N.carbonFootprint3.saveAndNext,
            onClick: submit,
          },
          {
            title: I18N.carbonFootprint.return,
            onClick: async () =>
              history.push(
                RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibrary,
              ),
          },
        ]}
      />
    </div>
  );
};

export default AddProcessLibrary;
