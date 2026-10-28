import I18N from '@src/lang/I18N';
import { Result } from 'antd';
// import { Link } from 'react-router-dom';

const Error404 = () => (
  <Result
    style={{
      width: '100%',
    }}
    status='404'
    title='404'
    subTitle={I18N.error.theSystemPromptsYou2}
    // extra={
    //   <Button type='primary'>
    //     <Link to='/'>返回首页</Link>
    //   </Button>
    // }
  />
);

export default Error404;
