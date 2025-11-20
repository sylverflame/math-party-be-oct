ALTER TABLE "scores" RENAME COLUMN "date" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" date DEFAULT now() NOT NULL;