export interface LeaderboardEntry {
  rank: string;
  score: string;
  codePreview: string;
  language: string;
  lineCount: number;
  submittedAt: string;
  scoreTone: "critical" | "warning" | "good" | "muted";
  codeLines: LeaderboardCodeLine[];
}

export type LeaderboardTokenTone =
  | "keyword"
  | "function"
  | "operator"
  | "string"
  | "variable"
  | "number"
  | "comment";

export interface LeaderboardCodeToken {
  content: string;
  tone: LeaderboardTokenTone;
}

export interface LeaderboardCodeLine {
  tokens: LeaderboardCodeToken[];
}

export const leaderboardEntries: LeaderboardEntry[] = [
  {
    rank: "#1",
    score: "1.2",
    codePreview: 'eval(prompt("enter code"))',
    language: "javascript",
    lineCount: 3,
    submittedAt: "2026-03-23",
    scoreTone: "critical",
    codeLines: [
      {
        tokens: [
          { content: "eval", tone: "function" },
          { content: "(", tone: "operator" },
          { content: "prompt", tone: "function" },
          { content: "(", tone: "operator" },
          { content: '"enter code"', tone: "string" },
          { content: "))", tone: "operator" },
        ],
      },
      {
        tokens: [
          { content: "document", tone: "variable" },
          { content: ".write", tone: "function" },
          { content: "(", tone: "operator" },
          { content: "response", tone: "variable" },
          { content: ")", tone: "operator" },
        ],
      },
      {
        tokens: [{ content: "// trust the user lol", tone: "comment" }],
      },
    ],
  },
  {
    rank: "#2",
    score: "1.8",
    codePreview: "if (x == true) { return true; }",
    language: "typescript",
    lineCount: 3,
    submittedAt: "2026-03-23",
    scoreTone: "critical",
    codeLines: [
      {
        tokens: [
          { content: "if", tone: "keyword" },
          { content: " (", tone: "operator" },
          { content: "x", tone: "variable" },
          { content: " == ", tone: "operator" },
          { content: "true", tone: "keyword" },
          { content: ") { ", tone: "operator" },
          { content: "return", tone: "keyword" },
          { content: " true", tone: "keyword" },
          { content: "; }", tone: "operator" },
        ],
      },
      {
        tokens: [
          { content: "else if", tone: "keyword" },
          { content: " (", tone: "operator" },
          { content: "x", tone: "variable" },
          { content: " == ", tone: "operator" },
          { content: "false", tone: "keyword" },
          { content: ") { ", tone: "operator" },
          { content: "return", tone: "keyword" },
          { content: " false", tone: "keyword" },
          { content: "; }", tone: "operator" },
        ],
      },
      {
        tokens: [
          { content: "else", tone: "keyword" },
          { content: " { ", tone: "operator" },
          { content: "return", tone: "keyword" },
          { content: " !", tone: "operator" },
          { content: "false", tone: "keyword" },
          { content: "; }", tone: "operator" },
        ],
      },
    ],
  },
  {
    rank: "#3",
    score: "2.1",
    codePreview: "SELECT * FROM users WHERE 1=1",
    language: "sql",
    lineCount: 2,
    submittedAt: "2026-03-22",
    scoreTone: "warning",
    codeLines: [
      {
        tokens: [
          { content: "SELECT", tone: "keyword" },
          { content: " * ", tone: "operator" },
          { content: "FROM", tone: "keyword" },
          { content: " users ", tone: "variable" },
          { content: "WHERE", tone: "keyword" },
          { content: " 1", tone: "number" },
          { content: "=", tone: "operator" },
          { content: "1", tone: "number" },
        ],
      },
      {
        tokens: [{ content: "-- TODO: add authentication", tone: "comment" }],
      },
    ],
  },
  {
    rank: "#4",
    score: "2.3",
    codePreview: "catch (e) { // ignore }",
    language: "java",
    lineCount: 3,
    submittedAt: "2026-03-22",
    scoreTone: "warning",
    codeLines: [
      {
        tokens: [
          { content: "catch", tone: "keyword" },
          { content: " (", tone: "operator" },
          { content: "e", tone: "variable" },
          { content: ") {", tone: "operator" },
        ],
      },
      {
        tokens: [{ content: "  // ignore", tone: "comment" }],
      },
      {
        tokens: [{ content: "}", tone: "operator" }],
      },
    ],
  },
  {
    rank: "#5",
    score: "2.5",
    codePreview: "const sleep = (ms) => ...",
    language: "javascript",
    lineCount: 3,
    submittedAt: "2026-03-21",
    scoreTone: "warning",
    codeLines: [
      {
        tokens: [
          { content: "const", tone: "keyword" },
          { content: " sleep", tone: "function" },
          { content: " = (", tone: "operator" },
          { content: "ms", tone: "variable" },
          { content: ") =>", tone: "operator" },
        ],
      },
      {
        tokens: [
          { content: "  new", tone: "keyword" },
          { content: " Date", tone: "function" },
          { content: "(", tone: "operator" },
          { content: "Date", tone: "function" },
          { content: ".now", tone: "function" },
          { content: "() + ", tone: "operator" },
          { content: "ms", tone: "variable" },
          { content: ")", tone: "operator" },
        ],
      },
      {
        tokens: [
          { content: "  while", tone: "keyword" },
          { content: "(new", tone: "keyword" },
          { content: " Date", tone: "function" },
          { content: "() < ", tone: "operator" },
          { content: "end", tone: "variable" },
          { content: ") {}", tone: "operator" },
        ],
      },
    ],
  },
  {
    rank: "#6",
    score: "3.4",
    codePreview: "for (i = 0; i < list.length; i++) doWork(list[i])",
    language: "javascript",
    lineCount: 43,
    submittedAt: "2026-03-19",
    scoreTone: "warning",
    codeLines: [
      {
        tokens: [
          {
            content: "for (i = 0; i < list.length; i++) doWork(list[i])",
            tone: "operator",
          },
        ],
      },
    ],
  },
  {
    rank: "#7",
    score: "3.6",
    codePreview: "password = request.body.password // plain text",
    language: "python",
    lineCount: 29,
    submittedAt: "2026-03-19",
    scoreTone: "warning",
    codeLines: [
      {
        tokens: [
          {
            content: "password = request.body.password // plain text",
            tone: "comment",
          },
        ],
      },
    ],
  },
  {
    rank: "#8",
    score: "3.9",
    codePreview: "fetch(url).then((r) => r.json()).then(save)",
    language: "javascript",
    lineCount: 25,
    submittedAt: "2026-03-18",
    scoreTone: "muted",
    codeLines: [
      {
        tokens: [
          {
            content: "fetch(url).then((r) => r.json()).then(save)",
            tone: "function",
          },
        ],
      },
    ],
  },
  {
    rank: "#9",
    score: "4.1",
    codePreview: "const map = {}; list.map((item) => (map[item.id] = item));",
    language: "typescript",
    lineCount: 41,
    submittedAt: "2026-03-18",
    scoreTone: "muted",
    codeLines: [
      {
        tokens: [
          {
            content:
              "const map = {}; list.map((item) => (map[item.id] = item));",
            tone: "operator",
          },
        ],
      },
    ],
  },
  {
    rank: "#10",
    score: "4.3",
    codePreview: "try { doWork(); } catch (e) {}",
    language: "go",
    lineCount: 18,
    submittedAt: "2026-03-17",
    scoreTone: "muted",
    codeLines: [
      {
        tokens: [
          { content: "try { doWork(); } catch (e) {}", tone: "keyword" },
        ],
      },
    ],
  },
  {
    rank: "#11",
    score: "4.5",
    codePreview: "if (user) setAdmin(true);",
    language: "typescript",
    lineCount: 33,
    submittedAt: "2026-03-17",
    scoreTone: "muted",
    codeLines: [
      {
        tokens: [
          { content: "if", tone: "keyword" },
          { content: " (", tone: "operator" },
          { content: "user", tone: "variable" },
          { content: ") ", tone: "operator" },
          { content: "setAdmin", tone: "function" },
          { content: "(", tone: "operator" },
          { content: "true", tone: "keyword" },
          { content: ");", tone: "operator" },
        ],
      },
    ],
  },
  {
    rank: "#12",
    score: "4.7",
    codePreview: "SELECT password FROM users;",
    language: "sql",
    lineCount: 4,
    submittedAt: "2026-03-16",
    scoreTone: "muted",
    codeLines: [
      {
        tokens: [
          { content: "SELECT", tone: "keyword" },
          { content: " password ", tone: "variable" },
          { content: "FROM", tone: "keyword" },
          { content: " users", tone: "variable" },
          { content: ";", tone: "operator" },
        ],
      },
    ],
  },
  {
    rank: "#13",
    score: "4.8",
    codePreview: "console.log(process.env)",
    language: "javascript",
    lineCount: 1,
    submittedAt: "2026-03-16",
    scoreTone: "muted",
    codeLines: [
      {
        tokens: [
          { content: "console", tone: "variable" },
          { content: ".log", tone: "function" },
          { content: "(", tone: "operator" },
          { content: "process", tone: "variable" },
          { content: ".env", tone: "variable" },
          { content: ")", tone: "operator" },
        ],
      },
    ],
  },
  {
    rank: "#14",
    score: "5.0",
    codePreview: "arr.sort(() => Math.random() - 0.5)",
    language: "javascript",
    lineCount: 7,
    submittedAt: "2026-03-15",
    scoreTone: "good",
    codeLines: [
      {
        tokens: [
          { content: "arr", tone: "variable" },
          { content: ".sort", tone: "function" },
          { content: "(() => ", tone: "operator" },
          { content: "Math", tone: "variable" },
          { content: ".random", tone: "function" },
          { content: "() - ", tone: "operator" },
          { content: "0.5", tone: "number" },
          { content: ")", tone: "operator" },
        ],
      },
    ],
  },
  {
    rank: "#15",
    score: "5.2",
    codePreview: "while(true){ queue.push(job()) }",
    language: "python",
    lineCount: 12,
    submittedAt: "2026-03-15",
    scoreTone: "good",
    codeLines: [
      {
        tokens: [
          { content: "while", tone: "keyword" },
          { content: " true", tone: "keyword" },
          { content: ":", tone: "operator" },
        ],
      },
      {
        tokens: [{ content: "    queue.append(run_job())", tone: "function" }],
      },
    ],
  },
  {
    rank: "#16",
    score: "5.3",
    codePreview: "const retries = Infinity",
    language: "typescript",
    lineCount: 16,
    submittedAt: "2026-03-14",
    scoreTone: "good",
    codeLines: [
      {
        tokens: [
          { content: "const", tone: "keyword" },
          { content: " retries", tone: "variable" },
          { content: " = ", tone: "operator" },
          { content: "Infinity", tone: "number" },
        ],
      },
      {
        tokens: [{ content: "retry(request, retries)", tone: "function" }],
      },
    ],
  },
  {
    rank: "#17",
    score: "5.4",
    codePreview: 'fmt.Println("debug", user.Password)',
    language: "go",
    lineCount: 2,
    submittedAt: "2026-03-14",
    scoreTone: "good",
    codeLines: [
      {
        tokens: [
          { content: "fmt", tone: "variable" },
          { content: ".Println", tone: "function" },
          { content: "(", tone: "operator" },
          { content: '"debug"', tone: "string" },
          { content: ", user.Password", tone: "variable" },
          { content: ")", tone: "operator" },
        ],
      },
    ],
  },
  {
    rank: "#18",
    score: "5.7",
    codePreview: "chmod 777 -R /var/www",
    language: "bash",
    lineCount: 1,
    submittedAt: "2026-03-13",
    scoreTone: "good",
    codeLines: [
      {
        tokens: [
          { content: "chmod", tone: "function" },
          { content: " 777", tone: "number" },
          { content: " -R /var/www", tone: "operator" },
        ],
      },
    ],
  },
  {
    rank: "#19",
    score: "5.8",
    codePreview: 'const token = "hardcoded-prod-token"',
    language: "javascript",
    lineCount: 1,
    submittedAt: "2026-03-13",
    scoreTone: "good",
    codeLines: [
      {
        tokens: [
          { content: "const", tone: "keyword" },
          { content: " token", tone: "variable" },
          { content: " = ", tone: "operator" },
          { content: '"hardcoded-prod-token"', tone: "string" },
        ],
      },
    ],
  },
  {
    rank: "#20",
    score: "5.9",
    codePreview: "return users[0] // first user is admin",
    language: "ruby",
    lineCount: 3,
    submittedAt: "2026-03-12",
    scoreTone: "good",
    codeLines: [
      {
        tokens: [
          { content: "def", tone: "keyword" },
          { content: " current_admin", tone: "function" },
        ],
      },
      {
        tokens: [
          { content: "  users[0] # first user is admin", tone: "comment" },
        ],
      },
      {
        tokens: [{ content: "end", tone: "keyword" }],
      },
    ],
  },
];

export const leaderboardStats = {
  totalRoasts: 2847,
  weeklySubmissions: 412,
  averageScore: "4.2/10",
};
