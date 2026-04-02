"use client";

import { type ReactNode, useState } from "react";

export interface ExpandableCodeBlockProps {
  collapsedContent: ReactNode;
  expandedContent: ReactNode;
  hasMoreLines: boolean;
}

export function ExpandableCodeBlock({
  collapsedContent,
  expandedContent,
  hasMoreLines,
}: ExpandableCodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {isExpanded ? expandedContent : collapsedContent}

      {hasMoreLines ? (
        <div className="flex justify-center border-t border-border-primary bg-bg-input px-4 py-2">
          <button
            className={`cursor-pointer font-mono text-xs underline-offset-4 hover:text-accent-green hover:underline ${isExpanded ? "text-accent-green" : "text-accent-green/60"}`}
            onClick={() => setIsExpanded((current) => !current)}
            type="button"
          >
            {isExpanded ? "show less" : "show more"}
          </button>
        </div>
      ) : null}
    </>
  );
}
