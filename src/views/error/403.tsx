import I18N from '@src/lang/I18N';
import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const Error403 = () => (
  <Result
    style={{
      width: '100%',
    }}
    status='403'
    title='403'
    subTitle={I18N.error.theSystemPromptsYou}
    extra={
      <Button type='primary'>
        <Link to='/'>{I18N.error.returnToHomepage}</Link>
      </Button>
    }
  />
);

export default Error403;
