import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import php from "highlight.js/lib/languages/php";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import {
  SUPPORTED_HLJS_LANGUAGES,
  type SupportedLanguageId,
  toSupportedLanguageId,
} from "@/lib/code-languages";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("css", css);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("go", go);
hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("php", php);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("python", python);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("yaml", yaml);

interface DetectLanguageResult {
  confidence: "high" | "low";
  language: SupportedLanguageId;
}

const MIN_SNIPPET_LENGTH = 12;
const MIN_RELEVANCE = 4;
const MIN_RELEVANCE_GAP = 2;

export function detectLanguage(input: string): DetectLanguageResult {
  const code = input.trim();

  if (code.length < MIN_SNIPPET_LENGTH) {
    return {
      confidence: "low",
      language: "plaintext",
    };
  }

  const result = hljs.highlightAuto(code, SUPPORTED_HLJS_LANGUAGES);

  if (!result.language) {
    return {
      confidence: "low",
      language: "plaintext",
    };
  }

  const relevanceGap =
    result.relevance -
    (result.secondBest?.relevance !== undefined
      ? result.secondBest.relevance
      : 0);

  const isHighConfidence =
    result.relevance >= MIN_RELEVANCE && relevanceGap >= MIN_RELEVANCE_GAP;

  return {
    confidence: isHighConfidence ? "high" : "low",
    language: toSupportedLanguageId(result.language),
  };
}
