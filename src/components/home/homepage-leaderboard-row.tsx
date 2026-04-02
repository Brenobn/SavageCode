"use client";

import type { ReactNode } from "react";
import { ExpandableCodeBlock } from "@/components/home/expandable-code-block";
import {
  TableRowCode,
  TableRowLanguage,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
} from "@/components/ui";

export interface HomepageLeaderboardRowProps {
  collapsedCodeBlock: ReactNode;
  expandedCodeBlock: ReactNode;
  codePreview: string;
  language: string;
  rank: string;
  score: number;
  scoreTone: "critical" | "warning" | "good" | "muted";
  hasMoreLines: boolean;
}

export function HomepageLeaderboardRow({
  collapsedCodeBlock,
  expandedCodeBlock,
  codePreview,
  language,
  rank,
  score,
  scoreTone,
  hasMoreLines,
}: HomepageLeaderboardRowProps) {
  return (
    <div className="w-full border-b border-border-primary last:border-b-0">
      <TableRowRoot className="border-b-0" scoreTone={scoreTone}>
        <TableRowRank>{rank}</TableRowRank>

        <div className="w-15">
          <TableRowScore scoreTone={scoreTone}>
            {score.toFixed(1)}
          </TableRowScore>
        </div>

        <TableRowCode>
          <p className="truncate">{codePreview}</p>
        </TableRowCode>

        <TableRowLanguage>{language}</TableRowLanguage>
      </TableRowRoot>

      <ExpandableCodeBlock
        collapsedContent={collapsedCodeBlock}
        expandedContent={expandedCodeBlock}
        hasMoreLines={hasMoreLines}
      />
    </div>
  );
}
