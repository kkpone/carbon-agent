import qrCodeImg from '@assets/svg/service_qr_code.png';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import I18N, { LocaleType } from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Modal, Popover, Tooltip } from 'antd';
import classNames from 'classnames';
import { clone } from 'lodash-es';
import { FC, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { LocaleContext } from '@/components/LocaleProvider';
import { IconAlibabaNew } from '@/components/iconfont';
import { MultipleContainers } from '@/views/workbench/components/MultipleContainers';
import {
  apiUserFunction,
  apiUserFunctionEdit,
  ProductInfo,
} from '@/views/workbench/service';

import styles from './index.module.less';

interface IFuncListProps {}

export const FuncList: FC<IFuncListProps> = () => {
  const [choseFunction, setChoseFunction] = useState<ProductInfo[]>([]);
  const [unChoseFunction, setUnChoseFunction] = useState<ProductInfo[]>([]);
  const [transChoseFunction, setTransChoseFunction] = useState<ProductInfo[]>(
    [],
  );
  const [open, setOpen] = useState(false);

  const getUseList = () => {
    apiUserFunction().then((res: any) => {
      setUnChoseFunction(res.data.data.unChoseFunction);
      setChoseFunction(clone(res.data.data.choseFunction));
    });
  };

  useMount(getUseList);

  const handleChange = async (value: ProductInfo[]) => {
    await apiUserFunctionEdit(value);
    getUseList();
  };

  const { locale } = useContext(LocaleContext);

  return (
    <div>
      <div
        className={classNames(styles.funcWrapper, {
          [styles.zhWrapper]: locale === LocaleType.zhCN,
        })}
      >
        {choseFunction.map(item =>
          item.hasPermission ? (
            <Link className={styles.func} to={item.path}>
              <IconAlibabaNew className={styles.icon} type={item.iconUrl} />
              {/* <img className={styles.icon} src={item.iconUrl} alt='' /> */}
              {item.functionName}
            </Link>
          ) : (
            <Tooltip title={I18N.workbench.youHaveNotSubscribedYet}>
              <Popover
                trigger={['click']}
                placement='bottom'
                content={
                  <div className={styles.contactBox}>
                    <div className={styles.contactText}>
                      {I18N.carbonFootprint3.contactExclusiveCustomers}
                    </div>
                    <img className={styles.img} src={qrCodeImg} alt='' />
                  </div>
                }
              >
                <div className={classNames(styles.func, styles.disabled)}>
                  <IconAlibabaNew className={styles.icon} type={item.iconUrl} />
                  {/* <img className={styles.icon} src={item.iconUrl} alt='' /> */}
                  {item.functionName}
                </div>
              </Popover>
            </Tooltip>
          ),
        )}
        <div
          className={styles.func}
          onClick={() => {
            setOpen(true);
            setTimeout(() => {
              setTransChoseFunction([...choseFunction]);
            }, 100);
          }}
        >
          <IconAlibabaNew type='icon-icon-tianjia-new' />{' '}
          {I18N.workbench.addFrequentlyUsed}
        </div>
      </div>
      <Modal
        open={open}
        destroyOnClose
        width={956}
        title={I18N.workbench.commonFunctionSettings}
        footer={null}
        onClose={() => {
          setOpen(false);
          setTransChoseFunction([]);
        }}
        onCancel={() => {
          setOpen(false);
          setTransChoseFunction([]);
        }}
      >
        <MultipleContainers
          minimal
          columns={4}
          itemCount={5}
          strategy={rectSortingStrategy}
          standingUseList={transChoseFunction}
          unUseList={unChoseFunction}
          onCancel={() => {
            setOpen(false);
            setTransChoseFunction([]);
          }}
          onOk={params => {
            handleChange(params);
            setOpen(false);
            setTransChoseFunction([]);
          }}
          containerStyle={{
            backgroundColor: '#fff',
            border: 'none',
            minHeight: 'none',
          }}
          wrapperStyle={() => ({
            width: 200,
            height: 54,
          })}
          vertical
        />
      </Modal>
    </div>
  );
};
