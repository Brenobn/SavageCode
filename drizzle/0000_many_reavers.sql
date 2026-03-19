CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."analysis_tone" AS ENUM('critical', 'warning', 'good', 'muted');--> statement-breakpoint
CREATE TYPE "public"."code_language" AS ENUM('javascript', 'typescript', 'sql', 'java', 'python', 'bash', 'go', 'rust', 'csharp', 'cpp', 'php', 'ruby', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."diff_line_type" AS ENUM('context', 'removed', 'added');--> statement-breakpoint
CREATE TYPE "public"."roast_mode" AS ENUM('normal', 'maximum');--> statement-breakpoint
CREATE TYPE "public"."roast_verdict" AS ENUM('needs_serious_help', 'needs_work', 'decent', 'clean');--> statement-breakpoint
CREATE TYPE "public"."submission_visibility" AS ENUM('public', 'unlisted', 'private');--> statement-breakpoint
CREATE TABLE "analysis_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_result_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"tone" "analysis_tone" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analysis_findings_roast_result_id_position_uk" UNIQUE("roast_result_id","position")
);
--> statement-breakpoint
CREATE TABLE "roast_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"status" "analysis_status" DEFAULT 'pending' NOT NULL,
	"score" numeric(3, 1),
	"verdict" "roast_verdict",
	"roast_quote" text,
	"model" text,
	"error_message" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roast_results_submissionId_unique" UNIQUE("submission_id"),
	CONSTRAINT "roast_results_score_range_ck" CHECK ("roast_results"."score" >= 0 AND "roast_results"."score" <= 10),
	CONSTRAINT "roast_results_completed_fields_ck" CHECK ("roast_results"."status" <> 'completed' OR ("roast_results"."score" IS NOT NULL AND "roast_results"."verdict" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" "code_language" DEFAULT 'unknown' NOT NULL,
	"line_count" integer NOT NULL,
	"roast_mode" "roast_mode" DEFAULT 'normal' NOT NULL,
	"visibility" "submission_visibility" DEFAULT 'public' NOT NULL,
	"fingerprint" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggested_diff_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roast_result_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"line_type" "diff_line_type" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suggested_diff_lines_roast_result_id_position_uk" UNIQUE("roast_result_id","position")
);
--> statement-breakpoint
ALTER TABLE "analysis_findings" ADD CONSTRAINT "analysis_findings_roast_result_id_roast_results_id_fk" FOREIGN KEY ("roast_result_id") REFERENCES "public"."roast_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_results" ADD CONSTRAINT "roast_results_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggested_diff_lines" ADD CONSTRAINT "suggested_diff_lines_roast_result_id_roast_results_id_fk" FOREIGN KEY ("roast_result_id") REFERENCES "public"."roast_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roast_results_score_idx" ON "roast_results" USING btree ("score");--> statement-breakpoint
CREATE VIEW "public"."leaderboard_entries" AS (select "submissions"."id" as "submission_id", "roast_results"."id" as "roast_result_id", "roast_results"."score" as "score", "submissions"."language" as "language", "submissions"."line_count" as "line_count", substring("submissions"."code" from 1 for 120) as "code_preview", "roast_results"."created_at" as "created_at" from "roast_results" inner join "submissions" on "roast_results"."submission_id" = "submissions"."id" where ("roast_results"."status" = 'completed' and "submissions"."visibility" = 'public'));