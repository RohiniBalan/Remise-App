import { useCallback, useEffect, useRef, useState } from 'react';
import { CountdownTimer } from '../utils/timerService';

// Ported from client/app/hooks/useCountdownTimer.ts. Used for the
// verify-email resend cooldown; reusable anywhere a screen needs a
// "seconds left" countdown.
export function useCountdownTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<CountdownTimer | null>(null);

  const start = useCallback((durationSeconds: number, onExpire?: () => void) => {
    timerRef.current?.stop();
    const timer = new CountdownTimer(durationSeconds);
    timerRef.current = timer;
    timer.start(setSecondsLeft, onExpire);
  }, []);

  const stop = useCallback(() => {
    timerRef.current?.stop();
  }, []);

  useEffect(() => () => timerRef.current?.stop(), []);

  return { secondsLeft, start, stop };
}
