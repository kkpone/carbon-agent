import I18N from '@src/lang/I18N';
import { Form, FormItem, Input, Cascader } from '@formily/antd-v5';
import { createForm, Form as FormType } from '@formily/core';
import { createSchemaField } from '@formily/react';
import { Drawer, Button } from 'antd';
import { pick } from 'lodash-es';
import {
  FC,
  ReactElement,
  cloneElement,
  useEffect,
  useMemo,
  forwardRef,
  useState,
  useImperativeHandle,
  useRef,
} from 'react';

import FormilyCardSelect from '@/components/FormilyUtil/FormilyCardSelect';
import { RadioGroup } from '@/components/formily/components/RadioGroup';
import { IconAlibaba } from '@/components/iconfont';
import { Toast } from '@/utils/Toast';
import { useOrgTreeData } from '@/views/dashborad/organization/components/hooks';
import { getTaskOption } from '@/views/enterpriseCarbonAccount2/TaskList/service';

import styles from './index.module.less';
import { REDUCING_TARGET, REDUCING_TARGET_LABEL } from '../constant';
import { ReducingPlan } from '../type';

const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    Cascader,
    FormilyCardSelect,
    RadioGroup,
  },
});

const ReducingPlanForm = forwardRef<FormType, { reducingPlan?: ReducingPlan }>(
  ({ reducingPlan }, ref) => {
    const form = useMemo(
      () =>
        createForm({
          initialValues: { targetSetting: REDUCING_TARGET.ABSOLUTE },
        }),
      [],
    );

    const [orgTree] = useOrgTreeData();

    useImperativeHandle(ref, () => form, [form]);

    useEffect(() => {
      form.query('orgValues').take()?.setComponentProps({ options: orgTree });
    }, [orgTree, form]);

    useEffect(() => {
      getTaskOption({}).then(({ data }) => {
        form
          .query('scopeValues')
          .take()
          ?.setComponentProps({
            options: (data.data.ghgCategoryList || []).map((ghg, index) =>
              index > 1 ? ghg : { ...ghg, classifyList: undefined },
            ),
          });
      });
    }, [form]);

    useEffect(() => {
      form.setValues({
        ...pick(reducingPlan || {}, [
          'name',
          'targetSetting',
          'scopeValues',
          'orgValues',
          'id',
        ]),
      });
    }, [form, reducingPlan]);

    return (
      <Form form={form} layout='vertical'>
        <SchemaField
          schema={{
            type: 'object',
            properties: {
              name: {
                type: 'string',
                title: I18N.carbonDataManagemen.targetName,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Input',
                'x-component-props': {
                  placeholder:
                    I18N.enterpriseCarbonAccount2.pleaseEnterTheTarget,
                },
              },
              targetSetting: {
                type: 'string',
                title: I18N.enterpriseCarbonAccount2.targetType,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'RadioGroup',
                'x-component-props': {
                  extraNode: (
                    <div className={styles.targetTip}>
                      <IconAlibaba
                        className={styles.targetTipIcon}
                        type='icon-icon_info'
                      />
                      <span className={styles.targetTipText}>
                        {I18N.enterpriseCarbonAccount2.theCurrentVersionOnly}
                      </span>
                    </div>
                  ),
                },
                enum: [
                  {
                    value: REDUCING_TARGET.ABSOLUTE,
                    label: REDUCING_TARGET_LABEL[REDUCING_TARGET.ABSOLUTE],
                  },
                  {
                    value: REDUCING_TARGET.INTENSITY,
                    label: REDUCING_TARGET_LABEL[REDUCING_TARGET.INTENSITY],
                    disabled: true,
                  },
                ],
              },
              scopeValues: {
                type: 'string',
                title: I18N.enterpriseCarbonAccount2.scopeOfInvolvement,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder:
                    I18N.enterpriseCarbonAccount2.pleaseSelectRelated,
                  multiple: true,
                  fieldNames: {
                    label: 'name',
                    children: 'classifyList',
                  },
                },
              },
              orgValues: {
                type: 'string',
                title: I18N.enterpriseCarbonAccount2.organizationalScope,
                required: true,
                'x-decorator': 'FormItem',
                'x-component': 'Cascader',
                'x-component-props': {
                  placeholder:
                    I18N.enterpriseCarbonAccount2.pleaseSelectAnOrganization,
                  multiple: true,
                },
              },
            },
          }}
        />
      </Form>
    );
  },
);

type ReducingPlanDrawerProps = {
  title: string;
  children: ReactElement;
  reducingPlan?: ReducingPlan;
  disabledText?: string;
  onConfirm: (plan: ReducingPlan) => Promise<void> | void;
};
const ReducingPlanDrawer: FC<ReducingPlanDrawerProps> = ({
  title,
  reducingPlan,
  children,
  disabledText,
  onConfirm,
}) => {
  const [open, setOpen] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const formRef = useRef<FormType>(null);

  const submit = async () => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    try {
      setSubmitLoading(true);
      const val = await form.submit<ReducingPlan>();
      await onConfirm(val);
      setOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };
  return (
    <>
      <Drawer
        title={title}
        open={open}
        width={704}
        destroyOnClose
        onClose={() => setOpen(false)}
        footer={
          <div className={styles.drawerFooter}>
            <Button className={styles.cancelBtn} onClick={() => setOpen(false)}>
              {I18N.carbonFootprint.cancel}
            </Button>
            <Button type='primary' loading={submitLoading} onClick={submit}>
              {I18N.carbonFootprint.confirm}
            </Button>
          </div>
        }
      >
        <ReducingPlanForm ref={formRef} reducingPlan={reducingPlan} />
      </Drawer>
      {cloneElement(children, {
        onClick: () => {
          const originClickFunc = (children.props as { onClick?: () => void })
            .onClick;

          if (typeof originClickFunc === 'function') {
            originClickFunc();
          }

          if (disabledText) {
            Toast('warn', disabledText);
          } else {
            setOpen(!open);
          }
        },
      })}
    </>
  );
};

export default ReducingPlanDrawer;
