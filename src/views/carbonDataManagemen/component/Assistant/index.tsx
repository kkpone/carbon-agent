/**
 * @file 碳数据助手
 */
import I18N from '@src/lang/I18N';
import { FC, CSSProperties, useState } from 'react';
import { Divider, Button } from 'antd';
import './style.less';
import { FeedBackModal } from '@components/Factor/FeedBackModal/index';
import { FeedBackType } from '@src/components/Factor/utils';

const Assistant: FC<{
  style?: CSSProperties;
  listArr: { title: string; content: string }[];
}> = ({ style, listArr }) => {
  const [isVisable, changeIsVisAble] = useState(false);

  return (
    <div className='assistant' style={{ ...style }}>
      {listArr.map(item => (
        <>
          <h1>{item.title}</h1>
          <p>{item.content}</p>
          <Divider style={{ marginTop: '0', marginBottom: '20px' }} />
        </>
      ))}
      <p>
        {I18N.carbonDataManagemen.moreQuestionsCanBeAsked}{' '}
        <Button
          type='link'
          onClick={() => {
            changeIsVisAble(true);
          }}
          style={{ margin: '0', fontSize: '12px', padding: 0 }}
        >
          {I18N.carbonDataManagemen.clickOnFeedback}</Button>{' '}
        {I18N.carbonDataManagemen.afterReceivingTheMessage}</p>
      <FeedBackModal
        type={FeedBackType.other}
        visible={isVisable}
        onOk={() => {
          changeIsVisAble(false);
        }}
        onCancel={() => {
          changeIsVisAble(false);
        }}
      />
    </div>
  );
};

export default Assistant;
