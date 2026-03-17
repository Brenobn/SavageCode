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
  TableRowCode,
  TableRowLanguage,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
  ToggleControl,
  ToggleLabel,
  ToggleRoot,
  ToggleThumb,
} from "@/components/ui";
import { CodeBlock } from "@/components/ui/code-block";

const buttonVariants = ["primary", "secondary", "link", "danger"] as const;
const buttonSizes = ["sm", "md", "lg", "icon"] as const;

const codeSample = [
  "function calculateTotal(items) {",
  "  var total = 0;",
  "  for (let i = 0; i < items.length; i++) {",
  "    total += items[i].price;",
  "  }",
  "  return total;",
  "}",
].join("\n");

export default function ComponentsPage() {
  return (
    <main className="min-h-screen bg-bg-page px-6 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <header className="space-y-2">
          <h1 className="font-mono text-2xl font-bold">UI Components</h1>
          <p className="font-sans text-sm text-text-secondary">
            Preview dos componentes reutilizaveis.
          </p>
        </header>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>buttons</SectionTitleText>
          </SectionTitleRoot>
          <div className="space-y-5">
            {buttonVariants.map((variant) => (
              <div className="space-y-3" key={variant}>
                <p className="font-sans text-xs tracking-wide uppercase text-text-tertiary">
                  {variant}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {buttonSizes.map((size) => (
                    <Button
                      key={`${variant}-${size}`}
                      size={size}
                      variant={variant}
                    >
                      {size === "icon" ? "$" : `$ ${variant}_${size}`}
                    </Button>
                  ))}

                  <Button disabled variant={variant}>
                    $ disabled
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>toggle</SectionTitleText>
          </SectionTitleRoot>
          <div className="flex flex-wrap items-center gap-8">
            <ToggleRoot defaultChecked>
              <ToggleControl>
                <ToggleThumb />
              </ToggleControl>
              <ToggleLabel>roast mode</ToggleLabel>
            </ToggleRoot>

            <ToggleRoot>
              <ToggleControl>
                <ToggleThumb />
              </ToggleControl>
              <ToggleLabel>roast mode</ToggleLabel>
            </ToggleRoot>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>badge_status</SectionTitleText>
          </SectionTitleRoot>
          <div className="flex flex-wrap items-center gap-6">
            <StatusBadgeRoot tone="critical">
              <StatusBadgeDot tone="critical" />
              <StatusBadgeText>critical</StatusBadgeText>
            </StatusBadgeRoot>
            <StatusBadgeRoot tone="warning">
              <StatusBadgeDot tone="warning" />
              <StatusBadgeText>warning</StatusBadgeText>
            </StatusBadgeRoot>
            <StatusBadgeRoot tone="good">
              <StatusBadgeDot tone="good" />
              <StatusBadgeText>good</StatusBadgeText>
            </StatusBadgeRoot>
            <StatusBadgeRoot tone="critical">
              <StatusBadgeDot tone="critical" />
              <StatusBadgeText>needs_serious_help</StatusBadgeText>
            </StatusBadgeRoot>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>cards</SectionTitleText>
          </SectionTitleRoot>
          <AnalysisCardRoot tone="critical">
            <AnalysisCardBadge tone="critical">critical</AnalysisCardBadge>
            <AnalysisCardTitle>
              using var instead of const/let
            </AnalysisCardTitle>
            <AnalysisCardDescription>
              The var keyword is function-scoped rather than block-scoped, which
              can lead to unexpected behavior and bugs. Modern JavaScript uses
              const for immutable bindings and let for mutable ones.
            </AnalysisCardDescription>
          </AnalysisCardRoot>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>code_block</SectionTitleText>
          </SectionTitleRoot>
          <CodeBlock
            code={codeSample}
            fileName="calculate.js"
            lang="javascript"
          />
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>diff_line</SectionTitleText>
          </SectionTitleRoot>
          <div className="space-y-1 overflow-hidden border border-border-primary">
            <DiffLine code="var total = 0;" variant="removed" />
            <DiffLine code="const total = 0;" variant="added" />
            <DiffLine
              code="for (let i = 0; i < items.length; i++) {"
              variant="context"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>table_row</SectionTitleText>
          </SectionTitleRoot>
          <div className="overflow-hidden border border-border-primary">
            <TableRowRoot scoreTone="critical">
              <TableRowRank>#1</TableRowRank>
              <div className="w-15">
                <TableRowScore scoreTone="critical">2.1</TableRowScore>
              </div>
              <TableRowCode>
                <p className="truncate">
                  function calculateTotal(items) {`{`} var total = 0; ...
                </p>
              </TableRowCode>
              <TableRowLanguage>javascript</TableRowLanguage>
            </TableRowRoot>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitleRoot>
            <SectionTitleSlash />
            <SectionTitleText>score_ring</SectionTitleText>
          </SectionTitleRoot>
          <ScoreRing value={3.5} />
        </section>
      </div>
    </main>
  );
}
