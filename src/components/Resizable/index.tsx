import close from '@src/assets/images/close-icon.svg';
import { Resizable, ResizableProps } from 're-resizable';
import { useState, CSSProperties, FC, useRef, useEffect } from 'react';

import './index.less';

const CustResizable: FC<{
  defaultPropsWidth?: number;
  style?: CSSProperties;
  resizeProp?: ResizableProps;
  childRender: () => React.ReactNode;
  resizableCurrentSize?: (size: { width: number; height: number }) => void;
}> = ({
  style,
  resizeProp,
  childRender,
  resizableCurrentSize,
  defaultPropsWidth = 220,
}) => {
  const [defaultWidth, setDefaultWidth] = useState(defaultPropsWidth);
  const resizableBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resizableCurrentSize?.({
      // @ts-ignore
      width: defaultWidth === 20 ? 20 : resizableBox.current.offsetWidth,
      // @ts-ignore
      height: resizableBox.current.offsetHeight,
    });
  }, [defaultWidth]);
  return (
    <div
      className='resizable-container'
      ref={resizableBox}
      style={{ ...style }}
    >
      <Resizable
        maxWidth={500}
        minWidth={defaultWidth === 20 ? defaultWidth : 140}
        handleWrapperClass={
          defaultWidth === 20 ? 'hidden-handle' : 'drag-handle'
        }
        enable={{ right: true }}
        defaultSize={{ width: defaultWidth, height: '100%' }}
        key={defaultWidth}
        onResize={() => {
          resizableCurrentSize?.({
            // @ts-ignore
            width: defaultWidth === 20 ? 20 : resizableBox.current.offsetWidth,
            // @ts-ignore
            height: resizableBox.current.offsetHeight,
          });
        }}
        {...resizeProp}
      >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <img
          className={
            defaultWidth === 20 ? 'close-icon closeable' : 'close-icon'
          }
          src={close}
          onClick={() => {
            setDefaultWidth(defaultWidth === 20 ? 200 : 20);
          }}
          alt=''
        />
        {defaultWidth === 20 ? '' : <div className='drag-line' />}

        {defaultWidth === 20 ? '' : childRender()}
      </Resizable>
    </div>
  );
};

export default CustResizable;
