import "server-only";

import { type BundledLanguage, codeToHtml } from "shiki";

export interface CodeBlockProps {
  code: string;
  fileName?: string;
  lang: BundledLanguage;
  showLineNumbers?: boolean;
}

export async function CodeBlock({
  code,
  fileName,
  lang,
  showLineNumbers = true,
}: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: "vesper",
  });

  const lineNumbers = code.split("\n").map((_, index) => index + 1);

  return (
    <div className="w-full overflow-hidden border border-border-primary bg-bg-input">
      <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
        <span className="size-2.5 rounded-full bg-accent-red" />
        <span className="size-2.5 rounded-full bg-accent-amber" />
        <span className="size-2.5 rounded-full bg-accent-green" />
        <div className="flex-1" />
        {fileName ? (
          <span className="font-mono text-xs text-text-tertiary">
            {fileName}
          </span>
        ) : null}
      </div>

      <div className="flex">
        {showLineNumbers ? (
          <div className="flex shrink-0 flex-col items-end gap-1 border-r border-border-primary bg-bg-surface px-2.5 py-3 font-mono text-[13px] text-text-tertiary">
            {lineNumbers.map((lineNumber) => (
              <span key={lineNumber}>{lineNumber}</span>
            ))}
          </div>
        ) : null}

        <div
          className="min-w-0 flex-1 overflow-x-auto p-3 [&_code]:font-mono [&_pre]:m-0"
          /* biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated server-side by Shiki from source code. */
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
