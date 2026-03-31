"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";

export function HomepageMetrics() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.metrics.homepage.queryOptions());

  const [animatedTotalRoasts, setAnimatedTotalRoasts] = useState(0);
  const [animatedAverageScore, setAnimatedAverageScore] = useState(0);

  useEffect(() => {
    if (!data) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      setAnimatedTotalRoasts(data.totalRoasts);
      setAnimatedAverageScore(data.averageScore);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [data]);

  return (
    <div className="flex items-center justify-center gap-6 pb-14 font-sans text-xs text-text-tertiary">
      <span>
        <NumberFlow
          format={{ useGrouping: true }}
          value={animatedTotalRoasts}
        />{" "}
        codes roasted
      </span>
      <span className="font-mono">.</span>
      <span>
        avg score:{" "}
        <NumberFlow
          format={{ maximumFractionDigits: 1, minimumFractionDigits: 1 }}
          value={animatedAverageScore}
        />
        /10
      </span>
    </div>
  );
}
