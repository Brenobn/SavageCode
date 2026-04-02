"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { type ReactNode, useEffect, useRef, useState } from "react";
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
}

export function HomepageLeaderboardRow({
  collapsedCodeBlock,
  expandedCodeBlock,
  codePreview,
  language,
  rank,
  score,
  scoreTone,
}: HomepageLeaderboardRowProps) {
  const CLOSE_TRANSITION_MS = 150;

  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setOpen(nextOpen);

    if (nextOpen) {
      setHasOpened(true);
      setIsClosing(false);
      return;
    }

    if (!hasOpened) {
      return;
    }

    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      closeTimerRef.current = null;
    }, CLOSE_TRANSITION_MS);
  };

  const showExpandedContent = open || isClosing;

  return (
    <Collapsible.Root
      className="w-full border-b border-border-primary last:border-b-0"
      onOpenChange={handleOpenChange}
      open={open}
    >
      <Collapsible.Trigger className="block w-full text-left">
        <TableRowRoot
          className="cursor-pointer border-b-0"
          scoreTone={scoreTone}
        >
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
      </Collapsible.Trigger>

      <Collapsible.Panel className="h-[var(--collapsible-panel-height)] overflow-hidden border-t border-border-primary transition-all duration-150 data-[ending-style]:h-0 data-[starting-style]:h-0 [&[hidden]:not([hidden='until-found'])]:hidden">
        {showExpandedContent ? expandedCodeBlock : null}
      </Collapsible.Panel>

      {!showExpandedContent ? collapsedCodeBlock : null}
    </Collapsible.Root>
  );
}
