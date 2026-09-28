"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatRemaining } from "@/lib/deadline";

const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Time left until the 마감 시각, counting down while the page is open. `msLeft` comes from the
 * database clock, so a wrong browser clock doesn't shift the deadline. Shortly after it passes,
 * the page is refreshed from the server, which then renders the 투표 as 마감 with its 결과.
 */
export function Countdown({ msLeft }: { msLeft: number }) {
  const router = useRouter();
  const [text, setText] = useState(() => formatRemaining(msLeft));

  useEffect(() => {
    const end = Date.now() + msLeft;
    const tick = () => setText(formatRemaining(end - Date.now()));
    const interval = setInterval(tick, 15_000);
    // +1s so the server's clock has also passed the deadline when it re-renders. Browsers fire
    // delays above ~24.8 days immediately, which would refresh in a loop, so those aren't
    // scheduled; nobody keeps a page open that long.
    const delay = Math.max(0, msLeft) + 1_000;
    const refresh = delay <= MAX_TIMEOUT_MS ? setTimeout(() => router.refresh(), delay) : undefined;
    return () => {
      clearInterval(interval);
      clearTimeout(refresh);
    };
  }, [msLeft, router]);

  return <span>{text}</span>;
}
