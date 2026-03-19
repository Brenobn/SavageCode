"use client";

import {
  type ChangeEvent,
  type TextareaHTMLAttributes,
  type UIEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SupportedLanguageId } from "@/lib/code-languages";
import { CodeEditorHighlight } from "./code-editor-highlight";

export interface CodeEditorProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "defaultValue" | "onChange" | "value"
  > {
  defaultValue?: string;
  language?: SupportedLanguageId;
  languageIndicator?: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

export function CodeEditor({
  className,
  defaultValue = "",
  language = "plaintext",
  languageIndicator,
  onValueChange,
  value,
  ...props
}: CodeEditorProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isHighlightReady, setIsHighlightReady] = useState(false);
  const highlightScrollRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const lineCount = useMemo(
    () => Math.max(16, currentValue.split("\n").length),
    [currentValue],
  );

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const highlighted = highlightScrollRef.current;

    if (!highlighted) {
      return;
    }

    highlighted.scrollLeft = event.currentTarget.scrollLeft;
    highlighted.scrollTop = event.currentTarget.scrollTop;
  };

  return (
    <div className="w-full overflow-hidden border border-border-primary bg-bg-input">
      <div className="flex h-10 items-center gap-2 border-b border-border-primary px-4">
        <span className="size-3 rounded-full bg-accent-red" />
        <span className="size-3 rounded-full bg-accent-amber" />
        <span className="size-3 rounded-full bg-accent-green" />
        <div className="flex-1" />
        {languageIndicator ? (
          <span className="font-mono text-xs text-text-tertiary">
            {languageIndicator}
          </span>
        ) : null}
      </div>

      <div className="flex h-80">
        <div className="flex w-12 shrink-0 flex-col items-end gap-2 border-r border-border-primary bg-bg-surface px-3 py-4 font-mono text-xs text-text-tertiary">
          {Array.from({ length: lineCount }).map((_, index) => (
            <span key={`line-${index + 1}`}>{index + 1}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div
            className={`pointer-events-none absolute inset-0 overflow-auto p-4 ${isHighlightReady ? "opacity-100" : "opacity-0"}`}
            ref={highlightScrollRef}
          >
            <CodeEditorHighlight
              code={currentValue}
              language={language}
              onHighlightReadyChange={setIsHighlightReady}
            />
          </div>

          <textarea
            className={`relative z-10 h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-5 caret-text-primary outline-none placeholder:text-text-tertiary selection:bg-border-primary/60 ${isHighlightReady ? "text-transparent" : "text-text-primary"} ${className ?? ""}`}
            onChange={handleChange}
            onScroll={handleScroll}
            spellCheck={false}
            value={currentValue}
            {...props}
          />
        </div>
      </div>
    </div>
  );
}
