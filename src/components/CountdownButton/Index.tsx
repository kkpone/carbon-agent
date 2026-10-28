import I18N from '@src/lang/I18N';
import { useBoolean } from 'ahooks';
import { Button } from 'antd';
import { useState, useEffect, useCallback } from 'react';

function CountdownButton({
  onClick,
  text,
  initCount = 30,
  checkCanSubmit,
}: {
  onClick: () => Promise<any>;
  text: string;
  initCount?: number;
  checkCanSubmit?: () => boolean;
}) {
  const [counting, { setTrue, setFalse }] = useBoolean(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(initCount);

  const startCountdown = useCallback(() => {
    setTrue();
    setCount(initCount);
  }, [setTrue, initCount]);

  useEffect(() => {
    if (counting) {
      const timer = setInterval(() => {
        setCount(prevCount => prevCount - 1);
      }, 1000);
      if (count === 0) {
        setFalse();
        setCount(initCount);
      }
      return () => clearInterval(timer);
    }
    return undefined;
  }, [counting, count, setFalse, initCount]);

  const handleClick = useCallback(async () => {
    if (checkCanSubmit && !checkCanSubmit()) {
      return;
    }
    setLoading(true);
    try {
      if (!counting) {
        if (onClick) {
          await onClick();
        }
        startCountdown();
      }
    } finally {
      setLoading(false);
    }
  }, [counting, onClick, startCountdown, checkCanSubmit]);

  return (
    <Button onClick={handleClick} loading={loading}>
      {counting
        ? I18N.template(I18N.components.count, { val1: count })
        : text || I18N.components.startCountdown}
    </Button>
  );
}

export default CountdownButton;
