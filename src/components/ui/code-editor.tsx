"use client";

import {
  type ChangeEvent,
  type TextareaHTMLAttributes,
  useMemo,
  useState,
} from "react";

export interface CodeEditorProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "defaultValue" | "onChange" | "value"
  > {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

export function CodeEditor({
  className,
  defaultValue = "",
  onValueChange,
  value,
  ...props
}: CodeEditorProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
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

  return (
    <div className="w-full overflow-hidden border border-border-primary bg-bg-input">
      <div className="flex h-10 items-center gap-2 border-b border-border-primary px-4">
        <span className="size-3 rounded-full bg-accent-red" />
        <span className="size-3 rounded-full bg-accent-amber" />
        <span className="size-3 rounded-full bg-accent-green" />
      </div>

      <div className="flex h-[320px]">
        <div className="flex w-12 shrink-0 flex-col items-end gap-2 border-r border-border-primary bg-bg-surface px-3 py-4 font-mono text-xs text-text-tertiary">
          {Array.from({ length: lineCount }).map((_, index) => (
            <span key={`line-${index + 1}`}>{index + 1}</span>
          ))}
        </div>

        <textarea
          className={`h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-5 text-text-primary outline-none placeholder:text-text-tertiary ${className ?? ""}`}
          onChange={handleChange}
          spellCheck={false}
          value={currentValue}
          {...props}
        />
      </div>
    </div>
  );
}
