import I18N from '@src/lang/I18N';
import * as Sentry from '@sentry/react';
import { Button, Result } from 'antd';
import { Component, ReactNode } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { getUserInfo } from '@/utils';

import styles from './index.module.less';

type ErrorBoundaryProps = {
  children: ReactNode;
  boundaryName: string;
} & RouteComponentProps;
type ErrorBoundaryState = {
  hasError: boolean;
  lastLocation: ErrorBoundaryProps['location'];
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      lastLocation: props.location,
    };
  }

  static getDerivedStateFromError(): Pick<ErrorBoundaryState, 'hasError'> {
    return { hasError: true };
  }

  componentDidUpdate() {
    const { location } = this.props;
    const { lastLocation } = this.state;

    if (location.pathname !== lastLocation.pathname && this.state.hasError) {
      // 路由变化后清空hasError状态
      this.setState({
        hasError: false,
        lastLocation: location,
      });
    }
  }

  componentDidCatch(err: Error, errorInfo: React.ErrorInfo) {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.REACT_APP_RELEASE
    ) {
      const { boundaryName } = this.props;
      const level = boundaryName === 'layout_boundary' ? 'fatal' : 'error';

      Sentry.withScope(scope => {
        scope.setLevel(level);

        scope.setTag('error_boundary_name', boundaryName);
        scope.setTag('error_level', level);
        scope.setTag('react_lifecycle_method', 'componentDidCatch');

        scope.setExtra('componentStack', errorInfo.componentStack);

        // 设置受影响的用户信息
        const userInfo = getUserInfo()?.userInfo;

        if (userInfo) {
          const { userId, username, mobile, email, companyId, companyName } =
            userInfo;

          scope.setUser({
            userId,
            userName: username,
            email,
            data: {
              mobile,
              companyId,
              companyName,
            },
          });
        }

        scope.addBreadcrumb({
          category: 'ErrorBoundary',
          message: `ErrorBoundary '${this.props.boundaryName}' caught an error.`,
          level,
        });

        Sentry.captureException(err);
      });
    }

    // eslint-disable-next-line
    console.warn('main Page crash with error: ', err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback}>
          <Result
            className={styles.fallbackResult}
            status='warning'
            title='Error'
            subTitle='Sorry, something went wrong'
            extra={[
              <Button type='primary' onClick={() => window.location.reload()}>
                {I18N.components.refreshThePage}
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default withRouter(ErrorBoundary);
