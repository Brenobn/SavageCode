import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  AnalysisCardBadge,
  AnalysisCardDescription,
  AnalysisCardRoot,
  AnalysisCardTitle,
  Button,
  DiffLine,
  ScoreRing,
  SectionTitleRoot,
  SectionTitleSlash,
  SectionTitleText,
  StatusBadgeDot,
  StatusBadgeRoot,
  StatusBadgeText,
} from "@/components/ui";
import { CodeBlock } from "@/components/ui/code-block";
import { roastResultStatic } from "@/lib/roast-result-static";

interface ResultPageProps {
  params: Promise<{ roastId: string }>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NUMERIC_ID_REGEX = /^\d+$/;

function isValidRoastId(value: string): boolean {
  return UUID_REGEX.test(value) || NUMERIC_ID_REGEX.test(value);
}

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  await connection();

  const { roastId } = await params;

  return {
    title: `Result ${roastId.slice(0, 8)} | DevRoast`,
    description:
      "Resultado de roast com analise detalhada e sugestoes de melhoria.",
  };
}

export default function RoastResultPage({ params }: ResultPageProps) {
  return (
    <Suspense
      fallback={
        <main className="bg-bg-page text-text-primary">
          <div className="mx-auto flex w-full max-w-6xl px-10 py-10 md:px-20">
            <p className="font-mono text-xs text-text-tertiary">loading...</p>
          </div>
        </main>
      }
    >
      <RoastResultPageContent params={params} />
    </Suspense>
  );
}

async function RoastResultPageContent({ params }: ResultPageProps) {
  await connection();

  const { roastId } = await params;

  if (!isValidRoastId(roastId)) {
    notFound();
  }

  return (
    <main className="bg-bg-page text-text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-10 py-10 md:px-20">
        <section className="flex w-full flex-col items-start gap-10 md:flex-row md:items-center md:gap-12">
          <ScoreRing value={roastResultStatic.score} />

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <StatusBadgeRoot tone="critical">
              <StatusBadgeDot tone="critical" />
              <StatusBadgeText>
                {roastResultStatic.verdictLabel}
              </StatusBadgeText>
            </StatusBadgeRoot>

            <p className="font-mono text-xl leading-8 text-text-primary">
              {roastResultStatic.quote}
            </p>

            <div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
              <span>lang: {roastResultStatic.languageLabel}</span>
              <span>&middot;</span>
              <span>{roastResultStatic.submittedLineLabel}</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary">$ share_roast</Button>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex w-full flex-col gap-4">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>your_submission</SectionTitleText>
          </SectionTitleRoot>

          <CodeBlock
            className="h-[424px]"
            code={roastResultStatic.submittedCode}
            lang={roastResultStatic.languageLabel}
          />
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex w-full flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>detailed_analysis</SectionTitleText>
          </SectionTitleRoot>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {roastResultStatic.issues.map((issue) => (
              <AnalysisCardRoot key={issue.title} tone={issue.tone}>
                <AnalysisCardBadge tone={issue.tone}>
                  {issue.label}
                </AnalysisCardBadge>
                <AnalysisCardTitle>{issue.title}</AnalysisCardTitle>
                <AnalysisCardDescription>
                  {issue.description}
                </AnalysisCardDescription>
              </AnalysisCardRoot>
            ))}
          </div>
        </section>

        <div className="h-px w-full bg-border-primary" />

        <section className="flex w-full flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>suggested_fix</SectionTitleText>
          </SectionTitleRoot>

          <div className="overflow-hidden border border-border-primary bg-bg-input">
            <div className="flex h-10 items-center border-b border-border-primary px-4">
              <span className="font-mono text-xs text-text-secondary">
                {roastResultStatic.diffFileLabel}
              </span>
            </div>

            <div className="py-1">
              {roastResultStatic.diffLines.map((line, index) => (
                <DiffLine
                  code={line.code}
                  key={`${line.variant}-${index + 1}`}
                  variant={line.variant}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between font-mono text-xs text-text-tertiary">
          <span>roast id: {roastId}</span>
          <Link
            className="text-text-secondary underline-offset-4 hover:underline"
            href="/"
          >
            &lt;&lt; back to roast input
          </Link>
        </div>
      </div>
    </main>
  );
}
