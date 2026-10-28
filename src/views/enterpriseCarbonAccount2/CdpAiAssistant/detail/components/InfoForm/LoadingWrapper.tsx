import { Spin } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

export interface LoadingWrapperRef {
  setLoading: (loading: boolean) => void;
}

interface LoadingWrapperProps {
  children?: React.ReactNode;
  className?: string;
}

export const LoadingWrapper = forwardRef<
  LoadingWrapperRef,
  LoadingWrapperProps
>(({ children, className }, ref) => {
  const [loading, setLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    setLoading: (isLoading: boolean) => {
      setLoading(isLoading);
      if (isLoading) {
        document.body.style.cursor = 'wait';
      } else {
        setTimeout(() => {
          document.body.style.cursor = 'default';
        }, 1000);
      }
    },
  }));

  return (
    <div
      style={{
        width: '100%',
        height: loading ? '400px' : 'auto',
        position: 'absolute',
        top: '400px',
        left: 0,
        zIndex: 99,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
      <Spin spinning={loading} className={className} />
    </div>
  );
});

LoadingWrapper.displayName = 'LoadingWrapper';
