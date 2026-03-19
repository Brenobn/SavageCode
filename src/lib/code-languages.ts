export type LanguageMode = "auto" | "manual";

export interface SupportedLanguage {
  id: string;
  label: string;
  hljs: string;
  shiki: string;
  aliases?: string[];
  shikiLoader?: () => Promise<unknown>;
}

const languages: SupportedLanguage[] = [
  {
    id: "javascript",
    label: "JavaScript",
    hljs: "javascript",
    shiki: "javascript",
    aliases: ["js", "node"],
    shikiLoader: () => import("shiki/langs/javascript.mjs"),
  },
  {
    id: "typescript",
    label: "TypeScript",
    hljs: "typescript",
    shiki: "typescript",
    aliases: ["ts"],
    shikiLoader: () => import("shiki/langs/typescript.mjs"),
  },
  {
    id: "tsx",
    label: "TSX",
    hljs: "typescript",
    shiki: "tsx",
    aliases: ["react-tsx"],
    shikiLoader: () => import("shiki/langs/tsx.mjs"),
  },
  {
    id: "jsx",
    label: "JSX",
    hljs: "javascript",
    shiki: "jsx",
    aliases: ["react-jsx"],
    shikiLoader: () => import("shiki/langs/jsx.mjs"),
  },
  {
    id: "html",
    label: "HTML",
    hljs: "xml",
    shiki: "html",
    aliases: ["xml"],
    shikiLoader: () => import("shiki/langs/html.mjs"),
  },
  {
    id: "css",
    label: "CSS",
    hljs: "css",
    shiki: "css",
    shikiLoader: () => import("shiki/langs/css.mjs"),
  },
  {
    id: "json",
    label: "JSON",
    hljs: "json",
    shiki: "json",
    shikiLoader: () => import("shiki/langs/json.mjs"),
  },
  {
    id: "sql",
    label: "SQL",
    hljs: "sql",
    shiki: "sql",
    shikiLoader: () => import("shiki/langs/sql.mjs"),
  },
  {
    id: "bash",
    label: "Bash",
    hljs: "bash",
    shiki: "bash",
    aliases: ["shell", "sh", "zsh", "console"],
    shikiLoader: () => import("shiki/langs/bash.mjs"),
  },
  {
    id: "python",
    label: "Python",
    hljs: "python",
    shiki: "python",
    aliases: ["py"],
    shikiLoader: () => import("shiki/langs/python.mjs"),
  },
  {
    id: "java",
    label: "Java",
    hljs: "java",
    shiki: "java",
    shikiLoader: () => import("shiki/langs/java.mjs"),
  },
  {
    id: "go",
    label: "Go",
    hljs: "go",
    shiki: "go",
    aliases: ["golang"],
    shikiLoader: () => import("shiki/langs/go.mjs"),
  },
  {
    id: "php",
    label: "PHP",
    hljs: "php",
    shiki: "php",
    shikiLoader: () => import("shiki/langs/php.mjs"),
  },
  {
    id: "ruby",
    label: "Ruby",
    hljs: "ruby",
    shiki: "ruby",
    aliases: ["rb"],
    shikiLoader: () => import("shiki/langs/ruby.mjs"),
  },
  {
    id: "csharp",
    label: "C#",
    hljs: "csharp",
    shiki: "csharp",
    aliases: ["cs", "dotnet"],
    shikiLoader: () => import("shiki/langs/csharp.mjs"),
  },
  {
    id: "rust",
    label: "Rust",
    hljs: "rust",
    shiki: "rust",
    aliases: ["rs"],
    shikiLoader: () => import("shiki/langs/rust.mjs"),
  },
  {
    id: "yaml",
    label: "YAML",
    hljs: "yaml",
    shiki: "yaml",
    aliases: ["yml"],
    shikiLoader: () => import("shiki/langs/yaml.mjs"),
  },
  {
    id: "markdown",
    label: "Markdown",
    hljs: "markdown",
    shiki: "markdown",
    aliases: ["md"],
    shikiLoader: () => import("shiki/langs/markdown.mjs"),
  },
  {
    id: "dockerfile",
    label: "Dockerfile",
    hljs: "dockerfile",
    shiki: "dockerfile",
    aliases: ["docker"],
    shikiLoader: () => import("shiki/langs/dockerfile.mjs"),
  },
  {
    id: "plaintext",
    label: "Plaintext",
    hljs: "plaintext",
    shiki: "plaintext",
    aliases: ["text", "plain", "txt"],
  },
];

export const SUPPORTED_LANGUAGES = languages;

export type SupportedLanguageId = (typeof SUPPORTED_LANGUAGES)[number]["id"];

export const AUTO_LANGUAGE = "auto" as const;

const languageById = new Map(
  SUPPORTED_LANGUAGES.map((language) => [language.id, language]),
);

const allAliases = SUPPORTED_LANGUAGES.flatMap((language) => [
  language.id,
  language.hljs,
  language.shiki,
  ...(language.aliases ?? []),
]);

const aliasToId = new Map<string, SupportedLanguageId>();

for (const language of SUPPORTED_LANGUAGES) {
  const aliases = [
    language.id,
    language.hljs,
    language.shiki,
    ...(language.aliases ?? []),
  ];

  for (const alias of aliases) {
    aliasToId.set(alias.toLowerCase(), language.id);
  }
}

export const SUPPORTED_HLJS_LANGUAGES = Array.from(
  new Set(SUPPORTED_LANGUAGES.map((language) => language.hljs)),
);

export const SUPPORTED_LANGUAGE_ALIASES = Array.from(new Set(allAliases));

export function getLanguageById(id: SupportedLanguageId) {
  return languageById.get(id);
}

export function toSupportedLanguageId(
  value: string | null | undefined,
): SupportedLanguageId {
  if (!value) {
    return "plaintext";
  }

  return aliasToId.get(value.toLowerCase()) ?? "plaintext";
}
