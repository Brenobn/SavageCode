import {
  AnalysisCard,
  Button,
  CodeBlock,
  DiffLine,
  ScoreRing,
  SectionTitle,
  StatusBadge,
  TableRow,
  Toggle,
} from "@/components/ui";

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
          <SectionTitle label="buttons" />
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
          <SectionTitle label="toggle" />
          <div className="flex flex-wrap items-center gap-8">
            <Toggle defaultChecked label="roast mode" />
            <Toggle label="roast mode" />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitle label="badge_status" />
          <div className="flex flex-wrap items-center gap-6">
            <StatusBadge label="critical" variant="critical" />
            <StatusBadge label="warning" variant="warning" />
            <StatusBadge label="good" variant="good" />
            <StatusBadge label="needs_serious_help" variant="critical" />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitle label="cards" />
          <AnalysisCard
            badgeLabel="critical"
            description="The var keyword is function-scoped rather than block-scoped, which can lead to unexpected behavior and bugs. Modern JavaScript uses const for immutable bindings and let for mutable ones."
            title="using var instead of const/let"
            tone="critical"
          />
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitle label="code_block" />
          <CodeBlock
            code={codeSample}
            fileName="calculate.js"
            lang="javascript"
          />
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitle label="diff_line" />
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
          <SectionTitle label="table_row" />
          <div className="overflow-hidden border border-border-primary">
            <TableRow
              codePreview="function calculateTotal(items) { var total = 0; ..."
              language="javascript"
              rank="#1"
              score="2.1"
              scoreTone="critical"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border-primary bg-bg-surface p-6">
          <SectionTitle label="score_ring" />
          <ScoreRing value={3.5} />
        </section>
      </div>
    </main>
  );
}
