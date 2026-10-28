/**
 * @file 协议页面
 */
import I18N from '@src/lang/I18N';
import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import './style.module.scss';

export enum Agreements {
  '/agreement' = '隐私协议',
  '隐私协议' = '/agreement',
  '服务协议' = '/server-agreement',
  '/server-agreement' = '服务协议',
}

const Agreement = () => {
  const [list, setList] = useState('');
  const getAgreement = () => {
    // @ts-ignore
    // Agreements[pathname] === '隐私协议'
    //   ? privacy().then((res: any) => {
    //       res.data.data.length !== 0
    //         ? setList(res.data.data[0].content)
    //         : setList('');
    //     })
    //   : service().then((res: any) => {
    //       res.data.data.length !== 0
    //         ? setList(res.data.data[0].content)
    //         : setList('');
    //     });

    setList('');
  };
  useEffect(() => {
    getAgreement();
  }, []);

  return list === '' ? (
    <div
      className='agreement_loading'
      style={{ textAlign: 'center', marginTop: '300px' }}
    >
      <Spin tip={I18N.system.protocolLoading} />
    </div>
  ) : (
    <div className='agreement'>
      <div className='contents' dangerouslySetInnerHTML={{ __html: list }} />
    </div>
  );
};
export default Agreement;
