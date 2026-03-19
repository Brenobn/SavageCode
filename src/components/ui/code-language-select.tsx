"use client";

import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import {
  AUTO_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguageId,
} from "@/lib/code-languages";

export interface CodeLanguageSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  mode: "auto" | "manual";
  selectedLanguage: SupportedLanguageId;
  onModeChange?: (mode: "auto" | "manual") => void;
  onSelectedLanguageChange?: (language: SupportedLanguageId) => void;
}

export function CodeLanguageSelect({
  className,
  mode,
  selectedLanguage,
  onModeChange,
  onSelectedLanguageChange,
  ...props
}: CodeLanguageSelectProps) {
  const value = mode === "auto" ? AUTO_LANGUAGE : selectedLanguage;

  return (
    <label className="inline-flex items-center gap-2 font-mono text-xs text-text-secondary">
      <span>lang</span>
      <span className="relative inline-flex">
        <select
          className={`h-8 min-w-38 appearance-none border border-border-primary bg-bg-input py-0 pr-8 pl-2 text-xs text-text-primary outline-none focus-visible:border-border-focus ${className ?? ""}`}
          onChange={(event) => {
            const nextValue = event.target.value;

            if (nextValue === AUTO_LANGUAGE) {
              onModeChange?.("auto");
              return;
            }

            onModeChange?.("manual");
            onSelectedLanguageChange?.(nextValue as SupportedLanguageId);
          }}
          value={value}
          {...props}
        >
          <option value={AUTO_LANGUAGE}>Auto</option>
          {SUPPORTED_LANGUAGES.filter(
            (language) => language.id !== "plaintext",
          ).map((language) => (
            <option key={language.id} value={language.id}>
              {language.label}
            </option>
          ))}
          <option value="plaintext">Plaintext</option>
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-text-tertiary"
          strokeWidth={2}
        />
      </span>
    </label>
  );
}
