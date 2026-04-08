import { z } from "zod";

const roastVerdictSchema = z.enum([
  "needs_serious_help",
  "needs_work",
  "decent",
  "clean",
]);

const findingToneSchema = z.enum(["critical", "warning", "good", "muted"]);
const diffLineTypeSchema = z.enum(["context", "removed", "added"]);

const roastPayloadSchema = z.object({
  score: z.number().min(0).max(10),
  verdict: roastVerdictSchema,
  roastQuote: z.string().min(1),
  findings: z.array(
    z.object({
      position: z.number().int().nonnegative(),
      tone: findingToneSchema,
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
  diffLines: z.array(
    z.object({
      position: z.number().int().nonnegative(),
      lineType: diffLineTypeSchema,
      content: z.string(),
    }),
  ),
});

const roastResponseSchema = z.object({
  output_parsed: z.unknown().optional(),
  output: z.unknown().optional(),
});

export type AnalyzeRoastInput = {
  code: string;
  language: string;
  roastMode: "normal" | "maximum";
};

export type AnalyzeRoastDeps = {
  fetchImpl?: typeof fetch;
  apiKey?: string;
  model?: string;
};

export type RoastPayload = z.infer<typeof roastPayloadSchema>;

export class RoastAnalyzerError extends Error {
  public readonly cause?: unknown;

  public constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "RoastAnalyzerError";
    this.cause = cause;
  }
}

const roastPayloadJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "number", minimum: 0, maximum: 10 },
    verdict: {
      type: "string",
      enum: roastVerdictSchema.options,
    },
    roastQuote: { type: "string", minLength: 1 },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          position: { type: "integer", minimum: 0 },
          tone: {
            type: "string",
            enum: findingToneSchema.options,
          },
          title: { type: "string", minLength: 1 },
          description: { type: "string", minLength: 1 },
        },
        required: ["position", "tone", "title", "description"],
      },
    },
    diffLines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          position: { type: "integer", minimum: 0 },
          lineType: {
            type: "string",
            enum: diffLineTypeSchema.options,
          },
          content: { type: "string" },
        },
        required: ["position", "lineType", "content"],
      },
    },
  },
  required: ["score", "verdict", "roastQuote", "findings", "diffLines"],
} as const;

export async function analyzeRoast(
  input: AnalyzeRoastInput,
  deps: AnalyzeRoastDeps = {},
): Promise<RoastPayload> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const apiKey = deps.apiKey ?? process.env.OPENAI_API_KEY;
  const model = deps.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    throw new RoastAnalyzerError("OPENAI_API_KEY is required");
  }

  let response: Response;
  try {
    response = await fetchImpl("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content:
              "You are DevRoast. Return only valid JSON that strictly matches the provided schema.",
          },
          {
            role: "user",
            content: `language=${input.language}\nmode=${input.roastMode}\ncode:\n${input.code}`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "roast_payload",
            strict: true,
            schema: roastPayloadJsonSchema,
          },
        },
      }),
    });
  } catch (error) {
    throw new RoastAnalyzerError("AI provider request failed", error);
  }

  if (!response.ok) {
    throw new RoastAnalyzerError(
      `AI provider request failed with status ${response.status}`,
    );
  }

  let responseJson: unknown;
  try {
    responseJson = await response.json();
  } catch (error) {
    throw new RoastAnalyzerError("Invalid AI provider JSON response", error);
  }

  const envelope = roastResponseSchema.safeParse(responseJson);

  if (!envelope.success) {
    throw new RoastAnalyzerError(
      "Invalid AI provider response envelope",
      envelope.error,
    );
  }

  const parsed = roastPayloadSchema.safeParse(
    envelope.data.output_parsed ?? envelope.data.output,
  );

  if (!parsed.success) {
    throw new RoastAnalyzerError(
      "Invalid roast payload from AI provider",
      parsed.error,
    );
  }

  return parsed.data;
}
