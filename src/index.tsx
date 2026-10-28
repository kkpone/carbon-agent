import { BrowserTracing } from '@sentry/browser';
import * as Sentry from '@sentry/react';
import I18N from '@src/lang/I18N';
import { Empty, App as AntdApp } from 'antd';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import 'antd/dist/reset.css';

import './styles/index.less';
import './styles/public.scss';

import App from './App';
import FeishuLoginGate from './components/FeishuLoginGate';
import { AntdProvider } from './components/AntProvider';
import { LocaleProvider } from './components/LocaleProvider';
import { SubscriptionServiceModalProvider } from './components/SubscriptionServiceModal';
import store from './store';

if (typeof window !== 'undefined' && window.location.search.startsWith('?/')) {
  const decoded = window.location.search
    .slice(1)
    .split('&')
    .map(segment => segment.replace(/~and~/g, '&'))
    .join('?');
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname.replace(/\/$/, '')}${decoded}${window.location.hash}`,
  );
}

if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line no-underscore-dangle
  (
    window as unknown as { __FORMILY_DEV_TOOLS_HOOK__: null }
  ).__FORMILY_DEV_TOOLS_HOOK__ = null;
}

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_RELEASE) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [new BrowserTracing()],
    release: process.env.REACT_APP_RELEASE,
    beforeSend: (event, hint) => {
      const error = hint?.originalException;

      if (
        error instanceof Array &&
        error.some(
          (exception: { code: string }) => exception.code === 'ValidateError',
        )
      ) {
        // eslint-disable-next-line no-console
        console.warn('Sentry: Ignored Formily validation error.', error);
        return null;
      }

      if ((error as { errorFields: any[] })?.errorFields?.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('Sentry: Ignored Antd form validation error.', error);
        return null;
      }

      if (axios.isCancel(error)) {
        // eslint-disable-next-line no-console
        console.log('Sentry: Ignored Axios request canceled.', error);
        return null;
      }

      return event;
    },
  });
}

// 暂无数据
export const customizeRenderEmpty = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description={
      <span>{I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}</span>
    }
  />
);

const root = createRoot(document.getElementById('root'));

root.render(
  <FeishuLoginGate>
    <LocaleProvider>
      <AntdProvider>
        <SubscriptionServiceModalProvider>
          <AntdApp>
            <Provider store={store}>
              <App />
            </Provider>
          </AntdApp>
        </SubscriptionServiceModalProvider>
      </AntdProvider>
    </LocaleProvider>
  </FeishuLoginGate>,
);
