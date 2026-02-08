'use client';

import { useEffect, useRef } from 'react';

export function LinkRedemption() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    fetch('/api/auth/link-redemption', { method: 'POST' }).catch(() => {});
  }, []);
  return null;
}
